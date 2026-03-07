# PR-2.1: Make piercing icons visually consistent (jewelry primitives)

## Ne değişti

- `src/lib/piercing/piercing-icons.ts` içindeki kategori ikon map'i, tek bir "takı/şekil" diline göre güncellendi.
- `normalizePiercingSlug` ve `getPiercingIcon` akışı korunarak yalnız ikon eşleşmeleri revize edildi.
- Metin/layout/SEO tarafında değişiklik yapılmadı.

## Kanıt (dosya yolu + snippet)

### 1) Tutarlı ikon setine geçiş
Dosya: `src/lib/piercing/piercing-icons.ts`

```ts
import {
  Circle,
  CircleDot,
  Dot,
  Link2,
  Minus,
  User,
  icons,
} from "lucide-react";

const EarIcon = (icons.Ear as LucideIcon | undefined) ?? Circle;
const SeptumIcon = (icons.CircleDashed as LucideIcon | undefined) ?? Circle;
const CustomIcon = (icons.UserRound as LucideIcon | undefined) ?? User;

export const PIERCING_ICONS: Record<string, LucideIcon> = {
  "/piercing/kulak": EarIcon,
  "/piercing/burun": Dot,
  "/piercing/kas": Minus,
  "/piercing/dudak": Circle,
  "/piercing/dil": Minus,
  "/piercing/gobek": CircleDot,
  "/piercing/septum": SeptumIcon,
  "/piercing/industrial": Link2,
  "/piercing/kisiye-ozel": CustomIcon,
};
```

### 2) Normalize davranışı korundu
Dosya: `src/lib/piercing/piercing-icons.ts`

```ts
function normalizePiercingSlug(slug: string): string {
  const trimmed = slug.trim();
  if (!trimmed) return "";

  const segments = trimmed.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  ...
}
```

## Neden

- İkonların görsel dili daha homojen hale getirilerek kartların genel görünümünde premium/tutarlı bir his sağlamak.
- Kategori ayrımını sembolik ama aynı ailede kalan ikonlarla sürdürmek.

## Risk

- Bazı ikonlar (Dot/Minus/Circle) daha minimal olduğu için kategori ayrışması önceki sete göre daha düşük algılanabilir.
- `Ear`, `CircleDashed`, `UserRound` export'larında sürüm farkı olursa fallback (`Circle`/`User`) devreye girer.

## Test

1. Build
- Komut: `npm run build`
- Sonuç: Başarılı.

## Commit mesaj önerisi

`refactor(piercing): align icons to consistent set`
