"use client";

import { useRef } from "react";
import { AppHeader } from "@/components/app/app-header";
import { AppFooter } from "@/components/app/app-footer";
import { MobileHeader } from "@/components/app/mobile-header";
import { RightRail } from "@/components/app/right-rail";
import type { Locale } from "@/lib/i18n/locale-order";

export function AppShell({
  initialLocaleOrder,
  children,
}: {
  initialLocaleOrder: Locale[];
  children: React.ReactNode;
}) {
  const contentShellRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <MobileHeader contentShellRef={contentShellRef} initialLocaleOrder={initialLocaleOrder} />
      <AppHeader className="hidden xl:block" initialLocaleOrder={initialLocaleOrder} />
      <div ref={contentShellRef} className="[transform:translate3d(0,0,0)]">
        <main
          className="app-container app-mobile-header-offset app-safe-bottom no-overflow-x w-full min-w-0 xl:max-w-7xl xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8 xl:pt-8"
        >
          <div className="min-w-0 xl:max-w-[860px]">
            {children}
          </div>
          <div className="hidden xl:block">
            <RightRail />
          </div>
        </main>
        <AppFooter />
      </div>
    </>
  );
}
