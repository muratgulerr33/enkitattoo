# LOCK: Mobile Header Rhythm + Press Feedback (Light/Dark)

## Scope
- Component: `src/components/app/mobile-header.tsx`
- Shared primitive: `src/components/ui/icon-button.tsx`
- Token touchpoint: `src/app/globals.css`
- Applies to mobile header top bar + mobile tab row only (`xl` altı).

## Rhythm Lock
- Top bar height lock: `--app-mobile-topbar-h: 56px`.
- Bottom tab row height lock: `--app-mobile-tabbar-h: 52px`.
- Combined mobile header offset must remain token-driven:
  - `--app-mobile-header-h: calc(var(--app-mobile-topbar-h) + var(--app-mobile-tabbar-h))`.

## Icon Button Lock
- All mobile header icon actions must use shared `IconButton`.
- Minimum touch target is locked to `44px+`:
  - `md`: `h-11 w-11`
  - `lg`: `h-12 w-12`
- Press feedback lock:
  - `active:scale-[0.97]`
  - `transition-[transform,background-color,color,...] duration-150`
- Keyboard focus lock:
  - `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Contrast lock:
  - default icon tone: `text-foreground/80`
  - active tone: `text-foreground`

## Active Indicator Lock
- IconButton active state uses subtle indicator + background:
  - active background: `bg-muted/60` (+ dark variant)
  - indicator: bottom mini bar via pseudo element (`after:*`).
- Bottom tab active state must be immediately recognizable:
  - active row background (`bg-muted/45` + dark variant)
  - bottom underline visible (`opacity-100`).

## Bottom Tab Press Lock
- Each tab item must keep:
  - `min-h-11`
  - `active:scale-[0.97]`
  - `active:bg-muted/60` (+ dark variant)
- Inactive labels/icons stay muted but readable:
  - light: `text-foreground/65`
  - dark: `dark:text-foreground/70`.

## Guardrails
- PR-1 drawer text-only menu contract must not be broken.
- PR-3 hub card typography contract is out of scope and must remain unchanged.
- Footer, hero, search content templates and chat bubble are out of scope.
