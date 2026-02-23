import { Button } from "@/components/ui/button";

const ARTISTS = [
  {
    id: "halit-yalvac",
    name: "Halit Yalvaç",
    role: "Master Artist",
    description: "30 yılı aşkın deneyim",
  },
  {
    id: "placeholder-1",
    name: "Placeholder Artist",
    role: "Tattoo Artist",
    description: "Kısa açıklama placeholder",
  },
  {
    id: "placeholder-2",
    name: "Placeholder Artist",
    role: "Tattoo Artist",
    description: "Kısa açıklama placeholder",
  },
] as const;

export default function ArtistlerPage() {
  return (
    <div className="app-section no-overflow-x">
      <header>
        <h1 className="typo-page-title">Artistler</h1>
        <p className="t-muted mt-1">Stüdyomuzdaki sanatçılar.</p>
      </header>

      <ul className="flex min-w-0 flex-col gap-4" role="list">
        {ARTISTS.map((artist) => (
          <li key={artist.id} className="min-w-0">
            <article className="flex min-w-0 items-start gap-4 rounded-xl border border-border bg-surface-2 p-4 shadow-soft">
              <div className="size-20 shrink-0 rounded-lg bg-muted" aria-hidden />
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="min-w-0">
                  <h2 className="t-h4 truncate text-foreground">{artist.name}</h2>
                  <p className="t-small text-muted-foreground">{artist.role}</p>
                  <p className="t-muted mt-1">{artist.description}</p>
                </div>
                <Button variant="outline" size="sm" className="self-start">
                  İncele
                </Button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
