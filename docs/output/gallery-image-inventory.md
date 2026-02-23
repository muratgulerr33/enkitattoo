# ENKI Tattoo Gallery Image Inventory

## Kapsam
- Route keşfi:
  - `src/app/(app)/galeri/page.tsx`
  - `src/app/(app)/galeri/galeri-filters.tsx`
- Zincirde takip edilen ilgili kart render noktaları:
  - `src/app/(app)/page.tsx` (mini galeri önizleme)
  - `src/app/(app)/kesfet/[hub]/page.tsx` (hub detail örnek galeri)
  - `src/app/globals.css` (`.card-media` token)

## Bulgular
- `next/image` importu yok (galeri zincirinde ve genel taramada).
- `<img>` kullanımı yok.
- `background-image` literal tanımı yok.
- Görsel alanlar şu an placeholder tabanlı:
  - gradient block (`div.card-media ... bg-gradient-to-br ...`)
  - `Skeleton` + `card-media`
- Gerçek görsel kaynağı (public dosya / remote URL / API) bağlı değil.

## Render ve oran kanıtı
```tsx
// src/app/(app)/galeri/page.tsx
<article className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface-2 shadow-soft">
  <div className="card-media bg-muted/50 bg-gradient-to-br from-surface-1 to-surface-2" />
  <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
    <h2 className="t-small truncate font-medium text-foreground">...</h2>
    <p className="t-caption line-clamp-1 text-muted-foreground">...</p>
  </div>
</article>
```

```css
/* src/app/globals.css */
.card-media { @apply aspect-[5/4] min-h-28 w-full; }
@media (min-width: 48rem) {
  .card-media { aspect-ratio: 4 / 3; min-height: 9rem; }
}
```

## Envanter özeti
- Galeri görsel kart tipi: **3**
  - Asıl gallery grid card (`/galeri`)
  - Home mini gallery preview skeleton card
  - Hub detail sample gallery skeleton card
- Mevcut aspect standardı: **5/4 mobile, 4/3 md+** (`.card-media`)

## V1 ideal görsel standardı
- Mobile: **5/4**
- md: **4/3**
- xl: **4/3**

Neden
- Mevcut grid yoğunluğu (`2 -> 3 -> 4` kolon) ile dengeli kart yüksekliği sağlar.
- Başlık + açıklama alanı için yeterli dikey alan bırakır.
- Home/Kesfet/Galeri arasında aynı token kullanımıyla görsel ritim korunur.

## Next/Image önerisi (V1.1)
- Galeri gerçek görseller bağlandığında `next/image`e geç:
  - `fill` + parent `relative card-media`
  - `className="object-cover"`
  - `sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"`
