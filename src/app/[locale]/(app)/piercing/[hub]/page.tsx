import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BookOpen, Images } from "lucide-react";
import { IconRouteCta, PhoneCta, WhatsAppCta } from "@/components/app/cta-actions";
import { InnerPageHero } from "@/components/app/inner-page-hero";
import { PiercingCategoryGrid } from "@/components/piercing/piercing-category-grid";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import { locales } from "@/i18n/routing";
import { applyCoverOgImage } from "@/lib/seo/og-image";
import { getRouteContent, hasNoIndex, listKnownPaths } from "@/lib/route-content";
import { PHONE_TEL_URL, WHATSAPP_URL } from "@/lib/site/links";

interface PageProps {
  params: Promise<{ locale: string; hub: string }>;
}

function resolvePublicCover(publicRelPath: string): string | null {
  const absolutePath = path.join(process.cwd(), "public", publicRelPath);
  return fs.existsSync(absolutePath) ? `/${publicRelPath}` : null;
}

const knownPiercingPaths = listKnownPaths().filter(
  (path) => path.startsWith("/piercing/") && path !== "/piercing",
);

const slugs = Array.from(
  new Set(
    knownPiercingPaths
      .map((path) => path.split("/").pop())
      .filter((slug): slug is string => Boolean(slug)),
  ),
);

const knownPiercingSlugs = new Set<string>(slugs);
const PIERCING_GALLERY_ITEM_BY_SLUG: Record<string, string> = {
  kulak: "p001",
  burun: "p002",
  kas: "p003",
  dudak: "p004",
  dil: "p005",
  gobek: "p006",
  septum: "p007",
  industrial: "p008",
  "kisiye-ozel": "p009",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => slugs.map((hub) => ({ locale, hub })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hub: slug } = await params;
  const routePath = `/piercing/${slug}`;
  const content = getRouteContent(routePath);
  const metadataTitle = content?.seoTitle ?? "Piercing | Enki Tattoo";
  const coverSrc = `/piercing-hub/${slug}/cover.webp`;
  const hasHubCover = fs.existsSync(
    path.join(process.cwd(), "public", "piercing-hub", slug, "cover.webp"),
  );

  const metadata: Metadata = {
    title: { absolute: metadataTitle },
    description: content?.seoDescription ?? "Piercing detail.",
    alternates: { canonical: content?.canonical ?? routePath },
  };

  if (hasNoIndex(content?.indexing)) {
    metadata.robots = { index: false, follow: true };
  }

  if (hasHubCover) {
    applyCoverOgImage(metadata, coverSrc, metadataTitle);
  }

  return metadata;
}

export default async function PiercingHubPage({ params }: PageProps) {
  const t = await getTranslations();
  const { locale, hub: slug } = await params;
  const isTrLocale = locale === "tr";

  if (!knownPiercingSlugs.has(slug)) {
    notFound();
  }

  const path = `/piercing/${slug}`;
  const content = getRouteContent(path);

  if (!content) {
    notFound();
  }

  const translatedHeading = t(`pages.piercing.hubs.${slug}.heading`);
  const translatedShortDescription = t(`pages.piercing.hubs.${slug}.shortDescription`);
  const translatedLongDescription = t(`pages.piercing.hubs.${slug}.longDescription`);
  const translatedCoverAlt = t(`pages.piercing.hubs.${slug}.coverAlt`);
  const heading = isTrLocale ? content.h1 || t("common.nav.piercing") : translatedHeading;
  const shortDescription = isTrLocale
    ? content.shortDescription || content.description || t("pages.piercingHub.defaultShortDescription")
    : translatedShortDescription;
  const longDescription = isTrLocale
    ? content.description && content.description !== shortDescription
      ? content.description
      : null
    : translatedLongDescription;
  const coverSrc = resolvePublicCover(`piercing-hub/${slug}/cover.webp`);
  const autoItemId = PIERCING_GALLERY_ITEM_BY_SLUG[slug];
  const galleryHref = autoItemId
    ? `/galeri-tasarim?hub=piercing&item=${autoItemId}`
    : "/galeri-tasarim?hub=piercing";

  return (
    <div className="app-section no-overflow-x">
      <BreadcrumbListJsonLd path={path} />
      <InnerPageHero
        coverSrc={coverSrc}
        coverAlt={isTrLocale ? t("pages.hub.coverAlt", { title: heading }) : translatedCoverAlt}
        microLine={isTrLocale ? content.microLine : undefined}
        heading={heading}
        shortDescription={shortDescription}
        longDescription={longDescription}
        primaryCta={
          <WhatsAppCta href={WHATSAPP_URL} label={t("common.social.whatsapp")} />
        }
        secondaryCta={
          <PhoneCta href={PHONE_TEL_URL} label={t("common.social.phone")} />
        }
      />

      <PiercingCategoryGrid paths={knownPiercingPaths} currentPath={path} className="mt-6" />

      <section className="mt-6 rounded-2xl border border-border bg-surface-2 p-5 shadow-soft sm:p-6">
        <h2 className="t-h4 text-foreground">{t("pages.piercingHub.galleryCtaTitle")}</h2>
        <p className="t-muted mt-2">{t("pages.piercingHub.galleryCtaDescription")}</p>
        <IconRouteCta
          href={galleryHref}
          icon={Images}
          label={t("pages.piercingHub.openGallery")}
          variant="outline"
          className="mt-4 w-full sm:w-auto"
        />
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface-2 p-5 shadow-soft sm:p-6">
        <h2 className="t-h4 text-foreground">{t("common.nav.questionBank")}</h2>
        <p className="t-muted mt-2">{t("pages.piercingHub.questionBankDescription")}</p>
        <IconRouteCta
          href="/sss?cat=piercing"
          icon={BookOpen}
          label={t("common.nav.questionBank")}
          variant="outline"
          className="mt-4 w-full sm:w-auto"
        />
      </section>
    </div>
  );
}
