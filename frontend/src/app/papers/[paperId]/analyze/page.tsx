"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { usePaperAnalysis } from "@/hooks/use-paper-analysis";
import { useToastNotification } from "@/hooks/use-toast-notification";
import { useMobile } from "@/hooks/use-mobile";
import { AtAGlanceCards } from "@/components/analyzer/at-a-glance-cards";
import { InDepthPanel } from "@/components/analyzer/in-depth-panel";
import { ChatPanel } from "@/components/analyzer/chat-panel";
import { ErrorFallback } from "@/components/analyzer/error-fallback";
import { AtAGlanceSkeleton } from "@/components/analyzer/skeletons";
import { PDFViewer } from "@/components/pdf-viewer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import {
  Loader2,
  AlertCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";

const STORAGE_KEY = "analyzer-pdf-visible";
const STORAGE_RATIO_KEY = "analyzer-split-ratio";

export default function PaperAnalyzerPage() {
  const params = useParams();
  const paperId = params.paperId as string;
  const isMobile = useMobile();
  const toast = useToastNotification();
  const { isLoaded, isSignedIn } = useAuth();

  const {
    analysis,
    isLoading,
    isLoadingInDepth,
    error,
    loadInDepth,
    analyze,
  } = usePaperAnalysis(paperId);

  // ALL hooks must be called before any conditional returns
  const [showPdf, setShowPdf] = useState(true);
  const [splitRatio, setSplitRatio] = useState(60);
  const [activeTab, setActiveTab] = useState("at-a-glance");
  const [inDepthLoaded, setInDepthLoaded] = useState(false);
  const [inDepthError, setInDepthError] = useState<string | null>(null);

  // Persist PDF visibility to localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setShowPdf(JSON.parse(stored));
    } else {
      setShowPdf(!isMobile);
    }
  }, [isMobile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(showPdf));
  }, [showPdf]);

  // Persist split ratio to localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_RATIO_KEY);
    if (stored !== null) {
      setSplitRatio(JSON.parse(stored));
    }
  }, []);


  // Load In-Depth Analysis when tab is opened
  useEffect(() => {
    if (
      activeTab === "in-depth" &&
      !inDepthLoaded &&
      analysis &&
      !analysis.in_depth &&
      !inDepthError
    ) {
      setInDepthLoaded(true);
      loadInDepth().catch((err) => {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Failed to load in-depth analysis";
        setInDepthError(errorMsg);
        toast.error("In-Depth Analysis Failed", errorMsg);
      });
    }
  }, [activeTab, inDepthLoaded, analysis, loadInDepth, inDepthError, toast]);

  const handleRetryInDepth = () => {
    setInDepthError(null);
    setInDepthLoaded(false);
  };

  const handleRetryAnalysis = () => {
    analyze(true).catch((err) => {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to analyze paper";
      toast.error("Analysis Failed", errorMsg);
    });
  };

  const togglePdfView = () => {
    setShowPdf(!showPdf);
  };

  // Render analysis content
  const renderAnalysisContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Paper Title and PDF Toggle */}
      <div className="border-b bg-background px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-foreground truncate">
            {analysis?.paper.title}
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            {analysis?.paper.authors.slice(0, 3).join(", ")}
            {analysis?.paper.authors.length > 3 &&
              ` +${analysis.paper.authors.length - 3}`}
            {analysis?.paper.year && ` • ${analysis.paper.year}`}
          </p>
        </div>
        {isMobile ? (
          // Mobile: Show "View PDF" button that opens in new tab
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(analysis?.paper.url, "_blank")}
            className="gap-2 flex-shrink-0"
            title="View PDF in new tab"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View PDF</span>
          </Button>
        ) : (
          // Desktop: Show toggle button
          <Button
            variant="outline"
            size="sm"
            onClick={togglePdfView}
            className="gap-2 flex-shrink-0"
            title={showPdf ? "Hide PDF" : "Show PDF"}
          >
            {showPdf ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span>Hide PDF</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Show PDF</span>
              </>
            )}
          </Button>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList
          className="w-full justify-start rounded-none border-b bg-muted/50 p-0 h-12"
          role="tablist"
        >
          <TabsTrigger
            value="at-a-glance"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-600 dark:data-[state=active]:text-secondary-foreground text-base px-6 h-full hover:text-secondary-foreground"
            role="tab"
            aria-selected={activeTab === "at-a-glance"}
          >
            At a Glance
          </TabsTrigger>
          <TabsTrigger
            value="in-depth"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-600 dark:data-[state=active]:text-secondary-foreground text-base px-6 h-full hover:text-secondary-foreground"
            role="tab"
            aria-selected={activeTab === "in-depth"}
          >
            In Depth
            {isLoadingInDepth && (
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-600 dark:data-[state=active]:text-secondary-foreground text-base px-6 h-full hover:text-secondary-foreground"
            role="tab"
            aria-selected={activeTab === "chat"}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
        </TabsList>

        {/* Content area - with padding for non-chat tabs */}
        <TabsContent
          value="at-a-glance"
          className="flex-1 overflow-hidden mt-0"
        >
          <div className="h-full overflow-y-auto p-4">
            {isLoading ? (
              <AtAGlanceSkeleton />
            ) : (
              <AtAGlanceCards analysis={analysis.at_a_glance} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="in-depth" className="flex-1 overflow-hidden mt-0">
          <div className="h-full overflow-y-auto p-4">
            {inDepthError ? (
              <ErrorFallback
                title="Failed to Load In-Depth Analysis"
                message={inDepthError}
                onRetry={handleRetryInDepth}
                showRetry={true}
              />
            ) : isLoadingInDepth ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Loading comprehensive analysis...
                  </p>
                </div>
              </div>
            ) : analysis.in_depth ? (
              <InDepthPanel analysis={analysis.in_depth} />
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No in-depth analysis available
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Chat tab - no padding, fills full height */}
        <TabsContent
          value="chat"
          className={cn(
            "flex-1 overflow-hidden mt-0",
            activeTab !== "chat" && "hidden"
          )}
          forceMount
        >
          {/* Keep ChatPanel mounted to preserve state */}
          <div className="h-full">
            <ChatPanel paperId={paperId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Show loading while auth is initializing
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in Required</h2>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to analyze papers.
          </p>
          <SignInButton mode="modal">
            <Button size="lg" className="w-full">
              Sign In
            </Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Analyzing paper...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
          <div className="flex gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground">
                Failed to Load Analysis
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {error || "Unable to analyze this paper"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
            <Button className="flex-1" onClick={handleRetryAnalysis}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {isMobile ? (
        // Mobile layout - only show analysis content, no PDF viewer
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-hidden h-full">
            {renderAnalysisContent()}
          </div>
        </div>
      ) : (
        // Desktop layout - resizable panels
        <ResizablePanelGroup
          key={showPdf ? "with-pdf" : "without-pdf"}
          direction="horizontal"
          className="flex-1 overflow-hidden"
          onLayout={(sizes) => {
            if (sizes[0]) {
              localStorage.setItem(STORAGE_RATIO_KEY, JSON.stringify(sizes[0]));
            }
          }}
        >
          {showPdf && (
            <>
              <ResizablePanel
                defaultSize={splitRatio}
                minSize={20}
                maxSize={80}
                className="overflow-hidden"
              >
                <div className="h-full overflow-hidden">
                  <PDFViewer url={analysis.paper.url} />
                </div>
              </ResizablePanel>
              <ResizableHandle
                withHandle
                className="hover:bg-primary/10 transition-colors"
              >
                <div className="flex h-full w-6 items-center justify-center">
                  <div className="flex gap-0.5">
                    <ChevronLeft className="h-3 w-3 text-muted-foreground" />
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </ResizableHandle>
            </>
          )}

          <ResizablePanel
            className="overflow-hidden"
            defaultSize={showPdf ? 100 - splitRatio : 100}
            minSize={20}
          >
            {renderAnalysisContent()}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
}
