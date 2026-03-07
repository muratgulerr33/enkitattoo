# PR-04 — sitemap + robots from CSV registry

Tarih: 2026-02-24

## Özet
Bu PR ile `src/lib/route-content.generated.ts` içindeki `ROUTE_CONTENT` tek kaynak alınarak:
- `src/app/sitemap.ts` eklendi.
- `src/app/robots.ts` eklendi.
- Base URL ortak kaynakta toplandı: `src/lib/site/base-url.ts` ve `src/app/layout.tsx` bunu kullanır.

## KANITLI Keşif

### 1) ROUTE_CONTENT path sayısı
Komut:
- `rg '^  "/' src/lib/route-content.generated.ts | wc -l`

Sonuç:
- `ROUTE_CONTENT_COUNT=25`

### 2) NOINDEX sayısı
Komut:
- `rg -i 'indexing: ".*noindex' src/lib/route-content.generated.ts | wc -l`

Sonuç:
- `NOINDEX_COUNT=0`

### 3) Base URL kaynağı
Kanıt:
- `src/app/layout.tsx`
  - `metadataBase: new URL(SITE_URL)`
- `src/lib/site/base-url.ts`
  - `export const SITE_URL = "https://enkitattoo.com.tr"`
- `src/app/sitemap.ts` ve `src/app/robots.ts` aynı `SITE_URL` sabitini import eder.

## Uygulama Detayı

### `src/app/sitemap.ts`
- Kaynak: `ROUTE_CONTENT`
- Filtre: `hasNoIndex(route.indexing)` true ise sitemap dışı.
- URL seçimi:
  - `route.canonical` varsa onu kullanır
  - yoksa `route.path`
- Absolute URL:
  - `new URL(pathOrUrl, SITE_URL)`
- Priority:
  - `/` => `1.0`
  - detay path (depth >= 2) => `0.6`
  - diğerleri => `0.7`
- `changeFrequency`:
  - `/` => `weekly`
  - diğerleri => `monthly`

### `src/app/robots.ts`
- `User-agent: *`
- `Allow: /`
- `Disallow`: yalnızca NOINDEX path listesi
  - Bu veri setinde NOINDEX olmadığı için boş liste
- `Sitemap: ${SITE_URL}/sitemap.xml`

## Verification

### Build
Komut:
- `npm run build`

Sonuç:
- Başarılı.
- Route listesinde:
  - `/sitemap.xml`
  - `/robots.txt`

### Local curl — `localhost:3000`
Durum: `UNKNOWN`

Kanıt:
- Port 3000 bu repo dışında çalışan bir süreç tarafından dinleniyor:
  - `lsof -nP -iTCP:3000 -sTCP:LISTEN`
  - `Cursor ... 127.0.0.1:3000 (LISTEN)`
- `curl http://127.0.0.1:3000/robots.txt` çıktısı bu projeye ait değil:
  - `Host: https://www.cinselhobi.com`
  - `Sitemap: https://www.cinselhobi.com/sitemap.xml`

Not:
- Bu nedenle `localhost:3000` için bu repo adına güvenilir doğrulama üretilemedi.

### Local curl — izole doğrulama (`127.0.0.1:3006`)
Komutlar:
- `curl http://127.0.0.1:3006/sitemap.xml`
- `curl http://127.0.0.1:3006/robots.txt`

Sonuçlar:
- `robots.txt`:
  - `User-Agent: *`
  - `Allow: /`
  - `Sitemap: https://enkitattoo.com.tr/sitemap.xml`
- `sitemap.xml`:
  - `<loc>https://enkitattoo.com.tr/</loc>` var
  - `<loc>https://enkitattoo.com.tr/galeri-tasarim</loc>` var
  - `<loc>https://enkitattoo.com.tr/artistler/halit-yalvac</loc>` var
  - `<loc>https://enkitattoo.com.tr/piercing/kulak</loc>` var
  - `<loc>https://enkitattoo.com.tr/galeri</loc>` yok
- Kontrol:
  - `HAS_GALERI_TASARIM=1`
  - `HAS_OLD_GALERI=0`

### NOINDEX doğrulaması
- `NOINDEX_COUNT=0`
- Bu nedenle sitemap/robots üzerinde NOINDEX kaynaklı çıkarılacak path yok.

## Git Kanıtı

### `git diff --name-only`
Çıktı:
- `.gitignore`
- `src/app/layout.tsx`

### `git status --short` (yeni dosyalar dahil)
Çıktı:
- `M .gitignore`
- `M src/app/layout.tsx`
- `?? src/app/sitemap.ts`
- `?? src/app/robots.ts`
- `?? src/lib/site/base-url.ts`

## Not
- `UNKNOWN` sadece `localhost:3000` curl doğrulaması için geçerlidir (port çakışması kanıtlı).
