#!/bin/bash
set -e

# Setup environment vars for Docker
if [ "$DOCKER_ENV" = "true" ]; then
  echo "Running in Docker environment, adjusting configuration..."
  
  # Determine if we're running behind a proxy
  if [ "$PRODUCTION" = "true" ] || [ "$BEHIND_PROXY" = "true" ]; then
    echo "Running in production mode behind a proxy, disabling FastAPI CORS middleware"
    export BEHIND_PROXY="true"
    export PRODUCTION="true"
  else
    echo "Running in development mode, enabling FastAPI CORS middleware"
    export BEHIND_PROXY="false"
    export PRODUCTION="false"
  fi
  
  # Create .env file if it doesn't exist
  if [ ! -f .env ]; then
    echo "Creating .env file from environment variables"
    
    # Create basic .env from environment variables
    cat > .env << EOL
# API Settings
API_V1_STR=${API_V1_STR:-/api/v1}
PROJECT_NAME=${PROJECT_NAME:-LitXplore}

# Deployment Settings
BEHIND_PROXY=${BEHIND_PROXY:-"false"}
PRODUCTION=${PRODUCTION:-"false"}

# CORS Settings
CORS_ORIGINS=["http://localhost:3000", "https://litxplore.vercel.app"]
CORS_ALLOW_CREDENTIALS=true
CORS_ALLOW_METHODS=["GET","POST","PUT","DELETE","OPTIONS","PATCH"]
CORS_ALLOW_HEADERS=["*"]

# Database Settings (Neon PostgreSQL)
DATABASE_URL=${DATABASE_URL}
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_HOST=${POSTGRES_HOST}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
POSTGRES_DB=${POSTGRES_DB}

# Redis Settings
REDIS_HOST=redis
REDIS_PORT=${REDIS_PORT:-6379}
REDIS_PASSWORD=${REDIS_PASSWORD:-optional-password}

# API Keys
GEMINI_API_KEY=${GEMINI_API_KEY}
OPENAI_API_KEY=${OPENAI_API_KEY}

# Clerk Authentication Settings
CLERK_ISSUER=${CLERK_ISSUER:-https://warm-ram-79.clerk.accounts.dev}
CLERK_FRONTEND_API=${CLERK_FRONTEND_API:-https://warm-ram-79.clerk.accounts.dev}
CLERK_JWKS_URL=${CLERK_JWKS_URL:-https://warm-ram-79.clerk.accounts.dev/.well-known/jwks.json}
CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY}
JWT_ALGORITHM=${JWT_ALGORITHM:-RS256}

# Rate Limiting
RATE_LIMIT_PER_DAY=${RATE_LIMIT_PER_DAY:-100}

# LangChain Settings
CHUNK_SIZE=${CHUNK_SIZE:-1000}
CHUNK_OVERLAP=${CHUNK_OVERLAP:-200}
SIMILARITY_THRESHOLD=${SIMILARITY_THRESHOLD:-0.75}
MAX_PAPERS=${MAX_PAPERS:-10}
EOL
  else
    # If .env exists, update values as needed
    # Update database settings for Neon
    if [ -n "$DATABASE_URL" ]; then
      echo "Using Neon database URL from environment"
      sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=${DATABASE_URL}|g" .env && rm -f .env.bak
    fi
    
    # Ensure CORS settings include frontend URLs
    if ! grep -q "https://litxplore.vercel.app" .env; then
      echo "Adding https://litxplore.vercel.app to CORS_ORIGINS"
      sed -i.bak 's/CORS_ORIGINS=\[\([^]]*\)\]/CORS_ORIGINS=[\\1,"https:\/\/litxplore.vercel.app"]/g' .env && rm -f .env.bak
    fi

    if grep -q "litxplore.tech" .env; then
      echo "Removing legacy litxplore.tech entries from CORS_ORIGINS"
      sed -i.bak 's/,[[:space:]]*"https:\/\/litxplore\.tech"//g; s/,[[:space:]]*"https:\/\/www\.litxplore\.tech"//g' .env && rm -f .env.bak
    fi
    
    # Ensure Redis host is set correctly
    if ! grep -q "REDIS_HOST=redis" .env; then
      echo "Updating REDIS_HOST in .env to 'redis'"
      sed -i.bak 's/REDIS_HOST=.*/REDIS_HOST=redis/g' .env && rm -f .env.bak
    fi
  fi

  # Print out the settings we're using (omit sensitive values)
  echo "Current settings:"
  grep -v "_KEY\|PASSWORD" .env || echo "Could not read .env file"
fi

# For Neon database, we don't need to wait or create the database
# as it's managed externally
echo "Using Neon PostgreSQL database - skipping local database setup..."

# Test database connection if DATABASE_URL is available
if [ -n "$DATABASE_URL" ]; then
  echo "Testing database connection..."
  # We'll let Alembic handle the connection test
else
  echo "Warning: DATABASE_URL not set. Make sure to set it in your environment."
fi

# Apply database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the application
echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level info
