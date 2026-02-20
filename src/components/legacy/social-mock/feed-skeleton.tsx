"use client";

import { Skeleton } from "@/components/ui/skeleton";

function SkeletonCard() {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-surface-2 p-4 shadow-sm">
      <header className="flex items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </header>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="flex gap-2 border-t border-border pt-1">
        <Skeleton className="size-9 rounded-md" />
        <Skeleton className="size-9 rounded-md" />
        <Skeleton className="size-9 rounded-md" />
      </div>
    </article>
  );
}

export function FeedSkeleton() {
  return (
    <ul className="list-none space-y-6 p-0 m-0">
      <li>
        <SkeletonCard />
      </li>
      <li>
        <SkeletonCard />
      </li>
      <li>
        <SkeletonCard />
      </li>
    </ul>
  );
}
