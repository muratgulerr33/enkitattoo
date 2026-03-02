"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "@/components/ui/external-link";
import { Skeleton } from "@/components/ui/skeleton";

type GoogleMapEmbedProps = {
  title: string;
  src: string;
  height?: number;
  openHref?: string;
};

export function GoogleMapEmbed({ title, src, height = 360, openHref }: GoogleMapEmbedProps) {
  const t = useTranslations();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isReady, setIsReady] = useState(false);

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

  return (
    <section
      ref={sectionRef}
      data-testid="map-embed"
      aria-labelledby="google-map-title"
      className="space-y-3"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="google-map-title" className="t-h4 text-foreground">
          {title}
        </h2>
        {openHref ? (
          <Button asChild variant="outline" size="sm">
            <ExternalLink href={openHref}>
              {t("common.openInMap")}
            </ExternalLink>
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface-2 shadow-soft">
        {isReady ? (
          <iframe
            data-testid="maps-iframe"
            title={title}
            src={src}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 0, width: "100%", height }}
          />
        ) : (
          <Skeleton className="w-full rounded-none bg-muted" style={{ height }} aria-hidden="true" />
        )}
      </div>
    </section>
  );
}
