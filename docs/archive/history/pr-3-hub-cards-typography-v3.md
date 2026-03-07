# PR-3 — Hub Cards Typography v3 (Home + Keşfet)

## Ne değişti
- `HubCard` başlık ve açıklama metinleri tek satır ellipsis garantisiyle kilitlendi.
- Title ve description için tooltip (`title`) korunarak taşma durumunda tam metin erişimi bırakıldı.
- Kart item parent zincirinde (`Home` + `Keşfet`) `min-w-0` zorunlu hale getirildi.
- CTA satırına hafif press feedback eklendi (`group-active:scale-[0.99]`) ve transition genişletildi.
- Kart surface/radius yapısı korunarak (soft border/shadow, `rounded-2xl`, media `overflow-hidden`) tutarlılık devam ettirildi.

## Neden
- 320/333/360/372/430 genişliklerinde başlık ve alt açıklama taşmalarını kökten engellemek.
- Home ve Keşfet’te aynı kart davranışını aynı bileşen kontratıyla garantilemek.

## Değişen dosyalar
- `src/components/hub/hub-card.tsx`
- `src/app/(app)/page.tsx`
- `src/app/(app)/kesfet/page.tsx`
- `docs/locks/ui-hub-card-typography-lock.md`
- `docs/output/pr-3-hub-cards-typography-v3.md`

## Kritik snippet'ler

### 1) Title/Desc single-line ellipsis guarantee
```tsx
<h2
  className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold leading-tight text-foreground"
  title={titleTR}
>
  {titleTR}
</h2>
<p
  className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-foreground/70 dark:text-foreground/65"
  title={descriptionTR}
>
  {descriptionTR}
</p>
```

### 2) Parent `min-w-0` rule (Home + Keşfet)
```tsx
<div className="grid-cards">
  {mainHubs.map((hub) => (
    <div key={hub.id} className="min-w-0">
      <HubCard ... />
    </div>
  ))}
</div>
```

### 3) CTA baseline + press feedback
```tsx
<div className="mt-auto flex min-w-0 items-center justify-between gap-2 text-sm font-medium text-foreground/80 transition-[color,transform] duration-150 group-hover:text-foreground group-active:scale-[0.99]">
  <span className="min-w-0 truncate">Tümünü gör</span>
  <ChevronRight className="size-4 shrink-0" aria-hidden />
</div>
```

## Screenshot kanıtları
- `/tmp/hub-v3-home-light-320.png`
- `/tmp/hub-v3-home-light-333.png`
- `/tmp/hub-v3-home-light-360.png`
- `/tmp/hub-v3-home-light-372.png`
- `/tmp/hub-v3-home-light-430.png`
- `/tmp/hub-v3-home-dark-320.png`
- `/tmp/hub-v3-home-dark-333.png`
- `/tmp/hub-v3-home-dark-360.png`
- `/tmp/hub-v3-home-dark-372.png`
- `/tmp/hub-v3-home-dark-430.png`
- `/tmp/hub-v3-kesfet-light-320.png`
- `/tmp/hub-v3-kesfet-light-333.png`
- `/tmp/hub-v3-kesfet-light-360.png`
- `/tmp/hub-v3-kesfet-light-372.png`
- `/tmp/hub-v3-kesfet-light-430.png`
- `/tmp/hub-v3-kesfet-dark-320.png`
- `/tmp/hub-v3-kesfet-dark-333.png`
- `/tmp/hub-v3-kesfet-dark-360.png`
- `/tmp/hub-v3-kesfet-dark-372.png`
- `/tmp/hub-v3-kesfet-dark-430.png`

## Build
- Komut: `npm run build`
- Sonuç: Başarılı (`Compiled successfully`, static generation tamamlandı).
