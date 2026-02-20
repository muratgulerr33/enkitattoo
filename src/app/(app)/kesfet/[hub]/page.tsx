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
    <div className="space-y-6">
      <header>
        <h1 className="t-h2 text-foreground">{hub.titleTR}</h1>
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

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="default" size="default">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Randevu al
          </a>
        </Button>
        <Button asChild variant="outline" size="default">
          <Link href={`/galeri?style=${styleParam}`}>Galeri&apos;de gör</Link>
        </Button>
      </div>

      <section aria-label="Örnek galeri">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-square w-full rounded-xl border border-border bg-muted"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
