# 07 — UI Bileşen Kontratları ve Kilit Kurallar (V1)

> Kapsam: **Bu pencerede** yaptığımız UI geliştirmelerinin “kontrat” hâli.  
> Amaç: Yeni bir developer projeye girince, **hangi bileşen nasıl davranmalı** tek yerden anlasın.  
> Kapsam dışı: Cloudflare / prod deploy / sitemap sözleşmesi.

---

## 0) Global Kurallar (V1)

### 0.1 Mobil öncelik
- Tasarım kararları **mobil** için kilitli.
- Desktop davranışı “bozulmasın” ama birincil hedef mobil hissiyat.

### 0.2 Tap target (basılabilir alan)
- Icon-only butonlar ve kritik CTA’lar: **min 44×44** (Tailwind’de genelde `h-11 w-11`).
- Link-row listeleri: **min 44px yükseklik** (`h-11`).

### 0.3 Press feedback (native hissiyat)
- Tıklanabilir her şey “basınca hissedilir” olmalı:
  - `active:scale-[0.97..0.99]` + `transition`
  - gerekiyorsa `active:bg-*` ile micro feedback

### 0.4 Light/Dark
- Renkler “semantik token”larla yürür (`bg-background`, `text-foreground`, `border-border` vb.).
- Hard-coded renk sadece **çok zorunlu** yerde.

---

## 1) Card Media Oran Kontratı

**Amaç:** CLS stabilitesi + tutarlı kırpma.

### 1.1 Utility sınıflar
`src/app/globals.css` içinde aşağıdaki media utility’leri var (kontrat):
- `.card-media-hub` → **4:5**
- `.card-media-gallery` → **3:4**
- `.card-media` → **legacy 5:4** (eski kullanım uyumluluğu)

### 1.2 Kullanım kuralı
- Hub/kategori kartlarında **daima**: `card-media-hub`
- Galeri grid kartlarında **daima**: `card-media-gallery`
- Legacy sadece eski ekranlar/placeholder alanlarında.

---

## 2) HubCard Kontratı (Home + /kesfet)

**Tek kaynak bileşen:** `src/components/hub/hub-card.tsx`

### 2.1 Görsel alan
- Media wrapper: `card-media-hub` (4:5)
- Görsel varsa: `next/image` + `object-cover`
- Görsel yoksa: gradient placeholder fallback

### 2.2 Tipografi / taşma garantisi
- Title: **tek satır + ellipsis** (kesin)
- Description: **tek satır + ellipsis** (kesin)
- Bu garanti için zincir:
  - text node’larda `truncate`
  - parent’larda `min-w-0`

### 2.3 Footer ritmi
- CTA satırı **her kartta aynı hizada** durmalı:
  - `mt-auto` yaklaşımı
  - footer min-height ile ritim korunur

### 2.4 CTA standardı
- Metin: “Tümünü gör”
- Sağda `ChevronRight`
- CTA satırı tek satır: `whitespace-nowrap`

---

## 3) IconButton Kontratı (Header / Tabbar / Icon actions)

**Tek kaynak:** `src/components/ui/icon-button.tsx`

### 3.1 Minimum standard
- Hit area: `h-11 w-11` (44px)
- Press feedback: `active:scale-[0.97]` (veya benzeri)
- Focus ring: `focus-visible:ring-*`
- A11y: `aria-label` zorunlu

### 3.2 Nerelerde kullanılır?
- `src/components/app/mobile-header.tsx` içindeki hamburger, search, dil, iletişim, close vb.

---

## 4) Mobile Drawer / Menü Satırı Kontratı

**Dosya:** `src/components/app/mobile-header.tsx`

### 4.1 Drawer içerik prensibi
- Menü satırları **text-only** (ikon kalabalığı yok).
- Satırlar `h-11` + `rounded-xl` + `px-*`.
- Active route:
  - görsel highlight + `aria-current="page"`.

### 4.2 Tema satırı
- Büyük bir “dev buton” gibi değil; listede diğer satırlar gibi **compact row**.

---

## 5) Piercing Landing Kontratı (/piercing)

### 5.1 Sayfa sırası (IA)
- Hero → Primary CTA → Featured Carousel → Kategoriler → (Detaylar/SSS vb. varsa)

### 5.2 Featured Carousel başlığı
- Başlık metni: **“Öne Çıkan Piercingler”**
- Kart label: **“Piercing”** (Title Case, uppercase yok)

### 5.3 Featured card (tek layer görsel)
**Dosya:** `src/components/piercing/featured-piercing-card.tsx`
- Görsel alan: `aspect-[16/9]`, `overflow-hidden`, `rounded-t-2xl`
- Görsel render: **tek katman** `next/image fill` + `object-cover object-center`
- `loading="lazy"`, `priority={false}`
- Görsel hata olursa fallback gradient.

### 5.4 Carousel davranışı (overflow yok)
**Dosya:** `src/components/piercing/featured-piercing-carousel.tsx`
- Mobilde item genişliği “peek” verir ama **horizontal overflow yaratmaz**
- Snap/scroll davranışı “native” hissiyatlı olmalı
- Sağdan layout’u daraltan `pr-*` hack’leri **kullanılmaz**

### 5.5 Slider cover’ları (public)
**SSOT map:** `src/lib/piercing/piercing-cover-map.ts`
- `public/kulak-cover.webp`
- `public/burun-cover.webp`
- `public/kas-cover.webp`
- `public/dudak-cover.webp`
- `public/dil-cover.webp`
- `public/gobek-cover.webp`

**Data enrich:** `src/lib/piercing/featured-piercing.ts`
- `FeaturedPiercingItem` içinde `coverSrc?: string` kontratı var.
- Item’lar `coverSrc` ile zenginleşir; yoksa fallback.

## 6) İletişim Sayfası CTA Kontratı (/iletisim)

**Dosya:** `src/app/(app)/iletisim/page.tsx`

### 6.1 CTA row (mobile overflow fix)
- Mobilde 2 satır grid:
  - 1. satır: “Ara” (`col-span-2`)
  - 2. satır: “WhatsApp” + “Yol tarifi” (`grid-cols-2`)
- Buton standardı:
  - `min-h-11 w-full min-w-0`
  - label: `truncate`

---

## 8) QA Checklist (Local)
Bu checklist bu penceredeki işlerin “pass/fail” kontrolüdür:

- `/` ve `/kesfet`:
  - [ ] Kart başlıkları tek satır (ellipsis), taşma yok
  - [ ] CTA satırı hizalı
- `/piercing`:
  - [ ] Featured kart görselleri tam-bleed, tek layer
  - [ ] Carousel’de yatay overflow yok
  - [ ] “Öne Çıkan Piercingler” görünüyor
- `/iletisim`:
  - [ ] CTA butonları viewport dışına çıkmıyor
- Global:
  - [ ] Icon butonlar 44px+, press feedback var
  - [ ] Drawer text-only, active state belirgin

---
