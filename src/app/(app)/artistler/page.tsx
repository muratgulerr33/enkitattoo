import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import { Button } from "@/components/ui/button";
import { getRouteContent, hasNoIndex } from "@/lib/route-content";

const ARTISTLER_PATH = "/artistler";
const artistlerContent = getRouteContent(ARTISTLER_PATH);

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
    role: "Master Artist",
    description: "30 yılı aşkın deneyim",
  },
  {
    id: "placeholder-1",
    slug: null,
    name: "Placeholder Artist",
    role: "Tattoo Artist",
    description: "Kısa açıklama placeholder",
  },
  {
    id: "placeholder-2",
    slug: null,
    name: "Placeholder Artist",
    role: "Tattoo Artist",
    description: "Kısa açıklama placeholder",
  },
] as const;

export default function ArtistlerPage() {
  const shortDescription =
    artistlerContent?.shortDescription ||
    artistlerContent?.description ||
    "Stüdyomuzdaki sanatçılar.";
  const longDescription =
    artistlerContent?.description &&
    artistlerContent.description !== shortDescription
      ? artistlerContent.description
      : null;

  return (
    <div className="app-section no-overflow-x">
      <BreadcrumbListJsonLd path="/artistler" />

      <header>
        {artistlerContent?.microLine ? (
          <p className="t-small text-muted-foreground">{artistlerContent.microLine}</p>
        ) : null}
        <h1 className="typo-page-title">{artistlerContent?.h1 || "Artistler"}</h1>
        <p className="t-muted mt-1">{shortDescription}</p>
        {longDescription ? <p className="t-muted mt-2">{longDescription}</p> : null}
      </header>

      <ul className="flex min-w-0 flex-col gap-4" role="list">
        {ARTISTS.map((artist) => (
          <li key={artist.id} className="min-w-0">
            <article className="flex min-w-0 items-start gap-4 rounded-xl border border-border bg-surface-2 p-4 shadow-soft">
              <div className="size-20 shrink-0 rounded-lg bg-muted" aria-hidden />
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="min-w-0">
                  {artist.slug ? (
                    <h2 className="t-h4 truncate text-foreground">
                      <Link href={`/artistler/${artist.slug}`}>{artist.name}</Link>
                    </h2>
                  ) : (
                    <h2 className="t-h4 truncate text-foreground">{artist.name}</h2>
                  )}
                  <p className="t-small text-muted-foreground">{artist.role}</p>
                  <p className="t-muted mt-1">{artist.description}</p>
                </div>
                {artist.slug ? (
                  <Button asChild variant="outline" size="sm" className="self-start">
                    <Link href={`/artistler/${artist.slug}`}>İncele</Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="self-start" disabled>
                    İncele
                  </Button>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
