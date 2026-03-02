export const PIERCING_LABEL_KEYS: Record<string, string> = {
  "/piercing/kulak": "piercing.labels.kulak",
  "/piercing/burun": "piercing.labels.burun",
  "/piercing/kas": "piercing.labels.kas",
  "/piercing/dudak": "piercing.labels.dudak",
  "/piercing/dil": "piercing.labels.dil",
  "/piercing/gobek": "piercing.labels.gobek",
  "/piercing/septum": "piercing.labels.septum",
  "/piercing/industrial": "piercing.labels.industrial",
  "/piercing/kisiye-ozel": "piercing.labels.kisiye-ozel",
};

function normalizeSlug(slug: string): string {
  const trimmed = slug.trim();
  if (!trimmed) {
    return "/";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function getPiercingLabelKey(slug: string): string {
  const normalizedSlug = normalizeSlug(slug);
  const knownLabelKey = PIERCING_LABEL_KEYS[normalizedSlug];
  if (knownLabelKey) {
    return knownLabelKey;
  }

  return "piercing.labels.default";
}
