import { promises as fs } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { GaleriFilters } from "./filters";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import { getRouteContent, hasNoIndex } from "@/lib/route-content";

const GALERI_TASARIM_SLUG = "galeri-tasarim";
const GALERI_TASARIM_PATH = `/${GALERI_TASARIM_SLUG}`;
const galeriContent = getRouteContent(GALERI_TASARIM_PATH);

export function generateMetadata(): Metadata {
  const metadata: Metadata = {
    title: { absolute: galeriContent?.seoTitle ?? "Galeri | Enki Tattoo" },
    description: galeriContent?.seoDescription ?? "Dövme tasarım galerisi.",
    alternates: { canonical: galeriContent?.canonical ?? GALERI_TASARIM_PATH },
  };

  if (hasNoIndex(galeriContent?.indexing)) {
    metadata.robots = { index: false, follow: true };
  }

  return metadata;
}

interface PageProps {
  searchParams: Promise<{ style?: string; theme?: string }>;
}

export default async function GaleriPage({ searchParams }: PageProps) {
  await searchParams;
  const content = galeriContent;
  const mockCount = 32;
  const mockTitleBase =
    "Blackwork Detaylı Kol Kompozisyonu Uzun Başlık Örneği";
  const shortDescription =
    content?.shortDescription || content?.description || "Örnek işler ve stiller.";
  const longDescription =
    content?.description && content.description !== shortDescription
      ? content.description
      : null;
  const galleryDir = path.join(process.cwd(), "public", "gallery");
  let imageFiles: string[] = [];

  try {
    const files = await fs.readdir(galleryDir);
    imageFiles = files
      .filter((file) => file.toLowerCase().endsWith(".webp"))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    imageFiles = [];
  }

  const images = imageFiles.map((file, index) => {
    const name = file.replace(/\.webp$/i, "");
    const label = name.replace(/[_-]+/g, " ").trim();

    return {
      file,
      src: `/gallery/${file}`,
      alt: "Enki Tattoo dövme örneği",
      title: label || `Galeri işi #${index + 1}`,
    };
  });
  const hasRealImages = images.length > 0;
  const resultCount = hasRealImages ? images.length : mockCount;
  const placeholderIds = Array.from(
    { length: mockCount },
    (_, index) => `placeholder-${index + 1}`,
  );

  return (
    <div className="app-section no-overflow-x">
      <BreadcrumbListJsonLd path="/galeri-tasarim" />

      <header>
        {content?.microLine ? (
          <p className="t-small text-muted-foreground">{content.microLine}</p>
        ) : null}
        <h1 className="typo-page-title">{content?.h1 || "Galeri Tasarım"}</h1>
        <p className="t-muted mt-1">{shortDescription}</p>
        {longDescription ? <p className="t-muted mt-2">{longDescription}</p> : null}
      </header>

      <GaleriFilters />

      <p className="t-muted mt-4">
        Filtreye göre sonuçlar: <strong className="text-foreground">{resultCount}</strong> öğe
      </p>

      <div className="grid-cards">
        {hasRealImages
          ? images.map((image, index) => (
              <article
                key={image.file}
                className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface-2 shadow-soft"
              >
                <div className="card-media-gallery relative overflow-hidden bg-muted/50 bg-gradient-to-br from-surface-1 to-surface-2">
                  <Image
                    src={image.src}
                    alt={`${image.alt} ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
                  <h2 className="t-small truncate font-medium text-foreground">
                    {image.title}
                  </h2>
                  <p className="t-caption line-clamp-1 text-muted-foreground">
                    Galeri görseli #{index + 1}
                  </p>
                </div>
              </article>
            ))
          : placeholderIds.map((placeholderId, i) => (
              <article
                key={placeholderId}
                className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface-2 shadow-soft"
              >
                <div className="card-media-gallery bg-muted/50 bg-gradient-to-br from-surface-1 to-surface-2" />
                <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
                  <h2 className="t-small truncate font-medium text-foreground">
                    {mockTitleBase} #{i + 1}
                  </h2>
                  <p className="t-caption line-clamp-1 text-muted-foreground">
                    Galeri açıklaması placeholder metni.
                  </p>
                </div>
              </article>
            ))}
      </div>
    </div>
  );
}
