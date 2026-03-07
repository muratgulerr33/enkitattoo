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
- Metadata route'ları: `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`

## Dokümantasyon

- [docs/README.md](docs/README.md): docs haritası ve okuma sırası
- [docs/SSOT.md](docs/SSOT.md): routes, i18n, SEO, source-of-truth
- [docs/UI-SYSTEM.md](docs/UI-SYSTEM.md): UI kontratları
- [docs/WORKFLOW.md](docs/WORKFLOW.md): çalışma biçimi ve kalite kapıları
- [docs/OPS.md](docs/OPS.md): repo-side runtime ve deploy hazırlığı
