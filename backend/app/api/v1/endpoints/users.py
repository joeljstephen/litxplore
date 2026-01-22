from typing import Dict, Any
import json
import logging
from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session
from svix.webhooks import Webhook, WebhookVerificationError
from app.db.database import get_db
from app.models.user import User
from app.utils.user_utils import get_or_create_user
from app.utils.error_utils import raise_unauthorized, raise_internal_error, raise_validation_error, ErrorCode
from app.core.auth import get_current_user
from app.core.config import get_settings

router = APIRouter()
logger = logging.getLogger(__name__)
settings = get_settings()


async def verify_clerk_webhook(
    request: Request,
    svix_id: str = Header(None, alias="svix-id"),
    svix_timestamp: str = Header(None, alias="svix-timestamp"),
    svix_signature: str = Header(None, alias="svix-signature"),
) -> Dict[str, Any]:
    """
    Verify the Clerk webhook signature using Svix library.
    Returns the verified payload if signature is valid.
    
    SECURITY: This endpoint MUST verify webhook signatures in production.
    Without verification, attackers could create/update users arbitrarily.
    """
    if not all([svix_id, svix_timestamp, svix_signature]):
        raise_unauthorized(
            message="Missing webhook signature headers",
            error_code=ErrorCode.UNAUTHORIZED
        )
    
    # SECURITY: Webhook secret is REQUIRED in production
    # Without it, anyone can forge webhook payloads and create users
    if not settings.CLERK_WEBHOOK_SECRET:
        if settings.PRODUCTION or settings.ENV == "production":
            logger.error("CLERK_WEBHOOK_SECRET not configured in production - rejecting webhook")
            raise_internal_error(
                message="Webhook configuration error",
                error_code=ErrorCode.INTERNAL_ERROR
            )
        else:
            # Development only: allow unverified webhooks with a warning
            logger.warning("CLERK_WEBHOOK_SECRET not configured - DEVELOPMENT MODE: webhook verification disabled")
            body = await request.body()
            try:
                return json.loads(body)
            except json.JSONDecodeError:
                raise_validation_error(
                    message="Invalid JSON payload",
                    error_code=ErrorCode.VALIDATION_ERROR
                )
    
    # Get the raw request body for signature verification
    body = await request.body()
    
    headers = {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
    }
    
    try:
        wh = Webhook(settings.CLERK_WEBHOOK_SECRET)
        verified_payload = wh.verify(body, headers)
        return verified_payload
    except WebhookVerificationError as e:
        logger.warning(f"Webhook signature verification failed: {e}")
        raise_unauthorized(
            message="Invalid webhook signature",
            error_code=ErrorCode.UNAUTHORIZED
        )
    except Exception as e:
        logger.error(f"Webhook verification error: {e}")
        raise_internal_error(
            message="Webhook verification failed",
            error_code=ErrorCode.INTERNAL_ERROR
        )


@router.post("/webhook/clerk")
async def clerk_webhook(
    verified_payload: Dict[str, Any] = Depends(verify_clerk_webhook),
    db: Session = Depends(get_db),
):
    """
    Handle Clerk webhook events for user synchronization.
    The payload is verified using Svix signature verification.
    """
    try:
        event_type = verified_payload.get("type")
        data = verified_payload.get("data", {})
        
        if event_type in ["user.created", "user.updated"]:
            user = get_or_create_user(
                db=db,
                clerk_id=data["id"],
                email=data.get("email_addresses", [{}])[0].get("email_address", ""),
                first_name=data.get("first_name", ""),
                last_name=data.get("last_name", "")
            )
            return {"status": "success", "user_id": user.id}
            
        return {"status": "ignored", "event": event_type}
        
    except Exception as e:
        raise_internal_error(
            message=str(e),
            error_code=ErrorCode.INTERNAL_ERROR
        )

@router.get("/me", operation_id="getCurrentUser")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get the current user's information
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }