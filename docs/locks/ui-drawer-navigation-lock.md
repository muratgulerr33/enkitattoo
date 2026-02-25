# LOCK: Mobile Drawer Navigation (Text-only + 44px Tap + Press Feedback)

## Scope
- Component: `src/components/app/mobile-header.tsx`
- Target: only mobile hamburger drawer content (`SheetContent side="left"`).
- Desktop nav/tab behavior is out of scope and must remain unchanged.

## Navigation Row Lock
- Drawer link rows must be rendered by single shared row primitive: `MenuRow`.
- `MenuRow` props contract: `href`, `label`, `isActive`, `onClick?`.
- Drawer menu rows are text-only; icon render is not allowed.
- Tap target minimum is locked to `h-11` (44px).

## Styling Lock
- Base row class must include:
  - `h-11 w-full rounded-xl px-4 flex items-center gap-3`
  - `text-base font-medium`
- Active row style lock:
  - `bg-muted/60 dark:bg-white/10`
  - `text-foreground`
  - stronger weight (`font-semibold` allowed)
  - `aria-current="page"` on active route
- Inactive row style lock:
  - `text-foreground/80`
  - `hover:bg-muted/40 dark:hover:bg-white/5`
- Press feedback lock:
  - `active:scale-[0.99]`
  - `active:bg-muted/70 dark:active:bg-white/15`
- Focus lock:
  - `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`

## Section Rhythm Lock
- Section labels (`Özel`, `Tema`) must use compact caption rhythm:
  - `text-xs uppercase tracking-wider text-muted-foreground px-4 pt-4 pb-2`
- Inter-section dividers must stay subtle (`border-border/60` or equivalent soft border).

## Theme Row Lock
- Theme control must appear as compact row in the same list rhythm, not a large standalone button.
- Icon is not allowed in theme row trigger.
- Trigger content pattern: left text label + right active mode text (`Dark/Light/System`).
- Existing theme behavior must be preserved (`next-themes` `setTheme(...)`).

## Auxiliary Controls Lock
- Drawer close button remains available and must keep at least 44px hit area (`h-11 w-11`).
- Bottom WhatsApp CTA stays in drawer for PR-1; hit-area/radius should align with drawer rhythm (`h-11`, rounded corners).

## A11y Lock
- Drawer rows must remain keyboard-focusable.
- Active route must expose `aria-current="page"`.
