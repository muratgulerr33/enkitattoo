import { getPiercingCoverSrc } from "@/lib/piercing/piercing-cover-map";

export type FeaturedPiercingItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  coverSrc?: string;
  imageAlt?: string;
};

const FEATURED_PIERCING_BASE: Omit<FeaturedPiercingItem, "coverSrc">[] = [
  {
    id: "kulak",
    title: "Kulak",
    subtitle: "Lob ve kıkırdakta modern kombinler",
    href: "/piercing/kulak",
    imageAlt: "Kulak piercing örneği",
  },
  {
    id: "burun",
    title: "Burun",
    subtitle: "Nostril halka ve stud seçenekleri",
    href: "/piercing/burun",
    imageAlt: "Burun piercing örneği",
  },
  {
    id: "kas",
    title: "Kaş",
    subtitle: "Kaş hattına uyumlu sade detaylar",
    href: "/piercing/kas",
    imageAlt: "Kaş piercing örneği",
  },
  {
    id: "dudak",
    title: "Dudak",
    subtitle: "Labret ve halka ile karakterli görünüm",
    href: "/piercing/dudak",
    imageAlt: "Dudak piercing örneği",
  },
  {
    id: "dil",
    title: "Dil",
    subtitle: "Minimal barbell ve parlak seçenekler",
    href: "/piercing/dil",
    imageAlt: "Dil piercing örneği",
  },
  {
    id: "gobek",
    title: "Göbek",
    subtitle: "Taşlı ve sade çizgide yaz stili",
    href: "/piercing/gobek",
    imageAlt: "Göbek piercing örneği",
  },
];

export const FEATURED_PIERCING: FeaturedPiercingItem[] = FEATURED_PIERCING_BASE.map((item) => ({
  ...item,
  coverSrc: getPiercingCoverSrc(item.id) ?? getPiercingCoverSrc(item.title) ?? getPiercingCoverSrc(item.href),
}));
