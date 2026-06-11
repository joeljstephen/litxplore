"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function AtAGlanceSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-6">
      <div className="rounded-2xl border bg-card p-6 @md:p-8 space-y-6">
        <Skeleton className="h-8 w-4/5" />
        <div className="grid gap-5 @md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 @md:p-8 space-y-4">
        <Skeleton className="h-3 w-16" />
        <div className="space-y-2 max-w-prose">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-5 @md:p-6 space-y-3">
            <Skeleton className="h-4 w-28" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
