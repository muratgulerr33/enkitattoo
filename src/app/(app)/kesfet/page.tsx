import Link from "next/link";
import { mainHubs, specialHubs } from "@/lib/hub/hubs.v1";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";

function HubCard({
  titleTR,
  slug,
  descriptionTR,
}: {
  titleTR: string;
  slug: string;
  descriptionTR: string;
}) {
  return (
    <Link
      href={`/kesfet/${slug}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface-2 shadow-soft transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="card-media bg-muted/60 bg-gradient-to-br from-surface-1 to-surface-2" />
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <h2 className="t-h4 text-foreground">{titleTR}</h2>
        <p className="t-muted line-clamp-1">{descriptionTR}</p>
        <span className="t-small mt-2 inline-flex items-center gap-1 text-primary">
          Tümünü gör
          <ChevronRight className="size-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export default function KesfetPage() {
  return (
    <div className="app-section no-overflow-x">
      <header>
        <h1 className="typo-page-title">Keşfet</h1>
        <p className="t-muted mt-1">
          Stilini seç, örnekleri gör, hızlı randevu al.
        </p>
      </header>

      <section aria-labelledby="hub-main" className="space-y-4">
        <h2 id="hub-main" className="sr-only">
          Stil kategorileri
        </h2>
        <div className="grid-cards">
          {mainHubs.map((hub) => (
            <HubCard
              key={hub.id}
              titleTR={hub.titleTR}
              slug={hub.slug}
              descriptionTR={hub.descriptionTR}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="hub-special">
        <h2 id="hub-special" className="t-h4 text-foreground mb-3">
          Özel
        </h2>
        <div className="grid-cards">
          {specialHubs.map((hub) => (
            <div key={hub.id} className="min-w-0">
              <HubCard
                titleTR={hub.titleTR}
                slug={hub.slug}
                descriptionTR={hub.descriptionTR}
              />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="piercing-cta">
        <h2 id="piercing-cta" className="sr-only">
          Piercing
        </h2>
        <Link
          href="/piercing"
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface-2 px-4 py-5 shadow-soft transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-6 lg:px-8"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Sparkles className="size-7 text-muted-foreground" />
            </div>
            <div>
              <h3 className="t-h4 text-foreground">Piercing</h3>
              <p className="t-muted mt-0.5">
                Kulak, burun, septum ve daha fazlası. Profesyonel piercing
                hizmeti.
              </p>
            </div>
          </div>
          <Button variant="default" size="lg" className="mt-4 w-full shrink-0 sm:mt-0 sm:w-auto">
            Piercing için yaz
          </Button>
        </Link>
      </section>

      <section aria-labelledby="popular">
        <h2 id="popular" className="t-h4 text-foreground mb-3">
          En çok tercih edilenler
        </h2>
        <div className="flex flex-wrap gap-2">
          {["Realism", "Minimal", "Lettering", "Portre"].map((label) => (
            <span
              key={label}
              className="rounded-full border border-border bg-surface-2 px-4 py-2 text-sm text-muted-foreground"
            >
              {label}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
