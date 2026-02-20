# Responsive test checklist

Breakpoint-first setup: mobile-first, xl = 1280px.

## Widths to test

| Width | Device type |
|-------|-------------|
| 360px | Small phone |
| 390–430px | Standard phone |
| 768px | Tablet portrait |
| 1024px | Tablet landscape |
| 1280px | Desktop (xl breakpoint) |
| 1440px+ | Large desktop |

## Per-page: above-the-fold expectations

### Home (/)
- **360–430px:** Hero block + hub grid 2 cols start; Özel row horizontal scroll.
- **768–1024px:** Hero + 2-col hub grid; Özel row scroll or wrap.
- **≥1280px:** Hero + hub grid 3 cols in main column; right rail: Quick actions + 6 hub links + Piercing CTA.

### Keşfet (/kesfet)
- **Mobile:** Stacked hub cards (1 col); Özel horizontal scroll.
- **≥768px:** 2-col hub grid; Özel 3-card row.
- **≥1280px:** 3-col hub grid; 6 hubs above fold if possible; Özel 3-card row.

### Galeri (/galeri)
- **Mobile:** Stacked filters (full-width selects); 2-col grid.
- **≥768px:** Filters inline (2–3 cols); 3-col grid.
- **≥1280px:** Filters top row; 4-col grid; skeleton tiles consistent aspect ratio.

### Piercing (/piercing)
- **Mobile:** Big tappable category rows (single column).
- **≥768px:** 2-col category cards.
- **≥1280px:** 3-col grid; right rail: booking CTA + hygiene/aftercare snippet.

### Artistler (/artistler)
- **Mobile:** Vertical artist cards.
- **≥768px:** 2-col grid.
- **≥1280px:** 3-col grid.

### İletişim (/iletisim)
- **Mobile:** Contact card + map stacked.
- **≥1280px:** Two columns: left = contact + CTAs, right = map embed (sticky).

## Quick checks

- [ ] Header (mobile tabs / desktop top bar) does not cause layout jump on scroll.
- [ ] Chat bubble does not overlap bottom CTAs; main has sufficient bottom padding on mobile.
- [ ] Sheets/drawers have safe-area bottom padding.
- [ ] Touch targets remain 44–48px on mobile.
- [ ] Right rail only visible at xl (1280px+).
