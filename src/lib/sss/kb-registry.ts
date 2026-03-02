import { SITE_INFO } from "@/lib/site-info";
import {
  GOOGLE_MAPS_BUSINESS_URL,
  INSTAGRAM_URL,
  WHATSAPP_URL,
  YOUTUBE_URL,
} from "@/lib/site/links";

export type KbCategory = "tattoo" | "piercing" | "studio";
export type KbCategoryFilter = "all" | KbCategory;

type KbMessageValues = Record<string, string | number>;
export type TranslateMessage = (key: string, values?: KbMessageValues) => string;

export type KbCategoryChip = {
  id: KbCategoryFilter;
  labelKey: string;
};

export type KbItem = {
  id: string;
  category: KbCategory;
  questionKey: string;
  answerShortKey: string;
  answerLongKey: string;
  schemaEligible?: boolean;
};

export type QuickGuideLink = {
  id: string;
  labelKey: string;
  descriptionKey: string;
  href: string | null;
  external?: boolean;
};

export type ResolvedKbCategoryChip = {
  id: KbCategoryFilter;
  label: string;
};

export type ResolvedKbItem = {
  id: string;
  category: KbCategory;
  question: string;
  answerShort: string;
  answerLong: string;
  schemaEligible?: boolean;
};

export type ResolvedQuickGuideLink = {
  id: string;
  label: string;
  description: string;
  href: string | null;
  external?: boolean;
};

const KB_MESSAGE_VALUES: KbMessageValues = {
  addressText: SITE_INFO.addressText,
  weekdayLabel: SITE_INFO.openingHours.weekdayLabel,
  sundayLabel: SITE_INFO.openingHours.sundayLabel,
  whatsappUrl: WHATSAPP_URL,
  googleMapsBusinessUrl: GOOGLE_MAPS_BUSINESS_URL,
};

export const KB_CATEGORIES: KbCategoryChip[] = [
  { id: "all", labelKey: "sss.categories.all" },
  { id: "tattoo", labelKey: "sss.categories.tattoo" },
  { id: "piercing", labelKey: "sss.categories.piercing" },
  { id: "studio", labelKey: "sss.categories.studio" },
];

const TATTOO_FAQS_V1: KbItem[] = [
  {
    id: "tattoo-fiyat",
    category: "tattoo",
    questionKey: "sss.items.tattoo-fiyat.q",
    schemaEligible: true,
    answerShortKey: "sss.items.tattoo-fiyat.aShort",
    answerLongKey: "sss.items.tattoo-fiyat.aLong",
  },
  {
    id: "tattoo-sure-seans",
    category: "tattoo",
    questionKey: "sss.items.tattoo-sure-seans.q",
    schemaEligible: true,
    answerShortKey: "sss.items.tattoo-sure-seans.aShort",
    answerLongKey: "sss.items.tattoo-sure-seans.aLong",
  },
  {
    id: "tattoo-once-hazirlik",
    category: "tattoo",
    questionKey: "sss.items.tattoo-once-hazirlik.q",
    schemaEligible: true,
    answerShortKey: "sss.items.tattoo-once-hazirlik.aShort",
    answerLongKey: "sss.items.tattoo-once-hazirlik.aLong",
  },
  {
    id: "tattoo-alkol",
    category: "tattoo",
    questionKey: "sss.items.tattoo-alkol.q",
    schemaEligible: true,
    answerShortKey: "sss.items.tattoo-alkol.aShort",
    answerLongKey: "sss.items.tattoo-alkol.aLong",
  },
  {
    id: "tattoo-hamile-emzirme",
    category: "tattoo",
    questionKey: "sss.items.tattoo-hamile-emzirme.q",
    schemaEligible: true,
    answerShortKey: "sss.items.tattoo-hamile-emzirme.aShort",
    answerLongKey: "sss.items.tattoo-hamile-emzirme.aLong",
  },
  {
    id: "tattoo-bakim-48saat",
    category: "tattoo",
    questionKey: "sss.items.tattoo-bakim-48saat.q",
    schemaEligible: true,
    answerShortKey: "sss.items.tattoo-bakim-48saat.aShort",
    answerLongKey: "sss.items.tattoo-bakim-48saat.aLong",
  },
  {
    id: "tattoo-kabuk-soyulma",
    category: "tattoo",
    questionKey: "sss.items.tattoo-kabuk-soyulma.q",
    schemaEligible: true,
    answerShortKey: "sss.items.tattoo-kabuk-soyulma.aShort",
    answerLongKey: "sss.items.tattoo-kabuk-soyulma.aLong",
  },
  {
    id: "tattoo-iyilesme",
    category: "tattoo",
    questionKey: "sss.items.tattoo-iyilesme.q",
    schemaEligible: true,
    answerShortKey: "sss.items.tattoo-iyilesme.aShort",
    answerLongKey: "sss.items.tattoo-iyilesme.aLong",
  },
  {
    id: "tattoo-dus",
    category: "tattoo",
    questionKey: "sss.items.tattoo-dus.q",
    schemaEligible: true,
    answerShortKey: "sss.items.tattoo-dus.aShort",
    answerLongKey: "sss.items.tattoo-dus.aLong",
  },
  {
    id: "tattoo-deniz-havuz-sauna",
    category: "tattoo",
    questionKey: "sss.items.tattoo-deniz-havuz-sauna.q",
    schemaEligible: true,
    answerShortKey: "sss.items.tattoo-deniz-havuz-sauna.aShort",
    answerLongKey: "sss.items.tattoo-deniz-havuz-sauna.aLong",
  },
  {
    id: "tattoo-spor",
    category: "tattoo",
    questionKey: "sss.items.tattoo-spor.q",
    schemaEligible: true,
    answerShortKey: "sss.items.tattoo-spor.aShort",
    answerLongKey: "sss.items.tattoo-spor.aLong",
  },
  {
    id: "tattoo-gunes",
    category: "tattoo",
    questionKey: "sss.items.tattoo-gunes.q",
    schemaEligible: true,
    answerShortKey: "sss.items.tattoo-gunes.aShort",
    answerLongKey: "sss.items.tattoo-gunes.aLong",
  },
  {
    id: "tattoo-rotus",
    category: "tattoo",
    questionKey: "sss.items.tattoo-rotus.q",
    schemaEligible: true,
    answerShortKey: "sss.items.tattoo-rotus.aShort",
    answerLongKey: "sss.items.tattoo-rotus.aLong",
  },
  {
    id: "tattoo-coverup",
    category: "tattoo",
    questionKey: "sss.items.tattoo-coverup.q",
    schemaEligible: true,
    answerShortKey: "sss.items.tattoo-coverup.aShort",
    answerLongKey: "sss.items.tattoo-coverup.aLong",
  },
  {
    id: "tattoo-lazer-vs-coverup",
    category: "tattoo",
    questionKey: "sss.items.tattoo-lazer-vs-coverup.q",
    schemaEligible: true,
    answerShortKey: "sss.items.tattoo-lazer-vs-coverup.aShort",
    answerLongKey: "sss.items.tattoo-lazer-vs-coverup.aLong",
  },
];

const PIERCING_FAQS_V1: Array<{ id: string; questionKey: string }> = [
  {
    id: "piercing-igne-tabanca-sterilizasyon",
    questionKey: "sss.items.piercing-igne-tabanca-sterilizasyon.q",
  },
  {
    id: "piercing-fiyat",
    questionKey: "sss.items.piercing-fiyat.q",
  },
  {
    id: "piercing-ilk-taki-materyali",
    questionKey: "sss.items.piercing-ilk-taki-materyali.q",
  },
  {
    id: "piercing-iyilesme-suresi",
    questionKey: "sss.items.piercing-iyilesme-suresi.q",
  },
  {
    id: "piercing-bakim-24-48",
    questionKey: "sss.items.piercing-bakim-24-48.q",
  },
  {
    id: "piercing-taki-degisim-downsizing",
    questionKey: "sss.items.piercing-taki-degisim-downsizing.q",
  },
  {
    id: "piercing-deniz-havuz-sauna-spor",
    questionKey: "sss.items.piercing-deniz-havuz-sauna-spor.q",
  },
  {
    id: "piercing-kulaklik-kask-baski",
    questionKey: "sss.items.piercing-kulaklik-kask-baski.q",
  },
];

const PIERCING_ITEMS: KbItem[] = PIERCING_FAQS_V1.map(({ id, questionKey }) => ({
  id,
  category: "piercing",
  questionKey,
  answerShortKey: "sss.placeholders.piercingShort",
  answerLongKey: "sss.placeholders.piercingLong",
}));

const STUDIO_FAQS_V1: KbItem[] = [
  {
    id: "studio-adres-maps",
    category: "studio",
    questionKey: "sss.items.studio-adres-maps.q",
    answerShortKey: "sss.items.studio-adres-maps.aShort",
    answerLongKey: "sss.items.studio-adres-maps.aLong",
  },
  {
    id: "studio-calisma-saatleri",
    category: "studio",
    questionKey: "sss.items.studio-calisma-saatleri.q",
    answerShortKey: "sss.items.studio-calisma-saatleri.aShort",
    answerLongKey: "sss.items.studio-calisma-saatleri.aLong",
  },
];

export const QUICK_GUIDE_LINKS: QuickGuideLink[] = [
  {
    id: "guide-contact",
    labelKey: "sss.quickGuide.guide-contact.label",
    descriptionKey: "sss.quickGuide.guide-contact.description",
    href: "/iletisim",
  },
  {
    id: "guide-maps",
    labelKey: "sss.quickGuide.guide-maps.label",
    descriptionKey: "sss.quickGuide.guide-maps.description",
    href: GOOGLE_MAPS_BUSINESS_URL,
    external: true,
  },
  {
    id: "guide-instagram",
    labelKey: "sss.quickGuide.guide-instagram.label",
    descriptionKey: "sss.quickGuide.guide-instagram.description",
    href: INSTAGRAM_URL,
    external: true,
  },
  {
    id: "guide-youtube",
    labelKey: "sss.quickGuide.guide-youtube.label",
    descriptionKey: "sss.quickGuide.guide-youtube.description",
    href: YOUTUBE_URL,
    external: true,
  },
  {
    id: "guide-whatsapp",
    labelKey: "sss.quickGuide.guide-whatsapp.label",
    descriptionKey: "sss.quickGuide.guide-whatsapp.description",
    href: WHATSAPP_URL,
    external: true,
  },
];

export const KB_ITEMS: KbItem[] = [...TATTOO_FAQS_V1, ...PIERCING_ITEMS, ...STUDIO_FAQS_V1];

export function resolveKbCategories(t: TranslateMessage): ResolvedKbCategoryChip[] {
  return KB_CATEGORIES.map((category) => ({
    id: category.id,
    label: t(category.labelKey),
  }));
}

export function resolveKbItems(t: TranslateMessage): ResolvedKbItem[] {
  return KB_ITEMS.map((item) => ({
    id: item.id,
    category: item.category,
    question: t(item.questionKey),
    answerShort: t(item.answerShortKey, KB_MESSAGE_VALUES),
    answerLong: t(item.answerLongKey, KB_MESSAGE_VALUES),
    schemaEligible: item.schemaEligible,
  }));
}

export function resolveQuickGuideLinks(t: TranslateMessage): ResolvedQuickGuideLink[] {
  return QUICK_GUIDE_LINKS.map((link) => ({
    id: link.id,
    label: t(link.labelKey),
    description: t(link.descriptionKey, KB_MESSAGE_VALUES),
    href: link.href,
    external: link.external,
  }));
}
