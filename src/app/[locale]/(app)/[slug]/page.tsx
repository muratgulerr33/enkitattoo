import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import { LegalMarkdown } from "@/components/legal/legal-markdown";
import {
  getCanonicalLegalDocumentSlug,
  getLegalDocumentBySlug,
  getPublicLegalMarkdown,
} from "@/lib/legal/legal-content";
import { getRouteContent, hasNoIndex } from "@/lib/route-content";
import { locales, routing } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

function buildLocalizedLegalPath(locale: string, slug: string): string {
  const normalizedLocale = locales.includes(locale as (typeof locales)[number])
    ? locale
    : routing.defaultLocale;
  const localePrefix = normalizedLocale === routing.defaultLocale ? "" : `/${normalizedLocale}`;

  return `${localePrefix}/${slug}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const canonicalSlug = getCanonicalLegalDocumentSlug(slug);

  if (!canonicalSlug) {
    return {};
  }

  const document = await getLegalDocumentBySlug(canonicalSlug);

  if (!document) {
    return {};
  }

  const routeContent = getRouteContent(document.publicPath);
  const metadata: Metadata = {};

  if (routeContent?.seoTitle) {
    metadata.title = { absolute: routeContent.seoTitle };
  }

  if (routeContent?.seoDescription) {
    metadata.description = routeContent.seoDescription;
  }

  if (routeContent?.canonical) {
    metadata.alternates = { canonical: routeContent.canonical };
  }

  if (hasNoIndex(routeContent?.indexing)) {
    metadata.robots = { index: false, follow: true };
  }

  return metadata;
}

export default async function LegalDocumentPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const canonicalSlug = getCanonicalLegalDocumentSlug(slug);

  if (!canonicalSlug) {
    notFound();
  }

  if (canonicalSlug !== slug) {
    permanentRedirect(buildLocalizedLegalPath(locale, canonicalSlug));
  }

  const document = await getLegalDocumentBySlug(canonicalSlug);

  if (!document) {
    notFound();
  }

  const routeContent = getRouteContent(document.publicPath);

  return (
    <div className="app-section no-overflow-x">
      <BreadcrumbListJsonLd path={document.publicPath} />

      <header className="space-y-1">
        {routeContent?.microLine ? (
          <p className="t-small text-muted-foreground">{routeContent.microLine}</p>
        ) : null}
        <h1 className="typo-page-title">{routeContent?.h1 ?? document.label}</h1>
              </header>

      <article className="rounded-3xl border border-border bg-surface-2 px-4 py-5 shadow-soft sm:px-6 sm:py-6">
        <LegalMarkdown markdown={getPublicLegalMarkdown(document.markdown)} />
      </article>
    </div>
  );
}
