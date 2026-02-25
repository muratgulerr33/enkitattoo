import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import { getRouteContent, hasNoIndex } from "@/lib/route-content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const ARTIST_SLUGS = ["halit-yalvac"] as const;
const knownArtistSlugs = new Set<string>(ARTIST_SLUGS);

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTIST_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = `/artistler/${slug}`;
  const content = getRouteContent(path);

  const metadata: Metadata = {
    title: { absolute: content?.seoTitle ?? "Artistler | Enki Tattoo" },
    description: content?.seoDescription ?? "Enki Tattoo artist profili.",
    alternates: { canonical: content?.canonical ?? path },
  };

  if (hasNoIndex(content?.indexing)) {
    metadata.robots = { index: false, follow: true };
  }

  return metadata;
}

export default async function ArtistDetailPage({ params }: PageProps) {
  const { slug } = await params;

  if (!knownArtistSlugs.has(slug)) {
    notFound();
  }

  const path = `/artistler/${slug}`;
  const content = getRouteContent(path);

  if (!content) {
    notFound();
  }

  const shortDescription = content.shortDescription || content.description || "Artist profili";
  const longDescription =
    content.description && content.description !== shortDescription ? content.description : null;

  return (
    <div className="app-section no-overflow-x">
      <BreadcrumbListJsonLd path={path} />

      <header>
        {content.microLine ? <p className="t-small text-muted-foreground">{content.microLine}</p> : null}
        <h1 className="typo-page-title">{content.h1 || "Artist"}</h1>
        <p className="t-muted mt-1">{shortDescription}</p>
        {longDescription ? <p className="t-muted mt-2">{longDescription}</p> : null}
      </header>
    </div>
  );
}
