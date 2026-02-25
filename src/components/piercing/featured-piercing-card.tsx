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
  const showImage = Boolean(item.coverSrc) && !imageFailed;

  return (
    <Link
      href={item.href}
      className={cn(
        "block min-h-11 overflow-hidden rounded-2xl border border-border bg-card/40 shadow-sm transition-all hover:bg-accent/40 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label={`${item.title} - ${item.subtitle}`}
    >
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-t-2xl bg-muted/30 ring-1 ring-border/60 dark:bg-muted/20">
        {showImage ? (
          <Image
            fill
            priority={false}
            src={item.coverSrc as string}
            alt={item.imageAlt || item.title}
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 46vw, 400px"
            loading="lazy"
            className="object-cover object-center"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-surface-1 to-surface-2 dark:from-surface-1 dark:to-surface-2" />
        )}
      </div>

      <div className="min-w-0 space-y-1 p-4">
        <p className="text-[11px] font-medium tracking-normal text-foreground/60 dark:text-foreground/70">
          Piercing
        </p>
        <p className="min-w-0 line-clamp-1 font-medium text-foreground">{item.title}</p>
        <p className="min-w-0 line-clamp-1 text-sm text-foreground/70 dark:text-foreground/75">
          {item.subtitle}
        </p>
        <div className="pt-2 text-right">
          <span className="inline-flex min-h-11 items-center rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-foreground transition-[transform,color,background-color] hover:bg-background/90 active:scale-[0.99]">
            İncele
          </span>
        </div>
      </div>
    </Link>
  );
}
