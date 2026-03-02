const LOCALES = ["tr", "en", "sq", "sr"] as const;

export function stripLocalePrefix(pathname: string): string {
  for (const locale of LOCALES) {
    if (pathname === `/${locale}`) {
      return "/";
    }

    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
  }

  return pathname || "/";
}
