# Discovery UI 08 — Images + Icons + Motion

## KANIT
### K1 — `next/image` ve image props araması
```bash
$ rg -n "next/image" -S src
# (çıktı yok)

$ rg -n "<Image|sizes=|priority|blurDataURL|loading=\"lazy\"" -S src
src/app/(app)/iletisim/page.tsx:209:            loading="lazy"
```

### K2 — Next config image ayarları
```ts
// next.config.ts:1-11
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/book", destination: "/iletisim", permanent: true },
      { source: "/explore", destination: "/kesfet", permanent: true },
      { source: "/profile", destination: "/artistler", permanent: true },
```

```bash
$ rg -n "remotePatterns|images:" -S next.config.*
# (çıktı yok)
```

### K3 — OG/Twitter image pipeline
```tsx
// src/app/social-image.tsx:1-10
import { ImageResponse } from "next/og";
import { headers } from "next/headers";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };

// src/app/social-image.tsx:36-40
const iconArrayBuffer = await fetch(`${protocol}://${host}/icon.png`, {
  cache: "force-cache",
}).then((res) => res.arrayBuffer());
```

### K4 — Icon sistemi
```bash
$ rg -n "lucide-react|Icon" -S src/components src/app | head
src/components/mode-toggle.tsx:4:import { Check, Laptop, Moon, Sun } from "lucide-react";
src/components/icons/nandd.tsx:4:export type NanddIconProps = {
src/components/app/mobile-header.tsx:15:} from "lucide-react";
src/components/app/mobile-header.tsx:17:  IconGlobe,
```

```tsx
// src/components/icons/nandd.tsx:20-33
function IconBase({ size = 20, className, title, ... }: IconBaseProps) {
  const labelled = Boolean(title);
  return (
    <svg
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role={labelled ? "img" : undefined}
```

### K5 — Motion/animation
```bash
$ rg -n "transition-|duration-|ease-|animate-|prefers-reduced-motion" -S src
src/components/ui/dialog.tsx:64: ... data-[state=open]:animate-in ... duration-200 ...
src/components/ui/sheet.tsx:63: ... transition ease-in-out ... duration-300 ...
src/components/ui/skeleton.tsx:7: className={cn("bg-accent animate-pulse rounded-md", className)}
src/lib/ui/use-hide-header-on-scroll.ts:39: "(prefers-reduced-motion: reduce)"
```

### K6 — Lazy loading kanıtı
```tsx
// src/app/(app)/iletisim/page.tsx:204-210
<iframe
  src={mapsEmbedUrl}
  title="ENKİ Tattoo Studio harita"
  className="h-64 w-full border-0 md:h-80 xl:h-[400px]"
  allowFullScreen
  loading="lazy"
```

## BULGULAR
- `next/image` importu veya `<Image />` kullanımı için doğrudan kanıt yok (K1).
- `next.config.ts` içinde `images`/`remotePatterns` tanımı yok (K2).
- Görsel pipeline tarafında aktif kanıt: OG/Twitter görseli `next/og` + `ImageResponse` ile runtime’da üretiliyor; `icon.png` fetch ediliyor (K3).
- Route UI içinde gerçek lazy-loading kanıtı `iframe loading="lazy"` (iletisim harita embed) (K6).
- Icon sistemi hibrit: `lucide-react` + local `src/components/icons/nandd.tsx` custom SVG seti (K4).
- Motion kaynakları: shadcn/radix animasyon class’ları, skeleton pulse, header scroll hide, reduced motion media query (K5).

## UNKNOWN (varsa)
- UNKNOWN: Galeri/kart görselleri gerçek image asset mi yoksa tamamen placeholder mı; mevcut route kodunda placeholder ağırlıklı.
  - Gerekli ek kanıt: galeride gerçek image URL veya medya veri kaynağı kullanan component.
- UNKNOWN: LCP görseli için optimize edilmiş `priority/sizes` stratejisi; `next/image` kullanılmadığı için doğrulanamadı.
  - Gerekli ek kanıt: gerçek hero/gallery image component implementasyonu.
