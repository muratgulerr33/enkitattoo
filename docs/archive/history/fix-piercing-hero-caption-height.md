# Fix: Piercing Hero Caption Panel Height (image cut issue)

## Önce / Sonra
- Önce: Hero caption panel yüksekliği fazla kalıyordu (`p-4`, serbest yükseklik) ve görsel alanı daraltarak hero etkisini zayıflatıyordu.
- Sonra: Caption panel `max-h-[38%]` + `p-3` + clamp ile sınırlandı; görsel alan büyütüldü ve metin taşması kontrol altına alındı.

## Ne değişti
- Hero wrapper korunarak panel yüksekliği küçültüldü.
- Caption panel theme-safe gradient + blur ile okunur bırakıldı.
- Microline/H1/description clamp ile panel taşması engellendi.

## Kanıt (dosya yolu + snippet)

### 1) Hero wrapper + image
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
<div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border">
  <Image
    fill
    priority
    src={PIERCING_HERO_COVER_PATH}
    className="object-cover"
    sizes="(max-width: 640px) 100vw, 50vw"
    ...
  />
```

### 2) Küçültülmüş caption panel (kritik)
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
<div className="absolute inset-x-0 bottom-0 max-h-[38%] overflow-hidden bg-gradient-to-t from-background/95 via-background/75 to-transparent p-3 supports-[backdrop-filter]:backdrop-blur-md">
```

### 3) Clamp kuralları
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
<p className="line-clamp-1 text-xs text-muted-foreground">...</p>
<h1 className="line-clamp-1 text-2xl font-semibold leading-tight text-foreground">...</h1>
<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">...</p>
```

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

3. Light + Dark screenshot
- Light: `/tmp/piercing-light.png`
- Dark: `/tmp/piercing-dark.png`
- Gözlem: Hero görsel alanı daha baskın, caption panel daha kompakt ve metin okunur.
