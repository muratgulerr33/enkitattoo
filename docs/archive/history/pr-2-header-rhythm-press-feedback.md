# PR-2 — Header Rhythm + Tap/Press Feedback Standardı (Light/Dark)

## What
- Mobil header/top action ikonları için shared `IconButton` primitive eklendi.
- Top row actionlar (hamburger, back, search, language, contact, drawer close) `IconButton` ile standardize edildi.
- Mobile tab satırında press feedback + active kontrast/indicator netleştirildi.
- Header ritmi için alt tab yüksekliği 52px'e çekildi; üst satır 56px korundu.
- Header hide/show fallback yüksekliği yeni toplam ritme göre güncellendi (`108`).

## Why
- 2026 mobile pattern’lerine uygun 44px+ touch target standardını tek noktadan uygulamak.
- Pressed hissini her header/nav etkileşiminde tutarlı hale getirmek.
- Light/Dark kontrastını tek token ailesiyle koruyup aktif state okunurluğunu artırmak.

## Risk
- `IconButton` shared primitive olduğu için header dışı kullanım eklenirse aynı davranışı devralır (beklenen).
- Tab satırı yüksekliği 56px -> 52px geçişi header toplam offsetini etkiler; `--app-mobile-header-h` formülü korunarak bu risk azaltıldı.

## Değişen dosyalar
- `src/components/ui/icon-button.tsx` (yeni)
- `src/components/app/mobile-header.tsx`
- `src/app/globals.css`
- `docs/locks/ui-header-rhythm-press-feedback-lock.md`
- `docs/output/pr-2-header-rhythm-press-feedback.md`

## Kritik snippet'ler

### 1) Shared IconButton (44px+, press, focus, active)
```tsx
const baseClassName =
  "relative inline-flex ... duration-150 active:scale-[0.97] ... after:* focus-visible:ring-2 ...";

className={cn(
  baseClassName,
  sizeClassMap[size], // md: h-11 w-11
  variantClassMap[variant],
  isActive
    ? "bg-muted/60 text-foreground after:opacity-100 dark:bg-white/12 dark:text-foreground"
    : "after:opacity-0"
)}
```

### 2) Top header icon render standardı
```tsx
<IconButton ariaLabel="Menüyü aç" size="md" isActive={hamburgerOpen}>
  <Menu className="size-[22px]" aria-hidden />
</IconButton>

<IconButton ariaLabel="Ara" size="md" isActive={searchOpen}>
  <IconSearch size={20} />
</IconButton>
```

### 3) Bottom tab press + active styling
```tsx
className={cn(
  "group relative flex min-h-11 flex-1 ... duration-150 active:scale-[0.97] active:bg-muted/60 dark:active:bg-white/10",
  isActive
    ? "bg-muted/45 text-foreground dark:bg-white/10"
    : "text-foreground/65 hover:bg-muted/35 hover:text-foreground dark:text-foreground/70 dark:hover:bg-white/5"
)}
```

### 4) Header rhythm tokens
```css
--app-mobile-topbar-h: 56px;
--app-mobile-tabbar-h: 52px;
--app-mobile-header-h: calc(var(--app-mobile-topbar-h) + var(--app-mobile-tabbar-h));
```

## Screenshot path list (local)
- `/tmp/pr-2-header-home-light-430x932.png`
- `/tmp/pr-2-header-home-dark-430x932.png`
- `/tmp/pr-2-header-kesfet-light-430x932.png`
- `/tmp/pr-2-header-kesfet-dark-430x932.png`
- `/tmp/pr-2-header-piercing-light-430x932.png`
- `/tmp/pr-2-header-piercing-dark-430x932.png`
- `/tmp/pr-2-header-drawer-light-430x932.png`
- `/tmp/pr-2-header-drawer-dark-430x932.png`

## Test
- Komut: `npm run build`
- Sonuç: Başarılı (`Compiled successfully`, static generation tamamlandı).
