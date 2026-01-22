"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useReviewStore } from "@/lib/stores/review-store";
import { ReviewDisplay } from "@/components/ReviewDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useGetTaskStatus,
  useCancelTask,
  useSaveReview,
  Paper,
  getGetTaskStatusQueryKey,
} from "@/lib/api/generated";
import { Loader2, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";

export default function GeneratedReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const [hasNavigated, setHasNavigated] = useState(false);

  const cancelTask = useCancelTask({
    mutation: {
      onSuccess: () => {
        toast.success("Task cancelled successfully");
        router.push("/review");
      },
      onError: (error) => {
        console.error("Failed to cancel task:", error);
        toast.error("Failed to cancel task");
      },
    },
  });

  const saveReview = useSaveReview({
    mutation: {
      onSuccess: () => {
        toast.success("Review generated and saved successfully!");
      },
      onError: (error) => {
        console.error("Failed to save review:", error);
        toast.error(
          "Review generated but failed to save. You can save it manually."
        );
      },
    },
  });

  // Poll the task status (Orval v8 wraps in { data, status })
  const {
    data: taskData,
    isLoading,
    isError,
    error,
  } = useGetTaskStatus(taskId || "", {
    query: {
      enabled: !!taskId,
      refetchInterval: (query) => {
        const response = query.state.data;
        // Check if it's a success response (status 200) with TaskResponse
        if (response?.status === 200 && "status" in response.data) {
          const taskStatus = response.data.status;
          return taskStatus === "running" || taskStatus === "pending"
            ? 2000
            : false;
        }
        return false;
      },
      queryKey: getGetTaskStatusQueryKey(taskId || ""),
    },
  });

  // Derived state from task data (Orval v8 wraps in { data, status })
  // Check if it's a success response (status 200)
  const task = taskData?.status === 200 ? taskData.data : undefined;
  const isCompleted = task?.status === "completed";
  const isFailed = task?.status === "failed";
  const isRunning = task?.status === "running";
  const isPending = task?.status === "pending";
  const errorMessage = task?.error_message;
  const result = task?.result_data;

  // Handle successful completion
  useEffect(() => {
    if (isCompleted && result && !hasNavigated) {
      console.log("Task completed with result:", result);

      // Store the generated review
      const generatedReview = {
        review: result.review as string,
        citations: (result.citations || []) as Paper[],
        topic: result.topic as string,
      };

      useReviewStore.getState().setGeneratedReview(generatedReview);

      // Auto-save the review
      saveReview.mutate({
        data: {
          title: (result.topic as string) || "Literature Review",
          topic: (result.topic as string) || "Literature Review",
          content: result.review as string,
          citations: JSON.stringify(result.citations || []),
        } as any,
      });

      setHasNavigated(true);
    }
  }, [isCompleted, result, hasNavigated, saveReview]);

  // Handle task failure or missing task ID
  useEffect(() => {
    if (!taskId) {
      toast.error("No task ID provided");
      router.push("/review");
      return;
    }

    if (isFailed && !hasNavigated) {
      console.error("Task failed:", errorMessage);
      toast.error(errorMessage || "Review generation failed");
      setHasNavigated(true);
      // Don't redirect immediately, let user see the error
    }
  }, [taskId, isFailed, errorMessage, router, hasNavigated]);

  const handleCancel = () => {
    if (taskId && (isPending || isRunning)) {
      cancelTask.mutate({ taskId });
    }
  };

  const handleRetry = () => {
    router.push("/review");
  };

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error Loading Task
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {(error as Error)?.message || "Failed to load task status"}
              </AlertDescription>
            </Alert>
            <Button onClick={handleRetry} className="w-full">
              Return to Review Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading Task Status...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Review Generation Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {errorMessage || "An error occurred during review generation"}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={handleRetry} className="flex-1">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted && result) {
    return (
      <ReviewDisplay
        review={result.review as string}
        topic={result.topic as string}
        citations={(result.citations || []) as Paper[]}
        showDownload={true}
      />
    );
  }

  // Show progress for pending/running tasks
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isPending && (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Preparing Review Generation...
              </>
            )}
            {isRunning && (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Literature Review...
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {isRunning
              ? "Generating your review... This may take a few moments."
              : "Preparing to start review generation..."}
          </p>

          <Alert>
            <AlertDescription>
              This may take a few minutes depending on the number of papers and
              complexity of the topic. Please don't close this page.
            </AlertDescription>
          </Alert>

          {(isPending || isRunning) && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={cancelTask.isPending}
              className="w-full"
            >
              {cancelTask.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Cancel Generation
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
