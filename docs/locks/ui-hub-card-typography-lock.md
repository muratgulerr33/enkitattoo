# LOCK: UI Hub Card Typography + Surface (Home/Keşfet) — v3

## Scope
- `/` hub grid kartları
- `/kesfet` main + special hub kartları
- Shared component: `src/components/hub/hub-card.tsx`

## Typography Lock
- Title: single line ellipsis (guaranteed).
  - Teknik karşılık: `overflow-hidden text-ellipsis whitespace-nowrap` + `min-w-0` + `title` attribute.
- Desc: single line ellipsis.
  - Teknik karşılık: `overflow-hidden text-ellipsis whitespace-nowrap` + `min-w-0` + `title` attribute.
- Parent `min-w-0` rule:
  - Title/desc kapsayıcısı `min-w-0` zorunlu.
  - Hub kartının grid item parent zinciri `min-w-0` ile kırpma davranışını korumalı.

## CTA Lock
- CTA satırı her kartta aynı: `Tümünü gör` + `ChevronRight`.
- CTA görsel stili: `text-sm font-medium`.
- CTA satırı `mt-auto` ile footer altına sabitlenir.
- CTA row düzeni: `flex items-center justify-between gap-2`; metin tarafı `min-w-0 truncate`.
- CTA press feedback: `transition-[color,transform]` + `group-active:scale-[0.99]`.

## Surface Lock
- Kart container: `rounded-2xl`.
- Border: `border border-border/60 dark:border-border/50`.
- Light: `bg-background shadow-sm`.
- Dark: `dark:bg-card/40 dark:shadow-none`.
- Hover: `hover:shadow-md` + `dark:hover:shadow-sm` + `transition-[box-shadow,background-color]`.

## Media Lock
- Aspect: `card-media-hub` (4:5) sabit.
- Image: `fill + object-cover + sizes`.
- Cover yoksa gradient fallback korunur (`bg-gradient-to-br from-surface-1 to-surface-2`).
- Media container: `relative overflow-hidden rounded-t-2xl`.

## Footer Rhythm Lock
- Footer min-height sabit: `min-h-[92px]`.
- Footer layout: `flex flex-col gap-2`.
- Footer yüzeyi: `border-t border-border/50 bg-background/95 dark:bg-card/30`.

## Consistency Lock
- Home ve Keşfet aynı kart markup’ını kullanır: `HubCard` shared component.
- Kart spacing ritmi: metin container `p-4`, footer `gap-2`.
