from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional, List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str
    PROJECT_NAME: str
    
    # Deployment Settings
    BEHIND_PROXY: bool = False
    PRODUCTION: bool = False
    
    # CORS Settings
    CORS_ORIGINS: List[str]
    CORS_ALLOW_CREDENTIALS: bool
    CORS_ALLOW_METHODS: List[str]
    CORS_ALLOW_HEADERS: List[str]
    
    # Database Settings
    DATABASE_URL: Optional[str] = None  # For Neon or other external PostgreSQL
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_HOST: Optional[str] = None
    POSTGRES_PORT: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    
    # API Keys
    GEMINI_API_KEY: str
    OPENAI_API_KEY: Optional[str] = None  # Deprecated: No longer used, kept for backward compatibility

    # Redis Settings
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: str
    
    # Rate Limiting
    RATE_LIMIT_PER_DAY: int
    
    # LangChain Settings
    CHUNK_SIZE: int
    CHUNK_OVERLAP: int
    SIMILARITY_THRESHOLD: float
    MAX_PAPERS: int
    
    # Analyzer Settings
    ANALYZER_MODEL_TAG: str = "gemini-2.0-flash"
    ANALYZER_FAST_MODEL_TAG: str = "gemini-2.0-flash-lite"  # Fast model for At-a-Glance
    PROMPT_VERSION: str = "1.0.0"
    ENV: str = "dev"

    # Clerk Settings
    CLERK_ISSUER: str
    CLERK_FRONTEND_API: str
    # CLERK_AUDIENCE: List[str]
    CLERK_SECRET_KEY: str
    CLERK_PUBLISHABLE_KEY: str
    CLERK_JWKS_URL: str
    JWT_ALGORITHM: str
    CLERK_WEBHOOK_SECRET: Optional[str] = None  # For webhook signature verification
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        env_file_encoding = "utf-8"
        extra = "ignore"  # Allow extra attributes


@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()