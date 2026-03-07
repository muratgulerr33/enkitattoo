# ENKI Tattoo Card Discovery

## Kapsam ve yöntem
- Taranan alan: `src/app/**`, `src/components/**`, `src/lib/**`
- Hariç tutulanlar: `docs/output`, `node_modules`, `.next`, `dist`, `build`, `coverage`, `.git`
- Yöntem: `rg` ile broad scan (Card/Tile/Item/Row/Poster/Profile, `Card` primitive importları, `rounded|border|shadow|hover|group|overflow-hidden`, `aspect-*`, `card-media`, `object-cover`, `next/image`)
- Detay envanter: `docs/output/card-inventory.json`

## Kart aday listesi (broad scan sonucu)
- `src/app/(app)/kesfet/page.tsx`: `HubCard` (Category/Hub)
- `src/app/(app)/page.tsx`: home hub kartları, special hub kartları, piercing CTA, mini gallery skeleton kartları, contact strip
- `src/app/(app)/galeri/page.tsx`: gallery grid item kartları
- `src/app/(app)/kesfet/[hub]/page.tsx`: hub-detail gallery skeleton kartları
- `src/app/(app)/artistler/page.tsx`: artist profile list kartları
- `src/app/(app)/piercing/page.tsx`: kategori kartları
- `src/app/(app)/iletisim/page.tsx`: studio info card + map card
- `src/components/app/right-rail.tsx`: 3 adet rail card (quick actions, popular hubs, conditional piercing CTA)
- `src/components/styleguide/token-grid.tsx`: `TokenCard` (styleguide/demo)
- `src/components/legacy/social-mock/*.tsx`: `PostCard`, `FeedCard`, `SkeletonCard`, `StoriesRow` container (legacy/demo)

## Taxonomy özeti
- Category/Hub Card: 4
- Gallery Card: 3
- CTA Card: 4
- Profile Card: 1
- Info/Stat Card: 3
- Media Card: 3
- Other: 1

Toplam kart archetype: **19**
Toplam usage kaydı (code-level): **23**

## Ölçü ve yapı analizi

### Ortak layout pattern
- Ana kart grid standardı `grid-cards`:
  - base: `grid-cols-2 gap-3`
  - `sm`: `gap-4`
  - `md`: `grid-cols-3 gap-5`
  - `xl`: `grid-cols-4 gap-6`
  - `<=360px`: tek kolon fallback
- Kompakt grid (`grid-cards-compact`) mini preview’de aynı kolon, daha düşük gap kullanıyor.

### Ortak kart shell pattern
- En sık tekrar eden shell:
  - `rounded-xl border border-border bg-surface-2 shadow-soft`
  - `overflow-hidden`
  - interaktif kartlarda `transition-colors hover:bg-accent/50`
  - focus: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`

### En çok tekrar eden medya oranları
- Production card media token: `.card-media`
  - mobile: `aspect-[5/4] min-h-28`
  - `md+`: `aspect-ratio: 4 / 3; min-height: 9rem`
- Legacy sosyal mock: `aspect-video` (16/9)
- Avatar/profile placeholder: `aspect-square` / sabit square boyut

### Kanıt snippet (oran + grid)
```css
/* src/app/globals.css */
.grid-cards {
  @apply grid min-w-0 grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4 xl:gap-6;
}

.card-media {
  @apply aspect-[5/4] min-h-28 w-full;
}

@media (min-width: 48rem) {
  .card-media {
    aspect-ratio: 4 / 3;
    min-height: 9rem;
  }
}
```

---

## 1) Projede kaç kart var?
- Kart türü (archetype) sayısı: **19**
- Taxonomy sınıfı sayısı (aktif kullanılan): **7**
- Toplam usage count (envanterdeki usage path toplamı): **23**

## 2) Ölçüleri ve yapıları nasıl?
- Çoğu kart `rounded-xl + border + shadow-soft` ile aynı shell’i kullanıyor.
- Media slot’lu kartlarda `.card-media` merkezi bir token; oran davranışı mobile 5/4, md+ 4/3.
- Başlık/metin sıkıştırma yaklaşımı yaygın:
  - title: `truncate`
  - description: `line-clamp-1`
- Sapma:
  - Gallery kartında hover/focus davranışı yok (`src/app/(app)/galeri/page.tsx`), hub kartlarında var.
  - `Card` primitive kullanan bloklar (`iletisim`, `right-rail`) `shadow-sm` default + yerel `shadow-soft` override karışık.
  - Legacy sosyal mock tarafında medya oranı 16/9, app kartlarından farklı.

## 3) En ideal görsel ölçüleri hangi kartlarda en iyi sonuç verir?
- Gallery Card: **5/4 (mobile) -> 4/3 (md/xl)**
  - Sebep: mevcut grid yoğunluğu ve card başlık alanı ile en az kırpma/boşluk riski.
- Hub/Category Card: **5/4 (mobile) -> 4/3 (md/xl)**
  - Sebep: halihazırda `.card-media` ile uyumlu, ana sayfa + keşfet tutarlılığı sağlar.
- Artist Profile görsel placeholder: **1/1 (square)**
  - Sebep: avatar/portre beklentisi, metin hizası stabil.
- CTA/Info kartları: **görsel zorunlu değil**
  - ikon slotu yeterli; gereksiz media alanı dikey ritmi bozuyor.

## 4) V1 Kart Standardı (LOCK önerisi)
- `radius`: `rounded-xl`
- `border`: `border border-border`
- `shadow`: etkileşimli/content kartlarda `shadow-soft`; utility/info kartlarda `shadow-sm`
- `padding`:
  - media kart body: `p-3 sm:p-4`
  - standalone CTA/info: `p-4` (large CTA: `px-4 py-5 sm:px-6 sm:py-6`)
- `gap`:
  - medya metin bloğu: `gap-1`
  - list/profile info: `gap-3` / `gap-4`
- `hover/focus`:
  - interaktif card: `transition-colors hover:bg-accent/50`
  - focus: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- `title clamp standardı`:
  - title: `line-clamp-2` (şu anki `truncate` yerine, özellikle galeri/hub)
  - subtitle: `line-clamp-1`
- `media ratio token`:
  - `.card-media`: `aspect-[5/4] md:aspect-[4/3]`

## 5) Tutarsızlık listesi
- `src/app/(app)/galeri/page.tsx`: kartlar hover/focus/interaction almıyor; hub kartlarıyla davranış ayrışıyor.
- `src/app/(app)/kesfet/page.tsx` ve `src/app/(app)/page.tsx`: hub kart pattern’i duplicated (tek reusable component değil).
- `src/app/(app)/iletisim/page.tsx` + `src/components/app/right-rail.tsx`: `Card` primitive default shadow-sm ile `shadow-soft` mix kullanımı standardı belirsizleştiriyor.
- `src/components/legacy/social-mock/post-card.tsx` ve `src/components/legacy/social-mock/feed-list.tsx`: 16/9 media oranı app’in 5/4-4/3 standardından farklı.
- `src/app/(app)/artistler/page.tsx`: profil görsel alanı sabit `size-20`; breakpoint’e göre ölçek standardı tanımlı değil.

## 6) Aksiyon planı (V1, max 5)
1. `HubCard` benzeri pattern’leri tek reusable `AppMediaCard` bileşenine topla (home/kesfet/galeri).
2. `galeri` kartlarına interaktif state standardı ekle (`hover`, `focus-visible`, optional link wrapper).
3. Title/subtitle truncation’ı merkezi hale getir (`title line-clamp-2`, `subtitle line-clamp-1`).
4. `Card` primitive shadow standardını netleştir (`shadow-soft` vs `shadow-sm`) ve tek policy uygula.
5. Legacy 16/9 kartları ya arşivle ya da app standardına (5/4 -> 4/3) hizala.
