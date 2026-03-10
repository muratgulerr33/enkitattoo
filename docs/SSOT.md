# SSOT

Bu dosya repo içindeki teknik gerçeklerin ana evidir. Route, i18n, SEO, source-of-truth, değişiklik etkisi ve repo-side kararlar burada tutulur.

## 1) Kısa Stack ve Runtime Yüzeyi

- Framework: Next.js 16 App Router, React 19, TypeScript (`package.json`)
- I18n: `next-intl` (`src/i18n/routing.ts`, `src/i18n/request.ts`)
- DB foundation: PostgreSQL + Drizzle ORM (`src/db/*`, `drizzle.config.ts`, `package.json`)
- Ops auth: ops-local email/password + signed cookie session (`src/lib/ops/auth/*`, `src/app/ops/giris/actions.ts`)
- Theme: `next-themes`, `storageKey="enki-theme"` (`src/app/layout.tsx`)
- Site base URL: `https://enkitattoo.com.tr` (`src/lib/site/base-url.ts`)
- Route-content generator: `scripts/generate-route-content.py`
- Runtime port: dev/start için `3002` (`package.json`)

## 2) Canonical Kaynak Envanteri

| Konu | Canonical dosya | Derived dosya / tüketen | Değişirse ne tetiklenir | Yanlış kullanım riski |
|---|---|---|---|---|
| Public route + SEO metadata registry | `data/route-content/enki-v1-sitemap-seo-template.csv` | `src/lib/route-content.generated.ts`, `src/lib/route-content.ts`, route metadata, sitemap | generator rerun, metadata kontrolü, sitemap/robots kontrolü | generated dosyayı elle düzenlemek drift üretir |
| Hub slug ve canonical hub path | `src/lib/hub/hubs.v1.ts` | `/kesfet` landing, `/kesfet/[hub]`, home kartları, gallery eşleme | route-content CSV, landing ve detail smoke check | slug route-content ile ayrışırsa 404 veya yanlış link oluşur |
| Gallery hub normalize katmanı | `src/lib/gallery/manifest.v1.ts` | `galeri-tasarim` filters/grid, hub-gallery | gallery smoke check, hub param kontrolü | canonical slug ile gallery hub paramı karışır |
| I18n locale routing | `src/i18n/routing.ts` | `src/middleware.ts`, `src/app/[locale]/(app)/layout.tsx`, `@/i18n/navigation` | locale smoke check, middleware kontrolü | yanlış locale varsayımı URL davranışını bozar |
| I18n load/merge zinciri | `src/i18n/request.ts` | `NextIntlClientProvider`, tüm `useTranslations` / `getTranslations` tüketicileri | build, locale smoke check, namespace kontrolü | namespace eklenip merge zinciri güncellenmezse runtime kırılır |
| UI message kaynağı | `messages/*.json` | page/component copy | i18n kalite kontrolü, locale taşma kontrolü | TR eklenip diğer locale'ler unutulursa drift oluşur |
| Review content namespace | `src/content/enki/reviews.*.json` | `reviews.*` namespace tüketen UI | `src/i18n/request.ts` kontrolü, reviews UI smoke check | content namespace mesaj dosyası sanılırsa yanlış yerde aranır |
| Ops DB schema | `src/db/schema/*.ts` | `src/db/index.ts`, `src/db/migrations/*`, `drizzle.config.ts` | migration generate, DB client ve env kontrolü | schema ile migration drift ederse DB foundation bozulur |
| Ops auth/session contract | `src/lib/ops/auth/*.ts` | `src/app/ops/**`, `scripts/db/bootstrap-ops-user.mjs`, `.env.example` | login, session, role redirect ve guard kontrolü | cookie/env/role contract drift ederse ops erişimi bozulur |
| Business/NAP kaynağı | `src/lib/site-info.ts` | footer, contact, JSON-LD, home map | footer/contact/JSON-LD kontrolü | ikinci NAP kaynağı açılırsa business drift oluşur |
| Site-level link sabitleri | `src/lib/site/links.ts` | CTA'lar, footer quick links, maps/social linkleri | footer/contact/home CTA kontrolü | component içine link gömmek drift üretir |
| Dokümantasyon süreç evi | `docs/WORKFLOW.md` | aktif docs ve görev akışları | docs güncelleme | teknik gerçeği workflow dosyasında sabitlemek rol karışıklığı üretir |

## 3) Route Omurgası

### Public canonical route seti

Canonical public set sayfa dosyaları ve `src/lib/route-content.generated.ts` üzerinden okunur:

- `/`
- `/kesfet`
- `/kesfet/[hub]`
- `/piercing`
- `/piercing/[hub]`
- `/galeri-tasarim`
- `/dovme-egitimi`
- `/artistler`
- `/artistler/[slug]`
- `/iletisim`
- `/sss`

### Internal veya SEO-dışı yüzeyler

- `/styleguide`: dahili kontrol yüzeyi (`src/app/styleguide/page.tsx`)
- `/ops`: TR-only operations namespace; locale subtree dışında yaşar ve public `next-intl` zincirine girmez (`src/app/ops/layout.tsx`, `src/middleware.ts`)
- `/ops/giris`: ops-local login yüzeyi; session varsa role bazlı home path'e redirect eder (`src/app/ops/giris/page.tsx`)
- `/ops/staff/randevular`: aylik takvim + secili gun operasyon yuzeyi; isletme bazli randevu yönetimi burada yapilir (`src/app/ops/staff/randevular/page.tsx`)
- `/ops/user/randevular`: kullanicinin kendi randevularini gordugu ve yeni kayit actigi yuzeydir (`src/app/ops/user/randevular/page.tsx`)
- Metadata route'ları: `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` (`src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/manifest.ts`)
- Middleware bypass yüzeyleri: `/ops`, `/_next`, `/api`, favicon, OG/Twitter image route'ları ve uzantılı dosyalar (`src/middleware.ts`)

### Aktif redirect'ler

Sadece şu redirect'ler tanımlıdır (`next.config.ts`):

- `/book` -> `/iletisim`
- `/explore` -> `/kesfet`
- `/profile` -> `/artistler`

Notlar:

- `/galeri` canonical route değildir; canonical route `/galeri-tasarim`dır.
- `/gallery` için redirect yoktur. `next.config.ts` içindeki `/gallery/:path*` kaydı redirect değil, header kuralıdır.

## 4) Public Page Contract Matrix

| Route | Kaynak page dosyası | Metadata kaynağı | Route-content bağımlılığı | I18n bağımlılığı | SEO notu | Smoke-check notu |
|---|---|---|---|---|---|---|
| `/` | `src/app/[locale]/(app)/page.tsx` | `getRouteContent("/")` | yüksek | `messages/*.json`, `reviews.*` | canonical `/`; home içinde maps/reviews URL ayrışması var | `/` ve `/en` aç; hero, hub kartları, map/review alanı kontrol et |
| `/kesfet` | `src/app/[locale]/(app)/kesfet/page.tsx` | `getRouteContent("/kesfet")` | yüksek | `messages/*.json` | canonical registry + hero OG image paterni | `/kesfet` ve bir hub chip linki kontrol et |
| `/kesfet/[hub]` | `src/app/[locale]/(app)/kesfet/[hub]/page.tsx` | `getRouteContent("/kesfet/${slug}")` | yüksek | `messages/*.json` + locale bazlı hub key'leri | slug ve canonical path birlikte doğru olmalı | ör. `/kesfet/minimal-fine-line-dovme` aç; hero, gallery, related carousel kontrol et |
| `/piercing` | `src/app/[locale]/(app)/piercing/page.tsx` | `getRouteContent("/piercing")` | yüksek | `messages/*.json` | landing metadata route-content'ten gelir | `/piercing` aç; featured carousel ve category grid kontrol et |
| `/piercing/[hub]` | `src/app/[locale]/(app)/piercing/[hub]/page.tsx` | `getRouteContent("/piercing/${slug}")` | yüksek | `messages/*.json` + locale bazlı piercing hub key'leri | canonical ve gallery CTA query paramı doğru kalmalı | ör. `/piercing/kulak` aç; CTA ve related category grid kontrol et |
| `/galeri-tasarim` | `src/app/[locale]/(app)/galeri-tasarim/page.tsx` | `getRouteContent("/galeri-tasarim")` | orta | `messages/*.json` | canonical path tek route; filtre `searchParams` ile çalışır | `/galeri-tasarim` ve `?hub=...` kontrol et |
| `/dovme-egitimi` | `src/app/[locale]/(app)/dovme-egitimi/page.tsx` | `getRouteContent("/dovme-egitimi")` | yüksek | `messages/*.json` | route ayrı sayfadır; hub canonical path ile karıştırılmaz | `/dovme-egitimi` aç; TR ve prefixli locale copy kontrol et |
| `/artistler` | `src/app/[locale]/(app)/artistler/page.tsx` | `getRouteContent("/artistler")` | yüksek | `messages/*.json` | artist kart listesi detail route'lara bağlanır | `/artistler` aç; iki artist kartı ve CTA'lar kontrol et |
| `/artistler/[slug]` | `src/app/[locale]/(app)/artistler/[slug]/page.tsx` | `getRouteContent("/artistler/${slug}")` | yüksek | `messages/*.json` + artist profile key'leri | statik slug seti iki öğeden oluşur | iki slug da aç; TR ve prefixli locale fallback davranışını kontrol et |
| `/iletisim` | `src/app/[locale]/(app)/iletisim/page.tsx` | `getRouteContent("/iletisim")` | yüksek | `messages/*.json` | contact metadata route-content'ten gelir, JSON-LD render edilir | `/iletisim` aç; NAP, maps ve CTA'ları kontrol et |
| `/sss` | `src/app/[locale]/(app)/sss/page.tsx` | `getRouteContent("/sss")` | meta için orta | `messages/*.json`, `resolveKbItems()` | FAQPage JSON-LD üretir | `/sss` aç; KB client ve schema-eligible FAQ akışını kontrol et |

## 5) Slug Ownership Matrix

| Alan | Sahip dosya | Ne üretir / doğrular | Tüketen yüzey | Not |
|---|---|---|---|---|
| Keşfet slug seti | `src/lib/hub/hubs.v1.ts` | hub slug, `canonicalPath`, tags | home, `/kesfet`, `/kesfet/[hub]`, gallery bağları | asıl sahip burasıdır |
| Piercing slug seti | `src/lib/route-content.generated.ts` + `src/app/[locale]/(app)/piercing/[hub]/page.tsx` | bilinen path ve statik param seti | `/piercing`, `/piercing/[hub]`, label/icon eşlemeleri | ayrı bir piercing master config yok |
| Artist slug seti | `src/app/[locale]/(app)/artistler/[slug]/page.tsx` | `ARTIST_SLUGS`, static params, artist info map | `/artistler`, detail route'lar | iki slug aktif: `halit-yalvac`, `mertcan-uludag` |
| Gallery normalize katmanı | `src/lib/gallery/manifest.v1.ts` | alias -> valid gallery hub param | `galeri-tasarim`, `HubGallery`, piercing gallery CTA | canonical slug ile gallery param birebir değildir |
| Piercing label/icon eşlemesi | `src/lib/piercing/piercing-labels.ts`, `src/lib/piercing/piercing-icons.ts` | path -> label/icon | `PiercingCategoryGrid` | UI lookup katmanıdır, slug sahibi değildir |

Piercing sahipliği notu:

- Repo içinde `src/lib/hub/hubs.v1.ts` benzeri tekil bir piercing master config yoktur.
- Bugünkü sahiplik şu kombinasyonla kurulur:
  - canonical piercing path'leri `data/route-content/enki-v1-sitemap-seo-template.csv` -> `scripts/generate-route-content.py` -> `src/lib/route-content.generated.ts`
  - static param ve detail route açılışı `src/app/[locale]/(app)/piercing/[hub]/page.tsx`
  - UI label/icon lookup `src/lib/piercing/piercing-labels.ts` ve `src/lib/piercing/piercing-icons.ts`
- Bu, repo gerçeğidir; tam merkezi slug kaynağı değildir.
- Bu alan bilinçli bir repo durumu ve aynı zamanda tasarım borcudur. AI ajanı piercing için `tek dosyada tüm sahiplik var` varsayımı yapmamalıdır.

## 6) I18N Contract Matrix

| Data source | Namespace | Load noktası | Merge noktası | Consumer örnekleri | Değişiklik etkisi |
|---|---|---|---|---|---|
| `messages/tr.json`, `messages/en.json`, `messages/sq.json`, `messages/sr.json` | genel UI copy | `src/i18n/request.ts` switch | `messages: { ...localeMessages, reviews: reviewsMessages }` | home, kesfet, footer, header, sss | yeni key eklenirse tüm locale seti ve build kontrol edilir |
| `src/content/enki/reviews.*.json` | `reviews.*` | `src/i18n/request.ts` switch | aynı merge objesi içinde `reviews` alanı | `src/components/google/google-reviews-section.tsx` | namespace dosyası veya import zinciri eksilirse runtime kırılır |
| `src/i18n/routing.ts` | locale config | `@/i18n/navigation`, app layout, middleware | merge yok; routing config | locale-aware linkler, locale prefix davranışı | locale değişirse middleware, layout ve smoke check etkilenir |
| `src/middleware.ts` | locale URL davranışı | request edge katmanı | merge yok | `/tr` canonicalizasyonu, prefixsiz `tr` rewrite | yanlış kural canonical URL ve 404 davranışını bozar |
| `src/app/[locale]/(app)/layout.tsx` | request locale + provider | app shell sarımı | `NextIntlClientProvider` | tüm client/server translation tüketimi | provider setup bozulursa tüm app translation zinciri etkilenir |

Ops notu:

- `/ops` namespace'i bu i18n contract'inin dışındadır.
- `src/app/ops/**` altında `@/i18n/navigation`, `useTranslations`, `getTranslations`, `NextIntlClientProvider`, `messages/*` ve `route-content` kullanılmamalıdır.
- Ops tarafında plain `next/link` ve plain `next/navigation` yaklaşımı kullanılır.
- `/ops` isteği middleware içinde bypass edildiği için varsayılan locale rewrite zincirine girmez (`src/middleware.ts`).
- Ops auth session cookie ve role lookup tamamen ops-local tutulur; public auth/i18n contract'ine bağlanmaz (`src/lib/ops/auth/*`).

## 6.1) Ops Route ve Auth Contract

- Ops route omurgası:
  - `/ops`
  - `/ops/giris`
  - `/ops/staff/*`
  - `/ops/user/form`
  - `/ops/user/*`
- `/ops` dashboard değildir; session yoksa `/ops/giris`, staff rolü varsa `/ops/staff/kasa`, yalnız `user` rolü varsa `/ops/user/randevular` yönlenir (`src/app/ops/page.tsx`, `src/lib/ops/auth/roles.ts`).
- Auth modeli ops-local email/password'tur (`src/app/ops/giris/actions.ts`, `src/lib/ops/auth/password.ts`).
- Session signed cookie ile tutulur (`src/lib/ops/auth/session.ts`).
- Role resolution DB tabanlıdır; `admin` veya `artist` varsa staff alanı, yalnız `user` varsa user alanı açılır (`src/lib/ops/auth/roles.ts`, `src/lib/ops/auth/users.ts`).
- Foundation tabloları:
  - `users`
  - `user_profiles`
  - `user_roles`
  - `audit_logs`
  - `tattoo_forms`
  - `consent_acceptances`
  - `appointments`
- User onboarding akışı `profil -> tattoo formu -> acik onay` omurgasıyla `/ops/user/*` altında çalışır (`src/app/ops/user/profil/page.tsx`, `src/app/ops/user/form/page.tsx`, `src/app/ops/user/actions.ts`).
- `tattoo_forms` snapshot mantığıyla tutulur; son aktif snapshot user workspace yüzeylerinde okunur (`src/db/schema/onboarding.ts`, `src/lib/ops/user-workspace.ts`).
- `consent_acceptances` checkbox ile açık kabul, sürüm ve zaman damgası kaydı tutar (`src/db/schema/onboarding.ts`, `src/lib/ops/user-workspace.ts`).
- `appointments` isletme bazlidir; `artist_id` yoktur, slot engine yoktur ve ayni tarih + ayni saat icin ikinci aktif `scheduled` kayit acilamaz (`src/db/schema/appointments.ts`, `src/lib/ops/appointments.ts`).
- `appointments.status` seti `scheduled`, `completed`, `cancelled`, `no_show` olarak sabittir (`src/db/schema/appointments.ts`).
- `appointments.source` seti `customer`, `admin`, `artist` olarak sabittir (`src/db/schema/appointments.ts`).
- Local Docker PostgreSQL + Drizzle dogrulamasinda preview portu olarak `3012` / `3013` tercih edilir; `3004` kullanilmaz (`docs/OPS.md`).

## 7) SEO, NAP ve Yapısal Veri Akışı

- Tek base URL kaynağı `SITE_URL`dır (`src/lib/site/base-url.ts`).
- Root metadata, icon, manifest ve themeColor `src/app/layout.tsx` içinde tanımlıdır.
- Sayfa bazlı metadata iyi örnekleri: `src/app/[locale]/(app)/kesfet/page.tsx`, `src/app/[locale]/(app)/artistler/[slug]/page.tsx`.
- Sayfa metadata'sı `getRouteContent(path)` ile üretilir; canonical, description ve robots buradan gelir.
- `NOINDEX` davranışı `hasNoIndex()` ile metadata ve sitemap filtrelerine uygulanır (`src/lib/route-content.ts`, `src/app/sitemap.ts`).
- Sitemap sadece `ROUTE_CONTENT` içinden üretilir; canonical veya path absolute URL'ye çevrilir (`src/app/sitemap.ts`).
- `robots.txt` tek sitemap referansını `SITE_URL` üzerinden verir (`src/app/robots.ts`).
- NAP ve contact/business linkleri `SITE_INFO` ve `src/lib/site/links.ts` üzerinden dağılır.
- `LocalBusinessJsonLd` bu verilerden `TattooParlor` + `WebSite` graph'ı üretir (`src/components/seo/local-business-jsonld.tsx`).
- `/ops` route'ları `route-content` ve sitemap hattına dahil değildir; metadata'sı `src/app/ops/layout.tsx` içinde ayrı tutulur.
- Ops DB foundation `src/db/schema/*.ts` + `src/db/migrations/*` + `drizzle.config.ts` ile tutulur; public SEO hattından ayrıdır.
- Ops auth env yüzeyi `DATABASE_URL` + `OPS_SESSION_SECRET` + bootstrap env'leri ile sınırlıdır (`.env.example`, `scripts/db/bootstrap-ops-user.mjs`).

## 8) Quick Impact Map

- Route değişirse: CSV -> generator -> generated route-content -> page metadata -> sitemap/robots
- Slug değişirse: slug owner -> route-content -> link tüketen UI -> smoke check
- Locale veya key değişirse: `messages/*` veya `src/content/**` -> `src/i18n/request.ts` -> build + locale smoke check
- NAP/link değişirse: `site-info` / `site/links` -> footer/contact/home/JSON-LD
- DB schema değişirse: `src/db/schema/*` -> `npm run db:generate` -> `src/db/migrations/*` -> migrate akışı
- Ops auth değişirse: `src/lib/ops/auth/*` -> `/ops/giris` -> `/ops`, `/ops/staff/*`, `/ops/user/*` guard ve redirect smoke check

## 9) Known Intentional Inconsistencies

- Home page kendi `GOOGLE_REVIEWS_URL` ve `GOOGLE_EMBED_SRC` sabitlerini taşır; site-level maps SSOT'u ayrı olarak `SITE_INFO` ve `src/lib/site/links.ts` içindedir (`src/app/[locale]/(app)/page.tsx`, `src/lib/site-info.ts`, `src/lib/site/links.ts`).
- Gallery hub param sistemi canonical hub slug setiyle birebir aynı değildir; alias normalize katmanı bilinçli olarak vardır (`src/lib/gallery/manifest.v1.ts`).
- Repo içinde `hreflang` üretimi görünmüyor; bu alan `UNKNOWN`dur.
- Prod host, reverse proxy ve Cloudflare davranışı repo içinden görülemez; bu alanlar `UNKNOWN`dur.

## 10) Failure Modes

| Failure mode | Ne olur | İlk bakılacak yer |
|---|---|---|
| Generator unutulur | route-content ile page metadata/sitemap drift eder | CSV, `scripts/generate-route-content.py`, `src/lib/route-content.generated.ts` |
| Slug drift olur | linkler, static params veya detail page açılışı bozulur | `hubs.v1.ts`, artist detail page, route-content registry |
| Messages drift olur | build kırılır veya bazı locale'lerde missing key oluşur | `messages/*.json`, `scripts/i18n/check-messages.mjs` |
| Reviews/content drift olur | `reviews.*` tüketen UI eksik içerik veya runtime hata verir | `src/content/enki/reviews.*.json`, `src/i18n/request.ts` |
| NAP drift olur | footer, contact ve JSON-LD farklı business bilgisi taşır | `src/lib/site-info.ts`, `src/lib/site/links.ts`, contact/footer/JSON-LD |
| Canonical set bozulur | yanlış route indexlenir veya sitemap dışına düşer | route-content CSV, generator, sitemap |
| DB schema drift olur | migration ile schema ayrışır; foundation kurulumu tutarsızlaşır | `src/db/schema/*`, `src/db/migrations/*`, `drizzle.config.ts` |
| Ops auth env veya role drift olur | login çalışmaz veya kullanıcı yanlış alana yönlenir | `.env.example`, `src/lib/ops/auth/*`, `src/app/ops/**` |

## 11) Anti-patternler

- İkinci route source-of-truth açma.
- `src/lib/route-content.generated.ts` dosyasını elle düzenleme.
- Route-content bypass ederek page içine sabit canonical/SEO metni yazma.
- İkinci NAP, maps veya business link kaynağı açma.
- Artifact veya generated dosyayı canonical source gibi kullanma.
- Repo dışı prod, proxy, Cloudflare veya host-level davranışı kesin hüküm gibi yazma.

## 12) UNKNOWN Sınırı

- Host-level `www` -> apex redirect zinciri `UNKNOWN`dur.
- Reverse proxy, Cloudflare ve VPS servis topolojisi `UNKNOWN`dur.
- Production env inventory tam listesi `UNKNOWN`dur.
