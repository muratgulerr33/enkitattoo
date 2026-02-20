"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { whatsappUrl } from "@/lib/mock/enki";
import { MessageCircle } from "lucide-react";

const quickChips = [
  { label: "Randevu Al", href: "/iletisim" },
  { label: "Fiyat Sor", href: whatsappUrl },
  { label: "Bakım", href: whatsappUrl },
];

export function HomeComposer() {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-4 shadow-sm">
      <Input
        placeholder="Bugün ne yapmak istersin? Dövme mi piercing mi?"
        className="mb-3 bg-background border-border"
        readOnly
        aria-label="Hızlı paylaşım"
      />
      <div className="flex flex-wrap gap-2">
        {quickChips.map((chip) => (
          <Badge
            key={chip.label}
            variant="outline"
            className="cursor-pointer border-border bg-background hover:bg-accent"
            asChild
          >
            <a href={chip.href}>{chip.label}</a>
          </Badge>
        ))}
      </div>
      <Button
        asChild
        variant="default"
        size="sm"
        className="mt-3 w-full sm:w-auto"
      >
        <a href={whatsappUrl} className="gap-2">
          <MessageCircle className="size-4" aria-hidden />
          WhatsApp
        </a>
      </Button>
    </div>
  );
}
