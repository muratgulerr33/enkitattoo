# PR: Piercing Hero Cover + Featured Order + CTA + FAQ Toggle Fix

## Ne değişti
- `/piercing` hero alanı kapak banner yapısına geçirildi (cover image varsa gösterim, yoksa premium placeholder).
- Featured carousel listesi 6 kategoriye sabitlendi ve sırası kilitlendi: kulak, burun, kaş, dudak, dil, göbek.
- Featured kartlardaki badge/etiket kaldırıldı; her kartta tek tip CTA `İncele` eklendi.
- SSS ve Detaylar collapsible triggerları `asChild button` patternine taşındı; metin + ok alanının tamamı tıklanabilir hale getirildi.
- `public/piercing-hero/README.md` eklendi.

## Neden
- Hero alanında premium, daha güçlü first impression sağlamak.
- Featured keşfi kategori odaklı sadeleştirmek.
- Kart aksiyonunu tutarlı hale getirmek (`İncele`).
- SSS aç/kapa etkileşiminde ok ikonuna tıklama sorununu kaldırmak.

## Kanıt (dosya yolu + snippet)

### 1) Featured sırası ve 6 kategori kilidi
Dosya: `src/lib/piercing/featured-piercing.ts`

```ts
export const FEATURED_PIERCING: FeaturedPiercingItem[] = [
  { id: "kulak", href: "/piercing/kulak", imageSrc: "/piercing-featured/kulak.webp" },
  { id: "burun", href: "/piercing/burun", imageSrc: "/piercing-featured/burun.webp" },
  { id: "kas", href: "/piercing/kas", imageSrc: "/piercing-featured/kas.webp" },
  { id: "dudak", href: "/piercing/dudak", imageSrc: "/piercing-featured/dudak.webp" },
  { id: "dil", href: "/piercing/dil", imageSrc: "/piercing-featured/dil.webp" },
  { id: "gobek", href: "/piercing/gobek", imageSrc: "/piercing-featured/gobek.webp" },
]
```

### 2) Badge kaldırıldı, kart CTA eklendi
Dosya: `src/components/piercing/featured-piercing-card.tsx`

```tsx
<div className="pt-2 text-right">
  <span className="inline-flex rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-medium text-foreground">
    İncele
  </span>
</div>
```

### 3) Hero cover (image varsa, yoksa placeholder)
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
const hasHeroCover = fs.existsSync(path.join(process.cwd(), "public", "piercing-hero", "cover.webp"));

{hasHeroCover ? (
  <Image fill priority src="/piercing-hero/cover.webp" className="object-cover" ... />
) : (
  <div className="h-full w-full bg-muted/40 bg-gradient-to-br from-surface-1 to-surface-2" />
)}
<div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
```

### 4) SSS/Detaylar trigger bug fix pattern
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
<CollapsibleTrigger asChild>
  <button
    type="button"
    className="group flex min-h-11 w-full cursor-pointer items-center justify-between ..."
  >
    <span>...</span>
    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
  </button>
</CollapsibleTrigger>
```

### 5) Collapsible primitive asChild uyumluluğu
Dosya: `src/components/ui/collapsible.tsx`

```tsx
function CollapsibleTrigger(props: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
}
```

### 6) Hero görsel rehberi
Dosya: `public/piercing-hero/README.md`

```md
- cover.webp
- WebP, sRGB
- Onerilen genislik: 1600px+
```

## Risk
- `public/piercing-hero/cover.webp` eklenmezse hero placeholder gösterir (beklenen fallback).
- Featured görsel dosyaları eksikse kart medya alanı placeholder kalır.

## Test
1. Build
- Komut: `npm run build`
- Sonuç: Başarılı.

2. Build özeti
```text
✓ Compiled successfully
✓ Generating static pages (34/34)
└ ○ /piercing
```

## Bu PR kapsamında değişen dosyalar
- `src/app/(app)/piercing/page.tsx`
- `src/components/ui/collapsible.tsx`
- `src/lib/piercing/featured-piercing.ts`
- `src/components/piercing/featured-piercing-card.tsx`
- `src/components/piercing/featured-piercing-carousel.tsx`
- `public/piercing-hero/README.md`
- `docs/locks/piercing-landing-featured-carousel-lock.md`
- `docs/output/pr-piercing-featured-carousel.md`

## Commit önerisi
`feat(piercing): refine hero cover, featured order and fix faq toggle`
