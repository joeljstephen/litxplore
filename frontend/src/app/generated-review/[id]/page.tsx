"use client";

import { useGetReviewHistory, Paper } from "@/lib/api/generated";
import { ReviewDisplay } from "@/components/ReviewDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { useParams } from "next/navigation";

export default function ReviewPage() {
  const params = useParams<{ id: string }>();
  const reviewId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: reviews, isLoading } = useGetReviewHistory();

  const review = useMemo(() => {
    if (!reviewId) return null;
    // Orval v8 wraps in { data, status }
    if (reviews?.status !== 200) return null;
    return reviews.data.find((r) => r.id === parseInt(reviewId, 10));
  }, [reviews, reviewId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-12 w-2/3 mb-6" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Review not found
        </div>
      </div>
    );
  }

  // Parse citations string to Paper array
  let parsedCitations: Paper[] = [];
  if (review.citations) {
    try {
      parsedCitations = JSON.parse(review.citations as string);
    } catch (err) {
      console.error("Failed to parse citations:", err);
    }
  }

  return (
    <ReviewDisplay
      review={review.content as string}
      topic={review.topic as string}
      citations={parsedCitations}
      showDownload={true}
    />
  );
}
