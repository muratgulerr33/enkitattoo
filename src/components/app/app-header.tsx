"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import { IconSearch } from "@/components/icons/nandd";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { getLocaleOrderFromNavigator, LOCALE_LABELS, type Locale } from "@/lib/i18n/locale-order";
import { stripLocalePrefix } from "@/lib/i18n/strip-locale";
import { buildIndexedItems, getSearchResults, normalizeSearchQuery } from "@/lib/search/site-search";
import { iconBtn } from "@/lib/ui/metrics";
import { Headset, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FLAG_WRAPPER_CLASS =
  "inline-flex h-4 w-6 items-center justify-center overflow-hidden rounded-[3px] border border-border/70 bg-background";

type FlagProps = { className?: string };

function FlagTR({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 20 14" className={className} aria-hidden="true" focusable="false">
      <rect width="20" height="14" fill="#E30A17" />
      <circle cx="8" cy="7" r="3.6" fill="#FFFFFF" />
      <circle cx="9" cy="7" r="2.8" fill="#E30A17" />
      <polygon
        points="12.4,7 13.3,7.3 13.05,6.4 13.8,5.9 12.85,5.85 12.4,5 11.95,5.85 11,5.9 11.75,6.4 11.5,7.3"
        fill="#FFFFFF"
      />
    </svg>
  );
}

function FlagEN({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 20 14" className={className} aria-hidden="true" focusable="false">
      <rect width="20" height="14" fill="#012169" />
      <path d="M0 0 L20 14 M20 0 L0 14" stroke="#FFFFFF" strokeWidth="3.2" />
      <path d="M0 0 L20 14 M20 0 L0 14" stroke="#C8102E" strokeWidth="1.6" />
      <rect x="8.2" width="3.6" height="14" fill="#FFFFFF" />
      <rect y="5.2" width="20" height="3.6" fill="#FFFFFF" />
      <rect x="8.9" width="2.2" height="14" fill="#C8102E" />
      <rect y="5.9" width="20" height="2.2" fill="#C8102E" />
    </svg>
  );
}

function FlagSQ({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 20 14" className={className} aria-hidden="true" focusable="false">
      <rect width="20" height="14" fill="#E41E20" />
      <path
        d="M10 3.1 10.8 4.8 12.7 5 11.2 6.2 11.7 8 10 7.1 8.3 8 8.8 6.2 7.3 5 9.2 4.8Z"
        fill="#111111"
      />
    </svg>
  );
}

function FlagSR({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 20 14" className={className} aria-hidden="true" focusable="false">
      <rect width="20" height="14" fill="#C6363C" />
      <rect y="4.67" width="20" height="4.67" fill="#0C4076" />
      <rect y="9.34" width="20" height="4.66" fill="#FFFFFF" />
    </svg>
  );
}

function LangFlag({ code }: { code: Locale }) {
  const Flag = code === "en" ? FlagEN : code === "sq" ? FlagSQ : code === "sr" ? FlagSR : FlagTR;
  return (
    <span className={FLAG_WRAPPER_CLASS} aria-hidden="true">
      <Flag className="h-full w-full" />
    </span>
  );
}

export function AppHeader({
  initialLocaleOrder,
  className,
}: {
  initialLocaleOrder: Locale[];
  className?: string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [open, setOpen] = useState(false);
  const currentLocale = locale as Locale;
  const [activeLocale, setActiveLocale] = useState<Locale>(currentLocale);
  const [orderedLocales, setOrderedLocales] = useState<Locale[]>(() => initialLocaleOrder);
  const listboxId = useId();
  const searchRegionRef = useRef<HTMLDivElement>(null);
  const closeRafRef = useRef<number | null>(null);
  const searchIndex = useMemo(() => buildIndexedItems(t), [t]);
  const normalizedQuery = useMemo(
    () => normalizeSearchQuery(deferredQuery.trim()),
    [deferredQuery]
  );
  const searchResults = useMemo(
    () => getSearchResults(searchIndex, deferredQuery, 8),
    [searchIndex, deferredQuery]
  );
  const showResults = open && Boolean(normalizedQuery);
  const localeSwitchPath = useMemo(() => {
    const queryString = searchParams.toString();
    const basePath = stripLocalePrefix(pathname);
    return queryString ? `${basePath}?${queryString}` : basePath;
  }, [pathname, searchParams]);

  useEffect(
    () => () => {
      if (closeRafRef.current !== null) {
        cancelAnimationFrame(closeRafRef.current);
      }
    },
    []
  );

  useEffect(() => {
    setOrderedLocales(getLocaleOrderFromNavigator());
  }, []);

  useEffect(() => {
    setActiveLocale(currentLocale);
  }, [currentLocale]);

  function handleSearchBlur() {
    if (closeRafRef.current !== null) {
      cancelAnimationFrame(closeRafRef.current);
    }

    closeRafRef.current = requestAnimationFrame(() => {
      if (!searchRegionRef.current?.contains(document.activeElement)) {
        setOpen(false);
      }
    });
  }

  function handleResultSelect(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  function prefetchLocaleRoutes() {
    orderedLocales.forEach((code) => {
      if (code === activeLocale) {
        return;
      }

      router.prefetch(localeSwitchPath, { locale: code });
    });
  }

  function handleLocaleSelect(code: Locale) {
    if (code === activeLocale) {
      return;
    }

    setActiveLocale(code);
    router.replace(localeSwitchPath, { locale: code, scroll: false });
    toast.success(t("common.languageChanged", { language: LOCALE_LABELS[code] }));
  }

  return (
    <header className={cn("sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="app-container no-overflow-x flex h-14 items-center gap-3 xl:max-w-7xl">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link
            href="/"
            locale={currentLocale}
            className="shrink-0 max-w-[220px] truncate whitespace-nowrap text-[17px] font-semibold leading-none tracking-tight text-foreground"
          >
            {t("header.brand")}
          </Link>

          <div
            ref={searchRegionRef}
            className="relative min-w-0 w-full max-w-md"
            onBlur={handleSearchBlur}
          >
            <IconSearch
              size={20}
              className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground")}
            />
            <Input
              type="search"
              placeholder={t("header.searchPlaceholder")}
              className="h-10 bg-surface-1 pl-9"
              aria-label={t("header.searchAria")}
              value={query}
              onFocus={() => setOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  setOpen(false);
                }
              }}
              aria-expanded={showResults}
              aria-controls={showResults ? listboxId : undefined}
            />
            {showResults ? (
              <div
                id={listboxId}
                role="listbox"
                className="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-soft"
              >
                {searchResults.length ? (
                  <ul className="max-h-96 overflow-y-auto py-1">
                    {searchResults.map((item) => (
                      <li key={`${item.kind ?? "item"}:${item.href}:${item.title}`}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={false}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleResultSelect(item.href)}
                          className="w-full px-3 py-2 text-left transition-colors hover:bg-muted/40"
                        >
                          <div className="text-sm font-medium text-foreground">{item.title}</div>
                          {item.description ? (
                            <div className="line-clamp-1 text-xs text-muted-foreground">
                              {item.description}
                            </div>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 py-2 text-sm text-muted-foreground">{t("common.noResults")}</p>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <DropdownMenu
            onOpenChange={(openState) => {
              if (openState) {
                prefetchLocaleRoutes();
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={iconBtn}
                aria-label={t("common.selectLanguage")}
              >
                <LangFlag code={activeLocale} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border">
              {orderedLocales.map((code) => (
                <DropdownMenuItem
                  key={code}
                  className="!min-h-11 !h-11 px-3"
                  onSelect={() => handleLocaleSelect(code)}
                >
                  <span className="inline-flex items-center gap-2">
                    <LangFlag code={code} />
                    <span className="text-sm font-medium tracking-tight">{LOCALE_LABELS[code]}</span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ModeToggle variant="ghost" size="icon" className={iconBtn} />
          <Button variant="ghost" size="icon" className={iconBtn} asChild aria-label={t("common.nav.contact")}>
            <Link href="/iletisim">
              <Headset aria-hidden />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className={iconBtn} asChild aria-label={t("common.nav.artists")}>
            <Link href="/artistler">
              <Users aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
