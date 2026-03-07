# PR-2: Piercing category icons (unique per card)

## Ne değişti

- Piercing kategori kartlarında tek ikon (`Sparkles`) yerine kategoriye özel ikon eşleştirmesi getirildi.
- Mevcut label akışı (`getPiercingLabel`) korunarak sadece ikon kaynağı değiştirildi.
- Layout, metin, slider ve SEO içerikleri değiştirilmedi.

## Kanıt (dosya yolu + snippet)

### 1) SSOT referansı (piercingCategories)
Dosya: `src/lib/hub/hubs.v1.ts`

```ts
export const piercingCategories: string[] = [
  "kulak",
  "burun",
  "kas",
  "dudak",
  "dil",
  "gobek",
  "septum",
  "industrial",
  "kisiye-ozel",
];
```

### 2) Yeni icon helper (slug -> Lucide icon)
Dosya: `src/lib/piercing/piercing-icons.ts`

```ts
import type { LucideIcon } from "lucide-react";
import { CircleDot, Eye, Link2, MessageCircle, Smile, Sparkles, Target, Wand2, icons } from "lucide-react";

const EarIcon = (icons.Ear as LucideIcon | undefined) ?? CircleDot;

export const PIERCING_ICONS: Record<string, LucideIcon> = {
  "/piercing/kulak": EarIcon,
  "/piercing/burun": Target,
  "/piercing/kas": Eye,
  "/piercing/dudak": Smile,
  "/piercing/dil": MessageCircle,
  "/piercing/gobek": CircleDot,
  "/piercing/septum": Sparkles,
  "/piercing/industrial": Link2,
  "/piercing/kisiye-ozel": Wand2,
};

export function getPiercingIcon(slug: string): LucideIcon {
  const normalizedSlug = normalizePiercingSlug(slug);
  return PIERCING_ICONS[normalizedSlug] ?? CircleDot;
}
```

### 3) Piercing sayfasında icon bağlama
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
import { getPiercingIcon } from "@/lib/piercing/piercing-icons";

{knownPiercingPaths.map((path) => {
  const label = getPiercingLabel(path);
  const Icon = getPiercingIcon(path);

  return (
    <Link key={path} href={path} ...>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <span className="t-body text-foreground">{label}</span>
    </Link>
  );
})}
```

## Neden

- Kartlar arasında görsel ayrışma sağlamak ve kategori tanınabilirliğini artırmak.
- Icon seçimi tek bir helper dosyasında toplanarak bakım kolaylığı sağlamak.

## Risk

- `lucide-react` sürümünde `Ear` export'u kaldırılırsa kulak kategorisi otomatik `CircleDot` fallback kullanır.
- Yeni kategori slug eklenirse map güncellenmezse varsayılan olarak `CircleDot` gösterilir.

## Test

1. Build
- Komut: `npm run build`
- Sonuç: Başarılı.

## Commit mesaj önerisi

`feat(piercing): add category-specific icons`
