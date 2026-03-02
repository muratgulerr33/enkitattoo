import type { ComponentType } from "react";
import {
  IconGoogleMaps,
  IconInstagram,
  IconPinterest,
  IconPhoneCall,
  IconWhatsApp,
  IconYouTube,
} from "@/components/icons/nandd";
import {
  GOOGLE_MAPS_BUSINESS_URL,
  INSTAGRAM_URL,
  PINTEREST_URL,
  PHONE_TEL_URL,
  WHATSAPP_URL,
  YOUTUBE_URL,
} from "@/lib/site/links";

export type SocialId =
  | "phone"
  | "whatsapp"
  | "pinterest"
  | "instagram"
  | "youtube"
  | "google";

export type SocialLinkItem = {
  id: SocialId;
  labelKey: string;
  href?: string;
  icon: ComponentType<{ size?: number; className?: string; title?: string }>;
  external?: boolean;
};

const asHref = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? value : undefined;

const hasHref = (item: SocialLinkItem): item is SocialLinkItem & { href: string } =>
  typeof item.href === "string" && item.href.trim().length > 0;

const ALL_SOCIAL_LINKS: SocialLinkItem[] = [
  { id: "phone", labelKey: "common.social.phone", href: asHref(PHONE_TEL_URL), icon: IconPhoneCall },
  { id: "whatsapp", labelKey: "common.social.whatsapp", href: asHref(WHATSAPP_URL), icon: IconWhatsApp, external: true },
  { id: "pinterest", labelKey: "common.social.pinterest", href: asHref(PINTEREST_URL), icon: IconPinterest, external: true },
  { id: "instagram", labelKey: "common.social.instagram", href: asHref(INSTAGRAM_URL), icon: IconInstagram, external: true },
  { id: "youtube", labelKey: "common.social.youtube", href: asHref(YOUTUBE_URL), icon: IconYouTube, external: true },
  { id: "google", labelKey: "common.social.google", href: asHref(GOOGLE_MAPS_BUSINESS_URL), icon: IconGoogleMaps, external: true },
];

// SSOT order lives in ALL_SOCIAL_LINKS; only active links are rendered.
export const SOCIAL_LINKS = ALL_SOCIAL_LINKS.filter(hasHref);
