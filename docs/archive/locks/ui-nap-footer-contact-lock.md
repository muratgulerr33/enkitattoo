# LOCK: NAP + Footer + Contact + Local SEO (GBP)

## Scope
- SSOT data: `src/lib/site-info.ts`
- Footer UI: `src/components/app/site-footer.tsx` (via `src/components/app/app-footer.tsx`)
- Contact page: `src/app/(app)/iletisim/page.tsx`
- JSON-LD: `src/components/seo/local-business-jsonld.tsx`

## NAP SSOT Lock
- Adres, çalışma saatleri, maps link/embed ve geo koordinatlar yalnızca `SITE_INFO` üzerinden alınır.
- Footer, `/iletisim`, home/contact strip, right rail gibi yüzeylerde hardcoded NAP metni kullanılmaz.
- Canonical işletme adı: `Enki Tattoo Studio Mersin`.

## Footer 3-Slot Lock
- Slot 1: brand + işletme adı + adres + çalışma saatleri + telefon + harita linki.
- Slot 2: sosyal ikon bağlantıları.
- Slot 3: `© {year} Enki Tattoo Studio` + `Tüm hakları saklıdır.`
- Mobile: stacked; desktop: 3 kolon.

## Contact Page Lock
- `/iletisim` içinde NAP kartı + saat + tel/WhatsApp/Yol tarifi CTA zorunlu.
- Contact CTA row: mobile 2-row grid, no horizontal overflow.
- CTA container `grid grid-cols-2 gap-2`; `Ara` butonu `col-span-2`, alt satırda `WhatsApp` + `Yol tarifi`.
- CTA buton standardı: `min-h-11 w-full min-w-0` + label `truncate` + press feedback `active:scale-[0.99]` (+ transition).
- 320/333/360/372/430 px genişliklerinde light+dark testlerinde yatay taşma olmamalı (`scrollWidth === innerWidth`).
- Harita iframe:
  - `src = SITE_INFO.googleMapsEmbedSrc`
  - `loading="lazy"`
  - `allowFullScreen`
  - `referrerPolicy="no-referrer-when-downgrade"`
  - responsive ve sabit oranlı container (CLS önlemek için).

## Local SEO JSON-LD Lock
- JSON-LD tek bileşen: `LocalBusinessJsonLd`.
- Veri kaynağı tamamen `SITE_INFO`.
- Tür: `TattooParlor`.
- `openingHoursSpecification`:
  - Mon-Fri 10:00-20:00
  - Sun 12:00-20:00
- `/iletisim` sayfası içinde render edilir.

## Interaction/A11y Lock
- Footer/contact interaktif elemanları minimum `44px+` hit area.
- Press feedback zorunlu (`active:scale` + color/bg response).
- İkon/linklerde `aria-label` korunur.
