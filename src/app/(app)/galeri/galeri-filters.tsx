"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mainHubs, specialHubs, themeFilters } from "@/lib/hub/hubs.v1";

const MOCK_ARTISTS = [
  { id: "ali", name: "Ali" },
  { id: "ayse", name: "Ayşe" },
  { id: "mehmet", name: "Mehmet" },
  { id: "zeynep", name: "Zeynep" },
  { id: "can", name: "Can" },
  { id: "deniz", name: "Deniz" },
];

const allStyleOptions = [...mainHubs, ...specialHubs];

function themeLabel(key: string): string {
  const labels: Record<string, string> = {
    angel: "Melek",
    eyes: "Göz",
    animal: "Hayvan",
    supporter: "Taraftar",
    couple: "Çift",
    floral: "Çiçek",
    geometric: "Geometrik",
    religious_spiritual: "Dini / Ruhani",
  };
  return labels[key] ?? key;
}

export function GaleriFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const style = searchParams.get("style") ?? "";
  const artist = searchParams.get("artist") ?? "";
  const theme = searchParams.get("theme") ?? "";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/galeri?${next.toString()}`);
  }

  function resetFilters() {
    router.push("/galeri");
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:flex-wrap md:items-center">
      <Select value={style || "all"} onValueChange={(v) => setParam("style", v === "all" ? "" : v)}>
        <SelectTrigger className="w-full border-border bg-surface-1 md:w-[180px]">
          <SelectValue placeholder="Stil" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm stiller</SelectItem>
          {allStyleOptions.map((hub) => (
            <SelectItem key={hub.id} value={hub.slug}>
              {hub.titleTR}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={artist || "all"} onValueChange={(v) => setParam("artist", v === "all" ? "" : v)}>
        <SelectTrigger className="w-full border-border bg-surface-1 md:w-[160px]">
          <SelectValue placeholder="Artist" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm artistler</SelectItem>
          {MOCK_ARTISTS.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={theme || "all"} onValueChange={(v) => setParam("theme", v === "all" ? "" : v)}>
        <SelectTrigger className="w-full border-border bg-surface-1 md:w-[180px]">
          <SelectValue placeholder="Tema" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm temalar</SelectItem>
          {themeFilters.map((t) => (
            <SelectItem key={t} value={t}>
              {themeLabel(t)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {(style || artist || theme) && (
        <button
          type="button"
          onClick={resetFilters}
          className="t-small rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Filtreleri sıfırla
        </button>
      )}
    </div>
  );
}
