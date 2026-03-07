# OPS

Bu dosya repo içinden doğrulanabilen runtime ve deploy hazırlık bilgisini tutar. Reverse proxy, Cloudflare ve VPS topolojisi burada varsayılmaz.

## 1) Repo İçinden Doğrulanan Runtime Yüzeyi

- Local dev: `npm run dev` -> port `3002` (`package.json`)
- Production start: `npm run start` -> port `3002` (`package.json`)
- Build: `npm run build`
- Ana kalite kapısı: `npm run check:all`
- I18n plugin girişi: `next.config.ts` -> `createNextIntlPlugin("./src/i18n/request.ts")`
- Middleware locale davranışı: `src/middleware.ts`
- Base URL: `src/lib/site/base-url.ts`
- Metadata route'ları: `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/manifest.ts`
- Analytics yalnız `NEXT_PUBLIC_GA_ID` varsa aktif olur (`src/components/analytics/ga4.tsx`)

## 2) Build, Check ve Generator İlişkisi

- `src/lib/route-content.generated.ts`, `data/route-content/enki-v1-sitemap-seo-template.csv` kaynağından üretilir (`scripts/generate-route-content.py`).
- Route veya metadata seti değiştiyse build'den önce generator tekrar çalıştırılmalıdır.
- I18n message seti değiştiyse build'den önce `node scripts/i18n/check-messages.mjs` çalıştırmak mantıklıdır.
- `check:all` route-content generator'ı otomatik çalıştırmaz; generator gerekiyorsa ayrı çalıştırılır.
- `node scripts/i18n/check-messages.mjs` fiziksel olarak `docs/output/i18n-*.json` üretir; bu legacy artifact davranışıdır.

## 3) Pre-deploy ve Minimum Temsilî Smoke-check Matrix

Bu matrix tam public route setinin birebir listesi değildir. Amaç, her kritik route ailesinden en az bir temsilî yol ile local repo-side doğrulama yapmaktır.

| Alan | Ne yapılır | Beklenti |
|---|---|---|
| Repo-side pre-deploy | `npm run lint`, `npm run check:all` | temel kalite kapıları geçer |
| Route-content değiştiyse | `python3 scripts/generate-route-content.py` | generated route-content beklenen farkı üretir |
| I18n değiştiyse | `node scripts/i18n/check-messages.mjs` | missing key yok, locale seti tutarlı |
| Default locale smoke | `/`, `/kesfet`, `/piercing`, `/galeri-tasarim`, `/dovme-egitimi`, `/artistler`, `/iletisim`, `/sss` | prefixsiz `tr` çalışır |
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
- Base URL ve site-level SEO temeli: `src/lib/site/base-url.ts`
- Route-content kaynağı ve generator: `data/route-content/enki-v1-sitemap-seo-template.csv`, `scripts/generate-route-content.py`
- NAP ve business info: `src/lib/site-info.ts`, `src/lib/site/links.ts`

## 6) Repo İçinden Görülen Başlıca Riskler

- Generator unutulursa route-content ile page metadata drift eder.
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
