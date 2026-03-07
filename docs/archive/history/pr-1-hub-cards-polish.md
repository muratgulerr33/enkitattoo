# PR-1 Cila: Home + Keşfet Hub Kartları (Premium tutarlılık)

## Ne değişti
- Home ve Keşfet hub kartları tek shared bileşende birleştirildi: `src/components/hub/hub-card.tsx`.
- Kart başlığı ve açıklama metinleri tek satıra kilitlendi; taşan metin için `title` attribute eklendi.
- CTA satırı tüm kartlarda tek standarda taşındı: `Tümünü gör + ChevronRight`.
- Kart surface (radius/border/shadow) light/dark için premium tutarlılıkta sabitlendi.
- Görsel alan + metin alanı ritmi (4:5 media, `p-4` text block) her kartta aynı hale getirildi.

## Neden
- Kartlarda satır kırılması, CTA tutarsızlığı ve surface farklılıklarını kaldırmak.
- Home ve Keşfet’te aynı kart davranışını tek noktadan yönetmek.
- Regresyon riskini azaltmak (tek komponent).

## Keşif: Tek kaynak kararı (kanıt)

### Tespit
- Kart markup’ı iki yerde tekrar ediyordu (`/` ve `/kesfet`).

### Dosya yolu
- `src/app/(app)/page.tsx`
- `src/app/(app)/kesfet/page.tsx`

### İlgili snippet (önce)
```tsx
// src/app/(app)/page.tsx
<Link ... className="... rounded-xl ...">
  <div className="card-media-hub ..." />
  <div className="... p-3 sm:p-4">...</div>
</Link>

// src/app/(app)/kesfet/page.tsx
function HubCard(...) {
  return <Link ... className="... rounded-xl ...">...</Link>
}
```

### Fix snippet
```tsx
// src/components/hub/hub-card.tsx
export function HubCard(...) { ... }

// src/app/(app)/page.tsx ve src/app/(app)/kesfet/page.tsx
<HubCard titleTR={hub.titleTR} slug={hub.slug} href={...} descriptionTR={hub.descriptionTR} />
```

## Before/After semptom listesi

### A) Başlıklar 2 satıra düşüp kart ritmini bozuyordu
1) Ekran semantiği/semptom:
- Home/Keşfet gridinde uzun başlıklar (ör. `Traditional / Old School`, `Minimal & Fine Line`) kart yüksekliğini oynatıyordu.
2) Dosya yolu:
- `src/app/(app)/page.tsx`, `src/app/(app)/kesfet/page.tsx`
3) İlgili snippet (önce):
```tsx
<span className="t-small ...">{hub.titleTR}</span>
<h2 className="t-h4 text-foreground">{titleTR}</h2>
```
4) Fix snippet:
```tsx
// src/components/hub/hub-card.tsx
<h2 className="line-clamp-1 text-base font-semibold text-foreground" title={titleTR}>
  {titleTR}
</h2>
```

### B) Açıklama satırı kartlar arası tutarsızdı
1) Ekran semantiği/semptom:
- Bazı kartlarda description davranışı farklı; bazı kartlarda tek satır kırpma ritmi bozuktu.
2) Dosya yolu:
- `src/app/(app)/page.tsx`, `src/app/(app)/kesfet/page.tsx`
3) İlgili snippet (önce):
```tsx
<p className="t-caption line-clamp-1 text-muted-foreground">...</p>
<p className="t-muted line-clamp-1">...</p>
```
4) Fix snippet:
```tsx
// src/components/hub/hub-card.tsx
<p className="truncate text-sm text-muted-foreground" title={descriptionTR}>
  {descriptionTR}
</p>
```

### C) CTA satırı/hizası tutarsızdı
1) Ekran semantiği/semptom:
- Bazı kartlarda CTA satırı görünmüyor veya farklı stil/hizada duruyordu (özellikle Home special kartları).
2) Dosya yolu:
- `src/app/(app)/page.tsx`
3) İlgili snippet (önce):
```tsx
// Home special kartında CTA yoktu
<div className="flex flex-1 items-center p-3 sm:p-4">
  <span className="t-small ...">{hub.titleTR}</span>
</div>
```
4) Fix snippet:
```tsx
// src/components/hub/hub-card.tsx
<div className="mt-2 flex items-center justify-between">
  <span className="sr-only">Hub aksiyonu</span>
  <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground/80 transition-colors group-hover:text-foreground">
    Tümünü gör
    <ChevronRight className="size-4" aria-hidden />
  </span>
</div>
```

### D) Light/Dark surface hissi tutarsızdı
1) Ekran semantiği/semptom:
- Light’ta border/shadow bazı kartlarda zayıf, dark’ta kartlar flat kalabiliyordu.
2) Dosya yolu:
- `src/app/(app)/page.tsx`, `src/app/(app)/kesfet/page.tsx`
3) İlgili snippet (önce):
```tsx
className="... rounded-xl border border-border bg-surface-2 shadow-soft ..."
```
4) Fix snippet:
```tsx
// src/components/hub/hub-card.tsx
className="... rounded-2xl border border-border/60 bg-card shadow-[0_1px_10px_rgba(0,0,0,0.06)] ... dark:border-border/50 dark:shadow-[0_1px_12px_rgba(0,0,0,0.35)]"
```

### E) Görsel/metin blok ritmi tutarsızdı
1) Ekran semantiği/semptom:
- Kartlar arasında media/text padding ve üst-alt radius ritmi farklıydı.
2) Dosya yolu:
- `src/app/(app)/page.tsx`, `src/app/(app)/kesfet/page.tsx`
3) İlgili snippet (önce):
```tsx
<div className="card-media-hub ..." />
<div className="... p-3 sm:p-4">...</div>
```
4) Fix snippet:
```tsx
// src/components/hub/hub-card.tsx
<div className="card-media-hub relative overflow-hidden rounded-t-2xl ...">...</div>
<div className="flex flex-1 flex-col gap-1 rounded-b-2xl p-4">...</div>
```

## Light/Dark hızlı görsel doğrulama
- Home light: `/tmp/home-hub-polish-light.png`
- Home dark: `/tmp/home-hub-polish-dark.png`
- Keşfet light: `/tmp/kesfet-hub-polish-light.png`
- Keşfet dark: `/tmp/kesfet-hub-polish-dark.png`

## Risk
- Shared component’e geçiş nedeniyle Home/Keşfet kartlarının hepsi aynı CTA dilini kullanır; ürün tarafı farklı metin isterse prop ile ayrıştırmak gerekir.
- `specialHubs` görselleri map dışındaysa fallback gradient görünmeye devam eder (beklenen davranış).

## Test
1. Build
- Komut: `npm run build`
- Sonuç: Başarılı.

2. Build özeti
```text
✓ Compiled successfully
✓ Generating static pages (34/34)
└ ○ /, ○ /kesfet
```

## Değişen dosyalar
- `src/components/hub/hub-card.tsx`
- `src/app/(app)/page.tsx`
- `src/app/(app)/kesfet/page.tsx`
- `docs/locks/ui-hub-card-typography-lock.md`
- `docs/output/pr-1-hub-cards-polish.md`
