import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const DOVME_SSS_FILTER_HREF = "/sss?cat=tattoo";
const TATTOO_TEASER_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7"] as const;

type DovmeFaqTeaserCardProps = {
  hubSlug: string;
};

function hashHubSlug(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export async function DovmeFaqTeaserCard({ hubSlug }: DovmeFaqTeaserCardProps) {
  const t = await getTranslations();
  const pool = TATTOO_TEASER_KEYS.map((key) => ({
    id: key,
    question: t(`pages.kesfetHub.faqTeaser.tattoo.items.${key}.q`),
    answer: t(`pages.kesfetHub.faqTeaser.tattoo.items.${key}.a`),
  }));

  const baseIndex = hashHubSlug(hubSlug) % pool.length;
  let secondaryIndex = (baseIndex + 3) % pool.length;
  if (secondaryIndex === baseIndex) {
    secondaryIndex = (baseIndex + 1) % pool.length;
  }

  const teaserItems = [pool[baseIndex], pool[secondaryIndex]];

  return (
    <article className="mt-4 rounded-2xl border border-border bg-surface-2 p-4 shadow-soft">
      <p className="text-sm font-semibold text-foreground">{t("common.nav.knowledgeBase")}</p>
      <p className="mt-1 text-sm text-muted-foreground">{t("pages.kesfetHub.faqTeaser.description")}</p>

      <ul className="mt-3 space-y-2">
        {teaserItems.map((item) => (
          <li key={item.id}>
            <Link
              href={DOVME_SSS_FILTER_HREF}
              className="group flex min-h-11 w-full min-w-0 items-start gap-3 rounded-xl border border-border bg-background px-4 py-3 transition-[background-color,transform,color] duration-150 hover:bg-muted/45 active:scale-[0.99] active:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="min-w-0 flex-1">
                <span className="block line-clamp-2 text-sm font-medium text-foreground">{item.question}</span>
                <span className="mt-1 block line-clamp-2 text-xs text-muted-foreground">{item.answer}</span>
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
        href={DOVME_SSS_FILTER_HREF}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-[background-color,transform,color] duration-150 hover:bg-muted/45 active:scale-[0.99] active:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {t("sss.teaser.viewAllQuestions")}
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </article>
  );
}
