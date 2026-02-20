# 00 — Masterpack (Enki Tattoo Web)

Tek sayfa “proje beyni”: kopyala-yapıştır ve AI/ekip için referans. Kısa ve tam.

---

## 1) Project North Star

- **SEO:** Organik büyüme; Mersin tattoo/piercing anahtar kelimelerinde üst sıralar.
- **Conversion:** WhatsApp, randevu, iletişim CTA’ları net; galeri/hub’lar güven ve niyet oluşturur.
- **Premium UX:** 2026 native pattern’lar, tutarlı token sistemi, mobil-first, hızlı ve erişilebilir.

---

## 2) Locked IA (routes + labels)

| Route | Label (TR) |
|-------|------------|
| `/` | Ana Sayfa |
| `/kesfet` | Keşfet |
| `/kesfet/[hub]` | Hub detay (slug) |
| `/piercing` | Piercing |
| `/galeri` | Galeri |
| `/artistler` | Artistler |
| `/iletisim` | İletişim |

**Legacy redirects:** `/book` → `/iletisim`, `/explore` → `/kesfet`, `/gallery` → `/galeri`, `/profile` → `/artistler`.

---

## 3) Locked Hub V1

- **6 ana hub:** Minimal & Fine Line, Lettering, Realism, Portre, Traditional / Old School, Cover Up. (Kaynak: `src/lib/hub/hubs.v1.ts` — `mainHubs`.)
- **Özel (3):** Atatürk, Blackwork, Özel Tasarım. (`specialHubs`.)
- **Piercing:** Ayrı sayfa (`/piercing`); kategoriler (kulak, burun, kas, dudak, dil, gobek, septum, industrial, diger) Galeri’den bağımsız.
- **Galeri filtreleri:** Stil/artist/tema; tema değerleri `themeFilters` (angel, eyes, animal, floral, geometric, vb.).

---

## 4) Locked Mobile Header Spec

- **2 katman:** Top bar (hamburger/back + aksiyonlar) + Tab bar (5 sekme: Ana Sayfa, Keşfet, Piercing, Galeri, Artistler).
- **Gizle/göster:** Scroll down → header gizlenir; scroll up → tek parça animasyonla geri gelir (threshold tabanlı).
- **Back stratejisi:** History varsa `router.back()`, yoksa `/` fallback. İletişim tab’da değil; top bar’da (ör. aksiyon menüsü / CTA).

---

## 5) Design Rules summary

- **Sadece semantic token:** `bg-background`, `text-foreground`, `border-border`, `bg-surface-1`, `bg-surface-2`, `bg-card`, `text-muted-foreground`, `ring-ring`, vb. Kullan.
- **Palette yasak:** `bg-white`, `text-black`, `gray-*`, `zinc-*`, `slate-*`, `neutral-*`, `stone-*` kullanma.
- **Light zemin:** Paper/off-white; parlak beyaz değil. Dark/light aynı yüzey hiyerarşisi.
- **Font:** Sadece Geist.
- **Teknik:** Tailwind v4, shadcn/ui new-york, cssVariables, baseColor neutral; next-themes. Detay: [01-Design rules.md](01-Design%20rules.md).

---

## 6) Responsive rules

- **Mobile-first.** Breakpoint: **xl = 1280px** (desktop rail başlangıcı).
- **&lt; 1280px:** “App mode”, tek kolon; header tab bar.
- **≥ 1280px:** İki kolon + right rail (CTA, popüler hub’lar, Piercing CTA). Sayfa bazlı grid kırılımları: Home, Keşfet, Galeri, Piercing, Artistler, İletişim. Detay: [02-responsive-checklist.md](02-responsive-checklist.md).
- **Safe-area:** Sheet/drawer alt padding. Dokunma hedefleri 44–48px.

---

## 7) Repo rules

- **Klasör:** `src/components/ui/` shadcn primitives; `src/components/app/` uygulama bileşenleri; `src/components/legacy/` kullanımdan kaldırılmış (ör. social-mock); `src/components/theme/` tema.
- **İsimlendirme:** Tutarlı kebab-case dosya; bileşen PascalCase.
- **Server vs client:** Varsayılan Server Component; etkileşim/theme/tarayıcı API için `"use client"`.
- **İkon / tap:** `lib/ui/metrics.ts` (icon, iconBtn) ile tutarlı boyut; mobilde tıklanabilir alan yeterli.

---

## 8) Quality Gates / Definition of Done

- `npm run lint` — temiz.
- `npm run build` — temiz.
- `npm run check:no-palette` — `src/` altında yasaklı palette sınıfı yok.
- **Tek komut:** `npm run check:all` = lint + build + check:no-palette.
- Route’lar canonical; legacy path’ler redirect.
- Header davranışı (2 katman, hide/show, back) bozulmamış.

---

## 9) Prompt Library (kopyala-yapıştır)

- **“Add new hub”** — `src/lib/hub/hubs.v1.ts` içine yeni `HubItem` ekle (mainHubs veya specialHubs); slug/coverKey/icon uyumlu; Keşfet + hub detay sayfası güncelle.
- **“Add gallery item detail”** — Galeri data modeli + `/galeri/[slug]` sayfası; next/image, blur placeholder; WorkItem benzeri yapı.
- **“SEO metadata for a new route”** — `metadata` / `generateMetadata` (title, description, openGraph); canonical URL; gerekirse JSON-LD.
- **“Refactor component to semantic tokens”** — Tüm renk/arka plan/çerçeve için sadece token (`bg-background`, `text-foreground`, `border-border`, `bg-surface-1`, `bg-card`, `text-muted-foreground`, vb.); palette sınıfı kaldır; `npm run check:no-palette` ile doğrula.
