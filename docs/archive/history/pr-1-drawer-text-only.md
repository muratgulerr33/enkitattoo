# PR-1 — Mobile Drawer Navigation Cleanup (Text-only + 44px hit-area + press feedback)

## Ne değişti
- Mobil drawer menü satırları için tek bir `MenuRow` standardı eklendi (`src/components/app/mobile-header.tsx`).
- Drawer ana menü ve `Özel` bölümündeki satırlardan ikonlar kaldırıldı; satırlar text-only hale getirildi.
- Tüm drawer satırları `h-11` (>=44px) hit-area standardına taşındı.
- Satırlara press feedback eklendi: `active:bg-*` + `active:scale-[0.99]`.
- Aktif route görünürlüğü güçlendirildi (`bg-muted/60 dark:bg-white/10`, `font-semibold`, `aria-current="page"`).
- `Tema` alanı büyük buton görünümünden çıkarıldı; aynı liste ritminde kompakt row + sağda aktif tema metni olacak şekilde dropdown row’a çevrildi.
- Drawer close (X) butonu `h-11 w-11` hit-area ile güncellendi.
- Bölüm ayraçları hafifletildi (`border-border/60`).
- Drawer altındaki WhatsApp CTA korundu; hit-area/radius drawer ritmine hizalandı (`h-11 rounded-xl`).

## Neden
- Mobilde native-app hissine uygun, daha az gürültülü ve daha net basılabilir navigasyon sağlamak.
- Drawer içinde tek satır stiliyle (SSOT) bakım kolaylığı ve görsel tutarlılık oluşturmak.

## Değişen dosyalar
- `src/components/app/mobile-header.tsx`
- `docs/output/pr-1-drawer-text-only.md`
- `docs/locks/ui-drawer-navigation-lock.md`

## Önce / Sonra davranış
1. Önce: Drawer menü satırlarında ikon + text vardı.
   Sonra: Drawer menü satırları text-only (`MenuRow`).
2. Önce: Satır yükseklikleri ve basılabilir alanlar heterojendi.
   Sonra: Tüm satırlar `h-11` ile 44px+ target oldu.
3. Önce: Press anında geri bildirim zayıftı.
   Sonra: `active:bg-*` ve `active:scale-[0.99]` ile hafif basış hissi eklendi.
4. Önce: Aktif route satırı sınırlı şekilde ayrışıyordu.
   Sonra: Arka plan + font ağırlığı ile daha belirgin hale geldi.
5. Önce: Theme toggle drawer ritminden kopuk, büyük buton gibi görünüyordu.
   Sonra: `Tema` bölümü içinde kompakt bir row trigger + sağda aktif tema etiketi kullanılıyor.

## Kritik snippet’ler

### 1) Tek satır standardı (`MenuRow`)
```tsx
const MENU_ROW_BASE =
  "flex h-11 w-full items-center gap-3 rounded-xl px-4 text-base font-medium transition-[background-color,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]";

function MenuRow({ href, label, isActive, onClick }: MenuRowProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        MENU_ROW_BASE,
        "active:bg-muted/70 dark:active:bg-white/15",
        isActive
          ? "bg-muted/60 font-semibold text-foreground dark:bg-white/10"
          : "text-foreground/80 hover:bg-muted/40 dark:hover:bg-white/5"
      )}
    >
      <span>{label}</span>
    </Link>
  );
}
```

### 2) Close butonu 44px hit-area
```tsx
<SheetClose asChild>
  <Button
    type="button"
    variant="ghost"
    className="h-11 w-11 rounded-xl p-0"
    aria-label="Menüyü kapat"
  >
    <X className="size-5" aria-hidden />
  </Button>
</SheetClose>
```

### 3) Tema satırı (kompakt row)
```tsx
<DropdownMenuTrigger asChild>
  <button
    type="button"
    aria-label="Tema seç"
    className={cn(
      MENU_ROW_BASE,
      "justify-between text-foreground/80 hover:bg-muted/40 dark:hover:bg-white/5 active:bg-muted/70 dark:active:bg-white/15"
    )}
  >
    <span>Tema</span>
    <span className="text-sm text-muted-foreground">{activeThemeLabel}</span>
  </button>
</DropdownMenuTrigger>
```

## Build sonucu
- Komut: `npm run build`
- Sonuç: Başarılı (`next build` tamamlandı, static page generation tamamlandı).

## Not
- CLI ortamında gerçek cihaz viewport görsel doğrulaması yapmadım. Kod seviyesinde drawer satırları `h-11`, text-only ve press-feedback sınıfları ile uygulanmış durumda.
