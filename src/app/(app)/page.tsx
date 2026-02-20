"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { mainHubs, specialHubs } from "@/lib/hub/hubs.v1";
import {
  addressLine,
  phoneDisplay,
  phoneE164,
  studioName,
  whatsappUrl,
} from "@/lib/mock/enki";
import { ChevronRight, Images, MapPin, MessageCircle, Phone, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="sr-only t-h2">Ana sayfa</h1>

      {/* 1) Hero block */}
      <section
        className="rounded-xl border border-border bg-surface-2 p-5 shadow-soft md:p-6"
        aria-labelledby="hero-title"
      >
        <h2 id="hero-title" className="t-h3 text-foreground">
          {studioName}
        </h2>
        <p className="t-muted mt-1">
          Stilini seç, örnekleri gör, hızlı randevu al.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild size="lg" className="gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <MessageCircle className="size-5" aria-hidden />
              WhatsApp ile randevu al
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/kesfet" className="gap-2">
              Keşfet&apos;e git
              <ChevronRight className="size-5" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      {/* 2) Quick Hub grid — 2 cols mobile, 3 cols desktop */}
      <section aria-labelledby="hub-grid-title">
        <h2 id="hub-grid-title" className="sr-only">
          Stil kategorileri
        </h2>
        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-3">
          {mainHubs.map((hub) => (
            <Link
              key={hub.id}
              href={`/kesfet/${hub.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface-2 shadow-soft transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="aspect-[4/3] w-full bg-muted/50 bg-gradient-to-br from-surface-1 to-surface-2" />
              <div className="flex flex-1 flex-col gap-0.5 p-3 md:p-4">
                <span className="t-small font-medium text-foreground">
                  {hub.titleTR}
                </span>
                <p className="t-caption line-clamp-1 text-muted-foreground">
                  {hub.descriptionTR}
                </p>
                <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3) Özel row — horizontal scroll mobile, 3-card row desktop */}
      <section aria-labelledby="ozel-title">
        <h2 id="ozel-title" className="t-h5 text-foreground mb-3">
          Özel
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none xl:grid xl:grid-cols-3 xl:overflow-visible xl:pb-0 xl:snap-none">
          {specialHubs.map((hub) => (
            <Link
              key={hub.id}
              href={`/kesfet/${hub.slug}`}
              className="flex min-w-[120px] flex-col shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2 p-3 shadow-soft transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 snap-start xl:min-w-0"
            >
              <div className="aspect-square w-full rounded-lg bg-muted/50 bg-gradient-to-br from-surface-1 to-muted" />
              <span className="t-small mt-2 font-medium text-foreground">
                {hub.titleTR}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4) Piercing big CTA */}
      <section aria-labelledby="piercing-cta-title">
        <h2 id="piercing-cta-title" className="sr-only">
          Piercing
        </h2>
        <Link
          href="/piercing"
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface-2 p-5 shadow-soft transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:flex-row md:items-center md:justify-between md:gap-4 md:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Sparkles className="size-7 text-muted-foreground" aria-hidden />
            </div>
            <div>
              <h3 className="t-h4 text-foreground">Piercing</h3>
              <p className="t-muted mt-0.5">
                Piercing ayrı dünyamız. Hızlı bilgi ve randevu.
              </p>
            </div>
          </div>
          <Button variant="default" size="lg" className="mt-4 shrink-0 md:mt-0">
            Piercing
          </Button>
        </Link>
      </section>

      {/* 5) Mini Galeri önizleme */}
      <section aria-labelledby="galeri-preview-title">
        <h2 id="galeri-preview-title" className="sr-only">
          Galeri önizleme
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="t-small text-muted-foreground">Galeri önizleme</span>
          <Button asChild variant="outline" size="sm">
            <Link href="/galeri" className="gap-2">
              <Images className="size-4" aria-hidden />
              Galeri&apos;ye git
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-square w-full rounded-xl border border-border bg-muted"
            />
          ))}
        </div>
      </section>

      {/* 6) Mini contact strip */}
      <section
        className="rounded-xl border border-border bg-surface-2 p-4 shadow-soft"
        aria-labelledby="contact-strip-title"
      >
        <h2 id="contact-strip-title" className="sr-only">
          İletişim
        </h2>
        <div className="flex flex-col gap-2 text-muted-foreground">
          <a
            href={`tel:${phoneE164}`}
            className="t-small inline-flex items-center gap-2 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded"
          >
            <Phone className="size-4 shrink-0" aria-hidden />
            {phoneDisplay}
          </a>
          <span className="t-small inline-flex items-center gap-2">
            <MapPin className="size-4 shrink-0" aria-hidden />
            {addressLine}
          </span>
        </div>
        <Button asChild variant="outline" size="default" className="mt-4 w-full sm:w-auto">
          <Link href="/iletisim" className="gap-2">
            İletişim
          </Link>
        </Button>
      </section>
    </div>
  );
}
