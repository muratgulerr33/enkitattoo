import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import {
  getHubBySlug,
  isValidHubSlug,
  mainHubs,
  specialHubs,
} from "@/lib/hub/hubs.v1";
import { whatsappUrl } from "@/lib/mock/enki";
import { getRouteContent, hasNoIndex } from "@/lib/route-content";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  params: Promise<{ hub: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return [...mainHubs, ...specialHubs].map((hub) => ({ hub: hub.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hub: slug } = await params;
  const hub = getHubBySlug(slug);

  if (!hub) {
    return {
      title: { absolute: "Keşfet | Enki Tattoo" },
      description: "Enki Tattoo keşfet kategorileri.",
      alternates: { canonical: "/kesfet" },
    };
  }

  const routePath = `/kesfet/${hub.slug}`;
  const content = getRouteContent(routePath);
  const computedTitle = content?.seoTitle || `${hub.titleTR} | Enki Tattoo`;
  const computedDescription = content?.seoDescription || hub.descriptionTR;
  const canonical = content?.canonical || routePath;

  const metadata: Metadata = {
    title: { absolute: computedTitle },
    description: computedDescription,
    alternates: {
      canonical,
    },
  };

  if (hasNoIndex(content?.indexing)) {
    metadata.robots = { index: false, follow: true };
  }

  return metadata;
}

export default async function HubDetailPage({ params }: PageProps) {
  const { hub: slug } = await params;
  if (!isValidHubSlug(slug)) notFound();
  const hub = getHubBySlug(slug);
  if (!hub) notFound();

  const routePath = `/kesfet/${hub.slug}`;
  const content = getRouteContent(routePath);
  const styleParam = encodeURIComponent(hub.slug);
  const shortDescription = content?.shortDescription || hub.descriptionTR;
  const longDescription =
    content?.description && content.description !== shortDescription
      ? content.description
      : null;

  return (
    <div className="app-section no-overflow-x">
      <BreadcrumbListJsonLd path={routePath} />

      <header>
        {content?.microLine ? <p className="t-small text-muted-foreground">{content.microLine}</p> : null}
        <h1 className="typo-page-title">{content?.h1 || hub.titleTR}</h1>
        <p className="t-muted mt-1">{shortDescription}</p>
        {longDescription ? <p className="t-muted mt-2">{longDescription}</p> : null}
      </header>

      <div className="flex flex-wrap gap-2">
        {hub.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm text-muted-foreground"
          >
            {tag.replace(/_/g, " ")}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild variant="default" size="default" className="w-full sm:w-auto">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Randevu al
          </a>
        </Button>
        <Button asChild variant="outline" size="default" className="w-full sm:w-auto">
          <Link href={`/galeri-tasarim?style=${styleParam}`}>Galeri&apos;de gör</Link>
        </Button>
      </div>

      <section aria-label="Örnek galeri">
        <div className="grid-cards">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className="card-media rounded-xl border border-border bg-muted"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
