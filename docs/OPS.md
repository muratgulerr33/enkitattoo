# OPS

Bu dosya repo içinden doğrulanabilen runtime ve deploy hazırlık bilgisini tutar. Reverse proxy, Cloudflare ve VPS topolojisi burada varsayılmaz.

## 1) Repo İçinden Doğrulanan Runtime Yüzeyi

- Local dev: `npm run dev` -> port `3002` (`package.json`)
- Production start: `npm run start` -> port `3002` (`package.json`)
- Build: `npm run build`
- Ana kalite kapısı: `npm run check:all`
- I18n plugin girişi: `next.config.ts` -> `createNextIntlPlugin("./src/i18n/request.ts")`
- Middleware locale davranışı: `src/middleware.ts`
- `/ops` namespace'i middleware locale rewrite zincirinden bypass edilir ve locale'siz çalışır (`src/middleware.ts`, `src/app/ops/layout.tsx`)
- DB foundation: `src/db/*`, `drizzle.config.ts`, `DATABASE_URL`, `drizzle-orm`, `drizzle-kit`, `postgres`
- Ops auth: `src/lib/ops/auth/*`, `OPS_SESSION_SECRET`, `npm run ops:bootstrap-user`
- Local DB standardi: Docker PostgreSQL + Drizzle
- Base URL: `src/lib/site/base-url.ts`
- Metadata route'ları: `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/manifest.ts`
- Analytics yalnız `NEXT_PUBLIC_GA_ID` varsa aktif olur (`src/components/analytics/ga4.tsx`)

## 2) Build, Check ve Generator İlişkisi

- `src/lib/route-content.generated.ts`, `data/route-content/enki-v1-sitemap-seo-template.csv` kaynağından üretilir (`scripts/generate-route-content.py`).
- `src/db/migrations/*`, `src/db/schema/*` kaynağından `npm run db:generate` ile üretilir.
- Ops bootstrap user akışı `scripts/db/bootstrap-ops-user.mjs` üzerinden env ile çalışır.
- Route veya metadata seti değiştiyse build'den önce generator tekrar çalıştırılmalıdır.
- DB schema değiştiyse migration generate akışı ayrıca çalıştırılmalıdır.
- Ops auth env veya bootstrap akışı değiştiyse `/ops`, `/ops/giris`, `/ops/staff/*`, `/ops/user/*` smoke-check yapılmalıdır.
- Local DB doğrulamasında Docker PostgreSQL instance'ı üzerinde `DATABASE_URL` ile çalışmak standart kabul edilir.
- I18n message seti değiştiyse build'den önce `node scripts/i18n/check-messages.mjs` çalıştırmak mantıklıdır.
- `check:all` route-content generator'ı otomatik çalıştırmaz; generator gerekiyorsa ayrı çalıştırılır.
- `node scripts/i18n/check-messages.mjs` fiziksel olarak `docs/output/i18n-*.json` üretir; bu legacy artifact davranışıdır.

## 2.1) Ops Route, Auth ve DB Özeti

- Route omurgası:
  - `/ops`
  - `/ops/giris`
  - `/ops/staff/*`
  - `/ops/user/form`
  - `/ops/user/*`
- Ops panel TR-only'dir ve `next-intl/messages/*` zincirine girmez.
- Ops tarafında plain `next/link` ve plain `next/navigation` kullanılır.
- Auth modeli ops-local email/password'tur.
- Session signed cookie ile tutulur.
- Role resolution DB tabanlıdır.
- Foundation tabloları:
  - `users`
  - `user_profiles`
  - `user_roles`
  - `audit_logs`
  - `tattoo_forms`
  - `consent_acceptances`
  - `appointments`
  - `cash_entries`
- Appointment MVP isletme bazlidir; `appointments.artist_id` yoktur.
- Appointment status seti:
  - `scheduled`
  - `completed`
  - `cancelled`
  - `no_show`
- Appointment source seti:
  - `customer`
  - `admin`
  - `artist`
- `scheduled` durumundaki kayitlar icin ayni tarih + ayni saat conflict'i DB unique index + uygulama guard ile engellenir.
- `/ops/staff/randevular` aylik gorunum + gun detayi + create/status update yuzeyidir.
- `/ops/user/randevular` kullanicinin kendi randevularini gorme ve kendi adina randevu acma yuzeyidir.
- Cashbook MVP `cash_entries` uzerinden calisir; appointments ile zorunlu FK iliskisi yoktur.
- `cash_entries.entry_type` seti `income` / `expense` olarak tutulur.
- Tutar `amount_cents` alaninda pozitif integer olarak saklanir.
- Soft delete `deleted_at` + `deleted_by_user_id` ile uygulanir.
- `/ops/staff/kasa` hizli kayit + bugun toplam + tarih filtresi + admin manage yuzeyidir.
- Artist yalniz bugunun kasa akisini gorur ve kayit acar; gecmis edit/delete admin'e aciktir.
- Local sanity'de çakışmasız preview için `3012` / `3013` kullanılabilir; `3004` kullanılmaz.

## 3) Pre-deploy ve Minimum Temsilî Smoke-check Matrix

Bu matrix tam public route setinin birebir listesi değildir. Amaç, her kritik route ailesinden en az bir temsilî yol ile local repo-side doğrulama yapmaktır.

| Alan | Ne yapılır | Beklenti |
|---|---|---|
| Repo-side pre-deploy | `npm run lint`, `npm run check:all` | temel kalite kapıları geçer |
| Route-content değiştiyse | `python3 scripts/generate-route-content.py` | generated route-content beklenen farkı üretir |
| DB schema değiştiyse | `npm run db:generate` | migration SQL beklenen farkı üretir |
| Ops auth bootstrap gerekiyorsa | `npm run ops:bootstrap-user` | ilk ops kullanıcısı ve rolleri oluşur |
| I18n değiştiyse | `node scripts/i18n/check-messages.mjs` | missing key yok, locale seti tutarlı |
| Default locale smoke | `/`, `/kesfet`, `/piercing`, `/galeri-tasarim`, `/dovme-egitimi`, `/artistler`, `/iletisim`, `/sss` | prefixsiz `tr` çalışır |
| Ops bypass smoke | `/ops`, `/ops/giris`, `/ops/staff/kasa` | locale rewrite'a girmez; `src/app/ops/**` açılır |
| Ops auth guard smoke | `/ops`, `/ops/staff/*`, `/ops/user/*` | session ve role'e göre doğru redirect verir |
| `/tr` canonical check | `/tr`, `/tr/...` | prefikssiz canonical yola `308` döner |
| Prefixli locale smoke | `/en`, `/en/kesfet`, `/en/piercing` | 404 olmaz, message load kırılmaz |
| UI locale smoke | header/footer/nav/card alanları | bariz text taşması olmaz |
| Generator sonrası SEO smoke | ilgili route + `/sitemap.xml` + `/robots.txt` | canonical/noindex etkisi mantıklıdır |

## 4) Generator Sonrası Doğrulama

Generator çalıştıktan sonra en az şunlar kontrol edilir:

- `src/lib/route-content.generated.ts` içine beklenen path ve metadata geldi mi?
- İlgili route page'i `getRouteContent(path)` ile bu kaynağı gerçekten kullanıyor mu?
- `src/app/sitemap.ts` içinde noindex veya canonical etkisi mantıklı mı?
- Redirect veya internal route seti yanlışlıkla canonical listeye karıştı mı?

## 5) Repo İçindeki Operasyonel Girdiler

- Paket ve script yüzeyi: `package.json`
- Redirect ve i18n plugin: `next.config.ts`
- Locale rewrite/canonical davranışı: `src/middleware.ts`
- Ops-local route ve metadata yüzeyi: `src/app/ops/**`
- DB config, schema ve migration yüzeyi: `drizzle.config.ts`, `src/db/schema/*`, `src/db/migrations/*`, `src/db/index.ts`
- Ops auth/session/guard yüzeyi: `src/lib/ops/auth/*`, `src/app/ops/giris/actions.ts`, `scripts/db/bootstrap-ops-user.mjs`
- Base URL ve site-level SEO temeli: `src/lib/site/base-url.ts`
- Route-content kaynağı ve generator: `data/route-content/enki-v1-sitemap-seo-template.csv`, `scripts/generate-route-content.py`
- NAP ve business info: `src/lib/site-info.ts`, `src/lib/site/links.ts`

## 6) Repo İçinden Görülen Başlıca Riskler

- Generator unutulursa route-content ile page metadata drift eder.
- DB migration generate unutulursa schema ile migration drift eder.
- Ops auth env veya bootstrap unutulursa login çalışmaz.
- I18n key veya namespace eksilirse build veya runtime message erişimi kırılabilir.
- NAP veya maps link değişip JSON-LD / footer birlikte güncellenmezse business info drift eder.
- Artifact veya legacy output dosyası source-of-truth sanılırsa yanlış karar verilir.

## 7) UNKNOWN

Aşağıdaki alanlar repo içinden doğrulanamaz:

- VPS servis topolojisi
- systemd servis adları
- reverse proxy / Nginx davranışı
- Cloudflare davranışı
- host-level redirect zinciri
- production env inventory'nin tam listesi
