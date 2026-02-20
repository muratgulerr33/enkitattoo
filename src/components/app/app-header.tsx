"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { icon, iconBtn } from "@/lib/ui/metrics";
import { Bell, MessageCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppHeader({
  className,
}: {
  className?: string;
}) {
  return (
    <header className={cn("sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 md:px-6">
        <Link href="/" className="flex shrink-0 flex-col leading-tight">
          <span className="t-h4 font-semibold tracking-tight text-foreground">
            ENKI
          </span>
          <span className="t-caption text-muted-foreground">Tattoo Studio</span>
        </Link>

        <div className="relative flex-1 max-w-md">
          <Search className={cn(icon, "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground")} aria-hidden />
          <Input
            type="search"
            placeholder="Kategori veya sayfa ara..."
            className="h-9 bg-surface-1 pl-9"
            aria-label="Site içi arama"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" className={iconBtn} aria-label="Bildirimler">
            <Bell className={icon} aria-hidden />
          </Button>
          <Button variant="ghost" size="icon" className={iconBtn} aria-label="Mesajlar">
            <MessageCircle className={icon} aria-hidden />
          </Button>
          <Avatar className="size-8">
            <AvatarFallback className="text-xs text-muted-foreground">U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
