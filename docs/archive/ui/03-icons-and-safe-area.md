# 03 - Icons and Safe Area Rules

## Icon System Source
- Canonical icon assets live in `src/assets/icons/nandd/`.
- React wrappers live in `src/components/icons/nandd.tsx`.
- Use named imports for tree-shaking (no global registry object).

## Icon Size Rules
- `20px`: inline/social icons and drawer list icons.
- `22px`: header action icons and compact primary actions.
- `24px`: primary floating/action emphasis (FAB-like).

## Tap Target Rule
- All icon-only interactive controls must be at least `44x44`.
- Use centered icons and consistent focus styles:
  - `focus-visible:ring-2`
  - `focus-visible:ring-ring`
  - `focus-visible:ring-offset-2`

## Safe-Area Rules
- Header:
  - Mobile fixed header must include `padding-top: env(safe-area-inset-top)`.
- Drawer/Sheet:
  - Left/right sheet content must include:
    - `padding-left: max(16px, env(safe-area-inset-left))`
    - `padding-right: max(16px, env(safe-area-inset-right))`
- Floating actions (chat/FAB):
  - Mobile bottom offset must include `env(safe-area-inset-bottom)` plus spacing.

## Layout Offset Rules
- Mobile content offset must use:
  - `.app-mobile-header-offset`
  - `padding-top: calc(env(safe-area-inset-top) + var(--app-mobile-header-h))`
- At `xl` (`min-width: 80rem`), mobile header offset must be removed.

## Link Constants
- Centralized link constants are in `src/lib/site/links.ts`:
  - `GOOGLE_MAPS_BUSINESS_URL`
  - `INSTAGRAM_URL`
  - `WHATSAPP_URL`
  - `YOUTUBE_URL`
  - `TELEGRAM_URL`
  - `PHONE_TEL_URL`

## Distribution Rules
- Social/contact icons must be used in:
  - Contact page social row.
  - App footer social row.
- Header action icons should use wrapper icons when equivalent icons exist.
- Do not introduce a bottom icon bar for this project architecture.
