# 04 - Repo Hygiene

Rules for maintaining consistency and long-term sustainability.

## 1) Design/Token Discipline
- Use semantic tokens only:
  - `bg-background`, `text-foreground`, `border-border`, `bg-surface-1`, `bg-surface-2`, `ring-ring`.
- Do not use hard-coded palette classes:
  - `bg-white`, `text-black`, `bg-gray-*`, `text-zinc-*`, `border-gray-*`, `slate-*`, `neutral-*`, `stone-*`.
- Validation:
  - `npm run check:no-palette`
  - `npm run check:all`

## 2) Canonical Routes (IA)
- `/` — Ana Sayfa
- `/kesfet` — Keşfet
- `/kesfet/[hub]` — Hub detay
- `/piercing` — Piercing
- `/galeri-tasarim` — Galeri
- `/artistler` — Artistler
- `/iletisim` — İletişim

Legacy redirects:
- `/book` → `/iletisim`
- `/explore` → `/kesfet`
- `/profile` → `/artistler`

Route contract:
- `/galeri` 404 (pre-launch cleanup), canonical `/galeri-tasarim`

## 3) Component Placement
- `src/components/ui/`: shadcn primitives.
- `src/components/app/`: app-specific components.
- `src/components/legacy/`: historical/reference components (not for new public pages).
- `src/components/styleguide/`: styleguide-only components.

## 4) Server vs Client
- Default: Server Components.
- Use `"use client"` only where interaction/browser APIs are required.

## 5) Quality Gates
- `npm run lint`
- `npm run build`
- `npm run check:no-palette`
- `npm run check:all` before merge.

## 6) Canonical Docs
- Masterpack: `./00-masterpack.md`
- Design rules (source of truth): `./01-design-system-styleguide.md`
- Responsive checklist: `./02-responsive-checklist.md`
- Icons + safe-area: `./03-icons-and-safe-area.md`
- Ops: `./00-prod-vps-deploy.md`
