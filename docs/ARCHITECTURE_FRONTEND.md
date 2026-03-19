# LitXplore - Frontend Architecture

**Version:** 1.0  
**Last Updated:** November 2025

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

The LitXplore frontend is built with **Next.js 13+** using the App Router architecture. It provides a modern, responsive, and performant user interface for academic research exploration.

### Key Characteristics

- **Server & Client Components**: Hybrid rendering for optimal performance
- **Type-Safe**: Full TypeScript coverage
- **Responsive**: Mobile-first design with adaptive layouts
- **Accessible**: WCAG compliant with ARIA labels
- **Progressive**: Code splitting and lazy loading

### Technology Stack

```
Next.js 13+ (App Router)
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
Vercel AI SDK (Streaming)
```

---

## Project Structure

```
frontend/
├── public/                           # Static assets
│   ├── images/
│   └── favicon.ico
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   ├── globals.css               # Global styles
│   │   │
│   │   ├── api/                      # API routes
│   │   │   └── v1/
│   │   │       └── subscriptions/    # Subscription endpoints
│   │   │
│   │   ├── search/                   # Search page
│   │   │   └── page.tsx
│   │   │
│   │   ├── papers/                   # Paper routes
│   │   │   └── [paperId]/
│   │   │       └── analyze/          # Paper analyzer
│   │   │           └── page.tsx
│   │   │
│   │   ├── review/                   # Review generation
│   │   │   └── page.tsx
│   │   │
│   │   ├── generated-review/         # Generated review display
│   │   │   └── page.tsx
│   │   │
│   │   ├── history/                  # Review history
│   │   │   └── page.tsx
│   │   │
│   │   ├── sign-in/                  # Auth pages
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx
│   │   │
│   │   └── sign-up/
│   │       └── [[...sign-up]]/
│   │           └── page.tsx
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # shadcn/ui components (50+ components)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   │
│   │   ├── analyzer/                 # Paper analyzer components
│   │   │   ├── analysis-skeleton.tsx # Loading states
│   │   │   ├── at-a-glance-panel.tsx # Summary panel
│   │   │   ├── in-depth-panel.tsx    # Detailed analysis
│   │   │   ├── key-insights-panel.tsx# Insights panel
│   │   │   ├── questions-panel.tsx   # Suggested questions
│   │   │   └── chat-panel.tsx        # Chat interface
│   │   │
│   │   ├── auth/                     # Auth components
│   │   │   └── user-button.tsx
│   │   │
│   │   ├── header.tsx                # Global header
│   │   ├── paper-grid.tsx            # Paper search results
│   │   ├── search-input.tsx          # Search interface
│   │   ├── pdf-upload.tsx            # PDF upload component
│   │   ├── pdf-viewer.tsx            # PDF display
│   │   ├── chat-interface.tsx        # Chat UI
│   │   ├── ReviewDisplay.tsx         # Review display
│   │   └── LoadingSpinner.tsx        # Loading indicator
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-paper-analysis.ts     # Analysis data fetching
│   │   ├── use-prefetch-analysis.ts  # Prefetch on hover
│   │   ├── use-debounced-input.ts    # Input debouncing
│   │   ├── use-chat-history.ts       # Chat history management
│   │   ├── use-toast.ts              # Toast notifications
│   │   └── use-mobile.ts             # Responsive breakpoints
│   │
│   ├── lib/                          # Utilities and libraries
│   │   ├── api/                      # API client
│   │   │   ├── axios-instance.ts     # Configured axios
│   │   │   ├── analysis.ts           # Analysis API calls
│   │   │   └── generated/            # Auto-generated from OpenAPI
│   │   │       ├── analysis/
│   │   │       ├── chat/
│   │   │       ├── documents/
│   │   │       ├── history/
│   │   │       ├── papers/
│   │   │       └── models/
│   │   │
│   │   ├── stores/                   # Zustand stores
│   │   │   └── review-store.ts       # Review state management
│   │   │
│   │   ├── types/                    # TypeScript types
│   │   │   ├── paper.ts
│   │   │   ├── analysis.ts
│   │   │   └── review.ts
│   │   │
│   │   └── utils.ts                  # Utility functions
│   │
│   └── middleware.ts                 # Next.js middleware (auth)
│
├── scripts/                          # Build scripts
│   ├── generate-api-index.js         # API client generation
│   └── watch-backend.js              # Dev mode watcher
│
├── .env.local                        # Environment variables
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
├── orval.config.js                   # API generation config
└── package.json                      # Dependencies
```

---

## Routing & Pages

### App Router Structure

LitXplore uses Next.js 13+ App Router with file-system based routing.

#### Route Map

```
/                           → Home page (landing)
/search                     → Paper search interface
/papers/[paperId]/analyze   → Paper analyzer (multi-tab)
/review                     → Review generation wizard
/generated-review           → Display generated review
/history                    → User's saved reviews
/sign-in                    → Authentication (Clerk)
/sign-up                    → Registration (Clerk)
```

### Page Components

#### 1. Home Page (`/app/page.tsx`)

**Purpose**: Landing page with hero section and feature highlights

**Features**:

- Hero with animated background (Three.js)
- Feature cards
- Call-to-action buttons
- Responsive layout

**Code Structure**:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </main>
  );
}
```

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
App
├── Layout (Root)
│   ├── Header
│   │   ├── Navigation
│   │   ├── UserButton (Clerk)
│   │   └── ThemeToggle
│   │
│   └── Main Content
│       └── Page Component
│
└── Providers
    ├── ClerkProvider
    ├── QueryClientProvider (React Query)
    └── ThemeProvider
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

**AtAGlancePanel** (`at-a-glance-panel.tsx`):

```tsx
export function AtAGlancePanel({ analysis }: Props) {
  return (
    <div className="space-y-4">
      <Section title="Abstract">
        <p>{analysis.abstract}</p>
      </Section>

      <Section title="Methodology">
        <p>{analysis.methodology}</p>
      </Section>

      <Section title="Key Results">
        <p>{analysis.results}</p>
      </Section>

      <Section title="Limitations">
        <ul>
          {analysis.limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
```

**InDepthPanel** (`in-depth-panel.tsx`):

```tsx
export function InDepthPanel({ paperId }: Props) {
  const { data, isLoading, error } = useInDepthAnalysis(paperId);

  if (isLoading) return <AnalysisSkeleton />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <Tabs defaultValue="introduction">
      <TabsList>
        <TabsTrigger value="introduction">Introduction</TabsTrigger>
        <TabsTrigger value="methodology">Methodology</TabsTrigger>
        <TabsTrigger value="results">Results</TabsTrigger>
        {/* More tabs */}
      </TabsList>

      {/* Tab content */}
    </Tabs>
  );
}
```

**ChatPanel** (`chat-panel.tsx`):

```tsx
export function ChatPanel({ paperId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { sendMessage, isLoading } = usePaperChat(paperId);

  const handleSend = async () => {
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    const response = await sendMessage(input, messages);
    setMessages((prev) => [...prev, response]);
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}
      </ScrollArea>

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={isLoading}
      />
    </div>
  );
}
```

#### 3. Feature Components

**SearchInput** (`search-input.tsx`):

```tsx
export function SearchInput() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedInput(query, 300);

  const { data: papers, isLoading } = useQuery({
    queryKey: ["papers", debouncedQuery],
    queryFn: () => searchPapers(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  return (
    <div>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search papers..."
      />

      {isLoading && <LoadingSpinner />}
      {papers && <PaperGrid papers={papers} />}
    </div>
  );
}
```

**PDFUpload** (`pdf-upload.tsx`):

```tsx
export function PDFUpload() {
  const [file, setFile] = useState<File | null>(null);
  const uploadMutation = useMutation({
    mutationFn: uploadPaper,
    onSuccess: (data) => {
      router.push(`/papers/${data.paper_id}/analyze`);
    },
  });

  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <Button onClick={handleUpload} disabled={!file}>
        Upload
      </Button>
    </div>
  );
}
```

---

## State Management

### 1. Server State (React Query)

**Configuration** (`app/layout.tsx`):

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
```

**Usage Examples**:

```tsx
// Fetch paper analysis
const { data, isLoading, error } = useQuery({
  queryKey: ["analysis", paperId],
  queryFn: () => analyzePaper(paperId),
});

// Search papers
const { data: papers } = useQuery({
  queryKey: ["papers", query],
  queryFn: () => searchPapers(query),
  enabled: query.length > 0,
});

// Infinite scroll
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ["papers", "infinite"],
  queryFn: ({ pageParam = 0 }) => fetchPapers(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

**Mutations**:

```tsx
const generateReviewMutation = useMutation({
  mutationFn: generateReview,
  onSuccess: (data) => {
    queryClient.invalidateQueries(["reviews"]);
    toast.success("Review generated!");
  },
  onError: (error) => {
    toast.error(error.message);
  },
});
```

### 2. Client State (Zustand)

**Review Store** (`lib/stores/review-store.ts`):

```tsx
interface ReviewState {
  generatedReview: {
    review: string;
    citations: Paper[];
    topic: string;
  } | null;
  setGeneratedReview: (review: any) => void;
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
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
```

**Usage**:

```tsx
const { generatedReview, setGeneratedReview } = useReviewStore();

// Set review after generation
setGeneratedReview({
  review: reviewText,
  citations: papers,
  topic: "Transformers",
});

// Access review
if (generatedReview) {
  console.log(generatedReview.review);
}
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
    input: "./openapi.json",
    output: {
      mode: "tags-split",
      target: "./src/lib/api/generated",
      client: "react-query",
      mock: false,
    },
  },
};
```

**Generated Files**:

```
src/lib/api/generated/
├── analysis/analysis.ts       # Analysis endpoints
├── chat/chat.ts               # Chat endpoints
├── papers/papers.ts           # Paper endpoints
├── review/review.ts           # Review endpoints
└── models/                    # TypeScript types
    ├── paper.ts
    ├── paperAnalysis.ts
    └── ...
```

**Usage**:

```tsx
import { useAnalyzePaper } from "@/lib/api/generated/analysis/analysis";

const { data, isLoading } = useAnalyzePaper(paperId);
```

### Custom Hooks

**usePaperAnalysis** (`hooks/use-paper-analysis.ts`):

```tsx
export function usePaperAnalysis(paperId: string) {
  const [atAGlance, setAtAGlance] = useState(null);
  const [inDepth, setInDepth] = useState(null);
  const [keyInsights, setKeyInsights] = useState(null);

  const loadAtAGlance = async () => {
    const data = await analyzePaper(paperId);
    setAtAGlance(data.at_a_glance);
  };

  const loadInDepth = async () => {
    const data = await getInDepthAnalysis(paperId);
    setInDepth(data);
  };

  const loadKeyInsights = async () => {
    const data = await getKeyInsights(paperId);
    setKeyInsights(data);
  };

  return {
    atAGlance,
    inDepth,
    keyInsights,
    loadAtAGlance,
    loadInDepth,
    loadKeyInsights,
  };
}
```

**usePrefetchAnalysis** (`hooks/use-prefetch-analysis.ts`):

```tsx
export function usePrefetchAnalysis() {
  const queryClient = useQueryClient();

  const prefetch = (paperId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["analysis", paperId],
      queryFn: () => analyzePaper(paperId),
    });
  };

  return { prefetch };
}

// Usage
const { prefetch } = usePrefetchAnalysis();

<Card onMouseEnter={() => prefetch(paper.id)}>{/* Paper card */}</Card>;
```

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
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/search", "/papers/(.*)/analyze"],
  ignoredRoutes: ["/api/webhook"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

**Using Auth**:

```tsx
import { useAuth, useUser } from "@clerk/nextjs";

export function Component() {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  if (!isSignedIn) {
    return <SignInButton />;
  }

  return <div>Welcome {user?.firstName}!</div>;
}
```

**API Authentication**:

```tsx
import { getAuth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId, getToken } = getAuth(request);

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const token = await getToken();

  // Call backend with token
  const response = await fetch("https://api.litxplore.com/api/v1/analysis", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response;
}
```

---

## Styling & UI

### Tailwind CSS

**Configuration** (`tailwind.config.js`):

```javascript
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // More color definitions
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
};
```

### Design System

**Color Palette**:

- Primary: Orange/Yellow accent
- Background: Dark theme by default
- Text: High contrast for readability
- Borders: Subtle gray tones

**Typography**:

- Font Family: System fonts for performance
- Scale: Tailwind's default scale
- Headings: Bold, large sizes
- Body: Regular weight, readable size

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

**Dynamic Imports**:

```tsx
import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("@/components/pdf-viewer"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const ChatPanel = dynamic(() => import("@/components/analyzer/chat-panel"), {
  loading: () => <Skeleton />,
});
```

### 2. Image Optimization

```tsx
import Image from "next/image";

<Image
  src="/hero-bg.jpg"
  alt="Hero background"
  width={1920}
  height={1080}
  priority
  placeholder="blur"
/>;
```

### 3. Lazy Loading

```tsx
// Lazy load In-Depth analysis
const loadInDepth = async () => {
  if (!inDepth) {
    const data = await getInDepthAnalysis(paperId);
    setInDepth(data);
  }
};

// Only load when tab is clicked
<TabsTrigger onClick={loadInDepth}>In Depth</TabsTrigger>;
```

### 4. Debouncing

```tsx
const debouncedSearch = useDebouncedInput(searchQuery, 300);

useEffect(() => {
  if (debouncedSearch) {
    performSearch(debouncedSearch);
  }
}, [debouncedSearch]);
```

### 5. Memoization

```tsx
const expensiveCalculation = useMemo(() => {
  return papers.reduce((acc, paper) => {
    // Complex calculation
    return acc + paper.citationCount;
  }, 0);
}, [papers]);

const MemoizedComponent = React.memo(PaperCard);
```

### 6. Virtualization

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

const rowVirtualizer = useVirtualizer({
  count: papers.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 150,
  overscan: 5,
});
```

---

## Build & Deployment

### Build Configuration

**next.config.js**:

```javascript
module.exports = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    domains: ["arxiv.org"],
  },
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};
```

### Environment Variables

**.env.local**:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

### Build Process

```bash
# Install dependencies
npm install

# Generate API client from OpenAPI spec
npm run generate:api

# Build for production
npm run build

# Start production server
npm start
```

### Deployment (Vercel)

**Configuration**:

1. Connect GitHub repository
2. Set environment variables
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

**Auto-deployment**:

- Push to `main` → Production
- Push to other branches → Preview

---

**End of Frontend Architecture Document**
