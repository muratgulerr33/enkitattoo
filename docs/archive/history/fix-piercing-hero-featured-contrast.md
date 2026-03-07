# Fix: Piercing Hero + Featured Cards Contrast (Light/Dark safe)

## Ne değişti
- Hero overlay iki katmanlı scrim yapısına alındı (üst hafif + alt güçlü).
- Hero text katmanı light/dark fark etmeksizin beyaz ve drop-shadow destekli hale getirildi.
- Hero kısa açıklama `line-clamp-2` ile sınırlandı.
- Featured kart media alanı light temada boş beyaz kutu etkisini azaltacak şekilde `bg-muted/30 + ring` ile güncellendi.
- Featured kart CTA pill kontrast-safe sınıflarla güncellendi.

## Neden
- Light temada hero metin okunurluğunu garanti etmek.
- Featured media alanında light tema ayrımını artırmak.
- Dark temada premium görünümü korurken kontrastı stabilize etmek.

## Kanıt (dosya yolu + snippet)

### 1) Hero çift scrim + beyaz metin + drop-shadow
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
<div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-transparent" />
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
<div className="absolute inset-x-0 bottom-0 p-4 text-white">
  <p className="t-small line-clamp-1 text-white/80">...</p>
  <h1 className="typo-page-title text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">...</h1>
  <p className="mt-1 line-clamp-2 text-sm text-white/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)]">...</p>
</div>
```

### 2) Featured media alanı contrast-safe
Dosya: `src/components/piercing/featured-piercing-card.tsx`

```tsx
<div className="relative aspect-[4/3] overflow-hidden bg-muted/30 ring-1 ring-border/60 dark:bg-white">
  {showImage ? (
    <Image ... className={cn(imageFit === "cover" ? "object-cover" : "object-contain p-6")} />
  ) : (
    <div className="h-full w-full bg-muted/40 bg-gradient-to-br from-surface-1 to-surface-2" />
  )}
</div>
```

### 3) CTA pill contrast-safe
Dosya: `src/components/piercing/featured-piercing-card.tsx`

```tsx
<span className="inline-flex rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-background/90">
  İncele
</span>
```

## Risk
- Hero scrim koyuluğu bazı cover görsellerde görsel detayları bir miktar azaltabilir.
- CTA hover sınıfı link içinde görsel element olduğundan etkileşim etkisi tema ve cihazlara göre minimal hissedilebilir.

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

3. Manual hızlı kontrol checklist
- Hero: microline + H1 + açıklama light/dark modda okunur.
- Featured: media alanı light modda sınırları belli, boş beyaz kutu etkisi azaltılmış.
