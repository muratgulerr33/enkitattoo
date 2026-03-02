import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ChevronRight } from "lucide-react";
import { PhoneCta, WhatsAppCta } from "@/components/app/cta-actions";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import { InnerPageHero } from "@/components/app/inner-page-hero";
import { Button } from "@/components/ui/button";
import { PHONE_TEL_URL, WHATSAPP_URL } from "@/lib/site/links";
import { getRouteContent, hasNoIndex } from "@/lib/route-content";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const ARTISTLER_PATH = "/artistler";
const artistlerContent = getRouteContent(ARTISTLER_PATH);

function resolvePublicCover(publicRelPath: string): string | null {
  const absolutePath = path.join(process.cwd(), "public", publicRelPath);
  return fs.existsSync(absolutePath) ? `/${publicRelPath}` : null;
}

export function generateMetadata(): Metadata {
  if (!artistlerContent) {
    return {};
  }

  const metadata: Metadata = {};

  if (artistlerContent.seoTitle) {
    metadata.title = { absolute: artistlerContent.seoTitle };
  }
  if (artistlerContent.seoDescription) {
    metadata.description = artistlerContent.seoDescription;
  }
  if (artistlerContent.canonical) {
    metadata.alternates = { canonical: artistlerContent.canonical };
  }
  if (hasNoIndex(artistlerContent.indexing)) {
    metadata.robots = { index: false, follow: true };
  }

  return metadata;
}

const ARTISTS = [
  {
    id: "halit-yalvac",
    slug: "halit-yalvac",
    name: "Halit Yalvaç",
    roleKey: "pages.artists.roles.halit",
    descriptionKey: "pages.artists.descriptions.halit",
  },
  {
    id: "mertcan-uludag",
    slug: "mertcan-uludag",
    name: "Mertcan Uludağ",
    roleKey: "pages.artists.roles.mertcan",
    descriptionKey: "pages.artists.descriptions.mertcan",
  },
] as const;

export default async function ArtistlerPage({ params }: PageProps) {
  const t = await getTranslations();
  const { locale } = await params;
  const isTrLocale = locale === "tr";
  const shortDescription = isTrLocale
    ? artistlerContent?.shortDescription || t("pages.artists.shortDescription")
    : t("pages.artists.shortDescription");
  const longDescription =
    isTrLocale &&
    artistlerContent?.description &&
    artistlerContent.description !== shortDescription
      ? artistlerContent.description
      : null;
  const coverSrc = resolvePublicCover("artistler/cover.webp");
  const artistsWithAvatar = ARTISTS.map((artist) => {
    const artistPath = `/artistler/${artist.slug}`;
    const artistContent = getRouteContent(artistPath);
    const raw = isTrLocale
      ? artistContent?.shortDescription ?? t(artist.descriptionKey)
      : t(artist.descriptionKey);
    const cardDesc = raw.replace(/\s+/g, " ").trim();

    return {
      ...artist,
      avatarSrc: resolvePublicCover(`artistler/${artist.slug}/avatar.webp`),
      roleLabel: t(artist.roleKey),
      cardDesc,
    };
  });

  return (
    <div className="app-section no-overflow-x">
      <BreadcrumbListJsonLd path="/artistler" />
      <InnerPageHero
        coverSrc={coverSrc}
        coverAlt={t("pages.artists.coverAlt")}
        microLine={isTrLocale ? artistlerContent?.microLine : undefined}
        heading={t("pages.artists.heading")}
        shortDescription={shortDescription}
        longDescription={longDescription}
        primaryCta={
          <WhatsAppCta href={WHATSAPP_URL} label={t("common.cta.whatsappWrite")} />
        }
        secondaryCta={
          <PhoneCta href={PHONE_TEL_URL} label={t("common.social.phone")} />
        }
      />

      <ul className="flex min-w-0 flex-col gap-4" role="list">
        {artistsWithAvatar.map((artist) => (
          <li key={artist.id} className="min-w-0">
            <article
              data-testid="artist-profile-card"
              data-artist-slug={artist.slug}
              className="flex min-w-0 items-start gap-4 rounded-xl border border-border bg-surface-2 p-4 shadow-soft"
            >
              {artist.avatarSrc ? (
                <Image
                  src={artist.avatarSrc}
                  alt={t("pages.artists.avatarAlt", { name: artist.name })}
                  width={80}
                  height={80}
                  className="size-20 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="size-20 shrink-0 rounded-lg bg-muted" aria-hidden />
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="min-w-0">
                  <h2 className="t-h4 truncate text-foreground">
                    <Link href={`/artistler/${artist.slug}`}>{artist.name}</Link>
                  </h2>
                  <p className="t-small text-muted-foreground">{artist.roleLabel}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{artist.cardDesc}</p>
                </div>
                <div className="mt-auto">
                  <Button asChild variant="outline" size="sm" className="min-h-11 w-full sm:w-auto">
                    <Link href={`/artistler/${artist.slug}`}>
                      <span className="inline-flex items-center justify-center gap-2">
                        <span className="leading-none">{t("common.inspect")}</span>
                        <ChevronRight className="size-4 shrink-0 opacity-80" aria-hidden />
                      </span>
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
