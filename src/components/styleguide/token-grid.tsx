"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TokenDef = {
  label: string;
  /** Semantic class for the swatch (e.g. bg-background). For text tokens use text-* and show on bg-background. */
  swatchClass: string;
  /** Code-like label e.g. "bg-background" */
  code: string;
  /** "bg" | "text" | "border" | "ring" | "overlay" */
  kind: "bg" | "text" | "border" | "ring" | "overlay";
};

const TOKENS: TokenDef[] = [
  { label: "background", swatchClass: "bg-background", code: "bg-background", kind: "bg" },
  { label: "foreground", swatchClass: "text-foreground", code: "text-foreground", kind: "text" },
  { label: "card", swatchClass: "bg-card", code: "bg-card", kind: "bg" },
  { label: "popover", swatchClass: "bg-popover", code: "bg-popover", kind: "bg" },
  { label: "primary", swatchClass: "bg-primary", code: "bg-primary", kind: "bg" },
  { label: "secondary", swatchClass: "bg-secondary", code: "bg-secondary", kind: "bg" },
  { label: "muted", swatchClass: "bg-muted", code: "bg-muted", kind: "bg" },
  { label: "accent", swatchClass: "bg-accent", code: "bg-accent", kind: "bg" },
  { label: "destructive", swatchClass: "bg-destructive", code: "bg-destructive", kind: "bg" },
  { label: "border", swatchClass: "border-2 border-border", code: "border-border", kind: "border" },
  { label: "input", swatchClass: "border border-input bg-transparent", code: "border-input", kind: "border" },
  { label: "ring", swatchClass: "ring-2 ring-ring ring-offset-2 ring-offset-background", code: "ring-ring", kind: "ring" },
  { label: "surface-1", swatchClass: "bg-surface-1", code: "bg-surface-1", kind: "bg" },
  { label: "surface-2", swatchClass: "bg-surface-2", code: "bg-surface-2", kind: "bg" },
  { label: "overlay", swatchClass: "bg-overlay", code: "bg-overlay", kind: "overlay" },
  { label: "overlay-strong", swatchClass: "bg-overlay-strong", code: "bg-overlay-strong", kind: "overlay" },
];

function TokenCard({ token }: { token: TokenDef }) {
  const isOverlay = token.kind === "overlay";
  const isText = token.kind === "text";
  const isBorderOrRing = token.kind === "border" || token.kind === "ring";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3">
        <span className="text-sm font-medium text-foreground">{token.label}</span>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <div
          className={cn(
            "flex min-h-[56px] items-center justify-center rounded-lg",
            isOverlay && "relative bg-surface-2",
            isText && "bg-background"
          )}
        >
          {isOverlay ? (
            <div className={cn("absolute inset-0 rounded-lg", token.swatchClass)} />
          ) : isText ? (
            <span className={cn("text-2xl font-medium", token.swatchClass)}>Aa</span>
          ) : isBorderOrRing ? (
            <div className={cn("h-10 w-16 rounded-md", token.swatchClass)} />
          ) : (
            <div className={cn("h-10 w-full rounded-md", token.swatchClass)} />
          )}
        </div>
        <code className="block truncate rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
          {token.code}
        </code>
      </CardContent>
    </Card>
  );
}

export function TokenGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {TOKENS.map((token) => (
        <TokenCard key={token.code} token={token} />
      ))}
    </div>
  );
}
