import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import { FaqTeaser } from "@/components/sss/faq-teaser";
import { mainHubs, specialHubs } from "@/lib/hub/hubs.v1";
import { HubCard } from "@/components/hub/hub-card";
import { HubChipRail } from "@/components/hub/featured-hub-rail";
import { getRouteContent, hasNoIndex, listKnownPaths } from "@/lib/route-content";
import { applyCoverOgImage } from "@/lib/seo/og-image";
import { IconRouteCta, WhatsAppCta } from "@/components/app/cta-actions";
import { Images, Sparkles } from "lucide-react";

const KESFET_PATH = "/kesfet";
const KESFET_HERO_COVER_PATH = "/kesfet-hero/cover.webp";
const hasKesfetHeroCover = fs.existsSync(
  path.join(process.cwd(), "public", "kesfet-hero", "cover.webp"),
);
const kesfetContent = getRouteContent(KESFET_PATH);
const knownKesfetPaths = new Set(
  listKnownPaths().filter((path) => path.startsWith("/kesfet/")),
);

export function generateMetadata(): Metadata {
  if (!kesfetContent) {
    return {};
  }

  const metadataTitle = kesfetContent.seoTitle;
  const metadata: Metadata = {};

  if (metadataTitle) {
    metadata.title = { absolute: metadataTitle };
  }
  if (kesfetContent.seoDescription) {
    metadata.description = kesfetContent.seoDescription;
  }
  if (kesfetContent.canonical) {
    metadata.alternates = { canonical: kesfetContent.canonical };
  }
  if (hasNoIndex(kesfetContent.indexing)) {
    metadata.robots = { index: false, follow: true };
  }
  if (hasKesfetHeroCover) {
    applyCoverOgImage(metadata, KESFET_HERO_COVER_PATH, metadataTitle ?? "Enki Tattoo");
  }

  return metadata;
}

export default async function KesfetPage() {
  const t = await getTranslations();
  const heading = t("pages.kesfet.heading");
  const shortDescription =
    t("pages.kesfet.shortDescription");
  const priority = [
    "minimal-fine-line-dovme",
    "realistik-dovme",
    "yazi-isim-dovmesi",
    "portre-dovme",
  ];

  const mainHubCardsBase = mainHubs
    .map((hub) => ({ ...hub, href: `/kesfet/${hub.slug}` }))
    .filter((hub) => knownKesfetPaths.has(hub.href));
  const prioritizedMainHubCards = priority
    .map((slug) => mainHubCardsBase.find((hub) => hub.slug === slug))
    .filter((hub): hub is (typeof mainHubCardsBase)[number] => Boolean(hub));
  const prioritySet = new Set(priority);
  const mainHubCards = [
    ...prioritizedMainHubCards,
    ...mainHubCardsBase.filter((hub) => !prioritySet.has(hub.slug)),
  ];
  const specialHubCards = specialHubs
    .map((hub) => ({ ...hub, href: `/kesfet/${hub.slug}` }))
    .filter((hub) => knownKesfetPaths.has(hub.href));
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
      <BreadcrumbListJsonLd path="/kesfet" />

      <header className="space-y-4">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border">
          {hasKesfetHeroCover ? (
            <Image
              fill
              priority
              src={KESFET_HERO_COVER_PATH}
              alt={t("pages.kesfet.heroAlt")}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-surface-1 to-surface-2" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-[color:var(--on-image-foreground)]">
            <h1 className="line-clamp-1 text-2xl font-semibold text-[color:var(--on-image-foreground)] drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)]">
              {heading}
            </h1>
            <p className="line-clamp-2 text-sm text-[color:var(--on-image-muted)] drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
              {shortDescription}
            </p>
          </div>
        </div>
      </header>

      <section>
        <div className="flex flex-col gap-3">
          <IconRouteCta
            href="/galeri-tasarim"
            icon={Images}
            label={t("pages.kesfet.browseVisuals")}
            variant="default"
            className="w-full"
          />
          <WhatsAppCta label={t("pages.kesfet.askOnWhatsapp")} variant="outline" className="w-full" />
        </div>
      </section>

      <section aria-labelledby="piercing-cta">
        <h2 id="piercing-cta" className="sr-only">
          {t("common.nav.piercing")}
        </h2>
        <Link
          href="/piercing"
          className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 p-4 shadow-soft transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Sparkles className="size-5 text-muted-foreground" aria-hidden />
            </div>
            <div className="min-w-0">
              <h3 className="t-body text-foreground font-medium">{t("common.nav.piercing")}</h3>
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {t("pages.kesfet.piercingDescription")}
              </p>
            </div>
          </div>
        </Link>
      </section>

      <HubChipRail
        title={t("pages.kesfet.popularStyles")}
        chips={quickChips}
        viewAllHref="/kesfet"
        headingId="kesfet-popular-chips"
      />

      <section aria-labelledby="hub-main" className="space-y-4">
        <h2 id="hub-main" className="sr-only">
          {t("pages.home.styleCategories")}
        </h2>
        <div className="grid-cards">
          {mainHubCards.map((hub) => (
            <div key={hub.id} className="min-w-0">
              <HubCard
                titleKey={hub.titleKey}
                slug={hub.slug}
                href={hub.href}
                descriptionKey={hub.descriptionKey}
              />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="hub-special">
        <h2 id="hub-special" className="t-h4 text-foreground mb-3">
          {t("pages.home.specialTitle")}
        </h2>
        <div className="grid-cards">
          {specialHubCards.map((hub) => (
            <div key={hub.id} className="min-w-0">
              <HubCard
                titleKey={hub.titleKey}
                slug={hub.slug}
                href={hub.href}
                descriptionKey={hub.descriptionKey}
              />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="kb-teaser-kesfet" className="mt-6">
        <h2 id="kb-teaser-kesfet" className="sr-only">
          {t("common.nav.knowledgeBase")}
        </h2>
        <FaqTeaser variant="hub" />
      </section>

    </div>
  );
}
