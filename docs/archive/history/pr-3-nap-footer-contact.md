# PR-3 — NAP + Google Maps + Contact + Footer Consistency (GBP Local SEO)

## Ne değişti
- NAP/saat/harita/geo için tek kaynak eklendi: `src/lib/site-info.ts`.
- `LocalBusiness` structured data eklendi (`@type: TattooParlor`) ve `(app)` layout seviyesinde render edildi.
- Footer, 3-slot yapıya taşındı:
  1. marka + NAP + saat + telefon + harita
  2. sosyal ikonlar
  3. copyright
- `/iletisim` sayfası NAP kartı + lazy map iframe + yol tarifi/ara/WhatsApp CTA ile yenilendi.
- Home mini contact strip ve right rail NAP gösterimi `SITE_INFO` üzerinden standardize edildi.
- Maps business URL sabiti `SITE_INFO.googleMapsUrl` ile tekilleştirildi.

## Neden
- GBP Local SEO için footer/contact/home gibi yüzeylerde NAP metnini birebir aynı ve tek kaynaktan üretmek.
- Harita embed performansını (`loading="lazy"`) ve layout stabilitesini (sabit oranlı container) garanti etmek.
- UI tarafında mobile-first hit-area ve press feedback ile etkileşim tutarlılığı sağlamak.

## Risk
- `SITE_INFO` merkezi olduğu için yanlış güncelleme tüm yüzeyleri etkiler (istenen ama kritik etki).
- `(app)` layout’ta JSON-LD eklendiği için bu segmentteki tüm sayfalarda script render edilir (beklenen davranış).

## Değişen dosyalar
- `src/lib/site-info.ts`
- `src/components/seo/local-business-jsonld.tsx`
- `src/components/app/site-footer.tsx`
- `src/components/app/app-footer.tsx`
- `src/app/(app)/iletisim/page.tsx`
- `src/app/(app)/page.tsx`
- `src/components/app/right-rail.tsx`
- `src/lib/site/links.ts`
- `src/lib/mock/enki.ts`
- `docs/locks/ui-nap-footer-contact-lock.md`
- `docs/output/pr-3-nap-footer-contact.md`

## Kanıt (dosya + snippet)

### 1) SSOT NAP
Dosya: `src/lib/site-info.ts`
```ts
export const SITE_INFO = {
  name: "Enki Tattoo Studio Mersin",
  addressText: "İnönü, 1404. Sk. no:17 D:E, 33130 Yenişehir/Mersin",
  openingHoursText: "Hafta içi 10:00–20:00 • Pazar 12:00–20:00",
  googleMapsUrl: "https://maps.app.goo.gl/jQk7m7YNVXsoHitG9",
  googleMapsEmbedSrc: "https://www.google.com/maps/embed?...",
  geo: { lat: 36.78203996872248, lng: 34.59194307625566 }
} as const;
```

### 2) JSON-LD
Dosya: `src/components/seo/local-business-jsonld.tsx`
```tsx
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "TattooParlor",
  name: SITE_INFO.name,
  address: { "@type": "PostalAddress", ... },
  openingHoursSpecification: [
    { dayOfWeek: SITE_INFO.openingHours.weekday, opens: "10:00", closes: "20:00" },
    { dayOfWeek: SITE_INFO.openingHours.sunday, opens: "12:00", closes: "20:00" }
  ]
}
```

### 3) JSON-LD mount (/iletisim)
Dosya: `src/app/(app)/iletisim/page.tsx`
```tsx
<div className="app-section no-overflow-x">
  <LocalBusinessJsonLd />
  ...
</div>
```

### 4) Footer 3-slot + NAP
Dosya: `src/components/app/site-footer.tsx`
```tsx
<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_auto_auto]">
  <section>... {SITE_INFO.addressText} ... {SITE_INFO.openingHours.weekdayLabel} ...</section>
  <section>... sosyal ikonlar ...</section>
  <section>© {currentYear} Enki Tattoo Studio ...</section>
</div>
```

### 5) Contact map performans + NAP CTA
Dosya: `src/app/(app)/iletisim/page.tsx`
```tsx
<div className="relative ... aspect-[16/9] min-h-[260px]">
  <iframe
    src={SITE_INFO.googleMapsEmbedSrc}
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    allowFullScreen
  />
</div>
<a href={SITE_INFO.googleMapsUrl}>Yol tarifi al</a>
```

## Keşif kanıtı (istenen rg)
Komut:
```bash
rg -n "1405|1404|Yenişehir|Mersin, Yenişehir|İletişim|iletisim|maps.app.goo.gl|google.com/maps/embed" src
```
Özet:
- NAP/maps eşleşmeleri `src/lib/site-info.ts` içinde.
- Contact route eşleşmeleri `src/app/(app)/iletisim/page.tsx` içinde.
- Eski adres formatı (`1405`) bulunmadı.

## Eski adres/saat string temizliği (rg kanıtı)
Komut:
```bash
rg -n "1405\. Sok|Mersin, Yenişehir, 1405\. Sok\., 31C|Açık • 22:00'ye kadar" src
```
Çıktı:
```text
NO_MATCH
```

## JSON-LD runtime kanıtı
Komut:
```bash
curl -sS http://127.0.0.1:3002/iletisim | rg -n "application/ld\+json|TattooParlor|openingHoursSpecification"
```
Özet çıktı:
```text
<script type="application/ld+json">{"@context":"https://schema.org","@type":"TattooParlor",..."openingHoursSpecification":[...]}</script>
```

## Screenshot path list
- `/tmp/pr-3-home-light.png`
- `/tmp/pr-3-home-dark.png`
- `/tmp/pr-3-iletisim-light.png`
- `/tmp/pr-3-iletisim-dark.png`

## Cila: CTA overflow fix (mobile-safe)

### Değişen dosyalar (cila)
- `src/app/(app)/iletisim/page.tsx`
- `docs/locks/ui-nap-footer-contact-lock.md`
- `docs/output/pr-3-nap-footer-contact.md`

### Neden
- `/iletisim` NAP kartındaki CTA satırında mobilde sağa taşma vardı; `Yol tarifi` butonu viewport dışına çıkabiliyordu.

### Önce / Sonra
Önce:
```tsx
<div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
  <a className={`${contactActionClass} ...`}>Ara</a>
  <div className="grid min-w-0 grid-cols-2 gap-2 sm:col-span-2">...</div>
</div>
```

Sonra:
```tsx
<div className="mt-5 grid grid-cols-2 gap-2">
  <a className={`${contactActionClass} col-span-2 ...`}>Ara</a>
  <a className={`${contactActionClass} ...`}>WhatsApp</a>
  <a className={`${contactActionClass} ...`}>
    <Navigation className="size-4 shrink-0" aria-hidden />
    <span className="min-w-0 truncate">Yol tarifi</span>
  </a>
</div>
```

### Uygulama (snippet)
Dosya: `src/app/(app)/iletisim/page.tsx`
```tsx
const contactActionClass =
  "... min-h-11 w-full min-w-0 ... transition-[transform,...] ... active:scale-[0.99] ...";

<div className="mt-5 grid grid-cols-2 gap-2">
  <a href={PHONE_TEL_URL} className={`${contactActionClass} col-span-2 bg-muted/65 hover:bg-muted`}>
    <Phone className="size-4" aria-hidden />
    <span className="min-w-0 truncate">Ara</span>
  </a>
  <a className={`${contactActionClass} bg-primary text-primary-foreground hover:bg-primary/90`}>
    <span className="min-w-0 truncate">WhatsApp</span>
  </a>
  <a className={`${contactActionClass} border border-border bg-background hover:bg-muted/45 dark:hover:bg-white/10`}>
    <Navigation className="size-4 shrink-0" aria-hidden />
    <span className="min-w-0 truncate">Yol tarifi</span>
  </a>
</div>
```

Ek not:
- CTA kartından sonra harita kartına `mt-3 xl:mt-0` spacing eklendi.

### Overflow kanıtı (JS metrik)
Dosya: `/tmp/pr-3-iletisim-overflow-check.json`
- 320/333/360/372/430 genişliklerinde, light+dark toplam 10 kombinasyonda:
  - `document.documentElement.scrollWidth === window.innerWidth`
  - `hasOverflow: false`

### Screenshot path list (cila)
- `/tmp/pr-3-iletisim-light-320.png`
- `/tmp/pr-3-iletisim-dark-320.png`
- `/tmp/pr-3-iletisim-light-333.png`
- `/tmp/pr-3-iletisim-dark-333.png`
- `/tmp/pr-3-iletisim-light-360.png`
- `/tmp/pr-3-iletisim-dark-360.png`
- `/tmp/pr-3-iletisim-light-372.png`
- `/tmp/pr-3-iletisim-dark-372.png`
- `/tmp/pr-3-iletisim-light-430.png`
- `/tmp/pr-3-iletisim-dark-430.png`

## Test
- Komut: `npm run build`
- Sonuç: Başarılı (`Compiled successfully`, static generation `34/34`).
