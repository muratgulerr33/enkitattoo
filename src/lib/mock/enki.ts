/**
 * ENKİ Tattoo Studio contact & location mock data.
 */

import {
  INSTAGRAM_URL,
  PHONE_TEL_URL,
  WHATSAPP_URL,
} from "@/lib/site/links";
import { SITE_INFO } from "@/lib/site-info";

export const studioName = SITE_INFO.name;
export const phoneE164 = SITE_INFO.phoneE164;
export const phoneDisplay = SITE_INFO.phoneDisplay;
export const instagramHandle = "enki.tattoo";
export const addressLine = SITE_INFO.addressText;
export const hoursNote = SITE_INFO.openingHoursText;

export const whatsappUrl = WHATSAPP_URL;
export const instagramUrl = INSTAGRAM_URL;
export const callUrl = PHONE_TEL_URL;

export const mapsQuery = `${SITE_INFO.name}, ${SITE_INFO.addressText}`;
export const mapsEmbedUrl = SITE_INFO.googleMapsEmbedSrc;
export const directionsUrl = SITE_INFO.googleMapsUrl;
export const mapsDirectionsUrl = directionsUrl;
