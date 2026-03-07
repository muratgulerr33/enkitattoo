# Discovery Report — `/kesfet/[hub]` slug + SEO kaynak analizi

## 1) Kanıtlı Route Özeti

- Dinamik route kaynağı: `src/app/(app)/kesfet/[hub]/page.tsx`
  - Kanıt: `src/app/(app)/kesfet/[hub]/page.tsx:12` → `export default async function HubDetailPage...`
  - Param okuma: `src/app/(app)/kesfet/[hub]/page.tsx:13` → `const { hub: slug } = await params;`

- `generateStaticParams` durumu:
  - Route dosyasında **yok**.
  - Global arama sonucu: `rg -n "generateStaticParams" .` → **eşleşme yok**.

- `dynamicParams` / `dynamic` / `revalidate` durumu:
  - Route segmentinde (`/kesfet/[hub]`) bu exportlar **yok**.
  - Global arama sonucu: `rg -n "export const (dynamic|dynamicParams|revalidate)" src/app` → yalnızca `src/app/social-image.tsx:5` (`dynamic = "force-dynamic"`).

- `notFound()` / `redirect()` ve slug doğrulaması:
  - `src/app/(app)/kesfet/[hub]/page.tsx:14` → `if (!isValidHubSlug(slug)) notFound();`
  - `src/app/(app)/kesfet/[hub]/page.tsx:16` → `if (!hub) notFound();`
  - `redirect()` kullanımı bu dosyada yok.

- URL davranışı (kanıtlı yorum):
  - Whitelist var: `src/lib/hub/hubs.v1.ts:128-131` (`allHubSlugs` seti), `:137-138` (`isValidHubSlug`).
  - Geçersiz slug 404: `notFound()` çağrıları (`[hub]/page.tsx:14,16`).

## 2) Slug Kaynağı

- Slug tanımları tek kaynakta:
  - `src/lib/hub/hubs.v1.ts` içindeki `mainHubs` ve `specialHubs` dizileri.
  - Kanıt satırları: `:20, :29, :38, :47, :56, :65, :77, :86, :95`.

- Route bu kaynağı nasıl kullanıyor:
  - `src/app/(app)/kesfet/[hub]/page.tsx:3` → `getHubBySlug, isValidHubSlug` import.
  - `src/lib/hub/hubs.v1.ts:133-135` → slug ile hub bulma.
  - `src/lib/hub/hubs.v1.ts:137-138` → slug whitelist doğrulama.

- Bulunan slug listesi:
  - `minimal-fine-line`
  - `lettering`
  - `realism`
  - `portrait`
  - `traditional-old-school`
  - `cover-up`
  - `ataturk`
  - `blackwork`
  - `custom`

## 3) SEO Datası (title/description)

- `/kesfet/[hub]` için sayfa-seviyesi metadata exportu yok:
  - `src/app/(app)/kesfet/[hub]/page.tsx` içinde `export const metadata` yok.
  - `generateMetadata` yok (global arama: `rg -n "generateMetadata|metadata" src/app src/lib` sonucu yalnızca `src/app/layout.tsx`).

- Global metadata kaynağı:
  - `src/app/layout.tsx:15-21`
  - `title.default`: `Mersin Dövme & Piercing | Enki Tattoo`
  - `description`: `Mersin Dövme & Piercing | Enki Tattoo`

- Hub verisindeki metinler (sayfa içeriği olarak kullanılıyor):
  - `src/app/(app)/kesfet/[hub]/page.tsx:23` → `hub.titleTR` (H1)
  - `src/app/(app)/kesfet/[hub]/page.tsx:24` → `hub.descriptionTR` (paragraf)
  - Bu metinlerin metadata’ya bağlandığına dair doğrudan kanıt: **UNKNOWN**.

## 4) Sitemap Durumu

- App Router sitemap route dosyası bulunamadı:
  - `find src/app -maxdepth 5 -type f` çıktısında `sitemap.ts` yok.
  - `rg --files | rg 'sitemap|robots|manifest|route\\.ts$'` sonucu: `src/app/manifest.ts` + docs dosyaları.

- Kod içinde `sitemap` referansları çoğunlukla dokümantasyon/script:
  - `docs/enki-v1-sitemap-seo-template.md`
  - `docs/output/run-sitemap.zsh`
  - Runtime’da `/kesfet/[hub]` sluglarını sitemap’e ekleyen aktif `src/app/sitemap.ts` kanıtı: **yok**.

## 5) Çıktı JSON

- Dosya: `docs/output/discovery-kesfet-hub-slugs.json`
- 9 slug, kaynak `src/lib/hub/hubs.v1.ts`, SEO alanları `null` (page-level metadata kanıtı olmadığı için).

## 6) Eksik Bilgiler (UNKNOWN)

- `/kesfet/[hub]` için slug-bazlı `<title>` / `<meta name="description">` üretimi.
- Dinamik hub URL’lerinin sitemap’e hangi mekanizma ile dahil edildiği (repo içi aktif route/script kanıtı yok).
- Projede build/deploy aşamasında repo dışı bir sitemap üretim adımı olup olmadığı.

## Arama Kanıtları (İstenen taramalar)

- `[hub]` geçen yerler:
  - Kod path: `src/app/(app)/kesfet/[hub]/page.tsx`
  - Metin olarak: `README.md:35`, `docs/04-repo-hygiene.md:17`

- `generateStaticParams` geçen yerler:
  - Eşleşme yok (`rg -n "generateStaticParams" .`).

- `generateMetadata|metadata` geçen yerler:
  - `src/app/layout.tsx:15-16` (global metadata)

- `kesfet|hub|slug|params.hub|params` geçen kritik yerler:
  - `src/app/(app)/kesfet/[hub]/page.tsx:13-16`
  - `src/lib/hub/hubs.v1.ts:16-139`
  - `src/app/(app)/kesfet/page.tsx:2,48-69`

- `sitemap` geçen yerler:
  - `docs/enki-v1-sitemap-seo-template.md`
  - `docs/output/*` altındaki discovery/script dosyaları

## LOCK (şu an kesin bildiklerimiz)

- `/kesfet/[hub]` route’u `src/app/(app)/kesfet/[hub]/page.tsx` dosyasından geliyor.
- Slug whitelist’i `src/lib/hub/hubs.v1.ts` içindeki `mainHubs + specialHubs` sluglarından üretiliyor.
- Geçersiz slug `notFound()` ile 404’e düşüyor.
- Route seviyesinde `generateStaticParams` ve `generateMetadata` yok.
- Repo içinde aktif `src/app/sitemap.ts` yok.

## NEXT (bir sonraki teknik adım)

- `/kesfet/[hub]` için `generateMetadata` eklenip `hub.titleTR` + `hub.descriptionTR` ile slug-bazlı SEO metadata üretimi tasarlanmalı.
- Gerekirse `src/app/sitemap.ts` eklenip `mainHubs/specialHubs` sluglarıyla dinamik URL’ler sitemap’e yazılmalı.
