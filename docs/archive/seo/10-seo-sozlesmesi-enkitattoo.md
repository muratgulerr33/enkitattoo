# 10 — SEO Sözleşmesi / Teslim Dokümanı (V1) — ENKI TATTOO
**Proje:** enkitattoo.com.tr (Next.js)  
**Sürüm:** V1 (Local SEO + Teknik SEO temel kurulumu)  
**Tarih:** 25 Şubat 2026  
**Hazırlayan:** (Ajans / Uygulayıcı)  
**Müşteri:** Murat Güler — Enki Tattoo Studio Mersin

> Bu doküman iki amaç taşır:  
> 1) “SEO sözleşmesi” gibi çalışır (kapsam, teslimatlar, sorumluluklar, kabul kriterleri).  
> 2) Bu projede **gerçekten yapılan tüm SEO işlemlerinin** tek sayfalık “teslim raporu”dur.

---

## 0) Kapsam Özeti (V1)
V1’de hedef; “temel teknik SEO altyapısı + local (NAP/Schema) + ölçümleme (GA4)” kurulumunu doğru yapmak ve Google’ın tarayıp indeksleyebilmesi için gerekli sinyalleri vermektir.

### V1 dahildir
- Robots + sitemap yayınlama ve doğrulama
- Canonical host stratejisi (www → non-www yönlendirme)
- Local SEO (NAP tutarlılığı) için SSOT yaklaşımı
- Structured data (JSON-LD):
  - LocalBusiness/TattooParlor + WebSite
  - BreadcrumbList (UI göstermeden)
- İletişim & Konum sayfası (kullanıcı + Google niyeti)
- GA4 entegrasyonu (SPA route değişimlerinde page_view)

### V1 hariçtir
- Google Ads / Meta Ads kurulumu, kampanya yönetimi
- İçerik üretimi (blog, uzun metin, görsel üretimi) ve link building
- GBP (Google Business Profile) optimizasyonu / yorum stratejisi
- Çok dilli SEO, hreflang, multi-region yapı
- Core Web Vitals optimizasyonu (ileri seviye perf sprint)

---

## 1) Teknik Varsayımlar ve “Kaynak Gerçeği”
- **Canonical host:** `https://enkitattoo.com.tr`  
- `https://www.enkitattoo.com.tr/*` istekleri **308** ile canonical host’a yönlenir.
- Robots ve sitemap uygulama seviyesinde yayınlanır (Next.js route):
  - `/robots.txt`
  - `/sitemap.xml`

> Not: Search Console’da `URL prefix` ile `Domain property` farklı “mülk”lerdir.  
> “robots.txt yok” gibi görünen durumlar genelde **yanlış mülk/host** seçili olduğu için oluşur.

---

## 2) Teslim Edilen İşler (Ne yaptık?)

### 2.1 robots.txt (tarama kontrolü)
**Hedef:** Site taramaya açık olsun, sitemap referansı verilsin.

- robots içeriği:
  - `User-agent: *`
  - `Allow: /`
  - `Sitemap: https://enkitattoo.com.tr/sitemap.xml`

**Doğrulama:**
- `curl -I https://enkitattoo.com.tr/robots.txt` → `HTTP/2 200`
- `curl -I https://www.enkitattoo.com.tr/robots.txt` → `HTTP/2 308` → canonical’a yönlendirir

---

### 2.2 sitemap.xml (index keşfi)
**Hedef:** Google’a taraması gereken ana URL setini açıkça vermek.

- sitemap içinde **25** URL var.
- `/kesfet/*` : 9 route
- `/piercing/*` : 9 route

**Doğrulama (prod):**
- `curl -s https://enkitattoo.com.tr/sitemap.xml | head`

---

### 2.3 Local SEO — NAP (tek kaynak / tutarlılık)
**Hedef:** Adres, telefon, çalışma saatleri, harita linkleri site genelinde aynı kalsın.

- SSOT: `src/lib/site-info.ts`
  - `name`, `addressText`, `phoneE164`, çalışma saatleri, `googleMapsUrl`, embed src, `geo`

- Sosyal/iletişim linkleri: `src/lib/site/links.ts`
  - WhatsApp, Instagram, Telegram, YouTube, Google Maps

**Sonuç:** Footer + /iletisim + JSON-LD aynı kaynaktan beslenir → NAP tutarlılığı.

---

### 2.4 Structured Data (JSON-LD)
**Hedef:** Google’ın işletmeyi ve sayfa hiyerarşisini doğru anlaması.

#### A) LocalBusiness / TattooParlor + WebSite (Graph)
- Bileşen: `src/components/seo/local-business-jsonld.tsx`
- `@graph` içinde 2 node:
  - `TattooParlor` (işletme)
  - `WebSite` (publisher referansı işletmeye)

İçerdiği ana alanlar:
- `name`, `alternateName`, `url`, `telephone`
- `address` (PostalAddress)
- `geo` (GeoCoordinates)
- `openingHoursSpecification`
- `sameAs`, `hasMap`

Mount:
- `src/app/(app)/iletisim/page.tsx` içinde render (page-level)

#### B) BreadcrumbList (UI yok, sadece script)
- Bileşen: `src/components/seo/breadcrumb-list-jsonld.tsx`
- Mount edilen sayfalar:
  - `/` (crumb < 2 ise script basmaz)
  - `/kesfet`, `/kesfet/[hub]`
  - `/piercing`, `/piercing/[hub]`
  - `/artistler`, `/artistler/[slug]`
  - `/galeri-tasarim`
  - `/iletisim`

Label mantığı (özet):
- Önce route content’ten `h1` / `seoTitle`
- Yoksa slug’dan humanize

---

### 2.5 GA4 (Analytics) entegrasyonu
**Hedef:** Temel ölçümleme + SPA route değişimlerinde page_view.

- Bileşen: `src/components/analytics/ga4.tsx`
- Global mount: `src/app/layout.tsx`
- Env: `.env.local` → `NEXT_PUBLIC_GA_ID=G-ZWL345NDWV`

Yükleme stratejisi:
- `next/script` ile `strategy="lazyOnload"` (LCP’i korumak için)
- `send_page_view: false`
- `usePathname + useSearchParams` ile route değişiminde `gtag('config', { page_path })`

> Not: “Google etiketi algılanmadı” uyarısı; çoğu zaman **adblock**, **cache**, **script’in lazyOnload olması**, ya da test aracının sayfayı çok erken kontrol etmesi** nedeniyle görülebilir. Tag Assistant / DebugView ile doğrulama yapılır.

---

### 2.6 Bilgi Bankası route sözleşmesi (/sss)
**Hedef:** SSS içeriğinin tek kaynak route üzerinden indekslenmesi.

- `/sss` = **Bilgi Bankası tek kaynak** sayfasıdır (sitemap’te tek canonical URL olarak yer alır).
- Home + `/kesfet` + `/piercing` + `/iletisim` iç link/teaser akışı `/sss` veya `/sss?cat=...` hedefler.
- `?cat` query paramı sadece UI filtresidir; sitemap/canonical URL setine dahil edilmez.

---

## 3) Değişen Dosyalar (V1)
Aşağıdaki dosyalar bu SEO V1 teslimatının parçasıdır:

- `src/app/robots.ts` (robots route)
- `src/components/seo/local-business-jsonld.tsx` (yeni)
- `src/components/seo/breadcrumb-list-jsonld.tsx` (yeni)
- `src/app/(app)/iletisim/page.tsx` (LocalBusiness + NAP UI)
- `src/components/analytics/ga4.tsx` (yeni)
- `src/app/layout.tsx` (GA4 mount)
- `.env.local` (local, gitignored)

---

## 4) Kabul Kriterleri (Definition of Done)
Teslim “tamam” sayılması için aşağıdakiler **PASS** olmalıdır:

### 4.1 Teknik
- [ ] `https://enkitattoo.com.tr/robots.txt` → 200 ve sitemap satırı var
- [ ] `https://enkitattoo.com.tr/sitemap.xml` → 200 ve URL’ler listeleniyor
- [ ] `https://www.enkitattoo.com.tr/*` → canonical host’a yönleniyor
- [ ] Sayfalarda JSON-LD script’leri render oluyor (view-source / curl ile görülebilir)

### 4.2 Build
- [ ] `npm run lint` → error yok
- [ ] `npm run build` → başarılı

### 4.3 Ölçümleme
- [ ] GA4 DebugView / Tag Assistant ile `page_view` görünüyor

---

## 5) Müşteri Tarafı Sorumluluklar (Gerekli erişimler)
- Google Search Console erişimi (mülk doğrulaması)
- Google Analytics (GA4) property erişimi
- Domain/DNS erişimi (gerekirse yönlendirme/SSL için)
- Eğer AEA/EU trafiği hedefleniyorsa: Çerez izin yönetimi (Consent Mode v2 gibi) kararları

---

## 6) Çalışma Şekli ve Değişiklik Yönetimi
- Bu doküman V1 kapsamını kilitler.
- V1 sonrası yeni istekler:
  - “V2 backlog” olarak yazılır
  - Etki/efor değerlendirmesi yapılır
  - Onay sonrası uygulanır

---

## 7) Sonraki Adımlar (Önerilen)
V1 bitti; şimdi “Google’ın sindirmesi” için aşağıdaki adımlar önerilir:

1) Search Console
   - Sitemap gönderimi (yapıldı)
   - Önemli sayfalarda URL denetimi → “Dizin oluşturma iste”
2) Indexing takip
   - Tarama istatistikleri + dizine eklenen sayfalar raporu
3) GBP (Local)
   - İşletme profili optimizasyonu
   - Yorum toplama akışı (QR / WhatsApp)
4) İçerik planı
   - “Piercing türleri” + “bakım/iyileşme” + “dövme stilleri” için mini rehber sayfalar

---

## 8) Kontrol Komutları (Kopyala/Çalıştır)
> Bu bloklar prod’da “her şey yerinde mi?” kontrolü için.

```bash
# robots
curl -I https://enkitattoo.com.tr/robots.txt
curl -I https://www.enkitattoo.com.tr/robots.txt

# sitemap
curl -I https://enkitattoo.com.tr/sitemap.xml
curl -s https://enkitattoo.com.tr/sitemap.xml | head -n 40

# örnek sayfada JSON-LD var mı?
curl -s https://enkitattoo.com.tr/iletisim | rg -n 'application/ld\+json|BreadcrumbList|TattooParlor|LocalBusiness' | head -n 40
curl -s https://enkitattoo.com.tr/kesfet/realistik-dovme | rg -n 'BreadcrumbList' | head -n 20
```

---

## 9) İmza / Onay (Opsiyonel)
**Müşteri:** ____________________  Tarih: ____ / ____ / ______  
**Ajans/Uygulayıcı:** ____________  Tarih: ____ / ____ / ______

---

## Ek — Notlar (Bu sprintte yaşananlar)
- Search Console’da `www` ve `non-www` ayrı mülk gibi göründüğü için kısa süre “robots yok” uyarısı oluştu.  
  Prod tarafında `curl` doğrulamasıyla robots’un aslında **200** döndüğü ve `www`’ün **308 redirect** ile canonical’a gittiği teyit edildi.
