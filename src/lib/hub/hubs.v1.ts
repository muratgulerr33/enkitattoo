/**
 * ENKI Tattoo — Kategori Hub Mimarisi V1
 * Single config, no duplication.
 */

export interface HubItem {
  id: string;
  titleKey: string;
  slug: string;
  descriptionKey: string;
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
    titleKey: "hub.items.minimal_fine_line.title",
    slug: "minimal-fine-line-dovme",
    descriptionKey: "hub.items.minimal_fine_line.description",
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
    titleKey: "hub.items.lettering.title",
    slug: "yazi-isim-dovmesi",
    descriptionKey: "hub.items.lettering.description",
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
    titleKey: "hub.items.realism.title",
    slug: "realistik-dovme",
    descriptionKey: "hub.items.realism.description",
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
    titleKey: "hub.items.portrait.title",
    slug: "portre-dovme",
    descriptionKey: "hub.items.portrait.description",
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
    titleKey: "hub.items.traditional_old_school.title",
    slug: "traditional-dovme",
    descriptionKey: "hub.items.traditional_old_school.description",
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
    titleKey: "hub.items.cover_up.title",
    slug: "dovme-kapatma",
    descriptionKey: "hub.items.cover_up.description",
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
    titleKey: "hub.items.ataturk.title",
    slug: "ataturk-temali-dovme",
    descriptionKey: "hub.items.ataturk.description",
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
    titleKey: "hub.items.blackwork.title",
    slug: "blackwork-dovme",
    descriptionKey: "hub.items.blackwork.description",
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
    titleKey: "hub.items.custom.title",
    slug: "kisiye-ozel-dovme-tasarimi",
    descriptionKey: "hub.items.custom.description",
    seoTitleTR: "Kişiye Özel Dövme Tasarımı | Enki Tattoo",
    seoDescriptionTR:
      "Kişiye özel dövme tasarımı: fikrini ve referanslarını paylaş; stil, ölçü ve yerleşimi netleştirelim. Fiyat al, tasarımını keşfet.",
    canonicalPath: "/kesfet/kisiye-ozel-dovme-tasarimi",
    tags: ["custom"],
    coverKey: "custom",
    icon: "Palette",
  },
  {
    id: "dovme_egitimi",
    titleKey: "hub.items.dovme_egitimi.title",
    slug: "dovme-egitimi",
    descriptionKey: "hub.items.dovme_egitimi.description",
    seoTitleTR: "Dövme Eğitimi (Mersin) | Enki Tattoo",
    seoDescriptionTR:
      "Mersin’de dövme eğitimi: hijyen, ekipman, çizgi, shading ve stencil. Başlangıçtan ileri seviyeye stüdyo içinde uygulamalı öğren. WhatsApp’tan yaz.",
    canonicalPath: "/dovme-egitimi",
    tags: ["egitim", "dovme_egitimi"],
    coverKey: "dovme_egitimi",
    icon: "GraduationCap",
  },
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
