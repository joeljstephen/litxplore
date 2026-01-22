from fastapi import FastAPI, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import asyncio
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from app.api.v1.endpoints import review, papers, documents, history, users, tasks, analysis, chat  # Change from relative to absolute import
from .core.config import get_settings
from app.db.database import engine, Base, get_db
from sqlalchemy.orm import Session

settings = get_settings()

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Setup CORS with production-appropriate settings
# Only add CORS middleware when not behind a reverse proxy that handles CORS
if not settings.BEHIND_PROXY:
    print("Adding CORS middleware (not running behind proxy)")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],  # Allow all headers for preflight compatibility
        expose_headers=["Content-Disposition"],
    )
else:
    print("Skipping CORS middleware (running behind proxy that handles CORS)")

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

# Mount the uploads directory
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Security headers middleware - adds recommended security headers to all responses
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # XSS protection (for older browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Content Security Policy for API responses
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
        
        # HTTPS enforcement (only in production)
        if settings.PRODUCTION:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response


# Define background task middleware for PDF cleanup
class BackgroundTaskMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Process the request and get response
        response = await call_next(request)
        
        # Check if there are any background tasks registered
        if hasattr(request.state, 'background_tasks') and request.state.background_tasks:
            # Process background tasks after sending response
            asyncio.create_task(self._process_background_tasks(request.state.background_tasks))
            
        return response
    
    async def _process_background_tasks(self, tasks):
        for task in tasks:
            try:
                if task['task'] == 'cleanup_pdfs':
                    # Import here to avoid circular imports
                    from app.api.v1.endpoints.review import cleanup_uploaded_pdfs
                    await cleanup_uploaded_pdfs(task['paper_ids'])
                    logging.info(f"Background task: cleaned up {len(task['paper_ids'])} PDFs")
            except Exception as e:
                logging.error(f"Error processing background task: {str(e)}")

# Setup rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Add background task middleware - this must be added AFTER the SlowAPIMiddleware
app.add_middleware(BackgroundTaskMiddleware)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Include routers
app.include_router(
    review.router,
    prefix=f"{settings.API_V1_STR}/review",
    tags=["review"]
)

# Add papers router
app.include_router(
    papers.router,
    prefix=f"{settings.API_V1_STR}/papers",
    tags=["papers"]
)

# Add documents router
app.include_router(
    documents.router, 
    prefix=f"{settings.API_V1_STR}/documents",
    tags=["documents"]
)

# Add users router
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])

# Add tasks router
app.include_router(tasks.router, prefix=f"{settings.API_V1_STR}/tasks", tags=["tasks"])

# Fix the history router path
app.include_router(history.router, prefix=f"{settings.API_V1_STR}", tags=["history"])

# Add analysis router
app.include_router(
    analysis.router,
    prefix=f"{settings.API_V1_STR}/analysis",
    tags=["analysis"]
)

# Add chat router
app.include_router(
    chat.router,
    prefix=f"{settings.API_V1_STR}/papers",
    tags=["chat"]
)

# Health check endpoints
@app.get("/health")
@app.get(f"{settings.API_V1_STR}/healthcheck")
def health_check():
    return {"status": "healthy", "service": "LitXplore API"}

# Database test endpoint - ONLY available in non-production environments
# This endpoint can leak sensitive information and should never be exposed in production
if not settings.PRODUCTION and settings.ENV != "production":
    @app.get("/db-test")
    @app.get(f"{settings.API_V1_STR}/db-test")
    def test_db(db: Session = Depends(get_db)):
        try:
            from sqlalchemy import text
            db.execute(text("SELECT 1"))
            return {"status": "Database connection successful"}
        except Exception as e:
            return {"status": "Database connection failed", "error": str(e)}

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    pass

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup services on shutdown."""
    pass

# Add host and port settings
HOST = "0.0.0.0"  # Allow connections from any IP
PORT = int(os.getenv("PORT", 8000))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=HOST,
        port=PORT,
        reload=True
    )