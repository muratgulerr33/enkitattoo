# PR-2: Hub Cards Polish v2 (Overflow/Truncation + Premium Footer Rhythm)

## Ne değişti
- Home ve Keşfet hub kartları tek shared bileşende toplandı: `src/components/hub/hub-card.tsx`.
- Başlık ve açıklama metinleri her koşulda tek satır (`truncate`) olacak şekilde `min-w-0` ile kilitlendi.
- Footer ritmi stabilize edildi: `min-h-[92px]`, `flex flex-col`, CTA `mt-auto`.
- CTA satırı tüm kartlarda tek standarda taşındı: `Tümünü gör` + `ChevronRight`.
- Light/Dark yüzey stilleri premium ve tutarlı hale getirildi.

## Neden
- 333/360/372px gibi dar ekranlarda başlık taşması/2 satıra kaçma ve CTA hizasızlığını kaldırmak.
- Home ile Keşfet arasında kart davranışını tek noktadan yönetmek.
- Görsel/metin/footer ritmini satır bağımsız stabil hale getirmek.

## Keşif kanıtı (varsayım yok)

### 1) Kart implementasyonu tekrarı
- Komut: `rg -n "function HubCard|export function HubCard|hub-card" src/components -S`
- Sonuç: Shared `HubCard` bulundu (`src/components/hub/hub-card.tsx`), ayrıca Home ve Keşfet usage tarafları farklı düzen taşıyordu.

### 2) Home + Keşfet kullanım kanıtı
Dosya: `src/app/(app)/page.tsx`
```tsx
{mainHubs.map((hub) => (
  <HubCard ... />
))}
```
Dosya: `src/app/(app)/kesfet/page.tsx`
```tsx
{mainHubCards.map((hub) => (
  <HubCard ... />
))}
```

## Semptom bazlı kanıt ve fix

### A) Başlık 2 satıra kaçıyordu
1. Ekran semantiği/semptom:
- Dar genişlikte (`333/360/372`) uzun başlıklar satır kırıp kart ritmini bozuyordu.
2. Dosya yolu:
- `src/components/hub/hub-card.tsx`
3. İlgili snippet (önce):
```tsx
<h2 className="line-clamp-1 text-base font-semibold text-foreground">...
```
4. Fix snippet:
```tsx
<h2
  className="min-w-0 truncate text-base font-semibold leading-tight text-foreground"
  title={titleTR}
>
  {titleTR}
</h2>
```

### B) Açıklama truncation tutarsızdı
1. Ekran semantiği/semptom:
- Bazı kartlarda açıklama satırı container genişliğine göre tutarsız kırpılıyordu.
2. Dosya yolu:
- `src/components/hub/hub-card.tsx`
3. İlgili snippet (önce):
```tsx
<p className="truncate text-sm text-muted-foreground">...
```
4. Fix snippet:
```tsx
<div className="min-w-0">
  ...
  <p className="min-w-0 truncate text-sm text-muted-foreground/90" title={descriptionTR}>
    {descriptionTR}
  </p>
</div>
```

### C) CTA satırı hizası kırılıyordu
1. Ekran semantiği/semptom:
- CTA bazı kartlarda farklı yükseklikte kalıyor, row hizası bozuluyordu.
2. Dosya yolu:
- `src/components/hub/hub-card.tsx`
3. İlgili snippet (önce):
```tsx
<div className="mt-2 flex items-center justify-between">...</div>
```
4. Fix snippet:
```tsx
<div className="mt-auto flex min-w-0 items-center justify-between gap-2 text-sm font-medium ...">
  <span className="min-w-0 truncate">Tümünü gör</span>
  <ChevronRight className="size-4 shrink-0" aria-hidden />
</div>
```

### D) Light/Dark surface farklılıkları
1. Ekran semantiği/semptom:
- Light’ta gölge/border sertlik farkı, dark’ta flat his kartlar arası değişebiliyordu.
2. Dosya yolu:
- `src/components/hub/hub-card.tsx`
3. İlgili snippet (önce):
```tsx
className="... bg-card ... shadow-[0_1px_10px...] ... dark:shadow-[0_1px_12px...]"
```
4. Fix snippet:
```tsx
className="... border border-border/60 bg-background shadow-sm ... dark:border-border/50 dark:bg-card/40 dark:shadow-none dark:hover:shadow-sm"
```

### E) Footer ritmi sabit değildi
1. Ekran semantiği/semptom:
- Başlık/description uzunluğuna göre footer yüksekliği oynuyor, grid ritmi kırılıyordu.
2. Dosya yolu:
- `src/components/hub/hub-card.tsx`
3. İlgili snippet (önce):
```tsx
<div className="flex flex-1 flex-col gap-1 rounded-b-2xl p-4">...</div>
```
4. Fix snippet:
```tsx
<div className="min-w-0 flex min-h-[92px] flex-1 flex-col gap-2 rounded-b-2xl border-t border-border/50 bg-background/95 p-4 dark:bg-card/30">
  ...
</div>
```

## Dar ekran + tema doğrulama kanıtı
- Home light/dark: `/tmp/hub-v2-home-light-{333,360,372,430}.png`, `/tmp/hub-v2-home-dark-{333,360,372,430}.png`
- Keşfet light/dark: `/tmp/hub-v2-kesfet-light-{333,360,372,430}.png`, `/tmp/hub-v2-kesfet-dark-{333,360,372,430}.png`
- Toplam 16 screenshot üretildi.

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

## Risk
- Footer min-height (`92px`) bazı çok kısa başlıklarda dikey boşluk hissini artırabilir; ancak grid ritmi için bilinçli tradeoff.
- Shared komponent değişikliği, Home/Keşfet kartlarının CTA dilini tek standarda kilitler.

## Değişen dosyalar
- `src/components/hub/hub-card.tsx`
- `src/app/(app)/page.tsx`
- `src/app/(app)/kesfet/page.tsx`
- `docs/locks/ui-hub-card-typography-lock.md`
- `docs/output/pr-2-hub-cards-polish-v2.md`

## Commit mesaj önerisi
`fix(hub): enforce single-line titles + stable footer rhythm`
