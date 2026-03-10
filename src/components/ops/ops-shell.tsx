"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OpsSessionUser } from "@/lib/ops/auth/guards";
import { cn } from "@/lib/utils";
import type { OpsNavItem } from "@/lib/ops/navigation";
import { CalendarDays, ChevronLeft, FileText, UserRound, Users, WalletCards } from "lucide-react";

type OpsShellProps = {
  areaLabel: string;
  navItems: OpsNavItem[];
  sessionUser: OpsSessionUser;
  children: React.ReactNode;
};

const iconClassName = "size-4 shrink-0";

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function OpsNavIcon({ href }: { href: string }) {
  if (href.includes("/kasa")) {
    return <WalletCards className={iconClassName} aria-hidden />;
  }

  if (href.includes("/randevular")) {
    return <CalendarDays className={iconClassName} aria-hidden />;
  }

  if (href.includes("/musteriler")) {
    return <Users className={iconClassName} aria-hidden />;
  }

  if (href.includes("/form")) {
    return <FileText className={iconClassName} aria-hidden />;
  }

  return <UserRound className={iconClassName} aria-hidden />;
}

function OpsNavLink({
  href,
  label,
  compact = false,
}: {
  href: string;
  label: string;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium transition-[transform,background-color,color,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99]",
        compact ? "min-w-0 flex-1 px-2" : "shrink-0",
        active
          ? "border-border bg-foreground text-background"
          : "border-border bg-background text-foreground hover:bg-muted/45"
      )}
    >
      <OpsNavIcon href={href} />
      <span className={cn("truncate", compact && "text-xs")}>{label}</span>
    </Link>
  );
}

function getDisplayName(sessionUser: OpsSessionUser): string {
  return sessionUser.displayName ?? sessionUser.fullName ?? sessionUser.email ?? "Ops kullanicisi";
}

function formatRoleLabel(role: OpsSessionUser["roles"][number]): string {
  if (role === "admin") {
    return "Yonetici";
  }

  if (role === "artist") {
    return "Artist";
  }

  return "Kullanici";
}

export function OpsShell({ areaLabel, navItems, sessionUser, children }: OpsShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="app-container flex min-h-16 items-center justify-between gap-3 py-3">
          <div className="min-w-0 space-y-1">
            <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px]">
              Enki Studio Operations
            </Badge>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight text-foreground">
                {areaLabel}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {getDisplayName(sessionUser)} · {sessionUser.roles.map(formatRoleLabel).join(", ")}
              </p>
            </div>
          </div>

          <Button asChild variant="ghost" size="sm" className="shrink-0">
            <Link href="/ops/cikis">
              <ChevronLeft className="size-4" aria-hidden />
              Cikis
            </Link>
          </Button>
        </div>

        <div className="app-container hidden gap-2 overflow-x-auto pb-3 md:flex">
          {navItems.map((item) => (
            <OpsNavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </div>
      </header>

      <main className="app-container safe-pb-ops-shell md:pb-10">
        <div className="app-section">{children}</div>
      </main>

      <nav className="safe-pb-ops-nav fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-3 pt-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
        <div className="mx-auto flex max-w-6xl gap-2">
          {navItems.map((item) => (
            <OpsNavLink
              key={item.href}
              href={item.href}
              label={item.shortLabel}
              compact
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
