"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { FeaturedPiercingItem } from "@/lib/piercing/featured-piercing";
import { cn } from "@/lib/utils";

type FeaturedPiercingCardProps = {
  item: FeaturedPiercingItem;
  className?: string;
};

export function FeaturedPiercingCard({ item, className }: FeaturedPiercingCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageFit = item.imageFit ?? "contain";
  const showImage = Boolean(item.imageSrc) && !imageFailed;

  return (
    <Link
      href={item.href}
      className={cn(
        "block min-h-11 overflow-hidden rounded-2xl border border-border bg-card/40 shadow-sm transition-all hover:bg-accent/40 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label={`${item.title} - ${item.subtitle}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted/30 ring-1 ring-border/60 dark:bg-muted/20">
        {showImage ? (
          <>
            <Image
              fill
              src={item.imageSrc as string}
              alt={item.imageAlt || item.title}
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 50vw, 33vw"
              className={cn(imageFit === "cover" ? "object-cover" : "object-contain p-6")}
              onError={() => setImageFailed(true)}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5" />
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-surface-1 to-surface-2 dark:from-surface-1 dark:to-surface-2" />
        )}
      </div>

      <div className="space-y-1 p-4">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Piercing</p>
        <p className="line-clamp-1 font-medium text-foreground">{item.title}</p>
        <p className="line-clamp-1 text-sm text-muted-foreground">{item.subtitle}</p>
        <div className="pt-2 text-right">
          <span className="inline-flex rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-background/90">
            İncele
          </span>
        </div>
      </div>
    </Link>
  );
}
