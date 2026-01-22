from typing import Dict, Optional, Tuple, Any
from datetime import datetime, timedelta
from fastapi import Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt as PyJWT
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError, PyJWTError
import httpx
import logging
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.user import User
from app.db.database import get_db
from app.utils.user_utils import get_or_create_user
from app.utils.error_utils import raise_unauthorized, raise_internal_error, ErrorCode

# Setup logging
logger = logging.getLogger(__name__)

# Use auto_error=False to handle missing credentials ourselves with proper 401 + WWW-Authenticate
security = HTTPBearer(auto_error=False)

# JWKS Cache with expiration
class JWKSCache:
    """Cache for JWKS with expiration time"""
    def __init__(self, ttl_seconds: int = 3600):
        self.jwks: Optional[Dict[str, Any]] = None
        self.last_updated: Optional[datetime] = None
        self.ttl = timedelta(seconds=ttl_seconds)
    
    def is_valid(self) -> bool:
        """Check if cached JWKS is still valid"""
        if not self.jwks or not self.last_updated:
            return False
        return datetime.utcnow() - self.last_updated < self.ttl
    
    def update(self, jwks: Dict[str, Any]) -> None:
        """Update the cache with new JWKS"""
        self.jwks = jwks
        self.last_updated = datetime.utcnow()
    
    def get(self) -> Optional[Dict[str, Any]]:
        """Get the cached JWKS if valid"""
        if self.is_valid():
            return self.jwks
        return None

# Initialize the JWKS cache
jwks_cache = JWKSCache()

async def fetch_jwks_from_clerk() -> Dict[str, Any]:
    """Fetch JWKS from Clerk using async HTTP client"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(settings.CLERK_JWKS_URL)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"Failed to fetch JWKS: {str(e)}")
        raise_internal_error(
            message="Authentication service unavailable",
            error_code=ErrorCode.EXTERNAL_SERVICE_ERROR
        )


async def get_jwks(force_refresh: bool = False) -> Dict[str, Any]:
    """Get JWKS from cache or fetch from Clerk if not cached or expired"""
    if not force_refresh:
        cached_jwks = jwks_cache.get()
        if cached_jwks:
            logger.debug("Using cached JWKS")
            return cached_jwks
    
    logger.debug("Fetching fresh JWKS from Clerk")
    jwks = await fetch_jwks_from_clerk()
    jwks_cache.update(jwks)
    return jwks


def find_key_in_jwks(jwks: Dict[str, Any], kid: str) -> Optional[Any]:
    """Find a key in JWKS by key ID"""
    for jwk in jwks.get("keys", []):
        if jwk.get("kid") == kid:
            return PyJWT.algorithms.RSAAlgorithm.from_jwk(jwk)
    return None

def raise_auth_error(
    message: str, 
    error_code: str, 
    log_message: Optional[str] = None
) -> None:
    """
    Raise an authentication error with proper WWW-Authenticate header.
    Log detailed message server-side but return generic message to client.
    """
    from fastapi import HTTPException, status
    
    if log_message:
        logger.error(log_message)
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "status": "error",
            "error": {
                "code": error_code,
                "message": message,
                "status_code": 401
            }
        },
        headers={"WWW-Authenticate": "Bearer"}
    )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency that validates the Clerk JWT token and returns the current user.
    If the user doesn't exist in the database, it creates a new user record.
    
    Security features:
    - Proper WWW-Authenticate header on 401 responses
    - JWKS key rotation handling with automatic refresh
    - Authorized party (azp) verification for frontend origin
    - Generic error messages to clients, detailed logs server-side
    """
    # Check if credentials are provided
    if not credentials:
        raise_auth_error(
            message="Authentication required",
            error_code=ErrorCode.MISSING_TOKEN,
            log_message="No authentication credentials provided"
        )
    
    try:
        token = credentials.credentials
        
        # Get the key ID from the token header
        try:
            unverified_header = PyJWT.get_unverified_header(token)
            kid = unverified_header.get("kid")
            if not kid:
                raise_auth_error(
                    message="Invalid token",
                    error_code=ErrorCode.INVALID_TOKEN,
                    log_message="Token header missing 'kid' field"
                )
        except PyJWTError as header_error:
            raise_auth_error(
                message="Invalid token",
                error_code=ErrorCode.INVALID_TOKEN,
                log_message=f"Failed to parse token header: {str(header_error)}"
            )
        
        # Find the matching public key from JWKS with rotation handling
        key = await get_signing_key(kid)
        
        # Decode and verify the token
        try:
            decode_options = {
                "verify_signature": True,
                "verify_exp": True,
                "verify_nbf": True,
                "verify_iat": True,
                "verify_iss": True,
                "require_exp": True,
                "require_iat": True,
                "require_nbf": False,
                "verify_aud": False,  # We verify azp instead for Clerk tokens
            }
            
            payload = PyJWT.decode(
                token,
                key=key,
                algorithms=["RS256"],
                issuer=settings.CLERK_ISSUER,
                options=decode_options
            )
            
        except ExpiredSignatureError:
            raise_auth_error(
                message="Token has expired",
                error_code=ErrorCode.TOKEN_EXPIRED,
                log_message="Token expired"
            )
        except (InvalidTokenError, PyJWTError) as token_error:
            raise_auth_error(
                message="Invalid token",
                error_code=ErrorCode.INVALID_TOKEN,
                log_message=f"Token validation error: {str(token_error)}"
            )
        
        # Validate required claims and authorized party
        validate_token_claims(payload)
        
        # Extract user info from token
        clerk_id = payload.get("sub")
        if not clerk_id:
            raise_auth_error(
                message="Invalid token",
                error_code=ErrorCode.INVALID_TOKEN,
                log_message="Token payload missing 'sub' claim"
            )
        
        # Extract user data
        user_data = extract_user_data_from_token(payload)
        logger.debug(f"Authenticated user: clerk_id={clerk_id}")
        
        # Get or create user in database
        try:
            user = get_or_create_user(
                db=db,
                clerk_id=clerk_id,
                email=user_data["email"],
                first_name=user_data["first_name"],
                last_name=user_data["last_name"]
            )
            return user
        except Exception as user_error:
            logger.error(f"User processing error: {str(user_error)}")
            raise_internal_error(
                message="Authentication failed",
                error_code=ErrorCode.INTERNAL_ERROR
            )
        
    except Exception as e:
        if hasattr(e, "status_code"):
            raise
        logger.error(f"Unexpected authentication error: {str(e)}")
        raise_auth_error(
            message="Authentication failed",
            error_code=ErrorCode.INTERNAL_ERROR,
            log_message=f"Unexpected error: {str(e)}"
        )


async def get_signing_key(kid: str) -> Any:
    """
    Get the signing key for a given key ID.
    Handles key rotation by retrying with a fresh JWKS fetch if key not found.
    """
    # First, try with cached JWKS
    jwks = await get_jwks(force_refresh=False)
    key = find_key_in_jwks(jwks, kid)
    
    if key:
        return key
    
    # Key not found - could be key rotation, try fetching fresh JWKS
    logger.info(f"Key {kid} not found in cached JWKS, fetching fresh JWKS")
    jwks = await get_jwks(force_refresh=True)
    key = find_key_in_jwks(jwks, kid)
    
    if not key:
        raise_auth_error(
            message="Invalid token",
            error_code=ErrorCode.JWKS_ERROR,
            log_message=f"Key with kid={kid} not found in JWKS after refresh"
        )
    
    return key

def validate_token_claims(payload: Dict[str, Any]) -> None:
    """
    Validate that the token contains required claims and authorized party.
    
    Security checks:
    - Required claims: sub, exp, iat
    - Authorized party (azp): Validates the token was issued for our frontend
    
    Args:
        payload: The decoded JWT payload
        
    Raises:
        HTTPException: If validation fails
    """
    required_claims = ["sub", "exp", "iat"]
    missing_claims = [claim for claim in required_claims if claim not in payload]
    
    if missing_claims:
        raise_auth_error(
            message="Invalid token",
            error_code=ErrorCode.INVALID_TOKEN,
            log_message=f"Token missing required claims: {missing_claims}"
        )
    
    # Verify authorized party (azp) if configured
    # This ensures the token was issued for our specific frontend application
    if settings.CLERK_AUTHORIZED_PARTIES:
        azp = payload.get("azp")
        if azp and azp not in settings.CLERK_AUTHORIZED_PARTIES:
            raise_auth_error(
                message="Invalid token",
                error_code=ErrorCode.INVALID_TOKEN,
                log_message=f"Token azp '{azp}' not in authorized parties"
            )


def extract_user_data_from_token(payload: Dict[str, Any]) -> Dict[str, str]:
    """
    Extract user data from token payload.
    
    Args:
        payload: The decoded JWT payload
        
    Returns:
        Dictionary containing user data
    """
    email = payload.get("email", "")
    clerk_id = payload.get("sub")
    
    # If email is empty, use clerk_id + placeholder domain to ensure uniqueness
    if not email:
        email = f"{clerk_id}@litxplore.generated"
        logger.debug(f"Generated email for user: {email}")
    
    # Extract name information - handle different formats from Clerk
    first_name = payload.get("given_name", "")  # OpenID standard
    if not first_name:
        first_name = payload.get("firstName", "")  # Clerk specific
    
    last_name = payload.get("family_name", "")  # OpenID standard
    if not last_name:
        last_name = payload.get("lastName", "")  # Clerk specific
    
    return {
        "email": email,
        "first_name": first_name,
        "last_name": last_name
    }