# Enki Tattoo Web

Bu repo Enki Tattoo’nun Next.js tabanlı public web yüzeyi ile `/ops` operasyon panelini birlikte taşır.

Bu `README` repo giriş kapısıdır. Doküman haritası `docs/README.md`, teknik kanonik sözleşme `docs/SSOT.md` içindedir.

## Hızlı Başlangıç

```bash
npm install
npm run dev
# -> http://localhost:3002

npm run build
npm run check:all
```

## Repo Özeti

- Framework: Next.js 16 App Router, React 19, TypeScript
- Public yüzey: `next-intl` ile çok dilli site (`tr`, `sq`, `sr`, `en`)
- Operasyon yüzeyi: locale ağacından ayrılan `/ops`
- Veri katmanı: PostgreSQL + Drizzle (`src/db/*`, `drizzle.config.ts`)
- Ops kimlik doğrulama: yerel e-posta/şifre + imzalı oturum çerezi
- Aktif ops omurgası: kullanıcı/profil/rol, dövme formu, açık onay, randevu, kasa, müşteri notu, audit kayıtları

## Yüzeyler

### Public

Canonical public route seti ve SEO sahipliği `docs/SSOT.md` içindedir. Public sayfalar locale ağacı altında çalışır; metadata ve sitemap hattı route-content üretim zincirinden beslenir.

### `/ops`

- `/ops` locale yönlendirme katmanından ayrıdır.
- Staff alanı `admin` ve `artist` rolleri için açılır.
- User alanı yalnız `user` rolü için açılır.
- Oturum yoksa giriş noktası `/ops/giris` olur.

Ops route, yetki, tablo ve audit sözleşmesi `docs/SSOT.md` içindedir. Local çalışma, bootstrap, smoke-check ve preview pratiği `docs/OPS.md` ile `docs/WORKFLOW.md` içindedir.

## Dokümanlar

- [docs/README.md](docs/README.md): doküman haritası ve okuma sırası
- [docs/SSOT.md](docs/SSOT.md): teknik gerçekler ve kanonik sözleşmeler
- [docs/UI-SYSTEM.md](docs/UI-SYSTEM.md): public ve `/ops` UI kontratları
- [docs/WORKFLOW.md](docs/WORKFLOW.md): çalışma biçimi ve kalite kapıları
- [docs/OPS.md](docs/OPS.md): repo-içi çalışma runbook’u ve smoke-check seti
