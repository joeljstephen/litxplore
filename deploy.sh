#!/bin/bash
set -e

echo "🚀 LitXplore One-Command Deployment"
echo "==================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "Don't run as root. Use a regular user with sudo privileges."
   exit 1
fi

print_status "Starting simplified deployment..."

# Collect required information
echo ""
print_status "Please provide the following information:"
read -p "Enter your email for SSL certificates: " EMAIL
read -p "Enter your database URL: " DATABASE_URL
read -p "Enter your OpenAI API key: " OPENAI_API_KEY
read -p "Enter your Gemini API key: " GEMINI_API_KEY
read -p "Enter your Clerk secret key: " CLERK_SECRET_KEY

if [ -z "$EMAIL" ] || [ -z "$DATABASE_URL" ] || [ -z "$OPENAI_API_KEY" ] || [ -z "$GEMINI_API_KEY" ] || [ -z "$CLERK_SECRET_KEY" ]; then
    print_error "All fields are required!"
    exit 1
fi

print_status "Installing system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl apt-transport-https ca-certificates gnupg lsb-release ufw fail2ban

# Install Docker
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Configure firewall
print_status "Configuring firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Create simple environment file
print_status "Creating environment configuration..."
cat > backend/.env << EOL
# API Settings
API_V1_STR=/api/v1
PROJECT_NAME=LitXplore

# Deployment Settings
BEHIND_PROXY=true
PRODUCTION=true

# CORS Settings
CORS_ORIGINS=["https://litxplore.vercel.app"]
CORS_ALLOW_CREDENTIALS=true
CORS_ALLOW_METHODS=["GET","POST","PUT","DELETE","OPTIONS","PATCH"]
CORS_ALLOW_HEADERS=["*"]

# Database
DATABASE_URL=${DATABASE_URL}

# API Keys
OPENAI_API_KEY=${OPENAI_API_KEY}
GEMINI_API_KEY=${GEMINI_API_KEY}

# Clerk Authentication
CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
CLERK_ISSUER=https://warm-ram-79.clerk.accounts.dev
CLERK_FRONTEND_API=https://warm-ram-79.clerk.accounts.dev
CLERK_JWKS_URL=https://warm-ram-79.clerk.accounts.dev/.well-known/jwks.json
CLERK_PUBLISHABLE_KEY=pk_test_your-key
JWT_ALGORITHM=RS256

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=secure-redis-password

# Rate Limiting
RATE_LIMIT_PER_DAY=1000

# LangChain Settings
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
SIMILARITY_THRESHOLD=0.75
MAX_PAPERS=10
EOL

# Create simple Traefik config
print_status "Setting up Traefik..."
mkdir -p traefik/dynamic

cat > traefik/traefik.yml << EOL
global:
  checkNewVersion: false
  sendAnonymousUsage: false

api:
  dashboard: true

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entrypoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: ${EMAIL}
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: web
  file:
    directory: /etc/traefik/dynamic
    watch: true

log:
  level: INFO
EOL

cat > traefik/dynamic/cors.yml << EOL
http:
  middlewares:
    cors:
      headers:
        accessControlAllowOriginList:
          - "https://litxplore.vercel.app"
        accessControlAllowMethods:
          - "GET"
          - "POST" 
          - "PUT"
          - "DELETE"
          - "OPTIONS"
          - "PATCH"
        accessControlAllowHeaders:
          - "*"
        accessControlAllowCredentials: true
    
    security:
      headers:
        frameDeny: true
        contentTypeNosniff: true
        browserXssFilter: true
        forceSTSHeader: true
        stsSeconds: 31536000
EOL

# Create simple docker-compose
print_status "Creating Docker configuration..."
cat > docker-compose.yml << EOL
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik/traefik.yml:/etc/traefik/traefik.yml:ro
      - ./traefik/dynamic:/etc/traefik/dynamic:ro
      - traefik_letsencrypt:/letsencrypt
    networks:
      - web
    labels:
      - "traefik.enable=true"

  api:
    build: ./backend
    container_name: litxplore_api
    restart: unless-stopped
    env_file:
      - backend/.env
    volumes:
      - ./backend/uploads:/app/uploads
    networks:
      - web
      - internal
    depends_on:
      - redis
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=web"
      - "traefik.http.routers.api.rule=Host(\`api.litxplore.win\`)"
      - "traefik.http.routers.api.entrypoints=websecure"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
      - "traefik.http.routers.api.middlewares=cors,security"
      - "traefik.http.services.api.loadbalancer.server.port=8000"

  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - internal

volumes:
  traefik_letsencrypt:
  redis_data:

networks:
  web:
    external: true
  internal:
    external: false
EOL

# Create the web network
print_status "Creating Docker network..."
docker network create web 2>/dev/null || true

# Create uploads directory
mkdir -p backend/uploads

# Deploy the application
print_status "Deploying application..."
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose build
docker-compose up -d

# Wait for services
print_status "Waiting for services to start..."
sleep 30

# Test deployment
print_status "Testing deployment..."
if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
    print_status "✅ Backend is running!"
else
    print_warning "Backend may still be starting..."
fi

# Check SSL (may take a few minutes)
print_status "Checking HTTPS (may take a few minutes for SSL)..."
for i in {1..5}; do
    if curl -f -s https://api.litxplore.win/health > /dev/null 2>&1; then
        print_status "✅ HTTPS is working!"
        break
    else
        print_status "Waiting for SSL certificate... ($i/5)"
        sleep 30
    fi
done

echo ""
print_status "🎉 Deployment Complete!"
echo ""
print_status "Your API is available at: https://api.litxplore.win"
print_status "Traefik dashboard: http://$(curl -s ifconfig.me):8080"
echo ""
print_status "Update your frontend environment variables:"
echo "NEXT_PUBLIC_API_URL=https://api.litxplore.win"
echo "NEXT_PUBLIC_API_BASE_URL=https://api.litxplore.win/api/v1"
echo ""
print_status "Useful commands:"
echo "• View logs: docker-compose logs -f"
echo "• Restart: docker-compose restart"
echo "• Stop: docker-compose down"
echo ""
print_warning "Remember to secure the Traefik dashboard in production!"
