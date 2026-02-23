import { GaleriFilters } from "./galeri-filters";
import { getRouteContent } from "@/lib/route-content";

interface PageProps {
  searchParams: Promise<{ style?: string; theme?: string }>;
}

export default async function GaleriPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const content = getRouteContent("/galeri");
  const hasFilters = Boolean(params.style) || Boolean(params.theme);
  const mockCount = hasFilters ? 24 : 32;
  const mockTitleBase =
    "Blackwork Detaylı Kol Kompozisyonu Uzun Başlık Örneği";
  const shortDescription =
    content?.shortDescription || content?.description || "Örnek işler ve stiller.";
  const longDescription =
    content?.description && content.description !== shortDescription
      ? content.description
      : null;

  return (
    <div className="app-section no-overflow-x">
      <header>
        {content?.microLine ? (
          <p className="t-small text-muted-foreground">{content.microLine}</p>
        ) : null}
        <h1 className="typo-page-title">{content?.h1 || "Galeri"}</h1>
        <p className="t-muted mt-1">{shortDescription}</p>
        {longDescription ? <p className="t-muted mt-2">{longDescription}</p> : null}
      </header>

      <GaleriFilters />

      <p className="t-muted mt-4">
        Filtreye göre sonuçlar: <strong className="text-foreground">{mockCount}</strong> öğe
      </p>

      <div className="grid-cards">
        {Array.from({ length: mockCount }).map((_, i) => (
          <article
            key={i}
            className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface-2 shadow-soft"
          >
            <div className="card-media bg-muted/50 bg-gradient-to-br from-surface-1 to-surface-2" />
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
