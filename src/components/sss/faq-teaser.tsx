import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { resolveKbItems } from "@/lib/sss/kb-registry";

type FaqTeaserVariant = "hub" | "piercing" | "home";

type FaqTeaserProps = {
  variant: FaqTeaserVariant;
};

type PreviewMode = "titles-only" | "title+short";

function getItemsForVariant(
  variant: FaqTeaserVariant,
  items: ReturnType<typeof resolveKbItems>
) {
  const tattooItems = items.filter((item) => item.category === "tattoo");
  const piercingItems = items.filter((item) => item.category === "piercing");
  const mixedPreviewItems = [...tattooItems.slice(0, 3), ...piercingItems.slice(0, 1)].slice(0, 4);

  if (variant === "hub") {
    return tattooItems.slice(0, 4);
  }

  if (variant === "piercing") {
    return piercingItems.slice(0, 4);
  }

  return mixedPreviewItems;
}

function getVariantConfig(variant: FaqTeaserVariant): { ctaHref: string; previewMode: PreviewMode } {
  if (variant === "piercing") {
    return { ctaHref: "/sss?cat=piercing", previewMode: "titles-only" };
  }
  if (variant === "hub") {
    return { ctaHref: "/sss?cat=tattoo", previewMode: "titles-only" };
  }

  return { ctaHref: "/sss", previewMode: "title+short" };
}

export function FaqTeaser({ variant }: FaqTeaserProps) {
  const t = useTranslations();
  const kbItems = resolveKbItems(t);
  const { ctaHref, previewMode } = getVariantConfig(variant);
  const items = getItemsForVariant(variant, kbItems);

  return (
    <article className="rounded-2xl border border-border bg-surface-2 p-4 shadow-soft">
      <p className="text-sm font-semibold text-foreground">{t("common.nav.knowledgeBase")}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("sss.teaser.description")}
      </p>

      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={ctaHref}
              className="group flex min-h-11 w-full min-w-0 items-start gap-3 rounded-xl border border-border bg-background px-4 py-3 transition-[background-color,transform,color] duration-150 hover:bg-muted/45 active:scale-[0.99] active:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="min-w-0 flex-1">
                <span className="block line-clamp-2 text-sm font-medium text-foreground">{item.question}</span>
                {previewMode === "title+short" ? (
                  <span className="mt-1 block line-clamp-1 text-xs text-muted-foreground">
                    {item.answerShort}
                  </span>
                ) : null}
              </span>
              <ChevronRight
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-[background-color,transform,color] duration-150 hover:bg-muted/45 active:scale-[0.99] active:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {t("sss.teaser.viewAllQuestions")}
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </article>
  );
}
