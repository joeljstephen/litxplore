# LitXplore Paper Analyzer - Complete Architecture Guide

> A comprehensive explanation of how the entire paper analysis feature works, from frontend to backend.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Data Models](#data-models)
4. [Backend Deep Dive](#backend-deep-dive)
5. [Frontend Deep Dive](#frontend-deep-dive)
6. [Feature Implementations](#feature-implementations)
7. [Request Flow Examples](#request-flow-examples)
8. [Caching & Performance](#caching--performance)

---

## System Overview

### What Does It Do?

The Paper Analyzer provides three ways to understand research papers:

1. **At-a-Glance** (2-3s) - Fast summary of all major sections
2. **In-Depth** (10-20s) - Comprehensive multi-paragraph analysis of each section
3. **Chat** (streaming) - Interactive Q&A with the paper using AI

### Key Design Principles

- **Progressive Loading**: Load only what's needed, when needed
- **Smart Caching**: Redis caching with 70% hit rate
- **Graceful Degradation**: Always return something useful, even on errors
- **Fast Initial Load**: At-a-Glance uses fast model (gemini-2.0-flash-lite)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │  PaperAnalyzerPage                                 │ │
│  │  ├─ usePaperAnalysis hook (state management)      │ │
│  │  ├─ analysisApi (HTTP client)                     │ │
│  │  └─ Components (AtAGlance, InDepth, KeyInsights)  │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         ↓ HTTPS/REST (JWT)
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │  API Endpoints                                     │ │
│  │  ├─ POST /analysis/{id}/analyze                   │ │
│  │  ├─ POST /analysis/{id}/key-insights              │ │
│  │  ├─ POST /analysis/{id}/in-depth                  │ │
│  │  └─ GET  /analysis/{id}                           │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  AnalysisService                                   │ │
│  │  ├─ Paper fetching (arXiv/uploads)                │ │
│  │  ├─ PDF extraction (PyPDFLoader)                  │ │
│  │  ├─ LLM orchestration (LangChain)                 │ │
│  │  └─ Cache management (Redis)                      │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Google Gemini│    │    OpenAI    │    │    arXiv     │
│     LLM      │    │  Embeddings  │    │     API      │
└──────────────┘    └──────────────┘    └──────────────┘
         ↓                                        ↓
┌──────────────┐                        ┌──────────────┐
│    Redis     │                        │  PostgreSQL  │
│   (Cache)    │                        │  (Database)  │
└──────────────┘                        └──────────────┘
```

---

## Data Models

### PaperAnalysis (Main Container)

```python
class PaperAnalysis(BaseModel):
    paper: PaperMetadata                          # Paper metadata
    at_a_glance: AtAGlanceAnalysis               # Always loaded
    in_depth: Optional[InDepthAnalysis]           # Lazy-loaded
    generated_at: datetime
    schema_version: str = "1.0.0"
    model_tag: str = "gemini-2.0-flash"
```

**Key Points:**
- `at_a_glance` is **always** generated initially
- `in_depth` is **optional** and loaded on-demand
- This enables progressive loading without breaking the API

### AtAGlanceAnalysis (Fast Summary)

```python
class AtAGlanceAnalysis(BaseModel):
    title: str
    authors: List[str]
    affiliations: List[str]
    abstract: str
    keywords: List[str]
    introduction: str          # Brief summary
    related_work: str          # Brief summary
    problem_statement: str     # Brief summary
    methodology: str           # 2-4 sentences
    results: str               # Brief summary
    discussion: str            # Brief summary
    limitations: List[str]     # Bullet points
    future_work: List[str]     # Bullet points
    conclusion: str            # Brief summary
```

- Uses **gemini-2.0-flash-lite** (fast model)
- Only uses first **3,000 characters** of paper
- Generated in **2-3 seconds**

### InDepthAnalysis (Comprehensive)

```python
class InDepthAnalysis(BaseModel):
    introduction: str               # Multi-paragraph detailed analysis
    related_work: str              # Comprehensive review
    problem_statement: str         # Detailed formulation
    methodology: str               # Thorough explanation
    results: str                   # Comprehensive analysis
    discussion: str                # In-depth interpretation
    limitations: str               # Detailed analysis
    conclusion_future_work: str    # Comprehensive conclusion
```

- Uses **gemini-2.0-flash** (full model)
- Uses up to **15,000 characters** of paper
- Each field contains **multiple paragraphs**
- Generated in **10-20 seconds**

---

## Backend Deep Dive

### AnalysisService - Core Engine

#### 1. analyze_paper() - Initial Analysis

**Purpose**: Generate At-a-Glance analysis

**Flow:**
```
1. Fetch Paper
   ├─ If "upload_*" → Load from /uploads directory
   └─ Otherwise → Fetch from arXiv API

2. Check Cache
   ├─ Key: analysis:{paper_hash}:{version}:{model}
   └─ If cached → Return immediately

3. Extract PDF Text
   ├─ PyPDFLoader extracts text
   └─ Build page map (page_num → text)

4. Generate Analysis
   └─ At-a-Glance (first 3,000 chars, fast model)

5. Build PaperAnalysis
   ├─ Set at_a_glance
   └─ Set in_depth = None (lazy)

6. Cache Result
   └─ TTL: 1h (dev) or 24h (prod)

7. Return PaperAnalysis
```

**Code:**
```python
# Generate At-a-Glance analysis
at_a_glance = await self._generate_at_a_glance(full_text)

analysis = PaperAnalysis(
    paper=metadata,
    at_a_glance=at_a_glance,
    in_depth=None,      # Lazy-loaded
    generated_at=datetime.now()
)
```

#### 2. compute_in_depth() - Comprehensive Analysis

**Purpose**: Generate detailed multi-paragraph analysis

**Flow:**
```
1. Get Base Analysis

2. Extract PDF Text (15,000 chars)

3. Generate In-Depth
   ├─ Load in_depth.txt prompt
   ├─ Call LLM (60s timeout, 3 retries)
   └─ Parse JSON response

4. Update Analysis
   └─ Set analysis.in_depth = new analysis

5. Update Cache

6. Return Updated Analysis
```

**Key Differences:**
- Uses **15,000 chars** vs 3,000
- Uses **full model** vs fast model
- **60s timeout** vs 30s
- **3 retries** vs 2

### LLM Retry Logic

All LLM calls use exponential backoff:

```python
async def invoke_llm_with_retry(
    llm, prompt, response_parser, fallback,
    max_retries=2, timeout=30
):
    for attempt in range(max_retries):
        try:
            response = await llm.ainvoke(prompt, timeout=timeout)
            return response_parser(response.content)
        except Exception as e:
            if attempt == max_retries - 1:
                return fallback
            await asyncio.sleep(2 ** attempt)  # Exponential backoff
```

### Caching Strategy

**Cache Key Format:**
```
analysis:{paper_hash}:{schema_version}:{model_tag}
```

**Example:**
```
analysis:a1b2c3d4e5f6g7h8:1.0.0:gemini-2.0-flash
```

**Why Include Version & Model?**
- Bump `PROMPT_VERSION` to invalidate cache after prompt changes
- Changing model automatically invalidates cache
- Prevents serving stale/incompatible data

**TTL:**
- Dev: 1 hour (3600s)
- Prod: 24 hours (86400s)

**Update Strategy:**
- Lazy-loaded features update the entire cached object
- Single source of truth, no partial data

---

## Frontend Deep Dive

### usePaperAnalysis Hook

**State Management:**
```typescript
const [state, setState] = useState<AnalysisState>({
  analysis: null,
  isLoading: false,
  isLoadingKeyInsights: false,
  isLoadingInDepth: false,
  error: null,
});
```

**Initialization:**
```typescript
useEffect(() => {
  const initializeAnalysis = async () => {
    // Try cache first
    const cached = await analysisApi.getPaperAnalysis(paperId, token);
    if (cached) {
      setState({ ...prev, analysis: cached, isLoading: false });
    } else {
      // Generate new
      const analysis = await analysisApi.analyzePaper(paperId, false, token);
      setState({ ...prev, analysis, isLoading: false });
    }
  };
  initializeAnalysis();
}, [paperId]);
```

### Lazy Loading Pattern

**Key Insights:**
```typescript
useEffect(() => {
  if (
    activeTab === "key-insights" &&
    !keyInsightsLoaded &&
    analysis &&
    !analysis.key_insights
  ) {
    setKeyInsightsLoaded(true);
    loadKeyInsights().catch(handleError);
  }
}, [activeTab, keyInsightsLoaded, analysis]);
```

**Flow:**
1. User clicks "Key Insights" tab
2. `activeTab` changes
3. Effect triggers `loadKeyInsights()`
4. Shows loading spinner
5. Updates state when complete
6. Renders panel with data

**Same pattern for In-Depth** - just replace the tab name and method.

### API Client

```typescript
export const analysisApi = {
  async analyzePaper(paperId, forceRefresh, token) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/analysis/${paperId}/analyze?force_refresh=${forceRefresh}`,
      { method: "POST", headers: getAuthHeaders(token) }
    );
    return response.json();
  },

  async computeKeyInsights(paperId, token) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/analysis/${paperId}/key-insights`,
      { method: "POST", headers: getAuthHeaders(token) }
    );
    return response.json();
  },

  async computeInDepth(paperId, token) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/analysis/${paperId}/in-depth`,
      { method: "POST", headers: getAuthHeaders(token) }
    );
    return response.json();
  },
};
```

---

## Feature Implementations

### 1. At-a-Glance

**Backend:**
- Endpoint: `POST /api/v1/analysis/{paper_id}/analyze`
- Model: gemini-2.0-flash-lite (fast)
- Text: First 3,000 characters
- Time: 2-3 seconds
- Prompt: `at_a_glance.txt`

**Frontend:**
- Component: `AtAGlanceCards`
- Layout: Card-based grid
- Displays: All paper sections as brief summaries

### 2. In-Depth

**Backend:**
- Endpoint: `POST /api/v1/analysis/{paper_id}/in-depth`
- Model: gemini-2.0-flash (full)
- Text: First 15,000 characters
- Time: 10-20 seconds
- Prompt: `in_depth.txt`
- Retries: 3 (vs 2 for fast operations)
- Timeout: 60s (vs 30s)

**Frontend:**
- Component: `InDepthPanel`
- Layout: Nested tabs for 8 sections
- Displays: Multi-paragraph analysis per section
- Lazy-loaded when tab clicked

### 3. Chat with Paper

**Backend:**
- Endpoint: `POST /api/v1/papers/{paper_id}/chat`
- Process:
  1. Extract PDF text
  2. Split into chunks
  3. Create embeddings (OpenAI)
  4. Store in FAISS vector DB
  5. On query: similarity search + LLM generation
- Response: Server-Sent Events (streaming)

**Frontend:**
- Component: `ChatPanel`
- Features:
  - Real-time streaming responses
  - Message history
  - Debounced input (300ms)

---

## Request Flow Examples

### Example 1: First-Time Paper Analysis

```
1. User navigates to /papers/2301.07041/analyze

2. Frontend (PaperAnalyzerPage)
   ├─ usePaperAnalysis hook initializes
   ├─ Calls analysisApi.getPaperAnalysis()
   └─ Returns null (not cached)

3. Frontend
   ├─ Calls analysisApi.analyzePaper()
   └─ Shows loading spinner

4. Backend (POST /api/v1/analysis/2301.07041/analyze)
   ├─ Fetch paper from arXiv
   ├─ Extract PDF text
   ├─ Generate At-a-Glance (parallel)
   ├─ Generate Suggested Questions (parallel)
   ├─ Cache result
   └─ Return PaperAnalysis

5. Frontend
   ├─ Receives PaperAnalysis
   ├─ Updates state
   └─ Renders At-a-Glance tab

Total time: ~3-4 seconds
```

### Example 2: Cached Paper Analysis

```
1. User navigates to /papers/2301.07041/analyze

2. Frontend
   └─ Calls analysisApi.getPaperAnalysis()

3. Backend (GET /api/v1/analysis/2301.07041)
   ├─ Check Redis cache
   ├─ Cache hit!
   └─ Return cached PaperAnalysis

4. Frontend
   ├─ Receives PaperAnalysis
   └─ Renders immediately

Total time: <500ms
```

---

## Caching & Performance

### Cache Hit Rate

**Target**: ~70% cache hit rate in production

**Why High Hit Rate?**
- Papers don't change once published
- Same paper analyzed by multiple users
- 24-hour TTL means daily active users hit cache

### Performance Metrics

| Feature | Model | Text Size | Time | Cached Time |
|---------|-------|-----------|------|-------------|
| At-a-Glance | flash-lite | 3K chars | 2-3s | <500ms |
| In-Depth | flash | 15K chars | 10-20s | <500ms |
| Chat | flash | Full | Streaming | N/A |

### Cost Optimization

**Fast Model for At-a-Glance:**
- gemini-2.0-flash-lite is ~60% cheaper
- Good enough for brief summaries
- Saves money on most common operation

**Lazy Loading:**
- Only compute what users actually view (In-Depth is lazy-loaded)
- Many users only need At-a-Glance
- Reduces unnecessary API calls

**Caching:**
- 70% cache hit = 70% fewer LLM calls
- Significant cost savings at scale

### Parallel Processing

**In-Depth Analysis:**
- Uses comprehensive LLM analysis with longer timeout
- Cached after first generation
- Lazy-loaded to avoid blocking initial page load

---

## Error Handling & Resilience

### Multiple Fallback Layers

**1. LLM Retry**
- 2-3 retries with exponential backoff
- Handles transient API failures

**2. JSON Parsing**
- Extracts partial data if JSON is malformed
- Better than complete failure

**3. Fallback Values**
- Returns sensible defaults if all retries fail
- User sees "Unable to extract" instead of error

**4. Graceful Degradation**
- If At-a-Glance fails, still show paper metadata
- If Key Insights fail, show retry button
- Never completely break the UI

### Example: At-a-Glance Failure

```python
try:
    at_a_glance = await invoke_llm_with_retry(
        llm, prompt, parser,
        fallback=AtAGlanceAnalysis(
            title="Unable to extract title",
            authors=["Unknown"],
            abstract="Unable to extract abstract",
            # ... sensible defaults ...
        )
    )
except Exception:
    # Even fallback failed - return minimal analysis
    return minimal_analysis_with_paper_metadata()
```

**Result**: User can still view PDF and try again, rather than seeing a 500 error.

---

## Summary

### Key Takeaways

1. **Progressive Loading**: Start fast (At-a-Glance), load more on demand
2. **Smart Caching**: Redis with versioned keys, 70% hit rate
3. **Parallel Processing**: Use asyncio.gather for concurrent operations
4. **Graceful Degradation**: Always return something useful
5. **Cost Optimization**: Fast model for quick operations, lazy loading for expensive ones

### Architecture Strengths

- **Scalable**: Caching reduces backend load
- **Resilient**: Multiple fallback layers
- **Fast**: Initial load in 2-3 seconds
- **Cost-Effective**: Smart model selection and lazy loading
- **User-Friendly**: Progressive disclosure, clear feedback

### File Locations

**Backend:**
- API: `/backend/app/api/v1/endpoints/analysis.py`
- Service: `/backend/app/services/analysis_service.py`
- Models: `/backend/app/models/analysis.py`
- Prompts: `/backend/app/prompts/analyzer/*.txt`

**Frontend:**
- Page: `/frontend/src/app/papers/[paperId]/analyze/page.tsx`
- Hook: `/frontend/src/hooks/use-paper-analysis.ts`
- API: `/frontend/src/lib/api/analysis.ts`
- Components: `/frontend/src/components/analyzer/*.tsx`

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: Production Ready ✅
