# 02 - Responsive Checklist

Breakpoint-first setup: mobile-first, `xl = 1280px`.

## Widths to Test

| Width | Device Type |
|---|---|
| 360px | Small phone |
| 390–430px | Standard phone |
| 768px | Tablet portrait |
| 1024px | Tablet landscape |
| 1280px | Desktop (`xl`) |
| 1440px+ | Large desktop |

## Route Expectations

### Home (`/`)
- `360–430px`: hero + 2-col hub cards.
- `768–1024px`: 2-col/3-col progression with stable spacing.
- `>=1280px`: desktop shell + right rail.
- Card titles must remain single-line truncated.

### Keşfet (`/kesfet`)
- Mobile: stacked sections and readable cards.
- Desktop: 3-col main grid, no overflow.

### Galeri (`/galeri`)
- Mobile: two filter selects only (`Tüm stiller`, `Tüm temalar`).
- Desktop: filters inline, grid scales to 4 columns at `xl`.
- Card titles must remain single-line truncated.

### Piercing (`/piercing`)
- Mobile: tappable category blocks.
- Desktop: denser card layout without clipping.

### Artistler (`/artistler`)
- V1: 3 stacked profile cards.
- Cards keep content alignment and button placement.

### İletişim (`/iletisim`)
- Mobile: contact + map stacked, no clipping.
- Desktop: split layout with stable map block.

## Shell / Motion Checks
- Mobile header:
  - 2-tier structure remains intact.
  - scroll down hides header, scroll up reveals.
  - brand is single-line `Enki Tattoo`.
- Desktop header:
  - visible only at `xl+`.
- Safe-area:
  - header top inset applied once.
  - drawer respects left/right/top/bottom safe insets.
  - FAB/chat respects bottom safe inset.

## Interaction Checks
- Icon-only controls are at least `44x44`.
- Focus ring is visible and consistent.
- No horizontal overflow at tested widths.

## Required Commands
- `npm run lint`
- `npm run build`
