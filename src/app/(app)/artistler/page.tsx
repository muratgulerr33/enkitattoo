import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MOCK_ARTISTS = [
  { id: "ali", name: "Ali", specialties: ["Realism", "Portre"] },
  { id: "ayse", name: "Ayşe", specialties: ["Fine Line", "Minimal"] },
  { id: "mehmet", name: "Mehmet", specialties: ["Lettering", "Blackwork"] },
  { id: "zeynep", name: "Zeynep", specialties: ["Realism", "Piercing"] },
  { id: "can", name: "Can", specialties: ["Traditional", "Cover Up"] },
];

export default function ArtistlerPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="t-h2 text-foreground">Artistler</h1>
        <p className="t-muted mt-1">Stüdyomuzdaki sanatçılar ve uzmanlık alanları.</p>
      </header>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" role="list">
        {MOCK_ARTISTS.map((artist) => (
          <li key={artist.id}>
            <article className="flex flex-col gap-4 rounded-xl border border-border bg-surface-2 p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="size-14 shrink-0">
                  <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                    {artist.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="t-h4 text-foreground">{artist.name}</h2>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {artist.specialties.map((s) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="border-border bg-surface-1 text-muted-foreground"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link href={`/galeri?artist=${artist.id}`}>İşlerini gör</Link>
              </Button>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
