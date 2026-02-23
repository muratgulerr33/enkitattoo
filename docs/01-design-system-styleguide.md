# 01 - Design System Style Guide

## 0) TL;DR — LOCKS (Source of Truth)
- Header architecture is locked:
  - Mobile `<xl`: fixed 2-tier header (`top app bar + tab bar`), no bottom nav.
  - Desktop `xl+`: desktop header visible, mobile header hidden.
- Header motion is locked:
  - `translate3d` + `requestAnimationFrame` + passive scroll.
  - No heavy scroll-time React state updates.
  - `prefers-reduced-motion` disables hide/show animation.
- Brand lockup is locked:
  - Mobile top bar brand text must be single-line exact `Enki Tattoo` (no wrap).
- Responsive grid contract is locked:
  - Card grids progress `2 → 3 → 4` columns, 4 columns only at `xl`.
- V1 content contract is locked:
  - Home/Galeri card titles are single-line truncate.
  - Galeri filters only `Tüm stiller` + `Tüm temalar`; `Tüm artistler` is removed.
  - Artistler page uses 3 profile cards including `Halit Yalvaç` dataset.
- Theme contract is locked:
  - Default `system`, user override (`light/dark`), persistence, hydration guard.
- Icon contract is locked:
  - Source: `src/assets/icons/nandd/` + wrappers in `src/components/icons/nandd.tsx`.
  - Size rule: `20 / 22 / 24`; icon-only controls min `44x44`.
  - Safe-area required for header/drawer/fab.
  - Bottom icon bar is explicitly out of scope; icons are distributed to relevant UI points.

## 1) References (Docs)
- Ops: `./00-prod-vps-deploy.md`
- Design system + layout + header rules (canonical): (this doc)
- Icons + safe-area rules: `./03-icons-and-safe-area.md`
- Icon cherry-pick manifest: `./ICON-CHERRY-PICK.md`

## 2) Implementation Pointers (Code Map)
- Mobile header (2-tier + brand lockup): `src/components/app/mobile-header.tsx`
- Header hide/show hook: `src/lib/ui/use-hide-header-on-scroll.ts`
- Tokens/typography/responsive utilities: `src/app/globals.css`
- Theme provider + toggle: `src/components/theme-provider.tsx`, `src/components/mode-toggle.tsx`
- Icons wrappers/assets: `src/components/icons/nandd.tsx`, `src/assets/icons/nandd/`
- Link constants: `src/lib/site/links.ts`
- Contact/social distribution: `src/app/(app)/iletisim/page.tsx`
- Footer social row: `src/components/app/app-footer.tsx`
- Galeri filters + cards: `src/app/(app)/galeri/galeri-filters.tsx`, `src/app/(app)/galeri/page.tsx`
- Home card truncation: `src/app/(app)/page.tsx`
- Artistler V1 cards: `src/app/(app)/artistler/page.tsx`

## 3) Quality Gates (Mandatory)
- Commands:
  - `npm run lint`
  - `npm run build`
- Manual smoke checklist:
  - `/styleguide` in light / dark / system.
  - Breakpoint visual check: `390 / 430 / 768 / 1024 / 1280`.
  - Mobile header hide/show: scroll down hides, scroll up reveals.
  - Safe-area checks: header top, drawer left/right, FAB bottom.
  - Card title truncate checks: home + galeri.
  - Galeri filters must show only 2 selects.

## 4) Hard Rules (No hard-coded colors)
- Hard-coded palette classes are not allowed in app UI:
  - Examples: `bg-white`, `text-black`, `text-zinc-*`, `border-gray-*`, `slate-*`, `neutral-*`, `stone-*`.
- Use semantic tokens only:
  - `bg-background`, `text-foreground`, `border-border`, `bg-surface-1`, `bg-surface-2`, `ring-ring`.
- Validation:
  - `npm run check:no-palette`
  - `npm run check:all`

## 5) Token Mapping Appendix (`@theme inline`)
- Tailwind semantic colors must be mapped to CSS variables in `src/app/globals.css`.
- Core mapping contract:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface-1: var(--surface-1);
  --color-surface-2: var(--surface-2);
  --color-border: var(--border);
  --color-ring: var(--ring);
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-card: var(--card);
  --color-popover: var(--popover);
}
```

## 6) Baseline OKLCH Presets (Light/Dark)
- Baseline palette lives in `src/app/globals.css` (`:root` and `.dark`).
- Light baseline intent:
  - neutral/premium surface stack with paper-like reading comfort
  - avoid harsh pure-white visual glare
- Dark baseline intent:
  - preserve same semantic hierarchy as light
  - maintain readable contrast with muted layers
- When updating presets:
  - keep semantic token names unchanged
  - update only values under `:root` / `.dark`
  - verify `/styleguide` in light/dark/system

## 7) Theme storageKey (LOCK: `enki-theme`)
- Theme persistence key is locked to: `enki-theme`.
- Location:
  - `src/components/theme-provider.tsx`
  - root layout integration in `src/app/layout.tsx`
- Do not introduce additional theme keys for the same surface.

## Decisions
- Base palette: **Zinc** (default). Reason: neutral, premium, and brand-safe for tattoo studio visuals.
- Theme behavior follows shadcn v4 + next-themes with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, and `disableTransitionOnChange`.
- `typo-*` is canonical. Legacy `t-*` utilities are kept only as visual aliases for backwards compatibility.

## Token Glossary
- `background`: main page canvas.
- `foreground`: primary text color.
- `card` / `popover`: elevated surfaces.
- `primary`: main action color.
- `secondary`: supporting surface/action color.
- `muted` / `muted-foreground`: low emphasis backgrounds/text.
- `accent`: hover/highlight treatment.
- `destructive`: destructive actions and alerts.
- `border`: default border color.
- `input`: input border/background support token.
- `ring`: focus ring token.
- `surface-1` / `surface-2`: compatibility surface steps used by existing pages.
- `overlay` / `overlay-strong`: alpha overlays for dialogs/sheets.

## Typography Scale (`typo-*`)
- `typo-h1`, `typo-h2`, `typo-h3`, `typo-h4`
- `typo-lead`
- `typo-p`
- `typo-list`
- `typo-link`
- `typo-blockquote`
- `typo-code`
- `typo-table`
- `typo-small`, `typo-muted`

### Typography Ramp (2026-native)
- `typo-page-title` / `typo-h1`:
  - Mobile: `36px / 40px / -0.025em` tracking
  - Desktop (`>=1024px`): `48px / 52.8px / -0.05em` tracking
- `typo-h2`:
  - Mobile: `30px / 34.4px / -0.04em`
  - Desktop (`>=1024px`): `36px / 41.4px / -0.04em`
- `typo-h3`:
  - Mobile/Desktop: `24px / 30px / -0.02em`
- `typo-p` (body): `16px / 28px` (`leading-7`)
- `typo-muted` (body-muted): `16px / 28px`
- `typo-lead`: `18px / 28px` (desktop `20px / 1.75`)

### Usage Rules
- `typo-page-title`: route-level primary page title (`<h1>`), one per page.
- `typo-h1`: large display heading style when you need H1 visual weight without adding another document `<h1>`.
- `typo-h2`: top-level section heading style (Foundations / Components / Accessibility / Theme).

### Styleguide Hero Underline
- Apply `typo-hero-title` only to the styleguide hero title.
- It uses a thick, offset underline for shadcn-like premium emphasis.
- Do not apply this class globally to all page titles.

## Spacing, Radius, Shadow
- Spacing rhythm: `4 / 8 / 12 / 16 / 24 / 32`.
- Recommended containers:
  - Compact: `max-w-3xl`
  - Content: `max-w-5xl`
  - Docs/DS: `max-w-6xl`
- Radius scale:
  - `rounded-sm` for tiny chips.
  - `rounded-md` for inputs/buttons.
  - `rounded-lg` for cards and larger blocks.
- Shadow scale:
  - `shadow-soft`: cards and low elevation.
  - `shadow-popover`: floating layers.

## Responsive Layout Rules
- Mobile-first is baseline. Use `sm`, `md`, `lg`, `xl` only as progressive enhancements.
- Canonical container: `app-container` (`max-w-6xl`, `px-4 sm:px-6 lg:px-8`).
- Canonical section rhythm: `app-section` (`py-8 md:py-10 lg:py-12`, `space-y-6 sm:space-y-8`).
- Canonical card grid: `grid-cards` (`2 cols mobile`, `3 cols md`, `4 cols xl`).
- Compact card grid: `grid-cards-compact` (same column progression, tighter gaps).
- Use `no-overflow-x` on page wrappers and flexible shells to prevent accidental horizontal overflow.
- Under `1280px`, avoid 4-column squeeze; 4 columns start at `xl` only.

## App Shell Header Rules (Locked)
- Breakpoint contract:
  - Mobile/tablet shell is active under `1280px` (`<xl`).
  - Desktop shell is active at `>=1280px` (`xl+`).
- Mobile shell must use a **fixed 2-tier header stack**:
  - Row 1: top app bar (`56px`) with navigation trigger + brand + quick actions.
  - Row 2: tab bar (`56px`) directly under top app bar.
  - Total mobile stack height is `112px` plus safe-area top inset.
- Mobile tab row contract:
  - Exactly 5 tabs: `Ana Sayfa`, `Keşfet`, `Piercing`, `Galeri`, `Artistler`.
  - Icons are `22px`.
  - Labels are single-line `11px` and must not wrap.
  - Each tab uses link semantics and `aria-current="page"` when active.
  - Touch targets are at least `44px`.
- Desktop shell contract (`xl+`):
  - Mobile 2-tier header is hidden.
  - Desktop header is visible.
  - Mobile tab row is never shown.
- Bottom nav is disabled in app shell:
  - No fixed bottom navigation under mobile/tablet.
  - No bottom navigation on desktop either.
  - Rationale: tab navigation now lives in the mobile header stack.
- Mobile brand lockup rule (Top App Bar):
  - Brand text is single-line and exact: `Enki Tattoo`.
  - Brand must never wrap; use truncation behavior if horizontal space is constrained.
  - Do not reintroduce two-line brand lockup in mobile top bar.
- Header architecture lock:
  - Do not redesign/restructure the 2-tier mobile header.
  - Do not replace/remove existing hide-on-scroll mechanism.

## Header Scroll Motion Rules (Facebook-like)
- The 2-tier mobile header must hide/show progressively with GPU transform:
  - Scroll down: increase hide amount.
  - Scroll up: decrease hide amount.
  - Apply `translate3d(0, -hideAmount, 0)` on one shared header transform container.
- Performance contract:
  - Use passive scroll listener + `requestAnimationFrame`.
  - Do not update React state on scroll frames.
  - Mutate DOM styles directly for per-frame transforms.
  - Use `will-change: transform`.
- Stability contract:
  - Clamp hide amount to `[0, maxHide]`.
  - At top (`scrollY <= 0`), force fully visible header.
  - Ignore negative iOS overscroll.
  - Respect `prefers-reduced-motion`: disable dynamic hide/show and keep header visible.
  - Reset transforms when entering desktop breakpoint (`xl+`).

## Safe-Area and Offset Rules
- Canonical mobile header variables in `:root`:
  - `--app-mobile-topbar-h: 56px`
  - `--app-mobile-tabbar-h: 56px`
  - `--app-mobile-header-h: calc(var(--app-mobile-topbar-h) + var(--app-mobile-tabbar-h))`
- Canonical content offset utility:
  - `.app-mobile-header-offset { padding-top: calc(env(safe-area-inset-top) + var(--app-mobile-header-h)); }`
  - At `xl+`, mobile offset is removed (`padding-top: 0`).
- Measurement rule:
  - Runtime header measurement updates `--app-mobile-header-h` via `ResizeObserver` on resize and mount.
  - Do not animate layout padding on every scroll frame.
  - To avoid visible gap during hide motion, content shell can be translated with the same `translate3d` as header.
- Drawer/sheet safe-area rule:
  - Left/right sheets must respect `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`, `env(safe-area-inset-left)`, and `env(safe-area-inset-right)`.
  - Header safe-area top must be applied once (no double top offset drift).

## Floating Action Rules
- Chat/FAB under mobile (`<xl`) sits above bottom safe-area only.
- Chat/FAB desktop (`xl+`) keeps desktop positioning.
- Chat/FAB must not collide with header/tab navigation and must not require bottom-nav spacing.

## Navigation and Shell Consistency Checklist
- Never render duplicate primary navigation in the same breakpoint.
- Never render mobile tab row at the bottom of viewport.
- Never leave mobile safe-area top offset active on `xl+`.
- Keep app shell behavior hydration-safe and deterministic between SSR and client mount.
- Required quality gates are defined in `## 3) Quality Gates (Mandatory)`.

## V1 Content and List Rules
- Home and Galeri card title behavior:
  - Card titles must be single-line with ellipsis (`truncate` / equivalent).
  - Keep card content rhythm aligned; long titles must not create uneven card heights.
  - Do not change typography token scale for this requirement.
- Galeri filter contract:
  - Keep only `Tüm stiller` and `Tüm temalar`.
  - Remove `Tüm artistler` filter from V1.
  - Keep spacing balanced for two-select layout.
- Artistler V1 layout:
  - Use 3 vertically stacked profile cards.
  - Each card includes:
    - left square placeholder (`aspect-square`, rounded, muted background)
    - right content (`name`, `role`, short description)
    - `İncele` action button
  - V1 data set:
    - `Halit Yalvaç — Master Artist — 30 yılı aşkın deneyim`
    - `Placeholder Artist — Tattoo Artist — Kısa açıklama placeholder` (x2)

## Theme Behavior Rules
- Default is `system`.
- Users can force `light` or `dark` regardless of OS theme.
- User selection persists via local storage (`enki-theme`).
- Returning to `system` re-attaches UI to OS preference.
- `suppressHydrationWarning` on `<html>` and mounted guards on theme UI prevent hydration mismatch/flicker.

## How To Change Base Palette Later
1. Update OKLCH token values in `src/app/globals.css` under `:root` and `.dark`.
2. Keep semantic token names unchanged (`--background`, `--primary`, etc.).
3. Update `components.json` `tailwind.baseColor` to the new base.
4. Review `surface-*` compatibility tokens for contrast parity.
5. Run `npm run lint` and `npm run build`, then manually verify `/styleguide` in light/dark.

## Gradual Migration Checklist
- Header/Footer
- Landing
- Gallery
- Pricing
- Contact

Migration rule: move each page from `t-*` to `typo-*` incrementally, then remove or alias `t-*` after full adoption.
