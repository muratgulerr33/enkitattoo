"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { galleryHubFilterOptions } from "@/lib/gallery/manifest.v1";
const GALERI_TASARIM_SLUG = "galeri-tasarim";
const GALERI_TASARIM_PATH = `/${GALERI_TASARIM_SLUG}`;

export function GaleriFilters() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const hub = searchParams.get("hub") ?? "";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${GALERI_TASARIM_PATH}?${next.toString()}`);
  }

  function resetFilters() {
    router.push(GALERI_TASARIM_PATH);
  }

  return (
    <div className="no-overflow-x flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:flex-wrap sm:items-center">
      <Select value={hub || "all"} onValueChange={(v) => setParam("hub", v === "all" ? "" : v)}>
        <SelectTrigger className="w-full border-border bg-surface-1 sm:w-[220px]">
          <SelectValue placeholder={t("pages.gallery.filters.category")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("common.allCategories")}</SelectItem>
          {galleryHubFilterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hub && (
        <button
          type="button"
          onClick={resetFilters}
          className="t-small rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {t("pages.gallery.filters.reset")}
        </button>
      )}
    </div>
  );
}
