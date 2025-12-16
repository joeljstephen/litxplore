# LitXplore - Architecture Documentation Index

**Project**: LitXplore - Academic Literature Exploration Platform  
**Version**: 1.0  
**Last Updated**: November 2025  
**Status**: Production Ready

---

## 📚 Documentation Overview

This is the comprehensive architecture documentation for the LitXplore platform. The documentation is split into multiple focused documents for better organization and readability.

### Quick Navigation

| Document                                       | Description                       | Key Topics                                 |
| ---------------------------------------------- | --------------------------------- | ------------------------------------------ |
| **[Overview](./ARCHITECTURE_OVERVIEW.md)**     | High-level system architecture    | System design, technology stack, data flow |
| **[Backend](./ARCHITECTURE_BACKEND.md)**       | Backend service architecture      | API endpoints, services, AI integration    |
| **[Frontend](./ARCHITECTURE_FRONTEND.md)**     | Frontend application architecture | Components, routing, state management      |
| **[Database](./ARCHITECTURE_DATABASE.md)**     | Database schema and design        | Models, relationships, migrations          |
| **[Deployment](./ARCHITECTURE_DEPLOYMENT.md)** | Infrastructure and operations     | Deployment, monitoring, scaling            |

---

## 🎯 Quick Start Guide

### For New Developers

1. **Start Here**: [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)

   - Understand the overall system design
   - Learn about the technology stack
   - Review the data flow

2. **Frontend Development**: [ARCHITECTURE_FRONTEND.md](./ARCHITECTURE_FRONTEND.md)

   - Component structure
   - Routing and pages
   - State management patterns

3. **Backend Development**: [ARCHITECTURE_BACKEND.md](./ARCHITECTURE_BACKEND.md)

   - API endpoint reference
   - Service layer design
   - AI/ML integration

4. **Database Work**: [ARCHITECTURE_DATABASE.md](./ARCHITECTURE_DATABASE.md)

   - Schema design
   - Model definitions
   - Migration management

5. **DevOps/Deployment**: [ARCHITECTURE_DEPLOYMENT.md](./ARCHITECTURE_DEPLOYMENT.md)
   - Deployment procedures
   - Infrastructure setup
   - Monitoring and scaling

### For System Administrators

1. [Deployment Guide](./ARCHITECTURE_DEPLOYMENT.md) - Complete deployment procedures
2. [Database Setup](./ARCHITECTURE_DATABASE.md) - Database configuration
3. [Monitoring](./ARCHITECTURE_DEPLOYMENT.md#monitoring--logging) - System monitoring

### For Product Managers

1. [System Overview](./ARCHITECTURE_OVERVIEW.md) - High-level architecture
2. [Key Features](./ARCHITECTURE_OVERVIEW.md#key-features) - Feature capabilities
3. [Scaling Strategy](./ARCHITECTURE_DEPLOYMENT.md#scaling-strategy) - Growth planning

---

## 🏗️ System Architecture at a Glance

### Three-Tier Architecture

```
┌─────────────────────────────────────────┐
│         CLIENT TIER (Frontend)           │
│  Next.js 13+ | React | TypeScript       │
│  Tailwind CSS | shadcn/ui | Clerk       │
└─────────────────┬───────────────────────┘
                  │ REST API / HTTPS
┌─────────────────▼───────────────────────┐
│      APPLICATION TIER (Backend)          │
│  FastAPI | Python | LangChain           │
│  SQLAlchemy | Redis | Uvicorn           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         DATA/AI TIER                     │
│  PostgreSQL | Redis | OpenAI | Gemini   │
└─────────────────────────────────────────┘
```

### Key Technologies

**Frontend Stack**:

- Next.js 14.2.33 (App Router)
- React 18.2.0
- TypeScript 5.2.2
- Tailwind CSS 3.3.3
- shadcn/ui components
- Zustand + React Query
- Clerk authentication

**Backend Stack**:

- FastAPI (async Python)
- SQLAlchemy 2.0+ ORM
- PostgreSQL (Neon)
- Redis caching
- LangChain orchestration
- Google Gemini + OpenAI

**Infrastructure**:

- Frontend: Vercel
- Backend: Docker containers
- Database: Neon (serverless PostgreSQL)
- Cache: Redis (Upstash or cloud)
- Auth: Clerk
- Monitoring: Sentry

---

## 📂 Project Structure

```
litxplore/
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Pages and routes (App Router)
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities, API client, stores
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/               # FastAPI backend application
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── models/       # Database models
│   │   ├── core/         # Configuration
│   │   ├── db/           # Database connection
│   │   └── prompts/      # LLM prompts
│   ├── alembic/          # Database migrations
│   ├── uploads/          # Temporary PDF storage
│   ├── requirements.txt
│   └── Dockerfile
│
├── ARCHITECTURE_OVERVIEW.md    # This index file
├── ARCHITECTURE_BACKEND.md     # Backend documentation
├── ARCHITECTURE_FRONTEND.md    # Frontend documentation
├── ARCHITECTURE_DATABASE.md    # Database documentation
└── ARCHITECTURE_DEPLOYMENT.md  # Deployment documentation
```

---

## 🔑 Key Features

### 1. Paper Search & Upload

- Search arXiv papers by keywords
- Upload custom PDF papers
- PDF security validation
- Metadata extraction

**Documentation**:

- [Frontend Search](./ARCHITECTURE_FRONTEND.md#routing--pages)
- [Backend Paper Service](./ARCHITECTURE_BACKEND.md#1-paperservice-paper_servicepy)

### 2. Paper Analyzer

- **At-a-Glance**: Fast 2-3 second analysis
- **In-Depth**: Comprehensive section-by-section analysis
- **Key Insights**: Figures, limitations, future work
- **Interactive Chat**: Real-time Q&A with papers

**Documentation**:

- [Analyzer Components](./ARCHITECTURE_FRONTEND.md#2-analyzer-components-componentsanalyzer)
- [Analysis Service](./ARCHITECTURE_BACKEND.md#2-analysisservice-analysis_servicepy)

### 3. Literature Review Generator

- Multi-paper synthesis (up to 20 papers)
- AI-powered comprehensive reviews
- Automatic citation management
- PDF export functionality

**Documentation**:

- [Review Page](./ARCHITECTURE_FRONTEND.md#4-review-generation-appreviewpagetsx)
- [LangChain Service](./ARCHITECTURE_BACKEND.md#3-langchainservice-langchain_servicepy)

### 4. User Management

- Clerk authentication
- Review history tracking
- Profile management
- Subscription support (planned)

**Documentation**:

- [Authentication](./ARCHITECTURE_FRONTEND.md#authentication)
- [User Model](./ARCHITECTURE_DATABASE.md#1-user-model)

---

## 🔄 Data Flow Examples

### Paper Analysis Flow

```
User → Search/Upload Paper
  ↓
Frontend: Navigate to /papers/[id]/analyze
  ↓
API Request: POST /api/v1/analysis/{paper_id}
  ↓
Backend: Check Redis cache
  ├─ Hit: Return cached result
  └─ Miss: Generate new analysis
      ↓
  Download/Extract PDF text
      ↓
  Send to Gemini API (fast model)
      ↓
  Parse structured response
      ↓
  Cache in Redis (24h TTL)
      ↓
  Return to Frontend
      ↓
Display in tabbed interface
```

**Detailed Documentation**: [ARCHITECTURE_OVERVIEW.md - Data Flow](./ARCHITECTURE_OVERVIEW.md#data-flow)

### Chat with Paper Flow

```
User → Enter question
  ↓
API Request: POST /api/v1/papers/{id}/chat
  ↓
Backend: Load paper vector store
  ↓
Retrieve relevant chunks (FAISS search)
  ↓
Construct prompt with context
  ↓
Stream response from Gemini
  ↓
Frontend: Display with streaming UI
```

**Detailed Documentation**: [ARCHITECTURE_BACKEND.md - Paper Chat](./ARCHITECTURE_BACKEND.md#4-paperchatservice-paper_chatpy)

---

## 🗃️ Database Schema

### Core Models

**Users** → **Reviews** (1:N)  
**Users** → **Tasks** (1:N)

### Entity Details

| Entity     | Purpose                  | Key Fields                       |
| ---------- | ------------------------ | -------------------------------- |
| **User**   | User accounts            | clerk_id, email, name            |
| **Review** | Saved literature reviews | title, topic, content, citations |
| **Task**   | Async operation tracking | status, result_data, error       |

**Note**: Papers are NOT stored in the database. They are referenced by arXiv ID or upload hash.

**Full Schema**: [ARCHITECTURE_DATABASE.md](./ARCHITECTURE_DATABASE.md)

---

## 🚀 API Reference

### Base URLs

```
Development:  http://localhost:8000/api/v1
Production:   https://api.litxplore.com/api/v1
```

### Endpoint Groups

| Group        | Endpoints                                   | Authentication |
| ------------ | ------------------------------------------- | -------------- |
| **Papers**   | `/papers/search`, `/papers/upload`          | Mixed          |
| **Analysis** | `/analysis/{id}`, `/analysis/{id}/in-depth` | Required       |
| **Chat**     | `/papers/{id}/chat`                         | Required       |
| **Review**   | `/review/generate-review`, `/review/save`   | Required       |
| **Users**    | `/users/me`                                 | Required       |
| **Health**   | `/health`, `/healthcheck`                   | Public         |

**Complete API Reference**: [ARCHITECTURE_BACKEND.md - API Endpoints](./ARCHITECTURE_BACKEND.md#api-endpoints)

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App Layout
├── Header (Navigation + Auth)
├── Pages
│   ├── Home (Landing)
│   ├── Search (Paper search)
│   ├── Analyzer (Multi-tab analysis)
│   ├── Review (Generation wizard)
│   └── History (Saved reviews)
└── Providers (Clerk, React Query, Theme)
```

### State Management

- **Server State**: React Query (API data, caching)
- **Client State**: Zustand (UI state, review data)
- **URL State**: Next.js router (search params, navigation)
- **Form State**: React Hook Form + Zod (validation)

**Complete Frontend Docs**: [ARCHITECTURE_FRONTEND.md](./ARCHITECTURE_FRONTEND.md)

---

## 🔧 Backend Architecture

### Service Layer

```
API Endpoints (FastAPI routes)
    ↓
Service Layer (Business logic)
    ├── PaperService
    ├── AnalysisService
    ├── LangChainService
    ├── PaperChatService
    └── DocumentService
    ↓
Data Layer (Database + Cache)
    ├── PostgreSQL (via SQLAlchemy)
    ├── Redis (caching)
    └── File System (uploads)
```

### AI Integration

- **LangChain**: Orchestration framework
- **Google Gemini**: Primary LLM (analysis, chat, reviews)
- **OpenAI**: Text embeddings (semantic search)
- **FAISS**: Vector similarity search

**Complete Backend Docs**: [ARCHITECTURE_BACKEND.md](./ARCHITECTURE_BACKEND.md)

---

## 📊 Performance & Optimization

### Caching Strategy

**Redis Cache**:

- Analysis results: 24h TTL (prod), 1h TTL (dev)
- Search results: 1h TTL
- Vector stores: Persistent until paper update

**Cache Hit Rate**: ~70%

**Frontend Optimizations**:

- Code splitting (React.lazy, dynamic imports)
- Image optimization (Next.js Image)
- Prefetching (on hover)
- Debouncing (search input)

**Backend Optimizations**:

- Fast models for quick operations (gemini-2.0-flash-lite)
- Lazy loading (In-Depth analysis)
- Parallel processing (asyncio.gather)
- Connection pooling

**Details**:

- [Frontend Performance](./ARCHITECTURE_FRONTEND.md#performance-optimizations)
- [Backend Performance](./ARCHITECTURE_BACKEND.md#performance-optimizations)

---

## 🔐 Security

### Authentication

- Clerk for user authentication
- JWT tokens with RS256 algorithm
- Token verification on every protected request

### API Security

- Rate limiting (SlowAPI)
- CORS configuration
- Input validation (Pydantic)
- SQL injection prevention (SQLAlchemy ORM)

### PDF Security

- Multi-layer validation
- Malicious content detection (13 markers)
- Size limits (15MB)
- Safe parsing configuration

**Complete Security Details**: [ARCHITECTURE_DEPLOYMENT.md - Security](./ARCHITECTURE_DEPLOYMENT.md#security--compliance)

---

## 📈 Monitoring & Observability

### Error Tracking

- **Sentry**: Real-time error tracking (frontend + backend)
- **Logging**: Structured logging with context
- **Alerts**: Automated alerts on critical errors

### Performance Monitoring

- **Response Times**: API endpoint latency
- **Error Rates**: 4xx/5xx errors
- **Resource Usage**: CPU, memory, database connections
- **Business Metrics**: Papers analyzed, reviews generated

### Health Checks

- `/health`: Basic liveness check
- `/api/v1/healthcheck`: Detailed health status
- `/db-test`: Database connection verification

**Complete Monitoring Guide**: [ARCHITECTURE_DEPLOYMENT.md - Monitoring](./ARCHITECTURE_DEPLOYMENT.md#monitoring--logging)

---

## 🌐 Deployment

### Environments

| Environment     | Frontend               | Backend            | Database        |
| --------------- | ---------------------- | ------------------ | --------------- |
| **Development** | localhost:3000         | localhost:8000     | Local/Neon dev  |
| **Staging**     | Vercel preview         | Staging server     | Neon staging    |
| **Production**  | Vercel (litxplore.com) | Production cluster | Neon production |

### Deployment Process

**Frontend (Vercel)**:

1. Push to GitHub
2. Automatic deployment
3. Preview for PRs, production for main branch

**Backend (Docker)**:

1. Build Docker image
2. Run database migrations
3. Deploy to hosting platform
4. Health check verification

**Complete Deployment Guide**: [ARCHITECTURE_DEPLOYMENT.md](./ARCHITECTURE_DEPLOYMENT.md)

---

## 🛠️ Development Workflow

### Setup

**Frontend**:

```bash
cd frontend
npm install
npm run dev  # http://localhost:3000
```

**Backend**:

```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload  # http://localhost:8000
```

### Development Commands

**Frontend**:

```bash
npm run dev              # Start dev server
npm run build           # Production build
npm run generate:api    # Generate API client from OpenAPI
npm run lint            # ESLint
```

**Backend**:

```bash
uvicorn app.main:app --reload  # Start with hot reload
alembic revision --autogenerate  # Create migration
alembic upgrade head              # Apply migrations
pytest                            # Run tests
```

### Code Generation

**API Client** (Frontend):

```bash
# Automatic generation from backend OpenAPI spec
npm run generate:api
```

This creates TypeScript types and React Query hooks in:
`/frontend/src/lib/api/generated/`

---

## 📝 Best Practices

### Code Style

**Frontend**:

- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Functional components with hooks
- Tailwind CSS for styling

**Backend**:

- Type hints for all functions
- Pydantic models for validation
- Async/await for I/O operations
- Comprehensive error handling

### Git Workflow

```
main (production)
  ↓
develop (integration)
  ↓
feature/xxx (feature branches)
```

**Commit Messages**:

```
feat: Add paper upload functionality
fix: Resolve PDF parsing error
docs: Update architecture documentation
refactor: Improve analysis service structure
```

### Testing

**Frontend**:

- Component tests (Jest + React Testing Library)
- E2E tests (Playwright)
- Integration tests for API calls

**Backend**:

- Unit tests (pytest)
- Integration tests for API endpoints
- Database migration tests

---

## 🔮 Future Enhancements

### Planned Features

1. **Subscription Management** (Stripe integration)
2. **Collaboration** (Shared reviews, team workspaces)
3. **Advanced Search** (Semantic search, filters)
4. **Export Options** (Word, LaTeX, BibTeX)
5. **Citation Manager** (Zotero integration)
6. **Mobile App** (React Native)
7. **Offline Mode** (PWA capabilities)
8. **Multi-language Support** (i18n)

### Technical Improvements

1. **Elasticsearch** for full-text search
2. **Message Queue** (RabbitMQ/Redis Queue) for async tasks
3. **GraphQL API** as alternative to REST
4. **Microservices** for AI processing
5. **CDN** for uploaded PDFs
6. **WebSockets** for real-time collaboration

---

## 📞 Support & Contribution

### Getting Help

- **Documentation**: Start with [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Email**: support@litxplore.com

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Update documentation
6. Submit a pull request

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Performance impact considered
- [ ] Security implications reviewed

---

## 📚 Additional Resources

### External Documentation

- **Next.js**: https://nextjs.org/docs
- **FastAPI**: https://fastapi.tiangolo.com
- **LangChain**: https://python.langchain.com
- **Clerk**: https://clerk.com/docs
- **Neon**: https://neon.tech/docs
- **Vercel**: https://vercel.com/docs

### Related Documents

- `README.md` - Project overview and setup
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - Version history
- `LICENSE` - MIT License

---

## 📊 Document Metrics

**Total Documentation**:

- Architecture documents: 5
- Total pages: ~100+
- Code examples: 150+
- Diagrams: 10+

**Coverage**:

- System architecture ✅
- Frontend architecture ✅
- Backend architecture ✅
- Database schema ✅
- Deployment procedures ✅
- Security practices ✅
- Performance optimization ✅
- Monitoring & logging ✅

---

## 🎯 Quick Reference

### Environment Variables

**Frontend (.env.local)**:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

**Backend (.env)**:

```bash
DATABASE_URL=postgresql://...
REDIS_HOST=localhost
GEMINI_API_KEY=xxx
OPENAI_API_KEY=xxx
CLERK_SECRET_KEY=sk_test_xxx
```

### Useful Commands

```bash
# Frontend dev
npm run dev

# Backend dev
uvicorn app.main:app --reload

# Database migration
alembic upgrade head

# Generate API client
npm run generate:api

# Run tests
npm test          # Frontend
pytest            # Backend

# Build for production
npm run build     # Frontend
docker build .    # Backend
```

### Port Reference

- Frontend: `3000`
- Backend: `8000`
- PostgreSQL: `5432`
- Redis: `6379`

---

**Last Updated**: November 2025  
**Maintainers**: LitXplore Development Team  
**License**: MIT

---

## Navigation

**[← Back to README](./README.md)** | **[System Overview →](./ARCHITECTURE_OVERVIEW.md)**
