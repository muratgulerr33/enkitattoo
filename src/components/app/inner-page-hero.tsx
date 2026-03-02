import Image from "next/image";
import type { ReactNode } from "react";

interface InnerPageHeroProps {
  microLine?: string;
  heading: string;
  shortDescription: string;
  longDescription?: string | null;
  coverSrc?: string | null;
  coverAlt?: string;
  tags?: string[];
  actions?: ReactNode;
  primaryCta?: ReactNode;
  secondaryCta?: ReactNode;
}

export function InnerPageHero({
  microLine,
  heading,
  shortDescription,
  longDescription,
  coverSrc,
  coverAlt,
  tags,
  actions,
  primaryCta,
  secondaryCta,
}: InnerPageHeroProps) {
  const hasCtas = Boolean(primaryCta || secondaryCta);
  const description = longDescription
    ? `${shortDescription}\n\n${longDescription}`
    : shortDescription;

  return (
    <header className="space-y-4">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-soft">
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={coverAlt ?? ""}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-surface-1 to-surface-2" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>
      {microLine ? <p className="t-small text-muted-foreground">{microLine}</p> : null}
      <h1 className="typo-page-title">{heading}</h1>
      {hasCtas ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {primaryCta}
          {secondaryCta}
        </div>
      ) : null}
      {actions ? actions : null}
      <p className="t-muted mt-1 whitespace-pre-line">{description}</p>
      {tags?.length ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm text-muted-foreground"
            >
              {tag.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      ) : null}
    </header>
  );
}
