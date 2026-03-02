import { getPiercingCoverSrc } from "@/lib/piercing/piercing-cover-map";

export type FeaturedPiercingItem = {
  id: string;
  titleKey: string;
  subtitleKey: string;
  href: string;
  coverSrc?: string;
  imageAltKey?: string;
};

const FEATURED_PIERCING_BASE: Omit<FeaturedPiercingItem, "coverSrc">[] = [
  {
    id: "kulak",
    titleKey: "piercing.labels.kulak",
    subtitleKey: "piercing.featured.kulak.subtitle",
    href: "/piercing/kulak",
    imageAltKey: "piercing.featured.kulak.alt",
  },
  {
    id: "burun",
    titleKey: "piercing.labels.burun",
    subtitleKey: "piercing.featured.burun.subtitle",
    href: "/piercing/burun",
    imageAltKey: "piercing.featured.burun.alt",
  },
  {
    id: "kas",
    titleKey: "piercing.labels.kas",
    subtitleKey: "piercing.featured.kas.subtitle",
    href: "/piercing/kas",
    imageAltKey: "piercing.featured.kas.alt",
  },
  {
    id: "dudak",
    titleKey: "piercing.labels.dudak",
    subtitleKey: "piercing.featured.dudak.subtitle",
    href: "/piercing/dudak",
    imageAltKey: "piercing.featured.dudak.alt",
  },
  {
    id: "dil",
    titleKey: "piercing.labels.dil",
    subtitleKey: "piercing.featured.dil.subtitle",
    href: "/piercing/dil",
    imageAltKey: "piercing.featured.dil.alt",
  },
  {
    id: "gobek",
    titleKey: "piercing.labels.gobek",
    subtitleKey: "piercing.featured.gobek.subtitle",
    href: "/piercing/gobek",
    imageAltKey: "piercing.featured.gobek.alt",
  },
];

export const FEATURED_PIERCING: FeaturedPiercingItem[] = FEATURED_PIERCING_BASE.map((item) => ({
  ...item,
  coverSrc:
    getPiercingCoverSrc(item.id) ??
    getPiercingCoverSrc(item.href) ??
    "/piercing-hero/cover.webp",
}));
