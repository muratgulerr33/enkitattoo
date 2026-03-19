# OPS

Bu dosya repo içinden doğrulanabilen çalışma runbook’unu tutar. Reverse proxy, Cloudflare ve production host topolojisi burada varsayılmaz.

Teknik route/schema/rol sözleşmesinin ana evi `docs/SSOT.md`’dir. Bu dosya komut, env, local DB, bootstrap ve smoke-check akışına odaklanır.

Current runtime ile planned roadmap burada da ayrıdır: staff visible top-level surfaces source-neutral tek işlem diliyle çalışır, unified staff day workspace, service-intake event’lerinden otomatik cashbook ve `serviceIntakeId` bazlı operasyon sözleşmesi + browser print + 1/2 copy akışı repo içine inmiştir. User/deeper runtime tarafında combined consent yaşayabilir; staff top-level surfaces bu dijital onay dilini visible badge/copy olarak taşımaz. Dijital imza / upload / PDF exporter repo içine inmediği sürece runtime sayılmaz.

## 1) Repo-İçi Runtime Özeti

- Local dev: `npm run dev` -> `3002`
- Production start: `npm run start` -> `3002`
- Build: `npm run build`
- Ana kalite kapısı: `npm run check:all`
- Route-content generator: `python3 scripts/generate-route-content.py`
- DB migration generate: `npm run db:generate`
- Ops bootstrap user: `npm run ops:bootstrap-user`
- Bugünkü ops runtime lock: user lane combined consent + staff top-level source-neutral tek visible işlem dili, unified staff day workspace, appointment/walk-in `service_intakes`, service-intake delta’larından beslenen otomatik kasa defteri ve staff operasyon sözleşmesi preview + browser print flow

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
| Ops auth | `/ops`, `/ops/giris`, `/ops/staff/randevular`, `/ops/user/randevular` | `/ops/giris` telefon veya e-posta + şifre ile giriş kabul eder; session ve role göre doğru redirect çalışır |
| Staff işlemler workspace | `/ops/staff/randevular` month root + selected day workspace | appointment create/edit/delete korunur, walk-in create/edit çalışır, `Alınan tutar` boş/0 kabul edilir, selected-day workspace root takvimin hemen altında inline/fold üstü okunur, visible source badge/selector görünmez, detail/edit ve müşteri detail `İşlem özeti` kontratı bozulmaz |
| Staff packet preview | `/ops/staff/belgeler/[serviceIntakeId]` | appointment ve walk-in detail içinden doğru `serviceIntakeId` ile açılır, tek sayfa A4 sözleşmesi görünür, legal maddeler continuous 1..7 numaralanır, yalnız gerekli alanlar basılır ve 1/2 kopya seçimi render sayısını değiştirir |
| Inline müşteri create | işlem create sheet içindeki `Yeni müşteri` akışı | redirect olmaz, `NEXT_REDIRECT` sızmaz, yeni müşteri seçili kalır, outer form bağlamı korunur |
| Unified day order | aynı gün ve saatte appointment + walk-in kaydı | sıra deterministic kalır; appointment önce, walk-in sonra görünür |
| Customer detail latest intake | yeni walk-in sonrası `/ops/staff/musteriler/[userId]` | source alanı göstermeden `İşlem özeti` doğru latest kaydı gösterir; `Profil durumu` görünmez ve not başlığı `Artist notu` kalır |
| Month root neutral occupancy | walk-in olan gün içeren ay görünümü | appointment-first teknik omurga korunur; visible takvimde source’a özel ikinci sinyal görünmez |
| Automated cashbook create | collected > 0 ile appointment veya walk-in create | aynı gün kasa defterinde `service_collection` income satırı oluşur |
| Automated cashbook delta | collected artır / azalt | artış yeni income, azalış yeni expense `service_adjustment` satırı üretir |
| Manual cash exception | `/ops/staff/kasa` manuel giriş formu | manuel gider / düzeltme kaydı hâlâ açılır; kasa yardımcı/son kontrol yüzeyi olarak kalır |
| System cash read-only | service-source kasa satırı | manage dialog görünmez, update/delete app-level olarak açık olmaz |
| Staff top-level polish | `/ops/staff/kasa`, `/ops/staff/musteriler`, `/ops/staff/profil` | mobile/desktop yatay overflow üretmez; müşteri arama ana akış, hızlı create secondary kalır ve kartlar `ad soyad -> telefon -> yaklaşan randevu` ritmiyle primary action gibi okunur, kartta e-posta görünmez ve boş durumda `Yaklaşan randevu yok` yazar; mobil ayarlar yüzeyi kısa ve bitmiş yardımcı yüzey gibi görünür, admin için artist yönetimi aynı sayfada sade kalır; kasa header ve defter satırları sakin görünür, visible ledger meta `işlem #...` veya `otomatik` göstermez |
| Ops money display | `/ops/staff/kasa`, `/ops/staff/raporlar`, `/ops/staff/musteriler/[userId]`, `/ops/staff/randevular`, `/ops/staff/belgeler/[serviceIntakeId]` | kullanıcıya görünen para alanları kuruşsuz hizalanır; input serialization helper’ları etkilenmez |
| Appointment delete | detail sheet içindeki `Sil` aksiyonu | app-level confirm açılır, SQL error yok, stale reopen veya stale summary kalmaz |
| Appointment delete guard | linked intake üzerinde aktif tahsilat izi olan appointment | delete bloklanır, önce kasa düzeltmesi gerektiğini anlatan kısa hata döner |
| Packet print chrome | packet preview route browser print | `Geri` / `Yazdır` / `1 kopya - 2 kopya` barı print’e girmez, seçilen sözleşme sayısı A4 portrait olarak ayrılır |
| Mobile ops safe-area | `/ops/staff/musteriler`, `/ops/staff/musteriler/[userId]`, `/ops/staff/kasa`, `/ops/staff/randevular`, `/ops/staff/profil`, `/ops/staff/belgeler/[serviceIntakeId]` | alt içerik fixed bottom nav veya screen edge altında kalmaz; son bloklar görünür ve scroll sonunda rahat ama şişmeyen clearance korunur |
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
- `artist.created`, `artist.updated`, `artist.status_updated` ve `password.changed` aynı mevcut audit helper üstünden yazılır.
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
- `middleware` -> `proxy` build warning’i current runtime’da çözülmüş varsayılmaz; `src/middleware.ts` locale rewrite/bypass/header zinciri ile `src/i18n/routing.ts` + `next-intl` entegrasyonu hassas olduğu için migration ertelenmiştir. Öncelik çalışan local/prod locale davranışını korumaktır.
- Bloklamayan follow-up notları ayrıdır: toast feedback sistemi bu runbook içinde current runtime tamamlanmış işi sayılmaz.

## 10) UNKNOWN

- VPS servis topolojisi
- systemd servis adları
- Reverse proxy / Nginx davranışı
- Cloudflare davranışı
- Production env inventory’nin tam listesi
