# Fix: Piercing Hero Theme Caption Panel + Featured Placeholder Contrast

## Ne değişti
- Hero’da tüm görseli karartan full scrim kaldırıldı.
- Hero için alt caption panel modeline geçildi: tema tokenlarıyla (light/dark) uyumlu yarı saydam panel + yumuşak gradient.
- Hero metinleri `text-white` zorlamasından çıkarıldı; `text-foreground` / `text-muted-foreground` ile tema uyumlu hale getirildi.
- Featured kart media alanı `dark:bg-white` yerine `dark:bg-muted/20` olarak güncellendi.
- Image varsa hafif shine overlay eklendi; image yoksa gradient placeholder kullanımı korundu (white box etkisi yok).

## Neden
- Light theme’de hero’nun "darklaşmış banner" gibi görünmesini önlemek.
- Light theme’de featured media alanındaki boş beyaz kutu hissini azaltmak.
- Dark theme’de premium görünümü korurken kontrastı dengede tutmak.

## Kanıt (dosya yolu + snippet)

### 1) Hero caption panel (scrim yerine panel)
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
<div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border">
  {hasHeroCover ? (
    <Image fill priority src={PIERCING_HERO_COVER_PATH} className="object-cover" ... />
  ) : (
    <div className="h-full w-full bg-gradient-to-br from-surface-1 to-surface-2" />
  )}
  <div className="absolute inset-x-0 bottom-0 bg-background/85 bg-gradient-to-t from-background/95 via-background/70 to-transparent p-4 supports-[backdrop-filter]:bg-background/70 supports-[backdrop-filter]:backdrop-blur-md">
    <p className="t-small line-clamp-1 text-muted-foreground">...</p>
    <h1 className="typo-page-title text-foreground">...</h1>
    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">...</p>
  </div>
</div>
```

### 2) Featured media contrast-safe wrapper + shine
Dosya: `src/components/piercing/featured-piercing-card.tsx`

```tsx
<div className="relative aspect-[4/3] overflow-hidden bg-muted/30 ring-1 ring-border/60 dark:bg-muted/20">
  {showImage ? (
    <>
      <Image ... className={cn(imageFit === "cover" ? "object-cover" : "object-contain p-6")} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5" />
    </>
  ) : (
    <div className="h-full w-full bg-gradient-to-br from-surface-1 to-surface-2 dark:from-surface-1 dark:to-surface-2" />
  )}
</div>
```

### 3) CTA pill contrast-safe (korundu)
Dosya: `src/components/piercing/featured-piercing-card.tsx`

```tsx
<span className="inline-flex rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-background/90">
  İncele
</span>
```

## Risk
- Caption panel + blur, bazı cihazlarda çok hafif görsel detay kaybı yaratabilir.
- Görselin çok parlak olduğu örneklerde panel opaklığı artırma ihtiyacı doğabilir.

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
