# LitXplore - Backend Architecture

**Version:** 1.0  
**Last Updated:** November 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [API Endpoints](#api-endpoints)
4. [Service Layer](#service-layer)
5. [Core Components](#core-components)
6. [AI/ML Integration](#aiml-integration)
7. [Authentication & Security](#authentication--security)
8. [Caching Strategy](#caching-strategy)
9. [Error Handling](#error-handling)
10. [Performance Optimizations](#performance-optimizations)

---

## Overview

The LitXplore backend is built with **FastAPI**, a modern, high-performance Python web framework. It provides RESTful APIs for paper search, analysis, chat, review generation, and user management.

### Key Characteristics

- **Asynchronous**: Async/await pattern for non-blocking I/O
- **Type-Safe**: Pydantic models for request/response validation
- **Modular**: Clear separation between API, services, and data layers
- **Scalable**: Stateless design with external session management
- **Observable**: Comprehensive logging and health check endpoints

### Technology Stack

```
FastAPI (Web Framework)
    ↓
Uvicorn (ASGI Server)
    ↓
SQLAlchemy (ORM) ← → PostgreSQL (Database)
    ↓
LangChain (AI Orchestration) ← → Gemini + OpenAI
    ↓
Redis (Cache)
```

---

## Project Structure

```
backend/
├── alembic/                          # Database migrations
│   ├── versions/                     # Migration scripts
│   └── env.py                        # Alembic configuration
│
├── app/
│   ├── __init__.py
│   ├── main.py                       # FastAPI application entry point
│   │
│   ├── api/                          # API layer
│   │   └── v1/
│   │       └── endpoints/            # Route handlers
│   │           ├── analysis.py       # Paper analysis endpoints
│   │           ├── chat.py           # Paper chat endpoints
│   │           ├── documents.py      # Document generation endpoints
│   │           ├── history.py        # Review history endpoints
│   │           ├── papers.py         # Paper search & upload endpoints
│   │           ├── review.py         # Review generation endpoints
│   │           ├── tasks.py          # Task management endpoints
│   │           └── users.py          # User management endpoints
│   │
│   ├── services/                     # Business logic layer
│   │   ├── analysis_service.py       # Paper analysis orchestration
│   │   ├── analysis_helpers.py       # Analysis utility functions
│   │   ├── analysis_resilience.py    # Fallback mechanisms
│   │   ├── langchain_service.py      # Review generation service
│   │   ├── paper_service.py          # Paper operations service
│   │   ├── paper_chat.py             # Chat service
│   │   ├── document_service.py       # PDF generation service
│   │   └── task_service.py           # Background task service
│   │
│   ├── models/                       # Database & Pydantic models
│   │   ├── user.py                   # User model
│   │   ├── review.py                 # Review model
│   │   ├── task.py                   # Task model
│   │   ├── paper.py                  # Paper Pydantic model
│   │   └── analysis.py               # Analysis Pydantic models
│   │
│   ├── core/                         # Core configurations
│   │   └── config.py                 # Settings and environment variables
│   │
│   ├── db/                           # Database layer
│   │   ├── base_class.py             # Base SQLAlchemy model
│   │   └── database.py               # Database connection & session
│   │
│   ├── prompts/                      # LLM prompt templates
│   │   └── analyzer/
│   │       ├── at_a_glance.txt       # Fast analysis prompt
│   │       ├── in_depth.txt          # Detailed analysis prompt
│   │       ├── key_insights.txt      # Insights extraction prompt
│   │       └── questions.txt         # Question generation prompt
│   │
│   ├── utils/                        # Utility functions
│   │   └── security.py               # Security helpers
│   │
│   └── templates/                    # HTML/PDF templates
│       └── review_template.html      # Literature review template
│
├── uploads/                          # Temporary PDF storage
├── scripts/                          # Utility scripts
├── tests/                            # Unit and integration tests
├── requirements.txt                  # Python dependencies
├── docker-compose.yml                # Docker configuration
├── Dockerfile                        # Container image
├── alembic.ini                       # Alembic config
└── .env                              # Environment variables
```

---

## API Endpoints

### Base URL

```
Development: http://localhost:8000
Production: https://api.litxplore.com
API Version: /api/v1
```

### Endpoint Groups

#### 1. Papers (`/api/v1/papers`)

| Method | Endpoint      | Description         | Auth Required |
| ------ | ------------- | ------------------- | ------------- |
| GET    | `/search`     | Search arXiv papers | No            |
| GET    | `/{paper_id}` | Get paper details   | No            |
| POST   | `/upload`     | Upload custom PDF   | Yes           |

**Example: Search Papers**

```http
GET /api/v1/papers/search?query=transformers
```

**Response:**

```json
[
  {
    "id": "2307.12345",
    "title": "Attention Is All You Need",
    "authors": ["Ashish Vaswani", "Noam Shazeer"],
    "summary": "We propose a new simple network architecture...",
    "published": "2023-07-15T00:00:00",
    "url": "https://arxiv.org/pdf/2307.12345"
  }
]
```

#### 2. Analysis (`/api/v1/analysis`)

| Method | Endpoint                   | Description                   | Auth Required |
| ------ | -------------------------- | ----------------------------- | ------------- |
| POST   | `/{paper_id}`              | Generate At-a-Glance analysis | Yes           |
| POST   | `/{paper_id}/in-depth`     | Generate In-Depth analysis    | Yes           |
| POST   | `/{paper_id}/key-insights` | Extract Key Insights          | Yes           |

**Example: Analyze Paper**

```http
POST /api/v1/analysis/2307.12345
```

**Response:**

```json
{
  "paper": {
    "paper_id": "2307.12345",
    "title": "Attention Is All You Need",
    "authors": ["Ashish Vaswani"],
    "year": 2023,
    "url": "https://arxiv.org/pdf/2307.12345",
    "source": "arxiv"
  },
  "at_a_glance": {
    "title": "Attention Is All You Need",
    "authors": ["Ashish Vaswani"],
    "abstract": "We propose the Transformer...",
    "keywords": ["attention", "transformer", "neural networks"],
    "methodology": "The paper introduces self-attention mechanism...",
    "results": "Achieves state-of-the-art performance...",
    "limitations": ["Computational cost", "Memory requirements"],
    "future_work": ["Reduce computational complexity"]
  },
  "generated_at": "2025-11-23T18:45:00",
  "model_tag": "gemini-2.0-flash-lite"
}
```

#### 3. Chat (`/api/v1/papers`)

| Method | Endpoint           | Description     | Auth Required |
| ------ | ------------------ | --------------- | ------------- |
| POST   | `/{paper_id}/chat` | Chat with paper | Yes           |

**Example: Chat Request**

```http
POST /api/v1/papers/2307.12345/chat
Content-Type: application/json

{
  "message": "What is the main contribution of this paper?",
  "chat_history": []
}
```

**Response: Streaming**

```
data: {"type": "token", "content": "The"}
data: {"type": "token", "content": " main"}
data: {"type": "token", "content": " contribution"}
...
data: {"type": "done"}
```

#### 4. Review (`/api/v1/review`)

| Method | Endpoint           | Description                | Auth Required |
| ------ | ------------------ | -------------------------- | ------------- |
| POST   | `/generate-review` | Generate literature review | Yes           |
| POST   | `/save`            | Save generated review      | Yes           |
| GET    | `/history`         | Get user's review history  | Yes           |
| DELETE | `/{review_id}`     | Delete saved review        | Yes           |

**Example: Generate Review**

```http
POST /api/v1/review/generate-review
Content-Type: application/json

{
  "paper_ids": ["2307.12345", "2308.67890"],
  "topic": "Recent advances in transformer architectures",
  "max_papers": 10
}
```

#### 5. Documents (`/api/v1/documents`)

| Method | Endpoint    | Description           | Auth Required |
| ------ | ----------- | --------------------- | ------------- |
| POST   | `/generate` | Generate PDF document | Yes           |

#### 6. Users (`/api/v1/users`)

| Method | Endpoint         | Description              | Auth Required |
| ------ | ---------------- | ------------------------ | ------------- |
| GET    | `/me`            | Get current user profile | Yes           |
| POST   | `/webhook/clerk` | Clerk webhook handler    | No (Webhook)  |

#### 7. Tasks (`/api/v1/tasks`)

| Method | Endpoint     | Description       | Auth Required |
| ------ | ------------ | ----------------- | ------------- |
| GET    | `/{task_id}` | Get task status   | Yes           |
| GET    | `/`          | List user's tasks | Yes           |

#### 8. Health & Monitoring

| Method | Endpoint              | Description              | Auth Required |
| ------ | --------------------- | ------------------------ | ------------- |
| GET    | `/health`             | Health check             | No            |
| GET    | `/api/v1/healthcheck` | Detailed health check    | No            |
| GET    | `/db-test`            | Database connection test | No            |

---

## Service Layer

### 1. PaperService (`paper_service.py`)

**Responsibilities**:

- Search arXiv papers
- Handle PDF uploads
- Download and extract paper content
- Manage paper metadata

**Key Methods**:

```python
class PaperService:
    async def search_papers(query: str) -> List[Paper]
    async def get_paper(paper_id: str) -> Paper
    async def upload_paper(file: UploadFile) -> dict
    async def download_paper_pdf(paper_id: str) -> str
    async def extract_text_from_pdf(pdf_path: str) -> str
```

**PDF Security Validation**:

- File extension check
- Size limit (15MB max)
- PDF header validation
- Malicious content scanning (13 security markers)
- Content hash generation

**Malicious Markers Detected**:

```python
MALICIOUS_MARKERS = [
    b'/JavaScript', b'/JS', b'/Launch', b'/OpenAction',
    b'/AA', b'/AcroForm', b'/XFA', b'getAnnots',
    b'/EmbeddedFile', b'/RichMedia', b'/Flash',
    b'/GoToE', b'/GoToR', b'/ImportData', b'/SubmitForm',
    b'/Sound', b'/Movie'
]
```

### 2. AnalysisService (`analysis_service.py`)

**Responsibilities**:

- Orchestrate paper analysis
- Manage analysis caching
- Handle different analysis levels
- Coordinate with LLM services

**Key Methods**:

```python
class AnalysisService:
    async def analyze_paper(paper_id: str) -> PaperAnalysis
    async def compute_at_a_glance(paper_text: str) -> AtAGlanceAnalysis
    async def compute_in_depth(paper_text: str) -> InDepthAnalysis
    async def compute_key_insights(paper_text: str) -> dict
```

**Analysis Levels**:

1. **At-a-Glance** (Fast - 2-3 seconds)

   - Model: gemini-2.0-flash-lite
   - Text input: 3,000 characters
   - Sections: Abstract, methodology, results, limitations
   - Timeout: 30 seconds
   - Retries: 2

2. **In-Depth** (Comprehensive - 10-20 seconds)

   - Model: gemini-2.0-flash
   - Text input: 15,000 characters
   - Sections: 8 detailed sections
   - Timeout: 60 seconds
   - Retries: 3

3. **Key Insights** (Lazy-loaded - 5-10 seconds)
   - Model: gemini-2.0-flash
   - Text input: 10,000 characters
   - Extracts: Figures, limitations, future work
   - Timeout: 45 seconds

### 3. LangChainService (`langchain_service.py`)

**Responsibilities**:

- Generate literature reviews
- Process multiple papers
- Create vector stores
- Synthesize findings

**Key Methods**:

```python
class LangChainService:
    async def fetch_papers(topic: str, max_papers: int) -> List[Paper]
    async def process_papers(papers: List[Paper]) -> List[Dict]
    async def generate_review(papers: List[Paper], topic: str) -> str
```

**Processing Pipeline**:

1. **Document Loading**: Download papers from arXiv or filesystem
2. **Text Splitting**: Recursive character splitting (1000 chars, 200 overlap)
3. **Embedding**: Generate embeddings with OpenAI
4. **Vector Store**: Create FAISS index
5. **Retrieval**: Find relevant sections per paper
6. **Synthesis**: Generate comprehensive review with LLM

### 4. PaperChatService (`paper_chat.py`)

**Responsibilities**:

- Enable conversational Q&A with papers
- Manage vector stores for papers
- Stream AI responses
- Maintain chat context

**Key Methods**:

```python
class PaperChatService:
    async def load_paper(paper_id: str) -> FAISS
    async def chat(paper_id: str, message: str, history: List) -> AsyncGenerator
    async def retrieve_relevant_chunks(query: str, vectorstore: FAISS) -> List[str]
```

**Chat Pipeline**:

1. Load paper and create/retrieve vector store
2. Retrieve relevant chunks using semantic search
3. Construct prompt with context and chat history
4. Stream response from Gemini
5. Return chunks with token streaming

### 5. DocumentService (`document_service.py`)

**Responsibilities**:

- Generate PDF documents
- Format literature reviews
- Apply templates

**Key Methods**:

```python
class DocumentService:
    def generate_pdf(review_content: str, metadata: dict) -> bytes
    def format_markdown(content: str) -> str
```

### 6. TaskService (`task_service.py`)

**Responsibilities**:

- Manage async tasks
- Track task status
- Handle long-running operations

**Key Methods**:

```python
class TaskService:
    async def create_task(user_id: int) -> Task
    async def update_task_status(task_id: str, status: TaskStatus) -> Task
    async def get_task(task_id: str) -> Task
    async def get_user_tasks(user_id: int) -> List[Task]
```

---

## Core Components

### Configuration (`core/config.py`)

**Settings Management**:

```python
class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "LitXplore API"

    # Database Settings
    DATABASE_URL: Optional[str]
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_HOST: str
    POSTGRES_PORT: str
    POSTGRES_DB: str

    # AI Settings
    GEMINI_API_KEY: str
    OPENAI_API_KEY: str
    ANALYZER_MODEL_TAG: str = "gemini-2.0-flash"
    ANALYZER_FAST_MODEL_TAG: str = "gemini-2.0-flash-lite"

    # Redis Settings
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: str

    # LangChain Settings
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    SIMILARITY_THRESHOLD: float = 0.7
    MAX_PAPERS: int = 20

    # Security Settings
    CLERK_SECRET_KEY: str
    CLERK_JWKS_URL: str
    JWT_ALGORITHM: str = "RS256"

    # Rate Limiting
    RATE_LIMIT_PER_DAY: int = 100
```

**Environment Variables**:

- Loaded from `.env` file
- Type validation with Pydantic
- Default values for development
- Cached with `@lru_cache()`

### Database (`db/database.py`)

**Connection Management**:

```python
# Database URL construction
if settings.DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
else:
    SQLALCHEMY_DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/{db}"

# Engine configuration
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,      # Verify connections
    pool_size=5,             # Connection pool size
    max_overflow=10,         # Max overflow connections
    pool_recycle=1800,       # Recycle after 30 minutes
    connect_args={
        "connect_timeout": 10,
        "sslmode": "require"  # SSL for external databases
    }
)
```

**Session Management**:

```python
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))  # Test connection
        yield db
    except Exception as e:
        logger.error(f"Database session error: {str(e)}")
        db.close()
        raise
    finally:
        db.close()
```

### Middleware (`main.py`)

**CORS Middleware**:

```python
if not settings.BEHIND_PROXY:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
```

**Rate Limiting**:

```python
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
```

**Background Tasks**:

```python
class BackgroundTaskMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        if hasattr(request.state, 'background_tasks'):
            asyncio.create_task(self._process_background_tasks(...))
        return response
```

---

## AI/ML Integration

### LangChain Architecture

```
User Query
    ↓
Document Loader (PyPDFLoader / ArxivLoader)
    ↓
Text Splitter (RecursiveCharacterTextSplitter)
    ↓
Embedding (OpenAI text-embedding-ada-002)
    ↓
Vector Store (FAISS)
    ↓
Retriever (Similarity Search)
    ↓
LLM (Google Gemini)
    ↓
Response
```

### Models Used

| Model                  | Purpose                          | Speed           | Cost   |
| ---------------------- | -------------------------------- | --------------- | ------ |
| gemini-2.0-flash-lite  | At-a-Glance analysis             | Fast (2-3s)     | Low    |
| gemini-2.0-flash       | In-Depth analysis, Reviews, Chat | Medium (10-20s) | Medium |
| text-embedding-ada-002 | Text embeddings                  | Fast            | Low    |

### Prompt Engineering

**Structured Prompts** (stored in `/app/prompts/analyzer/`):

1. **at_a_glance.txt**: Fast summary extraction
2. **in_depth.txt**: Comprehensive section analysis
3. **key_insights.txt**: Figures and insights extraction
4. **questions.txt**: Suggested question generation

**Prompt Template Example**:

```python
prompt = PromptTemplate(
    input_variables=["paper_text", "section"],
    template="""
    Analyze the following section from a research paper:

    {paper_text}

    Extract the following information for {section}:
    1. Key points
    2. Methodology details
    3. Results and findings

    Format your response as JSON.
    """
)
```

---

## Authentication & Security

### Clerk Integration

**JWT Verification**:

```python
async def get_current_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")

    # Fetch JWKS from Clerk
    jwks_client = PyJWKClient(settings.CLERK_JWKS_URL)
    signing_key = jwks_client.get_signing_key_from_jwt(token)

    # Verify token
    payload = jwt.decode(
        token,
        signing_key.key,
        algorithms=[settings.JWT_ALGORITHM],
        options={"verify_aud": False}
    )

    return payload
```

### Rate Limiting

**Implementation**:

```python
from slowapi import Limiter

@router.post("/generate-review")
@limiter.limit("10/day")
async def generate_review(request: Request, ...):
    # Endpoint logic
    pass
```

### Input Validation

**Pydantic Models**:

```python
class ReviewRequest(BaseModel):
    paper_ids: List[str]
    topic: str = Field(..., min_length=3, max_length=500)
    max_papers: int = Field(default=10, ge=1, le=20)
```

### PDF Security

**Multi-Layer Validation**:

1. File extension check (`.pdf`)
2. Size limit (15MB)
3. PDF header validation (`%PDF`)
4. Malicious content scanning
5. Safe parsing configuration

---

## Caching Strategy

### Redis Cache Implementation

**Cache Keys**:

```python
# At-a-Glance
cache_key = f"analysis:{paper_id}:v{PROMPT_VERSION}:{ENV}"

# In-Depth
cache_key = f"in_depth:{paper_id}:v{PROMPT_VERSION}:{ENV}"

# Key Insights
cache_key = f"key_insights:{paper_id}:v{PROMPT_VERSION}:{ENV}"
```

**TTL (Time To Live)**:

- Development: 3600 seconds (1 hour)
- Production: 86400 seconds (24 hours)

**Cache Operations**:

```python
# Set cache
redis_client.setex(cache_key, ttl, json.dumps(data))

# Get cache
cached = redis_client.get(cache_key)
if cached:
    return json.loads(cached)
```

### Cache Invalidation

- Versioned keys prevent stale data
- Manual invalidation not required
- Automatic expiration via TTL

---

## Error Handling

### Exception Hierarchy

```python
# HTTP Exceptions
raise HTTPException(status_code=404, detail="Paper not found")
raise HTTPException(status_code=401, detail="Unauthorized")
raise HTTPException(status_code=500, detail="Internal server error")

# Custom Exceptions
class AnalysisError(Exception): pass
class PDFProcessingError(Exception): pass
class CacheError(Exception): pass
```

### Retry Logic

**Exponential Backoff**:

```python
async def retry_with_exponential_backoff(func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return await func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            wait_time = 2 ** attempt
            await asyncio.sleep(wait_time)
```

### Fallback Mechanisms

**PDF Extraction Fallbacks**:

1. PyPDF with strict parsing
2. PyPDF with lenient parsing
3. Text extraction without images
4. Manual text extraction

---

## Performance Optimizations

### 1. Async Operations

All I/O operations use async/await:

```python
async def search_papers(query: str):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()
```

### 2. Parallel Processing

Multiple papers processed concurrently:

```python
tasks = [process_paper(paper) for paper in papers]
results = await asyncio.gather(*tasks)
```

### 3. Connection Pooling

```python
# Database connection pool
pool_size=5
max_overflow=10

# HTTP connection reuse
session = aiohttp.ClientSession()
```

### 4. Caching

- Redis for analysis results
- In-memory caching for configuration
- Vector store caching for chat

### 5. Code Optimization

- Lazy loading of large models
- Chunked processing for large texts
- Streaming responses for real-time feedback

---

**End of Backend Architecture Document**
