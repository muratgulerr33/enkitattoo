import { SITE_INFO } from "@/lib/site-info";

export const HOME_URL = "/";
export const PHONE_TEL_URL = `tel:${SITE_INFO.phoneE164}`;
export const WHATSAPP_URL = "https://wa.me/905537108033";
export const PINTEREST_URL = "https://www.pinterest.com/halit0312/";
export const INSTAGRAM_URL = "https://instagram.com/enki.tattoo";
export const YOUTUBE_URL = null;
export const GOOGLE_MAPS_BUSINESS_URL = SITE_INFO.googleMapsUrl;
export const SSS_URL = "/sss";
export const ARTISTS_URL = "/artistler";

export const FOOTER_QUICK_LINKS = [
  { labelKey: "common.nav.questionBank", href: SSS_URL },
  { labelKey: "common.nav.artists", href: ARTISTS_URL },
] as const;
