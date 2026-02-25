/**
 * ENKI Tattoo — Kategori Hub Mimarisi V1
 * Single config, no duplication.
 */

export interface HubItem {
  id: string;
  titleTR: string;
  slug: string;
  descriptionTR: string;
  seoTitleTR?: string;
  seoDescriptionTR?: string;
  canonicalPath?: string;
  tags: string[];
  coverKey: string;
  icon: string;
}

export const mainHubs: HubItem[] = [
  {
    id: "minimal_fine_line",
    titleTR: "Minimal & Fine Line",
    slug: "minimal-fine-line-dovme",
    descriptionTR: "İnce çizgiler ve sade tasarımlar.",
    seoTitleTR: "Fine Line & Minimal Dövme | Enki Tattoo",
    seoDescriptionTR:
      "Minimal tattoo, fine line, linework ve micro tarzında kol-bacak örnekleri; ince çizgi, küçük dövme ve sade tasarımlar. Hemen ulaş.Anında tasarla.",
    canonicalPath: "/kesfet/minimal-fine-line-dovme",
    tags: ["minimal", "fine_line"],
    coverKey: "minimal_fine_line",
    icon: "PenTool",
  },
  {
    id: "lettering",
    titleTR: "Lettering",
    slug: "yazi-isim-dovmesi",
    descriptionTR: "Yazı ve tipografi dövmeleri.",
    seoTitleTR: "Lettering (Yazı/İsim) Dövme | Enki Tattoo",
    seoDescriptionTR:
      "İsim, tarih, harf, el yazısı ve çift yazısı lettering dövme tasarım fikirleri. Kol/bilek için ideal. WhatsApp’tan yaz, fiyat al.",
    canonicalPath: "/kesfet/yazi-isim-dovmesi",
    tags: ["lettering"],
    coverKey: "lettering",
    icon: "Type",
  },
  {
    id: "realism",
    titleTR: "Realism",
    slug: "realistik-dovme",
    descriptionTR: "Gerçekçi ve detaylı işler.",
    seoTitleTR: "Realistik Dövme | Enki Tattoo",
    seoDescriptionTR:
      "Realistik dövme: fotoğraf gibi detay, ışık-gölge. Kol, bacak, sırt ve göğüs tasarım uygulamaları. WhatsApp’tan yaz, fiyat öğren.",
    canonicalPath: "/kesfet/realistik-dovme",
    tags: ["realism", "micro_realism"],
    coverKey: "realism",
    icon: "Image",
  },
  {
    id: "portrait",
    titleTR: "Portre",
    slug: "portre-dovme",
    descriptionTR: "Portre ve yüz dövmeleri.",
    seoTitleTR: "Portre Dövme (Kadın/Erkek) | Enki Tattoo",
    seoDescriptionTR:
      "Portre dövme: kadın/erkek/çocuk ve hayvan portreleri. Kol, bacak, sırt, göğüs için tasarım. WhatsApp’tan yaz, fiyat öğren.",
    canonicalPath: "/kesfet/portre-dovme",
    tags: ["portrait"],
    coverKey: "portrait",
    icon: "User",
  },
  {
    id: "traditional_old_school",
    titleTR: "Traditional / Old School",
    slug: "traditional-dovme",
    descriptionTR: "Klasik ve geleneksel tarz.",
    seoTitleTR: "Old School & Traditional Dövme | Enki Tattoo",
    seoDescriptionTR:
      "Old school/traditional: kalın çizgi, canlı renk, klasik ikonlar. Kol, bacak, sırt için. Fiyat al. Tasarıma başla!",
    canonicalPath: "/kesfet/traditional-dovme",
    tags: ["traditional", "old_school"],
    coverKey: "traditional_old_school",
    icon: "Circle",
  },
  {
    id: "cover_up",
    titleTR: "Cover Up",
    slug: "dovme-kapatma",
    descriptionTR: "Eski dövmelerin örtülmesi.",
    seoTitleTR: "Cover-Up (Kapatma) / Dövme Sildirme | Enki Tattoo",
    seoDescriptionTR:
      "Cover-up: yeni tasarım ile eski dövmeyi kapatma,düzeltme veya dövme sildirme. Hemen teklif al.",
    canonicalPath: "/kesfet/dovme-kapatma",
    tags: ["cover_up"],
    coverKey: "cover_up",
    icon: "RefreshCw",
  },
];

export const specialHubs: HubItem[] = [
  {
    id: "ataturk",
    titleTR: "Atatürk",
    slug: "ataturk-temali-dovme",
    descriptionTR: "Atatürk portre, imza, siluet ve milli tema.",
    seoTitleTR: "Atatürk Dövmesi (Portre/İmza) | Enki Tattoo",
    seoDescriptionTR:
      "Atatürk dövmesi için portre, imza ve silüet tasarım seçenekleri. Anlamını konuşalım; Hemen ara. Fiyat al!",
    canonicalPath: "/kesfet/ataturk-temali-dovme",
    tags: ["ataturk_portre", "imza", "siluet", "milli_tema"],
    coverKey: "ataturk",
    icon: "Star",
  },
  {
    id: "blackwork",
    titleTR: "Blackwork",
    slug: "blackwork-dovme",
    descriptionTR: "Siyah ağırlıklı geometrik ve bold işler.",
    seoTitleTR: "Blackwork Dövme | Enki Tattoo",
    seoDescriptionTR:
      "Blackwork: yoğun siyah ve keskin kontrastla güçlü tasarım. Kol, bacak, sırt örnekleri. Tasarımını seç fiyat al.",
    canonicalPath: "/kesfet/blackwork-dovme",
    tags: ["blackwork"],
    coverKey: "blackwork",
    icon: "Circle",
  },
  {
    id: "custom",
    titleTR: "Özel Tasarım",
    slug: "kisiye-ozel-dovme-tasarimi",
    descriptionTR: "Size özel tasarım ve fikir.",
    seoTitleTR: "Kişiye Özel Dövme Tasarımı | Enki Tattoo",
    seoDescriptionTR:
      "Kişiye özel dövme tasarımı: fikrini ve referanslarını paylaş; stil, ölçü ve yerleşimi netleştirelim. Fiyat al, tasarımını keşfet.",
    canonicalPath: "/kesfet/kisiye-ozel-dovme-tasarimi",
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
  "kisiye-ozel",
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
