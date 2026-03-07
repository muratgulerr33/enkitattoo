# Fix: Piercing Hero Caption Bar (Light-safe + Premium Fade)

## Ne değişti
- Hero’daki büyük tek parça caption panel kaldırıldı.
- Yeni iki katmanlı yapı uygulandı:
  1. `fade band` (sadece geçiş)
  2. `caption bar` (tüm metinler burada)
- Caption bar yüksekliği sınırlandı: `max-h-[32%]`, `overflow-hidden`, `p-3`.
- Metinler clamp ile sınırlandı (`microLine`, `H1`, `shortDescription`).

## Neden
- Light theme’de metinlerin foto üstünde kalıp okunurluğu düşmesini önlemek.
- Hero görsel alanını koruyup “yarım kesilmiş” hissini azaltmak.
- Dark theme’i bozmadan tutarlı caption okunurluğu sağlamak.

## Kanıt (dosya yolu + snippet)

### 1) Hero iki katman (fade + caption bar)
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
<div className="pointer-events-none absolute inset-x-0 bottom-[32%] h-12 bg-gradient-to-t from-background/95 to-transparent dark:from-background/55" />
<div className="absolute inset-x-0 bottom-0 max-h-[32%] overflow-hidden rounded-b-2xl border-t border-border/40 bg-background/95 p-3 dark:bg-background/55 supports-[backdrop-filter]:backdrop-blur-md">
```

### 2) Metin clamp kuralları
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
<p className="line-clamp-1 text-xs text-foreground/80 dark:text-foreground/80">...</p>
<h1 className="line-clamp-1 text-2xl font-semibold tracking-tight text-foreground">...</h1>
<p className="line-clamp-2 text-sm text-muted-foreground">...</p>
```

### 3) Hero wrapper ve image (korundu)
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
<div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border">
  <Image fill priority src={PIERCING_HERO_COVER_PATH} className="object-cover" ... />
</div>
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

3. Light/Dark screenshot
- Light: `/tmp/piercing-captionbar-light.png`
- Dark: `/tmp/piercing-captionbar-dark.png`
- Gözlem: Foto alanı daha görünür, caption bar daha kompakt, yazılar her iki temada net.
