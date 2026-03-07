# NAND-MONTENEGRO I18N Cherry-Pick Packet (Kanıtlı)

Tarih: 2026-02-28
Kapsam: Repo içi i18n/translate sisteminin ENKI'ye taşınması için kanıtlı çıkarım.

## 1) Kullanılan i18n yaklaşımı + kütüphaneler + versiyonlar

### 1.1 Yaklaşım
- Next.js App Router + `next-intl` tabanlı locale-prefix routing.
- Locale segmenti URL içinde zorunlu (`/[locale]/...`).

- **KANIT:** `src/i18n/routing.ts:3-7` (`locales`, `defaultLocale: 'tr'`, `localePrefix: 'always'`)
- **KANIT:** `src/app/[locale]/layout.tsx:31-33` (`generateStaticParams` ile locale path üretimi)
- **KANIT:** `src/proxy.ts:19,47,50-52` (`createMiddleware(routing)` + matcher)
- **NE YAPIYOR:** Uygulama locale’leri merkezi routing tanımından yönetiyor; URL prefix her locale için zorunlu.
- **ENKI’YE NASIL TAŞINIR:** ENKI’de `app/[locale]/` segmenti ve `proxy.ts` + routing tanımı birlikte taşınmalı.

### 1.2 Kütüphane ve sürüm (kanıtlı)
- `next-intl`: declared `^4.6.1`, lock resolved `4.6.1`.

- **KANIT:** `package.json:36`
- **KANIT:** `package-lock.json:9674-9677`
- **NE YAPIYOR:** next-intl runtime, server/client translation API ve middleware sağlar.
- **ENKI’YE NASIL TAŞINIR:** ENKI `package.json`'a `next-intl` eklenmeli; lock dosyası ENKI paket yöneticisine göre yeniden üretilmeli.

### 1.3 Alternatif i18n kütüphaneleri
- `next-i18next`, `i18next`, `react-i18next`, `@lingui`, `react-intl`, `formatjs` (doğrudan) kullanımı: **UNKNOWN/YOK (repo package.json’da tespit edilmedi)**.

- **KANIT:** `rg` sorgusu yalnızca `next-intl` eşleşmesi döndürdü (`package.json:36`).
- **NE YAPIYOR:** Tek aktif i18n bağımlılığı next-intl.
- **ENKI’YE NASIL TAŞINIR:** ENKI'de başka i18n kütüphanesi varsa çakışma analizi yapılmalı.

## 2) Dosya/dizin haritası (entry points)

### 2.1 Build/plugin girişi
- `next-intl` plugin’i Next config’e bağlanmış.

- **KANIT:** `next.config.ts:2-4,19`
- **NE YAPIYOR:** next-intl request config dosyasını build pipeline’a bağlar.
- **ENKI’YE NASIL TAŞINIR:** ENKI `next.config.*` dosyasına aynı plugin wiring eklenmeli.

### 2.2 Request config + message yükleme
- Request bazında locale doğrulama, fallback ve mesaj importu yapılıyor.

- **KANIT:** `src/i18n/request.ts:5-10` (invalid locale -> default)
- **KANIT:** `src/i18n/request.ts:12` (`messages/${locale}.json`)
- **KANIT:** `src/i18n/request.ts:14-21` (`home.<locale>.json` fallback -> `home.json`)
- **KANIT:** `src/i18n/request.ts:24-25` (merge: `{ ...localeMessages, home: homeNamespace }`)
- **NE YAPIYOR:** Locale messages + ayrı `home` namespace’i birleştiriliyor.
- **ENKI’YE NASIL TAŞINIR:** ENKI’de request config aynı şekilde taşıyın; `home` namespace stratejisini koruyun veya kaldıracaksanız tüm `getTranslations('home')` çağrılarını düzeltin.

### 2.3 Middleware/proxy
- Locale middleware `src/proxy.ts` içinde.

- **KANIT:** `src/proxy.ts:1,19,47`
- **KANIT:** `src/proxy.ts:50-52` (matcher)
- **NE YAPIYOR:** Locale çözümlemesini proxy katmanında çalıştırıyor; bazı path’ler bypass ediliyor.
- **ENKI’YE NASIL TAŞINIR:** ENKI’de `proxy.ts` adı/konumu Next sürümüne uygun olmalı (bu repo Next 16.1.1).

### 2.4 Navigation helpers
- `createNavigation(routing)` ile locale-aware Link/router wrapper’ları üretilmiş.

- **KANIT:** `src/i18n/navigation.ts:1-5`
- **NE YAPIYOR:** `Link`, `useRouter`, `usePathname` locale routing ile uyumlu hale geliyor.
- **ENKI’YE NASIL TAŞINIR:** `next/link` yerine bu wrapper’ın import edildiği tüm bileşenler korunmalı.

### 2.5 Layout/provider
- Root locale layout’ta request locale set ediliyor ve `NextIntlClientProvider` ile messages enjekte ediliyor.

- **KANIT:** `src/app/[locale]/layout.tsx:4,48-49,65`
- **KANIT:** `src/app/[locale]/layout.tsx:44-46` (geçersiz locale -> `notFound()`)
- **NE YAPIYOR:** Server-side locale + client provider zinciri kuruluyor.
- **ENKI’YE NASIL TAŞINIR:** ENKI root locale layout’unda aynı provider düzeni kurulmalı.

### 2.6 Message dizinleri
- Ana çeviri dosyaları `messages/*.json`.
- Ek içerik namespace’i `src/content/nandd/home*.json`.

- **KANIT:** `messages/` altında çoklu locale JSON dosyaları (tr/en/ar/ru/...)
- **KANIT:** `src/content/nandd/home.json` ve `src/content/nandd/home.en.json` vb.
- **NE YAPIYOR:** Genel UI metinleri ile home içerikleri ayrıştırılmış kaynaklardan geliyor.
- **ENKI’YE NASIL TAŞINIR:** ENKI’de tek kaynak veya çift kaynak (messages + content) kararı baştan verilmeli.

## 3) Locale routing / mapping mantığı

### 3.1 Locale listesi ve default
- Locale listesi: `tr,en,ar,ru,de,fr,it,es,pt,nl,sr,ka`
- Default: `tr`
- Prefix davranışı: `always`

- **KANIT:** `src/i18n/routing.ts:4-6`
- **NE YAPIYOR:** Tüm rotalar locale prefix bekler (`/tr`, `/en`, ...).
- **ENKI’YE NASIL TAŞINIR:** ENKI URL stratejisi aynı kalacaksa localePrefix `always` korunmalı.

### 3.2 URL yapısı
- App Router yapısı `src/app/[locale]/...`.

- **KANIT:** `src/app/[locale]/layout.tsx` varlığı ve `generateStaticParams` (`31-33`)
- **NE YAPIYOR:** Locale segmenti route ağacının en üstünde.
- **ENKI’YE NASIL TAŞINIR:** ENKI route tree `app/[locale]/...` olarak düzenlenmeli.

### 3.3 Geçersiz locale davranışı
- Geçersiz locale 404.

- **KANIT:** `src/app/[locale]/layout.tsx:44-46`
- **NE YAPIYOR:** Bilinmeyen locale ile içerik render edilmez.
- **ENKI’YE NASIL TAŞINIR:** Aynı guard korunmalı.

### 3.4 Path mapping detayı
- next-intl router push için locale prefix’i strip eden yardımcı fonksiyon mevcut.

- **KANIT:** `src/components/page-transition-controller.tsx:26-36`
- **NE YAPIYOR:** Router’a locale’siz pathname vererek next-intl beklentisine uyuyor.
- **ENKI’YE NASIL TAŞINIR:** ENKI’de custom transition/router katmanı varsa bu davranış korunmalı.

## 4) Dil switcher mantığı

### 4.1 Desktop switcher
- `useLocale()` ile aktif locale okunuyor.
- `router.push(pathname, { locale })` ile locale değişimi yapılıyor.

- **KANIT:** `src/components/locale-switcher.tsx:31-37`
- **KANIT:** `src/components/locale-switcher.tsx:13-28` (label/order)
- **NE YAPIYOR:** Locale değişimi URL üzerinden tetikleniyor.
- **ENKI’YE NASIL TAŞINIR:** Header desktop dil menüsü aynı API ile bağlanmalı.

### 4.2 Mobile switcher
- Drawer içinde aynı mekanik: `useLocale`, `usePathname`, `router.push(..., { locale })`.

- **KANIT:** `src/components/locale-drawer.tsx:51-59`
- **KANIT:** `src/components/site-header.tsx:37-40` (mobilde `LocaleDrawer` kullanımı)
- **NE YAPIYOR:** Mobil dil seçimi URL bazlı.
- **ENKI’YE NASIL TAŞINIR:** ENKI mobil header/drawer actionına aynı handler bağlanmalı.

### 4.3 Seçim nerede tutuluyor?
- Uygulama kodunda locale için `cookie`/`localStorage` yazımı tespit edilmedi; ana mekanizma URL.

- **KANIT:** `rg` ile `NEXT_LOCALE|locale.*cookie|localStorage.*locale` aramasında kaynak eşleşmesi yok.
- **NE YAPIYOR:** Locale state pratikte URL’den türetiliyor.
- **ENKI’YE NASIL TAŞINIR:** URL-temelli locale korunmalı; cookie persistence istenirse ayrı feature olarak eklenmeli.

## 5) Message formatı ve key düzeni

### 5.1 Format
- JSON tabanlı, nested key yapısı.

- **KANIT:** `messages/en.json:1-130` (ör. `Nav`, `Footer`, `locale`, `Projeler.items.0...`)
- **NE YAPIYOR:** Namespace + nested path ile `t('a.b.c')` kullanımı.
- **ENKI’YE NASIL TAŞINIR:** ENKI’de key naming aynı tutulursa component değişikliği minimum olur.

### 5.2 Namespace kullanımı
- `useTranslations('Nav')`, `getTranslations('Footer')`, `getTranslations('home')` vb.

- **KANIT:** `src/components/mobile-nav.tsx:24-26`
- **KANIT:** `src/components/site-footer.tsx:11`
- **KANIT:** `src/app/[locale]/(marketing)/page.tsx:10`
- **NE YAPIYOR:** Component bazlı namespace erişimi.
- **ENKI’YE NASIL TAŞINIR:** ENKI componentlerinde namespace bazlı çeviri çağrısı standardize edilmeli.

### 5.3 Typegen durumu
- next-intl message type generation/strict typing için özel config dosyası tespit edilmedi.

- **KANIT:** Repo keşfinde `next-intl` typegen config dosyası bulunmadı.
- **NE YAPIYOR:** Runtime key kullanımı var; compile-time key safety sınırlı.
- **ENKI’YE NASIL TAŞINIR:** İsteğe bağlı olarak typegen sonradan eklenebilir (MVP için şart değil).

## 6) SEO entegrasyonu (hreflang/alternates/canonical/metadata)

- Global metadata var (`title`, `description`).
- `html lang` locale’den set ediliyor, `dir` Arabic için `rtl`.
- `alternates/hreflang/canonical` tanımı tespit edilmedi.

- **KANIT:** `src/app/[locale]/layout.tsx:26-29` (metadata)
- **KANIT:** `src/app/[locale]/layout.tsx:54` (`lang`, `dir`)
- **KANIT:** `rg -n "alternates|canonical|hreflang|generateMetadata"` taramasında sadece `metadata` tanımı bulundu.
- **NE YAPIYOR:** Temel metadata + dil yönü var; çoklu-locale SEO sinyalleri sınırlı.
- **ENKI’YE NASIL TAŞINIR:** ENKI’de `generateMetadata` ile locale bazlı `alternates.languages` eklenmesi önerilir.

## 7) ENKI'ye taşıma planı

### 7.1 Alınacak dosyalar listesi (özet)
- Çekirdek: `next.config.ts`, `src/proxy.ts`, `src/i18n/*`, `src/app/[locale]/layout.tsx`
- UI entegrasyonu: locale switcher/drawer + header bağlantıları
- İçerik: `messages/*.json`, opsiyonel `src/content/nandd/home*.json`

### 7.2 ENKI’de nereye koyacağız
- `ENKI_ROOT/src/i18n/*`
- `ENKI_ROOT/src/proxy.ts`
- `ENKI_ROOT/src/app/[locale]/layout.tsx` (mevcut layout ile merge)
- `ENKI_ROOT/messages/*.json`
- `ENKI_ROOT/src/components/locale-switcher.tsx` ve/veya `locale-drawer.tsx`

### 7.3 Hangi mevcut component’lere bağlayacağız
- `Header` language action slot (desktop)
- `Mobile header/menu/drawer` language action slot (mobile)
- Nav/Footer linkleri locale-aware `Link` wrapper’a geçirilecek

Not: ENKI repo yapısı bu analizde yok, bu nedenle hedef component isimleri **UNKNOWN**. Yukarıdaki slotlar davranış bazlı hedeflerdir.

### 7.4 Minimum PR planı
- `PR-I18N-01 (Core Wiring)`
  - `next-intl` dependency
  - `next.config` plugin
  - `src/i18n/{routing,request,navigation}.ts`
  - `src/proxy.ts`
  - `app/[locale]/layout.tsx` provider + locale guard
- `PR-I18N-02 (Messages + Routes)`
  - `messages/*.json` kopyalama
  - page/component `getTranslations/useTranslations` entegrasyonu
  - locale route smoke test
- `PR-I18N-03 (Switcher + SEO)`
  - header desktop/mobile switcher bağlama
  - locale-aware link cleanup
  - `alternates/hreflang/canonical` ekleme (ENKI’de)

## 8) Riskler + test checklist

### 8.1 Riskler
- ENKI’de mevcut i18n kütüphanesi varsa çakışma.
- `localePrefix: 'always'` URL kırılımı yaratabilir (eski linksiz sayfalar).
- Message key uyumsuzluğu runtime’da boş/eksik metin üretir.
- `home` namespace gibi ikinci kaynak stratejisi yanlış taşınırsa ana sayfa metinleri düşer.

### 8.2 Test checklist
- `npm run build`
- Locale route test: `/tr`, `/en`, `/ru` (ve en az 1 alt route)
- Invalid locale test: `/xx/...` => 404
- Switcher test: desktop + mobile, locale değişince URL prefix güncelleniyor mu
- Link test: internal navigation locale’yi koruyor mu
- SEO test: `html[lang]`, `dir` doğru mu; `alternates/canonical` varsa doğru mu
- Cache test: hard refresh sonrası locale route doğru render

---

## A) Dependencies

- `next-intl@^4.6.1` (resolved `4.6.1`)
  - **KANIT:** `package.json:36`, `package-lock.json:9674-9677`

ENKI’de zaten mevcutsa:
- Major/minor farkı varsa middleware/request API farkları için çakışma riski not edilmeli.

## B) Copy Filelist

- `next.config.ts` — next-intl plugin wiring — ENKI hedef: `next.config.ts`
- `src/proxy.ts` — locale middleware + matcher — ENKI hedef: `src/proxy.ts`
- `src/i18n/routing.ts` — locale map/default/prefix — ENKI hedef: `src/i18n/routing.ts`
- `src/i18n/request.ts` — request locale + messages loader — ENKI hedef: `src/i18n/request.ts`
- `src/i18n/navigation.ts` — locale-aware Link/router wrappers — ENKI hedef: `src/i18n/navigation.ts`
- `src/app/[locale]/layout.tsx` — provider + locale guard + html lang/dir — ENKI hedef: `src/app/[locale]/layout.tsx` (merge)
- `messages/tr.json` — TR messages — ENKI hedef: `messages/tr.json`
- `messages/en.json` — EN messages — ENKI hedef: `messages/en.json`
- `messages/ar.json` — AR messages — ENKI hedef: `messages/ar.json`
- `messages/ru.json` — RU messages — ENKI hedef: `messages/ru.json`
- `messages/de.json` — DE messages — ENKI hedef: `messages/de.json`
- `messages/fr.json` — FR messages — ENKI hedef: `messages/fr.json`
- `messages/it.json` — IT messages — ENKI hedef: `messages/it.json`
- `messages/es.json` — ES messages — ENKI hedef: `messages/es.json`
- `messages/pt.json` — PT messages — ENKI hedef: `messages/pt.json`
- `messages/nl.json` — NL messages — ENKI hedef: `messages/nl.json`
- `messages/sr.json` — SR messages — ENKI hedef: `messages/sr.json`
- `messages/ka.json` — KA messages — ENKI hedef: `messages/ka.json`
- `src/components/locale-switcher.tsx` — desktop language menu — ENKI hedef: `src/components/header/locale-switcher.tsx` (veya mevcut header klasörü)
- `src/components/locale-drawer.tsx` — mobile language drawer — ENKI hedef: `src/components/header/locale-drawer.tsx` (veya mevcut mobile nav klasörü)
- `src/components/site-header.tsx` — switcher entegrasyon noktası — ENKI hedef: mevcut Header component (merge)
- `src/content/nandd/home.json` — default home namespace (opsiyonel içerik katmanı) — ENKI hedef: `src/content/<project>/home.json`
- `src/content/nandd/home.en.json` — locale home namespace (opsiyonel) — ENKI hedef: `src/content/<project>/home.en.json`
- `src/content/nandd/home.ar.json` — locale home namespace (opsiyonel) — ENKI hedef: `src/content/<project>/home.ar.json`
- `src/content/nandd/home.ru.json` — locale home namespace (opsiyonel) — ENKI hedef: `src/content/<project>/home.ru.json`
- `src/content/nandd/home.de.json` — locale home namespace (opsiyonel) — ENKI hedef: `src/content/<project>/home.de.json`
- `src/content/nandd/home.fr.json` — locale home namespace (opsiyonel) — ENKI hedef: `src/content/<project>/home.fr.json`
- `src/content/nandd/home.it.json` — locale home namespace (opsiyonel) — ENKI hedef: `src/content/<project>/home.it.json`
- `src/content/nandd/home.es.json` — locale home namespace (opsiyonel) — ENKI hedef: `src/content/<project>/home.es.json`
- `src/content/nandd/home.pt.json` — locale home namespace (opsiyonel) — ENKI hedef: `src/content/<project>/home.pt.json`
- `src/content/nandd/home.nl.json` — locale home namespace (opsiyonel) — ENKI hedef: `src/content/<project>/home.nl.json`
- `src/content/nandd/home.sr.json` — locale home namespace (opsiyonel) — ENKI hedef: `src/content/<project>/home.sr.json`
- `src/content/nandd/home.ka.json` — locale home namespace (opsiyonel) — ENKI hedef: `src/content/<project>/home.ka.json`

## C) Integration Steps (ENKI)

1. `next-intl` bağımlılığını ENKI’ye ekle ve lock dosyasını güncelle.
2. ENKI `next.config.*` içine `createNextIntlPlugin('./src/i18n/request.ts')` ekle.
3. `src/i18n/{routing,request,navigation}.ts` dosyalarını taşı ve ENKI alias/path’lerine göre düzelt.
4. ENKI’de `src/proxy.ts` oluşturup `createMiddleware(routing)` matcher kur.
5. Route ağacını `app/[locale]/...` olacak şekilde düzenle/merge et.
6. Root locale layout’ta `setRequestLocale`, `getMessages`, `NextIntlClientProvider` zincirini kur.
7. `messages/*.json` dosyalarını taşı; ENKI component key’leriyle eşleştir.
8. Header desktop language menu’yu `useLocale + router.push(pathname, { locale })` ile bağla.
9. Mobilde drawer/sheet language selector ekle ve aynı handler’ı kullan.
10. Internal navigation’da `@/i18n/navigation` `Link` wrapper’ına geç.
11. Home namespace ayrı kaynak kullanılacaksa `home*.json` fallback mantığını koru; kullanılmayacaksa request merge’ünü sadeleştir.
12. Build + route + switcher + SEO smoke testlerini çalıştır.

## D) Tests

- `npm run build`
- Locale route test: `/{tr,en,ru}` + en az bir alt path
- Switcher test (desktop + mobile)
- Invalid locale test (`/xx/...`)
- SEO metadata test (`html lang`, `dir`; alternates varsa doğrulama)

---

## CHERRY-PICK FILELIST

- `next.config.ts`
- `src/proxy.ts`
- `src/i18n/routing.ts`
- `src/i18n/request.ts`
- `src/i18n/navigation.ts`
- `src/app/[locale]/layout.tsx`
- `src/components/site-header.tsx`
- `src/components/locale-switcher.tsx`
- `src/components/locale-drawer.tsx`
- `messages/tr.json`
- `messages/en.json`
- `messages/ar.json`
- `messages/ru.json`
- `messages/de.json`
- `messages/fr.json`
- `messages/it.json`
- `messages/es.json`
- `messages/pt.json`
- `messages/nl.json`
- `messages/sr.json`
- `messages/ka.json`
- `src/content/nandd/home.json` (opsiyonel)
- `src/content/nandd/home.en.json` (opsiyonel)
- `src/content/nandd/home.ar.json` (opsiyonel)
- `src/content/nandd/home.ru.json` (opsiyonel)
- `src/content/nandd/home.de.json` (opsiyonel)
- `src/content/nandd/home.fr.json` (opsiyonel)
- `src/content/nandd/home.it.json` (opsiyonel)
- `src/content/nandd/home.es.json` (opsiyonel)
- `src/content/nandd/home.pt.json` (opsiyonel)
- `src/content/nandd/home.nl.json` (opsiyonel)
- `src/content/nandd/home.sr.json` (opsiyonel)
- `src/content/nandd/home.ka.json` (opsiyonel)
