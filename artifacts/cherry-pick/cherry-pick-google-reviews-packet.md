# ENKI → MDKitchen Cherry-Pick Packet: Google Yorumları (Kanıtlı)

Tarih: 2026-03-04  
Kapsam: ENKI içindeki `GoogleReviewsSection` görünüm ve davranışını MDKitchen'e taşınabilir paket olarak çıkarmak.

## 1) Keşif Komutları (Çalıştırıldı)

```bash
rg -n "google-reviews|Google yorumları|Reviews|review" src/components -S
rg -n "google-map-embed|GoogleMap" src/components -S
rg -n "google-reviews-section|GoogleReviews|<.*Reviews" src/app src/components -S
rg -n "reviews\\.(tr|en|sq|sr)\\.json|reviews\\.json|REVIEWS|reviewItems" src -S
find src -maxdepth 5 -type f | rg -n "reviews" -S
rg -n "GOOGLE_MAPS_BUSINESS_URL|GOOGLE_MAPS|reviews|Yorum yap|Maps" src/lib -S
rg -n "from \"@/components/ui/dialog\"|<Dialog|DialogContent" src/components -S
rg -n "data-\\[state=closed\\]|translate-y-full|transition-\\[transform\\]" src/components -S
rg -n "lucide|MapPin|Star|Google" src/components -S
```

Önemli sonuçlar (ham kanıt):

```txt
src/components/google/google-reviews-section.tsx:96:export function GoogleReviewsSection()
src/app/[locale]/(app)/page.tsx:9:import { GoogleReviewsSection } from "@/components/google/google-reviews-section";
src/app/[locale]/(app)/page.tsx:301:        <GoogleReviewsSection />
src/i18n/request.ts:36:      reviewsMessages = (await import('../content/enki/reviews.tr.json')).default;
src/content/enki/reviews.tr.json
src/content/enki/reviews.en.json
src/content/enki/reviews.sr.json
src/content/enki/reviews.sq.json
```

## 2) Entry Point: Hangi Component Render Ediyor?

Bileşen: `GoogleReviewsSection`

Kanıt:
- `src/app/[locale]/(app)/page.tsx:9` import ediyor.
- `src/app/[locale]/(app)/page.tsx:301` render ediyor.
- `src/components/google/google-reviews-section.tsx:96` export edilen component.

`sed/cat` kanıtı:

```txt
src/app/[locale]/(app)/page.tsx
9: import { GoogleReviewsSection } from "@/components/google/google-reviews-section";
301: <GoogleReviewsSection />
```

```txt
src/components/google/google-reviews-section.tsx
96: export function GoogleReviewsSection() {
```

## 3) Review Verisi Nereden Geliyor?

Sonuç:
- Review ID/rating/avatar meta bilgisi component içinde statik `REVIEW_META` dizisi.
- Review metinleri (`authorName`, `relativeTime`, `text`) `next-intl` üzerinden `reviews.items.*` anahtarlarından geliyor.
- `reviews` namespace'i locale'e göre `src/content/enki/reviews.<locale>.json` dosyalarından yükleniyor.

Kanıt:
- Statik meta: `src/components/google/google-reviews-section.tsx:26-58`
- i18n çağrısı: `src/components/google/google-reviews-section.tsx:105-107`
- request yükleme: `src/i18n/request.ts:23,27,31,36`
- TR fallback/default: `src/i18n/request.ts:33-37` ve `src/i18n/routing.ts:7`
- TR içerik dosyası: `src/content/enki/reviews.tr.json:1-46`

`sed/cat` kanıtı:

```txt
src/components/google/google-reviews-section.tsx
26: const REVIEW_META ...
105: authorName: t(`reviews.items.${reviewMeta.id}.authorName`),
106: relativeTime: t(`reviews.items.${reviewMeta.id}.relativeTime`),
107: text: t(`reviews.items.${reviewMeta.id}.text`),
```

```txt
src/i18n/request.ts
23: reviewsMessages = (await import('../content/enki/reviews.en.json')).default;
27: reviewsMessages = (await import('../content/enki/reviews.sq.json')).default;
31: reviewsMessages = (await import('../content/enki/reviews.sr.json')).default;
36: reviewsMessages = (await import('../content/enki/reviews.tr.json')).default;
```

```txt
src/i18n/routing.ts
7: defaultLocale: 'tr',
```

## 4) Link SSOT’ları (Google Maps / Review URL)

Tespit edilen link kaynakları:

1. `GoogleReviewsSection` kendi içinde hardcoded review linkleri kullanıyor:
- `GOOGLE_REVIEWS_VERIFY_URL` (`src/components/google/google-reviews-section.tsx:11-12`)
- `GOOGLE_WRITE_REVIEW_URL` (`src/components/google/google-reviews-section.tsx:13`)

2. Home page map embed için ayrı hardcoded URL var:
- `GOOGLE_REVIEWS_URL` (`src/app/[locale]/(app)/page.tsx:25`)

3. Global site-level maps SSOT da mevcut:
- `GOOGLE_MAPS_BUSINESS_URL = SITE_INFO.googleMapsUrl` (`src/lib/site/links.ts:9`, `src/lib/site-info.ts:25`)

Yorum:
- `GoogleReviewsSection` şu an `GOOGLE_MAPS_BUSINESS_URL` kullanmıyor (doğrudan kendi constant'larını kullanıyor).

## 5) UI Primitive Bağımlılıkları (Dialog/Sheet dahil)

`GoogleReviewsSection` import bağımlılıkları:
- `Button` (`src/components/google/google-reviews-section.tsx:7`)
- `ExternalLink` (`src/components/google/google-reviews-section.tsx:8`)
- `Skeleton` (`src/components/google/google-reviews-section.tsx:9`)
- `useTranslations` (`next-intl`) (`src/components/google/google-reviews-section.tsx:6`)
- `Image` (`next/image`) (`src/components/google/google-reviews-section.tsx:4`)

Dialog/Sheet durumu:
- Google reviews altında `Dialog`, `Sheet`, `modal`, `drawer` eşleşmesi yok.
- Komut kanıtı: `rg -n 'Dialog|Sheet|modal|drawer' src/components/google/google-reviews-section.tsx src/components/google -S` → `NO_MATCHES`
- Bottom-sheet animasyon class eşleşmesi yok.
- Komut kanıtı: `rg -n 'translate-y-full|transition-\[transform\]|data-\[state=closed\]' src/components/google -S` → `NO_MATCHES`

Sonuç:
- Bu paket için Dialog/Sheet taşıma zorunluluğu **yok**.

## 6) Kullanılan İkonlar / Assetler

İkon:
- `Star` (`lucide-react`) kullanılıyor (`src/components/google/google-reviews-section.tsx:5,231-235`).

Assetler:
- `public/brand/google-maps-lockup.svg`
- `public/brand/google-maps-pin.webp`
- `public/reviews/avatars/r01.webp`
- `public/reviews/avatars/r04.webp`
- `public/reviews/avatars/r07.webp`

Kanıt:
- Component asset path constant'ları: `src/components/google/google-reviews-section.tsx:14-15,30,43,56`
- Disk doğrulaması: `find public -maxdepth 4 -type f | rg -n 'google|reviews/avatars|brand/google' -S`

## 7) TR-only Kullanım Modu (i18n bypass/fallback)

Durum:
- Component şu an i18n'ye bağlı (`useTranslations`, `t(...)`).
- MDKitchen TR-only ise 2 seçenek var.

Seçenek A (düşük risk, önerilen):
- `next-intl` tut, sadece TR mesajları + `reviews.tr.json` taşı.
- `defaultLocale: 'tr'` davranışı korunur.

Seçenek B (i18n tamamen kaldır):
- `useTranslations` çağrılarını kaldır.
- `googleReviews.*` metinlerini component içinde TR literal olarak sabitle.
- Review text kaynağı olarak doğrudan `reviews.tr.json` import et.

TR-only için gereken minimum veri:
- `src/content/enki/reviews.tr.json`
- `messages/tr.json` içindeki `googleReviews` bloğu (eğer i18n devam edecekse)

Kanıt:
- `messages/tr.json:91-102` (`googleReviews` key seti)
- `src/content/enki/reviews.tr.json:1-46`

MDKitchen'da mevcut i18n altyapısı olup olmadığı: **UNKNOWN**

---

## COPY FILELIST

Aşağıdaki liste sadece Google Reviews paketine ilişkindir.

- `src/components/google/google-reviews-section.tsx` (ana component)
- `src/content/enki/reviews.tr.json` (TR-only review data; minimum)
- `public/brand/google-maps-lockup.svg` (Google lockup asset)
- `public/brand/google-maps-pin.webp` (Google pin asset)
- `public/reviews/avatars/r01.webp` (review avatar)
- `public/reviews/avatars/r04.webp` (review avatar)
- `public/reviews/avatars/r07.webp` (review avatar)

Şarta bağlı (MDKitchen'da eşdeğeri yoksa kopyala):

- `src/components/ui/external-link.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/skeleton.tsx`
- `src/lib/utils.ts` (`cn` helper; button/skeleton için)

TR-only + i18n korumalı mod için ek:

- `messages/tr.json` (en az `googleReviews` key bloğu)
- `src/i18n/request.ts` içinde reviews namespace merge mantığına eşdeğer yapı (tam dosya taşımak zorunlu değil; davranış eşdeğeri yeterli)

Kopyalanmamalı (bu paket için gerekli değil):

- `src/components/ui/dialog.tsx` (Google reviews kullanmıyor)
- `src/components/ui/sheet.tsx` (Google reviews kullanmıyor)

## MDKITCHEN INTEGRATION STEPS

1. `GoogleReviewsSection` dosyasını MDKitchen'da hedef klasöre kopyala.
2. `public/brand/google-maps-lockup.svg` ve `public/brand/google-maps-pin.webp` assetlerini taşı.
3. `public/reviews/avatars/r01.webp`, `r04.webp`, `r07.webp` dosyalarını taşı.
4. MDKitchen'da `Button`, `ExternalLink`, `Skeleton` primitive'lerinin import path'lerini eşleştir; yoksa ilgili dosyaları kopyala.
5. `lucide-react` bağımlılığının kurulu olduğunu doğrula; yoksa ekle.
6. TR-only modda `src/content/enki/reviews.tr.json` verisini bağla:
   - i18n varsa `reviews` namespace olarak yükle,
   - i18n yoksa component içinde bu JSON'u doğrudan import et.
7. `googleReviews` UI metinlerini bağla:
   - i18n varsa `messages/tr.json` `googleReviews` key'leriyle,
   - i18n yoksa TR literal stringlerle.
8. Link SSOT kararını netleştir:
   - mevcut hardcoded URL'leri koru veya
   - MDKitchen'da tek kaynak (`GOOGLE_MAPS_BUSINESS_URL` benzeri) oluşturup component constant'larını oraya bağla.
9. Home/landing entry point'te component'i render et (ENKI kanıtı: `src/app/[locale]/(app)/page.tsx:301`).
10. Görsel ve davranış smoke testini tamamla (aşağıdaki checklist).

## TEST CHECKLIST

- [ ] `npm run build` başarılı.
- [ ] Hedef sayfada `GoogleReviewsSection` render oluyor (başlık + 2 CTA + kart listesi).
- [ ] 3 saniye içinde ya da viewport'a girince skeleton -> gerçek yorum kartlarına geçiş çalışıyor.
- [ ] `View all` / `Write review` / `Read more` linkleri yeni sekmede açılıyor (`ExternalLink` davranışı).
- [ ] Yıldız ikonları (`Star`) doğru dolulukla render oluyor (5/5).
- [ ] Brand badge (pin + lockup) kart sağ-altında gecikmeli görünüyor.
- [ ] Asset path'lerinde 404 yok (`/brand/*`, `/reviews/avatars/*`).
- [ ] TR-only modda review metinleri Türkçe geliyor (`reviews.tr.json`).
- [ ] Modal aç/kapa testi: **N/A (bu component'te modal/dialog yok; kanıt: `rg ... Dialog|Sheet ...` => `NO_MATCHES`)**.

