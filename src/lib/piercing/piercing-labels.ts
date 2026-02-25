export const PIERCING_LABELS: Record<string, string> = {
  "/piercing/kulak": "Kulak",
  "/piercing/burun": "Burun",
  "/piercing/kas": "Kaş",
  "/piercing/dudak": "Dudak",
  "/piercing/dil": "Dil",
  "/piercing/gobek": "Göbek",
  "/piercing/septum": "Septum",
  "/piercing/industrial": "Industrial",
  "/piercing/kisiye-ozel": "Kişiye Özel",
};

const TR_SEGMENT_OVERRIDES: Record<string, string> = {
  kas: "Kaş",
  gobek: "Göbek",
  kisiye: "Kişiye",
  ozel: "Özel",
  diger: "Diğer",
};

function normalizeSlug(slug: string): string {
  const trimmed = slug.trim();
  if (!trimmed) {
    return "/";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function toTitleCase(segment: string): string {
  const lowerSegment = segment.toLocaleLowerCase("tr-TR");
  const override = TR_SEGMENT_OVERRIDES[lowerSegment];
  if (override) {
    return override;
  }

  return lowerSegment.charAt(0).toLocaleUpperCase("tr-TR") + lowerSegment.slice(1);
}

export function getPiercingLabel(slug: string): string {
  const normalizedSlug = normalizeSlug(slug);
  const knownLabel = PIERCING_LABELS[normalizedSlug];
  if (knownLabel) {
    return knownLabel;
  }

  const lastSegment = normalizedSlug.split("/").filter(Boolean).pop();
  if (!lastSegment) {
    return "Piercing";
  }

  return lastSegment
    .split("-")
    .filter(Boolean)
    .map(toTitleCase)
    .join(" ");
}
