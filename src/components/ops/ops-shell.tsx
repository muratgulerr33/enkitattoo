"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { OpsSessionUser } from "@/lib/ops/auth/guards";
import { cn } from "@/lib/utils";
import type { OpsNavItem } from "@/lib/ops/navigation";
import {
  CalendarDays,
  CalendarRange,
  FileText,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";

type OpsShellProps = {
  areaLabel: string;
  navItems: OpsNavItem[];
  sessionUser: OpsSessionUser;
  children: React.ReactNode;
};

const iconClassName = "size-4 shrink-0";

type OpsHeaderAction = {
  href: string;
  label: string;
};

function isActivePath(pathname: string, href: string): boolean {
  if (
    href === "/ops/staff/raporlar" &&
    (pathname === "/ops/staff/kasa" || pathname.startsWith("/ops/staff/kasa/"))
  ) {
    return true;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function OpsNavIcon({ href }: { href: string }) {
  if (href.includes("/raporlar")) {
    return <CalendarRange className={iconClassName} aria-hidden />;
  }

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

  if (href.includes("/onaylar")) {
    return <ShieldCheck className={iconClassName} aria-hidden />;
  }

  return <UserRound className={iconClassName} aria-hidden />;
}

function getHeaderAction(pathname: string): OpsHeaderAction | null {
  if (pathname === "/ops/staff/raporlar") {
    return {
      href: "/ops/staff/kasa",
      label: "Defteri aç",
    };
  }

  if (pathname === "/ops/staff/kasa") {
    return {
      href: "/ops/staff/kasa#manuel-giris",
      label: "Manuel giriş",
    };
  }

  return null;
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
        compact
          ? "min-w-0 flex-1 flex-col gap-1 rounded-xl px-1 py-2 text-[9px] leading-[1.05]"
          : "shrink-0",
        active
          ? "border-border bg-foreground text-background"
          : "border-border bg-background text-foreground hover:bg-muted/45"
      )}
    >
      <OpsNavIcon href={href} />
      <span
        className={cn(
          compact
            ? "block text-center text-[9px] leading-[1.05] tracking-tight sm:text-[10px]"
            : "truncate"
        )}
      >
        {label}
      </span>
    </Link>
  );
}

function getDisplayName(sessionUser: OpsSessionUser): string {
  return sessionUser.displayName ?? sessionUser.fullName ?? sessionUser.email ?? "Ops kullanıcısı";
}

function formatRoleLabel(role: OpsSessionUser["roles"][number]): string {
  if (role === "admin") {
    return "Yönetici";
  }

  if (role === "artist") {
    return "Artist";
  }

  return "Kullanıcı";
}

export function OpsShell({ areaLabel, navItems, sessionUser, children }: OpsShellProps) {
  const pathname = usePathname();
  const roleSummary = sessionUser.roles.map(formatRoleLabel).join(", ");
  const isStaffDocumentPacketRoute = pathname.startsWith("/ops/staff/belgeler/");
  const headerAction = getHeaderAction(pathname);

  if (isStaffDocumentPacketRoute) {
    return <div className="min-h-viewport bg-background text-foreground">{children}</div>;
  }

  return (
    <div className="min-h-viewport bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/92 supports-[backdrop-filter]:bg-background/78 supports-[backdrop-filter]:backdrop-blur">
        <div className="app-container max-w-[92rem] flex min-h-11 items-center justify-between gap-2 py-1.5 sm:py-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {areaLabel}
            </p>
            <div className="flex min-w-0 items-baseline gap-2.5">
              <p className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-[15px]">
                {getDisplayName(sessionUser)}
              </p>
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                {roleSummary}
              </p>
            </div>
          </div>

          {headerAction ? (
            <Button asChild variant="outline" size="sm" className="shrink-0 rounded-lg">
              <Link href={headerAction.href}>{headerAction.label}</Link>
            </Button>
          ) : null}
        </div>

        <div className="app-container max-w-[92rem] hidden gap-2 overflow-x-auto pb-2 md:flex">
          {navItems.map((item) => (
            <OpsNavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </div>
      </header>

      <main className="app-container max-w-[92rem] safe-pb-ops-shell md:pb-9">
        <div className="app-section space-y-4 py-4 sm:space-y-5 sm:py-5 md:py-7 lg:py-8">
          {children}
        </div>
      </main>

      <nav className="safe-pb-ops-nav fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-2.5 pt-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
        <div
          className="mx-auto grid max-w-6xl gap-1"
          style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
        >
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
