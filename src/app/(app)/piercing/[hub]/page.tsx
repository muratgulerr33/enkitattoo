import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRouteContent, hasNoIndex, listKnownPaths } from "@/lib/route-content";

interface PageProps {
  params: Promise<{ hub: string }>;
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

export const dynamicParams = false;

export function generateStaticParams() {
  return slugs.map((hub) => ({ hub }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hub: slug } = await params;
  const path = `/piercing/${slug}`;
  const content = getRouteContent(path);

  const metadata: Metadata = {
    title: { absolute: content?.seoTitle ?? "Piercing | Enki Tattoo" },
    description: content?.seoDescription ?? "Piercing detayı.",
    alternates: { canonical: content?.canonical ?? path },
  };

  if (hasNoIndex(content?.indexing)) {
    metadata.robots = { index: false, follow: true };
  }

  return metadata;
}

export default async function PiercingHubPage({ params }: PageProps) {
  const { hub: slug } = await params;

  if (!knownPiercingSlugs.has(slug)) {
    notFound();
  }

  const path = `/piercing/${slug}`;
  const content = getRouteContent(path);

  if (!content) {
    notFound();
  }

  const shortDescription = content.shortDescription || content.description || "Piercing detayı";
  const longDescription =
    content.description && content.description !== shortDescription ? content.description : null;

  return (
    <div className="app-section no-overflow-x">
      <header>
        {content.microLine ? <p className="t-small text-muted-foreground">{content.microLine}</p> : null}
        <h1 className="typo-page-title">{content.h1 || "Piercing"}</h1>
        <p className="t-muted mt-1">{shortDescription}</p>
        {longDescription ? <p className="t-muted mt-2">{longDescription}</p> : null}
      </header>
    </div>
  );
}
