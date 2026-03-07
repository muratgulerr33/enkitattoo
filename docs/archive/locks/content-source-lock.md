# Content Source Lock — PR-02

Tarih: 2026-02-23

## Tek Kaynak
- `docs/output/enki-v1-sitemap-seo-template.csv`

## Derived Artifact
- `src/lib/route-content.generated.ts`
- Üretim scripti: `scripts/generate-route-content.py`

## Alan Eşlemeleri
- `path_yolu` -> `ROUTE_CONTENT` key + `path`
- `baslik_h1` -> `h1`
- `seo_title` -> page metadata `title.absolute`
- `seo_description` -> page metadata `description`
- `description` -> sayfa içerik metni (orta açıklama)
- `short_description` -> sayfa kısa açıklama
- `micro_line` -> üst satır/micro metin
- `canonical` -> page metadata `alternates.canonical` (boşsa `path_yolu`)
- `indexing` -> ham string; `NOINDEX` içeriyorsa `robots.index=false, follow=true`

## Prefix Lock (PR-02 Scope)
- `/`
- `/kesfet`
- `/kesfet/<slug>`
- `/piercing`
- `/artistler`
- `/iletisim`
- `/galeri` -> `UNKNOWN` (CSV'de yok)
- CSV'de bulunan ilgili path: `/galeri-tasarim`

## Metadata Guard
- `use client` olan page dosyalarında `generateMetadata` eklenmez.
- `src/app/(app)/page.tsx` `use client` olduğu için: `UNKNOWN: client page, metadata skipped`.
