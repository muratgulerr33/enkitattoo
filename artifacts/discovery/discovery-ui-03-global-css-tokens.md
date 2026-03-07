# Discovery UI 03 — Global CSS + Tokens

## KANIT
### K1 — Token/tailwind v4 arama
```bash
$ rg -n "oklch\(|--color-|--radius|--shadow|:root|\[data-theme|prefers-color-scheme|color-scheme" -S .
src/app/globals.css:14:  --shadow-soft: ... oklch(...)
src/app/globals.css:15:  --shadow-popover: ... oklch(...)
src/app/globals.css:62::root {
src/app/globals.css:63:  color-scheme: light;
src/app/globals.css:70:  --background: oklch(1 0 0);
src/app/globals.css:119:.dark {
src/app/globals.css:120:  color-scheme: dark;
...

$ rg -n "@theme|@layer|@tailwind|@import" -S src
src/app/globals.css:1:@import "tailwindcss";
src/app/globals.css:2:@import "tw-animate-css";
src/app/globals.css:6:@theme inline {
src/app/globals.css:171:@layer base {
src/app/globals.css:201:@layer utilities {
```

### K2 — Global token map (`@theme inline`)
```css
/* src/app/globals.css:6-18 */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface-1: var(--surface-1);
  --color-surface-2: var(--surface-2);
  --color-overlay: var(--overlay);
  --color-overlay-strong: var(--overlay-strong);

  --shadow-soft: 0 1px 3px 0 oklch(0 0 0 / 0.06), 0 1px 2px -1px oklch(0 0 0 / 0.06);
  --shadow-popover: 0 4px 6px -1px oklch(0 0 0 / 0.08), 0 2px 4px -2px oklch(0 0 0 / 0.06);

  --font-sans: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
}
```

### K3 — Root/dark OKLCH + radius
```css
/* src/app/globals.css:62-75 */
:root {
  color-scheme: light;
  --radius: 0.625rem;
  --app-mobile-topbar-h: 56px;
  --app-mobile-tabbar-h: 56px;
  --app-mobile-header-h: calc(var(--app-mobile-topbar-h) + var(--app-mobile-tabbar-h));
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
}

/* src/app/globals.css:119-128 */
.dark {
  color-scheme: dark;
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.21 0.006 285.885);
  --card-foreground: oklch(0.985 0 0);
}
```

### K4 — Radius türevleri
```css
/* src/app/globals.css:55-59 */
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);
--radius-2xl: calc(var(--radius) + 8px);
```

### K5 — Base typography/container/safe utilities
```css
/* src/app/globals.css:182-184 */
body {
  @apply bg-background text-foreground antialiased font-sans;
}

/* src/app/globals.css:387-401 */
.app-container { @apply mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8; }
.app-section { @apply py-8 space-y-6 sm:space-y-8 md:py-10 lg:py-12; }
.app-mobile-header-offset { padding-top: calc(env(safe-area-inset-top) + var(--app-mobile-header-h)); }
.app-safe-bottom { padding-bottom: calc(env(safe-area-inset-bottom) + 1rem); }
```

### K6 — Theme provider/dark mode wiring
```tsx
// src/app/layout.tsx:73-79
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
  storageKey="enki-theme"
>

// src/components/theme-provider.tsx:4-10
import { ThemeProvider as NextThemesProvider } from "next-themes";
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

## BULGULAR
- Token sistemi `src/app/globals.css` içinde CSS-first (`@theme inline`) olarak kurulmuş (K1, K2).
- Renk palette’i OKLCH tabanlı; light/dark için `:root` ve `.dark` setleri ayrı (K3).
- Radius ve shadow tokenları merkezi olarak tanımlı (`--radius-*`, `--shadow-*`) (K2, K4).
- Base typography/body/font, container/section spacing ve safe-area utility’leri global CSS’de (K5).
- Dark mode `next-themes` + `class` attribute modeliyle çalışıyor; `storageKey="enki-theme"` (K6).

## UNKNOWN (varsa)
- UNKNOWN: `[data-theme=...]` tabanlı bir tema varyantı bulunamadı; yalnızca `.dark` class kanıtı var.
  - Gerekli ek kanıt: data-attribute tabanlı tema selector içeren CSS/JS.
- UNKNOWN: Tailwind config dosyası olmadığı için tokenların build-time genişletme stratejisi dosya tabanlı olarak doğrulanamıyor.
  - Gerekli ek kanıt: derleme çıktısı veya build config dokümantasyonu.
