"use client";

import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  type ComponentType,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Headset,
  Instagram,
  MapPin,
  MessageCircle,
  Search,
  X,
  Youtube,
} from "lucide-react";
import { SocialIconsRow } from "@/components/app/social-icons-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "@/components/ui/external-link";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import {
  resolveKbCategories,
  resolveKbItems,
  resolveQuickGuideLinks,
  type KbCategoryFilter,
} from "@/lib/sss/kb-registry";
import { INSTAGRAM_URL, PHONE_TEL_URL, WHATSAPP_URL } from "@/lib/site/links";
import { cn } from "@/lib/utils";

type IndexedKbItem = ReturnType<typeof resolveKbItems>[number] & {
  searchText: string;
};

type GuideIconComponent = ComponentType<{ className?: string; size?: number }>;
const FAQ_PAGE_SIZE = 10;

function getGuideIcon(id: string): GuideIconComponent {
  switch (id) {
    case "guide-contact":
      return Headset;
    case "guide-maps":
      return MapPin;
    case "guide-instagram":
      return Instagram;
    case "guide-youtube":
      return Youtube;
    case "guide-whatsapp":
      return MessageCircle;
    default:
      return Headset;
  }
}

function getCategoryFromSearchParams(
  searchParams: ReturnType<typeof useSearchParams>
): KbCategoryFilter {
  const categoryParam = searchParams.get("cat");
  return categoryParam === "tattoo" || categoryParam === "piercing" || categoryParam === "studio"
    ? categoryParam
    : "all";
}

export function KBClient() {
  const t = useTranslations();
  const kbItems = useMemo(() => resolveKbItems(t), [t]);
  const kbCategories = useMemo(() => resolveKbCategories(t), [t]);
  const quickGuideLinks = useMemo(() => resolveQuickGuideLinks(t), [t]);
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<KbCategoryFilter>(() =>
    getCategoryFromSearchParams(searchParams)
  );
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(FAQ_PAGE_SIZE);

  const deferredQuery = useDeferredValue(query);

  const indexedItems = useMemo<IndexedKbItem[]>(
    () =>
      kbItems.map((item) => ({
        ...item,
        searchText: `${item.question} ${item.answerShort} ${item.answerLong}`.toLocaleLowerCase(
          "tr-TR"
        ),
      })),
    [kbItems]
  );

  const normalizedQuery = useMemo(
    () => deferredQuery.trim().toLocaleLowerCase("tr-TR"),
    [deferredQuery]
  );

  const filteredItems = useMemo(() => {
    return indexedItems.filter((item) => {
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return item.searchText.includes(normalizedQuery);
    });
  }, [activeCategory, indexedItems, normalizedQuery]);

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount],
  );
  const hasMoreItems = visibleCount < filteredItems.length;

  const openFromHash = useCallback((rawHash?: string) => {
    if (typeof window === "undefined") {
      return;
    }

    const hashText = decodeURIComponent((rawHash ?? window.location.hash).replace(/^#/, "")).trim();
    if (!hashText) {
      return;
    }

    const targetItem = kbItems.find((item) => item.id === hashText);
    if (!targetItem) {
      return;
    }

    setQuery("");
    setActiveCategory(targetItem.category);
    setVisibleCount(FAQ_PAGE_SIZE);
    setOpenIds((prev) => (prev.includes(targetItem.id) ? prev : [...prev, targetItem.id]));

    window.setTimeout(() => {
      const targetElement = document.getElementById(targetItem.id);
      targetElement?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, [kbItems]);

  useEffect(() => {
    const onHashChange = () => {
      openFromHash(window.location.hash);
    };

    window.addEventListener("hashchange", onHashChange);
    window.requestAnimationFrame(() => {
      onHashChange();
    });

    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [openFromHash]);

  const handleOpenToggle = useCallback((id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  }, []);

  return (
    <div className="space-y-5 pb-[calc(24px+env(safe-area-inset-bottom))]">
      <section className="space-y-3" aria-label={t("sss.ui.searchFilterAria")}>
        <div className="relative min-w-0">
          <label htmlFor="kb-search" className="sr-only">
            {t("sss.ui.searchLabel")}
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="kb-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(FAQ_PAGE_SIZE);
            }}
            placeholder={t("sss.ui.searchPlaceholder")}
            className="h-11 border-border bg-surface-2 pl-9 pr-12 text-sm"
          />
          {query ? (
            <IconButton
              ariaLabel={t("common.clearSearch")}
              variant="ghost"
              size="md"
              onClick={() => {
                setQuery("");
                setVisibleCount(FAQ_PAGE_SIZE);
              }}
              className="absolute right-0 top-0 rounded-l-none rounded-r-md"
            >
              <X className="size-4" aria-hidden />
            </IconButton>
          ) : null}
        </div>

        <div className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {kbCategories.map((category) => {
            const isActive = activeCategory === category.id;

            return (
              <Button
                key={category.id}
                type="button"
                variant={isActive ? "secondary" : "outline"}
                onClick={() => {
                  setActiveCategory(category.id);
                  setVisibleCount(FAQ_PAGE_SIZE);
                }}
                className={cn(
                  "min-h-11 shrink-0 rounded-full px-4",
                  isActive
                    ? "bg-muted/60 text-foreground"
                    : "bg-background text-foreground/85"
                )}
              >
                {category.label}
              </Button>
            );
          })}
        </div>
      </section>

      <section className="mt-8" aria-label={t("common.nav.contact")}>
        <SocialIconsRow />
      </section>

      <section className="mt-6 space-y-3" aria-labelledby="kb-faq-list">
        <div className="flex min-w-0 items-baseline justify-between gap-3">
          <h2 id="kb-faq-list" className="t-h4 text-foreground">
            {t("sss.ui.faqTitle")}
          </h2>
          <p className="shrink-0 text-sm text-muted-foreground">
            {t("sss.ui.questionCount", { count: filteredItems.length })}
          </p>
        </div>

        {filteredItems.length ? (
          <div className="space-y-3">
            {visibleItems.map((item) => {
              const isOpen = openIds.includes(item.id);
              const triggerId = `${item.id}-trigger`;
              const contentId = `${item.id}-content`;
              const bodyText = item.answerLong || item.answerShort;

              return (
                <article
                  key={item.id}
                  id={item.id}
                  data-testid="faq-item"
                  className="min-w-0 rounded-2xl border border-border bg-surface-2 px-4 py-3 shadow-soft scroll-mt-[calc(var(--app-mobile-header-h)+20px)] xl:scroll-mt-20"
                >
                  <button
                    id={triggerId}
                    type="button"
                    aria-controls={contentId}
                    aria-expanded={isOpen}
                    onClick={() => handleOpenToggle(item.id)}
                    className="flex min-h-11 w-full items-start justify-between gap-3 rounded-xl px-1 text-left transition-[background-color,transform] duration-150 active:scale-[0.99] active:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">{item.question}</span>
                    <ChevronDown
                      className={cn(
                        "mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                      aria-hidden
                    />
                  </button>

                  <div id={contentId} role="region" aria-labelledby={triggerId} className="min-w-0">
                    <p
                      className={cn(
                        "mt-2 text-sm leading-relaxed transition-colors duration-200",
                        isOpen ? "text-foreground/90" : "line-clamp-2 text-muted-foreground"
                      )}
                    >
                      {bodyText}
                    </p>
                  </div>
                </article>
              );
            })}
            {hasMoreItems ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="faq-load-more"
                onClick={() =>
                  setVisibleCount((prev) => Math.min(prev + FAQ_PAGE_SIZE, filteredItems.length))
                }
                className="w-full"
              >
                {t("common.showMore")}
              </Button>
            ) : null}
          </div>
        ) : (
          <Card className="gap-0 border-border bg-surface-2 py-4 shadow-soft">
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{t("common.noResultsWithDot")}</p>
              <p>{t("sss.ui.noResultsHint")}</p>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="mt-10 space-y-3" aria-label={t("sss.ui.quickGuideAria")}>
        <h2 className="t-h4 text-foreground">{t("sss.ui.quickGuideTitle")}</h2>
        <div className="grid min-w-0 gap-2 sm:grid-cols-2">
          {quickGuideLinks.map((guide) => {
            const GuideIcon = getGuideIcon(guide.id);
            const TrailingIcon = guide.external ? ArrowUpRight : ChevronRight;
            const guideHref = guide.href;
            const bodyClassName =
              "group flex min-h-11 w-full min-w-0 items-center gap-3 rounded-2xl px-4 py-3 text-left transition-[transform,background-color,color] duration-150 hover:bg-muted/45 active:scale-[0.99] active:bg-muted/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

            return (
              <Card key={guide.id} className="gap-0 overflow-hidden rounded-2xl border border-border bg-surface-2 py-0 shadow-soft">
                <CardContent className="p-0">
                  {!guideHref ? (
                    <div
                      aria-disabled="true"
                      className={cn(bodyClassName, "cursor-not-allowed opacity-60")}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-foreground/75 dark:bg-muted/35">
                        <GuideIcon className="size-5" aria-hidden />
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">{guide.label}</span>
                        <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                          {guide.description}
                        </span>
                      </span>
                      <TrailingIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    </div>
                  ) : guide.external ? (
                    <ExternalLink
                      href={guideHref}
                      aria-label={t("sss.ui.openLinkAria", { label: guide.label })}
                      className={bodyClassName}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-foreground/75 dark:bg-muted/35">
                        <GuideIcon className="size-5" aria-hidden />
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">{guide.label}</span>
                        <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                          {guide.description}
                        </span>
                      </span>
                      <TrailingIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    </ExternalLink>
                  ) : (
                    <Link href={guideHref} aria-label={guide.label} className={bodyClassName}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-foreground/75 dark:bg-muted/35">
                        <GuideIcon className="size-5" aria-hidden />
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">{guide.label}</span>
                        <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                          {guide.description}
                        </span>
                      </span>
                      <TrailingIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-3 rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm text-muted-foreground shadow-soft">
          <span className="font-medium text-foreground">{t("sss.ui.fastestContactLead")}</span>{" "}
          <ExternalLink
            href={WHATSAPP_URL}
            className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
          >
            {t("common.social.whatsapp")}
          </ExternalLink>{" "}
          {t("sss.ui.fastestContactMiddle")}{" "}
          <a
            href={PHONE_TEL_URL}
            className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
          >
            {t("common.social.phone")}
          </a>{" "}
          {t("sss.ui.fastestContactAnd")}{" "}
          <ExternalLink
            href={INSTAGRAM_URL}
            className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
          >
            {t("common.social.instagram")}
          </ExternalLink>{" "}
          {t("sss.ui.fastestContactEnd")}
        </div>
      </section>
    </div>
  );
}
