# LitXplore - Frontend Architecture

**Version:** 2.0  
**Last Updated:** March 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Routing & Pages](#routing--pages)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [Data Fetching](#data-fetching)
7. [Authentication](#authentication)
8. [Styling & UI](#styling--ui)
9. [Performance Optimizations](#performance-optimizations)
10. [Build & Deployment](#build--deployment)

---

## Overview

The LitXplore frontend is built with **Next.js 15** using the App Router architecture. It provides a modern, responsive, and performant user interface for academic research exploration.

### Key Characteristics

- **Server & Client Components**: Hybrid rendering for optimal performance
- **Type-Safe**: Full TypeScript coverage with Orval-generated API types
- **Responsive**: Mobile-first design with adaptive layouts
- **Dark Theme**: Amber/gold accent palette on dark backgrounds
- **Progressive**: Code splitting and lazy loading

### Technology Stack

```
Next.js 15 (App Router, Standalone Output)
    ↓
React 18 (Server & Client Components)
    ↓
TypeScript (Type Safety)
    ↓
Tailwind CSS + shadcn/ui (Styling)
    ↓
React Query (Server State) + Zustand (Client State)
    ↓
Clerk (Authentication)
    ↓
Vercel AI SDK 5 (Streaming)
```

---

## Project Structure

```
frontend/
├── public/                           # Static assets
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (Clerk, QueryProvider, Theme)
│   │   ├── page.tsx                  # Home / landing page
│   │   ├── globals.css               # Global styles & CSS variables
│   │   │
│   │   ├── api/                      # Next.js API routes
│   │   │   └── chat/route.ts         # Chat proxy (SSE → Vercel AI SDK)
│   │   │
│   │   ├── search/page.tsx           # Paper search + PDF upload
│   │   ├── review/page.tsx           # Review generation wizard
│   │   ├── generated-review/
│   │   │   ├── page.tsx              # Generated review display
│   │   │   └── [id]/page.tsx         # Review by task ID
│   │   ├── reviews/[id]/page.tsx     # Saved review viewer
│   │   ├── history/page.tsx          # Review history
│   │   │
│   │   ├── papers/[paperId]/
│   │   │   ├── analyze/page.tsx      # Paper analyzer (multi-tab)
│   │   │   └── chat/page.tsx         # Standalone paper chat
│   │   │
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │
│   │   ├── analyzer/                 # Paper analyzer components
│   │   │   ├── paper-header.tsx      # Paper metadata header
│   │   │   ├── at-a-glance-cards.tsx # Summary cards
│   │   │   ├── in-depth-panel.tsx    # Detailed analysis panel
│   │   │   ├── chat-panel.tsx        # Embedded chat
│   │   │   ├── lazy-components.tsx   # Lazy-loaded wrappers
│   │   │   ├── skeletons.tsx         # Loading skeletons
│   │   │   └── error-fallback.tsx    # Error UI
│   │   │
│   │   ├── auth/                     # Auth components
│   │   ├── header.tsx                # Global navigation
│   │   ├── search-hero.tsx           # Search page hero
│   │   ├── search-input.tsx          # Debounced search
│   │   ├── paper-grid.tsx            # Paper result cards
│   │   ├── pdf-upload.tsx            # PDF upload with validation
│   │   ├── pdf-viewer.tsx            # PDF display
│   │   ├── chat-interface.tsx        # Streaming chat UI
│   │   └── ReviewDisplay.tsx         # Markdown review renderer
│   │
│   ├── hooks/
│   │   ├── use-paper-analysis.ts     # Analysis state management
│   │   ├── use-prefetch-analysis.ts  # Hover prefetch
│   │   ├── use-debounce.ts           # Generic debounce
│   │   ├── use-debounced-input.ts    # Input-specific debounce
│   │   ├── use-chat-history.ts       # Chat history
│   │   ├── use-toast.ts              # Toast hook
│   │   ├── use-toast-notification.ts # Toast notifications
│   │   └── use-mobile.ts             # Responsive breakpoints
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── axios-instance.ts     # Axios with Clerk token interceptor
│   │   │   ├── analysis.ts           # Analysis API calls (direct)
│   │   │   └── generated/            # Orval auto-generated (gitignored)
│   │   │       ├── papers/papers.ts
│   │   │       ├── review/review.ts
│   │   │       ├── tasks/tasks.ts
│   │   │       ├── documents/documents.ts
│   │   │       ├── users/users.ts
│   │   │       ├── history/history.ts
│   │   │       ├── models/           # TypeScript interfaces
│   │   │       └── index.ts          # Barrel exports
│   │   │
│   │   ├── stores/
│   │   │   └── review-store.ts       # Zustand (sessionStorage persist)
│   │   │
│   │   ├── types/                    # TypeScript type definitions
│   │   └── utils.ts
│   │
│   └── middleware.ts                 # Clerk auth middleware
│
├── scripts/
│   ├── generate-api-index.js         # Barrel file generator
│   └── watch-backend.js              # Backend schema watcher
│
├── next.config.js                    # Standalone output, CSP headers
├── tailwind.config.ts                # Theme configuration
├── orval.config.js                   # OpenAPI → React Query codegen
├── components.json                   # shadcn/ui config
└── package.json
```

---

## Routing & Pages

### App Router Structure

LitXplore uses Next.js 15 App Router with file-system based routing.

#### Route Map

```
/                              → Home page (landing)
/search                        → Paper search + PDF upload
/papers/[paperId]/analyze      → Paper analyzer (multi-tab)
/papers/[paperId]/chat         → Standalone paper chat
/review                        → Review generation wizard
/generated-review              → Generated review (from store)
/generated-review/[id]         → Generated review by task ID
/reviews/[id]                  → Saved review viewer
/history                       → User's saved reviews
/sign-in                       → Authentication (Clerk)
/sign-up                       → Registration (Clerk)
```

### Page Components

#### 1. Home Page (`/app/page.tsx`)

**Purpose**: Landing page with hero section and feature highlights

**Features**:

- Animated hero section with Framer Motion
- Bento grid feature cards
- Call-to-action buttons
- Dark theme with amber/gold accents

#### 2. Search Page (`/app/search/page.tsx`)

**Purpose**: Search arXiv and upload PDFs

**Features**:

- Search input with debouncing
- Real-time results grid
- PDF upload section
- Loading states
- Error handling

**State Management**:

```tsx
const [query, setQuery] = useState("");
const [papers, setPapers] = useState<Paper[]>([]);
const [isLoading, setIsLoading] = useState(false);

const debouncedQuery = useDebounce(query, 300);

useEffect(() => {
  if (debouncedQuery) {
    searchPapers(debouncedQuery);
  }
}, [debouncedQuery]);
```

#### 3. Paper Analyzer (`/app/papers/[paperId]/analyze/page.tsx`)

**Purpose**: Multi-level paper analysis interface

**Features**:

- Tabbed interface (At-a-Glance, In-Depth, Key Insights, Chat)
- Lazy loading for In-Depth and Key Insights
- Real-time chat with streaming
- PDF viewer (optional)
- Skeleton loaders

**Layout**:

```tsx
<div className="grid lg:grid-cols-2 gap-4">
  {/* Left: Analysis Tabs */}
  <Tabs defaultValue="at-a-glance">
    <AtAGlancePanel />
    <InDepthPanel />
    <KeyInsightsPanel />
    <ChatPanel />
  </Tabs>

  {/* Right: PDF Viewer */}
  <PDFViewer url={pdfUrl} />
</div>
```

#### 4. Review Generation (`/app/review/page.tsx`)

**Purpose**: Multi-paper literature review generation

**Workflow**:

1. Select papers from search or upload
2. Enter research topic
3. Configure settings (max papers, depth)
4. Generate review (async task)
5. Display and save results

**State Flow**:

```tsx
const { selectedPapers, addPaper, removePaper } = useReviewStore();
const [topic, setTopic] = useState("");
const [isGenerating, setIsGenerating] = useState(false);

const handleGenerate = async () => {
  const review = await generateReview({
    paper_ids: selectedPapers.map((p) => p.id),
    topic,
    max_papers: 10,
  });

  navigate("/generated-review");
};
```

#### 5. Generated Review (`/app/generated-review/page.tsx`)

**Purpose**: Display generated literature review

**Features**:

- Markdown rendering with syntax highlighting
- Citation management
- Export to PDF
- Save to history
- Share functionality

**Rendering**:

```tsx
<ReactMarkdown
  remarkPlugins={[remarkGfm, remarkToc]}
  rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]}
>
  {reviewContent}
</ReactMarkdown>
```

#### 6. History Page (`/app/history/page.tsx`)

**Purpose**: User's saved reviews

**Features**:

- List of saved reviews
- Search and filter
- Delete reviews
- View/edit functionality
- Pagination

---

## Component Architecture

### Component Hierarchy

```
App (layout.tsx)
├── ClerkProvider (appearance themed for dark mode)
│   └── ThemeProvider (shadcn, default: dark)
│       ├── Header (global navigation + UserButton)
│       └── QueryProvider (TanStack Query + Clerk token wiring)
│           ├── Main Content (page component)
│           └── Toaster (sonner)
```

### Component Categories

#### 1. UI Components (`/components/ui`)

**shadcn/ui Components**: 50+ reusable components

**Key Components**:

- `Button` - Various button styles and sizes
- `Card` - Container for content
- `Dialog` - Modal dialogs
- `Tabs` - Tabbed interfaces
- `Input` - Form inputs
- `Select` - Dropdown selects
- `Toast` - Notifications
- `Skeleton` - Loading placeholders
- `Badge` - Status indicators
- `ScrollArea` - Custom scrollbars

**Usage Example**:

```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Paper Analysis</CardTitle>
  </CardHeader>
  <CardContent>{/* Content */}</CardContent>
  <CardFooter>
    <Button>Analyze</Button>
  </CardFooter>
</Card>;
```

#### 2. Analyzer Components (`/components/analyzer`)

- **`paper-header.tsx`** — Paper metadata (title, authors, year, source)
- **`at-a-glance-cards.tsx`** — Summary cards for abstract, methodology, results, limitations
- **`in-depth-panel.tsx`** — Detailed section-by-section analysis (lazy-loaded)
- **`chat-panel.tsx`** — Embedded chat using Vercel AI SDK streaming
- **`lazy-components.tsx`** — `React.lazy` wrappers for code-split analyzer panels
- **`skeletons.tsx`** — Loading skeleton placeholders
- **`error-fallback.tsx`** — Error boundary UI

#### 3. Feature Components

- **`search-input.tsx`** — Debounced search input with `useDebouncedInput` hook
- **`search-hero.tsx`** — Search page hero section
- **`paper-grid.tsx`** — Paper result cards grid
- **`pdf-upload.tsx`** — PDF upload with file validation (PDF only, 15MB max)
- **`pdf-viewer.tsx`** — PDF display component
- **`chat-interface.tsx`** — Streaming chat UI using Vercel AI SDK
- **`ReviewDisplay.tsx`** — Markdown review renderer with `react-markdown`
- **`header.tsx`** — Global navigation with Clerk `UserButton`

---

## State Management

### 1. Server State (React Query)

**Configuration** (`lib/query-provider.tsx`):

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (isAuthError(error)) return false; // Don't retry 401/403
        return failureCount < 3;
      },
    },
    mutations: {
      retry: (failureCount, error) => {
        if (isAuthError(error)) return false;
        return failureCount < 2;
      },
    },
  },
});
```

The `QueryProvider` also wires the Clerk `getToken` function into the axios instance via `setTokenGetter()`, so all API requests automatically include the Bearer token.

Most API hooks are **auto-generated by Orval** from the OpenAPI spec — no manual `useQuery`/`useMutation` calls needed for standard CRUD endpoints.

### 2. Client State (Zustand)

**Review Store** (`lib/stores/review-store.ts`):

Single Zustand store with `sessionStorage` persistence for passing generated reviews between pages:

```tsx
interface ReviewState {
  generatedReview: {
    review: string;
    citations: Paper[];
    topic: string;
  } | null;
  setGeneratedReview: (review: ReviewState["generatedReview"]) => void;
  clearGeneratedReview: () => void;
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set) => ({
      generatedReview: null,
      setGeneratedReview: (review) => set({ generatedReview: review }),
      clearGeneratedReview: () => set({ generatedReview: null }),
    }),
    {
      name: "review-storage",
      storage: /* custom sessionStorage wrapper with SSR safety */,
    }
  )
);
```

### 3. URL State (Next.js Router)

```tsx
// Read from URL
const searchParams = useSearchParams();
const query = searchParams.get("query");

// Update URL
const router = useRouter();
router.push(`/search?query=${encodeURIComponent(query)}`);
```

---

## Data Fetching

### Auto-Generated API Client

**Orval Configuration** (`orval.config.js`):

```javascript
module.exports = {
  litxplore: {
    input: { target: "./openapi.json" },
    output: {
      mode: "tags-split",
      target: "./src/lib/api/generated",
      schemas: "./src/lib/api/generated/models",
      client: "react-query",
      mock: false,
      clean: true,
      override: {
        mutator: {
          path: "./src/lib/api/axios-instance.ts",
          name: "customInstance",
        },
        query: { useQuery: true, useMutation: true, signal: true },
      },
    },
    hooks: {
      afterAllFilesWrite: {
        command: "node scripts/generate-api-index.js",
      },
    },
  },
};
```

**Generated Files** (gitignored):

```
src/lib/api/generated/
├── papers/papers.ts           # Paper search/upload hooks
├── review/review.ts           # Review generation hooks
├── tasks/tasks.ts             # Task polling hooks
├── documents/documents.ts     # Document generation hooks
├── users/users.ts             # User profile hooks
├── history/history.ts         # History hooks
├── models/                    # TypeScript interfaces
└── index.ts                   # Barrel exports
```

**Manual API client** (`lib/api/analysis.ts`): Analysis endpoints use a direct axios-based client instead of Orval, since analysis requires custom caching and force-refresh logic.

### Custom Hooks

**`usePaperAnalysis(paperId)`** — Core analysis hook:

- Manages `analysis`, `isLoading`, `isLoadingInDepth`, `error` state
- Auto-initializes on mount: tries cached analysis first, then generates new
- `analyze(forceRefresh?)` — Trigger At-a-Glance analysis
- `loadInDepth()` — Lazy-load In-Depth analysis on demand
- Uses Clerk `getToken()` for authenticated API calls

**`usePrefetchAnalysis()`** — Hover prefetch:

- `prefetch(paperId)` — Checks cache via `getPaperAnalysis`, triggers background `analyzePaper` if not cached
- Errors silently ignored (non-blocking)

**Other hooks**:

- `useDebouncedInput(value, delay)` — Input-specific debounce
- `useDebounce(value, delay)` — Generic debounce
- `useChatHistory()` — Chat message history
- `useToast()` / `useToastNotification()` — Toast notifications
- `useMobile()` — Responsive breakpoint detection

---

## Authentication

### Clerk Integration

**Setup** (`app/layout.tsx`):

```tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

**Protected Routes** (`middleware.ts`):

```tsx
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/search",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
```

**Token Flow**:

1. `QueryProvider` calls `setTokenGetter(getToken)` from Clerk's `useAuth()`
2. Axios request interceptor calls `tokenGetter()` before each request
3. Bearer token is automatically added to `Authorization` header
4. Backend verifies JWT via Clerk JWKS

**Chat API Route** (`app/api/chat/route.ts`):

- Proxies chat requests to the backend SSE endpoint
- Converts backend SSE format to Vercel AI SDK streaming format
- Passes through the `Authorization` header from the client

---

## Styling & UI

### Tailwind CSS

**Configuration** (`tailwind.config.ts`):

- `darkMode: ["class"]` — Class-based dark mode
- Colors mapped from CSS variables (`hsl(var(--primary))`, etc.)
- Custom `bg-grid`, `bg-grid-small`, `bg-dot` utilities for background patterns
- Plugins: `tailwindcss-animate`, `@tailwindcss/container-queries`
- Accordion animations for Radix UI components

### Design System

**Color Palette** (Amber/Gold theme):

- Primary: `#F59E0B` (Amber) — CTAs, active states
- Secondary/Accent: `#FBBF24` (Golden Yellow) — hover backgrounds
- Background: `#191A1A` — dark main canvas
- Card/Muted: `#282A2E` — elevated surfaces
- Foreground: `#E0E0E0` — primary text
- Muted Foreground: `#A0A0A0` — secondary text
- Border: `#3A3F44` — dividers, input borders
- Destructive: `#EF4444` — error states
- Success: `#34D399` — positive feedback

**Typography**:

- Font Family: DM Sans (loaded via Google Fonts)
- Scale: Tailwind's default scale
- Headings: Bold, large sizes with tight tracking
- Body: Regular weight, relaxed line height

**Spacing**:

- Consistent spacing scale (4px base)
- Generous whitespace
- Card-based layouts

**Components**:

- Rounded corners (md: 0.375rem)
- Subtle shadows
- Smooth transitions
- Hover effects

---

## Performance Optimizations

### 1. Code Splitting

- `lazy-components.tsx` wraps analyzer panels with `React.lazy()` for on-demand loading
- Next.js automatic route-based code splitting

### 2. Lazy Loading

- In-Depth analysis is only fetched when the user clicks the tab
- `usePaperAnalysis` manages progressive loading (At-a-Glance first, In-Depth on demand)

### 3. Debouncing

- `useDebouncedInput` hook prevents excessive API calls during search typing

### 4. Prefetching

- `usePrefetchAnalysis` triggers background analysis on paper card hover
- Reduces perceived latency when user navigates to analyzer

### 5. Standalone Output

- `next.config.js` uses `output: "standalone"` for minimal production builds
- Reduces deployment size by excluding unused `node_modules`

---

## Build & Deployment

### Build Configuration

**`next.config.js`**:

- `output: "standalone"` — Minimal self-contained build
- `reactStrictMode: true`
- `images.domains: ["arxiv.org"]`
- `webpack: config.cache = false` — Disabled webpack cache
- Custom `Content-Security-Policy` headers (allows Clerk, backend API, arXiv)

### Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000      # Backend API base URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx  # Clerk publishable key
CLERK_SECRET_KEY=sk_test_xxx                   # Clerk secret (server-side)
```

### Build Process

```bash
npm install              # Install dependencies
npm run generate:api     # Generate API client from OpenAPI spec (Orval)
npm run build            # Build for production (standalone output)
npm start                # Start production server
```

### Deployment (Vercel)

- **Platform**: Vercel (optimized for Next.js)
- **Auto-deployment**: Push to `main` → Production, PRs → Preview
- **Environment variables**: Set via Vercel dashboard
- **Edge features**: Global CDN, image optimization, edge middleware

---

**End of Frontend Architecture Document**
