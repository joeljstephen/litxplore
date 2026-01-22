"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PaperGrid } from "@/components/paper-grid";
import { SearchInput } from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getSearchPapersQueryKey,
  Paper,
  useGenerateReview,
  useSearchPapers,
} from "@/lib/api/generated";
import { useReviewStore } from "@/lib/stores/review-store";
import { PDFUpload } from "@/components/pdf-upload";
import { BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { MAX_PAPERS_FOR_REVIEW } from "@/lib/constants";

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [selectedPapers, setSelectedPapers] = useState<Set<string>>(new Set());
  const [displayedPapers, setDisplayedPapers] = useState<Paper[]>([]);

  // React Query hooks (Orval v8 wraps in { data, status })
  const generateReview = useGenerateReview({
    mutation: {
      onSuccess: (taskResponse) => {
        console.log("Review generation task started!", taskResponse);
        // Navigate to the generated review page with task ID (check for success response)
        if (taskResponse.status === 200) {
          router.push(`/generated-review?taskId=${taskResponse.data.id}`);
        }
      },
      onError: (error) => {
        console.error("Failed to start review generation:", error);
        toast.error("Failed to start review generation. Please try again.");
      },
    },
  });

  // Initialize selected papers from URL params
  useEffect(() => {
    const paperIds = searchParams.get("papers")?.split(",") || [];
    if (paperIds.length > 0) {
      setSelectedPapers(new Set(paperIds));
    }
  }, [searchParams]);

  // Fetch initial papers when topic is entered
  const { data: suggestedPapers, isLoading: isLoadingSuggested } =
    useSearchPapers(
      { query: topic },
      {
        query: {
          queryKey: getSearchPapersQueryKey({ query: topic }),
          enabled: !!topic,
        },
      }
    );

  // Merge search results with displayed papers (Orval v8 wraps in { data, status })
  useEffect(() => {
    if (suggestedPapers?.status === 200) {
      setDisplayedPapers(suggestedPapers.data);
    }
  }, [suggestedPapers]);

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newTopic = formData.get("topic") as string;
    setTopic(newTopic);
  };

  const handlePaperSelect = (paperId: string, selected: boolean) => {
    if (selected && selectedPapers.size >= MAX_PAPERS_FOR_REVIEW) {
      toast.error(
        `You can only select up to ${MAX_PAPERS_FOR_REVIEW} papers for review`
      );
      return;
    }

    const newSelected = new Set(selectedPapers);
    if (selected) {
      newSelected.add(paperId);
    } else {
      newSelected.delete(paperId);
    }
    setSelectedPapers(newSelected);
  };

  const handleAddPaper = (paper: Paper) => {
    if (selectedPapers.size >= MAX_PAPERS_FOR_REVIEW) {
      toast.error(
        `You can only select up to ${MAX_PAPERS_FOR_REVIEW} papers for review`
      );
      return;
    }

    setDisplayedPapers((prev) => {
      if (!prev.find((p) => p.id === paper.id)) {
        const newPapers = [...prev, paper];
        setSelectedPapers((prevSelected) => {
          const newSelected = new Set(prevSelected);
          newSelected.add(paper.id);
          return newSelected;
        });
        return newPapers;
      }
      return prev;
    });
  };

  const handleGenerateReview = () => {
    if (!selectedPapers.size) {
      toast.error("Please select at least one paper");
      return;
    }

    // Clear any existing generated review to prevent caching issues
    useReviewStore.getState().clearGeneratedReview();

    generateReview.mutate({
      data: {
        paper_ids: Array.from(selectedPapers),
        topic: topic || "Literature Review",
        max_papers: 10,
      },
    });
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)] flex flex-col relative">
        <div className="flex items-center gap-3 mb-10">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Generate Review
          </h1>
        </div>
        <form onSubmit={handleTopicSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold">1. Enter Research Topic</h2>
          <div className="flex gap-4">
            <Input
              name="topic"
              placeholder="Enter your research topic..."
              defaultValue={topic}
              required
            />
            <Button type="submit" disabled={isLoadingSuggested}>
              {isLoadingSuggested ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Find Papers"
              )}
            </Button>
          </div>
        </form>

        {topic && (
          <div className="space-y-4 flex-1 flex flex-col">
            <h2 className="text-2xl mt-5 font-bold">2. Select Papers</h2>

            <div className="flex flex-col gap-4">
              {/* Search Additional Papers */}
              <SearchInput
                onPaperSelect={handlePaperSelect}
                selectedPapers={selectedPapers}
                onAddPaper={handleAddPaper}
                currentPaperCount={selectedPapers.size}
              />

              {/* Add PDF Upload */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Upload PDF</h3>
                <PDFUpload
                  onPaperAdd={handleAddPaper}
                  currentPaperCount={selectedPapers.size}
                />
              </div>
            </div>

            {/* Selected Papers Count */}
            <div className="text-sm text-muted-foreground">
              {selectedPapers.size} of {MAX_PAPERS_FOR_REVIEW} papers selected
            </div>

            {/* Papers Grid with flex-1 to take remaining space */}
            <div className="flex-1 overflow-auto">
              <PaperGrid
                papers={displayedPapers}
                selectedPapers={selectedPapers}
                onPaperSelect={handlePaperSelect}
                isLoading={isLoadingSuggested}
                enableSelection={true}
              />
            </div>
          </div>
        )}

        {/* Floating Generate Review Button - always visible at bottom right */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleGenerateReview}
            disabled={generateReview.isPending || selectedPapers.size === 0}
            className="shadow-lg"
          >
            {generateReview.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Review...
              </>
            ) : selectedPapers.size > 0 ? (
              `Generate Review (${selectedPapers.size} papers)`
            ) : (
              "Generate Review"
            )}
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ReviewPageContent />
    </Suspense>
  );
}
