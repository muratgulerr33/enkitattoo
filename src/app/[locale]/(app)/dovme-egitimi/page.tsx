import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PhoneCta, WhatsAppCta } from "@/components/app/cta-actions";
import { InnerPageHero } from "@/components/app/inner-page-hero";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import { applyCoverOgImage } from "@/lib/seo/og-image";
import { getRouteContent, hasNoIndex } from "@/lib/route-content";
import { PHONE_TEL_URL, WHATSAPP_URL } from "@/lib/site/links";

const DOVME_EGITIMI_PATH = "/dovme-egitimi";
const DOVME_EGITIMI_COVER_PUBLIC_REL = "dovme-egitimi/cover.webp";
interface PageProps {
  params: Promise<{ locale: string }>;
}

function resolvePublicCover(publicRelPath: string): string | null {
  const absolutePath = path.join(process.cwd(), "public", publicRelPath);
  return fs.existsSync(absolutePath) ? `/${publicRelPath}` : null;
}

export function generateMetadata(): Metadata {
  const content = getRouteContent(DOVME_EGITIMI_PATH);
  const metadataTitle = content?.seoTitle ?? "Tattoo Training | Enki Tattoo";

  const metadata: Metadata = {
    title: { absolute: metadataTitle },
    description: content?.seoDescription ?? "Tattoo training detail page.",
    alternates: { canonical: content?.canonical ?? DOVME_EGITIMI_PATH },
  };

  if (hasNoIndex(content?.indexing)) {
    metadata.robots = { index: false, follow: true };
  }
  if (fs.existsSync(path.join(process.cwd(), "public", DOVME_EGITIMI_COVER_PUBLIC_REL))) {
    applyCoverOgImage(metadata, `/${DOVME_EGITIMI_COVER_PUBLIC_REL}`, metadataTitle);
  }

  return metadata;
}

export default async function DovmeEgitimiPage({ params }: PageProps) {
  const t = await getTranslations();
  const { locale } = await params;
  const isTrLocale = locale === "tr";
  const content = getRouteContent(DOVME_EGITIMI_PATH);

  if (!content) {
    notFound();
  }

  const shortDescription = isTrLocale
    ? content.shortDescription || content.description || t("pages.training.defaultShortDescription")
    : t("pages.training.shortDescription");
  const longDescription = isTrLocale
    ? content.description && content.description !== shortDescription
      ? content.description
      : null
    : t("pages.training.longDescription");
  const coverSrc = resolvePublicCover(DOVME_EGITIMI_COVER_PUBLIC_REL);

  return (
    <div className="app-section no-overflow-x">
      <BreadcrumbListJsonLd path={DOVME_EGITIMI_PATH} />
      <InnerPageHero
        coverSrc={coverSrc}
        coverAlt={t("pages.training.coverAlt")}
        microLine={isTrLocale ? content.microLine : undefined}
        heading={isTrLocale ? content.h1 || t("pages.training.heading") : t("pages.training.heading")}
        shortDescription={shortDescription}
        longDescription={longDescription}
        primaryCta={
          <WhatsAppCta href={WHATSAPP_URL} label={t("common.social.whatsapp")} />
        }
        secondaryCta={
          <PhoneCta href={PHONE_TEL_URL} label={t("common.social.phone")} />
        }
      />

      <section aria-label={t("pages.training.scopeAria")}>
        <h2 className="t-h5 text-foreground">{t("pages.training.scopeTitle")}</h2>
        <ul className="t-muted mt-2 list-disc space-y-1 pl-5">
          <li>{t("pages.training.scopeItems.hygiene")}</li>
          <li>{t("pages.training.scopeItems.stencil")}</li>
          <li>{t("pages.training.scopeItems.equipment")}</li>
        </ul>
      </section>
    </div>
  );
}
