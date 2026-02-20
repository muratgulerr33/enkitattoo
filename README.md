# Enki Tattoo Web

Next.js tabanlı Enki Tattoo kurumsal / keşif sitesi. SEO ve dönüşüm odaklı, premium UX.

## Quick start

```bash
# Install
npm install

# Run dev
npm run dev
# → http://localhost:3000

# Build
npm run build

# Check (lint + build + no-palette guardrail)
npm run check:all
```

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **UI:** Tailwind v4, shadcn/ui (new-york, cssVariables, neutral), next-themes
- **Font:** Geist only
- **Styling:** Semantic tokens only (no raw palette classes); see [docs/01-Design rules.md](docs/01-Design%20rules.md)

## IA (canonical routes)

| Route        | Açıklama   |
|-------------|------------|
| `/`         | Ana sayfa  |
| `/kesfet`   | Keşfet (hub listesi) |
| `/kesfet/[hub]` | Hub detay |
| `/piercing` | Piercing  |
| `/galeri`   | Galeri    |
| `/artistler`| Artistler |
| `/iletisim` | İletişim  |

Eski route'lar yönlendirilir: `/book` → `/iletisim`, `/explore` → `/kesfet`, `/gallery` → `/galeri`, `/profile` → `/artistler`.

## Docs

- [01-Design rules.md](docs/01-Design%20rules.md) — Tasarım kuralları, semantic token
- [02-responsive-checklist.md](docs/02-responsive-checklist.md) — Responsive kurallar
- [03-timeline.md](docs/03-timeline.md) — Zaman tüneli
- [04-repo-hygiene.md](docs/04-repo-hygiene.md) — Repo kuralları, klasör yapısı
- [00-masterpack.md](docs/00-masterpack.md) — Proje özeti (masterpack)

## Scripts

| Script | Açıklama |
|--------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm run start` | Production sunucu |
| `npm run lint` | ESLint |
| `npm run check:no-palette` | `src/` içinde palette sınıfları (bg-/text-/border- gray,zinc vb.) aranır; bulunursa hata |
| `npm run check:all` | lint + build + check:no-palette |
