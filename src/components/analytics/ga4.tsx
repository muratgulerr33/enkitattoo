"use client";

import { Suspense, useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { getGoogleAdsClickSendTo } from "@/lib/analytics/google-ads";

type GtagCommand = "config" | "consent" | "event" | "js" | "set";

type GtagFunction = (
  command: GtagCommand,
  targetId: string | Date,
  params?: Record<string, unknown>
) => void;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: GtagFunction;
  }
}

type GA4Props = {
  gaId?: string;
  adsId?: string;
};

export function GA4({ gaId, adsId }: GA4Props) {
  const tagId = gaId || adsId;

  if (!tagId) {
    return null;
  }

  const initLines = [
    "window.dataLayer=window.dataLayer||[];",
    "function gtag(){window.dataLayer.push(arguments);}",
    "window.gtag=gtag;",
    "gtag('js', new Date());",
    gaId ? `gtag('config', '${gaId}', { send_page_view: false });` : "",
    adsId ? `gtag('config', '${adsId}');` : "",
  ]
    .filter(Boolean)
    .join("");

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${tagId}`}
        strategy="lazyOnload"
      />
      <Script
        id="google-tag-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{ __html: initLines }}
      />
      <Suspense fallback={null}>
        <PageViewTracker gaId={gaId} adsId={adsId} />
      </Suspense>
    </>
  );
}

function PageViewTracker({ gaId, adsId }: GA4Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    const pagePath = query ? `${pathname}?${query}` : pathname;

    if (gaId) {
      window.gtag?.("config", gaId, { page_path: pagePath });
    }

    if (adsId) {
      window.gtag?.("config", adsId, { page_path: pagePath });
    }
  }, [adsId, gaId, pathname, query]);

  useEffect(() => {
    if (!adsId || pathname.startsWith("/ops")) {
      return;
    }

    function handleDocumentClick(event: MouseEvent) {
      if (event.defaultPrevented || !(event.target instanceof Element)) {
        return;
      }

      const anchor = event.target.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const sendTo = getGoogleAdsClickSendTo(anchor);

      if (!sendTo) {
        return;
      }

      window.gtag?.("event", "conversion", { send_to: sendTo });
    }

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [adsId, pathname]);

  return null;
}
