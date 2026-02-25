# LOCK: Piercing Category Icons (Lucide primitives)

## Hedef ikon dili
- Outline, primitive takı dili.
- Kaynak: Lucide icons; Figma/SVG özel ikon akışı yok.

## Map (Final)
| Kategori | Icon | Fallback |
|---|---|---|
| kulak | Ear | Circle |
| burun | Dot | CircleDot (global fallback) |
| kas | Minus | CircleDot (global fallback) |
| dudak | Circle | CircleDot (global fallback) |
| gobek | CircleDot | CircleDot |
| septum | CircleDashed | Circle |
| industrial | Link2 | CircleDot (global fallback) |
| kisiye-ozel | UserRound | User |

Global fallback: `CircleDot`

## Neden
- UX: kategori ayrımı hızlı ve taranabilir.
- Tutarlılık: tek ikon ailesi (Lucide primitives).
- Bakım: Figma/SVG varyant karmaşası ve export bağımlılığı yok.

## Kanıt
Dosya: `src/lib/piercing/piercing-icons.ts`

```ts
const EarIcon = (icons.Ear as LucideIcon | undefined) ?? Circle;
const SeptumIcon = (icons.CircleDashed as LucideIcon | undefined) ?? Circle;
const CustomIcon = (icons.UserRound as LucideIcon | undefined) ?? User;

export const PIERCING_ICONS: Record<string, LucideIcon> = {
  "/piercing/kulak": EarIcon,
  "/piercing/burun": Dot,
  "/piercing/kas": Minus,
  "/piercing/dudak": Circle,
  "/piercing/gobek": CircleDot,
  "/piercing/septum": SeptumIcon,
  "/piercing/industrial": Link2,
  "/piercing/kisiye-ozel": CustomIcon,
};

export function getPiercingIcon(slug: string): LucideIcon {
  const normalizedSlug = normalizePiercingSlug(slug);
  return PIERCING_ICONS[normalizedSlug] ?? CircleDot;
}
```

Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
const label = getPiercingLabel(path);
const Icon = getPiercingIcon(path);

<Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
<span className="t-body text-foreground">{label}</span>
```

## Uygulama notu
- İkon boyutu 20px: `h-5 w-5`.
- İkonlar dekoratif: `aria-hidden="true"`.
