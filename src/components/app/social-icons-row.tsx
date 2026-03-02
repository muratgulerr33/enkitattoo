"use client";

import { useTranslations } from "next-intl";
import { ExternalLink } from "@/components/ui/external-link";
import { SOCIAL_LINKS } from "@/lib/site/social-links";
import { cn } from "@/lib/utils";

type SocialIconsRowProps = {
  className?: string;
  size?: "sm" | "md";
};

export function SocialIconsRow({ className, size = "md" }: SocialIconsRowProps) {
  const t = useTranslations();
  const iconClassName =
    size === "sm"
      ? "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/70 text-foreground/75 transition-[transform,background-color,color] duration-150 hover:bg-muted/45 hover:text-foreground active:scale-[0.98] active:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      : "inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background/70 text-foreground/75 transition-[transform,background-color,color] duration-150 hover:bg-muted/45 hover:text-foreground active:scale-[0.98] active:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <ul className={cn("flex flex-wrap items-center justify-center gap-2", className)}>
      {SOCIAL_LINKS.map(({ id, labelKey, href, icon: Icon, external }) => (
        <li key={id}>
          {external ? (
            <ExternalLink href={href} className={iconClassName} aria-label={t(labelKey)}>
              <Icon size={20} />
            </ExternalLink>
          ) : (
            <a href={href} className={iconClassName} aria-label={t(labelKey)}>
              <Icon size={20} />
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
