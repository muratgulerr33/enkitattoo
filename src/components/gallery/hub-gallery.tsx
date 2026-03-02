import { Link } from "@/i18n/navigation";
import { GalleryGrid } from "@/app/[locale]/(app)/galeri-tasarim/gallery-grid";
import { getVisibleGalleryItems, toGalleryHubParam } from "@/lib/gallery/manifest.v1";
import { getTranslations } from "next-intl/server";

interface HubGalleryProps {
  hub: string;
  kind: "kesfet" | "piercing";
}

export async function HubGallery({ hub, kind }: HubGalleryProps) {
  const t = await getTranslations();
  const visibleItems = getVisibleGalleryItems();
  const resolvedHub = kind === "kesfet" ? toGalleryHubParam(hub) : hub;
  const hubItems =
    kind === "kesfet"
      ? visibleItems.filter((item) => item.hub === resolvedHub)
      : visibleItems.filter((item) => item.hub === resolvedHub);

  if (hubItems.length > 0) {
    return <GalleryGrid items={hubItems} />;
  }

  return (
    <section
      className="mt-4 rounded-xl border border-border bg-surface-2 p-5 shadow-soft sm:p-6"
      aria-live="polite"
    >
      <h2 className="t-title-sm text-foreground">{t("pages.gallery.soonTitle")}</h2>
      <p className="t-small mt-2 text-muted-foreground">{t("pages.gallery.soonDescription")}</p>
      <Link
        href="/galeri-tasarim"
        className="t-small mt-3 inline-flex text-foreground underline underline-offset-4 hover:text-muted-foreground"
      >
        {t("pages.gallery.goToGallery")}
      </Link>
    </section>
  );
}
