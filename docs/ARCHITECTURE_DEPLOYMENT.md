# LitXplore - Deployment Architecture

**Version:** 2.0  
**Last Updated:** March 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Infrastructure Components](#infrastructure-components)
3. [Deployment Environments](#deployment-environments)
4. [Frontend Deployment](#frontend-deployment)
5. [Backend Deployment](#backend-deployment)
6. [Database Infrastructure](#database-infrastructure)
7. [Caching Infrastructure](#caching-infrastructure)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Monitoring & Logging](#monitoring--logging)
10. [Security & Compliance](#security--compliance)
11. [Scaling Strategy](#scaling-strategy)
12. [Disaster Recovery](#disaster-recovery)

---

## Overview

LitXplore uses a split deployment architecture: the frontend is hosted on **Vercel**, while the backend runs on a **VPS** with Docker, Traefik reverse proxy, and Watchtower for auto-updates.

### Deployment Philosophy

- **Simple VPS Deployment**: One-command `deploy.sh` for backend setup
- **Container-Based**: Docker + Docker Compose for reproducible deployments
- **Auto-Updates**: Watchtower watches GHCR for new images and auto-deploys
- **Continuous Deployment**: GitHub Actions builds and pushes on merge to `main`
- **TLS Automation**: Traefik handles Let's Encrypt certificates automatically

---

## Infrastructure Components

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        INTERNET                           │
└───────────┬──────────────────────────────┬───────────────┘
            │                              │
            │ HTTPS                        │ HTTPS
            │                              │
┌───────────▼──────────┐    ┌──────────────▼──────────────┐
│   Frontend (Vercel)  │    │   VPS (api.litxplore.win)   │
│                      │    │                              │
│   Next.js 15         │    │   ┌─────────────────────┐   │
│   Standalone SSR     │    │   │ Traefik v3.1        │   │
│   Edge CDN           │    │   │ - TLS (ACME)        │   │
│                      │    │   │ - Rate Limiting      │   │
└──────────────────────┘    │   │ - CORS               │   │
                            │   └──────────┬──────────┘   │
                            │              │               │
                            │   ┌──────────▼──────────┐   │
                            │   │ FastAPI (Docker)     │   │
                            │   │ python:3.12-slim     │   │
                            │   └──────────┬──────────┘   │
                            │              │               │
                            │   ┌──────────▼──────────┐   │
                            │   │ Redis 7 (Docker)     │   │
                            │   └─────────────────────┘   │
                            │                              │
                            │   Watchtower (auto-updates)  │
                            └──────────────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────┐
                    │                      │              │
           ┌────────▼──────┐    ┌──────────▼──┐   ┌──────▼──────┐
           │  PostgreSQL   │    │  AI APIs     │   │  Clerk      │
           │  (Neon)       │    │  - Gemini    │   │  Auth       │
           │  Serverless   │    │  - OpenAI    │   │             │
           └───────────────┘    │  - arXiv     │   └─────────────┘
                                └──────────────┘
```

### Component Responsibilities

| Component       | Technology        | Purpose             | Provider       |
| --------------- | ----------------- | ------------------- | -------------- |
| **Frontend**    | Next.js 15        | UI/UX, Client Logic | Vercel         |
| **Reverse Proxy** | Traefik v3.1   | TLS, Rate Limiting  | VPS (Docker)   |
| **Backend**     | FastAPI           | API, Business Logic | VPS (Docker)   |
| **Database**    | PostgreSQL        | Data Persistence    | Neon           |
| **Cache**       | Redis 7           | Analysis Caching    | VPS (Docker)   |
| **Auth**        | Clerk             | User Authentication | Clerk          |
| **AI/ML**       | Gemini + OpenAI   | Analysis & Chat     | Google/OpenAI  |
| **Auto-Deploy** | Watchtower        | Container Updates   | VPS (Docker)   |
| **CI/CD**       | GitHub Actions    | Build & Push        | GitHub         |
| **Registry**    | GHCR              | Container Images    | GitHub         |

---

## Deployment Environments

### Environment Strategy

```
Development → Staging → Production
   (local)   (preview)  (main branch)
```

### Environment Configuration

#### 1. Development

**Purpose**: Local development and testing

**Infrastructure**:

- Frontend: `localhost:3000`
- Backend: `localhost:8000`
- Database: Local PostgreSQL or Neon dev branch
- Redis: Local Redis or Upstash dev

**Configuration**:

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_ENV=development

# Backend (.env)
DATABASE_URL=postgresql://localhost/litxplore_dev
REDIS_HOST=localhost
REDIS_PORT=6379
GEMINI_API_KEY=xxx
OPENAI_API_KEY=xxx
PRODUCTION=false
ENV=dev
```

#### 2. Production

**Purpose**: Live user-facing application

**Infrastructure**:

- Frontend: Vercel (auto-deployed from `main`)
- Backend: VPS with Docker + Traefik (auto-deployed via Watchtower)
- Database: Neon production
- Redis: Self-hosted in Docker on VPS

**Configuration**:

```bash
# Frontend (Vercel)
NEXT_PUBLIC_API_URL=https://api.litxplore.win
NEXT_PUBLIC_API_BASE_URL=https://api.litxplore.win/api/v1

# Backend (.env on VPS)
DATABASE_URL=postgresql://...@neon.tech/litxplore?sslmode=require
PRODUCTION=true
ENV=prod
BEHIND_PROXY=true
```

---

## Frontend Deployment

### Vercel Deployment

**Platform**: Vercel (optimized for Next.js)

**Deployment Trigger**:

- **Production**: Push to `main` branch
- **Preview**: Pull requests and other branches

**Environment Variables** (Vercel Dashboard):

```bash
NEXT_PUBLIC_API_URL=https://api.litxplore.win
NEXT_PUBLIC_API_BASE_URL=https://api.litxplore.win/api/v1
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
```

**Build**: `npm install` → `npm run build` (standalone output)

**Features**:

- Global edge CDN for static assets
- Automatic image optimization
- Route-based code splitting
- Preview deployments on PRs

---

## Backend Deployment

### Docker Setup

**Dockerfile** (`backend/Dockerfile`):

- Multi-stage build: builder + final
- Base image: `python:3.12-slim`
- Installs PyTorch (CPU) and all requirements in a virtual environment
- Runs as non-root user `appuser` (uid 1000)
- Entrypoint: `docker-entrypoint.sh` (runs Alembic migrations, then starts Uvicorn)

**docker-compose.yml** (Development):

```yaml
services:
  api:
    build: .
    container_name: litxplore_backend_dev
    ports: ["8000:8000"]
    env_file: .env
    environment:
      DOCKER_ENV: "true"
      BEHIND_PROXY: "false"
      PRODUCTION: "false"
      REDIS_HOST: redis
      UPLOAD_DIR: /app/uploads
    depends_on: [redis]
    volumes:
      - ./uploads:/app/uploads
      - ./app:/app/app     # Hot reload in dev
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  redis:
    image: redis:7-alpine
    container_name: litxplore_redis_dev
    ports: ["6380:6379"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
```

### Production Setup (VPS + Traefik)

**Root `docker-compose.override.yml`** adds:

- **Traefik v3.1** — Reverse proxy with automatic TLS (Let's Encrypt ACME)
  - HTTP → HTTPS redirect
  - Trusted IPs for Cloudflare
  - Rate limiting via middleware:
    - General: 100 req/min, burst 50
    - Auth routes: 10 req/min, burst 5
    - Upload/review routes: 5 req/min, burst 2

- **Watchtower** — Monitors GHCR for new images, auto-pulls and restarts (`--interval 300`, `--rolling-restart`)

### Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@host/db
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=xxx
GEMINI_API_KEY=xxx
OPENAI_API_KEY=xxx
CLERK_SECRET_KEY=sk_live_xxx
CLERK_JWKS_URL=https://clerk.app/.well-known/jwks.json
PRODUCTION=true
ENV=prod
BEHIND_PROXY=true
CORS_ORIGINS=["https://litxplore.vercel.app"]
```

### Health Checks

- `GET /health` — Basic health check
- `GET /api/v1/healthcheck` — Detailed health check
- `GET /db-test` — Database connection test (non-production only)

---

## Database Infrastructure

### Neon PostgreSQL

**Features**:

- **Serverless**: Auto-scaling compute
- **Branching**: Git-like database branches
- **Instant Provisioning**: New databases in seconds
- **Connection Pooling**: Built-in Pgbouncer

**Connection String**:

```
postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/litxplore?sslmode=require
```

**Branching Strategy**:

```
main (production)
  ├── staging
  └── dev-{feature-name}
```

**Connection Pooling**:

```python
# Backend configuration
engine = create_engine(
    DATABASE_URL,
    pool_size=5,           # Base connections
    max_overflow=10,       # Additional connections
    pool_pre_ping=True,    # Verify before use
    pool_recycle=1800      # Recycle after 30 min
)
```

### Migration Management

**Development**:

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply locally
alembic upgrade head
```

**Production**:

```bash
# Automated in deployment pipeline
alembic upgrade head
```

### Backup Strategy

**Automated Backups**:

- Neon: Daily automated backups (7-day retention)
- Point-in-time recovery available

**Manual Backups**:

```bash
# Export database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore database
psql $DATABASE_URL < backup.sql
```

---

## Caching Infrastructure

### Redis Deployment

Redis runs as a **self-hosted Docker container** alongside the backend:

```yaml
redis:
  image: redis:7-alpine
  volumes:
    - redis_data:/data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
```

### Cache Configuration

**TTL Settings**:

- Development: 3600s (1 hour)
- Production: 86400s (24 hours)

**Cache Keys**:

```python
f"analysis:{paper_id}:v{PROMPT_VERSION}:{ENV}"
f"in_depth:{paper_id}:v{PROMPT_VERSION}:{ENV}"
```

Version-based keys ensure stale data is automatically invalidated when prompts change.

---

## CI/CD Pipeline

### GitHub Actions Workflow

**Frontend**: Deployed automatically by Vercel on push to `main` (no custom workflow needed).

**Backend** (`.github/workflows/deploy-backend.yml`):

```yaml
name: Build and Deploy Backend

on:
  push:
    branches: [main]
    paths: ["backend/**"]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Set up Docker Buildx
      - Login to ghcr.io
      - Docker metadata (tags: branch, sha, latest)
      - Build and push to ghcr.io/{owner}/litxplore-backend
        - Platform: linux/amd64
        - GitHub Actions cache
```

**Auto-deployment flow**:

1. Developer pushes to `main` (backend changes)
2. GitHub Actions builds Docker image → pushes to GHCR
3. Watchtower on VPS detects new image within ~5 minutes
4. Watchtower pulls new image and does rolling restart

### Deployment Flow

1. **Merge PR to `main`**
2. **Backend**: GitHub Actions builds image → GHCR → Watchtower auto-deploys within ~5 min
3. **Frontend**: Vercel auto-deploys from `main` branch
4. **Migrations**: `docker-entrypoint.sh` runs `alembic upgrade head` on container start
5. **Verify**: Check `https://api.litxplore.win/health`

---

## Monitoring & Logging

### Error Tracking

**Sentry Integration**:

```python
# Backend
import sentry_sdk

sentry_sdk.init(
    dsn="https://xxx@sentry.io/xxx",
    environment=settings.ENV,
    traces_sample_rate=0.1
)
```

```typescript
// Frontend
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://xxx@sentry.io/xxx",
  environment: process.env.NEXT_PUBLIC_ENV,
  tracesSampleRate: 0.1,
});
```

### Application Logs

**Backend Logging**:

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

logger.info("Paper analyzed", extra={"paper_id": paper_id})
logger.error("Analysis failed", exc_info=True)
```

**Log Aggregation**:

- CloudWatch (AWS)
- Cloud Logging (GCP)
- Papertrail
- Logtail

### Performance Monitoring

**Metrics to Track**:

1. **Response Times**:

   - API endpoint latency
   - Database query times
   - AI API response times

2. **Error Rates**:

   - 4xx errors (client errors)
   - 5xx errors (server errors)
   - AI API failures

3. **Resource Usage**:

   - CPU utilization
   - Memory usage
   - Database connections
   - Cache hit rate

4. **Business Metrics**:
   - Papers analyzed per day
   - Reviews generated per day
   - Active users
   - API rate limit hits

### Alerting

**Alert Conditions**:

```yaml
alerts:
  - name: High Error Rate
    condition: error_rate > 5%
    duration: 5 minutes
    severity: critical

  - name: Slow Response Time
    condition: p95_latency > 5000ms
    duration: 10 minutes
    severity: warning

  - name: Database Connection Pool Exhausted
    condition: db_connections > 90%
    duration: 2 minutes
    severity: critical
```

---

## Security & Compliance

### SSL/TLS

**Frontend**: Automatic HTTPS via Vercel (TLS 1.3, HSTS).

**Backend**: Traefik handles TLS termination with Let's Encrypt ACME (auto-renewal). HTTP automatically redirected to HTTPS.

### API Security

**Rate Limiting** (Traefik middleware in production):

- General: 100 req/min, burst 50
- Auth routes: 10 req/min, burst 5
- Upload/review routes: 5 req/min, burst 2
- SlowAPI middleware as fallback in development

**Security Headers** (FastAPI middleware):

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (production)
- `Content-Security-Policy: default-src 'none'`

**CORS**: Handled by Traefik dynamic config in production; FastAPI CORSMiddleware in development.

**Authentication**: JWT tokens via Clerk, verified with JWKS on every protected request.

**Firewall**: `deploy.sh` configures UFW (SSH, 80, 443 only) and fail2ban.

### Data Security

- Database connections over SSL (`sslmode=require`)
- All external API calls over HTTPS
- PDF uploads scanned for malicious content (17 security markers)
- Uploaded files auto-cleaned after configurable max age

---

## Scaling Strategy

### Current Architecture

**Frontend (Vercel)**: Automatic edge scaling, global CDN distribution.

**Backend (Single VPS)**:

- Single Docker container with Traefik load balancing
- Rate limiting prevents abuse (100 req/min general, 10 req/min auth, 5 req/min uploads)
- Redis caching reduces redundant AI API calls by 60-70%
- Connection pooling for database (pool_size=5, max_overflow=10)

### Future Scaling Options

- **Horizontal**: Add more VPS instances behind a load balancer
- **Database**: Neon auto-scales compute; increase connection pool as needed
- **Cache**: Redis can be moved to a managed service (Upstash, Redis Cloud) for higher availability

---

## Disaster Recovery

### Backup Strategy

**Automated**:

- Database: Daily snapshots (Neon)
- Code: Git repository
- Configuration: Infrastructure as Code

**Manual**:

- Pre-deployment database backup
- Critical data export weekly

### Recovery Procedures

**Database Failure**:

1. Identify failure point
2. Restore from latest backup
3. Apply any missing transactions
4. Verify data integrity
5. Resume operations

**Backend Failure**:

1. Check health endpoints
2. Review logs and errors
3. Rollback to previous version if needed
4. Scale up healthy instances
5. Fix and redeploy

**Frontend Failure**:

1. Vercel automatic failover
2. Rollback via Vercel dashboard
3. Deploy previous version
4. Monitor error rates

### Business Continuity

**RTO (Recovery Time Objective)**: 1 hour  
**RPO (Recovery Point Objective)**: 24 hours

**Failover Plan**:

1. Automated health checks
2. Automatic failover to backup
3. Alert on-call engineer
4. Manual intervention if needed
5. Post-mortem analysis

---

## Cost Optimization

### Current Cost Structure

| Component | Cost | Notes |
| --- | --- | --- |
| Frontend (Vercel) | Free–$20/mo | Free tier sufficient for moderate traffic |
| Backend (VPS) | ~$5–25/mo | Single VPS with Docker |
| Database (Neon) | Free–$19/mo | Serverless PostgreSQL |
| Redis | $0 | Self-hosted in Docker on VPS |
| AI APIs | ~$50–200/mo | Gemini (analysis/chat) + OpenAI (embeddings) |
| Domain | ~$10/yr | `litxplore.win` |

### Optimization Strategies

1. **Redis caching**: Reduces AI API calls by 60-70%
2. **Fast models**: `gemini-2.0-flash-lite` for At-a-Glance (cheaper, faster)
3. **Lazy loading**: In-Depth analysis only computed on demand
4. **Upload cleanup**: Automatic deletion of old PDFs to save disk space
5. **Standalone output**: Minimal Next.js build reduces Vercel bandwidth

---

**End of Deployment Architecture Document**
