"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IconMessageCircle, IconSearch } from "@/components/icons/nandd";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { icon, iconBtn } from "@/lib/ui/metrics";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppHeader({
  className,
}: {
  className?: string;
}) {
  return (
    <header className={cn("sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="app-container no-overflow-x flex h-14 items-center gap-3">
        <Link href="/" className="flex shrink-0 flex-col leading-tight">
          <span className="t-h4 font-semibold tracking-tight text-foreground">
            ENKI
          </span>
          <span className="t-caption text-muted-foreground">Tattoo Studio</span>
        </Link>

        <div className="relative min-w-0 flex-1 max-w-md">
          <IconSearch
            size={20}
            className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground")}
          />
          <Input
            type="search"
            placeholder="Kategori veya sayfa ara..."
            className="h-9 bg-surface-1 pl-9"
            aria-label="Site içi arama"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <ModeToggle variant="ghost" size="icon" className={iconBtn} />
          <Button variant="ghost" size="icon" className={iconBtn} aria-label="Bildirimler">
            <Bell className={icon} aria-hidden />
          </Button>
          <Button variant="ghost" size="icon" className={iconBtn} aria-label="Mesajlar">
            <IconMessageCircle size={20} />
          </Button>
          <Avatar className="size-8">
            <AvatarFallback className="text-xs text-muted-foreground">U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
