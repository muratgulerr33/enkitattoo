import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import { LegalMarkdown } from "@/components/legal/legal-markdown";
import { getLegalDocumentBySlug } from "@/lib/legal/legal-content";
import { LEGAL_DOCUMENTS } from "@/lib/legal/legal-registry";
import { getRouteContent, hasNoIndex } from "@/lib/route-content";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return LEGAL_DOCUMENTS.map((document) => ({
    slug: document.publicPath.split("/").pop()!,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const document = await getLegalDocumentBySlug(slug);

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
  const { slug } = await params;
  const document = await getLegalDocumentBySlug(slug);

  if (!document) {
    notFound();
  }

  const routeContent = getRouteContent(document.publicPath);

  return (
    <div className="app-section no-overflow-x">
      <BreadcrumbListJsonLd path={document.publicPath} />

      <header className="space-y-2">
        {routeContent?.microLine ? (
          <p className="t-small text-muted-foreground">{routeContent.microLine}</p>
        ) : null}
        <h1 className="typo-page-title">{routeContent?.h1 ?? document.label}</h1>
        {document.summary ? <p className="t-muted">{document.summary}</p> : null}
      </header>

      <article className="rounded-3xl border border-border bg-surface-2 px-4 py-5 shadow-soft sm:px-6 sm:py-6">
        <LegalMarkdown markdown={document.markdown.replace(/^#\s+.+?(?:\r?\n){1,2}/, "").trim()} />
      </article>
    </div>
  );
}
