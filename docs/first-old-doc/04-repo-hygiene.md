# 04 — Repo hygiene (Enki Tattoo Web)

Bu doküman, repoda tutarlılık ve uzun vadeli sürdürülebilirlik için zorunlu kuralları tanımlar.

---

## 1) Tasarım / token kuralları

- **Sadece semantic token:** `bg-background`, `text-foreground`, `border-border`, `bg-surface-1`, `bg-card`, `text-muted-foreground` vb. kullanılır.
- **Palette sınıfları yasak:** `bg-white`, `text-black`, `bg-gray-*`, `text-zinc-*`, `border-gray-*`, `slate-*`, `neutral-*`, `stone-*` vb. kullanılmaz.
- Doğrulama: `npm run check:no-palette` (scripts/check-no-palette.sh) ile `src/` taranır; eşleşme varsa build/CI başarısız sayılır.

---

## 2) Canonical route’lar (IA)

Kilitlenmiş route’lar:

- `/` — Ana sayfa
- `/kesfet` — Keşfet
- `/kesfet/[hub]` — Hub detay
- `/piercing` — Piercing
- `/galeri` — Galeri
- `/artistler` — Artistler
- `/iletisim` — İletişim

Eski/İngilizce path’ler sunucu yönlendirmesi ile canonical’e gider:

- `/book` → `/iletisim`
- `/explore` → `/kesfet`
- `/gallery` → `/galeri`
- `/profile` → `/artistler`

Yeni sayfa eklerken sadece bu IA’ya uygun route kullanılır.

---

## 3) Bileşenlerin yeri

- **`src/components/ui/`** — shadcn/ui primitives (Button, Card, Input, Dialog, Sheet, vb.). Mümkün olduğunca dokunulmaz.
- **`src/components/app/`** — Uygulama-specific bileşenler (header, nav, hub kartları, galeri bileşenleri vb.). IA ve hub mimarisine uygun olanlar burada.
- **`src/components/legacy/`** — Kullanımdan kaldırılmış veya sadece referans için tutulan bileşenler (ör. `social-mock`). Yeni sayfalarda kullanılmaz.
- **`src/components/theme/`** — Tema (ThemeProvider, theme switch/toggle).
- **`src/components/styleguide/`** — Sadece styleguide sayfasına özel bileşenler.

Sayfa layout’ları ve route’a özel bloklar `src/app/(app)/.../page.tsx` veya ilgili layout içinde kalır; büyük parçalar `components/app/` altında modüler bileşenlere taşınır.

---

## 4) Sunucu / istemci

- Varsayılan: **Server Component**. Veri çekme, metadata, SEO blokları sunucuda.
- Sadece gerekli yerlerde `"use client"`: etkileşim (onClick, form, theme switch), tarayıcı API’leri, third-party client-only kütüphaneler.

---

## 5) Kalite kapıları

- `npm run lint` — hatasız.
- `npm run build` — hatasız.
- `npm run check:no-palette` — `src/` altında yasaklı palette sınıfı yok.
- Merge / PR öncesi: `npm run check:all` (lint + build + check:no-palette) çalıştırılır.

---

## 6) Tek kaynak dokümanlar

- Tasarım: [01-Design rules.md](01-Design%20rules.md)
- Responsive: [02-responsive-checklist.md](02-responsive-checklist.md)
- Zaman tüneli: [03-timeline.md](03-timeline.md)
- Proje özeti: [00-masterpack.md](00-masterpack.md)
