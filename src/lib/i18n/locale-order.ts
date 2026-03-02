export const SUPPORTED_LOCALES = ["tr", "sq", "sr", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  tr: "Türkçe",
  sq: "Shqip",
  sr: "Srpski",
  en: "English",
};

const KOSOVO_ORDER: Locale[] = ["sq", "en", "sr", "tr"];
const TURKEY_ORDER: Locale[] = ["tr", "sq", "en", "sr"];
export const DEFAULT_LOCALE_ORDER: Locale[] = ["tr", "en", "sq", "sr"];

function mapLanguageToLocale(language: string): Locale | null {
  const normalized = language.toLowerCase();

  if (normalized.startsWith("tr")) return "tr";
  if (normalized.startsWith("sq")) return "sq";
  if (normalized.startsWith("sr")) return "sr";
  if (normalized.startsWith("en")) return "en";

  return null;
}

function uniqueLocales(locales: Locale[]): Locale[] {
  const seen = new Set<Locale>();
  const ordered: Locale[] = [];

  locales.forEach((locale) => {
    if (!seen.has(locale)) {
      seen.add(locale);
      ordered.push(locale);
    }
  });

  return ordered;
}

export function getOrderedLocales(languages: readonly string[]): Locale[] {
  const normalizedLanguages = languages.map((language) => language.toLowerCase());

  const hasKosovoSignal = normalizedLanguages.some(
    (language) => language.startsWith("sq") || language.includes("-xk")
  );

  if (hasKosovoSignal) {
    return [...KOSOVO_ORDER];
  }

  const hasTurkeySignal = normalizedLanguages.some((language) => language.startsWith("tr"));

  if (hasTurkeySignal) {
    return [...TURKEY_ORDER];
  }

  const preferred = uniqueLocales(
    normalizedLanguages
      .map((language) => mapLanguageToLocale(language))
      .filter((locale): locale is Locale => Boolean(locale))
  );

  const tail = DEFAULT_LOCALE_ORDER.filter((locale) => !preferred.includes(locale));

  return [...preferred, ...tail];
}

function extractLanguagesFromAcceptLanguage(acceptLanguage: string | null): string[] {
  if (!acceptLanguage) {
    return [];
  }

  return acceptLanguage
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split(";")[0]?.trim() ?? "")
    .filter(Boolean);
}

export function getLocaleOrderFromAcceptLanguage(acceptLanguage: string | null): Locale[] {
  const languages = extractLanguagesFromAcceptLanguage(acceptLanguage);

  if (!languages.length) {
    return [...DEFAULT_LOCALE_ORDER];
  }

  return getOrderedLocales(languages);
}

export function getLocaleOrderFromNavigator(langs?: readonly string[]): Locale[] {
  if (langs && langs.length > 0) {
    return getOrderedLocales(langs);
  }

  if (typeof navigator === "undefined") {
    return [...DEFAULT_LOCALE_ORDER];
  }

  const languages =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : navigator.language
        ? [navigator.language]
        : [];

  return getOrderedLocales(languages);
}

export function detectOrderedLocales(): Locale[] {
  return getLocaleOrderFromNavigator();
}
