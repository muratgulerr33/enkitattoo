import { PHONE_TEL_URL, WHATSAPP_URL } from "@/lib/site/links";

export const GOOGLE_ADS_WHATSAPP_CLICK_SEND_TO = "AW-18028275720/sYP-CMLB1I0cEIjQxpRD";
export const GOOGLE_ADS_PHONE_CLICK_SEND_TO = "AW-18028275720/TufoCK2SzY0cEIjQxpRD";

function normalizeTrackedHref(href: string) {
  const trimmedHref = href.trim();

  if (!trimmedHref) {
    return null;
  }

  if (trimmedHref.startsWith("tel:")) {
    return trimmedHref.toLowerCase();
  }

  try {
    const url = new URL(trimmedHref, "https://enkitattoo.com.tr");
    const normalizedPath = url.pathname.replace(/\/+$/, "") || "/";

    return `${url.origin}${normalizedPath}`.toLowerCase();
  } catch {
    return trimmedHref.toLowerCase();
  }
}

const TRACKED_CLICK_DESTINATIONS = [
  {
    href: WHATSAPP_URL,
    sendTo: GOOGLE_ADS_WHATSAPP_CLICK_SEND_TO,
  },
  {
    href: PHONE_TEL_URL,
    sendTo: GOOGLE_ADS_PHONE_CLICK_SEND_TO,
  },
] as const;

export function getGoogleAdsClickSendTo(anchor: HTMLAnchorElement) {
  const candidates = [anchor.getAttribute("href"), anchor.href]
    .filter((value): value is string => Boolean(value))
    .map(normalizeTrackedHref)
    .filter((value): value is string => Boolean(value));

  for (const destination of TRACKED_CLICK_DESTINATIONS) {
    const normalizedDestination = normalizeTrackedHref(destination.href);

    if (normalizedDestination && candidates.includes(normalizedDestination)) {
      return destination.sendTo;
    }
  }

  return null;
}
