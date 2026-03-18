# OPS

Bu dosya repo içinden doğrulanabilen çalışma runbook’unu tutar. Reverse proxy, Cloudflare ve production host topolojisi burada varsayılmaz.

Teknik route/schema/rol sözleşmesinin ana evi `docs/SSOT.md`’dir. Bu dosya komut, env, local DB, bootstrap ve smoke-check akışına odaklanır.

Current runtime ile planned roadmap burada da ayrıdır: unified walk-in / service session workspace, cashbook automation ve document packet / signature akışları repo içine inmediği sürece smoke-check runtime’ı sayılmaz.

## 1) Repo-İçi Runtime Özeti

- Local dev: `npm run dev` -> `3002`
- Production start: `npm run start` -> `3002`
- Build: `npm run build`
- Ana kalite kapısı: `npm run check:all`
- Route-content generator: `python3 scripts/generate-route-content.py`
- DB migration generate: `npm run db:generate`
- Ops bootstrap user: `npm run ops:bootstrap-user`
- Bugünkü ops runtime lock: combined consent, appointment-first staff randevu V2, appointment-linked `service_intakes`, manuel kasa defteri

## 2) Env ve Girdi Yüzeyi

### Kanıtlı env yüzeyi

- `DATABASE_URL`
- `OPS_SESSION_SECRET`
- `OPS_BOOTSTRAP_EMAIL`
- `OPS_BOOTSTRAP_PASSWORD`
- `OPS_BOOTSTRAP_ROLES`
- `OPS_BOOTSTRAP_FULL_NAME`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GA_ID` yalnız analytics için opsiyoneldir

### Canonical dosyalar

- `package.json`
- `drizzle.config.ts`
- `.env.example`
- `scripts/db/bootstrap-ops-user.mjs`
- `src/db/index.ts`
- `src/lib/ops/auth/*`

## 3) Local DB Standardı

- Repo veri katmanı PostgreSQL + Drizzle üstünden çalışır.
- Local DB standardı Docker-backed PostgreSQL instance + Drizzle akışıdır.
- Repo Docker compose dosyası vermez; bağlantı `DATABASE_URL` ile sağlanır.
- `.env.example` canonical örnek olarak `postgresql://postgres:postgres@127.0.0.1:5432/enki_tattoo` kullanır.
- `drizzle.config.ts` fallback olarak aynı host/DB adını kullanır.
- Makineye özel `.env.local` port veya host override’ları çalışma kolaylığıdır; standart ilan edilmez.

### Önerilen local DB akışı

1. PostgreSQL instance’ını ayağa kaldır.
2. `DATABASE_URL` değerini ayarla.
3. Gerekirse `npm run db:migrate` çalıştır.
4. İlk ops hesabı gerekiyorsa `npm run ops:bootstrap-user` çalıştır.

## 4) Preview Standardı

- Script tabanlı default port `3002`’dir.
- İzole preview örneklerinde önce `3012`, gerekirse `3013` kullanılır.
- `3004` kullanılmaz.
- `next.config.ts` opsiyonel `NEXT_DIST_DIR` env override’ını destekler; bu değer local preview kolaylığıdır, canonical repo ayarı değildir.
- `NEXT_DIST_DIR=.next-...` türü makineye özel preview ayarları commit’e alınmaz.
- `next build` bazı makinelerde `tsconfig.json` içine `.next/dev/types/**/*.ts` include’ı ekleyebilir; canonical include current runtime’da `.next/types/**/*.ts` satırıdır. `.next/dev/types/**/*.ts` machine-local noise’tur ve commit’e alınmaz.
- `next-env.d.ts` yalnız gerçek source değişikliği varsa dokunulur; local type-path oynamaları canonical kabul edilmez.
- `docs/output/` ve `artifacts/` build/audit çıktısı olabilir; runtime source-of-truth değildir.

## 5) Generator ve Migration İlişkisi

- Route veya metadata seti değiştiyse build’den önce `python3 scripts/generate-route-content.py` çalıştırılır.
- DB schema değiştiyse `npm run db:generate` ile migration üretilir.
- `check:all` generator veya migration üretmez.
- `node scripts/i18n/check-messages.mjs` fiziksel olarak `docs/output/i18n-*.json` üretir; bu legacy output davranışıdır.

## 6) Minimum Smoke-check Matrix

| Alan | Ne yapılır | Beklenti |
|---|---|---|
| Repo-side kalite | `npm run lint`, `npm run build`, gerekirse `npm run check:all` | temel kapılar geçer |
| Route-content değiştiyse | generator sonrası ilgili route + `/sitemap.xml` + `/robots.txt` | canonical/noindex etkisi mantıklı kalır |
| Ops auth | `/ops`, `/ops/giris`, `/ops/staff/kasa`, `/ops/user/randevular` | session ve role göre doğru redirect |
| Staff randevular V2 | `/ops/staff/randevular` create/edit/delete zinciri | detail, edit ve müşteri detail `İşlem özeti` kontratı bozulmaz |
| Inline müşteri create | randevu create sheet içindeki `Yeni müşteri` akışı | redirect olmaz, `NEXT_REDIRECT` sızmaz, yeni müşteri seçili kalır, outer form bağlamı korunur |
| Appointment delete | detail sheet içindeki `Sil` aksiyonu | app-level confirm açılır, SQL error yok, stale reopen veya stale summary kalmaz |
| Locale bypass | `/ops` ailesi | locale rewrite katmanına girmez |
| Default locale | `/`, `/kesfet`, `/piercing`, `/galeri-tasarim`, `/artistler`, `/iletisim` | prefixsiz `tr` açılır |
| Prefixli locale | `/en`, `/en/kesfet`, `/en/piercing` | 404 olmaz, message load kırılmaz |
| UI copy | giriş, bottom nav, başlık alanları | bariz iç sistem dili veya kırpılma kalmaz |

## 7) Audit Doğrulama Temeli

Audit sözleşmesinin teknik ana evi `docs/SSOT.md`’dir. Repo-içi doğrulama için minimum checklist:

- Schema: `src/db/schema/audit-logs.ts`
- Migration: `src/db/migrations/0000_init_ops_foundation.sql`
- Runtime helper: `src/lib/ops/audit.ts`
- Auth login/logout: `src/app/ops/giris/actions.ts`, `src/app/ops/cikis/route.ts`
- Mutasyon emitters: `src/lib/ops/user-workspace.ts`, `src/lib/ops/appointments.ts`, `src/lib/ops/cashbook.ts`, `src/lib/ops/customers.ts`

Repo gerçeği:

- Audit için yeni ayrı migration açılmamıştır.
- Login/logout kaydı best-effort çalışır.
- Payload hafif tutulur.
- Hassas veri loglanmaz.

## 8) Ops Bootstrap Notu

`npm run ops:bootstrap-user` şunları bekler:

- `DATABASE_URL`
- `OPS_SESSION_SECRET`
- `OPS_BOOTSTRAP_EMAIL`
- `OPS_BOOTSTRAP_PASSWORD`

Script davranışı:

- Kullanıcıyı e-posta üzerinden upsert eder.
- Şifre hash’ini yeniler.
- Rolleri silip yeniden yazar.
- `FULL_NAME` varsa `user_profiles` içine işler.

## 9) Repo-İçi Riskler

- Generator unutulursa metadata ve sitemap drift eder.
- Migration generate unutulursa schema ile migration ayrışır.
- Bootstrap/env eksik kalırsa ops login çalışmaz.
- Ops copy ve shell polish borçları ayrı bir ürün kalitesi konusu olarak açık kalır; bu dosya bunları çözülmüş varsaymaz.

## 10) UNKNOWN

- VPS servis topolojisi
- systemd servis adları
- Reverse proxy / Nginx davranışı
- Cloudflare davranışı
- Production env inventory’nin tam listesi
