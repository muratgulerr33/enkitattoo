# Discovery UI 99 — Summary

## KANIT
### K1 — UI omurgası dosya kanıtları
```bash
$ find src/app src/components/app src/components/ui src/lib -maxdepth 2 -type f | sort | sed -n '1,40p'
src/app/(app)/layout.tsx
src/app/(app)/page.tsx
src/app/globals.css
src/app/layout.tsx
src/components/app/app-shell.tsx
src/components/app/mobile-header.tsx
src/components/app/app-header.tsx
src/components/app/right-rail.tsx
src/components/ui/card.tsx
src/components/ui/button.tsx
src/lib/route-content.ts
```

### K2 — Shell + safe-area + nav
```tsx
// src/components/app/app-shell.tsx:19-24
<MobileHeader contentShellRef={contentShellRef} />
<AppHeader className="hidden xl:block" />
<main className="app-container app-mobile-header-offset app-safe-bottom ...">
```

```css
// src/app/globals.css:395-401
.app-mobile-header-offset { padding-top: calc(env(safe-area-inset-top) + var(--app-mobile-header-h)); }
.app-safe-bottom { padding-bottom: calc(env(safe-area-inset-bottom) + 1rem); }
```

### K3 — Kart sistem kanıtları
```tsx
// src/app/(app)/page.tsx:68-75
<div className="grid-cards">
  <Link className="group ... rounded-xl border ... shadow-soft ...">
    <div className="card-media ..." />

// src/app/(app)/piercing/page.tsx:88-90
<Link className="flex min-h-14 items-center gap-3 rounded-xl border ... p-4 shadow-soft ...">

// src/app/(app)/galeri-tasarim/page.tsx:58-63
<div className="grid-cards">
  <article className="... rounded-xl border ... shadow-soft">
```

### K4 — Image pipeline kanıtları
```bash
$ rg -n "next/image" -S src
# (çıktı yok)
```

```tsx
// src/app/social-image.tsx:1-6
import { ImageResponse } from "next/og";
export const runtime = "edge";
export const dynamic = "force-dynamic";
```

## BULGULAR
- Repo UI iskeletini belirleyen Top 10 dosya (kanıtlı):
1. `src/app/layout.tsx` — root metadata/theme provider/toaster.
2. `src/app/(app)/layout.tsx` — AppShell delegasyonu.
3. `src/components/app/app-shell.tsx` — ana layout kompozisyonu.
4. `src/components/app/mobile-header.tsx` — mobil topbar + tabbar + sheet/search.
5. `src/components/app/app-header.tsx` — desktop sticky header.
6. `src/app/globals.css` — tokenlar, typography, spacing, safe-area, grid/card utility.
7. `src/app/(app)/page.tsx` — home kart/grid pattern referansı.
8. `src/app/(app)/kesfet/page.tsx` — HubCard pattern ve keşfet grid.
9. `src/app/(app)/galeri-tasarim/page.tsx` — galeri grid kart yapısı.
10. `src/components/ui/card.tsx` — ortak Card primitive.

- Kart sistemi tip sayısı (ana hedef gruplar): 5
1. Home teaser kartları (`/`).
2. Keşfet kategori kartları (`/kesfet`).
3. Piercing kategori kartları (`/piercing`).
4. Galeri grid kartları (`/galeri-tasarim`).
5. Ortak primitive Card (`src/components/ui/card.tsx`).

- Safe-area durumu: VAR.
  - `env(safe-area-inset-top)` ve `env(safe-area-inset-bottom)` hem mobile header hem global utility’de kullanılıyor.

- Image pipeline durumu: `next/image` kanıtı YOK; `next/og` ile sosyal görsel üretimi VAR.

- En büyük risk alanları (yalnızca bulgu):
1. Route kart medyaları gerçek image yerine placeholder/div/skeleton ağırlıklı.
2. `BottomNav` dosyası mevcut fakat `return null` (ölü/boş bileşen riski).
3. `loading.tsx/error.tsx/not-found.tsx` route-level dosyaları görünmüyor.
4. `viewport-fit=cover` meta kanıtı bulunamadı.
5. Perf metrikleri (LCP/CLS/INP) için ölçüm çıktısı yok.

## UNKNOWN (varsa)
- UNKNOWN: Gerçek üretim HTML’de viewport meta’sının kesin çıktısı.
  - Gerekli ek kanıt: render edilmiş `<head>` çıktısı.
- UNKNOWN: Canlı sayfalarda gerçek görsel kaynakları (CDN/local) ve optimizasyonu.
  - Gerekli ek kanıt: image kullanan route/component.
- UNKNOWN: Web Vitals değerleri ve bundle parçalanma metrikleri.
  - Gerekli ek kanıt: Lighthouse + build analyze raporları.
