import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { PhoneCta, WhatsAppCta } from "@/components/app/cta-actions";
import { GaleriFilters } from "./filters";
import { GalleryGrid } from "./gallery-grid";
import { InnerPageHero } from "@/components/app/inner-page-hero";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import { getVisibleGalleryItemsByHub, normalizeGalleryHubValue } from "@/lib/gallery/manifest.v1";
import { applyCoverOgImage } from "@/lib/seo/og-image";
import { PHONE_TEL_URL, WHATSAPP_URL } from "@/lib/site/links";
import { getRouteContent, hasNoIndex } from "@/lib/route-content";

const GALERI_TASARIM_SLUG = "galeri-tasarim";
const GALERI_TASARIM_PATH = `/${GALERI_TASARIM_SLUG}`;
const GALERI_TASARIM_COVER_PUBLIC_REL = "galeri-tasarim/cover.webp";
const galeriContent = getRouteContent(GALERI_TASARIM_PATH);

function resolvePublicCover(publicRelPath: string): string | null {
  const absolutePath = path.join(process.cwd(), "public", publicRelPath);
  return fs.existsSync(absolutePath) ? `/${publicRelPath}` : null;
}

export function generateMetadata(): Metadata {
  const metadataTitle = galeriContent?.seoTitle ?? "Galeri | Enki Tattoo";
  const metadata: Metadata = {
    title: { absolute: metadataTitle },
    description: galeriContent?.seoDescription ?? "Tattoo design gallery.",
    alternates: { canonical: galeriContent?.canonical ?? GALERI_TASARIM_PATH },
  };

  if (hasNoIndex(galeriContent?.indexing)) {
    metadata.robots = { index: false, follow: true };
  }
  if (fs.existsSync(path.join(process.cwd(), "public", GALERI_TASARIM_COVER_PUBLIC_REL))) {
    applyCoverOgImage(metadata, `/${GALERI_TASARIM_COVER_PUBLIC_REL}`, metadataTitle);
  }

  return metadata;
}

interface PageProps {
  searchParams: Promise<{ hub?: string; item?: string }>;
}

export default async function GaleriPage({ searchParams }: PageProps) {
  const t = await getTranslations();
  const params = await searchParams;
  const content = galeriContent;
  const shortDescription =
    t("pages.gallery.shortDescription");
  const longDescription =
    content?.description && content.description !== shortDescription
      ? content.description
      : null;
  const requestedHub = params.hub?.trim() || "";
  const activeHub = normalizeGalleryHubValue(requestedHub);
  const visibleItems = getVisibleGalleryItemsByHub(activeHub);
  const resultCount = visibleItems.length;
  const hasVisibleItems = resultCount > 0;
  const emptyStateMessage = activeHub
    ? t("pages.gallery.emptyForCategory")
    : t("pages.gallery.emptyAll");
  const coverSrc = resolvePublicCover(GALERI_TASARIM_COVER_PUBLIC_REL);

  return (
    <div className="app-section no-overflow-x">
      <BreadcrumbListJsonLd path="/galeri-tasarim" />
      <InnerPageHero
        coverSrc={coverSrc}
        coverAlt={t("pages.gallery.coverAlt")}
        microLine={content?.microLine}
        heading={t("pages.gallery.heading")}
        shortDescription={shortDescription}
        longDescription={longDescription}
        primaryCta={
          <WhatsAppCta href={WHATSAPP_URL} label={t("common.cta.whatsappWrite")} />
        }
        secondaryCta={
          <PhoneCta href={PHONE_TEL_URL} label={t("common.social.phone")} />
        }
        actions={<GaleriFilters />}
      />

      <p className="t-muted mt-4">{t("pages.gallery.resultsCount", { count: resultCount })}</p>

      {hasVisibleItems ? (
        <GalleryGrid items={visibleItems} />
      ) : (
        <section
          className="rounded-xl border border-border bg-surface-2 p-5 shadow-soft sm:p-6"
          aria-live="polite"
        >
          <p className="t-small text-muted-foreground">{emptyStateMessage}</p>
          {activeHub ? (
            <Link
              href="/galeri-tasarim"
            className="t-small mt-3 inline-flex text-foreground underline underline-offset-4 hover:text-muted-foreground"
          >
              {t("common.showAll")}
            </Link>
          ) : null}
        </section>
      )}
    </div>
  );
}
