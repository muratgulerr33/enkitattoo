# P0 Fix: Piercing Hero Contrast (Light/Dark) + shortDescription Visibility

## Ne değişti
- Hero’daki ayrı fade band kaldırıldı; hero overlay tek ve temiz caption bar modeline indirildi.
- Caption bar tema-güvenli arkaplanla ayarlandı: `bg-background/92 dark:bg-background/55`.
- Metin renkleri `text-muted-foreground` yerine kontrastı yüksek `text-foreground/*` tonlarına taşındı.
- Clamp kuralları korunarak içerik taşması engellendi: `1 + 1 + 2 satır`.

## Neden
- Light theme’de foto üstünde “beyaz sis/perde” etkisini azaltmak.
- Light ve dark theme’de shortDescription görünürlüğünü sabitlemek.
- Native/premium hero hissini tek caption bar ile korumak.

## Kanıt (dosya yolu + snippet)

### 1) Hero wrapper + image (korundu)
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

### 2) Fade band kaldırıldı, tek caption bar kaldı
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
<div className="absolute inset-x-0 bottom-0 rounded-b-2xl border-t border-border/40 bg-background/92 p-3 dark:bg-background/55 supports-[backdrop-filter]:backdrop-blur-md">
```

### 3) Theme-safe metin kontrastı + clamp
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
<p className="line-clamp-1 text-xs text-foreground/70 dark:text-foreground/80">...</p>
<h1 className="line-clamp-1 text-2xl font-semibold text-foreground">...</h1>
<p className="line-clamp-2 text-sm text-foreground/70 dark:text-foreground/80">...</p>
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
- Light: `/tmp/piercing-contrast-final-light.png`
- Dark: `/tmp/piercing-contrast-final-dark.png`
- Gözlem: Light’ta foto soluklaşma azaldı, shortDescription net; dark’ta shortDescription görünürlüğü korunuyor.
