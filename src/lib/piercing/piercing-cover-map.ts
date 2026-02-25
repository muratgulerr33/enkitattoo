export type PiercingCoverKey = "kulak" | "burun" | "kas" | "dudak" | "dil" | "gobek";

export const PIERCING_COVER_MAP: Record<PiercingCoverKey, string> = {
  kulak: "/kulak-cover.webp",
  burun: "/burun-cover.webp",
  kas: "/kas-cover.webp",
  dudak: "/dudak-cover.webp",
  dil: "/dil-cover.webp",
  gobek: "/gobek-cover.webp",
};

const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
};

export function normalizePiercingCoverKey(value: string): string {
  const segments = value.split("/").filter(Boolean);
  const fromPath = segments.length > 0 ? segments[segments.length - 1] : value;

  return fromPath
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (char) => TURKISH_CHAR_MAP[char] ?? char)
    .replace(/[^a-z0-9]+/g, "");
}

export function getPiercingCoverSrc(value: string): string | undefined {
  const normalized = normalizePiercingCoverKey(value);
  return PIERCING_COVER_MAP[normalized as PiercingCoverKey];
}
