import { notFound } from "next/navigation";
import Link from "next/link";
import { getHubBySlug, isValidHubSlug } from "@/lib/hub/hubs.v1";
import { whatsappUrl } from "@/lib/mock/enki";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  params: Promise<{ hub: string }>;
}

export default async function HubDetailPage({ params }: PageProps) {
  const { hub: slug } = await params;
  if (!isValidHubSlug(slug)) notFound();
  const hub = getHubBySlug(slug);
  if (!hub) notFound();

  const styleParam = encodeURIComponent(hub.slug);

  return (
    <div className="app-section no-overflow-x">
      <header>
        <h1 className="typo-page-title">{hub.titleTR}</h1>
        <p className="t-muted mt-1">{hub.descriptionTR}</p>
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
          <Link href={`/galeri?style=${styleParam}`}>Galeri&apos;de gör</Link>
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
