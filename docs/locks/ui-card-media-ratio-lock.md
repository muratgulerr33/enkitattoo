LOCK: Card Media Ratios (Hub vs Gallery)

- Hub/Kategori kart media: 4:5 (AI kapaklar için)
- Galeri iş kart media: 3:4 (dikey foto kaynakları için)
- Legacy: card-media 5/4 korunur (kalan kullanım tespit edilene kadar)

Neden:
- UX: dikey kaynak foto için minimum kırpma, daha tutarlı grid
- Performans: tek oran -> stabil CLS, predictable layout
- A11y: kart tap hedefleri değişmez, sadece medya oranı

Kanıt:
- `src/app/globals.css` içinde `.card-media-hub`, `.card-media-gallery`, `.card-media` tanımları
- `src/app/(app)/page.tsx` hub ve ozel kart media siniflari
- `src/app/(app)/kesfet/page.tsx` hub kart media sinifi
- `src/app/(app)/galeri-tasarim/page.tsx` galeri card media wrapper + Next/Image

Uygulama Notu:
- Degisen dosyalar:
  - `src/app/globals.css`
  - `src/app/(app)/page.tsx`
  - `src/app/(app)/kesfet/page.tsx`
  - `src/app/(app)/galeri-tasarim/page.tsx`
  - `public/gallery/README.md`
  - `docs/01-design-system-styleguide.md`
  - `docs/locks/ui-card-media-ratio-lock.md`
