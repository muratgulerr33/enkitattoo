import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import { FaqPageJsonLd } from "@/components/seo/faqpage-jsonld";
import { KBClient } from "@/components/sss/kb-client";
import { getRouteContent, hasNoIndex } from "@/lib/route-content";
import { resolveKbItems } from "@/lib/sss/kb-registry";
import { SITE_URL } from "@/lib/site/base-url";

const SSS_PATH = "/sss";
const sssContent = getRouteContent(SSS_PATH);

export function generateMetadata(): Metadata {
  if (!sssContent) {
    return {};
  }

  const metadata: Metadata = {};

  if (sssContent.seoTitle) {
    metadata.title = { absolute: sssContent.seoTitle };
  }
  if (sssContent.seoDescription) {
    metadata.description = sssContent.seoDescription;
  }
  if (sssContent.canonical) {
    metadata.alternates = { canonical: sssContent.canonical };
  }
  if (hasNoIndex(sssContent.indexing)) {
    metadata.robots = { index: false, follow: true };
  }

  return metadata;
}

export default async function SssPage() {
  const t = await getTranslations();
  const faqSchemaItems = resolveKbItems(t)
    .filter((item) => item.schemaEligible === true)
    .map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answerLong || item.answerShort,
    }))
    .filter((item) => item.question.trim().length > 0 && item.answer.trim().length > 0)
    .slice(0, 12);
  const heading = t("pages.sss.heading");
  const shortDescription =
    t("pages.sss.shortDescription");
  const longDescription =
    t("pages.sss.longDescription") !== shortDescription
      ? t("pages.sss.longDescription")
      : null;

  return (
    <div className="app-section no-overflow-x">
      <BreadcrumbListJsonLd path="/sss" />
      <FaqPageJsonLd pageUrl={`${SITE_URL}/sss`} items={faqSchemaItems} />

      <header className="space-y-2">
        <p className="t-small text-muted-foreground">{t("pages.sss.microLine")}</p>
        <h1 className="typo-page-title">{heading}</h1>
        <p className="t-muted">{shortDescription}</p>
        {longDescription ? <p className="t-muted">{longDescription}</p> : null}
      </header>

      <Suspense fallback={<div className="h-24" aria-hidden />}>
        <KBClient />
      </Suspense>
    </div>
  );
}
