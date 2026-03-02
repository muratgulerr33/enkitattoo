"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { IconButton } from "@/components/ui/icon-button";
import { FEATURED_PIERCING } from "@/lib/piercing/featured-piercing";
import { FeaturedPiercingCard } from "@/components/piercing/featured-piercing-card";

export function FeaturedPiercingCarousel() {
  const t = useTranslations();
  const railRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

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

  return (
    <section aria-labelledby="featured-piercing-heading" className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id="featured-piercing-heading" className="t-h4 text-foreground">
            {t("piercing.featured.heading")}
          </h2>
          <p className="t-caption mt-1 text-muted-foreground">{t("piercing.featured.subheading")}</p>
        </div>

        <div className="hidden items-center gap-2 xl:flex">
          <IconButton
            ariaLabel={t("piercing.featured.previous")}
            variant="solid"
            size="md"
            className="border border-border bg-background/85 shadow-sm backdrop-blur-sm"
            onClick={() => scrollByStep(-1)}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </IconButton>

          <IconButton
            ariaLabel={t("piercing.featured.next")}
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
        aria-label={t("piercing.featured.railAria")}
      >
        <ul className="flex min-w-0 gap-4">
          {FEATURED_PIERCING.map((item) => (
            <li
              key={item.id}
              className="min-w-0 shrink-0 basis-[88%] snap-start sm:basis-[46%] lg:basis-[31%]"
            >
              <FeaturedPiercingCard item={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
