"use client";

import { useEffect } from "react";
import { Suspense } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type GtagCommand = "config" | "consent" | "event" | "js" | "set";

type GtagFunction = (command: GtagCommand, targetId: string | Date, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: GtagFunction;
  }
}

export function GA4() {
  if (!GA_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script
        id="ga4-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}window.gtag=gtag;gtag('js', new Date());gtag('config', '${GA_ID}', { send_page_view: false });`,
        }}
      />
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    if (!GA_ID) {
      return;
    }

    const pagePath = query ? `${pathname}?${query}` : pathname;
    window.gtag?.("config", GA_ID, { page_path: pagePath });
  }, [pathname, query]);

  return null;
}
