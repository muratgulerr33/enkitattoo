# Discovery UI 06 — Cards + Grids

## KANIT
### K1 — Grid/card tokenları
```css
/* src/app/globals.css:403-413 */
.grid-cards {
  @apply grid min-w-0 grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4 xl:gap-6;
}
.grid-cards-compact {
  @apply grid min-w-0 grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4 xl:gap-5;
}
.card-media {
  @apply aspect-[5/4] min-h-28 w-full;
}
```

### K2 — Home teaser kartları
```tsx
// src/app/(app)/page.tsx:68-84
<div className="grid-cards">
  {mainHubs.map((hub) => (
    <Link className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface-2 shadow-soft transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      <div className="card-media bg-muted/50 bg-gradient-to-br from-surface-1 to-surface-2" />
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <span className="t-small truncate font-medium text-foreground">...</span>
        <p className="t-caption line-clamp-1 text-muted-foreground">...</p>
```

### K3 — Keşfet kategori kartları
```tsx
// src/app/(app)/kesfet/page.tsx:47-60
<Link className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface-2 shadow-soft transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  <div className="card-media bg-muted/60 bg-gradient-to-br from-surface-1 to-surface-2" />
  <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
    <h2 className="t-h4 text-foreground">{titleTR}</h2>
    <p className="t-muted line-clamp-1">{descriptionTR}</p>
```

### K4 — Piercing kartları
```tsx
// src/app/(app)/piercing/page.tsx:79-94
<div className="grid-cards">
  {knownPiercingPaths.map((path) => (
    <Link className="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-surface-2 p-4 shadow-soft transition-colors hover:bg-accent/50">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
      <span className="t-body text-foreground">{label}</span>
```

### K5 — Galeri grid kartları
```tsx
// src/app/(app)/galeri-tasarim/page.tsx:58-70
<div className="grid-cards">
  {Array.from({ length: mockCount }).map((_, i) => (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface-2 shadow-soft">
      <div className="card-media bg-muted/50 bg-gradient-to-br from-surface-1 to-surface-2" />
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <h2 className="t-small truncate font-medium text-foreground">...</h2>
        <p className="t-caption line-clamp-1 text-muted-foreground">...</p>
```

### K6 — Shadcn Card primitive
```tsx
// src/components/ui/card.tsx:5-12
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-4 shadow-sm xl:py-5", className)}
      {...props}
    />
  )
}
```

### K7 — `line-clamp` / `truncate` izleri
```bash
$ rg -n "line-clamp|truncate" -S src/app src/components
src/app/(app)/page.tsx:80: <p className="t-caption line-clamp-1 text-muted-foreground">
src/app/(app)/kesfet/page.tsx:54: <p className="t-muted line-clamp-1">{descriptionTR}</p>
src/app/(app)/galeri-tasarim/page.tsx:66: <h2 className="t-small truncate font-medium text-foreground">
src/app/(app)/galeri-tasarim/page.tsx:69: <p className="t-caption line-clamp-1 text-muted-foreground">
```

## BULGULAR
- Kart/grid sistemi global utility’lere dayanıyor (`grid-cards`, `grid-cards-compact`, `card-media`) (K1).
- Kart tipleri (ana hedef gruplar):
  - Home teaser kartları: `/` (hub kartları + özel kartları) (K2)
  - Keşfet kategori kartları: `/kesfet` (HubCard) (K3)
  - Piercing kartları: `/piercing` (satır kartı, min-h-14) (K4)
  - Galeri grid kartları: `/galeri-tasarim` (placeholder article kartları) (K5)
  - Ortak primitive: `src/components/ui/card.tsx` (K6)
- Wrapper paterni: çoğunlukla `rounded-xl border border-border bg-surface-2 shadow-soft` (K2-K5).
- Media container paterni: `.card-media` (`aspect-[5/4]`, min height) + gradient/muted yüzey (K1-K5).
- Text clamp paterni: title `truncate`, description `line-clamp-1` (K7).
- Grid paterni: mobil 2 kolon → md 3 kolon → xl 4 kolon; gap ölçeği `2..6` (K1).
- Press/interaction feedback: `transition-colors`, `hover:bg-accent/50`, `focus-visible:ring-*`; `active scale/opacity` sınıfı kanıtı yok (K2-K5).

## UNKNOWN (varsa)
- UNKNOWN: Gerçek görsel medya pipeline’ı kartlarda yok; kart medyaları çoğunlukla placeholder/div gradient veya Skeleton.
  - Gerekli ek kanıt: kartlarda gerçek `<Image>`/`<img>` render eden route/component.
