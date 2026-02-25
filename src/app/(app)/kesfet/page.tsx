import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import { mainHubs, specialHubs } from "@/lib/hub/hubs.v1";
import { HubCard } from "@/components/hub/hub-card";
import { getRouteContent, hasNoIndex, listKnownPaths } from "@/lib/route-content";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const KESFET_PATH = "/kesfet";
const kesfetContent = getRouteContent(KESFET_PATH);
const knownKesfetPaths = new Set(
  listKnownPaths().filter((path) => path.startsWith("/kesfet/")),
);

export function generateMetadata(): Metadata {
  if (!kesfetContent) {
    return {};
  }

  const metadata: Metadata = {};

  if (kesfetContent.seoTitle) {
    metadata.title = { absolute: kesfetContent.seoTitle };
  }
  if (kesfetContent.seoDescription) {
    metadata.description = kesfetContent.seoDescription;
  }
  if (kesfetContent.canonical) {
    metadata.alternates = { canonical: kesfetContent.canonical };
  }
  if (hasNoIndex(kesfetContent.indexing)) {
    metadata.robots = { index: false, follow: true };
  }

  return metadata;
}

export default function KesfetPage() {
  const heading = kesfetContent?.h1 || "Keşfet";
  const shortDescription =
    kesfetContent?.shortDescription ||
    kesfetContent?.description ||
    "Stilini seç, örnekleri gör, hızlı randevu al.";
  const longDescription =
    kesfetContent?.description && kesfetContent.description !== shortDescription
      ? kesfetContent.description
      : null;

  const mainHubCards = mainHubs
    .map((hub) => ({ ...hub, href: `/kesfet/${hub.slug}` }))
    .filter((hub) => knownKesfetPaths.has(hub.href));
  const specialHubCards = specialHubs
    .map((hub) => ({ ...hub, href: `/kesfet/${hub.slug}` }))
    .filter((hub) => knownKesfetPaths.has(hub.href));

  return (
    <div className="app-section no-overflow-x">
      <BreadcrumbListJsonLd path="/kesfet" />

      <header>
        {kesfetContent?.microLine ? (
          <p className="t-small text-muted-foreground">{kesfetContent.microLine}</p>
        ) : null}
        <h1 className="typo-page-title">{heading}</h1>
        <p className="t-muted mt-1">{shortDescription}</p>
        {longDescription ? <p className="t-muted mt-2">{longDescription}</p> : null}
      </header>

      <section aria-labelledby="hub-main" className="space-y-4">
        <h2 id="hub-main" className="sr-only">
          Stil kategorileri
        </h2>
        <div className="grid-cards">
          {mainHubCards.map((hub) => (
            <div key={hub.id} className="min-w-0">
              <HubCard
                titleTR={hub.titleTR}
                slug={hub.slug}
                href={hub.href}
                descriptionTR={hub.descriptionTR}
              />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="hub-special">
        <h2 id="hub-special" className="t-h4 text-foreground mb-3">
          Özel
        </h2>
        <div className="grid-cards">
          {specialHubCards.map((hub) => (
            <div key={hub.id} className="min-w-0">
              <HubCard
                titleTR={hub.titleTR}
                slug={hub.slug}
                href={hub.href}
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
