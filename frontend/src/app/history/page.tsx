"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetReviewHistory,
  useDeleteReview,
  Paper,
  getGetReviewHistoryQueryKey,
} from "@/lib/api/generated";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isToday } from "date-fns";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ReviewDisplay } from "@/components/ReviewDisplay";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { titleCase } from "@/lib/utils";
import { Trash2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface Review {
  id: number;
  title: string;
  topic: string;
  content: string;
  citations?: string;
  created_at: string;
  updated_at: string;
}

const DeleteButton = ({
  reviewId,
  setDeletingReviewId,
}: {
  reviewId: number;
  setDeletingReviewId: (id: number | null) => void;
}) => {
  // Function to handle delete button click with event stopping
  const handleClick = (e: React.MouseEvent) => {
    // These are crucial to prevent event bubbling
    e.preventDefault();
    e.stopPropagation();
    setDeletingReviewId(reviewId);
    return false;
  };

  return (
    <div
      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
      onClick={handleClick}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-destructive/20 hover:text-destructive"
        onClick={handleClick}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
};

export default function HistoryPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [parsedCitations, setParsedCitations] = useState<Paper[]>([]);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  // React Query hooks (Orval v8 wraps in { data, status })
  const {
    data: reviewsData,
    isLoading: loading,
    error,
  } = useGetReviewHistory({
    query: {
      enabled: isLoaded && isSignedIn,
      queryKey: getGetReviewHistoryQueryKey(),
    },
  });

  const reviews =
    reviewsData?.status === 200
      ? (reviewsData.data as unknown as Review[])
      : [];
  const deleteReview = useDeleteReview({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetReviewHistoryQueryKey() });
        setDeletingReviewId(null);
      },
      onError: (err) => {
        console.error("Failed to delete review:", err);
      },
    },
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Parse citations when selectedReview changes
  useEffect(() => {
    if (selectedReview?.citations) {
      try {
        // Parse the citations string to an array of Paper objects
        const citations = JSON.parse(selectedReview.citations) as Paper[];
        setParsedCitations(citations);
      } catch (err) {
        console.error("Failed to parse citations:", err);
        setParsedCitations([]);
      }
    } else {
      setParsedCitations([]);
    }
  }, [selectedReview]);

  // Redirect to sign-in if not authenticated
  if (isLoaded && !isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  const handleReviewClick = (review: Review) => {
    setSelectedReview(review);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingReviewId) return;
    deleteReview.mutate({ reviewId: deletingReviewId });
  };

  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <History className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Review History
          </h1>
        </div>
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {[1, 2, 3].map((i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="h-[350px]">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded">
          {error instanceof Error
            ? error.message
            : "Unable to find or load generated literature reviews"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <History className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Review History
        </h1>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-20 border border-border rounded-lg bg-card">
          <div className="mx-auto rounded-full bg-primary/10 p-4 inline-block mb-4">
            <History className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-lg">
            No reviews found. Generate your first literature review to see it
            here!
          </p>
          <Button
            variant="gradient"
            className="mt-4"
            onClick={() => router.push("/review")}
          >
            Create Your First Review
          </Button>
        </div>
      ) : (
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card
                className="flex flex-col cursor-pointer group hover:border-primary/50 transition-all duration-200 h-[350px] relative"
                onClick={() => handleReviewClick(review)}
              >
                <DeleteButton
                  reviewId={review.id}
                  setDeletingReviewId={setDeletingReviewId}
                />

                <CardHeader>
                  <CardTitle className="line-clamp-2">{titleCase(review.title)}</CardTitle>
                  <CardDescription>
                    {isToday(new Date(review.created_at))
                      ? "Today"
                      : format(new Date(review.created_at), "d MMM yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary">Topic</h4>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {titleCase(review.topic)}
                    </p>
                    <h4 className="font-semibold text-primary">Review</h4>
                    <div className="text-sm text-foreground prose-sm line-clamp-6">
                      <ReactMarkdown>{review.content}</ReactMarkdown>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl w-full h-[90vh] overflow-auto p-8">
          {selectedReview && (
            <>
              <DialogTitle className="text-2xl font-bold text-foreground">
                {titleCase(selectedReview.title)}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Created{" "}
                {isToday(new Date(selectedReview.created_at))
                  ? "Today"
                  : format(new Date(selectedReview.created_at), "d MMM yyyy")}
              </DialogDescription>
              <ReviewDisplay
                review={selectedReview.content}
                topic={selectedReview.topic}
                citations={parsedCitations}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deletingReviewId !== null}
        onOpenChange={() => setDeletingReviewId(null)}
      >
        <AlertDialogContent className="border-destructive/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
