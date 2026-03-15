# SSOT

Bu dosya repo içindeki teknik gerçeklerin ana evidir. Route, i18n, SEO, `/ops` sınırı, auth/rol akışı, tablo omurgası ve audit sözleşmesi burada tutulur.

Repo kararı sırası:

1. Canlı source code, schema, action ve route davranışı
2. Aktif dokümanlar
3. İlgili commit zinciri bağlamı

## 1) Kapsam ve Doküman Rolleri

- `README.md`: repo giriş kapısı
- `docs/README.md`: doküman haritası
- `docs/SSOT.md`: teknik kanonik sözleşme
- `docs/UI-SYSTEM.md`: yaşayan UI kontratları
- `docs/WORKFLOW.md`: çalışma biçimi ve kalite kapıları
- `docs/OPS.md`: repo-içi çalışma runbook’u ve smoke-check seti

Teknik bir bilgi ikinci kez yazılacaksa kısa referans verilir; asıl evi taşınmaz.

## 2) Kısa Runtime ve Canonical Kaynaklar

- Framework: Next.js 16 App Router, React 19, TypeScript (`package.json`)
- Public i18n: `next-intl` (`src/i18n/routing.ts`, `src/i18n/request.ts`)
- Veri katmanı: PostgreSQL + Drizzle (`src/db/*`, `drizzle.config.ts`)
- Ops auth: yerel e-posta/şifre + imzalı oturum çerezi (`src/lib/ops/auth/*`, `src/app/ops/giris/actions.ts`)
- Site URL kaynağı: `src/lib/site/base-url.ts`
- Route-content üretimi: `data/route-content/enki-v1-sitemap-seo-template.csv` -> `scripts/generate-route-content.py` -> `src/lib/route-content.generated.ts`
- Dev/start portu: `3002` (`package.json`)

### Canonical kaynak matrisi

| Konu | Canonical dosya | Tüketen yüzey |
|---|---|---|
| Public route ve SEO registry | `data/route-content/enki-v1-sitemap-seo-template.csv` | metadata, sitemap, `src/lib/route-content.generated.ts` |
| Keşfet hub slug seti | `src/lib/hub/hubs.v1.ts` | home, `/kesfet`, `/kesfet/[hub]`, galeri bağlantıları |
| Galeri normalize katmanı | `src/lib/gallery/manifest.v1.ts` | `/galeri-tasarim`, hub-gallery bağlantıları |
| Locale yönlendirme | `src/i18n/routing.ts` | `src/middleware.ts`, locale-aware navigation |
| Mesaj yükleme zinciri | `src/i18n/request.ts` | `NextIntlClientProvider`, `useTranslations`, `getTranslations` |
| Ops auth/session sözleşmesi | `src/lib/ops/auth/*.ts` | `src/app/ops/**`, bootstrap script |
| Ops tablo sözleşmesi | `src/db/schema/*.ts` | `src/db/migrations/*`, `src/db/index.ts` |
| İşletme/NAP kaynağı | `src/lib/site-info.ts`, `src/lib/site/links.ts` | footer, iletişim, JSON-LD |

## 3) Route Omurgası

### Public canonical route seti

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

### Dahili ve SEO-dışı yüzeyler

- `/styleguide`: dahili kontrol yüzeyi
- `/ops`: operasyon namespace’i; locale ağacının dışındadır
- `/ops/giris`
- `/ops/staff/*`
- `/ops/user/*`
- `/ops/user/onaylar`
- `/robots.txt`
- `/sitemap.xml`
- `/manifest.webmanifest`

### Aktif redirect’ler

Sadece şu redirect’ler tanımlıdır (`next.config.ts`):

- `/book` -> `/iletisim`
- `/explore` -> `/kesfet`
- `/profile` -> `/artistler`

Notlar:

- `/galeri` canonical route değildir; canonical route `/galeri-tasarim`dır.
- `/gallery` için redirect yoktur.

## 4) Public Locale ve SEO Sözleşmesi

- Varsayılan locale `tr`’dir; prefixsiz public istekler middleware içinde `tr`’ye rewrite edilir (`src/middleware.ts`).
- `/tr` ve `/tr/...` canonical public yola `308` ile döner (`src/middleware.ts`).
- Geçerli locale seti `tr`, `sq`, `sr`, `en` ile sınırlıdır (`src/i18n/routing.ts`).
- Public sayfa metadata’sı `getRouteContent(path)` ile üretilir (`src/lib/route-content.ts`).
- Sitemap yalnız route-content registry içinden üretilir (`src/app/sitemap.ts`).
- `NOINDEX` davranışı route-content tabanlıdır (`src/lib/route-content.ts`, `src/app/sitemap.ts`).
- NAP ve business linkleri component içine gömülmez; `src/lib/site-info.ts` ve `src/lib/site/links.ts` kullanılır.

## 5) `/ops` Ayrımı ve Auth Sözleşmesi

- `/ops` istekleri middleware locale rewrite katmanından bypass edilir (`src/middleware.ts`).
- `/ops` metadata’sı public metadata hattından ayrıdır (`src/app/ops/layout.tsx`).
- Ops tarafı `next-intl` mesaj zincirine bağlı değildir; plain `next/link` ve plain `next/navigation` yaklaşımı kullanılır.
- Giriş modeli yerel e-posta/şifre akışıdır (`src/app/ops/giris/actions.ts`, `src/lib/ops/auth/password.ts`).
- `/ops/giris` aynı zamanda minimum müşteri hesap kaydı girişini taşır; başarılı kayıt aktif `user` rolü üretir ve `Onaylar` alanına yönlenir (`src/app/ops/giris/page.tsx`, `src/app/ops/giris/actions.ts`, `src/lib/ops/customers.ts`).
- Oturum `enki_ops_session` adlı imzalı çerez ile `/ops` path’inde tutulur (`src/lib/ops/auth/constants.ts`, `src/lib/ops/auth/session.ts`).
- `OPS_SESSION_SECRET` en az 32 karakter olmalıdır (`src/lib/ops/auth/session.ts`).
- `DATABASE_URL` ve `OPS_SESSION_SECRET` yoksa ops auth hazır kabul edilmez (`src/lib/ops/auth/session.ts`, `src/db/index.ts`).

### Rol çözümü

- Staff alanı: `admin`, `artist`
- User alanı: yalnız `user`
- `/ops` dashboard değildir; session yoksa `/ops/giris`, staff rolü varsa `/ops/staff/kasa`, yalnız `user` rolü varsa `/ops/user/onaylar` yönlenir (`src/app/ops/page.tsx`, `src/lib/ops/auth/roles.ts`).

## 6) Ops Feature Omurgası

### Temel tablolar

- `users`
- `user_profiles`
- `user_roles`
- `tattoo_forms`
- `consent_acceptances`
- `appointments`
- `cash_entries`
- `customer_notes`
- `audit_logs`

### User workspace

- `/ops/user/onaylar` `Onaylar` bilgi merkezidir; belge bazlı hesap durumu read-only gösterilir, fakat checkbox submit/save bu sürümde user surface’e bağlı değildir.
- `/ops/user/profil` profil bilgilerini `users` + `user_profiles` üzerinde günceller.
- `/ops/user/form` dövme formu snapshot mantığı ile çalışır; her kayıt yeni sürüm üretir (`src/lib/ops/user-workspace.ts`).
- Onay kayıtları `consent_acceptances` tablosunda belge tipi + sürüm bazında tekilleşir.
- Güncel dövme onayı sürümü `2026-03-v1` olarak sabittir (`src/lib/ops/user-workspace.ts`).
- User workspace next-step ve randevu readiness mantığı profil + dövme formu üzerinden çalışır; `Onaylar` user lane içinde ayrı top-level hedef olarak kalır (`src/lib/ops/user-workspace.ts`, `src/app/ops/user/randevular/page.tsx`).
- Tek checkbox onay submit/save, `Onaylar` kaydının hesaba yazılması, admin müşteri detayında genişletilmiş `Onaylar` görünürlüğü ve legal markdown içerik binding’i sonraki PR kapsamıdır.

### Appointments

- Randevu modeli işletme bazlıdır; `appointments.artist_id` yoktur (`src/db/schema/appointments.ts`).
- Teknik randevu modeli tek saatlidir; payload yalnız `appointmentDate` + `appointmentTime` taşır. Başlangıç/bitiş alanı ve süre mantığı yoktur (`src/app/ops/randevular/actions.ts`, `src/lib/ops/appointments.ts`).
- Status seti: `scheduled`, `completed`, `cancelled`, `no_show`
- Source seti: `customer`, `admin`, `artist`
- Slot motoru yoktur.
- Aynı tarih + aynı saat için ikinci aktif `scheduled` kayıt açılamaz; hem partial unique index hem uygulama guard’ı vardır (`src/db/schema/appointments.ts`, `src/lib/ops/appointments.ts`).
- `createStaffAppointmentAction` staff guard’ı ile korunur; bu akış hem `admin` hem `artist` için açıktır (`src/app/ops/randevular/actions.ts`, `src/lib/ops/auth/guards.ts`).
- Staff create sırasında `source`, rol bazında `admin` veya `artist` olarak seçilir (`src/lib/ops/appointments.ts`).
- Staff appointments V2 görünür akışı month-first root -> day sheet -> detail sheet -> create/edit sheet zinciridir; month cell içinde exact count yerine decoration tabanlı occupancy kullanılır. UI ritmi `docs/UI-SYSTEM.md` içinde yaşar (`src/app/ops/staff/randevular/page.tsx`, `src/components/ops/ops-staff-appointments-workspace.tsx`).
- Repo içinde admin’e özel create engeli görünmez. Canlı ortamda farklı bir admin create davranışı raporlanıyorsa, bu repo içinden doğrulanamaz ve `UNKNOWN` kabul edilir.

### Cashbook

- `cash_entries` randevudan bağımsızdır; zorunlu appointment FK yoktur (`src/db/schema/cashbook.ts`).
- `entry_type` seti `income` / `expense` ile sınırlıdır.
- `amount_cents` pozitif integer olarak saklanır.
- Staff kasa yüzeyi hızlı kayıt + defter mantığıyla çalışır; ana akış yön seçimi, kısa preset etiket, tutar ve kayıt submit zinciridir (`src/app/ops/staff/kasa/page.tsx`, `src/components/ops/ops-cash-entry-form.tsx`).
- Kasa presetleri UI seviyesindedir; mevcut payload içinde `note` alanını hızlandırır, schema veya action contract genişletmez (`src/lib/ops/cashbook-copy.ts`, `src/app/ops/kasa/actions.ts`).
- Soft delete alanları `deleted_at` ve `deleted_by_user_id`’dir.
- Artist yalnız bugünün kasasına kayıt açabilir.
- Geçmiş kayıt düzenleme ve soft delete yalnız admin’e açıktır (`src/lib/ops/cashbook.ts`, `src/app/ops/kasa/actions.ts`).

### Customer workspace

- Staff müşteri listesi ve detay yüzeyleri `/ops/staff/musteriler` ailesinde çalışır.
- Staff hızlı müşteri oluşturma akışı `users` + `user_profiles` + `user_roles` üzerinde aktif `user` hesabı açar; bu kayıt staff müşteri listesi ve staff randevu müşteri seçeneklerine dahil olur (`src/app/ops/musteriler/actions.ts`, `src/lib/ops/customers.ts`, `src/lib/ops/appointments.ts`).
- Liste yalnız `user` rolündeki aktif hesapları gösterir; staff-only hesaplar listeye dahil edilmez (`src/lib/ops/customers.ts`).
- Liste araması `full_name`, `display_name`, `phone`, `email` alanları üzerinde çalışır.
- Detay yüzeyi profil, form, onay durumu, yaklaşan/geçmiş randevular ve tek güncel staff notunu birlikte gösterir.
- `customer_notes.user_id` unique kalır; not upsert edilir, boş not gönderilirse kayıt temizlenir (`src/app/ops/musteriler/actions.ts`, `src/lib/ops/customers.ts`).

## 7) Audit Foundation

- `audit_logs` tablosu ilk ops foundation migration’ında açılmıştır (`src/db/migrations/0000_init_ops_foundation.sql`).
- Audit kullanımı için ayrı yeni migration açılmamıştır; runtime yazımı mevcut tablo üstündedir (`src/db/schema/audit-logs.ts`, `src/lib/ops/audit.ts`).
- Kritik mutasyonlar helper üzerinden hafif payload ile kayıt üretir.

### Kanıtlı action seti

- `profile.updated`
- `tattoo_form.saved`
- `tattoo_form.submitted`
- `consent.accepted`
- `appointment.created`
- `appointment.status_updated`
- `cash_entry.created`
- `cash_entry.updated`
- `cash_entry.soft_deleted`
- `customer_note.saved`
- `ops_auth.logged_in`
- `ops_auth.logged_out`

### Audit notları

- Login/logout kaydı best-effort tutulur; auth akışını bozmaz (`src/app/ops/giris/actions.ts`, `src/app/ops/cikis/route.ts`).
- Payload hafif tutulur; örnek olarak yalnız değişen alanlar, kaynak, tarih/saat, not varlığı gibi özet bilgiler yazılır.
- Parola, hash, session secret ve benzeri hassas veriler audit payload’ına yazılmaz.

## 8) Değişiklik Etki Haritası

- Public route değişirse: CSV -> generator -> route-content -> metadata -> sitemap
- Locale veya mesaj değişirse: `messages/*` veya `src/content/**` -> `src/i18n/request.ts` -> public build ve locale smoke-check
- Ops auth değişirse: `src/lib/ops/auth/*` -> `/ops/giris` -> `/ops`, `/ops/staff/*`, `/ops/user/*`
- Schema değişirse: `src/db/schema/*` -> `npm run db:generate` -> `src/db/migrations/*`
- NAP/link değişirse: `site-info` / `site/links` -> footer, iletişim, JSON-LD

## 9) Bilinen Repo Gerçekleri ve Sınırlar

- Piercing için keşfet tarafındaki gibi tekil bir master slug dosyası yoktur; sahiplik route-content, route dosyası ve UI lookup katmanı arasında dağılmıştır.
- Home page kendi review/maps sabitlerini ayrıca taşır; site-level link kaynağıyla birebir birleşmiş değildir.
- `/ops` route’ları route-content ve sitemap hattına dahil değildir.

## 10) UNKNOWN

- Host-level `www`/apex redirect zinciri `UNKNOWN`dur.
- Reverse proxy, Cloudflare ve production host topolojisi `UNKNOWN`dur.
- Canlı ortam env envanterinin tam listesi `UNKNOWN`dur.
- Repo dışı görsel render bulguları, örneğin “Türkçe karakterler ekranda bozuluyor” raporu, repo içinden doğrudan doğrulanamaz; kaynak copy tek başına bu görsel sonucu kanıtlamaz.
