# 06 — Local Repo Geliştirmeleri Özeti (V1 UI / Component Sabitleme)

> Kapsam: **Bu sohbet penceresinde** yapılan **local repo** geliştirmeleri ve kilitlenen UI kararları.  
> Kapsam dışı (özellikle **BU DOKÜMANDA YOK**): Cloudflare kurulumları, prod deploy runbook’ları, sitemap sözleşmesi/CSV üretim süreci (başka pencereden çıkarılacak).

---

## 1) V1 Scope (Net)
- Site şu an **DB’siz / statik SEO vitrin** gibi çalışıyor.
- V2’de PostgreSQL + Drizzle altyapısı devreye alınabilir (bu doküman V2’yi planlamaz, sadece not düşer).

---

## 2) Kilitlenen UI Kararları (LOCK)

### 2.1 Card Media Oranları (CLS stabilitesi için)
Amaç: kart yüklenirken zıplama olmaması + görsel kırpmaların “tutarlı” olması.

- **Hub / Kategori kart görsel alanı:** **4:5**
- **Galeri kart görsel alanı:** **3:4**
- **Legacy yardımcı sınıf:** **5:4** (eski kullanım uyumluluğu için korunur)

> Uygulama yaklaşımı: `globals.css` içinde `.card-media-*` utility sınıfları + kart componentlerinde bu sınıfların kullanımı.

### 2.2 Hub Kartları (Home + /kesfet) Tek Tip Bileşen
Amaç: başlık taşmaları ve kart yükseklik dengesizliği olmadan “premium ritim”.

**Standartlar**
- Title: **tek satır + ellipsis** (kesin)
- Description: tek satır / clamp (kesin)
- CTA satırı: tüm kartlarda aynı (“Tümünü gör” + chevron)
- Footer ritmi: kartlar arasında yükseklik farkı yaratmayacak şekilde sabitlenir
- Light/Dark: semantik tokenlar ile (hard-coded palette yok)

> Tek kaynak bileşen: `src/components/hub/hub-card.tsx`

### 2.3 Hub Kapak Görselleri: `public/*.webp` → `next/image`
Amaç: kategori kartlarında gerçek kapakların stabil ve hızlı gösterimi.

- Kapaklar `public/` altından servis edilir.
- Slug → cover dosyası mapping tek yerde tutulur (SSOT).
- Görsel yoksa gradient placeholder fallback korunur.

> Tek kaynak mapping: `src/lib/hub/hub-cover-map.ts`

### 2.4 Mobile Header / Drawer “Native” Press Feedback + Hit Area
Amaç: ikonlara basınca “hiç his yok” problemini bitirmek + 44px hit area.

**Standartlar**
- Icon-only butonlar: **min 44×44**
- Press feedback: `active:scale[...]` + transition
- Drawer menü: icon kalabalığı yerine **text-only** satırlar (native list hissi)
- Active state: `aria-current="page"` ile görsel/semantik uyum

> İlgili bileşenler:
- `src/components/ui/icon-button.tsx`
- `src/components/app/mobile-header.tsx`

### 2.5 Piercing Landing: Hero + Featured Carousel + Liste
Amaç: `/piercing` açılışının premium olması (hero → featured → kategoriler).

**Featured Carousel**
- Kart görseli: **tek layer**, full-bleed `next/image fill` + `object-cover`
- Item width/snap: mobilde “peek” hissi var ama **horizontal overflow yok**
- Başlık metni: **“Öne Çıkan Piercingler”**
- Badge label: **“Piercing”** (Title Case)

**Cover görselleri**
- Slider kapakları `public/*-cover.webp` üzerinden gelir.
- SSOT map: `src/lib/piercing/piercing-cover-map.ts`
- Data enrich: `src/lib/piercing/featured-piercing.ts` içinde `coverSrc` alanı bağlanır.

**Tawk çakışma önlemi**
- Sayfayı sağdan daraltacak `pr-*` hack’leri **kullanılmaz**.
- Çakışma çözümü “layout bozmadan”: sadece alt safe padding yaklaşımı (Tawk sağ-alt balon için).

> İlgili dosyalar:
- `src/app/(app)/piercing/page.tsx`
- `src/components/piercing/featured-piercing-carousel.tsx`
- `src/components/piercing/featured-piercing-card.tsx`
- `src/lib/piercing/featured-piercing.ts`
- `src/lib/piercing/piercing-cover-map.ts`

### 2.6 İletişim Sayfası: CTA Overflow Fix
Amaç: mobilde “Ara / WhatsApp / Yol tarifi” butonlarının sağa taşması (viewport dışına çıkması) tamamen bitsin.

- CTA satırı **2 satır grid**:
  - 1. satır: “Ara” (full width)
  - 2. satır: “WhatsApp” + “Yol tarifi” (2 kolon)
- Butonlar: `min-h-11 w-full min-w-0` + label `truncate`

> Dosya: `src/app/(app)/iletisim/page.tsx`

### 2.7 Tawk Chat Entegrasyonu (Mock Bubble kaldırıldı)
Amaç: eski “yakında” mock chat bubble kalksın; Tawk performans dostu gelsin.

**Kurallar**
- Minimum **5 saniye gecikme** ile yüklenir.
- `requestIdleCallback` varsa idle’da, yoksa normal.
- Single instance guard: tekrar script basma yok.
- Global tek mount: `(app)` layout altında 1 kere.

> Dosyalar:
- `src/components/chat/tawk-loader.tsx`
- (app) layout mount noktası: `src/app/(app)/layout.tsx`
- Silinen: `src/components/app/chat-bubble.tsx`

---

## 3) Dosya Haritası (Bu pencerede oluşan “çekirdek” dosyalar)

### UI / Components
- `src/components/hub/hub-card.tsx`
- `src/components/ui/icon-button.tsx`
- `src/components/ui/carousel.tsx`
- `src/components/ui/collapsible.tsx`
- `src/components/piercing/featured-piercing-carousel.tsx`
- `src/components/piercing/featured-piercing-card.tsx`

### Data / SSOT Map
- `src/lib/hub/hub-cover-map.ts`
- `src/lib/piercing/featured-piercing.ts`
- `src/lib/piercing/piercing-cover-map.ts`

### Pages
- `src/app/(app)/page.tsx` (home)
- `src/app/(app)/kesfet/page.tsx`
- `src/app/(app)/piercing/page.tsx`
- `src/app/(app)/iletisim/page.tsx`

### Assets (V1)
- Hub kapakları: `public/*.webp` (ör: `minimal-fine-line-dovme.webp` vb.)
- Piercing slider cover’ları: `public/kulak-cover.webp`, `burun-cover.webp`, `kas-cover.webp`, `dudak-cover.webp`, `dil-cover.webp`, `gobek-cover.webp`

---

## 4) Kalite Kapıları (Local)
Zorunlu:
- `npm run build`
- `npm run lint` (varsa)

Manuel hızlı kontrol:
- `/` ve `/kesfet`: kart başlıkları tek satır, CTA satırı hizalı
- `/piercing`: featured carousel görüntüleri tam oturuyor, overflow yok
- `/iletisim`: CTA’lar taşmıyor (en dar genişlikte bile)
- Tawk: sayfa açılışında hemen network istemiyor, en erken 5sn sonra geliyor

---

## 5) Notlar / TODO (V2 veya ayrı iş)
- Internal link planı: V1’de yok → sonradan eklenecek.
- Admin panel, randevu, ödeme: V2 kapsamı.

---
