# LitXplore - Project Description and Feature Overview

## What the Project Is
LitXplore is a research exploration platform that helps researchers and academics discover, analyze, and synthesize academic literature. It brings together paper discovery (arXiv search), PDF ingestion, AI-powered analysis, and literature review generation into a single web experience. The system is designed to reduce the time spent on literature reviews while improving coverage, clarity, and citation accuracy.

At a high level, LitXplore:
- Lets users search for papers on arXiv or upload their own PDFs.
- Runs multi-level AI analysis on each paper, including summaries and deeper insights.
- Enables interactive, streaming chat over a paper’s content.
- Generates structured literature reviews across multiple selected papers with citations.
- Saves review history for later access.

## Core User Workflows
1. **Discover papers**
   - Enter a topic to search arXiv and browse results.
   - Upload a PDF to analyze a paper that is not on arXiv.

2. **Analyze papers**
   - Open a paper’s analyzer view for multi-level AI insights.
   - Use chat to ask questions and get streaming answers grounded in the paper.

3. **Generate literature reviews**
   - Select a set of papers (up to 20) and a topic focus.
   - Generate a structured review with citations and references.
   - Save the review to your account.

## Feature Set

### Paper Discovery and Ingestion
- **Topic-based search** via arXiv integration.
- **PDF upload** for non-arXiv papers, with automatic metadata extraction.
- **Unified results display** for both arXiv and uploaded papers.

### Paper Analyzer (Multi-Level)
- **At-a-Glance**: fast summary with key metadata, methodology, and results.
- **In-Depth**: detailed section-by-section analysis (lazy-loaded).
- **Key Insights**: limitations, figures, and future work highlights.
- **Interactive Chat**: context-aware Q&A with streaming responses.

### Literature Review Generator
- **Multi-paper synthesis** with topic-focused analysis.
- **Automatic citation management** and formatted references.
- **Review history** with save and retrieval.
- **PDF export** for generated reviews.

### User Experience and Performance
- **Streaming AI responses** for chat and analysis.
- **Responsive UI** for desktop and mobile.
- **Caching** of analysis and search results to reduce repeat latency.
- **Lazy loading** of heavier analysis sections.

### Security and Reliability
- **Authentication** via Clerk with JWT validation.
- **Rate limiting** and structured error handling.
- **Multi-layer PDF security** (header validation, malicious marker scanning, safe parsing).
- **File size cap** for uploads (15MB) and content validation for meaningful text.

## Architecture and Components

### Frontend (Next.js App Router)
- Search, analyzer, review, and chat pages.
- Streaming UI via Vercel AI SDK.
- State management with Zustand and React Query.
- Component system based on shadcn/ui and Tailwind CSS.

### Backend (FastAPI)
- REST API for papers, analysis, reviews, chat, and uploads.
- Service layer orchestration for analysis and review generation.
- LangChain-based workflows for LLM prompting and synthesis.

### Data and AI Layer
- **PostgreSQL** for users, reviews, and tasks.
- **Redis** for caching and rate limiting.
- **FAISS** vector store for semantic retrieval in chat.
- **Google Gemini (Vertex AI)** for analysis and synthesis.
- **OpenAI embeddings** for semantic search over paper content.

## Key Technical Highlights
- **Async-first architecture** in the backend for responsive API calls.
- **Pydantic validation** to ensure structured model outputs.
- **Document processing pipeline** with safe PDF parsing and content hashing.
- **Versioned cache keys** to allow schema evolution.
- **Separation of concerns** across presentation, application, and data/AI layers.

## Constraints and Limits
- PDF uploads are limited to **15MB** per file.
- Uploaded PDFs are stored by content hash and assigned IDs of the form `upload_<hash>`.
- Multi-paper review generation supports **up to 20 papers** per run.

## Who It’s For
- Researchers and academics who want faster literature reviews.
- Students preparing surveys or research proposals.
- Teams needing repeatable, citation-aware synthesis across papers.

## Where to Look Next
- `ARCHITECTURE_OVERVIEW.md` for system-level design and data flows.
- `docs/README.md` for setup and dev workflows.
- `PDF_UPLOAD_ANALYZER_FEATURE.md` for upload security and analyzer integration details.
