/**
 * ENKI Tattoo — Kategori Hub Mimarisi V1
 * Single config, no duplication.
 */

export interface HubItem {
  id: string;
  titleTR: string;
  slug: string;
  descriptionTR: string;
  tags: string[];
  coverKey: string;
  icon: string;
}

export const mainHubs: HubItem[] = [
  {
    id: "minimal_fine_line",
    titleTR: "Minimal & Fine Line",
    slug: "minimal-fine-line",
    descriptionTR: "İnce çizgiler ve sade tasarımlar.",
    tags: ["minimal", "fine_line"],
    coverKey: "minimal_fine_line",
    icon: "PenTool",
  },
  {
    id: "lettering",
    titleTR: "Lettering",
    slug: "lettering",
    descriptionTR: "Yazı ve tipografi dövmeleri.",
    tags: ["lettering"],
    coverKey: "lettering",
    icon: "Type",
  },
  {
    id: "realism",
    titleTR: "Realism",
    slug: "realism",
    descriptionTR: "Gerçekçi ve detaylı işler.",
    tags: ["realism", "micro_realism"],
    coverKey: "realism",
    icon: "Image",
  },
  {
    id: "portrait",
    titleTR: "Portre",
    slug: "portrait",
    descriptionTR: "Portre ve yüz dövmeleri.",
    tags: ["portrait"],
    coverKey: "portrait",
    icon: "User",
  },
  {
    id: "traditional_old_school",
    titleTR: "Traditional / Old School",
    slug: "traditional-old-school",
    descriptionTR: "Klasik ve geleneksel tarz.",
    tags: ["traditional", "old_school"],
    coverKey: "traditional_old_school",
    icon: "Circle",
  },
  {
    id: "cover_up",
    titleTR: "Cover Up",
    slug: "cover-up",
    descriptionTR: "Eski dövmelerin örtülmesi.",
    tags: ["cover_up"],
    coverKey: "cover_up",
    icon: "RefreshCw",
  },
];

export const specialHubs: HubItem[] = [
  {
    id: "ataturk",
    titleTR: "Atatürk",
    slug: "ataturk",
    descriptionTR: "Atatürk portre, imza, siluet ve milli tema.",
    tags: ["ataturk_portre", "imza", "siluet", "milli_tema"],
    coverKey: "ataturk",
    icon: "Star",
  },
  {
    id: "blackwork",
    titleTR: "Blackwork",
    slug: "blackwork",
    descriptionTR: "Siyah ağırlıklı geometrik ve bold işler.",
    tags: ["blackwork"],
    coverKey: "blackwork",
    icon: "Circle",
  },
  {
    id: "custom",
    titleTR: "Özel Tasarım",
    slug: "custom",
    descriptionTR: "Size özel tasarım ve fikir.",
    tags: ["custom"],
    coverKey: "custom",
    icon: "Palette",
  },
];

/** Theme filters only (not hubs) for Galeri. */
export const themeFilters: string[] = [
  "angel",
  "eyes",
  "animal",
  "supporter",
  "couple",
  "floral",
  "geometric",
  "religious_spiritual",
];

/** Piercing categories for Piercing page. */
export const piercingCategories: string[] = [
  "kulak",
  "burun",
  "kas",
  "dudak",
  "dil",
  "gobek",
  "septum",
  "industrial",
  "diger",
];

const allHubSlugs = new Set([
  ...mainHubs.map((h) => h.slug),
  ...specialHubs.map((h) => h.slug),
]);

export function getHubBySlug(slug: string): HubItem | undefined {
  return [...mainHubs, ...specialHubs].find((h) => h.slug === slug);
}

export function isValidHubSlug(slug: string): boolean {
  return allHubSlugs.has(slug);
}
