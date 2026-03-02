import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PhoneCta, WhatsAppCta } from "@/components/app/cta-actions";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import { DovmeFaqTeaserCard } from "@/components/faq/dovme-faq-teaser-card";
import { HubRelatedCarouselLazy } from "@/components/hub/hub-related-carousel-lazy";
import {
  getHubBySlug,
  isValidHubSlug,
  mainHubs,
  specialHubs,
} from "@/lib/hub/hubs.v1";
import { getRouteContent, hasNoIndex } from "@/lib/route-content";
import { InnerPageHero } from "@/components/app/inner-page-hero";
import { HubGallery } from "@/components/gallery/hub-gallery";
import { locales } from "@/i18n/routing";
import { PHONE_TEL_URL, WHATSAPP_URL } from "@/lib/site/links";
import { applyCoverOgImage } from "@/lib/seo/og-image";

interface PageProps {
  params: Promise<{ locale: string; hub: string }>;
}

function resolvePublicCover(publicRelPath: string): string | null {
  const absolutePath = path.join(process.cwd(), "public", publicRelPath);
  return fs.existsSync(absolutePath) ? `/${publicRelPath}` : null;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    [...mainHubs, ...specialHubs].map((hub) => ({ locale, hub: hub.slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hub: slug } = await params;
  const hub = getHubBySlug(slug);

  if (!hub) {
    return {
      title: { absolute: "Discover | Enki Tattoo" },
      description: "Enki Tattoo discover categories.",
      alternates: { canonical: "/kesfet" },
    };
  }

  const routePath = `/kesfet/${hub.slug}`;
  const content = getRouteContent(routePath);
  const computedTitle = content?.seoTitle || `Enki Tattoo | ${hub.slug}`;
  const computedDescription = content?.seoDescription || hub.slug;
  const canonical = content?.canonical || routePath;
  const hubCoverSrc = `/kesfet-hub/${hub.slug}/cover.webp`;
  const hasHubCover = fs.existsSync(
    path.join(process.cwd(), "public", "kesfet-hub", hub.slug, "cover.webp"),
  );

  const metadata: Metadata = {
    title: { absolute: computedTitle },
    description: computedDescription,
    alternates: {
      canonical,
    },
  };

  if (hasNoIndex(content?.indexing)) {
    metadata.robots = { index: false, follow: true };
  }

  if (hasHubCover) {
    applyCoverOgImage(metadata, hubCoverSrc, computedTitle);
  }

  return metadata;
}

export default async function HubDetailPage({ params }: PageProps) {
  const { locale, hub: slug } = await params;
  const isTrLocale = locale === "tr";
  const t = await getTranslations();
  if (!isValidHubSlug(slug)) notFound();
  const hub = getHubBySlug(slug);
  if (!hub) notFound();

  const routePath = `/kesfet/${hub.slug}`;
  const content = getRouteContent(routePath);
  const title = t(hub.titleKey);
  const description = t(hub.descriptionKey);
  const translatedHeading = t(`pages.kesfet.hubs.${hub.slug}.heading`);
  const translatedShortDescription = t(`pages.kesfet.hubs.${hub.slug}.shortDescription`);
  const translatedLongDescription = t(`pages.kesfet.hubs.${hub.slug}.longDescription`);
  const translatedCoverAlt = t(`pages.kesfet.hubs.${hub.slug}.coverAlt`);
  const heading = isTrLocale ? content?.h1 || title : translatedHeading;
  const shortDescription = isTrLocale
    ? content?.shortDescription || description
    : translatedShortDescription;
  const longDescription = isTrLocale
    ? content?.description && content.description !== shortDescription
      ? content.description
      : null
    : translatedLongDescription;
  const hubCoverSrc = `/kesfet-hub/${hub.slug}/cover.webp`;
  const coverSrc = resolvePublicCover(hubCoverSrc.slice(1));

  return (
    <div className="app-section no-overflow-x">
      <BreadcrumbListJsonLd path={routePath} />

      <InnerPageHero
        coverSrc={coverSrc}
        coverAlt={isTrLocale ? t("pages.hub.coverAlt", { title: heading }) : translatedCoverAlt}
        microLine={isTrLocale ? content?.microLine : undefined}
        heading={heading}
        shortDescription={shortDescription}
        longDescription={longDescription}
        tags={hub.tags}
        primaryCta={
          <WhatsAppCta href={WHATSAPP_URL} label={t("common.social.whatsapp")} />
        }
        secondaryCta={
          <PhoneCta href={PHONE_TEL_URL} label={t("common.social.phone")} />
        }
      />

      <HubGallery hub={hub.slug} kind="kesfet" />
      <HubRelatedCarouselLazy currentSlug={hub.slug} />
      <DovmeFaqTeaserCard hubSlug={hub.slug} />
    </div>
  );
}
