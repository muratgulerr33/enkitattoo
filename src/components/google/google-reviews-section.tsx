"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink } from "@/components/ui/external-link";
import { Skeleton } from "@/components/ui/skeleton";

const GOOGLE_ALL_REVIEWS_URL = "https://maps.app.goo.gl/XfsNo8TymLtVkrFt5";
const GOOGLE_WRITE_REVIEW_URL = "https://g.page/r/CU7OmlK8UUDAEBM/review";
const GOOGLE_LOCKUP_ASSET_SRC = "/brand/google-maps-lockup.svg";
const GOOGLE_PIN_ASSET_SRC = "/brand/google-maps-pin.webp";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  relativeTime: string;
  text: string;
  originalLanguage: string;
  avatarSrc?: string | null;
};

const REVIEW_META: Array<Pick<Review, "id" | "rating" | "avatarSrc">> = [
  {
    id: "r01",
    rating: 5,
    avatarSrc: "/reviews/avatars/r01.webp",
  },
  {
    id: "r02",
    rating: 5,
  },
  {
    id: "r03",
    rating: 5,
  },
  {
    id: "r04",
    rating: 5,
    avatarSrc: "/reviews/avatars/r04.webp",
  },
  {
    id: "r05",
    rating: 5,
  },
  {
    id: "r06",
    rating: 5,
  },
  {
    id: "r07",
    rating: 5,
    avatarSrc: "/reviews/avatars/r07.webp",
  },
];

const DETAIL_PREVIEW_LIMIT = 170;

function reviewHasMore(text: string): boolean {
  return text.length > DETAIL_PREVIEW_LIMIT;
}

function reviewInitial(authorName: string): string {
  return authorName.trim()[0]?.toUpperCase() ?? "?";
}

function ReviewAvatar({ review, avatarAlt }: { review: Review; avatarAlt: string }) {
  const avatarSrc = review.avatarSrc?.trim();

  return (
    <div
      className={`size-10 shrink-0 overflow-hidden rounded-full bg-muted ${
        avatarSrc ? "ring-1 ring-border" : ""
      }`}
    >
      {avatarSrc ? (
        <Image
          src={avatarSrc}
          width={40}
          height={40}
          className="h-full w-full object-cover"
          alt={avatarAlt}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-medium text-foreground/80">
          {reviewInitial(review.authorName)}
        </div>
      )}
    </div>
  );
}

export function GoogleReviewsSection() {
  const t = useTranslations();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showBrand, setShowBrand] = useState(false);
  const [activeReview, setActiveReview] = useState<Review | null>(null);
  const reviews = useMemo<Review[]>(
    () =>
      REVIEW_META.map((reviewMeta) => ({
        ...reviewMeta,
        authorName: t(`reviews.items.${reviewMeta.id}.authorName`),
        relativeTime: t(`reviews.items.${reviewMeta.id}.relativeTime`),
        text: t(`reviews.items.${reviewMeta.id}.text`),
        originalLanguage: t(`reviews.items.${reviewMeta.id}.originalLanguage`),
      })),
    [t],
  );

  useEffect(() => {
    if (isReady) {
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setIsReady(true);
      }
    }, 3000);

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              const inView = entries.some((entry) => entry.isIntersecting);
              if (inView) {
                setIsReady(true);
              }
            },
            { rootMargin: "180px 0px" },
          )
        : null;

    if (observer && sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      observer?.disconnect();
    };
  }, [isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowBrand(true);
    }, 1400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isReady]);

  return (
    <section
      ref={sectionRef}
      data-testid="google-reviews"
      aria-labelledby="google-reviews-title"
      className="space-y-0 pb-2 sm:pb-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center">
          <h2 id="google-reviews-title" className="t-h4 text-foreground">
            {t("googleReviews.title")}
          </h2>
          <span className="ml-3 inline-flex shrink-0 items-end gap-1.5">
            <Image
              src={GOOGLE_PIN_ASSET_SRC}
              width={14}
              height={14}
              alt=""
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 object-contain sm:h-[13px] sm:w-[13px]"
            />
            <Image
              src={GOOGLE_LOCKUP_ASSET_SRC}
              width={80}
              height={16}
              alt=""
              aria-hidden="true"
              className="h-3 w-auto shrink-0 object-contain opacity-90 sm:h-[13px]"
            />
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
          <ExternalLink href={GOOGLE_ALL_REVIEWS_URL}>
            {t("googleReviews.viewAll")}
          </ExternalLink>
        </Button>
        <Button asChild size="sm" className="w-full sm:w-auto">
          <ExternalLink href={GOOGLE_WRITE_REVIEW_URL}>
            {t("googleReviews.writeReview")}
          </ExternalLink>
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {isReady
          ? reviews.map((review) => (
              <article
                key={review.id}
                className="relative rounded-xl border border-border bg-surface-2 p-4 shadow-soft"
              >
                <div className="flex items-start gap-3">
                  <ReviewAvatar
                    review={review}
                    avatarAlt={t("googleReviews.avatarAlt", { name: review.authorName })}
                  />
                  <div className="min-w-0 flex-1 pb-8">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="t-body font-medium text-foreground">{review.authorName}</h3>
                        <span className="text-xs text-muted-foreground">{review.relativeTime}</span>
                        <p className="mt-0.5 text-[11px] text-muted-foreground/90">
                          {t("googleReviews.originalLanguageLabel", { language: review.originalLanguage })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-0.5" aria-label={`${review.rating} / 5`}>
                      {Array.from({ length: 5 }).map((_, index) => {
                        const filled = index < review.rating;
                        return (
                          <Star
                            key={`${review.id}-star-${index}`}
                            className={`size-3.5 ${filled ? "fill-current text-yellow-400" : "text-muted-foreground/35"}`}
                            aria-hidden="true"
                          />
                        );
                      })}
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{review.text}</p>
                    {reviewHasMore(review.text) ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-auto p-0 text-sm text-foreground hover:bg-transparent"
                        onClick={() => setActiveReview(review)}
                      >
                        {t("googleReviews.readMore")}
                      </Button>
                    ) : null}
                  </div>
                </div>
                {showBrand ? (
                  <ExternalLink
                    href={GOOGLE_ALL_REVIEWS_URL}
                    aria-label={t("googleReviews.openOnMaps")}
                    className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-1 opacity-90 shadow-soft"
                  >
                    <Image
                      src={GOOGLE_PIN_ASSET_SRC}
                      width={16}
                      height={16}
                      alt=""
                      aria-hidden="true"
                      className="mr-1 size-4 object-contain"
                    />
                    <Image
                      src={GOOGLE_LOCKUP_ASSET_SRC}
                      width={56}
                      height={18}
                      alt=""
                      aria-hidden="true"
                      className="h-[18px] w-[56px] object-contain"
                    />
                  </ExternalLink>
                ) : null}
              </article>
            ))
          : Array.from({ length: 5 }).map((_, index) => (
              <article
                key={`google-review-skeleton-${index}`}
                className="rounded-xl border border-border bg-surface-2 p-4 shadow-soft"
                aria-hidden="true"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="size-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3 bg-muted" />
                    <Skeleton className="h-3 w-20 bg-muted" />
                    <Skeleton className="h-3 w-full bg-muted" />
                    <Skeleton className="h-3 w-11/12 bg-muted" />
                    <Skeleton className="h-3 w-2/3 bg-muted" />
                  </div>
                </div>
              </article>
            ))}
      </div>

      <Dialog open={Boolean(activeReview)} onOpenChange={(open) => (!open ? setActiveReview(null) : null)}>
        <DialogContent
          showCloseButton={false}
          className="data-[state=open]:animate-none data-[state=closed]:animate-none !top-auto !right-0 !bottom-0 !left-0 inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto w-full !max-w-none sm:!max-w-none !translate-x-0 !translate-y-0 data-[state=open]:!translate-y-0 data-[state=closed]:!translate-y-full !transition-[transform] data-[state=open]:duration-[392ms] data-[state=closed]:duration-[308ms] data-[state=open]:ease-out data-[state=closed]:ease-in transform-gpu [will-change:transform] motion-reduce:transform-none motion-reduce:transition-none gap-0 rounded-t-2xl rounded-b-none border border-border bg-background p-0"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>
              {t("googleReviews.reviewDialogTitle", { name: activeReview?.authorName ?? "" })}
            </DialogTitle>
            <DialogDescription>{t("googleReviews.reviewDialogDescription")}</DialogDescription>
          </DialogHeader>
          {activeReview ? (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-border p-4">
                <div className="flex min-w-0 items-start gap-3">
                  <ReviewAvatar
                    review={activeReview}
                    avatarAlt={t("googleReviews.avatarAlt", { name: activeReview.authorName })}
                  />
                  <div className="min-w-0">
                    <h3 className="t-body font-medium text-foreground">{activeReview.authorName}</h3>
                    <div className="mt-1 flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const filled = index < activeReview.rating;
                        return (
                          <Star
                            key={`${activeReview.id}-detail-star-${index}`}
                            className={`size-3.5 ${filled ? "fill-current text-yellow-400" : "text-muted-foreground/35"}`}
                            aria-hidden="true"
                          />
                        );
                      })}
                      <span className="ml-2 text-xs text-muted-foreground">{activeReview.relativeTime}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground/90">
                      {t("googleReviews.originalLanguageLabel", { language: activeReview.originalLanguage })}
                    </p>
                  </div>
                </div>
                <DialogClose asChild>
                  <Button variant="ghost" size="sm">
                    {t("googleReviews.close")}
                  </Button>
                </DialogClose>
              </div>
              <div className="max-h-[56vh] overflow-y-auto p-4">
                <p className="text-sm text-muted-foreground">{activeReview.text}</p>
              </div>
              <div className="border-t border-border p-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                    <ExternalLink href={GOOGLE_ALL_REVIEWS_URL}>
                      {t("googleReviews.viewAll")}
                    </ExternalLink>
                  </Button>
                  <Button asChild size="sm" className="w-full sm:w-auto">
                    <ExternalLink href={GOOGLE_WRITE_REVIEW_URL}>
                      {t("googleReviews.writeReview")}
                    </ExternalLink>
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
