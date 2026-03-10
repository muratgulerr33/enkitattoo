# Enki Tattoo Web

Enki Tattoo'nun Next.js tabanli kurumsal ve kesif sitesi.

## Hızlı Başlangıç

```bash
npm install
npm run dev
# -> http://localhost:3002

npm run build
npm run check:all
```

## Kısa Özet

- Framework: Next.js 16 App Router, React 19, TypeScript
- I18n: `next-intl` (`tr`, `sq`, `sr`, `en`)
- DB foundation: PostgreSQL + Drizzle ORM (`src/db/*`, `drizzle.config.ts`)
- Ops auth: ops-local email/password + signed session cookie (`src/lib/ops/auth/*`)
- Ops onboarding + operasyon MVP: `tattoo_forms`, `consent_acceptances`, `appointments`, `cash_entries`, `customer_notes`
- Local DB standardi: Docker PostgreSQL + Drizzle migration akisi
- UI: Tailwind v4, Radix tabanlı componentler, `next-themes`
- Analytics: `NEXT_PUBLIC_GA_ID` varsa GA4 aktif

Bağlam almak için önce `docs/README.md`, sonra `docs/SSOT.md` okunur. Çalışma sırası için `docs/WORKFLOW.md` kullanılır.

## Public Route Seti

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

Aktif redirect'ler: `/book` -> `/iletisim`, `/explore` -> `/kesfet`, `/profile` -> `/artistler` (`next.config.ts`).

## Dahili Yüzeyler

- `/styleguide`: dahili kontrol yüzeyi; canonical public route setinin parçası değildir.
- `/ops`: TR-only operations namespace; public locale subtree ve i18n zincirinden ayrıdır.
- Metadata route'ları: `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`

## Ops Route Omurgasi

- `/ops`
- `/ops/giris`
- `/ops/staff/*`
- `/ops/staff/musteriler`
- `/ops/staff/musteriler/[userId]`
- `/ops/user/form`
- `/ops/user/*`

Randevu notu:

- Isletme bazli randevu modeli kullanilir.
- `appointments.artist_id` yoktur.
- Status seti: `scheduled`, `completed`, `cancelled`, `no_show`
- Source seti: `customer`, `admin`, `artist`
- Slot engine yoktur.
- Ayni tarih + ayni saat icin ikinci `scheduled` kayit acilamaz.
- Local preview icin `3004` kullanilmaz; `3012` / `3013` tercih edilir.

Kasa notu:

- `cash_entries` randevudan bagimsizdir; zorunlu appointment FK yoktur.
- `cash_entry_type` seti `income` / `expense` olarak sabittir.
- `amount_cents` pozitif integer olarak saklanir.
- Soft delete alanlari `deleted_at` ve `deleted_by_user_id` uzerinden tutulur.
- Kasa quick-entry mantiginda calisir.
- Admin gecmis kaydi duzenler ve soft delete yapar.
- Artist yalniz bugunun kasasina kayit acar; gecmis edit/delete yapmaz.

Musteri workspace notu:

- Staff musteri yuzeyi `/ops/staff/musteriler` ve `/ops/staff/musteriler/[userId]` route'larinda calisir.
- Admin ve artist musteri liste/detay yuzeylerini gorebilir.
- Musteri listesi yalniz `user` rolundeki hesaplari gosterir; staff-only hesaplar listeye dahil edilmez.
- Liste isim, telefon ve e-posta uzerinden arama yapar.
- Detay yuzeyi profil, form durumu, consent durumu, randevu ozeti ve tek guncel staff notunu bir arada gosterir.
- `customer_notes` staff-owned tek not mantigi kullanir; `user_id` unique kalir ve admin ile artist notu kaydedebilir veya bos birakarak temizleyebilir.

## Dokümantasyon

- [docs/README.md](docs/README.md): docs haritası ve okuma sırası
- [docs/SSOT.md](docs/SSOT.md): routes, i18n, SEO, source-of-truth
- [docs/UI-SYSTEM.md](docs/UI-SYSTEM.md): UI kontratları
- [docs/WORKFLOW.md](docs/WORKFLOW.md): çalışma biçimi ve kalite kapıları
- [docs/OPS.md](docs/OPS.md): repo-side runtime ve deploy hazırlığı
