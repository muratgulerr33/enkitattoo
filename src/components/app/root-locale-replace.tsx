"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/locale-order";

export function RootLocaleReplace({ locale }: { locale: Locale }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${locale}`, { scroll: false });
  }, [locale, router]);

  return null;
}
