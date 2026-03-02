import fs from "node:fs";
import pathModule from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PhoneCta, WhatsAppCta } from "@/components/app/cta-actions";
import { InnerPageHero } from "@/components/app/inner-page-hero";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import { locales } from "@/i18n/routing";
import { applyCoverOgImage } from "@/lib/seo/og-image";
import { getRouteContent, hasNoIndex } from "@/lib/route-content";
import { PHONE_TEL_URL, WHATSAPP_URL } from "@/lib/site/links";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

const ARTIST_SLUGS = ["halit-yalvac", "mertcan-uludag"] as const;
const knownArtistSlugs = new Set<string>(ARTIST_SLUGS);
const ARTIST_INFO = {
  "halit-yalvac": {
    name: "Halit Yalvaç",
    detailMicroLineKey: "pages.artistDetail.profiles.halit-yalvac.microLine",
    detailShortDescriptionKey: "pages.artistDetail.profiles.halit-yalvac.shortDescription",
    detailLongDescriptionKey: "pages.artistDetail.profiles.halit-yalvac.longDescription",
  },
  "mertcan-uludag": {
    name: "Mertcan Uludağ",
    detailMicroLineKey: "pages.artistDetail.profiles.mertcan-uludag.microLine",
    detailShortDescriptionKey: "pages.artistDetail.profiles.mertcan-uludag.shortDescription",
    detailLongDescriptionKey: "pages.artistDetail.profiles.mertcan-uludag.longDescription",
  },
} as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => ARTIST_SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const routePath = `/artistler/${slug}`;
  const content = getRouteContent(routePath);
  const metadataTitle = content?.seoTitle ?? "Artistler | Enki Tattoo";
  const sharedCoverSrc = "/artistler/cover.webp";
  const hasSharedCover = fs.existsSync(pathModule.join(process.cwd(), "public", "artistler", "cover.webp"));

  const metadata: Metadata = {
    title: { absolute: metadataTitle },
    description: content?.seoDescription ?? "Enki Tattoo artist profili.",
    alternates: { canonical: content?.canonical ?? routePath },
  };

  if (hasNoIndex(content?.indexing)) {
    metadata.robots = { index: false, follow: true };
  }

  if (hasSharedCover) {
    applyCoverOgImage(metadata, sharedCoverSrc, metadataTitle);
  }

  return metadata;
}

export default async function ArtistDetailPage({ params }: PageProps) {
  const t = await getTranslations();
  const { locale, slug } = await params;
  const isTrLocale = locale === "tr";

  if (!knownArtistSlugs.has(slug)) {
    notFound();
  }

  const routePath = `/artistler/${slug}`;
  const content = getRouteContent(routePath);

  if (!content) {
    notFound();
  }

  const artistInfo = ARTIST_INFO[slug as keyof typeof ARTIST_INFO];
  if (!artistInfo) {
    notFound();
  }

  const localizedShortDescription = t(artistInfo.detailShortDescriptionKey);
  const shortDescription = isTrLocale
    ? content.shortDescription || content.description || localizedShortDescription
    : localizedShortDescription;
  const localizedLongDescription = t(artistInfo.detailLongDescriptionKey);
  const longDescription =
    isTrLocale
      ? content.description && content.description !== shortDescription
        ? content.description
        : null
      : localizedLongDescription;
  const microLine = isTrLocale ? content.microLine : t(artistInfo.detailMicroLineKey);
  const sharedCoverRel = "artistler/cover.webp";
  const hasSharedCover = fs.existsSync(pathModule.join(process.cwd(), "public", "artistler", "cover.webp"));
  const coverSrc = hasSharedCover ? `/${sharedCoverRel}` : null;
  const heading = isTrLocale ? content.h1 || artistInfo.name : artistInfo.name;

  return (
    <div className="app-section no-overflow-x">
      <BreadcrumbListJsonLd path={routePath} />
      <div data-testid="artist-detail-card">
        <InnerPageHero
          coverSrc={coverSrc}
          coverAlt={t("pages.artists.coverAlt")}
          microLine={microLine}
          heading={heading}
          shortDescription={shortDescription}
          longDescription={longDescription}
          primaryCta={
            <WhatsAppCta href={WHATSAPP_URL} label={t("common.cta.whatsappWrite")} />
          }
          secondaryCta={
            <PhoneCta href={PHONE_TEL_URL} label={t("common.social.phone")} />
          }
        />
      </div>
    </div>
  );
}
