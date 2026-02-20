"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  Compass,
  Globe,
  Home,
  Images,
  Menu,
  MessageCircle,
  Phone,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { whatsappUrl } from "@/lib/mock/enki";
import { icon, iconBtn } from "@/lib/ui/metrics";
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

export function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const lastScrollY = useRef(0);
  const lastDirection = useRef<"up" | "down" | null>(null);
  const accumulated = useRef(0);
  const rafId = useRef<number | null>(null);

  const isTopLevel = TOP_LEVEL_ROUTES.some((r) => pathname === r);
  const showHamburger = isTopLevel;

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    const thresholdDown = 16;
    const thresholdUp = 12;
    const topThreshold = 8;

    function onScroll() {
      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        const y = window.scrollY;
        const delta = y - lastScrollY.current;
        lastScrollY.current = y;

        if (y < topThreshold) {
          setVisible(true);
          accumulated.current = 0;
          lastDirection.current = null;
          return;
        }

        if (delta > 0) {
          accumulated.current =
            lastDirection.current === "down"
              ? accumulated.current + delta
              : delta;
          lastDirection.current = "down";
          if (accumulated.current >= thresholdDown) {
            setVisible(false);
            accumulated.current = 0;
          }
        } else if (delta < 0) {
          accumulated.current =
            lastDirection.current === "up"
              ? accumulated.current + Math.abs(delta)
              : Math.abs(delta);
          lastDirection.current = "up";
          if (accumulated.current >= thresholdUp) {
            setVisible(true);
            accumulated.current = 0;
          }
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  function handleLangSelect(code: string) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_KEY, code);
    }
    toast.success(`Dil: ${code}`);
  }

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 flex flex-col border-b border-border bg-background/95 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-background/80 pt-[env(safe-area-inset-top)] transition-transform duration-[200ms] ease-out md:hidden",
        !visible && "-translate-y-full"
      )}
      style={{ minHeight: 104 }}
    >
      {/* Row A: Top Bar */}
      <div className="flex h-12 shrink-0 items-center gap-2 px-2">
        <div className="flex min-w-[44px] items-center justify-center">
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
                    <Phone className="size-5 shrink-0 text-muted-foreground" />
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
                <div className="mt-4 p-2">
                  <Button asChild className="w-full" size="lg">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 size-5" />
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
          className="flex flex-col leading-tight text-foreground"
        >
          <span className="t-h4 font-semibold tracking-tight">ENKI</span>
          <span className="t-caption text-muted-foreground">Tattoo Studio</span>
        </Link>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={iconBtn}
                aria-label="Ara"
              >
                <Search className={icon} aria-hidden />
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
                className="bg-surface-1 border-border"
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
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setSearchOpen(false)}
                >
                  <MessageCircle className="mr-2 size-5" />
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
                <Globe className={icon} aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border">
              {LANG_OPTIONS.map(({ code, label }) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => handleLangSelect(code)}
                >
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
              <Phone className={icon} aria-hidden />
            </Link>
          </Button>
        </div>
      </div>

      {/* Row B: Tab Bar */}
      <nav
        className="flex shrink-0 items-center justify-around border-t border-border bg-background px-1 py-1"
        aria-label="Sekmeler"
      >
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href === "/kesfet" && pathname.startsWith("/kesfet/"));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-md py-2 transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn(icon, "shrink-0")} aria-hidden />
              <span className="t-caption">{label}</span>
              {isActive && (
                <span className="absolute bottom-1 left-1/2 h-[2px] w-6 min-w-[1.5rem] -translate-x-1/2 rounded-full bg-primary" aria-hidden />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
