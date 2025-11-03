# LitXplore Paper Analyzer - Complete Guide

> Comprehensive documentation for the AI-powered research paper analysis platform

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Getting Started](#getting-started)
5. [API Reference](#api-reference)
6. [Configuration](#configuration)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Overview

LitXplore Paper Analyzer is a production-ready AI-powered platform for analyzing academic research papers. Built with Next.js, FastAPI, and Google Gemini, it provides fast summaries, deep insights, and interactive chat capabilities.

### Key Capabilities

- **Fast Analysis**: At-a-Glance summaries in 2-3 seconds
- **Deep Insights**: Comprehensive section-by-section analysis (10-20s)
- **Interactive Chat**: AI-powered Q&A with streaming responses
- **Smart Caching**: ~70% cache hit rate with Redis
- **Responsive Design**: Optimized for all devices
- **Production Ready**: Complete error handling and monitoring

---

## Features

### Core Analysis Features

#### 1. At-a-Glance Analysis ⚡
- **Speed**: 2-3 seconds using gemini-2.0-flash-lite
- **Content**: Title, authors, abstract, keywords, section summaries
- **Sections**: Introduction, related work, methodology, results, discussion, limitations, future work, conclusion

#### 2. In-Depth Analysis 📊
- **Speed**: 10-20 seconds, lazy-loaded on demand
- **Content**: Comprehensive analysis of 8 major sections
  - Introduction (background, motivation, significance)
  - Related Work (prior approaches, gaps)
  - Problem Statement (research questions, scope)
  - Methodology (algorithms, experimental design)
  - Results (findings, comparisons, metrics)
  - Discussion (interpretation, implications)
  - Limitations (constraints, biases)
  - Conclusion & Future Work (contributions, impact)

#### 3. Interactive Chat 💬
- Vector-based Q&A with FAISS search
- Streaming responses (Vercel AI SDK)
- Debounced input (300ms) for cost optimization

### User Experience

- **Split-View Layout**: PDF + analysis side-by-side (desktop)
- **Stacked Layout**: Optimized for mobile/tablet
- **Resizable Panels**: Adjustable split with persistence
- **Skeleton Loaders**: Smooth loading states
- **Error Fallbacks**: Graceful degradation with retry
- **Dark Theme**: Modern UI with yellow/orange accents
- **Accessibility**: Full keyboard navigation + ARIA labels

---

## Architecture

### Technology Stack

**Backend**:
- FastAPI (Python 3.9+)
- PostgreSQL + SQLAlchemy ORM
- Redis (caching)
- Google Gemini (LLM)
- OpenAI (embeddings)
- FAISS (vector search)
- LangChain (orchestration)
- Clerk (authentication)

**Frontend**:
- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (state)
- React Query (data fetching)
- Vercel AI SDK
- Clerk (auth)

### System Architecture

```
Frontend (Next.js)
    ↓ HTTPS/REST
FastAPI
    ├─ Analysis Service → [Gemini + OpenAI + FAISS]
    ├─ Chat Service → [Vector Store + Streaming]
    └─ Paper Service → [arXiv API + Uploads]
        ↓
[Redis Cache] + [PostgreSQL DB]
```

### Data Flow

**Initial Analysis**:
```
User → Frontend → API → Check Cache → Fetch PDF → Extract Text
    → Generate At-a-Glance (LLM)
    → Cache Result → Return PaperAnalysis
```

**Lazy-Loaded Features**:
```
User clicks tab → Check if loaded → Call API → Compute analysis
    → Update cache → Return updated analysis
```

---

## Getting Started

### Prerequisites

- Node.js 18+, Python 3.9+, PostgreSQL 12+, Redis 6+
- API Keys: OpenAI, Google Gemini, Clerk

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Configure: DATABASE_URL, REDIS_URL, OPENAI_API_KEY, GEMINI_API_KEY, CLERK_SECRET_KEY

alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install

cp .env.example .env.local
# Configure: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY

npm run dev
```

Visit `http://localhost:3000`

---

## API Reference

### Analysis Endpoints

#### POST /api/v1/analysis/{paper_id}/analyze
Generate At-a-Glance analysis

**Query Params**: `force_refresh` (boolean, default: false)  
**Headers**: `Authorization: Bearer <token>`  
**Response**: `PaperAnalysis` with `at_a_glance`

#### GET /api/v1/analysis/{paper_id}
Retrieve cached analysis

**Response**: `PaperAnalysis` or 404

#### POST /api/v1/analysis/{paper_id}/in-depth
Compute In-Depth Analysis

**Response**: `PaperAnalysis` with `in_depth` populated

### Chat Endpoints

#### POST /api/v1/papers/{paper_id}/chat
Chat with paper (streaming response)

**Request Body**:
```json
{
  "message": "What is the main contribution?",
  "history": [...]
}
```

**Response**: Server-Sent Events (streaming tokens)

### Paper Endpoints

#### GET /api/v1/papers/search
Search papers on arXiv

**Query Params**: `query`, `max_results` (default: 10)

#### POST /api/v1/papers/upload
Upload PDF paper (multipart/form-data)

---

## Configuration

### Backend Environment Variables

```env
# Database & Cache
DATABASE_URL=postgresql://user:pass@localhost:5432/litxplore
REDIS_URL=redis://localhost:6379/0

# API Keys
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
CLERK_SECRET_KEY=sk_test_...

# Configuration
ENV=production                          # dev or production
PROMPT_VERSION=1.0.0                    # Cache version
ANALYZER_MODEL_TAG=gemini-2.0-flash     # Full model
ANALYZER_FAST_MODEL_TAG=gemini-2.0-flash-lite  # Fast model
RATE_LIMIT_PER_DAY=1000
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Caching Strategy

**Cache Key Format**: `analysis:{paper_hash}:{schema_version}:{model_tag}`

**TTL**:
- Development: 1 hour (3600s)
- Production: 24 hours (86400s)

**Invalidation**: Bump `PROMPT_VERSION` or change `ANALYZER_MODEL_TAG`

---

## Deployment

### Docker (Backend)

```bash
# Build
docker build -t litxplore-backend ./backend

# Run
docker run -p 8000:8000 --env-file .env litxplore-backend

# Docker Compose
docker-compose up -d
```

### Vercel (Frontend)

```bash
npm i -g vercel
cd frontend
vercel --prod
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied (`alembic upgrade head`)
- [ ] Redis cache configured and accessible
- [ ] API keys validated
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Error logging setup
- [ ] Health checks tested (`/health`, `/api/v1/db-test`)
- [ ] HTTPS configured
- [ ] Monitoring setup

### Recommended Platforms

| Component | Platform | Alternatives |
|-----------|----------|--------------|
| Backend | AWS ECS, Google Cloud Run | Heroku, Railway |
| Frontend | Vercel | Netlify, AWS Amplify |
| Database | AWS RDS, Google Cloud SQL | Supabase, Heroku Postgres |
| Cache | AWS ElastiCache, Google Memorystore | Heroku Redis |

---

## Troubleshooting

### Common Issues

**Analysis takes too long**
- Check Redis cache is working
- Verify LLM API quotas
- Consider using fast model for At-a-Glance

**PDF extraction fails**
- Check PDF format and size
- Fallback analysis will be returned
- Check backend logs for specifics

**Chat not working**
- Verify backend chat endpoint is running
- Check API keys configuration
- Review browser console for errors

**Authentication issues**
- Verify Clerk configuration
- Check JWT token validity
- Review Clerk dashboard for errors

**Cache not working**
- Verify Redis connection: `redis-cli ping`
- Check `REDIS_URL` environment variable
- Review backend logs for cache errors

### Performance Optimization

**Backend**:
- Use fast models for quick operations (60% cost reduction)
- Enable parallelism with `asyncio.gather`
- Configure appropriate cache TTL
- Monitor LLM token usage

**Frontend**:
- Enable code splitting for heavy components
- Use prefetching for anticipated actions
- Debounce user inputs (300ms for chat)
- Truncate chat history to recent messages

### Monitoring

**Health Endpoints**:
- `GET /health` - Backend status
- `GET /api/v1/db-test` - Database connectivity

**Key Metrics**:
- API response times
- Error rates by endpoint
- Cache hit rates (~70% target)
- LLM token usage
- User engagement

### Error Handling

**Multiple Fallback Layers**:
1. LLM Retry (2-3 retries with exponential backoff)
2. JSON Parsing (extract partial data)
3. PDF Extraction (use raw chunks)
4. Complete Failure (return minimal analysis)

---

## File Structure

### Backend
```
backend/app/
├── api/v1/endpoints/
│   ├── analysis.py          # Analysis endpoints
│   ├── chat.py              # Chat endpoints
│   └── papers.py            # Paper endpoints
├── services/
│   ├── analysis_service.py  # Core analysis logic
│   ├── analysis_helpers.py  # Retry & parsing
│   └── paper_chat.py        # Chat service
├── models/
│   └── analysis.py          # Pydantic models
├── prompts/analyzer/
│   ├── at_a_glance.txt
│   └── in_depth.txt
└── core/
    ├── config.py            # Configuration
    └── auth.py              # Authentication
```

### Frontend
```
frontend/src/
├── app/papers/[paperId]/analyze/
│   └── page.tsx                    # Main analyzer page
├── components/analyzer/
│   ├── at-a-glance-cards.tsx
│   ├── in-depth-panel.tsx
│   ├── chat-panel.tsx
│   └── skeletons.tsx
├── hooks/
│   ├── use-paper-analysis.ts       # Analysis state
│   ├── use-toast-notification.ts
│   └── use-debounced-input.ts
└── lib/
    ├── api/analysis.ts             # API client
    └── types/analysis.ts           # TypeScript types
```

---

## Performance Metrics

- **At-a-Glance**: 2-3 seconds (fast model)
- **In-Depth**: 10-20 seconds (lazy-loaded)
- **Chat**: Real-time streaming
- **Cache Hit Rate**: ~70%
- **API Response**: <500ms with cache

## Cost Estimation (1000 users/month)

- OpenAI Embeddings: $10
- Google Gemini: $25
- Redis Cache: $15
- PostgreSQL: $20
- **Total**: ~$70/month

---

## Support & Contributing

**Documentation**:
- This guide covers all aspects of the Paper Analyzer
- Check `/backend/app/prompts/analyzer/` for prompt templates
- Review `/backend/app/models/analysis.py` for data structures

**Contributing**:
1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

**License**: MIT

---

## Quick Reference

### Run Development
```bash
# Backend
cd backend && uvicorn app.main:app --reload

# Frontend
cd frontend && npm run dev
```

### Run Tests
```bash
# Backend
cd backend && pytest tests/

# Frontend
cd frontend && npm run test
```

### Deploy
```bash
# Backend (Docker)
docker-compose up -d

# Frontend (Vercel)
vercel --prod
```

### Monitor
- Health: `http://localhost:8000/health`
- API Docs: `http://localhost:8000/docs`
- App: `http://localhost:3000`

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-20  
**Status**: Production Ready ✅
