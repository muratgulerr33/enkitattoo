import { notFound, permanentRedirect } from "next/navigation";
import { locales, routing } from "@/i18n/routing";
import { getCanonicalLegalDocumentSlug } from "@/lib/legal/legal-content";

type PageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

function buildLocalizedLegalPath(locale: string, slug: string): string {
  const normalizedLocale = locales.includes(locale as (typeof locales)[number])
    ? locale
    : routing.defaultLocale;
  const localePrefix = normalizedLocale === routing.defaultLocale ? "" : `/${normalizedLocale}`;

  return `${localePrefix}/${slug}`;
}

export default async function LegacyLegalDocumentRedirectPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const canonicalSlug = getCanonicalLegalDocumentSlug(slug);

  if (!canonicalSlug) {
    notFound();
  }

  permanentRedirect(buildLocalizedLegalPath(locale, canonicalSlug));
}
