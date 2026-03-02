"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

type HubRelatedCarouselLazyProps = {
  currentSlug: string;
};

const LazyHubRelatedCarousel = dynamic(
  () => import("./hub-related-carousel").then((mod) => mod.HubRelatedCarousel),
  { ssr: false, loading: () => <HubRelatedCarouselPlaceholder /> }
);

function HubRelatedCarouselPlaceholder() {
  return (
    <section className="space-y-3" aria-hidden>
      <div className="space-y-2">
        <div className="h-6 w-52 animate-pulse rounded-md bg-muted/60" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-muted/45" />
      </div>
      <div className="w-full overflow-hidden px-4">
        <div className="flex gap-4">
          <div className="h-[230px] w-[min(88vw,28rem)] shrink-0 animate-pulse rounded-2xl border border-border bg-surface-2" />
          <div className="hidden h-[230px] w-[min(46vw,26rem)] shrink-0 animate-pulse rounded-2xl border border-border bg-surface-2 sm:block" />
          <div className="hidden h-[230px] w-[min(31vw,22rem)] shrink-0 animate-pulse rounded-2xl border border-border bg-surface-2 lg:block" />
        </div>
      </div>
    </section>
  );
}

export function HubRelatedCarouselLazy({ currentSlug }: HubRelatedCarouselLazyProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(() =>
    typeof window !== "undefined" ? typeof IntersectionObserver === "undefined" : false
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof window === "undefined") return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              if (!entries.some((entry) => entry.isIntersecting)) return;
              setShouldMount(true);
            },
            { root: null, rootMargin: "800px 0px", threshold: 0.01 }
          )
        : null;
    if (!observer) return;

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sentinelRef} className="mt-8">
      {shouldMount ? (
        <LazyHubRelatedCarousel currentSlug={currentSlug} />
      ) : (
        <HubRelatedCarouselPlaceholder />
      )}
    </div>
  );
}
