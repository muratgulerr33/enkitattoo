# PR-03 — galeri-tasarim + artist detail + piercing hub routes

Tarih: 2026-02-24

## Özet
Bu PR ile:
- `/galeri` route'u `/galeri-tasarim` olarak taşındı.
- `/artistler/[slug]` route'u eklendi (şimdilik sadece `halit-yalvac`).
- `/piercing/[hub]` dynamic route'u eklendi.
- İlgili sayfalarda CSV tek kaynak (`src/lib/route-content.generated.ts` + `src/lib/route-content.ts`) üzerinden H1/SEO/canonical/content/robots bağlandı.
- Legacy gallery redirect'i kaldırıldı.

## Ön Kontrol Kanıtları

### CSV path varlık kontrolü
Komutlar:
- `rg '^/galeri-tasarim,' docs/output/enki-v1-sitemap-seo-template.csv`
- `rg '^/artistler/halit-yalvac,' docs/output/enki-v1-sitemap-seo-template.csv`
- `rg '^/piercing/' docs/output/enki-v1-sitemap-seo-template.csv`

Sonuç:
- `/galeri-tasarim`: FOUND
- `/artistler/halit-yalvac`: FOUND
- `/piercing/{kulak,burun,kas,dudak,dil,gobek,septum,industrial,kisiye-ozel}`: FOUND

### Generator/registry varlık kontrolü
Komut:
- `ls -la scripts/generate-route-content.py src/lib/route-content.generated.ts src/lib/route-content.ts`

Sonuç:
- `scripts/generate-route-content.py`: FOUND
- `src/lib/route-content.generated.ts`: FOUND
- `src/lib/route-content.ts`: FOUND

## Uygulanan Değişiklikler

### Route rename ve link güncellemeleri
- `src/app/(app)/galeri` -> `src/app/(app)/galeri-tasarim` (git mv)
- `src/app/(app)/galeri-tasarim/page.tsx`
  - path kaynağı `/galeri-tasarim`
  - `generateMetadata()` eklendi (title/description/canonical/robots)
  - `getRouteContent` path'i CSV route ile eşitlendi
- `src/app/(app)/galeri-tasarim/filters.tsx`
  - filter push path'leri `/galeri-tasarim` route'una taşındı
- `/galeri` hardcoded link güncellemeleri:
  - `src/app/(app)/page.tsx`
  - `src/components/app/mobile-header.tsx`
  - `src/app/(app)/kesfet/[hub]/page.tsx`

### Redirect güncellemesi
- `next.config.ts`
  - legacy gallery redirect satırı kaldırıldı.

### Artist detail route + Halit link zorunluluğu
- Yeni dosya: `src/app/(app)/artistler/[slug]/page.tsx`
  - `dynamicParams = false`
  - `generateStaticParams() => [{ slug: "halit-yalvac" }]`
  - `generateMetadata` fallbackları:
    - title: `Artistler | Enki Tattoo`
    - description: `Enki Tattoo artist profili.`
    - canonical: `/artistler/${slug}`
  - content yoksa `notFound()`
- `src/app/(app)/artistler/page.tsx`
  - `ARTISTS` item'larına `slug` eklendi
  - Halit kartı + `İncele` butonu `href={\`/artistler/${artist.slug}\`}` ile bağlandı
  - Halit için URL: `/artistler/halit-yalvac`

### Piercing dynamic route + uniq slug guard
- Yeni dosya: `src/app/(app)/piercing/[hub]/page.tsx`
  - slug üretimi CSV registry üzerinden:
    - `knownPiercingPaths = listKnownPaths().filter(...)`
    - `slugs = Array.from(new Set(...filter(Boolean)))`
  - `generateStaticParams()` uniq slug setini kullanıyor
  - `content` yoksa `notFound()`
  - metadata: absolute title + description + canonical + robots noindex guard

### Piercing listing CSV-lock
- `src/app/(app)/piercing/page.tsx`
  - kartlar `knownPiercingPaths` üzerinden üretiliyor
  - yalnızca known path'ler render ediliyor
  - kart linkleri detail route'a gidiyor
  - kart label: `getRouteContent(path)?.h1` (fallback slug-format)

### Docs + ignore
- `docs/locks/routes-lock.md`
  - tarih `2026-02-24`
  - `/galeri-tasarim`, `/artistler/<slug>`, `/piercing/<slug>` kilitleri eklendi
- `.gitignore`
  - `!docs/output/pr-03-routes-galeri-artist-piercing.md` eklendi

## Guard ve Doğrulama Kanıtları

### Import/path guard (galeri taşıma sonrası)
Komut:
- `rg -n 'from "\./galeri|/galeri"' src/app/(app)/galeri-tasarim -S`

Sonuç:
- Eşleşme yok (clean).

### Generator
Komut:
- `python3 scripts/generate-route-content.py`

Sonuç:
- `[generate-route-content] Wrote src/lib/route-content.generated.ts (25 routes)`

### Lint
Komut:
- `npm run lint`

Sonuç:
- `0 errors, 11 warnings`
- Warning dosyaları (kapsam dışı):
  - `src/app/opengraph-image.tsx`
  - `src/app/social-image.tsx`
  - `src/app/twitter-image.tsx`

### Build
Komut:
- `npm run build`

Sonuç:
- Başarılı.
- Route çıktısında:
  - `/galeri-tasarim`
  - `/artistler/[slug]` -> `/artistler/halit-yalvac`
  - `/piercing/[hub]` -> `/piercing/kulak`, `/piercing/burun`, `/piercing/kas`, ...

### Runtime (dev + curl)
Kontroller:
- `/galeri-tasarim`
  - Title: `Dövme Tasarım Galerisi: Tüm Stiller | Enki Tattoo`
  - Description: CSV ile uyumlu
  - Canonical: `https://enkitattoo.com.tr/galeri-tasarim`
  - H1: `Dövme Tasarım Galerisi`
- `/artistler/halit-yalvac`
  - Title: `Halit Yalvaç | Master Artist, Eğitmen & Kurucu | Enki Tattoo`
  - Description: CSV ile uyumlu
  - Canonical: `https://enkitattoo.com.tr/artistler/halit-yalvac`
  - H1: `Master Artist Halit Yalvaç | Dövme Sanatçısı & Eğitmen`
- `/piercing/kulak`
  - Title: `Mersin Kulak Piercing | Enki Tattoo`
  - Description: CSV ile uyumlu
  - Canonical: `https://enkitattoo.com.tr/piercing/kulak`
  - H1: `Mersin Kulak Piercing`
- `/galeri`
  - HTTP status: `404` (beklenen)

## Not
- `UNKNOWN` gerektiren bloklayıcı durum tespit edilmedi.
