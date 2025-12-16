# LitXplore - System Architecture Overview

**Version:** 1.0  
**Last Updated:** November 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Introduction](#introduction)
2. [High-Level Architecture](#high-level-architecture)
3. [Technology Stack](#technology-stack)
4. [System Components](#system-components)
5. [Data Flow](#data-flow)
6. [Key Features](#key-features)
7. [Architecture Principles](#architecture-principles)
8. [Related Documentation](#related-documentation)

---

## Introduction

LitXplore is a comprehensive research literature exploration platform that enables researchers and academics to:

- **Search** for academic papers on arXiv
- **Upload** custom PDF papers for analysis
- **Chat** with papers using AI-powered conversational interface
- **Generate** detailed literature reviews based on selected papers
- **Analyze** papers with multi-level insights (At-a-Glance, In-Depth, Key Insights)
- **Manage** research history and saved reviews

The platform combines modern web technologies with advanced AI/ML capabilities to provide an intuitive and powerful research assistant.

---

## High-Level Architecture

LitXplore follows a **three-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │   Next.js 13+ Frontend (React + TypeScript)        │    │
│  │   - UI Components (shadcn/ui + Tailwind CSS)       │    │
│  │   - State Management (Zustand + React Query)       │    │
│  │   - Authentication (Clerk)                          │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTPS/REST API
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION TIER                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │   FastAPI Backend (Python)                         │    │
│  │   - RESTful API Endpoints                          │    │
│  │   - Business Logic & Services                      │    │
│  │   - JWT Authentication & Rate Limiting             │    │
│  │   - AI/ML Orchestration (LangChain)                │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                       DATA/AI TIER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │    Redis     │  │  External    │     │
│  │  Database    │  │    Cache     │  │  AI APIs     │     │
│  │  (Neon)      │  │              │  │  - OpenAI    │     │
│  │              │  │              │  │  - Gemini    │     │
│  │              │  │              │  │  - arXiv     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Communication Patterns

- **Frontend ↔ Backend**: REST API over HTTPS with JWT authentication
- **Backend ↔ Database**: SQLAlchemy ORM with connection pooling
- **Backend ↔ Cache**: Redis protocol with versioned keys
- **Backend ↔ AI Services**: HTTP APIs with retry logic and rate limiting
- **Backend ↔ arXiv**: arXiv API Python client

---

## Technology Stack

### Frontend Technologies

| Category              | Technology      | Version | Purpose                          |
| --------------------- | --------------- | ------- | -------------------------------- |
| **Framework**         | Next.js         | 14.2.33 | React framework with App Router  |
| **Language**          | TypeScript      | 5.2.2   | Type-safe development            |
| **UI Framework**      | React           | 18.2.0  | Component-based UI               |
| **Styling**           | Tailwind CSS    | 3.3.3   | Utility-first CSS                |
| **Component Library** | shadcn/ui       | Latest  | Radix UI + Tailwind components   |
| **State Management**  | Zustand         | 5.0.3   | Lightweight state management     |
| **Data Fetching**     | React Query     | 5.28.4  | Server state management          |
| **Authentication**    | Clerk           | 6.33.4  | User authentication & management |
| **AI Integration**    | Vercel AI SDK   | 3.4.33  | Streaming AI responses           |
| **Markdown**          | React Markdown  | 9.0.3   | Markdown rendering with plugins  |
| **Animations**        | Framer Motion   | 11.18.2 | Declarative animations           |
| **Forms**             | React Hook Form | 7.54.2  | Form validation with Zod         |
| **Icons**             | Lucide React    | 0.446.0 | Icon library                     |

### Backend Technologies

| Category            | Technology          | Version | Purpose                              |
| ------------------- | ------------------- | ------- | ------------------------------------ |
| **Framework**       | FastAPI             | Latest  | High-performance async API framework |
| **Language**        | Python              | 3.9+    | Backend programming language         |
| **ASGI Server**     | Uvicorn             | 0.24.0+ | ASGI web server                      |
| **ORM**             | SQLAlchemy          | 2.0.0+  | Database ORM                         |
| **Database Driver** | psycopg2-binary     | 2.9.9+  | PostgreSQL adapter                   |
| **Migrations**      | Alembic             | 1.13.0+ | Database migration tool              |
| **Authentication**  | PyJWT + python-jose | Latest  | JWT token handling                   |
| **Rate Limiting**   | SlowAPI             | Latest  | API rate limiting                    |
| **Validation**      | Pydantic            | Latest  | Data validation                      |

### AI/ML Technologies

| Category                | Technology                              | Purpose                                 |
| ----------------------- | --------------------------------------- | --------------------------------------- |
| **AI Orchestration**    | LangChain                               | Chain LLM calls and document processing |
| **LLM Provider**        | Google Gemini (Vertex AI)               | Primary language model for analysis     |
| **Embeddings**          | OpenAI text-embedding-ada-002           | Document embedding generation           |
| **Vector Store**        | FAISS                                   | Vector similarity search                |
| **Document Processing** | PyPDF, arxiv                            | PDF parsing and arXiv integration       |
| **Models Used**         | gemini-2.0-flash, gemini-2.0-flash-lite | Fast and comprehensive analysis         |

### Infrastructure & Data

| Category             | Technology                         | Purpose                           |
| -------------------- | ---------------------------------- | --------------------------------- |
| **Database**         | PostgreSQL (Neon)                  | Primary data store                |
| **Cache**            | Redis                              | Session cache, API response cache |
| **Storage**          | Local file system                  | Temporary PDF uploads             |
| **Containerization** | Docker                             | Backend containerization          |
| **Deployment**       | Vercel (Frontend), Cloud (Backend) | Production hosting                |

---

## System Components

### 1. Frontend Application (`/frontend`)

**Purpose**: User interface and client-side logic

**Key Directories**:

- `/src/app` - Next.js pages and routes (App Router)
- `/src/components` - Reusable React components
- `/src/hooks` - Custom React hooks
- `/src/lib` - Utilities, API clients, types, stores

**Core Features**:

- Paper search interface with real-time results
- Interactive paper analyzer with multiple analysis tabs
- AI-powered chat interface with streaming responses
- Literature review generation workflow
- User authentication and profile management
- Review history management

### 2. Backend API (`/backend`)

**Purpose**: Business logic, API endpoints, and AI orchestration

**Key Directories**:

- `/app/api/v1/endpoints` - REST API route handlers
- `/app/services` - Business logic and service layer
- `/app/models` - SQLAlchemy database models
- `/app/core` - Configuration and security
- `/app/db` - Database connection and session management
- `/app/prompts` - LLM prompt templates
- `/app/utils` - Helper functions and utilities

**Core Services**:

- **PaperService**: ArXiv search, PDF processing, paper metadata
- **AnalysisService**: Paper analysis orchestration
- **LangChainService**: Literature review generation
- **PaperChatService**: Conversational Q&A with papers
- **DocumentService**: PDF document generation
- **TaskService**: Async task management

### 3. Database Layer

**Purpose**: Persistent data storage

**Key Models**:

- **User**: User accounts and authentication
- **Review**: Saved literature reviews
- **Task**: Async task tracking for long-running operations

**Migrations**: Managed by Alembic for version control

### 4. Cache Layer (Redis)

**Purpose**: Performance optimization and session management

**Cached Data**:

- Paper analysis results (At-a-Glance, In-Depth, Key Insights)
- ArXiv search results
- User session data
- Rate limiting counters

**Cache Strategy**:

- Development: 1-hour TTL
- Production: 24-hour TTL
- Versioned keys for schema evolution

### 5. External Services

**AI Services**:

- **Google Gemini**: Text generation and analysis
- **OpenAI**: Text embeddings for semantic search
- **arXiv API**: Academic paper metadata and PDFs

**Authentication**:

- **Clerk**: User authentication, session management, webhooks

---

## Data Flow

### 1. Paper Search Flow

```
User Input → Frontend Search Component
    ↓
API Request (GET /api/v1/papers/search?query=...)
    ↓
Backend PaperService.search_papers()
    ↓
arXiv API Client → Fetch Results
    ↓
Format as Paper Models
    ↓
Return to Frontend → Display in Grid
```

### 2. Paper Analysis Flow

```
User Selects Paper → Navigate to /papers/[paperId]/analyze
    ↓
Frontend loads At-a-Glance (immediate)
    ↓
API Request (POST /api/v1/analysis/{paperId})
    ↓
Backend checks Redis cache
    ├─ Cache Hit → Return cached analysis
    └─ Cache Miss → Generate analysis
        ↓
    Download/Extract Paper PDF
        ↓
    Extract text with PyPDF (fallback chain)
        ↓
    Send to Gemini (fast model: gemini-2.0-flash-lite)
        ↓
    Parse structured response (Pydantic models)
        ↓
    Store in Redis cache
        ↓
    Return to Frontend → Display in tabs
```

### 3. Paper Chat Flow

```
User sends message → Chat Interface
    ↓
API Request (POST /api/v1/papers/{paperId}/chat)
    ↓
Backend PaperChatService
    ↓
Download and chunk paper (if not cached)
    ↓
Generate embeddings with OpenAI
    ↓
Store in FAISS vector index
    ↓
Retrieve relevant chunks (semantic search)
    ↓
Construct prompt with context
    ↓
Stream response from Gemini
    ↓
Frontend displays with streaming UI
```

### 4. Literature Review Generation Flow

```
User selects papers + topic → Review Page
    ↓
API Request (POST /api/v1/review/generate-review)
    ↓
Backend LangChainService
    ↓
Download all papers (parallel)
    ↓
Extract and chunk text
    ↓
Generate embeddings and create vector store
    ↓
Retrieve relevant sections per paper
    ↓
Construct comprehensive review prompt
    ↓
Generate review with Gemini (gemini-2.0-flash)
    ↓
Format with citations and references
    ↓
Return to Frontend → Display with save option
    ↓
User saves → POST /api/v1/review/save
    ↓
Store in PostgreSQL database
```

### 5. PDF Upload Flow

```
User uploads PDF → Upload Component
    ↓
API Request (POST /api/v1/papers/upload)
    ↓
Backend validates PDF (size, format, security)
    ↓
Scan for malicious content (13 security markers)
    ↓
Generate content hash
    ↓
Save to uploads/ directory
    ↓
Extract metadata with AI
    ↓
Return paper ID (upload_{hash})
    ↓
Frontend redirects to analyzer
```

---

## Key Features

### 1. Paper Analyzer

**Multi-Level Analysis**:

- **At-a-Glance**: Fast summary (2-3s) with key metadata, methodology, results
- **In-Depth**: Comprehensive section-by-section analysis (10-20s, lazy-loaded)
- **Key Insights**: Figures, limitations, future work (lazy-loaded)
- **Interactive Chat**: Real-time Q&A with streaming responses

**Performance Optimizations**:

- Fast model for At-a-Glance (gemini-2.0-flash-lite)
- Lazy loading for detailed analysis
- Redis caching with 70% hit rate
- Code splitting for reduced bundle size

### 2. Literature Review Generator

**Capabilities**:

- Multi-paper synthesis (up to 20 papers)
- Topic-focused analysis
- Automatic citation management
- PDF export functionality
- Review history tracking

**AI Processing**:

- Vector-based relevant section retrieval
- Comprehensive LLM-generated synthesis
- Structured output with sections

### 3. Paper Chat

**Features**:

- Context-aware responses
- Streaming AI output
- Chat history management
- Semantic search over paper content

**Technical Implementation**:

- FAISS vector similarity search
- OpenAI embeddings (text-embedding-ada-002)
- Gemini for response generation
- Chunked document processing

### 4. PDF Upload & Security

**Security Measures**:

- Multi-layer validation (extension, size, header)
- Malicious content detection (13 markers)
- Safe PDF processing (disabled passwords, strict parsing)
- Content hash naming
- Automatic cleanup

### 5. User Management

**Features**:

- Clerk-based authentication
- JWT token verification
- User profile management
- Subscription tracking (planned: Stripe integration)

---

## Architecture Principles

### 1. Separation of Concerns

- **Frontend**: Presentation and user interaction
- **Backend**: Business logic and data management
- **AI Layer**: Machine learning and analysis
- **Database**: Data persistence

### 2. Scalability

- **Horizontal Scaling**: Stateless API design
- **Caching**: Redis for frequently accessed data
- **Connection Pooling**: Optimized database connections
- **CDN**: Static assets served via Vercel

### 3. Performance

- **Lazy Loading**: On-demand data fetching
- **Code Splitting**: Dynamic imports for large components
- **Caching Strategy**: Multi-level caching (browser, Redis)
- **Parallel Processing**: Concurrent API calls
- **Fast Models**: Lightweight models for quick operations

### 4. Resilience

- **Error Handling**: Comprehensive try-catch blocks
- **Fallback Mechanisms**: Multiple PDF extraction strategies
- **Retry Logic**: Exponential backoff for API calls
- **Graceful Degradation**: Partial responses when possible
- **Health Checks**: Monitoring endpoints

### 5. Security

- **Authentication**: JWT with Clerk integration
- **Rate Limiting**: SlowAPI for DoS protection
- **Input Validation**: Pydantic schemas
- **CORS**: Configurable cross-origin policies
- **PDF Security**: Malicious content scanning
- **SSL**: HTTPS enforced in production

### 6. Developer Experience

- **Type Safety**: TypeScript and Pydantic
- **Auto-generated API Client**: Orval for frontend API
- **Hot Reload**: Development mode with live updates
- **Comprehensive Logging**: Structured error tracking
- **Documentation**: OpenAPI/Swagger specs

---

## Related Documentation

For detailed information on specific components, please refer to:

- **[Backend Architecture](./ARCHITECTURE_BACKEND.md)** - Backend services, API endpoints, and business logic
- **[Frontend Architecture](./ARCHITECTURE_FRONTEND.md)** - Frontend components, hooks, and state management
- **[Database Schema](./ARCHITECTURE_DATABASE.md)** - Database models, relationships, and migrations
- **[Deployment Guide](./ARCHITECTURE_DEPLOYMENT.md)** - Infrastructure, deployment, and operations

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             USER LAYER                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ Browsers │  │  Mobile  │  │  Tablet  │  │  Desktop │               │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘               │
│        └──────────────┴─────────────┴──────────────┘                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTPS
┌────────────────────────────────▼────────────────────────────────────────┐
│                      PRESENTATION LAYER (Frontend)                       │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Next.js Application (Vercel)                                     │ │
│  │  ┌────────────┐ ┌────────────┐ ┌─────────────┐ ┌──────────────┐ │ │
│  │  │   Pages    │ │ Components │ │    Hooks    │ │    Stores    │ │ │
│  │  │  (Routes)  │ │    (UI)    │ │  (Logic)    │ │   (State)    │ │ │
│  │  └────────────┘ └────────────┘ └─────────────┘ └──────────────┘ │ │
│  │  └── React Query ── Zustand ── Clerk Auth ── Axios Client       │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ REST API
┌────────────────────────────────▼────────────────────────────────────────┐
│                      APPLICATION LAYER (Backend)                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  FastAPI Application                                              │ │
│  │  ┌────────────────────────────────────────────────────────────┐  │ │
│  │  │  API Endpoints (v1)                                        │  │ │
│  │  │  /papers │ /analysis │ /review │ /chat │ /users │ /tasks │  │ │
│  │  └───────────────────┬────────────────────────────────────────┘  │ │
│  │                      │                                            │ │
│  │  ┌───────────────────▼────────────────────────────────────────┐  │ │
│  │  │  Service Layer                                             │  │ │
│  │  │  PaperService │ AnalysisService │ LangChainService        │  │ │
│  │  │  PaperChatService │ DocumentService │ TaskService         │  │ │
│  │  └───────────────────┬────────────────────────────────────────┘  │ │
│  │                      │                                            │ │
│  │  ┌───────────────────▼────────────────────────────────────────┐  │ │
│  │  │  Core Layer                                                │  │ │
│  │  │  Config │ Auth │ Security │ Rate Limiting │ Middleware    │  │ │
│  │  └────────────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└──────────┬────────────────┬───────────────────┬────────────────────────┘
           │                │                   │
┌──────────▼─────┐  ┌───────▼────────┐  ┌──────▼──────────────────────────┐
│   DATA LAYER   │  │  CACHE LAYER   │  │      AI/ML LAYER               │
│  ┌──────────┐  │  │  ┌──────────┐  │  │  ┌───────────────────────────┐ │
│  │PostgreSQL│  │  │  │  Redis   │  │  │  │  LangChain Orchestration  │ │
│  │  (Neon)  │  │  │  │  Cache   │  │  │  │  ┌────────┐  ┌─────────┐  │ │
│  │          │  │  │  │          │  │  │  │  │ OpenAI │  │ Gemini  │  │ │
│  │ ┌──────┐ │  │  │  │ ┌──────┐ │  │  │  │  │Embedder│  │   LLM   │  │ │
│  │ │Users │ │  │  │  │ │Cached│ │  │  │  │  └────────┘  └─────────┘  │ │
│  │ │Review│ │  │  │  │ │Data  │ │  │  │  │         │          │       │ │
│  │ │Tasks │ │  │  │  │ │      │ │  │  │  │    ┌────▼──────────▼────┐  │ │
│  │ └──────┘ │  │  │  │ └──────┘ │  │  │  │    │  FAISS Vector DB   │  │ │
│  └──────────┘  │  │  └──────────┘  │  │  │    └────────────────────┘  │ │
└────────────────┘  └────────────────┘  │  └───────────────────────────┘ │
                                        │  ┌───────────────────────────┐ │
                                        │  │  External APIs            │ │
                                        │  │  arXiv │ Clerk │ Stripe   │ │
                                        │  └───────────────────────────┘ │
                                        └────────────────────────────────┘
```

---

**End of Overview Document**

For detailed architecture of each layer, continue to the respective documentation files.
