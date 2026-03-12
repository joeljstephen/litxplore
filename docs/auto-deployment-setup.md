# Auto-Deployment Setup for LitXplore Backend

## Overview

This document describes the automatic deployment setup for the LitXplore backend using GitHub Actions and Watchtower.

## How It Works

1. **GitHub Actions**: When code is pushed to the `main` branch (specifically changes in the `backend/` directory), a GitHub workflow automatically builds and pushes a new Docker image to GitHub Container Registry (GHCR).

2. **Watchtower**: Running on your VPS, Watchtower monitors the Docker image for updates every 5 minutes and automatically pulls new versions and performs rolling restarts.

## Components

### GitHub Workflow (`.github/workflows/deploy-backend.yml`)

- **Trigger**: Pushes to `main` branch with changes in `backend/` directory
- **Actions**:
  - Builds Docker image using multi-stage build
  - Pushes to GitHub Container Registry (`ghcr.io/joeljstephen/litxplore-backend`)
  - Uses Docker layer caching for faster builds
  - Supports manual triggering via workflow_dispatch

### Docker Compose Configuration

- **Production**: `backend/docker-compose.prod.yml` now references the registry image instead of building locally
- **Watchtower**: Configured in `docker-compose.override.yml` with:
  - 5-minute polling interval
  - Rolling restart strategy
  - Label-based service selection

## Deployment Flow

```
Developer Push → GitHub Actions → Build Image → Push to GHCR → Watchtower Detects → Pull New Image → Rolling Restart
```

## Setup Instructions

### 1. First-Time Setup

1. **Enable GitHub Container Registry**:

   - Go to your GitHub repository settings
   - Navigate to "Actions" → "General"
   - Ensure "Read and write permissions" are enabled for GITHUB_TOKEN

2. **Deploy to VPS**:

   ```bash
   # On your VPS, pull the latest changes
   git pull origin main

   # Start the services (this will pull the initial image)
   docker-compose -f backend/docker-compose.prod.yml -f docker-compose.override.yml up -d
   ```

### 2. Verify Setup

1. **Check Watchtower logs**:

   ```bash
   docker logs watchtower
   ```

2. **Check backend service**:

   ```bash
   docker logs litxplore_backend
   ```

3. **Test deployment**:
   - Make a small change to the backend code
   - Push to `main` branch
   - Monitor GitHub Actions for successful build
   - Wait ~5 minutes for Watchtower to detect and deploy

## Monitoring

### GitHub Actions

- View build status in the "Actions" tab of your repository
- Each workflow run shows build logs and deployment status

### Watchtower Logs

```bash
# View Watchtower activity
docker logs -f watchtower

# Check for successful updates
docker logs watchtower | grep -i "updated"
```

### Backend Health

```bash
# Check if backend is running
curl -f http://localhost:8000/health

# Or via Traefik (external)
curl -f https://api.litxplore.win/health
```

## Troubleshooting

### Common Issues

1. **Build Failures**:

   - Check GitHub Actions logs
   - Verify Docker syntax in backend files
   - Ensure all dependencies are in requirements.txt

2. **Watchtower Not Updating**:

   - Check Watchtower logs for errors
   - Verify image name matches in docker-compose.prod.yml
   - Ensure container has the correct labels

3. **Service Not Starting**:
   - Check backend container logs
   - Verify environment variables in .env file
   - Check database connectivity

### Manual Deployment

If automatic deployment fails, you can manually deploy:

```bash
# Pull the latest image
docker pull ghcr.io/joeljstephen/litxplore-backend:latest

# Restart the service
docker-compose -f backend/docker-compose.prod.yml -f docker-compose.override.yml up -d api
```

## Security Notes

- GitHub Container Registry images are private by default
- GITHUB_TOKEN is automatically provided by GitHub Actions
- Watchtower only monitors containers with specific labels
- No sensitive data is exposed in the workflow files

## Configuration Files

- `.github/workflows/deploy-backend.yml` - GitHub Actions workflow
- `backend/docker-compose.prod.yml` - Production Docker Compose
- `docker-compose.override.yml` - Traefik and Watchtower configuration
