"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { RefObject } from "react";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import {
  ChevronLeft,
  Compass,
  Home,
  Images,
  Menu,
  Sparkles,
  X,
  Users,
} from "lucide-react";
import {
  IconGlobe,
  IconPhone,
  IconSearch,
  IconWhatsApp,
} from "@/components/icons/nandd";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import {
  Sheet,
  SheetClose,
  SheetContent,
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
import { Input } from "@/components/ui/input";
import { mainHubs, specialHubs } from "@/lib/hub/hubs.v1";
import { WHATSAPP_URL } from "@/lib/site/links";
import { useHideHeaderOnScroll } from "@/lib/ui/use-hide-header-on-scroll";
import { toast } from "sonner";

const TOP_LEVEL_ROUTES = [
  "/",
  "/kesfet",
  "/piercing",
  "/galeri-tasarim",
  "/artistler",
  "/iletisim",
] as const;

const TABS = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/kesfet", label: "Keşfet", icon: Compass },
  { href: "/piercing", label: "Piercing", icon: Sparkles },
  { href: "/galeri-tasarim", label: "Galeri", icon: Images },
  { href: "/artistler", label: "Artistler", icon: Users },
] as const;

const LANGUAGE_KEY = "enki-lang";
const LANG_OPTIONS = [
  { code: "TR", label: "Türkçe" },
  { code: "EN", label: "English" },
  { code: "RU", label: "Русский" },
] as const;
const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;
const MENU_ROW_BASE =
  "flex h-11 w-full items-center gap-3 rounded-xl px-4 text-base font-medium transition-[background-color,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]";

type MenuRowProps = {
  href: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
};

function MenuRow({ href, label, isActive, onClick }: MenuRowProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        MENU_ROW_BASE,
        "active:bg-muted/70 dark:active:bg-white/15",
        isActive
          ? "bg-muted/60 font-semibold text-foreground dark:bg-white/10"
          : "text-foreground/80 hover:bg-muted/40 dark:hover:bg-white/5"
      )}
    >
      <span>{label}</span>
    </Link>
  );
}

type MobileHeaderProps = {
  contentShellRef?: RefObject<HTMLDivElement | null>;
};

export function MobileHeader({ contentShellRef }: MobileHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const transformRef = useRef<HTMLDivElement>(null);
  const themeMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useHideHeaderOnScroll({
    headerRef: transformRef,
    contentRef: contentShellRef,
    fallbackHeight: 108,
  });

  const isTopLevel = TOP_LEVEL_ROUTES.some((route) => pathname === route);
  const showHamburger = isTopLevel;
  const selectedTheme = themeMounted ? theme ?? "system" : "system";
  const activeThemeLabel = !themeMounted
    ? "System"
    : theme === "system"
      ? `System (${resolvedTheme === "dark" ? "Dark" : "Light"})`
      : theme === "dark"
        ? "Dark"
        : "Light";

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  function handleLangSelect(code: string) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_KEY, code);
    }
    toast.success(`Dil: ${code}`);
  }

  const isRouteActive = useCallback(
    (href: string) =>
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`),
    [pathname]
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 xl:hidden">
      <div
        ref={transformRef}
        className="border-b border-border bg-background/95 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-background/80 will-change-transform [transform:translate3d(0,0,0)]"
      >
        <div
          data-mobile-safe-top
          className="pt-[env(safe-area-inset-top)]"
        >
          <div className="app-container flex h-[var(--app-mobile-topbar-h)] items-center gap-2.5">
            <div className="flex min-w-11 items-center justify-center">
              {showHamburger ? (
                <Sheet open={hamburgerOpen} onOpenChange={setHamburgerOpen}>
                  <SheetTrigger asChild>
                    <IconButton
                      ariaLabel="Menüyü aç"
                      size="md"
                      isActive={hamburgerOpen}
                    >
                      <Menu className="size-[22px]" aria-hidden />
                    </IconButton>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    showCloseButton={false}
                    className="flex flex-col border-border bg-background pb-[env(safe-area-inset-bottom)]"
                  >
                    <SheetTitle className="sr-only">Menü</SheetTitle>
                    <div className="flex items-center justify-between px-2 pt-1">
                      <p className="px-2 text-sm font-semibold tracking-tight text-foreground">
                        Menü
                      </p>
                      <SheetClose asChild>
                        <IconButton ariaLabel="Menüyü kapat" size="md">
                          <X className="size-5" aria-hidden />
                        </IconButton>
                      </SheetClose>
                    </div>
                    <nav className="mt-2 flex flex-1 flex-col gap-1 px-2" aria-label="Ana menü">
                      {TABS.map(({ href, label }) => (
                        <MenuRow
                          key={href}
                          href={href}
                          label={label}
                          isActive={isRouteActive(href)}
                          onClick={() => setHamburgerOpen(false)}
                        />
                      ))}
                      <MenuRow
                        href="/iletisim"
                        label="İletişim"
                        isActive={isRouteActive("/iletisim")}
                        onClick={() => setHamburgerOpen(false)}
                      />
                    </nav>
                    <div className="border-t border-border/60 pt-1">
                      <p className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-muted-foreground">
                        Özel
                      </p>
                      <div className="flex flex-col gap-1 px-2">
                        {specialHubs.map((hub) => (
                          <MenuRow
                            key={hub.id}
                            href={`/kesfet/${hub.slug}`}
                            label={hub.titleTR}
                            isActive={isRouteActive(`/kesfet/${hub.slug}`)}
                            onClick={() => setHamburgerOpen(false)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-border/60 pt-1">
                      <p className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-muted-foreground">
                        Tema
                      </p>
                      <div className="px-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              aria-label="Tema seç"
                              className={cn(
                                MENU_ROW_BASE,
                                "justify-between text-foreground/80 hover:bg-muted/40 dark:hover:bg-white/5 active:bg-muted/70 dark:active:bg-white/15"
                              )}
                            >
                              <span>Tema</span>
                              <span className="text-sm text-muted-foreground">
                                {activeThemeLabel}
                              </span>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="min-w-44 border-border">
                            {THEME_OPTIONS.map(({ value, label }) => (
                              <DropdownMenuItem
                                key={value}
                                onClick={() => setTheme(value)}
                                className={cn(
                                  "cursor-pointer justify-between",
                                  selectedTheme === value && "font-semibold"
                                )}
                              >
                                <span>{label}</span>
                                <span
                                  className={cn(
                                    "text-xs text-muted-foreground",
                                    selectedTheme === value ? "opacity-100" : "opacity-0"
                                  )}
                                >
                                  Aktif
                                </span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-border/60 p-2">
                      <Button asChild className="h-11 w-full rounded-xl" size="default">
                        <a
                          href={WHATSAPP_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setHamburgerOpen(false)}
                        >
                          <IconWhatsApp size={22} className="mr-2" />
                          WhatsApp
                        </a>
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <IconButton
                  ariaLabel="Geri"
                  size="md"
                  onClick={handleBack}
                >
                  <ChevronLeft className="size-5" aria-hidden />
                </IconButton>
              )}
            </div>

            <Link
              href="/"
              className="min-w-0 flex-1 truncate whitespace-nowrap text-[0.95rem] font-semibold leading-none tracking-tight text-foreground"
            >
              Enki Tattoo
            </Link>

            <div className="flex shrink-0 items-center gap-1.5">
              <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
                <SheetTrigger asChild>
                  <IconButton
                    ariaLabel="Ara"
                    size="md"
                    isActive={searchOpen}
                  >
                    <IconSearch size={20} />
                  </IconButton>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="flex flex-col gap-4 border-border bg-background pb-[env(safe-area-inset-bottom)]"
                >
                  <SheetHeader>
                    <SheetTitle className="sr-only">Ara</SheetTitle>
                  </SheetHeader>
                  <Input
                    type="search"
                    placeholder="Kategori veya sayfa ara..."
                    className="border-border bg-surface-1"
                    autoFocus
                    aria-label="Site içi arama"
                  />
                  <div>
                    <p className="t-caption mb-2 text-muted-foreground">Hub kategorileri</p>
                    <div className="flex flex-wrap gap-2">
                      {mainHubs.map((hub) => (
                        <Link
                          key={hub.id}
                          href={`/kesfet/${hub.slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm text-foreground"
                        >
                          {hub.titleTR}
                        </Link>
                      ))}
                      {specialHubs.map((hub) => (
                        <Link
                          key={hub.id}
                          href={`/kesfet/${hub.slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm text-foreground"
                        >
                          {hub.titleTR}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setSearchOpen(false)}
                    >
                      <IconWhatsApp size={22} className="mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                </SheetContent>
              </Sheet>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton
                    ariaLabel="Dil seç"
                    size="md"
                  >
                    <IconGlobe size={20} />
                  </IconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-border">
                  {LANG_OPTIONS.map(({ code, label }) => (
                    <DropdownMenuItem key={code} onClick={() => handleLangSelect(code)}>
                      {label} ({code})
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <IconButton
                ariaLabel="İletişim"
                size="md"
                isActive={isRouteActive("/iletisim")}
                asChild
              >
                <Link href="/iletisim">
                  <IconPhone size={20} />
                </Link>
              </IconButton>
            </div>
          </div>
        </div>

        <nav className="border-t border-border/80" aria-label="Ana sekmeler">
          <div className="app-container flex h-[var(--app-mobile-tabbar-h)] items-stretch">
            {TABS.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href ||
                (href !== "/" && pathname.startsWith(`${href}/`));

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "group relative flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 text-center transition-[color,transform,background-color] duration-150 active:scale-[0.97] active:bg-muted/60 dark:active:bg-white/10",
                    isActive
                      ? "bg-muted/45 text-foreground dark:bg-white/10"
                      : "text-foreground/65 hover:bg-muted/35 hover:text-foreground dark:text-foreground/70 dark:hover:bg-white/5"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-[22px] w-[22px] shrink-0" aria-hidden />
                  <span className="block w-full truncate whitespace-nowrap text-[11px] leading-[1.1]">
                    {label}
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
