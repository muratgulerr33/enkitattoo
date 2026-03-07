# Discovery UI 05 — Header + BottomNav + Safe-Area

## KANIT
### K1 — Header/Nav bileşenleri nerede
```bash
$ rg -n "BottomNav|MobileHeader|AppHeader|AppShell|RightRail|AppFooter|ChatBubble" -S src
src/app/(app)/layout.tsx:1:import { AppShell } from "@/components/app/app-shell";
src/components/app/app-shell.tsx:4:import { AppHeader } from "@/components/app/app-header";
src/components/app/app-shell.tsx:7:import { MobileHeader } from "@/components/app/mobile-header";
src/components/app/bottom-nav.tsx:3:export function BottomNav() {
```

### K2 — AppShell render zinciri
```tsx
// src/components/app/app-shell.tsx:19-24
<MobileHeader contentShellRef={contentShellRef} />
<AppHeader className="hidden xl:block" />
<div ref={contentShellRef} className="[transform:translate3d(0,0,0)]">
  <main className="app-container app-mobile-header-offset app-safe-bottom ...">
```

### K3 — Desktop header davranışı
```tsx
// src/components/app/app-header.tsx:19-21
<header className={cn("sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
  <div className="app-container no-overflow-x flex h-14 items-center gap-3">
```

### K4 — Mobile header + safe-area
```tsx
// src/components/app/mobile-header.tsx:105-114
<header className="fixed inset-x-0 top-0 z-50 xl:hidden">
  <div ref={transformRef} className="border-b ... backdrop-blur ... [transform:translate3d(0,0,0)]">
    <div data-mobile-safe-top className="pt-[env(safe-area-inset-top)]">
      <div className="app-container flex h-[var(--app-mobile-topbar-h)] items-center gap-2">
```

### K5 — Mobile tabbar (bottom nav fonksiyonu)
```tsx
// src/components/app/mobile-header.tsx:316-343
<nav className="border-t border-border/80" aria-label="Ana sekmeler">
  <div className="app-container flex h-[var(--app-mobile-tabbar-h)] items-stretch">
    ...
    className="... transition-colors ..."
    isActive ? "text-foreground" : "text-muted-foreground/90 hover:text-foreground"
    ...
    className="... bottom-0 h-0.5 rounded-full transition-opacity"
```

### K6 — Scroll-hide davranışı (rAF + reduced motion)
```ts
// src/lib/ui/use-hide-header-on-scroll.ts:38-41
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopQuery = window.matchMedia("(min-width: 80rem)");

// src/lib/ui/use-hide-header-on-scroll.ts:109-112
function onScroll() {
  if (rafId !== null) return;
  rafId = window.requestAnimationFrame(flushScrollFrame);
}
```

### K7 — Safe-area utility’leri
```css
/* src/app/globals.css:395-401 */
.app-mobile-header-offset {
  padding-top: calc(env(safe-area-inset-top) + var(--app-mobile-header-h));
}
.app-safe-bottom {
  padding-bottom: calc(env(safe-area-inset-bottom) + 1rem);
}
```

### K8 — `BottomNav` komponenti
```tsx
// src/components/app/bottom-nav.tsx:1-5
"use client";

export function BottomNav() {
  return null;
}
```

### K9 — `viewport-fit` araması
```bash
$ rg -n "viewport-fit|safe-area|apple-mobile-web-app" -S src/app/head.tsx src/app/layout.tsx src/app/globals.css
src/app/globals.css:396:padding-top: calc(env(safe-area-inset-top) + var(--app-mobile-header-h));
src/app/globals.css:400:padding-bottom: calc(env(safe-area-inset-bottom) + 1rem);
src/app/head.tsx:167:<meta name="apple-mobile-web-app-capable" content="yes" />
src/app/head.tsx:168:<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

## BULGULAR
- `MobileHeader` ve `AppHeader` AppShell içinde merkezi layout katmanında render ediliyor (K2).
- Desktop header: `sticky`, `h-14`, blur/backdrop davranışı var (K3).
- Mobile header: `fixed`, safe-top padding (`env(safe-area-inset-top)`), topbar yüksekliği `--app-mobile-topbar-h` (K4).
- Mobile alt sekme barı `MobileHeader` içinde; `h-[var(--app-mobile-tabbar-h)]` ve active indicator kullanıyor (K5).
- Scroll ile header saklama `requestAnimationFrame` + `prefers-reduced-motion` kontrolü içeriyor (K6).
- Global safe-area offset utility’leri `main` üzerinde kullanılıyor (`app-mobile-header-offset`, `app-safe-bottom`) (K2, K7).
- Ayrı `BottomNav` dosyası mevcut ama fonksiyonel değil (`return null`) (K8).

### Component bazlı özet
- `src/components/app/mobile-header.tsx`
  - Nerede render: `src/components/app/app-shell.tsx`.
  - Yükseklik/padding: topbar `--app-mobile-topbar-h`, tabbar `--app-mobile-tabbar-h`, safe-top `pt-[env(...)]`.
  - Safe-area: var (K4, K5).
- `src/components/app/app-header.tsx`
  - Nerede render: `src/components/app/app-shell.tsx` (`xl` breakpoint).
  - Yükseklik/padding: `h-14`, container `gap-3`.
  - Safe-area: doğrudan yok.
- `src/components/app/bottom-nav.tsx`
  - Nerede render: aktif kullanım kanıtı yok.
  - Safe-area: yok (K8).

## UNKNOWN (varsa)
- UNKNOWN: `<meta name="viewport" ... viewport-fit=cover>` doğrudan bulunamadı.
  - Gerekli ek kanıt: App Router metadata/viewport çıkış HTML’i veya explicit `viewport-fit=cover` tanımı.
