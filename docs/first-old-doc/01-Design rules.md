# 01 — Design Rules (Enki Tattoo Web)

Bu doküman, projedeki tüm UI kararlarının **tek kaynak** dokümanıdır.
Hedef: **shadcn/ui + Tailwind v4** ile bütün UI’yi **semantic token** üzerinden çalıştırmak ve light temada “parlak beyaz” hissini bitirmek.

---

## 1) Temel hedefler

- **Hard-coded renk yok:** `bg-white`, `text-zinc-*`, `border-gray-*` vb. kullanılmayacak.
- **Sadece semantic token:** `bg-background`, `text-foreground`, `border-border`, `ring-ring` vb.
- **Light zemin paper/off-white:** `--background` tam beyaza yaklaşmayacak.
- **Dark & light aynı dil:** yüzey hiyerarşisi aynı kalacak (background → surface-1 → surface-2 → card/popover).

---

## 2) Teknik gereksinimler (proje kurulumunda kilit)

White-label tema kurallarıyla birebir uyum (style: **new-york**, **cssVariables: true**, **baseColor: neutral**).  
(Kaynak: White Label — UI Tema ve Tasarım Kuralları Raporu)

| Gereksinim | Not |
|---|---|
| Tailwind | v4 |
| PostCSS | `@tailwindcss/postcss` |
| shadcn/ui | `new-york`, `cssVariables: true`, `baseColor: neutral` |
| Next.js | App Router |
| Theme | `next-themes` (`attribute="class"`, system default) |
| Animasyon | `tw-animate-css` |
| Utils | `class-variance-authority`, `clsx`, `tailwind-merge` |

---

## 3) Dosya standardı (minimum set)

### 3.1 `src/app/globals.css` (zorunlu)
- `@import "tailwindcss";`
- `@import "tw-animate-css";`
- `@custom-variant dark (&:is(.dark *));`
- `@theme inline { ... }`: Tailwind token’larının CSS variable’lara eşlenmesi
- `:root` (light) + `.dark` (dark) ham token’lar
- `@layer base` + tipografi utilities

> Not: white-label yapısında ayrı `tailwind.config.*` yok; token’lar doğrudan CSS içinden besleniyor.

### 3.2 Root layout (zorunlu)
- `next/font` ile font variable’ları
- `<body className="antialiased bg-background text-foreground font-sans">`

### 3.3 ThemeProvider (zorunlu)
- `next-themes`
- `attribute="class"`
- `defaultTheme="system"`
- `disableTransitionOnChange`

> storageKey: white-label örneğinde `nandd-theme`. Bu projede **tek bir key** seçip sabitleyin (ör. `enki-theme`).

---

## 4) Token haritası (Tailwind ↔ CSS variables)

Aşağıdaki eşleme, class’ların semantic çalışmasını sağlar. (white-label ile aynı)

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface-1: var(--surface-1);
  --color-surface-2: var(--surface-2);

  --shadow-soft: 0 1px 3px 0 oklch(0 0 0 / 0.06), 0 1px 2px -1px oklch(0 0 0 / 0.06);
  --shadow-popover: 0 4px 6px -1px oklch(0 0 0 / 0.08), 0 2px 4px -2px oklch(0 0 0 / 0.06);

  --font-sans: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-geist), ui-sans-serif, system-ui, sans-serif;

  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);

  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);

  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);

  --color-overlay: var(--overlay);
  --color-overlay-strong: var(--overlay-strong);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
}
```

---

## 5) Light/Dark ham token seti (Neutral)

### 5.1 Mevcut baseline (white-label neutral)
Aşağıdaki değerler, white-label raporundan alınmıştır (baseColor: neutral).

```css
:root {
  color-scheme: light;
  --radius: 0.65rem;

  --background: oklch(0.987 0.004 88);
  --foreground: oklch(0.170 0.002 89);

  --card: oklch(0.993 0.002 88);
  --card-foreground: var(--foreground);
  --popover: oklch(0.993 0.002 88);
  --popover-foreground: var(--foreground);

  --primary: oklch(0.488 0.243 264.376);
  --primary-foreground: oklch(0.985 0 0);

  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);

  --muted: oklch(0.962 0.005 88);
  --muted-foreground: oklch(0.460 0.012 89);

  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);

  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);

  --overlay: oklch(0 0 0 / 40%);
  --overlay-strong: oklch(0 0 0 / 50%);

  --border: oklch(0.928 0.004 88);
  --input: oklch(0.928 0.004 88);
  --ring: oklch(0.708 0 0);

  --surface-1: oklch(0.99 0.003 88);
  --surface-2: oklch(0.995 0.002 88);
}
.dark {
  color-scheme: dark;

  --background: oklch(0.244 0 0);
  --foreground: oklch(0.970 0 0);

  --card: oklch(0.293 0 0);
  --card-foreground: var(--foreground);
  --popover: oklch(0.293 0 0);
  --popover-foreground: var(--foreground);

  --primary: oklch(0.55 0.22 264);
  --primary-foreground: oklch(0.985 0 0);

  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);

  --muted: oklch(0.309 0 0);
  --muted-foreground: oklch(0.740 0 0);

  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);

  --destructive: oklch(0.704 0.191 22.216);
  --destructive-foreground: oklch(0.985 0 0);

  --overlay: oklch(0 0 0 / 40%);
  --overlay-strong: oklch(0 0 0 / 50%);

  --border: oklch(0.341 0 0);
  --input: oklch(0.341 0 0);
  --ring: oklch(0.556 0 0);

  --surface-1: oklch(0.27 0 0);
  --surface-2: oklch(0.293 0 0);
}
```

### 5.2 Enki light “paper” preset (parlak beyazı kırma)
İstek: light tema **parlak beyaz olmayacak**.

Kural:
- `--background` biraz aşağı çekilir.
- `--surface-1/2` ve `--card` **background’dan az farkla** daha “temiz” kalır.
- Hue/chroma aynı kaldığı için neutral dil bozulmaz.

Önerilen “Soft Paper” (minimal değişim):
```css
:root {
  --background: oklch(0.972 0.004 88); /* 0.987 → 0.972 */
  --surface-1:  oklch(0.978 0.004 88); /* 0.99  → 0.978 */
  --surface-2:  oklch(0.984 0.003 88); /* 0.995 → 0.984 */
  --card:       oklch(0.984 0.003 88); /* 0.993 → 0.984 */
  --popover:    oklch(0.984 0.003 88); /* 0.993 → 0.984 */
}
```

> “Dark ve light background aynı kalsın” hedefi, numerik olarak aynı değer değil; **katman mantığı** olarak aynı kalmasıdır. Bu preset bunu korur.

---

## 6) Base layer kuralları

White-label standardı:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground antialiased font-sans;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-sans;
  }
}
```

---

## 7) Focus, ring ve validation (erişilebilirlik)

- Tüm interactive elemanlar `focus-visible` ile ring alır.
- Standart ring: `ring-ring/50` + `ring-[3px]`
- Invalid (`aria-invalid`): `ring-destructive/20` + `border-destructive`

---

## 8) Radius & shadow standardı

White-label baseline:
- `--radius: 0.65rem`
- `shadow-soft` ve `shadow-popover` (token içinde tanımlı)

Kural:
- Card: `rounded-xl`
- Input/Button: `rounded-md`
- Popover/menü: `shadow-popover`
- Sakin yüzey: `shadow-soft`

---

## 9) Bileşen kuralları (token kullanımı)

Bu bölüm, “hangi bileşen hangi token’ı kullanır” standardını kilitler. (white-label birebir)

### 9.1 Button
- default: `bg-primary text-primary-foreground hover:bg-primary/90`
- outline: `border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`
- ghost: `hover:bg-accent hover:text-accent-foreground`
- destructive: `bg-destructive text-destructive-foreground hover:bg-destructive/90`

### 9.2 Input
- `bg-surface-1 border-input placeholder:text-muted-foreground shadow-soft`
- selection: `selection:bg-primary selection:text-primary-foreground`

### 9.3 Card
- `bg-surface-2 text-card-foreground rounded-xl border shadow-soft`

### 9.4 Overlay (sheet/drawer/modal)
- `bg-overlay-strong`

> Daha detaylı varyant/size listeleri white-label raporunda mevcut; bu projede de aynen korunur.

---

## 10) Refactor için “ihtiyaç listesi” (pratik)

Repo ayağa kalkınca refactorı hızlı bitirmek için şu envantere ihtiyacımız var:

1) **Renk kullanım envanteri (grep):**
   - `bg-white|text-black|zinc-|neutral-|gray-|slate-|stone-|border-` gibi kullanımların listesi
2) **Bileşen listesi:**
   - Button/Input/Card/Dialog/Sheet/Popover/Dropdown/Badge/Toast/Tooltip
3) **Sayfa yüzey standardı kararı:**
   - Card’da `bg-card` mı `bg-surface-2` mi? (Öneri: `bg-surface-2` — white-label ile uyumlu)
4) **Primary (marka aksanı) kararı:**
   - Şimdilik white-label primary kalabilir; marka rengi netleşince sadece token değişir.
5) **Light “paper preset” seçimi:**
   - Bu dokümandaki “Soft Paper” ile başla; gerekirse 1 tık daha koyulaştır.

---

## 11) Done kriteri

- UI’de hard-coded renk kalmayacak (grep ile doğrulanır).
- Light tema “white UI” hissi vermeyecek.
- Dark/light yüzey hiyerarşisi aynı kalacak.
- shadcn bileşenleri bozulmadan çalışacak (focus, hover, disabled, invalid).

