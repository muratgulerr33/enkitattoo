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
  const [imageLoaded, setImageLoaded] = useState(false);
  const src = item.coverSrc ?? "/piercing-hero/cover.webp";
  const showImage = Boolean(src) && !imageFailed;

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
        <div
          className={cn(
            "pointer-events-none absolute inset-0 transition-opacity duration-300",
            imageLoaded ? "opacity-0" : "opacity-100",
          )}
          aria-hidden
        >
          <div className="absolute inset-0 animate-pulse bg-muted/40 dark:bg-muted/20" />
          <div className="absolute inset-0 bg-gradient-to-br from-surface-1/80 via-surface-1/40 to-surface-2/85 dark:from-surface-1/70 dark:via-surface-2/35 dark:to-surface-2/80" />
          <div className="absolute inset-0 scale-110 bg-gradient-to-br from-white/18 via-transparent to-black/12 blur-xl dark:from-white/10 dark:to-black/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(255,255,255,0.22),transparent_46%),radial-gradient(circle_at_82%_88%,rgba(255,255,255,0.08),transparent_52%)] mix-blend-overlay opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-black/5 to-transparent dark:from-black/30 dark:via-black/10 dark:to-transparent" />
        </div>

        {showImage ? (
          <Image
            fill
            priority={false}
            src={src}
            alt={item.imageAlt || item.title}
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 46vw, 400px"
            loading="lazy"
            className={cn(
              "object-cover object-center transition-opacity duration-300 ease-out",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoadingComplete={() => setImageLoaded(true)}
            onError={() => {
              setImageFailed(true);
              setImageLoaded(false);
            }}
          />
        ) : null}

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent dark:from-black/25 dark:to-transparent"
          aria-hidden
        />
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
