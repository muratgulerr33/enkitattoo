"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { RefObject } from "react";
import { useCallback, useRef, useState } from "react";
import {
  ChevronLeft,
  Compass,
  Home,
  Images,
  Menu,
  Sparkles,
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
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sheet,
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
import { icon, iconBtn } from "@/lib/ui/metrics";
import { useHideHeaderOnScroll } from "@/lib/ui/use-hide-header-on-scroll";
import { toast } from "sonner";

const TOP_LEVEL_ROUTES = [
  "/",
  "/kesfet",
  "/piercing",
  "/galeri",
  "/artistler",
  "/iletisim",
] as const;

const TABS = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/kesfet", label: "Keşfet", icon: Compass },
  { href: "/piercing", label: "Piercing", icon: Sparkles },
  { href: "/galeri", label: "Galeri", icon: Images },
  { href: "/artistler", label: "Artistler", icon: Users },
] as const;

const LANGUAGE_KEY = "enki-lang";
const LANG_OPTIONS = [
  { code: "TR", label: "Türkçe" },
  { code: "EN", label: "English" },
  { code: "RU", label: "Русский" },
] as const;

type MobileHeaderProps = {
  contentShellRef?: RefObject<HTMLDivElement | null>;
};

export function MobileHeader({ contentShellRef }: MobileHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const transformRef = useRef<HTMLDivElement>(null);

  useHideHeaderOnScroll({
    headerRef: transformRef,
    contentRef: contentShellRef,
    fallbackHeight: 112,
  });

  const isTopLevel = TOP_LEVEL_ROUTES.some((route) => pathname === route);
  const showHamburger = isTopLevel;

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
          <div className="app-container flex h-[var(--app-mobile-topbar-h)] items-center gap-2">
            <div className="flex min-w-11 items-center justify-center">
              {showHamburger ? (
                <Sheet open={hamburgerOpen} onOpenChange={setHamburgerOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(iconBtn, "shrink-0")}
                      aria-label="Menüyü aç"
                    >
                      <Menu className={icon} aria-hidden />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="flex flex-col border-border bg-background pb-[env(safe-area-inset-bottom)]"
                  >
                    <SheetHeader>
                      <SheetTitle className="sr-only">Menü</SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-1 flex-col gap-1 px-2" aria-label="Ana menü">
                      {TABS.map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setHamburgerOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2.5 text-foreground hover:bg-accent",
                            pathname === href && "bg-accent"
                          )}
                        >
                          <Icon className="size-5 shrink-0 text-muted-foreground" />
                          <span>{label}</span>
                        </Link>
                      ))}
                      <Link
                        href="/iletisim"
                        onClick={() => setHamburgerOpen(false)}
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-foreground hover:bg-accent"
                      >
                        <IconPhone size={20} className="text-muted-foreground" />
                        <span>İletişim</span>
                      </Link>
                    </nav>
                    <div className="border-t border-border pt-3">
                      <p className="t-caption px-3 text-muted-foreground">Özel</p>
                      <div className="mt-2 flex flex-col gap-1">
                        {specialHubs.map((hub) => (
                          <Link
                            key={hub.id}
                            href={`/kesfet/${hub.slug}`}
                            onClick={() => setHamburgerOpen(false)}
                            className="rounded-md px-3 py-2 text-foreground hover:bg-accent"
                          >
                            {hub.titleTR}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 border-t border-border px-2 pt-3">
                      <p className="t-caption px-1 text-muted-foreground">Tema</p>
                      <div className="mt-2">
                        <ModeToggle
                          withLabel
                          align="start"
                          variant="outline"
                          size="default"
                          className="w-full justify-between"
                        />
                      </div>
                    </div>
                    <div className="mt-4 p-2">
                      <Button asChild className="w-full" size="lg">
                        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                          <IconWhatsApp size={22} className="mr-2" />
                          WhatsApp
                        </a>
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(iconBtn, "shrink-0")}
                  aria-label="Geri"
                  onClick={handleBack}
                >
                  <ChevronLeft className={icon} aria-hidden />
                </Button>
              )}
            </div>

            <Link
              href="/"
              className="min-w-0 flex-1 truncate whitespace-nowrap text-[0.95rem] font-semibold leading-none tracking-tight text-foreground"
            >
              Enki Tattoo
            </Link>

            <div className="flex shrink-0 items-center gap-1">
              <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={iconBtn}
                    aria-label="Ara"
                  >
                    <IconSearch size={20} />
                  </Button>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className={iconBtn}
                    aria-label="Dil seç"
                  >
                    <IconGlobe size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-border">
                  {LANG_OPTIONS.map(({ code, label }) => (
                    <DropdownMenuItem key={code} onClick={() => handleLangSelect(code)}>
                      {label} ({code})
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className={iconBtn}
                aria-label="İletişim"
                asChild
              >
                <Link href="/iletisim">
                  <IconPhone size={20} />
                </Link>
              </Button>
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
                    "relative flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-center transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground/90 hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-[22px] w-[22px] shrink-0" aria-hidden />
                  <span className="block w-full truncate whitespace-nowrap text-[11px] leading-[1.1]">
                    {label}
                  </span>
                  <span
                    className={cn(
                      "pointer-events-none absolute inset-x-2 bottom-0 h-0.5 rounded-full transition-opacity",
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
