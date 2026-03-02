# 09 — Workflow, Kalite Kapıları ve “Release Checklist” (Bu Pencere)

> Kapsam: **Bu sohbet penceresinde** yaptığımız geliştirmelerin “nasıl yönetileceği / nasıl bozulmayacağı” dokümanı.  
> Kapsam dışı: Cloudflare kurulumları, prod deploy servis komutları, sitemap sözleşmesi (başka pencereden çıkarılacak).  
> Bu doküman **local repo** + **git workflow** + **kalite kapıları** + **en sık yapılan hatalar** üzerine.

---

## 0) Bu Pencere İçin “Done” Tanımı
Bu pencere boyunca hedef:
- UI’ı “native hissiyat”a yaklaştırmak (tap target + press feedback + tutarlı card/media).
- Local SEO/NAP tutarlılığını tek kaynağa bağlamak.
- Piercing featured carousel + cover asset pipeline’ını stabilize etmek.
- Chat (Tawk) entegrasyonunu performans-dostu hâle getirmek.
- Geliştirme raporlarını (docs/output) repo’dan ayrı tutmak.

---

## 1) Repo Doküman Stratejisi (Kalıcı vs Geçici)

### 1.1 Kalıcı (Commit’lenir)
- `docs/01-design-system-styleguide.md`
- `docs/locks/*`  ✅ (SSOT kilitler burada)

### 1.2 Geçici / Yerel (Commit’lenmez)
- `docs/output/*`  ❌ (keşif raporları, PR çıktıları, deneme logları)
- Kural: `docs/output/` `.gitignore` altında tutulur.

**Önerilen `.gitignore` kuralı**
- `docs/output/`
- `public/_backup_*.webp` (yedek görseller repo’ya girmesin)

---

## 2) Git Workflow (Bu pencere için pratik)

### 2.1 “Tek commit” yaklaşımı (büyük batch)
Bu pencere boyunca çok sayıda dosya değişti. Büyük “batch commit” için:
1) `git reset --soft origin/main` (önceki local commit’i tek committe toplamak için)
2) `git add -A`
3) `git restore --staged docs/output` (yanlışlıkla stage’e girdiyse)
4) `git commit -m "feat(ui): ..."`
5) `git push`

### 2.2 “Hotfix” yaklaşımı (küçük commit)
Prod’da patlayan bir tip hatası gibi acil durumlarda:
- Tek dosya fix → `npm run build` → commit → push
- Commit mesajı: `fix(<area>): <kısa sebep>`

---

## 3) Kalite Kapıları (Local)

### 3.1 Zorunlu komutlar
- `npm ci` (özellikle deploy/temiz kurulum simülasyonu için)
- `npm run build`  ✅ (TypeScript + Next build)
- (varsa) `npm run lint`

### 3.2 Manuel “smoke” kontrol listesi
- `/` (Home)
  - Hub kart title/desc taşmıyor (tek satır ellipsis)
  - CTA satırı hizalı
- `/kesfet`
  - Hub kartlar aynı ritimde
- `/piercing`
  - Featured carousel overflow yok
  - Kartlar full-bleed görsel (tek layer)
  - Başlık: “Öne Çıkan Piercingler”
- `/iletisim`
  - CTA butonları mobilde taşmıyor (2 satır grid)
- Drawer / header
  - Icon hit-area 44px+
  - Press feedback hissedilir
- Tawk
  - İlk açılışta hemen yüklenmez (min 5sn)

---

## 4) En Sık Yaşanan 2 Kritik Hata ve Önleyici Kurallar

### 4.1 Type mismatch (Prod build kırılması)
**Yaşanan:** `FeaturedPiercingItem` tipinde `coverSrc` yokken component `item.coverSrc` kullandı → prod TS compile fail.

**Kural**
- Data model değiştiğinde (örn. `coverSrc`) önce:
  1) Type/interface güncelle
  2) Sonra UI component kullan
  3) `npm run build` pass olmadan push yok

### 4.2 Untracked public asset (Prod’da görsel yok)
**Yaşanan:** `piercing-cover-map.ts` doğru path veriyordu ama `public/kulak-cover.webp` gibi dosyalar `git`’te `??` kaldı → prod’a çıkmadı.

**Kural**
- `public/` altındaki yeni görseller için:
  - `git status` kontrolü: `?? public/*` görüyorsan deploy’a gitmez
  - Cover seti için “tam set” kuralı:
    - `kulak, burun, kas, dudak, dil, gobek` cover’ları birlikte commit’lenir
  - Doğrulama: `npm run build` + localde `existsSync("public/<file>")`

---

## 5) Görsel Pipeline Kontratı (Local)

### 5.1 Galeri görselleri
- Format: **WebP**
- Boyut hedefi: **900×1200** (veya 1200×1600)  
- Adlandırma önerisi (örnek): `YYYYMMDD_slug_01.webp`
- Konum: `public/gallery/`

### 5.2 Hub/Kategori kapakları
- Format: WebP
- Dosyalar `public/` altında
- Slug → cover eşlemesi SSOT: `src/lib/hub/hub-cover-map.ts`

### 5.3 Piercing featured cover’ları
- Format: WebP
- Konum: `public/*-cover.webp` (V1’de root public)
- SSOT map: `src/lib/piercing/piercing-cover-map.ts`
- Data enrich: `src/lib/piercing/featured-piercing.ts` (`coverSrc?: string`)

> Not: Yedek dosyalar `public/_backup_*.webp` ile tutulur ama git’e girmez.

---

## 6) Tawk Chat “Performans Dostu” Kontratı

**Loader:** `src/components/chat/tawk-loader.tsx`

Kurallar:
- Minimum **5sn gecikme**
- `requestIdleCallback` varsa idle’da
- Interaction (scroll/touch) sadece 5sn dolduktan sonra tetikleyebilir
- Single instance guard (`window.Tawk_API` / `script[data-tawk]`)
- Global tek mount: `(app)` layout

---

## 7) Dosya/Modül Envanteri (Bu pencere ile gelen çekirdek parçalar)

### UI
- `src/components/hub/hub-card.tsx`
- `src/components/ui/icon-button.tsx`
- `src/components/ui/carousel.tsx`
- `src/components/ui/collapsible.tsx`

### Piercing
- `src/components/piercing/featured-piercing-card.tsx`
- `src/components/piercing/featured-piercing-carousel.tsx`
- `src/lib/piercing/featured-piercing.ts`
- `src/lib/piercing/piercing-cover-map.ts`

### SEO / Local
- `src/lib/site-info.ts`
- `src/components/seo/local-business-jsonld.tsx`
- `src/components/seo/breadcrumb-list-jsonld.tsx`
- `src/components/app/site-footer.tsx`
- `/iletisim` CTA düzeni: `src/app/(app)/iletisim/page.tsx`

---

## 8) Release Checklist (Sadece Repo / Local Odaklı)
> Prod servis komutları burada yok; sadece “repo teslim kalitesi”.

1) `git status -sb` temiz mi?
2) `docs/output/` commit’e girmiyor mu?
3) `public/*-cover.webp` gibi yeni asset’ler **tracked** mi? (`git status`te `??` kalmamalı)
4) `npm ci` + `npm run build` PASS
5) Kritik sayfalar smoke check:
   - `/`, `/kesfet`, `/piercing`, `/iletisim`
6) Tawk:
   - ilk 5 saniyede `embed.tawk.to` request yok
7) Commit message:
   - `feat(ui): ...` veya `fix(piercing): ...`

---

## 9) Bu Dokümana Ekleyebileceğimiz Son Notlar (Kontrol)
Bu pencere içinde önemli olup “unutulma ihtimali” olan her şeyi check ettim:
- Card media oran lock ✅
- HubCard ellipsis + min-w-0 ✅
- Drawer text-only + 44px hit area ✅
- IconButton + press feedback ✅
- Piercing featured carousel copy + overflow fix ✅
- Untracked cover asset dersleri ✅
- Contact CTA overflow fix ✅
- Tawk 5sn delay + single instance ✅
- docs/output ignore stratejisi ✅

Eğer ayrıca **“internal link planı”** veya **“GBP review toplama akışı”** bu pencereye dahil edilmek istenirse, V1 TODO olarak ayrı dokümana eklenmeli (bu pencerede uygulanmadı).

---
