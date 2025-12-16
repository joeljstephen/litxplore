# LitXplore - Deployment Architecture

**Version:** 1.0  
**Last Updated:** November 2025

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

LitXplore uses a distributed, cloud-native architecture with separate deployments for frontend and backend services. The system is designed for scalability, reliability, and ease of maintenance.

### Deployment Philosophy

- **Serverless-First**: Leverage managed services when possible
- **Infrastructure as Code**: Configuration versioned in Git
- **Continuous Deployment**: Automated deployments on push
- **Environment Parity**: Development mirrors production
- **Observability**: Comprehensive monitoring and logging

---

## Infrastructure Components

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          INTERNET                                │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTPS
                 │
    ┌────────────▼─────────────┐
    │     CDN (Vercel Edge)    │
    │   - Static Assets        │
    │   - Edge Caching         │
    │   - DDoS Protection      │
    └────────────┬─────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐   ┌──────▼────────────────────────┐
│   Frontend   │   │       Backend API             │
│   (Vercel)   │   │   (Cloud Provider)            │
│              │   │                               │
│ Next.js 13+  │   │ FastAPI + Uvicorn             │
│ Static/SSR   │   │ Containerized (Docker)        │
└──────────────┘   └──────┬────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌──────▼──────┐
│  PostgreSQL  │  │    Redis     │  │  AI APIs    │
│    (Neon)    │  │  (Cloud/     │  │  - OpenAI   │
│              │  │   Upstash)   │  │  - Gemini   │
│ Serverless   │  │              │  │  - arXiv    │
│ Postgres     │  │  Caching     │  │             │
└──────────────┘  └──────────────┘  └─────────────┘
```

### Component Responsibilities

| Component      | Technology      | Purpose             | Provider       |
| -------------- | --------------- | ------------------- | -------------- |
| **Frontend**   | Next.js         | UI/UX, Client Logic | Vercel         |
| **Backend**    | FastAPI         | API, Business Logic | AWS/GCP/Render |
| **Database**   | PostgreSQL      | Data Persistence    | Neon           |
| **Cache**      | Redis           | Performance Cache   | Upstash/Cloud  |
| **Auth**       | Clerk           | User Authentication | Clerk          |
| **AI/ML**      | Gemini + OpenAI | Analysis & Chat     | Google/OpenAI  |
| **Storage**    | File System     | PDF Uploads         | Backend Host   |
| **Monitoring** | Sentry + Custom | Error Tracking      | Sentry         |

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

#### 2. Staging

**Purpose**: Pre-production testing and QA

**Infrastructure**:

- Frontend: Vercel preview deployment
- Backend: Staging server/container
- Database: Neon staging branch
- Redis: Dedicated staging instance

**Configuration**:

```bash
# Frontend
NEXT_PUBLIC_API_URL=https://api-staging.litxplore.com
NEXT_PUBLIC_ENV=staging

# Backend
DATABASE_URL=postgresql://neon-staging.../litxplore_staging
PRODUCTION=false
ENV=staging
```

#### 3. Production

**Purpose**: Live user-facing application

**Infrastructure**:

- Frontend: Vercel production (litxplore.com)
- Backend: Production server/container cluster
- Database: Neon production
- Redis: Production cluster

**Configuration**:

```bash
# Frontend
NEXT_PUBLIC_API_URL=https://api.litxplore.com
NEXT_PUBLIC_ENV=production

# Backend
DATABASE_URL=postgresql://neon-prod.../litxplore_prod
PRODUCTION=true
ENV=prod
```

---

## Frontend Deployment

### Vercel Deployment

**Platform**: Vercel (recommended for Next.js)

**Deployment Trigger**:

- **Production**: Push to `main` branch
- **Preview**: Pull requests and other branches

**Build Configuration**:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "framework": "nextjs"
}
```

**Environment Variables** (Vercel Dashboard):

```bash
# Public (exposed to browser)
NEXT_PUBLIC_API_URL=https://api.litxplore.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx

# Secret (server-side only)
CLERK_SECRET_KEY=sk_live_xxx
```

### Build Process

```bash
# 1. Install dependencies
npm install

# 2. Sync OpenAPI spec from backend
npm run sync:openapi

# 3. Generate API client
npm run generate:api

# 4. Build Next.js application
npm run build

# 5. Output: .next/ directory (standalone mode)
```

### Optimization Features

**Vercel Edge Features**:

- **Edge Network**: Global CDN for static assets
- **Image Optimization**: Automatic WebP/AVIF conversion
- **Edge Functions**: Middleware and API routes on the edge
- **Analytics**: Performance monitoring

**Next.js Optimizations**:

- **Static Generation**: Pre-render pages at build time
- **Incremental Static Regeneration**: Update static pages
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Remove unused code

### Custom Domain

```
litxplore.com → Vercel
  ├── www.litxplore.com (redirect)
  ├── app.litxplore.com (main app)
  └── *.vercel.app (preview deployments)
```

**DNS Configuration**:

```
A     @              76.76.21.21
CNAME www            cname.vercel-dns.com
CNAME app            cname.vercel-dns.com
```

---

## Backend Deployment

### Deployment Options

#### Option 1: Docker Container (Recommended)

**Dockerfile**:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY ./app ./app
COPY alembic.ini .
COPY alembic ./alembic

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD alembic upgrade head && \
    uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**docker-compose.yml** (Development):

```yaml
version: "3.8"

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: litxplore_backend
    ports:
      - "8000:8000"
    env_file:
      - .env
    environment:
      - DOCKER_ENV=true
      - REDIS_HOST=redis
    depends_on:
      - redis
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
    networks:
      - litxplore-network

  redis:
    image: redis:7-alpine
    container_name: litxplore_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - litxplore-network

volumes:
  redis_data:

networks:
  litxplore-network:
    driver: bridge
```

#### Option 2: Platform as a Service

**Render.com**:

```yaml
# render.yaml
services:
  - type: web
    name: litxplore-api
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: REDIS_HOST
        sync: false
      - key: GEMINI_API_KEY
        sync: false
```

**Heroku**:

```yaml
# Procfile
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
release: alembic upgrade head
```

#### Option 3: Cloud Provider (AWS/GCP)

**AWS Elastic Beanstalk**:

- Docker container deployment
- Auto-scaling based on load
- Load balancer integration

**Google Cloud Run**:

- Serverless container platform
- Automatic scaling to zero
- Pay per request

### Environment Variables

**Required Variables**:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db

# Redis
REDIS_HOST=redis.host.com
REDIS_PORT=6379
REDIS_PASSWORD=xxx

# API Keys
GEMINI_API_KEY=xxx
OPENAI_API_KEY=xxx

# Clerk
CLERK_SECRET_KEY=sk_live_xxx
CLERK_JWKS_URL=https://clerk.app/.well-known/jwks.json

# Configuration
PRODUCTION=true
ENV=prod
BEHIND_PROXY=false
CORS_ORIGINS=["https://litxplore.com"]
```

### Health Checks

**Endpoints**:

```python
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "LitXplore API"}

@app.get("/api/v1/healthcheck")
def detailed_health_check():
    # Check database
    # Check Redis
    # Check external APIs
    return {
        "status": "healthy",
        "database": "connected",
        "redis": "connected",
        "timestamp": datetime.utcnow()
    }
```

**Configuration**:

```yaml
# Docker healthcheck
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

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

#### Option 1: Upstash (Recommended)

**Features**:

- Serverless Redis
- Global edge caching
- Pay per request
- REST API available

**Configuration**:

```bash
REDIS_HOST=xxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=xxx
```

#### Option 2: Redis Cloud

**Features**:

- Managed Redis cluster
- High availability
- Auto-scaling
- Multi-zone deployment

#### Option 3: Self-Hosted

**Docker Compose**:

```yaml
redis:
  image: redis:7-alpine
  command: redis-server --requirepass ${REDIS_PASSWORD}
  volumes:
    - redis_data:/data
  ports:
    - "6379:6379"
```

### Cache Configuration

**TTL Settings**:

```python
# Development
CACHE_TTL_DEV = 3600  # 1 hour

# Production
CACHE_TTL_PROD = 86400  # 24 hours
```

**Cache Keys**:

```python
# Analysis results
f"analysis:{paper_id}:v{VERSION}:{ENV}"

# Search results
f"search:{query_hash}:v{VERSION}"

# Vector stores
f"vectorstore:{paper_id}"
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**Frontend** (`.github/workflows/frontend.yml`):

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - "frontend/**"
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci
        working-directory: ./frontend

      - name: Lint
        run: npm run lint
        working-directory: ./frontend

      - name: Build
        run: npm run build
        working-directory: ./frontend
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}

      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

**Backend** (`.github/workflows/backend.yml`):

```yaml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - "backend/**"

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest
        working-directory: ./backend

      - name: Run tests
        run: pytest
        working-directory: ./backend

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t litxplore-api .
        working-directory: ./backend

      - name: Push to registry
        run: |
          docker tag litxplore-api registry.example.com/litxplore-api:latest
          docker push registry.example.com/litxplore-api:latest

      - name: Deploy to production
        run: |
          # Deploy commands (depends on hosting provider)
          kubectl rollout restart deployment/litxplore-api
```

### Deployment Checklist

**Pre-Deployment**:

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Database migrations prepared
- [ ] Environment variables configured
- [ ] Backup created

**Deployment**:

- [ ] Deploy backend first (API backward compatible)
- [ ] Run database migrations
- [ ] Verify health checks
- [ ] Deploy frontend
- [ ] Monitor error rates

**Post-Deployment**:

- [ ] Smoke tests passed
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] User feedback reviewed

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

**Frontend**:

- Automatic HTTPS via Vercel
- TLS 1.3 supported
- HSTS enabled

**Backend**:

- SSL termination at load balancer
- Internal communication encrypted
- Certificate auto-renewal

### API Security

**Rate Limiting**:

```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@router.post("/generate-review")
@limiter.limit("10/day")
async def generate_review(...):
    pass
```

**CORS**:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://litxplore.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```

**Authentication**:

- JWT tokens via Clerk
- Token verification on every request
- Short-lived tokens (1 hour)

### Data Security

**At Rest**:

- Database encryption (Neon default)
- File system encryption
- Environment variable encryption

**In Transit**:

- HTTPS/TLS for all communications
- API key headers only over HTTPS
- Database connections over SSL

### Compliance

**GDPR**:

- User data export capability
- Right to deletion
- Privacy policy
- Cookie consent

**Data Retention**:

- User data: Retained until account deletion
- Logs: 90 days
- Backups: 7 days

---

## Scaling Strategy

### Horizontal Scaling

**Frontend (Vercel)**:

- Automatic edge scaling
- No configuration needed
- Global distribution

**Backend**:

```yaml
# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: litxplore-api
spec:
  replicas: 3 # Horizontal scaling
  strategy:
    type: RollingUpdate
  template:
    spec:
      containers:
        - name: api
          image: litxplore-api:latest
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: 1000m
              memory: 1Gi
```

**Auto-Scaling**:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: litxplore-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: litxplore-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

### Vertical Scaling

**Database**:

- Neon: Automatic compute scaling
- Increase connection pool size
- Optimize queries

**Cache**:

- Increase Redis memory
- Add read replicas
- Implement cache sharding

### Load Balancing

```
Internet → Load Balancer → [Backend Instance 1, 2, 3]
                         → Health Checks
                         → Sticky Sessions (if needed)
```

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

**Frontend (Vercel)**:

- Free tier: $0/month
- Pro tier: $20/month
- Bandwidth: Included in tier

**Backend (Render/AWS)**:

- Basic: $7-25/month
- Professional: $50-200/month
- Depends on traffic

**Database (Neon)**:

- Free tier: $0/month (1GB)
- Pro tier: $19/month (10GB)
- Storage: $0.12/GB/month

**Redis (Upstash)**:

- Free tier: $0/month (10K commands/day)
- Pro tier: $10-50/month

**AI APIs**:

- OpenAI: ~$0.0001/1K tokens
- Gemini: ~$0.00025-0.0005/1K tokens
- Estimated: $50-200/month

**Total Estimated**:

- Development: $0-50/month
- Production: $100-500/month (depending on scale)

### Optimization Strategies

1. **Caching**: Reduce AI API calls by 60-70%
2. **Fast Models**: Use lite models for quick operations
3. **Lazy Loading**: Only compute when needed
4. **Connection Pooling**: Reuse database connections
5. **CDN**: Cache static assets globally

---

**End of Deployment Architecture Document**
