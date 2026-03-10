"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { RefObject } from "react";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useTheme } from "next-themes";
import {
  ChevronLeft,
  Compass,
  Headset,
  Home,
  Images,
  Menu,
  Sparkles,
  X,
  Users,
} from "lucide-react";
import {
  IconSearch,
} from "@/components/icons/nandd";
import { WhatsAppCta } from "@/components/app/cta-actions";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/icon-button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { specialHubs } from "@/lib/hub/hubs.v1";
import { getLocaleOrderFromNavigator, LOCALE_LABELS, type Locale } from "@/lib/i18n/locale-order";
import { stripLocalePrefix } from "@/lib/i18n/strip-locale";
import {
  buildIndexedItems,
  getSearchResults,
  MAX_SITE_SEARCH_RESULTS,
  normalizeSearchQuery,
  type SearchItem,
} from "@/lib/search/site-search";
import { useHideHeaderOnScroll } from "@/lib/ui/use-hide-header-on-scroll";
import { toast } from "sonner";

const TOP_LEVEL_ROUTES = [
  "/",
  "/kesfet",
  "/piercing",
  "/galeri-tasarim",
  "/artistler",
  "/sss",
  "/iletisim",
] as const;

const TABS = [
  { href: "/", labelKey: "common.nav.home", icon: Home },
  { href: "/kesfet", labelKey: "common.nav.discover", icon: Compass },
  { href: "/piercing", labelKey: "common.nav.piercing", icon: Sparkles },
  { href: "/galeri-tasarim", labelKey: "common.nav.gallery", icon: Images },
  { href: "/artistler", labelKey: "common.nav.artists", icon: Users },
] as const;

const THEME_OPTIONS = [
  { value: "light", labelKey: "theme.light" },
  { value: "dark", labelKey: "theme.dark" },
  { value: "system", labelKey: "theme.system" },
] as const;
const CUSTOM_DESIGN_HUB = specialHubs.find((hub) => hub.slug === "kisiye-ozel-dovme-tasarimi");
const CUSTOM_DESIGN_HREF = CUSTOM_DESIGN_HUB?.canonicalPath ?? "/kesfet/kisiye-ozel-dovme-tasarimi";
const HAMBURGER_PAGE_LINKS = [
  { href: "/kesfet", labelKey: "common.nav.tattoo" },
  { href: "/piercing", labelKey: "common.nav.piercing" },
  { href: "/galeri-tasarim", labelKey: "common.nav.visuals" },
  { href: "/artistler", labelKey: "common.nav.artists" },
  { href: "/iletisim", labelKey: "common.nav.contact" },
  { href: CUSTOM_DESIGN_HREF, labelKey: "common.nav.customDesign" },
  { href: "/sss", labelKey: "common.nav.questionBank" },
] as const;
const MENU_ROW_BASE =
  "flex h-11 w-full items-center gap-3 rounded-xl px-4 text-base font-medium transition-[background-color,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]";
const TOPBAR_ICON_BUTTON_CLASS =
  "inline-flex size-11 items-center justify-center rounded-lg hover:bg-muted/40 active:scale-[0.98] [&_svg]:size-5 [&_svg]:text-foreground/80";
const HAMBURGER_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-full border border-border/50 bg-background/60 hover:bg-muted/30 active:scale-[0.98] active:bg-muted/45 [&_svg]:size-6 [&_svg]:text-foreground/80";
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

type MenuRowProps = {
  href: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
};

const DEFAULT_HUB_CHIP_LIMIT = 8;

function MenuRow({ href, label, isActive, onClick }: MenuRowProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        MENU_ROW_BASE,
        "active:bg-muted/70",
        isActive
          ? "bg-muted/60 font-semibold text-foreground"
          : "text-foreground/80 hover:bg-muted/40"
      )}
    >
      <span>{label}</span>
    </Link>
  );
}

type MobileHeaderProps = {
  contentShellRef?: RefObject<HTMLDivElement | null>;
  initialLocaleOrder: Locale[];
};

export function MobileHeader({ contentShellRef, initialLocaleOrder }: MobileHeaderProps) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const currentLocale = locale as Locale;
  const [activeLocale, setActiveLocale] = useState<Locale>(currentLocale);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [orderedLocales, setOrderedLocales] = useState<Locale[]>(() => initialLocaleOrder);
  const transformRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const themeMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useHideHeaderOnScroll({
    headerRef: transformRef,
    contentRef: contentShellRef,
    fallbackHeight: 112,
  });

  useEffect(() => {
    setOrderedLocales(getLocaleOrderFromNavigator());
  }, []);

  useEffect(() => {
    setActiveLocale(currentLocale);
  }, [currentLocale]);

  const isTopLevel = TOP_LEVEL_ROUTES.some((route) => pathname === route);
  const showHamburger = isTopLevel;
  const selectedTheme = themeMounted ? theme ?? "system" : "system";
  const activeThemeLabel = !themeMounted
    ? t("theme.system")
    : theme === "system"
      ? t("theme.systemWithCurrent", {
          current: resolvedTheme === "dark" ? t("theme.dark") : t("theme.light"),
        })
      : theme === "dark"
        ? t("theme.dark")
        : t("theme.light");

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/", { locale: currentLocale });
    }
  }, [currentLocale, router]);

  const isRouteActive = useCallback(
    (href: string) =>
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`),
    [pathname]
  );
  const handleSearchOpenChange = useCallback((open: boolean) => {
    setSearchOpen(open);
    if (!open) {
      setQuery("");
    }
  }, []);
  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    if (!searchOpen || process.env.NODE_ENV !== "development" || typeof performance === "undefined") {
      return;
    }

    performance.mark("search_open");
  }, [searchOpen]);

  const focusSearchInput = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const input = searchInputRef.current;
        if (!input) {
          return;
        }

        try {
          input.focus({ preventScroll: true });
        } catch {
          input.focus();
        }

        if (process.env.NODE_ENV !== "development" || typeof performance === "undefined") {
          return;
        }

        performance.mark("search_focus");
        try {
          performance.measure("search_open_to_focus", "search_open", "search_focus");
          const measures = performance.getEntriesByName("search_open_to_focus");
          const lastMeasure = measures[measures.length - 1];

          if (lastMeasure) {
            console.debug(`[search] open_to_focus ${lastMeasure.duration.toFixed(1)}ms`);
          }

          performance.clearMeasures("search_open_to_focus");
        } catch {
          // search_open mark may not exist if focus is triggered outside opening flow.
        }
      });
    });
  }, []);

  const searchIndex = useMemo(() => buildIndexedItems(t), [t]);
  const hubSearchItems = useMemo<SearchItem[]>(
    () => searchIndex.filter((item) => item.kind === "hub"),
    [searchIndex]
  );
  const defaultHubChips = useMemo(
    () => {
      const priorityList: string[] = [
        "minimal-fine-line-dovme",
        "yazi-isim-dovmesi",
        "realistik-dovme",
        "portre-dovme",
        "traditional-dovme",
        "blackwork-dovme",
        "dovme-kapatma",
        "kisiye-ozel-dovme-tasarimi",
      ];
      const orderedItems = priorityList.map((priorityItem) =>
        hubSearchItems.find((hubItem) => {
          return (
            hubItem.href.includes(`/kesfet/${priorityItem}`) ||
            hubItem.href.includes(priorityItem)
          );
        })
      ).filter((hubItem): hubItem is SearchItem => Boolean(hubItem));

      if (orderedItems.length !== priorityList.length) {
        return hubSearchItems.slice(0, DEFAULT_HUB_CHIP_LIMIT);
      }

      return orderedItems.slice(0, DEFAULT_HUB_CHIP_LIMIT);
    },
    [hubSearchItems]
  );
  const localeSwitchPath = useMemo(() => {
    const queryString = searchParams.toString();
    const basePath = stripLocalePrefix(pathname);
    return queryString ? `${basePath}?${queryString}` : basePath;
  }, [pathname, searchParams]);
  const normalizedQuery = useMemo(
    () => normalizeSearchQuery(deferredQuery.trim()),
    [deferredQuery]
  );
  const searchResults = useMemo(
    () => getSearchResults(searchIndex, deferredQuery, MAX_SITE_SEARCH_RESULTS),
    [searchIndex, deferredQuery]
  );

  const prefetchLocaleRoutes = useCallback(() => {
    orderedLocales.forEach((code) => {
      if (code === activeLocale) {
        return;
      }

      router.prefetch(localeSwitchPath, { locale: code });
    });
  }, [activeLocale, localeSwitchPath, orderedLocales, router]);

  const handleLocaleSelect = useCallback((code: Locale) => {
    if (code === activeLocale) {
      return;
    }

    setActiveLocale(code);
    router.replace(localeSwitchPath, { locale: code, scroll: false });
    toast.success(t("common.languageChanged", { language: LOCALE_LABELS[code] }));
  }, [activeLocale, localeSwitchPath, router, t]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 xl:hidden">
      <div
        ref={transformRef}
        className="border-b border-border bg-background/95 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-background/80 will-change-transform [transform:translate3d(0,0,0)]"
      >
        <div
          data-mobile-safe-top
          className="safe-pt"
        >
          <div className="app-container safe-pl-edge-12 safe-pr-edge-12 flex h-[var(--app-mobile-topbar-h)] min-h-[56px] items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex min-w-11 shrink-0 items-center justify-center pl-1.5">
                {showHamburger ? (
                  <Sheet open={hamburgerOpen} onOpenChange={setHamburgerOpen}>
                    <SheetTrigger asChild>
                      <IconButton
                        ariaLabel={t("mobileHeader.openMenu")}
                        size="lg"
                        isActive={hamburgerOpen}
                        className={HAMBURGER_BUTTON_CLASS}
                      >
                        <Menu className="size-6" aria-hidden />
                      </IconButton>
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      showCloseButton={false}
                      className="safe-pb flex flex-col border-border bg-background"
                    >
                      <SheetHeader className="sr-only p-0">
                        <SheetTitle>{t("mobileHeader.menuTitle")}</SheetTitle>
                        <SheetDescription>
                          {t("mobileHeader.menuDescription")}
                        </SheetDescription>
                      </SheetHeader>
                      <div className="flex items-center justify-between px-2 pt-1">
                        <p className="px-2 text-sm font-semibold tracking-tight text-foreground">
                          {t("mobileHeader.menuTitle")}
                        </p>
                        <SheetClose asChild>
                          <IconButton ariaLabel={t("mobileHeader.closeMenu")} size="md">
                            <X className="size-5" aria-hidden />
                          </IconButton>
                        </SheetClose>
                      </div>
                      <nav className="mt-2 flex flex-1 flex-col gap-1 px-2" aria-label={t("mobileHeader.mainMenuAria")}>
                        {HAMBURGER_PAGE_LINKS.map(({ href, labelKey }) => (
                          <MenuRow
                            key={href}
                            href={href}
                            label={t(labelKey)}
                            isActive={isRouteActive(href)}
                            onClick={() => setHamburgerOpen(false)}
                          />
                        ))}
                      </nav>
                      <div className="border-t border-border/60 pt-1">
                        <p className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-muted-foreground">
                          {t("mobileHeader.accessibility")}
                        </p>
                        <div className="px-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                aria-label={t("theme.selectMode")}
                                className={cn(
                                  MENU_ROW_BASE,
                                  "justify-between text-foreground/80 hover:bg-muted/40 active:bg-muted/70"
                                )}
                              >
                                <span>{t("theme.mode")}</span>
                                <span className="text-sm text-muted-foreground">
                                  {activeThemeLabel}
                                </span>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="min-w-44 border-border">
                              {THEME_OPTIONS.map(({ value, labelKey }) => (
                                <DropdownMenuItem
                                  key={value}
                                  onClick={() => setTheme(value)}
                                  className={cn(
                                    "cursor-pointer justify-between",
                                    selectedTheme === value && "font-semibold"
                                  )}
                                >
                                  <span>{t(labelKey)}</span>
                                  <span
                                    className={cn(
                                      "text-xs text-muted-foreground",
                                      selectedTheme === value ? "opacity-100" : "opacity-0"
                                    )}
                                  >
                                    {t("common.active")}
                                  </span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="mt-3 border-t border-border/60 p-2">
                        <WhatsAppCta
                          label={t("common.social.whatsapp")}
                          className="w-full"
                          onClick={() => setHamburgerOpen(false)}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                ) : (
                  <IconButton
                    ariaLabel={t("common.back")}
                    size="md"
                    onClick={handleBack}
                  >
                    <ChevronLeft className="size-5" aria-hidden />
                  </IconButton>
                )}
              </div>

              <Link
                href="/"
                locale={currentLocale}
                className="relative top-px hidden min-w-0 flex-1 items-center overflow-hidden text-ellipsis whitespace-nowrap text-[1.15rem] font-semibold leading-none tracking-tight text-foreground min-[360px]:inline-flex"
              >
                Enki
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <div className="order-1">
                <DropdownMenu
                  onOpenChange={(openState) => {
                    if (openState) {
                      prefetchLocaleRoutes();
                    }
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <IconButton
                      ariaLabel={t("common.selectLanguage")}
                      size="md"
                      className={TOPBAR_ICON_BUTTON_CLASS}
                    >
                      <LangFlag code={activeLocale} />
                    </IconButton>
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
              </div>

              <div className="order-2">
                <IconButton
                  ariaLabel={t("common.nav.contact")}
                  size="md"
                  isActive={isRouteActive("/iletisim")}
                  asChild
                  className={TOPBAR_ICON_BUTTON_CLASS}
                >
                  <Link href="/iletisim">
                    <Headset aria-hidden />
                  </Link>
                </IconButton>
              </div>

              <div className="order-3">
                <Sheet open={searchOpen} onOpenChange={handleSearchOpenChange}>
                  <SheetTrigger asChild>
                    <IconButton
                      ariaLabel={t("common.search")}
                      size="md"
                      isActive={searchOpen}
                      className={TOPBAR_ICON_BUTTON_CLASS}
                    >
                      <IconSearch size={20} />
                    </IconButton>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    onOpenAutoFocus={(event) => {
                      event.preventDefault();
                      focusSearchInput();
                    }}
                    className="safe-pb-16 flex transform-gpu flex-col gap-4 border-border bg-background px-4 pt-4 [will-change:transform] !transition-[transform,opacity] motion-reduce:animate-none motion-reduce:transition-none data-[state=open]:duration-[240ms] data-[state=closed]:duration-[180ms]"
                  >
                    <SheetHeader>
                      <SheetTitle className="sr-only">{t("common.search")}</SheetTitle>
                      <SheetDescription className="sr-only">
                        {t("mobileHeader.searchDescription")}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="relative">
                      <Input
                        ref={searchInputRef}
                        type="search"
                        placeholder={t("header.searchPlaceholder")}
                        className="border-border bg-surface-1 pr-12"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        aria-label={t("header.searchAria")}
                      />
                      {query ? (
                        <IconButton
                          ariaLabel={t("common.clearSearch")}
                          size="md"
                          onClick={() => {
                            setQuery("");
                            searchInputRef.current?.focus();
                          }}
                          className="absolute top-1 right-1 h-9 w-9 min-h-0 min-w-0 rounded-lg [&_svg]:size-4"
                        >
                          <X className="size-4" aria-hidden />
                        </IconButton>
                      ) : null}
                    </div>
                    {!normalizedQuery ? (
                      <div>
                        <p className="t-caption mb-2 text-muted-foreground">{t("mobileHeader.hubCategories")}</p>
                        <div className="flex flex-wrap gap-2">
                          {defaultHubChips.map((hub) => (
                            <Link
                              key={`chip:${hub.kind ?? "item"}:${hub.href}:${hub.title}`}
                              href={hub.href}
                              prefetch={false}
                              onClick={closeSearch}
                              className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm text-foreground"
                            >
                              {hub.title}
                            </Link>
                          ))}
                        </div>
                        <Link
                          href="/kesfet"
                          prefetch={false}
                          onClick={closeSearch}
                          className="mt-3 inline-flex rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 active:bg-muted/60"
                        >
                          {t("common.allCategories")}
                        </Link>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1" aria-label={t("common.searchResultsAria")}>
                        {searchResults.length ? (
                          searchResults.map((item) => (
                            <Link
                              key={`result:${item.kind ?? "item"}:${item.href}:${item.title}`}
                              href={item.href}
                              prefetch={false}
                              onClick={closeSearch}
                              className="rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-muted/40 active:bg-muted/60"
                            >
                              <div className="text-sm font-medium">{item.title}</div>
                              {item.description ? (
                                <div className="text-xs text-muted-foreground line-clamp-1">
                                  {item.description}
                                </div>
                              ) : null}
                            </Link>
                          ))
                        ) : (
                          <p className="px-1 py-2 text-sm text-muted-foreground">{t("common.noResults")}</p>
                        )}
                      </div>
                    )}
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>

        <nav className="border-t border-border/60" aria-label={t("mobileHeader.mainTabsAria")}>
          <div className="app-container flex h-[var(--app-mobile-tabbar-h)] min-h-[56px] items-stretch">
            {TABS.map(({ href, labelKey, icon: Icon }) => {
              const isActive =
                pathname === href ||
                (href !== "/" && pathname.startsWith(`${href}/`));

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "group relative flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 text-center transition-[color,transform,background-color] duration-150 active:scale-[0.97] active:bg-muted/60",
                    isActive
                      ? "bg-muted/45 text-foreground"
                      : "text-foreground/65 hover:bg-muted/35 hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="size-5 shrink-0" aria-hidden />
                  <span className="block w-full truncate whitespace-nowrap text-[11px] leading-none">
                    {t(labelKey)}
                  </span>
                  <span
                    className={cn(
                      "pointer-events-none absolute inset-x-3 bottom-0.5 h-0.5 rounded-full transition-opacity duration-150",
                      isActive ? "bg-foreground opacity-100" : "opacity-0"
                    )}
                    aria-hidden
                  />
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
