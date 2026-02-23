````md
# URL + SEO + İçerik SSOT + Sitemap/Robots LOCK — Enki Tattoo Web

Tarih: 2026-02-24  
Kapsam: PR-1 → PR-4 boyunca kilitlenen URL mimarisi, CSV tek kaynak (SSOT) içerik/SEO akışı ve sitemap/robots üretimi.  
Amaç: Repo içinde “tek doğru kaynak” olacak şekilde kalıcı sözleşme (contract) oluşturmak.

> Bu dokümanı repo içinde şu path ile saklayın:  
> `docs/locks/url-seo-sitemap-ssot-lock.md`

---

## 0) Tek Kaynaklar

### 0.1 SSOT (Single Source of Truth)
- **Manuel üretilen CSV** (tüm URL’ler + H1 + SEO title/description + micro/short/description + indexing/canonical):  
  `docs/output/enki-v1-sitemap-seo-template.csv`

### 0.2 Derived Artifact (build/runtime için)
CSV runtime’da parse edilmez; build/dev sırasında TS registry’ye dönüştürülür.

- Generator script:  
  `scripts/generate-route-content.py`
- Generated registry (commitli):  
  `src/lib/route-content.generated.ts`
- Runtime helper:  
  `src/lib/route-content.ts`

### 0.3 Base URL (canonical + sitemap + robots aynı kaynaktan)
- SITE_URL sabiti (tek kaynak):  
  `src/lib/site/base-url.ts`
- Layout metadataBase SITE_URL ile aynı:  
  `src/app/layout.tsx`

---

## 1) URL Sözleşmesi

### 1.1 Kullanıcıya görünen ana route’lar
- `/` (Ana sayfa)
- `/kesfet`
- `/piercing`
- `/artistler`
- `/iletisim`

> Sistem route’ları: `/_not-found`, `/manifest.webmanifest`, `/opengraph-image`, `/twitter-image` vb. (SEO içerik sayfası değildir)

### 1.2 Galeri (kilit)
- **Aktif canonical route:** `/galeri-tasarim`
- **Eski route:** `/galeri` kaldırıldı → 404 (site yayına çıkmadan temiz mimari)

### 1.3 Dinamik route aileleri (whitelist + SSG)
- Keşfet detail: `/kesfet/[hub]`
- Piercing detail: `/piercing/[hub]`
- Artist detail: `/artistler/[slug]` (şimdilik 1 slug)

---

## 2) Kilitli Slug Listeleri

### 2.1 Keşfet hub slug’ları (9)
- `minimal-fine-line-dovme`
- `yazi-isim-dovmesi`
- `realistik-dovme`
- `portre-dovme`
- `traditional-dovme`
- `dovme-kapatma`
- `ataturk-temali-dovme`
- `blackwork-dovme`
- `kisiye-ozel-dovme-tasarimi`

Davranış:
- `dynamicParams = false`
- `generateStaticParams` sadece bu 9 slug’ı üretir  
- Listede olmayan slug → 404 (`notFound()`)

### 2.2 Piercing hub slug’ları (9)
- `kulak`
- `burun`
- `kas`
- `dudak`
- `dil`
- `gobek`
- `septum`
- `industrial`
- `kisiye-ozel`

Slug kaynağı:
- CSV registry üzerinden: `listKnownPaths()` + `/piercing/` prefix filter  
- Duplicate guard: `Set` ile uniq

Davranış:
- `dynamicParams = false`
- `generateStaticParams` bu 9 slug’ı üretir  
- Listede olmayan slug → 404

### 2.3 Artist slug (şimdilik)
- `/artistler/halit-yalvac`

Davranış:
- `dynamicParams = false`
- `generateStaticParams` sadece `halit-yalvac` üretir  
- Diğer slug → 404

---

## 3) Keşfet Eski → Yeni Slug Eşlemesi (tarihsel referans)
(Eski internal slug’lardan yeni Türkçe SEO slug’a geçiş)

- `minimal-fine-line` → `minimal-fine-line-dovme`
- `lettering` → `yazi-isim-dovmesi`
- `realism` → `realistik-dovme`
- `portrait` → `portre-dovme`
- `traditional-old-school` → `traditional-dovme`
- `cover-up` → `dovme-kapatma`
- `ataturk` → `ataturk-temali-dovme`
- `blackwork` → `blackwork-dovme`
- `custom` → `kisiye-ozel-dovme-tasarimi`

---

## 4) CSV Alanlarının (SSOT) Kod Tarafındaki Eşlemeleri

CSV kolonları (örnek):  
`path_yolu, baslik_h1, seo_title, seo_description, indexing, canonical, description, short_description, micro_line, ...`

### 4.1 Meta (SEO)
- `seo_title` → `<title>` (Next metadata `title.absolute`)
- `seo_description` → `<meta name="description">`
- `canonical` (boşsa `path_yolu`) → `<link rel="canonical">`  
  - canonical çıktısı absolute URL olarak `SITE_URL + path` ile tamamlanır.

### 4.2 Sayfa içi içerik (UI metinleri)
- `baslik_h1` → H1 (sayfa başlığı)
- `micro_line` → üst micro metin
- `short_description` → kısa açıklama
- `description` → orta/uzun açıklama

### 4.3 Indexing (NOINDEX kuralı)
- `indexing` alanı `NOINDEX` içeriyorsa:
  - sayfa metadata: `robots: { index: false, follow: true }`
- Notlar:
  - Robots.txt içinde `noindex` kullanılmaz (Google desteklemez).
  - NOINDEX için doğru yöntem: sayfa bazında meta robots / HTTP header.

---

## 5) UI Link Üretim Kuralları (yanlış link çıkmasın)

### 5.1 /kesfet listing
- Keşfet kart linkleri sadece CSV’de bilinen `/kesfet/<slug>` path’leri için üretilir.
- Bilinmeyen slug için href üretilmez (prefix lock).

### 5.2 /piercing listing
- Piercing kart linkleri sadece CSV’de bilinen `/piercing/<slug>` path’leri için üretilir.
- Bilinmeyen link yok (prefix lock).

### 5.3 /artistler listing
- Halit Yalvaç kartı + “İncele” butonu kesin olarak:  
  `/artistler/halit-yalvac`

---

## 6) Title Çift Yazılma (Template Çakışması) LOCK

Durum:
- Layout’ta `metadata.title.template = "%s | Enki Tattoo"` kullanılıyor.

Kural:
- Sayfa bazında title her zaman **`title: { absolute: ... }`** olarak set edilir.
- Böylece `<title>` içinde “| Enki Tattoo” iki kez yazılmaz.

---

## 7) Sitemap + Robots (PR-4 LOCK)

### 7.1 Sitemap
- Dosya: `src/app/sitemap.ts`
- Kaynak: `ROUTE_CONTENT` (CSV generated registry)
- Kurallar:
  - `NOINDEX` olan route sitemap’e girmez
  - URL: `canonical || path` seçilir → `SITE_URL` ile absolute yapılır
- Priority:
  - `/` => `1.0`
  - depth >= 2 (detail) => `0.6`
  - diğerleri => `0.7`
- changefreq:
  - `/` weekly
  - diğerleri monthly

### 7.2 Robots
- Dosya: `src/app/robots.ts`
- Minimal Google-friendly pattern:
  - `User-agent: *`
  - `Allow: /`
  - `Sitemap: https://enkitattoo.com.tr/sitemap.xml`
- NOINDEX şu an 0 ise Disallow satırları boş kalabilir (normal).

---

## 8) Redirect Temizliği LOCK
- `next.config.ts` içindeki legacy gallery redirect'i **kaldırıldı** (site yayında değil, temiz başlangıç).

---

## 9) Doğrulama Komutları (Hızlı Checklist)

### 9.1 CSV → TS registry üretimi (drift kontrol)
```bash
python3 scripts/generate-route-content.py
git diff --name-only src/lib/route-content.generated.ts
````

> Diff boşsa: drift yok.

### 9.2 Build / Lint

```bash
npm run lint
npm run build
```

### 9.3 Meta + H1 doğrulama (örnek sayfa)

```bash
URL="http://127.0.0.1:3006/kesfet/minimal-fine-line-dovme"
echo "TITLE:"; curl -s "$URL" | rg -o "<title>[^<]*</title>"
echo "DESC:";  curl -s "$URL" | rg -o '<meta[^>]*name="description"[^>]*content="[^"]*"'
echo "CAN:";   curl -s "$URL" | rg -o '<link[^>]*rel="canonical"[^>]*href="[^"]*"'
echo "H1:";    curl -s "$URL" | rg -o "<h1[^>]*>[^<]*</h1>" | head -n 3
```

### 9.4 Robots / Sitemap doğrulama

```bash
curl -s http://127.0.0.1:3006/robots.txt
curl -s http://127.0.0.1:3006/sitemap.xml | head -n 40
```

---

## 10) LOCK Özet

* Tek kaynak: `docs/output/enki-v1-sitemap-seo-template.csv`
* URL mimarisi kilit:

  * Keşfet: `/kesfet/<9 slug>`
  * Piercing: `/piercing/<9 slug>`
  * Artist: `/artistler/halit-yalvac`
  * Galeri: `/galeri-tasarim` ( /galeri yok )
* Meta kilit: title.absolute + description + canonical CSV’den
* Sitemap/robots: CSV registry’den otomatik

```
::contentReference[oaicite:0]{index=0}
```
