export type FeaturedPiercingItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  imageSrc?: string;
  imageAlt?: string;
  imageFit?: "cover" | "contain";
};

export const FEATURED_PIERCING: FeaturedPiercingItem[] = [
  {
    id: "kulak",
    title: "Kulak",
    subtitle: "Lob ve kıkırdakta modern kombinler",
    href: "/piercing/kulak",
    imageSrc: "/piercing-featured/kulak.webp",
    imageAlt: "Kulak piercing örneği",
    imageFit: "contain",
  },
  {
    id: "burun",
    title: "Burun",
    subtitle: "Nostril halka ve stud seçenekleri",
    href: "/piercing/burun",
    imageSrc: "/piercing-featured/burun.webp",
    imageAlt: "Burun piercing örneği",
    imageFit: "contain",
  },
  {
    id: "kas",
    title: "Kaş",
    subtitle: "Kaş hattına uyumlu sade detaylar",
    href: "/piercing/kas",
    imageSrc: "/piercing-featured/kas.webp",
    imageAlt: "Kaş piercing örneği",
    imageFit: "contain",
  },
  {
    id: "dudak",
    title: "Dudak",
    subtitle: "Labret ve halka ile karakterli görünüm",
    href: "/piercing/dudak",
    imageSrc: "/piercing-featured/dudak.webp",
    imageAlt: "Dudak piercing örneği",
    imageFit: "contain",
  },
  {
    id: "dil",
    title: "Dil",
    subtitle: "Minimal barbell ve parlak seçenekler",
    href: "/piercing/dil",
    imageSrc: "/piercing-featured/dil.webp",
    imageAlt: "Dil piercing örneği",
    imageFit: "contain",
  },
  {
    id: "gobek",
    title: "Göbek",
    subtitle: "Taşlı ve sade çizgide yaz stili",
    href: "/piercing/gobek",
    imageSrc: "/piercing-featured/gobek.webp",
    imageAlt: "Göbek piercing örneği",
    imageFit: "contain",
  },
];
