# PR-01 — Kesfet slug rename + metadata + UI link update

## Ne değişti
- `/kesfet` hub slugları yeni Türkçe SEO sluglara geçirildi.
  - Kaynak: `src/lib/hub/hubs.v1.ts`
- `HubItem` tipine optional SEO alanları eklendi:
  - `seoTitleTR?: string`
  - `seoDescriptionTR?: string`
  - `canonicalPath?: string`
  - Kaynak: `src/lib/hub/hubs.v1.ts`
- 9 hub için `canonicalPath`, `seoTitleTR`, `seoDescriptionTR` CSV’den dolduruldu.
  - Kaynak: `docs/output/enki-v1-sitemap-seo-template.csv` + `src/lib/hub/hubs.v1.ts`
- `/kesfet/[hub]` route 2026 pattern ile güncellendi:
  - `dynamicParams = false`
  - `generateStaticParams`
  - minimal `generateMetadata` (`title`, `description`, `alternates.canonical`)
  - Kaynak: `src/app/(app)/kesfet/[hub]/page.tsx`

## Neden
- `/kesfet` detay URL'lerini SEO odaklı Türkçe sluglara taşımak.
- Hub detay sayfalarında slug bazlı metadata üretmek.
- Statik param üretimi ile route davranışını netleştirmek (`dynamicParams=false`).

## Mini Güvenlik Notu 1 — CSV header/kolon kanıtı
- Dosya: `docs/output/enki-v1-sitemap-seo-template.csv`
- Header kanıtı:
  - `path_yolu,baslik_h1,seo_title,seo_description,indexing,canonical,description,short_description,micro_line,notlar`
- Gerekli kolonlar:
  - `path_yolu`: FOUND
  - `seo_title`: FOUND
  - `seo_description`: FOUND
- `/kesfet/` ile başlayan satır sayısı: `9`
- Uygulanan mapping (verbatim):
  - `seoTitleTR = seo_title`
  - `seoDescriptionTR = seo_description`
  - `canonicalPath === path_yolu`
- UNKNOWN notu:
  - CSV kolon adı uyumsuzluğu: **yok** (UNKNOWN gerektirmedi).

## Mini Güvenlik Notu 2 — 9 slug sayısı / filtre kuralı
- Kaynak: `src/lib/hub/hubs.v1.ts`
- Sayım kanıtı:
  - `mainHubs=6`
  - `specialHubs=3`
  - `total=9`
- Sonuç:
  - Toplam 9 olduğu için `generateStaticParams` doğrudan `mainHubs + specialHubs` listesinden üretildi.
  - Ek filtre kuralı aktive edilmedi.

## Kanıt
### Route / Metadata kod kanıtı
- `src/app/(app)/kesfet/[hub]/page.tsx`
  - `dynamicParams` export var.
  - `generateStaticParams` export var.
  - `generateMetadata` export var.
  - Metadata alanları sadece `title`, `description`, `alternates.canonical`.

### Build kanıtı
- Komut: `npm run build`
- Sonuç: başarılı.
- Çıktıdan kritik satırlar:
  - `● /kesfet/[hub]`
  - `/kesfet/minimal-fine-line-dovme`
  - `/kesfet/yazi-isim-dovmesi`
  - `/kesfet/realistik-dovme`
  - `SSG ... uses generateStaticParams`

### Lint kanıtı
- Komut: `npm run lint`
- Sonuç: başarılı (error yok).
- Çıktı özeti: `11 warnings, 0 errors`.
- Warning dosyaları kapsam dışı:
  - `src/app/opengraph-image.tsx`
  - `src/app/social-image.tsx`
  - `src/app/twitter-image.tsx`

### Typecheck kanıtı
- Komut: `npm run typecheck`
- Sonuç: `Missing script: "typecheck"`
- Durum: `N/A`.

### Smoke test (curl)
- Test URL ve durum:
  - `/kesfet/minimal-fine-line-dovme` -> `200`
  - `/kesfet/yazi-isim-dovmesi` -> `200`
  - `/kesfet/kisiye-ozel-dovme-tasarimi` -> `200`
  - `/kesfet/minimal-fine-line` -> `404` (beklenen)

### Hardcoded eski `/kesfet` link kontrolü
- Komut:
  - `rg -n -P "/kesfet/minimal-fine-line(?!-)|/kesfet/lettering(?!-)|/kesfet/realism(?!-)|/kesfet/portrait(?!-)|/kesfet/traditional-old-school(?!-)|/kesfet/cover-up(?!-)|/kesfet/ataturk(?!-)|/kesfet/blackwork(?!-)|/kesfet/custom(?!-)" src -S`
- Sonuç: eşleşme yok.

### Git diff --name-only kanıtı
- Komut: `git diff --name-only`
- Çıktı:
  - `docs/enki-v1-sitemap-seo-template.csv` (unrelated pre-existing diff, dokunulmadı)
  - `src/app/(app)/kesfet/[hub]/page.tsx`
  - `src/lib/hub/hubs.v1.ts`
- Not:
  - `docs/locks/routes-lock.md` yeni dosya olduğu için `git status --short` altında `??` olarak görünür.
  - `docs/output/pr-01-kesfet-slug-rename.md` dosyası oluşturuldu, ancak `.gitignore` içindeki `docs/output/` kuralı nedeniyle `git diff --name-only` çıktısında yer almaz.

## Risk
- `HubItem` tipine optional alan eklendi; mevcut kullanım bozulmaması için optional bırakıldı.
- Slug değişikliği nedeniyle eski `/kesfet/<old-slug>` URL'leri 404 verir (PR-1 kabulünde izinli).
- Lint warnings mevcut fakat kapsam dışı dosyalarda.

## Değişen dosyalar
- `src/lib/hub/hubs.v1.ts`
- `src/app/(app)/kesfet/[hub]/page.tsx`
- `docs/locks/routes-lock.md` (yeni dosya)
- `docs/output/pr-01-kesfet-slug-rename.md` (yerel çıktı dosyası, `.gitignore: docs/output/` nedeniyle git diff'e girmez)
- `docs/enki-v1-sitemap-seo-template.csv` (unrelated pre-existing, bu PR'da değiştirilmedi)
