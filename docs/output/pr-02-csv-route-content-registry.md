# PR-02 — CSV Route Content Registry (Single Source)

## Ne Değişti
- `docs/output/enki-v1-sitemap-seo-template.csv` tek kaynak kabul edilerek route içerik registry üretimi eklendi.
- Yeni generator: `scripts/generate-route-content.py`
- Yeni generated artifact: `src/lib/route-content.generated.ts`
- Yeni helper: `src/lib/route-content.ts`
- Sayfa bağlamaları yapıldı:
  - `/`
  - `/kesfet`
  - `/kesfet/[hub]`
  - `/piercing`
  - `/artistler`
  - `/galeri`
  - `/iletisim`
- `/kesfet` sayfasında prefix kilidi uygulandı:
  - `knownKesfetPaths = new Set(listKnownPaths().filter((p) => p.startsWith("/kesfet/")))`
  - Kart href `/kesfet/${slug}` bu sette yoksa render edilmiyor.

## Neden
- Route bazlı H1 + içerik + SEO meta alanlarını tek kaynaktan yönetmek.
- Runtime CSV bağımlılığı olmadan build-time generated TS ile güvenli kullanım.
- Link/href üretiminde path kaynağını CSV ile kilitlemek.

## Mini Güvenlik Kuralları (Uygulandı)
1. `use client` guard:
   - `use client` page dosyalarında `generateMetadata` eklenmedi.
2. `/kesfet` prefix lock:
   - Filtre sadece `/kesfet/` ile başlayan known path listesi üzerinden çalışıyor.
3. Generator fail-fast:
   - Zorunlu kolonlar eksikse `exit 1`.
   - `/kesfet/` satır sayısı 9 değilse `exit 1`.

## STEP-0 Kanıtları

### A) CSV header
- Komut: `head -n 1 docs/output/enki-v1-sitemap-seo-template.csv`
- Çıktı:
  - `path_yolu,baslik_h1,seo_title,seo_description,indexing,canonical,description,short_description,micro_line,notlar`

### B) Path varlık kontrolü
- Komut çıktısı:
  - `/: YES`
  - `/kesfet: YES`
  - `/piercing: YES`
  - `/artistler: YES`
  - `/galeri: NO`
  - `/iletisim: YES`
  - `kesfet_slugs 9`

### C) Layout template kanıtı
- Dosya: `src/app/layout.tsx`
- Snippet:
  - `title: {`
  - `default: siteTitle,`
  - `template: "%s | Enki Tattoo",`

## `use client` Guard Kanıtı
- Kontrol edilen dosyalar:
  - `src/app/(app)/kesfet/page.tsx: USE_CLIENT=NO`
  - `src/app/(app)/piercing/page.tsx: USE_CLIENT=NO`
  - `src/app/(app)/artistler/page.tsx: USE_CLIENT=NO`
  - `src/app/(app)/iletisim/page.tsx: USE_CLIENT=NO`
  - `src/app/(app)/galeri/page.tsx: USE_CLIENT=NO`
- Ek not:
  - `src/app/(app)/page.tsx` `use client`.
  - `UNKNOWN: client page, metadata skipped`.

## Generator Kanıtı
- Komut: `python3 scripts/generate-route-content.py`
- Çıktı:
  - `[generate-route-content] Wrote src/lib/route-content.generated.ts (25 routes)`
- Dosya varlık kontrolü:
  - `generated_file_exists=YES`

## Build / Lint Kanıtı

### Lint
- Komut: `npm run lint`
- Sonuç: başarılı
- Özet: `11 warnings, 0 errors`
- Warning dosyaları kapsam dışı:
  - `src/app/opengraph-image.tsx`
  - `src/app/social-image.tsx`
  - `src/app/twitter-image.tsx`

### Build
- Komut: `npm run build`
- Sonuç: başarılı
- Route çıktısında kapsam route'lar mevcut:
  - `/`
  - `/kesfet`
  - `/kesfet/[hub]`
  - `/piercing`
  - `/artistler`
  - `/galeri`
  - `/iletisim`

## Curl Kabul Testi Kanıtı
- Komutlar `next start` ile `localhost` üzerinde çalıştırıldı.

### `/kesfet/minimal-fine-line-dovme`
- `KESFET_TITLE=Fine Line &amp; Minimal Dövme | Enki Tattoo`
- `KESFET_DESC=Minimal tattoo, fine line, linework ve micro tarzında kol-bacak örnekleri; ince çizgi, küçük dövme ve sade tasarımlar. Hemen ulaş.Anında tasarla.`
- `KESFET_CANONICAL=https://enkitattoo.com.tr/kesfet/minimal-fine-line-dovme`
- `KESFET_H1=Minimal &amp; Fine Line Dövme`

CSV karşılığı:
- `seo_title=Fine Line & Minimal Dövme | Enki Tattoo`
- `seo_description=Minimal tattoo, fine line, linework ve micro tarzında kol-bacak örnekleri; ince çizgi, küçük dövme ve sade tasarımlar. Hemen ulaş.Anında tasarla.`
- `canonical=/kesfet/minimal-fine-line-dovme`
- `baslik_h1=Minimal & Fine Line Dövme`

Not:
- Canonical HTML'de absolute URL (`metadataBase` nedeniyle), path kısmı CSV canonical ile aynı.

### `/`
- `HOME_H1=Mersin’de Dövme &amp; Piercing`
- CSV `baslik_h1=Mersin’de Dövme & Piercing` ile eşleşiyor.

### `/kesfet`
- `KESFET_LISTING_H1=Dövme Stilleri ve Tasarımları`
- CSV `baslik_h1=Dövme Stilleri ve Tasarımları` ile eşleşiyor.

## Prefix Lock Kanıtı (`/kesfet`)
- `/kesfet` HTML'den çekilen link listesi:
  - `/kesfet/ataturk-temali-dovme`
  - `/kesfet/blackwork-dovme`
  - `/kesfet/dovme-kapatma`
  - `/kesfet/kisiye-ozel-dovme-tasarimi`
  - `/kesfet/minimal-fine-line-dovme`
  - `/kesfet/portre-dovme`
  - `/kesfet/realistik-dovme`
  - `/kesfet/traditional-dovme`
  - `/kesfet/yazi-isim-dovmesi`

## Placeholder / Mock Tarama
- Komut: `rg -n "placeholder|mock" 'src/app/(app)' -S`
- Durum:
  - `artistler` ve `galeri` içinde placeholder/mock metinler hâlâ var.
  - Bu PR'da tamamını temizleme zorunlu değildi; raporlandı.

## Risk / Bilinen Durumlar
- `/galeri` route'u CSV'de yok:
  - `UNKNOWN` durum olarak işlendi.
  - Fallback içerik korundu.
  - CSV'de karşılık route `/galeri-tasarim`.
- `src/lib/hub/hubs.v1.ts` içindeki pre-existing SEO alanları bu PR'da kaynak olarak kullanılmadı; kaldırılmadı.
- Unrelated pre-existing değişiklik:
  - `docs/enki-v1-sitemap-seo-template.csv` (D) bu PR kapsamında değiştirilmedi.

## Değişen Dosyalar
- `.gitignore`
- `scripts/generate-route-content.py`
- `src/lib/route-content.generated.ts`
- `src/lib/route-content.ts`
- `src/app/(app)/kesfet/[hub]/page.tsx`
- `src/app/(app)/kesfet/page.tsx`
- `src/app/(app)/page.tsx`
- `src/app/(app)/piercing/page.tsx`
- `src/app/(app)/artistler/page.tsx`
- `src/app/(app)/galeri/page.tsx`
- `src/app/(app)/iletisim/page.tsx`
- `docs/locks/content-source-lock.md`
- `docs/output/pr-02-csv-route-content-registry.md`
