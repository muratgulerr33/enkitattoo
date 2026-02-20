import { Skeleton } from "@/components/ui/skeleton";
import { GaleriFilters } from "./galeri-filters";

interface PageProps {
  searchParams: Promise<{ style?: string; artist?: string; theme?: string }>;
}

export default async function GaleriPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const hasFilters =
    Boolean(params.style) || Boolean(params.artist) || Boolean(params.theme);
  const mockCount = hasFilters ? 24 : 32;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="t-h2 text-foreground">Galeri</h1>
        <p className="t-muted mt-1">Örnek işler ve stiller.</p>
      </header>

      <GaleriFilters />

      <p className="t-muted mt-4">
        Filtreye göre sonuçlar: <strong className="text-foreground">{mockCount}</strong> öğe
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: mockCount }).map((_, i) => (
          <Skeleton
            key={i}
            className="aspect-square w-full rounded-xl border border-border bg-muted"
          />
        ))}
      </div>
    </div>
  );
}
