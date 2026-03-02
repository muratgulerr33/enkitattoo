import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ChevronDown } from "lucide-react";
import { WhatsAppCta } from "@/components/app/cta-actions";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import { FaqTeaser } from "@/components/sss/faq-teaser";
import { getRouteContent, hasNoIndex, listKnownPaths } from "@/lib/route-content";
import { applyCoverOgImage } from "@/lib/seo/og-image";
import { FeaturedPiercingCarousel } from "@/components/piercing/featured-piercing-carousel";
import { PiercingCategoryGrid } from "@/components/piercing/piercing-category-grid";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { WHATSAPP_URL } from "@/lib/site/links";

const PIERCING_PATH = "/piercing";
const PIERCING_HERO_COVER_PATH = "/piercing-hero/cover.webp";
const hasHeroCover = fs.existsSync(path.join(process.cwd(), "public", "piercing-hero", "cover.webp"));
const piercingContent = getRouteContent(PIERCING_PATH);
const knownPiercingPaths = listKnownPaths().filter(
  (pathValue) => pathValue.startsWith("/piercing/") && pathValue !== PIERCING_PATH,
);

export function generateMetadata(): Metadata {
  if (!piercingContent) {
    return {};
  }

  const metadataTitle = piercingContent.seoTitle;
  const metadata: Metadata = {};

  if (metadataTitle) {
    metadata.title = { absolute: metadataTitle };
  }
  if (piercingContent.seoDescription) {
    metadata.description = piercingContent.seoDescription;
  }
  if (piercingContent.canonical) {
    metadata.alternates = { canonical: piercingContent.canonical };
  }
  if (hasNoIndex(piercingContent.indexing)) {
    metadata.robots = { index: false, follow: true };
  }
  if (hasHeroCover) {
    applyCoverOgImage(metadata, PIERCING_HERO_COVER_PATH, metadataTitle ?? "Enki Tattoo");
  }

  return metadata;
}

export default async function PiercingPage() {
  const t = await getTranslations();
  const shortDescription =
    t("pages.piercing.shortDescription");
  const detailsDescription = piercingContent?.description || shortDescription;

  return (
    <div className="app-section no-overflow-x pb-[calc(env(safe-area-inset-bottom)+96px)] sm:pb-0">
      <BreadcrumbListJsonLd path="/piercing" />

      <header className="space-y-4">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border">
          {hasHeroCover ? (
            <Image
              fill
              priority
              src={PIERCING_HERO_COVER_PATH}
              alt={t("pages.piercing.heroAlt")}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-surface-1 to-surface-2" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3 text-white">
            <h1 className="line-clamp-1 text-2xl font-semibold text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)]">
              {t("pages.piercing.heading")}
            </h1>
            <p className="line-clamp-1 text-sm text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
              {shortDescription}
            </p>
          </div>
        </div>
      </header>

      <section>
        <WhatsAppCta href={WHATSAPP_URL} label={t("pages.piercing.cta")} className="w-full" />
        {piercingContent?.microLine ? (
          <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">{piercingContent.microLine}</p>
        ) : null}
      </section>

      <FeaturedPiercingCarousel />

      <PiercingCategoryGrid paths={knownPiercingPaths} />

      <section aria-labelledby="piercing-details">
        <h2 id="piercing-details" className="t-h4 text-foreground mb-3">
          {t("pages.piercing.detailsTitle")}
        </h2>

        <Collapsible className="rounded-xl border border-border bg-surface-2 px-4 shadow-soft">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="group flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 py-3 text-left font-medium"
            >
              <span>
                <span className="group-data-[state=open]:hidden">{t("pages.piercing.showDetails")}</span>
                <span className="hidden group-data-[state=open]:inline">{t("pages.piercing.hideDetails")}</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent forceMount>
            <p className="t-muted">{detailsDescription}</p>
          </CollapsibleContent>
        </Collapsible>
      </section>

      <section aria-labelledby="kb-teaser-piercing">
        <h2 id="kb-teaser-piercing" className="sr-only">
          {t("common.nav.knowledgeBase")}
        </h2>
        <FaqTeaser variant="piercing" />
      </section>

    </div>
  );
}
