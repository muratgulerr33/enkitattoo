"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { HubCard } from "@/components/hub/hub-card";
import { Button } from "@/components/ui/button";
import type { HubItem } from "@/lib/hub/hubs.v1";

type FeaturedHubItem = Pick<HubItem, "id" | "titleKey" | "slug" | "descriptionKey"> & {
  href: string;
};

type FeaturedHubRailProps = {
  title: string;
  items: FeaturedHubItem[];
  viewAllHref: string;
};

export type HubChip = {
  label: string;
  href: string;
};

type HubChipRailProps = {
  title: string;
  chips: HubChip[];
  viewAllHref?: string;
  headingId?: string;
};

export function FeaturedHubRail({ title, items, viewAllHref }: FeaturedHubRailProps) {
  const t = useTranslations();
  if (!items.length) {
    return null;
  }

  return (
    <section aria-labelledby="featured-hub-rail-title" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="featured-hub-rail-title" className="t-h4 text-foreground">
          {title}
        </h2>
        <Button asChild variant="ghost" size="sm">
          <Link href={viewAllHref}>{t("common.viewAll")}</Link>
        </Button>
      </div>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
        {items.map((hub) => (
          <div key={hub.id} className="w-[min(78vw,20rem)] shrink-0 snap-start">
            <HubCard
              titleKey={hub.titleKey}
              slug={hub.slug}
              href={hub.href}
              descriptionKey={hub.descriptionKey}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function HubChipRail({
  title,
  chips,
  viewAllHref,
  headingId = "hub-chip-rail-title",
}: HubChipRailProps) {
  const t = useTranslations();
  if (!chips.length) {
    return null;
  }

  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id={headingId} className="t-h4 text-foreground">
          {title}
        </h2>
        {viewAllHref ? (
          <Button asChild variant="ghost" size="sm">
            <Link href={viewAllHref}>{t("common.viewAll")}</Link>
          </Button>
        ) : null}
      </div>
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 scroll-px-4 [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
        {chips.map((chip) => (
          <Link
            key={`${chip.label}-${chip.href}`}
            href={chip.href}
            prefetch={false}
            className="shrink-0 snap-start whitespace-nowrap rounded-full border border-border bg-surface-2 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-full"
          >
            {chip.label}
          </Link>
        ))}
        <div className="w-4 shrink-0" aria-hidden="true" />
      </div>
    </section>
  );
}
