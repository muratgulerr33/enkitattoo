# Fix: Piercing Hero microLine out + single-scrim overlay + 1+1 text clamp

## Ne değişti
- Hero içindeki `microLine` kaldırıldı ve CTA butonunun hemen altına taşındı.
- Hero overlay, tek ve tema-bağımsız bottom scrim modeline geçirildi.
- Hero metinleri küçültüldü:
  - H1: `line-clamp-1`
  - shortDescription: `line-clamp-1`
- Metin rengi hero içinde beyaz yapıldı ve hafif drop-shadow eklendi.

## Neden
- Hero üzerindeki metin bloğunu küçültüp görselin daha fazla görünmesini sağlamak.
- Light/Dark temada tutarlı okunurluk için tek ve kontrollü bir scrim kullanmak.
- microLine’ı hero görselinden çıkararak “yarım kaldı” hissini azaltmak.

## Kanıt (dosya yolu + snippet)

### 1) Tek scrim + 1+1 satır hero metin
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
<div className="absolute inset-x-0 bottom-0 p-3 text-white">
  <h1 className="line-clamp-1 text-2xl font-semibold text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)]">
    {piercingContent?.h1 || "Piercing"}
  </h1>
  <p className="line-clamp-1 text-sm text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
    {shortDescription}
  </p>
</div>
```

### 2) microLine CTA altına taşındı
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
<section>
  <Button asChild size="lg" className="w-full">...</Button>
  {piercingContent?.microLine ? (
    <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">{piercingContent.microLine}</p>
  ) : null}
</section>
```

### 3) Hero wrapper ve image korundu
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
<div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border">
  <Image fill priority src={PIERCING_HERO_COVER_PATH} className="object-cover" ... />
</div>
```

## Risk
- Çok parlak/detaylı hero görsellerinde tek scrim bazı alanları kısmen koyulaştırabilir.
- shortDescription artık 1 satır olduğu için daha az içerik görünür; bu beklenen tasarım kararıdır.

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
