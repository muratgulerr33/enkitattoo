"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { IconButton } from "@/components/ui/icon-button";
import { mainHubs, specialHubs } from "@/lib/hub/hubs.v1";

type HubRelatedCarouselProps = {
  currentSlug: string;
};

const RELATED_LIMIT = 8;

export function HubRelatedCarousel({ currentSlug }: HubRelatedCarouselProps) {
  const t = useTranslations();
  const railRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const relatedHubs = useMemo(
    () =>
      [...mainHubs, ...specialHubs]
        .filter((hub) => hub.slug !== currentSlug && hub.slug !== "dovme-egitimi")
        .slice(0, RELATED_LIMIT),
    [currentSlug]
  );

  const [mountedIndexes, setMountedIndexes] = useState<Set<number>>(() => new Set([0, 1, 2]));
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const addMountedIndexes = useCallback((indexes: number[]) => {
    setMountedIndexes((current) => {
      const next = new Set(current);
      let changed = false;
      indexes.forEach((index) => {
        if (index < 0 || index >= relatedHubs.length || next.has(index)) return;
        next.add(index);
        changed = true;
      });
      return changed ? next : current;
    });
  }, [relatedHubs.length]);

  const syncScrollState = useCallback(() => {
    const rail = railRef.current;
    if (!rail) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }

    const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
    const threshold = 2;
    setCanScrollPrev(rail.scrollLeft > threshold);
    setCanScrollNext(rail.scrollLeft < maxScrollLeft - threshold);
  }, []);

  const scheduleSyncScrollState = useCallback(() => {
    if (animationFrameRef.current !== null) return;
    animationFrameRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = null;
      syncScrollState();
    });
  }, [syncScrollState]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    scheduleSyncScrollState();
    rail.addEventListener("scroll", scheduleSyncScrollState, { passive: true });
    window.addEventListener("resize", scheduleSyncScrollState);

    const resizeObserver = new ResizeObserver(scheduleSyncScrollState);
    resizeObserver.observe(rail);
    const track = rail.firstElementChild;
    if (track instanceof HTMLElement) {
      resizeObserver.observe(track);
    }

    return () => {
      rail.removeEventListener("scroll", scheduleSyncScrollState);
      window.removeEventListener("resize", scheduleSyncScrollState);
      resizeObserver.disconnect();
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [scheduleSyncScrollState]);

  const scrollByStep = useCallback((direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const step = Math.max(Math.round(rail.clientWidth * 0.85), 1);
    rail.scrollBy({ left: step * direction, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || typeof window === "undefined") return;

    const slides = Array.from(
      rail.querySelectorAll<HTMLLIElement>("[data-related-slide-index]")
    );
    if (!slides.length) return;

    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number(entry.target.getAttribute("data-related-slide-index"));
          if (Number.isNaN(index)) return;
          addMountedIndexes([index - 2, index - 1, index, index + 1, index + 2]);
        });
      },
      { root: rail, rootMargin: "0px 180px", threshold: 0.01 }
    );

    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [addMountedIndexes, relatedHubs.length]);

  if (!relatedHubs.length) {
    return null;
  }

  return (
    <section aria-labelledby="hub-related-heading" className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id="hub-related-heading" className="t-h4 text-foreground">
            {t("pages.kesfetHub.relatedTitle")}
          </h2>
          <p className="t-caption mt-1 text-muted-foreground">
            {t("pages.kesfetHub.relatedDescription")}
          </p>
        </div>
        <div className="hidden items-center gap-2 xl:flex">
          <IconButton
            ariaLabel={t("pages.kesfetHub.previous")}
            variant="solid"
            size="md"
            className="border border-border bg-background/85 shadow-sm backdrop-blur-sm"
            onClick={() => scrollByStep(-1)}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </IconButton>
          <IconButton
            ariaLabel={t("pages.kesfetHub.next")}
            variant="solid"
            size="md"
            className="border border-border bg-background/85 shadow-sm backdrop-blur-sm"
            onClick={() => scrollByStep(1)}
            disabled={!canScrollNext}
          >
            <ChevronRight className="size-5" aria-hidden />
          </IconButton>
        </div>
      </div>

      <div
        ref={railRef}
        className="w-full overflow-x-auto px-4 snap-x snap-mandatory scroll-pr-16 [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
        aria-label={t("pages.kesfetHub.relatedAria")}
      >
        <ul className="flex min-w-0 gap-4">
          {relatedHubs.map((hub, index) => {
            const title = t(hub.titleKey);
            const description = t(hub.descriptionKey);
            const href = hub.canonicalPath ?? `/kesfet/${hub.slug}`;
            const coverSrc = `/kesfet-hub/${hub.slug}/cover.webp`;
            const isSlideMounted = mountedIndexes.has(index);
            return (
              <li
                key={hub.id}
                data-related-slide-index={index}
                className="min-w-0 shrink-0 basis-[88%] snap-start sm:basis-[46%] lg:basis-[31%]"
              >
                <Link
                  href={href}
                  prefetch={false}
                  className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm transition-[box-shadow,background-color] hover:bg-accent/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-border/50 dark:bg-card/40 dark:shadow-none dark:hover:shadow-sm"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl bg-muted/60 bg-gradient-to-br from-surface-1 to-surface-2">
                    {isSlideMounted ? (
                      <>
                        <Image
                          fill
                          src={coverSrc}
                          alt={t("pages.hub.coverAlt", { title })}
                          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 46vw, 31vw"
                          loading="lazy"
                          className="object-cover"
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent"
                          aria-hidden
                        />
                      </>
                    ) : (
                      <div
                        className="absolute inset-0 animate-pulse bg-gradient-to-br from-surface-1/80 via-surface-1/40 to-surface-2/90"
                        aria-hidden
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex min-h-[92px] flex-1 flex-col gap-2 rounded-b-2xl border-t border-border/50 bg-background/95 p-4 dark:bg-card/30">
                    <div className="min-w-0">
                      <p className="min-w-0 truncate text-base font-semibold leading-tight text-foreground">
                        {title}
                      </p>
                      <p className="min-w-0 truncate text-sm text-foreground/70 dark:text-foreground/65">
                        {description}
                      </p>
                    </div>
                    <div className="mt-auto flex min-w-0 items-center justify-between gap-2 text-sm font-medium text-foreground/80 transition-[color,transform] duration-150 group-hover:text-foreground group-active:scale-[0.99]">
                      <span className="min-w-0 truncate">{t("common.viewAll")}</span>
                      <ChevronRight className="size-4 shrink-0" aria-hidden />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
