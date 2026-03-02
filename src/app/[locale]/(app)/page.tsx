import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import { GoogleMapEmbed } from "@/components/google/google-map-embed";
import { GoogleReviewsSection } from "@/components/google/google-reviews-section";
import { FaqTeaser } from "@/components/sss/faq-teaser";
import { IconRouteCta, WhatsAppCta } from "@/components/app/cta-actions";
import { Button } from "@/components/ui/button";
import { mainHubs, specialHubs } from "@/lib/hub/hubs.v1";
import { getGalleryPreviewItems } from "@/lib/gallery/manifest.v1";
import { HubCard } from "@/components/hub/hub-card";
import { HubChipRail } from "@/components/hub/featured-hub-rail";
import { getRouteContent, listKnownPaths } from "@/lib/route-content";
import { PHONE_TEL_URL, WHATSAPP_URL } from "@/lib/site/links";
import { SITE_INFO } from "@/lib/site-info";
import { ChevronDown, ChevronRight, Images, MapPin, Palette, Phone, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const HOME_HERO_COVER_PATH = "/home-hero/cover.webp";
const hasHomeHeroCover = fs.existsSync(path.join(process.cwd(), "public", "home-hero", "cover.webp"));
const GOOGLE_REVIEWS_URL = "https://maps.app.goo.gl/XfsNo8TymLtVkrFt5";
const GOOGLE_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3195.521887610449!2d34.59194307712495!3d36.78203567225235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1527f5d852fbfb95%3A0xc04051bc529ace4e!2sEnki%20Tattoo%20Studio%20Mersin!5e0!3m2!1str!2str!4v1772132365403!5m2!1str!2str";
const knownKesfetPaths = new Set(
  listKnownPaths().filter((pathValue) => pathValue.startsWith("/kesfet/")),
);

export default async function HomePage() {
  const t = await getTranslations();
  const content = getRouteContent("/");
  const galleryPreviewItems = getGalleryPreviewItems(4);
  const homeHeading = t("pages.home.heading");
  const heroMicroLine = t("pages.home.heroMicroLine");
  const heroShortDescription =
    content?.shortDescription && content.shortDescription !== heroMicroLine
      ? content.shortDescription
      : null;
  const resolvedYaziIsimHref = Array.from(knownKesfetPaths).find(
    (pathValue) =>
      pathValue.includes("yazi") && (pathValue.includes("isim") || pathValue.includes("letter")),
  );
  const resolvedBlackworkHref =
    Array.from(knownKesfetPaths).find((pathValue) => pathValue.includes("blackwork")) ||
    "/kesfet/blackwork";
  const resolvedAtaturkHref =
    Array.from(knownKesfetPaths).find((pathValue) => pathValue.includes("ataturk")) ||
    "/kesfet/ataturk";
  const quickChips = [
    { label: t("hub.items.minimal_fine_line.title"), href: "/kesfet/minimal-fine-line-dovme" },
    ...(resolvedYaziIsimHref ? [{ label: t("hub.items.lettering.title"), href: resolvedYaziIsimHref }] : []),
    { label: t("hub.items.realism.title"), href: "/kesfet/realistik-dovme" },
    { label: t("hub.items.cover_up.title"), href: "/kesfet/dovme-kapatma" },
    { label: t("hub.items.portrait.title"), href: "/kesfet/portre-dovme" },
    { label: t("hub.items.traditional_old_school.title"), href: "/kesfet/traditional-dovme" },
    { label: t("hub.items.blackwork.title"), href: resolvedBlackworkHref },
    { label: t("hub.items.ataturk.title"), href: resolvedAtaturkHref },
  ].filter((chip) => knownKesfetPaths.has(chip.href));

  return (
    <div className="app-section no-overflow-x">
      <BreadcrumbListJsonLd path="/" />
      <h1 className="sr-only typo-page-title">{homeHeading}</h1>

      <header className="space-y-4">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border">
          {hasHomeHeroCover ? (
            <Image
              fill
              priority
              src={HOME_HERO_COVER_PATH}
              alt={t("pages.home.heroAlt")}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-surface-1 to-surface-2" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <h2 className="line-clamp-1 text-2xl font-semibold text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)]">
              {SITE_INFO.name}
            </h2>
            <p className="line-clamp-2 text-sm text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
              {heroMicroLine}
            </p>
          </div>
        </div>
      </header>

      <section>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
          <WhatsAppCta href={WHATSAPP_URL} label={t("common.social.whatsapp")} />
          <IconRouteCta
            href="/kesfet"
            icon={Palette}
            label={t("pages.home.ctaDesignsMobile")}
            variant="outline"
          />
        </div>
      </section>

      <HubChipRail
        title={t("pages.home.featuredTitle")}
        chips={quickChips}
        viewAllHref="/kesfet"
        headingId="home-quick-discovery"
      />

      {/* 2) Quick Hub grid — canonical cards pattern */}
      <section aria-labelledby="hub-grid-title">
        <h2 id="hub-grid-title" className="sr-only">
          {t("pages.home.styleCategories")}
        </h2>
        <div className="grid-cards">
          {mainHubs.map((hub) => (
            <div key={hub.id} className="min-w-0">
              <HubCard
                titleKey={hub.titleKey}
                slug={hub.slug}
                href={`/kesfet/${hub.slug}`}
                descriptionKey={hub.descriptionKey}
              />
            </div>
          ))}
        </div>
      </section>

      {heroShortDescription ? (
        <details className="group mt-3 rounded-xl border border-border bg-surface-2 px-4 shadow-soft">
          <summary
            className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden"
            aria-label={t("pages.home.detailsAria")}
          >
            <p className="min-w-0 flex-1 line-clamp-2 text-xs text-muted-foreground group-open:hidden">
              {heroShortDescription}
            </p>
            <span className="shrink-0 inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="group-open:hidden">{t("common.showMore")}</span>
              <span className="hidden group-open:inline">{t("common.hideDetails")}</span>
              <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
            </span>
          </summary>
          <div className="pb-3">
            <p className="text-xs text-muted-foreground">{heroShortDescription}</p>
          </div>
        </details>
      ) : null}

      {/* 3) Özel row — canonical cards pattern */}
      <section aria-labelledby="ozel-title">
        <h2 id="ozel-title" className="t-h5 text-foreground mb-3">
          {t("pages.home.specialTitle")}
        </h2>
        <div className="grid-cards">
          {specialHubs.map((hub) => (
            <div key={hub.id} className="min-w-0">
              <HubCard
                titleKey={hub.titleKey}
                slug={hub.slug}
                href={`/kesfet/${hub.slug}`}
                descriptionKey={hub.descriptionKey}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 4) Piercing big CTA */}
      <section aria-labelledby="piercing-cta-title">
        <h2 id="piercing-cta-title" className="sr-only">
          {t("common.nav.piercing")}
        </h2>
        <Link
          href="/piercing"
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface-2 px-4 py-5 shadow-soft transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-6 lg:px-8"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Sparkles className="size-7 text-muted-foreground" aria-hidden />
            </div>
            <div>
              <h3 className="t-h4 text-foreground">{t("common.nav.piercing")}</h3>
              <p className="t-muted mt-0.5">
                {t("pages.home.piercingDescription")}
              </p>
            </div>
          </div>
          <Button variant="default" size="cta" className="mt-4 w-full shrink-0 sm:mt-0 sm:w-auto">
            <span className="inline-flex items-center justify-center gap-2">
              <span className="leading-none">{t("common.nav.piercing")}</span>
              <ChevronRight className="size-4 shrink-0 opacity-80" aria-hidden />
            </span>
          </Button>
        </Link>
      </section>

      {/* 5) Mini Galeri önizleme */}
      <section aria-labelledby="galeri-preview-title">
        <h2 id="galeri-preview-title" className="sr-only">
          {t("pages.home.galleryPreviewTitle")}
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="t-small text-muted-foreground">{t("pages.home.galleryPreviewTitle")}</span>
          <Button asChild variant="outline" size="sm">
            <Link href="/galeri-tasarim" className="gap-2">
              <Images className="size-4" aria-hidden />
              {t("pages.home.goToGallery")}
            </Link>
          </Button>
        </div>
        <div className="grid-cards-compact pt-2">
          {galleryPreviewItems.length > 0
            ? galleryPreviewItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/galeri-tasarim?hub=${encodeURIComponent(item.hub)}&item=${encodeURIComponent(item.id)}`}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-2 shadow-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={t("pages.home.openGalleryImageAria", { title: item.title })}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </Link>
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="card-media rounded-xl border border-border bg-muted"
                />
              ))}
        </div>
      </section>

      {/* 6) Mini contact strip */}
      <section
        className="mt-8 rounded-xl border border-border bg-surface-2 p-4 shadow-soft sm:mt-10"
        aria-labelledby="contact-strip-title"
      >
        <h2 id="contact-strip-title" className="sr-only">
          {t("common.nav.contact")}
        </h2>
        <div className="flex flex-col gap-2 text-muted-foreground">
          <a
            href={PHONE_TEL_URL}
            className="t-small inline-flex items-start gap-2 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded"
          >
            <Phone className="mt-0.5 size-4 shrink-0" aria-hidden />
            {SITE_INFO.phoneDisplay}
          </a>
          <p className="t-small inline-flex max-w-full items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span
              className="min-w-0 max-w-full truncate"
              title={SITE_INFO.addressText}
              aria-label={SITE_INFO.addressText}
            >
              {SITE_INFO.addressText}
            </span>
          </p>
        </div>
        <Button asChild variant="outline" size="cta" className="mt-4 w-full sm:w-auto">
          <Link href="/iletisim" className="gap-2">
            {t("common.nav.contact")}
          </Link>
        </Button>
      </section>

      <div className="mt-10 sm:mt-12">
        <GoogleReviewsSection />
      </div>

      <GoogleMapEmbed
        title={t("pages.home.findOnMap")}
        src={GOOGLE_EMBED_SRC}
        openHref={GOOGLE_REVIEWS_URL}
      />

      <section aria-labelledby="kb-teaser-home">
        <h2 id="kb-teaser-home" className="sr-only">
          {t("common.nav.knowledgeBase")}
        </h2>
        <FaqTeaser variant="home" />
      </section>
    </div>
  );
}
