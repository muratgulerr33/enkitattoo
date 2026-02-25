import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import { whatsappUrl } from "@/lib/mock/enki";
import { getRouteContent, hasNoIndex, listKnownPaths } from "@/lib/route-content";
import { getPiercingIcon } from "@/lib/piercing/piercing-icons";
import { getPiercingLabel } from "@/lib/piercing/piercing-labels";
import { FeaturedPiercingCarousel } from "@/components/piercing/featured-piercing-carousel";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const PIERCING_PATH = "/piercing";
const PIERCING_HERO_COVER_PATH = "/piercing-hero/cover.webp";
const hasHeroCover = fs.existsSync(path.join(process.cwd(), "public", "piercing-hero", "cover.webp"));
const piercingContent = getRouteContent(PIERCING_PATH);
const knownPiercingPaths = listKnownPaths().filter(
  (pathValue) => pathValue.startsWith("/piercing/") && pathValue !== PIERCING_PATH,
);

export function generateMetadata(): Metadata {
  if (!piercingContent) {
    return {};
  }

  const metadata: Metadata = {};

  if (piercingContent.seoTitle) {
    metadata.title = { absolute: piercingContent.seoTitle };
  }
  if (piercingContent.seoDescription) {
    metadata.description = piercingContent.seoDescription;
  }
  if (piercingContent.canonical) {
    metadata.alternates = { canonical: piercingContent.canonical };
  }
  if (hasNoIndex(piercingContent.indexing)) {
    metadata.robots = { index: false, follow: true };
  }

  return metadata;
}

export default function PiercingPage() {
  const shortDescription =
    piercingContent?.shortDescription ||
    piercingContent?.description ||
    "Kulak, burun, septum ve daha fazlası. Profesyonel piercing hizmeti için bize yazın.";
  const detailsDescription = piercingContent?.description || shortDescription;

  return (
    <div className="app-section no-overflow-x pb-[calc(env(safe-area-inset-bottom)+96px)] sm:pb-0">
      <BreadcrumbListJsonLd path="/piercing" />

      <header className="space-y-4">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border">
          {hasHeroCover ? (
            <Image
              fill
              priority
              src={PIERCING_HERO_COVER_PATH}
              alt="Piercing hero kapak görseli"
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-surface-1 to-surface-2" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3 text-white">
            <h1 className="line-clamp-1 text-2xl font-semibold text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)]">
              {piercingContent?.h1 || "Piercing"}
            </h1>
            <p className="line-clamp-1 text-sm text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
              {shortDescription}
            </p>
          </div>
        </div>
      </header>

      <section>
        <Button asChild size="lg" className="w-full">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Piercing için yaz
          </a>
        </Button>
        {piercingContent?.microLine ? (
          <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">{piercingContent.microLine}</p>
        ) : null}
      </section>

      <FeaturedPiercingCarousel />

      <section aria-labelledby="piercing-categories">
        <h2 id="piercing-categories" className="t-h4 text-foreground mb-3">
          Kategoriler
        </h2>
        <div className="grid-cards">
          {knownPiercingPaths.map((pathValue) => {
            const label = getPiercingLabel(pathValue);
            const Icon = getPiercingIcon(pathValue);
            const isCustom =
              pathValue === "/piercing/kisiye-ozel" || pathValue.endsWith("/kisiye-ozel");

            return (
              <Link
                key={pathValue}
                href={pathValue}
                className={`flex min-h-14 items-center gap-3 rounded-xl border border-border bg-surface-2 p-4 shadow-soft transition-colors hover:bg-accent/50 ${
                  isCustom ? "col-span-2" : ""
                }`}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <span className="t-body text-foreground">{label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="piercing-details">
        <h2 id="piercing-details" className="t-h4 text-foreground mb-3">
          Detaylar
        </h2>

        <Collapsible className="rounded-xl border border-border bg-surface-2 px-4 shadow-soft">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="group flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 py-3 text-left font-medium"
            >
              <span>
                <span className="group-data-[state=open]:hidden">Detayları göster</span>
                <span className="hidden group-data-[state=open]:inline">Detayları gizle</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent forceMount>
            <p className="t-muted">{detailsDescription}</p>
          </CollapsibleContent>
        </Collapsible>
      </section>

      <section aria-labelledby="piercing-faq">
        <h2 id="piercing-faq" className="t-h4 text-foreground mb-3">
          Sık sorulanlar
        </h2>

        <Collapsible className="rounded-xl border border-border bg-surface-2 px-4 shadow-soft">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="group flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 py-3 text-left font-medium"
            >
              <span>
                <span className="group-data-[state=open]:hidden">Sık sorulanları göster</span>
                <span className="hidden group-data-[state=open]:inline">Sık sorulanları gizle</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent forceMount>
            <dl className="space-y-4">
              <div>
                <dt className="t-body font-medium text-foreground">
                  Piercing sonrası bakım nasıl olmalı?
                </dt>
                <dd className="t-muted mt-1">Öneriler randevu sonrası size iletilecektir.</dd>
              </div>
              <div>
                <dt className="t-body font-medium text-foreground">
                  Hangi bölgelere piercing yapıyorsunuz?
                </dt>
                <dd className="t-muted mt-1">Kulak, burun, septum, kaş, dil ve daha fazlası.</dd>
              </div>
              <div>
                <dt className="t-body font-medium text-foreground">Randevu nasıl alınır?</dt>
                <dd className="t-muted mt-1">
                  WhatsApp üzerinden bize yazarak randevu alabilirsiniz.
                </dd>
              </div>
            </dl>
          </CollapsibleContent>
        </Collapsible>
      </section>
    </div>
  );
}
