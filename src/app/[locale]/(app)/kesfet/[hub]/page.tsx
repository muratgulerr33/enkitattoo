import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
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
import { PHONE_TEL_URL, WHATSAPP_URL } from "@/lib/site/links";

interface PageProps {
  params: Promise<{ hub: string }>;
}

function resolvePublicCover(publicRelPath: string): string | null {
  const absolutePath = path.join(process.cwd(), "public", publicRelPath);
  return fs.existsSync(absolutePath) ? `/${publicRelPath}` : null;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return [...mainHubs, ...specialHubs].map((hub) => ({ hub: hub.slug }));
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

  return metadata;
}

export default async function HubDetailPage({ params }: PageProps) {
  const locale = await getLocale();
  const isTrLocale = locale === "tr";
  const t = await getTranslations();
  const { hub: slug } = await params;
  if (!isValidHubSlug(slug)) notFound();
  const hub = getHubBySlug(slug);
  if (!hub) notFound();

  const routePath = `/kesfet/${hub.slug}`;
  const content = getRouteContent(routePath);
  const title = t(hub.titleKey);
  const description = t(hub.descriptionKey);
  const heading = isTrLocale ? content?.h1 || title : title;
  const shortDescription = isTrLocale ? content?.shortDescription || description : description;
  const longDescription =
    isTrLocale && content?.description && content.description !== shortDescription
      ? content.description
      : null;
  const hubCoverSrc = `/kesfet-hub/${hub.slug}/cover.webp`;
  const coverSrc = resolvePublicCover(hubCoverSrc.slice(1));

  return (
    <div className="app-section no-overflow-x">
      <BreadcrumbListJsonLd path={routePath} />

      <InnerPageHero
        coverSrc={coverSrc}
        coverAlt={t("pages.hub.coverAlt", { title: heading })}
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
