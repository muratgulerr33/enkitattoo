# LOCK: Piercing Landing IA (Hero Cover + Featured Carousel + SEO-safe Collapsibles)

## IA Order (Frozen)
1. Hero Cover: `cover.webp` (varsa) + overlay text (`microLine + H1 + shortDescription`)
2. Full-width CTA: `Piercing için yaz`
3. Featured carousel: `Öne Çıkan Kombinler`
4. Kategoriler grid (mevcut kartlar)
5. Detaylar (`Collapsible`, `forceMount`)
6. Sık sorulanlar (`Collapsible`, `forceMount`)

## Hero Cover Contract
- Görsel yolu: `public/piercing-hero/cover.webp`
- Görsel varsa `next/image` ile `object-cover` render edilir.
- Görsel yoksa `bg-muted/40 bg-gradient-to-br from-surface-1 to-surface-2` placeholder kullanılır.
- Scrim zorunlu: `bg-gradient-to-t from-black/55 via-black/20 to-transparent`
- CTA her zaman cover'ın altında kalır.

## Featured Order Contract
Featured listesi sabit sıra:
1. Kulak (`/piercing/kulak`)
2. Burun (`/piercing/burun`)
3. Kaş (`/piercing/kas`)
4. Dudak (`/piercing/dudak`)
5. Dil (`/piercing/dil`)
6. Göbek (`/piercing/gobek`)

## Card CTA Contract
- Badge/etiket kullanılmaz.
- Her kartta sağ altta tek tip aksiyon etiketi bulunur: `İncele`.

## SEO-safe Content Lock
- Detaylar ve Sık sorulanlar içerikleri `CollapsibleContent forceMount` ile DOM'da sürekli bulunur.
- Collapsible kapalıyken içerik görsel olarak saklanır, DOM'dan kaldırılmaz.

## Collapsible Trigger Pattern (Bugfix Lock)
- Trigger pattern zorunlu: `CollapsibleTrigger asChild` + child `button[type=button]`.
- Buton alanı tam genişlik, `min-h-11`, `cursor-pointer`, `justify-between`.
- Sağdaki chevron ikon trigger button içinde yer alır ve tıklanabilir alandadır.
- `pointer-events-none` kullanılmaz.

## Client Boundary Lock
- `/piercing` sayfası server component olarak kalır.
- Client boundary parçaları:
  - `src/components/ui/carousel.tsx`
  - `src/components/ui/collapsible.tsx`
  - `src/components/piercing/featured-piercing-card.tsx`
  - `src/components/piercing/featured-piercing-carousel.tsx`

## Performance Lock
- Hero görseli varsa optimize image pipeline kullanılır (`next/image`, `priority`).
- Featured kartlar hafif tutulur; ekstra overlay/favorite stack yoktur.
- Carousel mobile peeking düzeni korunur (`basis-[92%]`, `px-4`, `-ml-4`, `pl-4`).
