# PR-FINAL: Piercing Icons SSOT + LOCK (Lucide primitives)

## Ne değişti
- Piercing ikon map'i final lock hedefi ile birebir hizalandı.
- `dil` için özel map kaydı kaldırıldı; bilinmeyen/harici kategoriler global fallback `CircleDot` ile çözülüyor.
- Yeni lock dokümanı eklendi: `docs/locks/piercing-icons-lock.md`.
- Styleguide'a piercing ikon yaklaşımı (Lucide primitives + 20px + aria-hidden + muted) eklendi.

## Neden
- Tek bir ikon dili ile kategori kartlarında görsel tutarlılık sağlamak.
- Figma/SVG varyant yönetimini devre dışı bırakıp bakım maliyetini azaltmak.
- İkon kullanımını kod ve dokümanda kalıcı şekilde kilitlemek.

## Risk
- `dil` gibi map dışında kalan kategori slug'ları `CircleDot` fallback kullanır; bu beklenen davranıştır.
- Lucide sürüm farkında `Ear`, `CircleDashed`, `UserRound` yoksa tanımlı fallback (`Circle` / `User`) devreye girer.

## Kanıt (dosya yolu + snippet)

### 1) Final icon map + fallback
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

### 2) Piercing page kullanım kilidi (ikon + label)
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
const label = getPiercingLabel(path);
const Icon = getPiercingIcon(path);

<Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
<span className="t-body text-foreground">{label}</span>
```

### 3) Lock dokümanı
Dosya: `docs/locks/piercing-icons-lock.md`

```md
# LOCK: Piercing Category Icons (Lucide primitives)
...
Global fallback: `CircleDot`
```

### 4) Styleguide güncellemesi
Dosya: `docs/01-design-system-styleguide.md`

```md
- Piercing category icon lock:
  - Use Lucide primitives only from `src/lib/piercing/piercing-icons.ts` (no Figma/SVG branch).
  - Card icon size is fixed `h-5 w-5` (20px).
  - Icons are decorative and must stay `aria-hidden="true"`.
  - Color stays single-tone `text-muted-foreground` for consistency.
```

## Test
1. Build
- Komut: `npm run build`
- Sonuç: Başarılı.

## Değişen dosyalar
- `src/lib/piercing/piercing-icons.ts`
- `docs/locks/piercing-icons-lock.md`
- `docs/01-design-system-styleguide.md`
- `docs/output/pr-final-piercing-icons-lock.md`

## Commit önerisi
- `docs(piercing): lock icon set`
- `refactor(piercing): finalize icon set lock`
