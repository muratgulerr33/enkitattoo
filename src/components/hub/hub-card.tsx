import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getHubCoverSrc } from "@/lib/hub/hub-cover-map";

type HubCardProps = {
  titleTR: string;
  slug: string;
  href: string;
  descriptionTR: string;
};

export function HubCard({ titleTR, slug, href, descriptionTR }: HubCardProps) {
  const coverSrc = getHubCoverSrc(slug);

  return (
    <Link
      href={href}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm transition-[box-shadow,background-color] hover:bg-accent/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-border/50 dark:bg-card/40 dark:shadow-none dark:hover:shadow-sm"
    >
      <div className="card-media-hub relative overflow-hidden rounded-t-2xl bg-muted/60 bg-gradient-to-br from-surface-1 to-surface-2">
        {coverSrc ? (
          <>
            <Image
              fill
              src={coverSrc}
              alt={`${titleTR} kapak`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent" />
          </>
        ) : null}
      </div>

      <div className="min-w-0 flex min-h-[92px] flex-1 flex-col gap-2 rounded-b-2xl border-t border-border/50 bg-background/95 p-4 dark:bg-card/30">
        <div className="min-w-0">
          <h2
            className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold leading-tight text-foreground"
            title={titleTR}
          >
            {titleTR}
          </h2>
          <p
            className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-foreground/70 dark:text-foreground/65"
            title={descriptionTR}
          >
            {descriptionTR}
          </p>
        </div>
        <div className="mt-auto flex min-w-0 items-center justify-between gap-2 text-sm font-medium text-foreground/80 transition-[color,transform] duration-150 group-hover:text-foreground group-active:scale-[0.99]">
          <span className="min-w-0 truncate">Tümünü gör</span>
          <ChevronRight className="size-4 shrink-0" aria-hidden />
        </div>
      </div>
    </Link>
  );
}
