"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Images, Phone, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";


const TABS = [
  { href: "/kesfet", label: "Keşfet", icon: Compass },
  { href: "/galeri", label: "Galeri", icon: Images },
  { href: "/piercing", label: "Piercing", icon: Sparkles },
  { href: "/artistler", label: "Artistler", icon: Users },
  { href: "/iletisim", label: "İletişim", icon: Phone },
] as const;

export function BottomNav({
  className,
}: {
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] hidden md:flex md:pb-3",
        className
      )}
      aria-label="Ana gezinti"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-around">
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href === "/kesfet" && pathname.startsWith("/kesfet/"));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
