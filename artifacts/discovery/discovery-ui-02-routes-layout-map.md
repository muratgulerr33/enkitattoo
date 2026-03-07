# Discovery UI 02 — Routes + Layout Map

## KANIT
### K1 — Route dosyaları
```bash
$ find src/app -type f \( -name "layout.tsx" -o -name "page.tsx" -o -name "loading.tsx" -o -name "not-found.tsx" -o -name "error.tsx" \) | sort
src/app/(app)/artistler/[slug]/page.tsx
src/app/(app)/artistler/page.tsx
src/app/(app)/galeri-tasarim/page.tsx
src/app/(app)/iletisim/page.tsx
src/app/(app)/kesfet/[hub]/page.tsx
src/app/(app)/kesfet/page.tsx
src/app/(app)/layout.tsx
src/app/(app)/page.tsx
src/app/(app)/piercing/[hub]/page.tsx
src/app/(app)/piercing/page.tsx
src/app/layout.tsx
src/app/styleguide/page.tsx
```

### K2 — Root layout zinciri başlangıcı
```tsx
// src/app/layout.tsx:65-83
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={geist.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="enki-theme"
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### K3 — App group layout
```tsx
// src/app/(app)/layout.tsx:1-9
import { AppShell } from "@/components/app/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

### K4 — AppShell iskeleti
```tsx
// src/components/app/app-shell.tsx:18-35
return (
  <>
    <MobileHeader contentShellRef={contentShellRef} />
    <AppHeader className="hidden xl:block" />
    <div ref={contentShellRef} className="[transform:translate3d(0,0,0)]">
      <main className="app-container app-mobile-header-offset app-safe-bottom ... xl:grid ...">
        <div className="min-w-0 xl:max-w-[860px]">{children}</div>
        <div className="hidden xl:block"><RightRail /></div>
      </main>
      <AppFooter />
    </div>
    <ChatBubble />
  </>
);
```

### K5 — Home (`/`) route
```tsx
// src/app/(app)/page.tsx:17-28
export default function HomePage() {
  const content = getRouteContent("/");
  const homeHeading = content?.h1 || "Ana sayfa";

  return (
    <div className="app-section no-overflow-x">
      <h1 className="sr-only typo-page-title">{homeHeading}</h1>
      ...
```

### K6 — `/kesfet` route
```tsx
// src/app/(app)/kesfet/page.tsx:64-84
export default function KesfetPage() {
  const heading = kesfetContent?.h1 || "Keşfet";

  return (
    <div className="app-section no-overflow-x">
      <header>
        ...
        <h1 className="typo-page-title">{heading}</h1>
```

### K7 — `/piercing` route
```tsx
// src/app/(app)/piercing/page.tsx:45-58
export default function PiercingPage() {
  const shortDescription = ...

  return (
    <div className="app-section no-overflow-x">
      <header>
        ...
        <h1 className="typo-page-title">{piercingContent?.h1 || "Piercing"}</h1>
```

### K8 — `/galeri-tasarim` route
```tsx
// src/app/(app)/galeri-tasarim/page.tsx:27-43
export default async function GaleriPage({ searchParams }: PageProps) {
  const params = await searchParams;
  ...
  return (
    <div className="app-section no-overflow-x">
      <header>
        ...
        <h1 className="typo-page-title">{content?.h1 || "Galeri Tasarım"}</h1>
```

### K9 — Dinamik route örnekleri
```tsx
// src/app/(app)/kesfet/[hub]/page.tsx:19-23
export const dynamicParams = false;
export async function generateStaticParams() {
  return [...mainHubs, ...specialHubs].map((hub) => ({ hub: hub.slug }));
}

// src/app/(app)/piercing/[hub]/page.tsx:23-27
export const dynamicParams = false;
export function generateStaticParams() {
  return slugs.map((hub) => ({ hub }));
}
```

## BULGULAR
- Route yerleşimi `src/app` altında ve iki layout katmanı var:
  - `src/app/layout.tsx` (root) → `src/app/(app)/layout.tsx` (AppShell) → sayfa (K2, K3, K4).
- Hedef route’lar bulundu:
  - `/` → `src/app/(app)/page.tsx` (K5)
  - `/kesfet` → `src/app/(app)/kesfet/page.tsx` (K6)
  - `/piercing` → `src/app/(app)/piercing/page.tsx` (K7)
  - `/galeri-tasarim` → `src/app/(app)/galeri-tasarim/page.tsx` (K8)
- `(app)` altındaki tüm sayfalar AppShell içinde render ediliyor; shell içinde `MobileHeader`, desktop `AppHeader`, `main`, `RightRail`, `AppFooter`, `ChatBubble` var (K4).
- Dinamik route’lar static params ile kapatılmış (`dynamicParams = false`) (K9).

### URL ↔ Dosya ↔ Layout zinciri
1. `/` → `src/app/(app)/page.tsx` → `src/app/layout.tsx` → `src/app/(app)/layout.tsx`
2. `/kesfet` → `src/app/(app)/kesfet/page.tsx` → `src/app/layout.tsx` → `src/app/(app)/layout.tsx`
3. `/kesfet/[hub]` → `src/app/(app)/kesfet/[hub]/page.tsx` → `src/app/layout.tsx` → `src/app/(app)/layout.tsx`
4. `/piercing` → `src/app/(app)/piercing/page.tsx` → `src/app/layout.tsx` → `src/app/(app)/layout.tsx`
5. `/piercing/[hub]` → `src/app/(app)/piercing/[hub]/page.tsx` → `src/app/layout.tsx` → `src/app/(app)/layout.tsx`
6. `/galeri-tasarim` → `src/app/(app)/galeri-tasarim/page.tsx` → `src/app/layout.tsx` → `src/app/(app)/layout.tsx`
7. `/artistler` → `src/app/(app)/artistler/page.tsx` → `src/app/layout.tsx` → `src/app/(app)/layout.tsx`
8. `/artistler/[slug]` → `src/app/(app)/artistler/[slug]/page.tsx` → `src/app/layout.tsx` → `src/app/(app)/layout.tsx`
9. `/iletisim` → `src/app/(app)/iletisim/page.tsx` → `src/app/layout.tsx` → `src/app/(app)/layout.tsx`
10. `/styleguide` → `src/app/styleguide/page.tsx` → `src/app/layout.tsx`

## UNKNOWN (varsa)
- UNKNOWN: `loading.tsx`, `error.tsx`, `not-found.tsx` route-level dosyaları bu ağaçta görünmüyor.
  - Gerekli ek kanıt: ilgili dosyaların oluşturulmuş olması veya framework-level default davranışının ayrıca dokümante edilmesi.
