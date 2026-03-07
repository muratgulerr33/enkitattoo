# Discovery UI 04 — Typography + Spacing

## KANIT
### K1 — Geist font kullanımı
```bash
$ rg -n "Geist|next/font|--font-geist|font-geist" -S src
src/app/layout.tsx:2:import { Geist } from "next/font/google";
src/app/layout.tsx:12:const geist = Geist({
src/app/layout.tsx:14:  variable: "--font-geist",
src/app/globals.css:17:  --font-sans: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
src/app/globals.css:18:  --font-display: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
```

### K2 — Tipografi ölçeği (global utility)
```css
/* src/app/globals.css:207-217 */
.typo-page-title, .typo-h1, .t-display, .t-h1 {
  font-size: 2.25rem;
  line-height: 2.5rem;
  letter-spacing: -0.025em;
  font-weight: 800;
}

/* src/app/globals.css:219-227 */
.typo-h2, .t-h2 {
  font-size: 1.875rem;
  line-height: 2.15rem;
  letter-spacing: -0.04em;
  font-weight: 700;
}
```

### K3 — Body/small/caption ölçeği
```css
/* src/app/globals.css:255-266 */
.typo-p, .t-body {
  font-size: 1rem;
  line-height: 1.75rem;
}
.typo-muted, .t-muted {
  font-size: 1rem;
  line-height: 1.75rem;
}

/* src/app/globals.css:269-286 */
.typo-small, .t-small { font-size: 0.875rem; line-height: 1.45; }
.typo-caption, .t-caption { font-size: 0.75rem; line-height: 1.4; }
```

### K4 — Responsive tipografi
```css
/* src/app/globals.css:362-383 */
@media (min-width: 64rem) {
  .typo-page-title, .typo-h1, .t-display, .t-h1 {
    font-size: 3rem;
    line-height: 3.3rem;
    letter-spacing: -0.05em;
  }
  .typo-h2, .t-h2 { font-size: 2.25rem; line-height: 2.5875rem; }
  .typo-lead, .t-lead { font-size: 1.25rem; line-height: 1.75; }
}
```

### K5 — Arbitrary/line-clamp/truncate örnekleri
```bash
$ rg -n "text-\[|leading-\[|tracking-\[|line-clamp|truncate" -S src/app src/components
src/components/app/mobile-header.tsx:211: className="... text-[0.95rem] ... leading-none tracking-tight ..."
src/components/app/mobile-header.tsx:336: className="... text-[11px] leading-[1.1]"
src/app/(app)/page.tsx:80: <p className="t-caption line-clamp-1 text-muted-foreground">
src/app/(app)/galeri-tasarim/page.tsx:66: <h2 className="t-small truncate font-medium text-foreground">
src/app/(app)/galeri-tasarim/page.tsx:69: <p className="t-caption line-clamp-1 text-muted-foreground">
```

### K6 — Spacing/container/grid ölçeği
```css
/* src/app/globals.css:387-409 */
.app-container { @apply mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8; }
.app-section { @apply py-8 space-y-6 sm:space-y-8 md:py-10 lg:py-12; }
.grid-cards { @apply grid ... grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4 xl:gap-6; }
.grid-cards-compact { @apply grid ... grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4 xl:gap-5; }
```

### K7 — Kart içi padding/gap örnekleri
```tsx
// src/app/(app)/page.tsx:73-80
<Link className="group ... rounded-xl border ... shadow-soft ...">
  <div className="card-media ..." />
  <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
    <span className="t-small truncate font-medium text-foreground">...
    <p className="t-caption line-clamp-1 text-muted-foreground">...

// src/app/(app)/piercing/page.tsx:88-90
<Link className="flex min-h-14 items-center gap-3 rounded-xl border ... p-4 shadow-soft ...">
```

## BULGULAR
- Typography ana iskeleti global utility sınıflarıyla (`typo-*`/`t-*`) tanımlı (K2, K3).
- Ölçek özet:
  - H1: `2.25rem/2.5rem` (desktop `3rem/3.3rem`)
  - H2: `1.875rem/2.15rem` (desktop `2.25rem/2.5875rem`)
  - Body: `1rem/1.75rem`
  - Caption: `0.75rem/1.4`
  (K2, K3, K4)
- Geist font `next/font/google` ile yüklenip CSS variable üzerinden global font tokenlarına bağlanmış (K1).
- Spacing sistemi utility-first: section `py-8..lg:py-12`, container `px-4/sm:px-6/lg:px-8`, grid gap `2..6` ölçeğinde (K6).
- Kart içi spacing çoğunlukla `p-3 sm:p-4`, `gap-1`, `gap-3`, `p-4` patterniyle ilerliyor (K7).

## UNKNOWN (varsa)
- UNKNOWN: H1/H2/body/caption dışındaki typographic semantic eşleme (örn. editorial prose) için ayrı bir sistem dosyası bulunamadı.
  - Gerekli ek kanıt: tipografi rehberini üreten veya enforce eden ayrı tasarım-token kaynağı.
