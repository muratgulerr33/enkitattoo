# 08 — Local SEO / NAP / Structured Data Kontratı (V1)

> Kapsam: **Bu sohbet penceresinde** yapılan “Local SEO görünürlüğünü güçlendiren” local repo geliştirmeleri.  
> Kapsam dışı: Cloudflare, prod deploy runbook, sitemap sözleşmesi/CSV (başka pencereden çıkacak).

---

## 0) V1 Tanımı
V1’de hedef:
- **DB’siz** (statik gibi), tek dil TR
- 25 benzersiz URL
- Local SEO için **NAP tutarlılığı** + **schema (JSON-LD)** + **İletişim sayfası** kalite standardı

---

## 1) Tek Kaynak (SSOT): `SITE_INFO`
Amaç: Sitede görünen işletme bilgileri (adres/saat/harita) hiçbir yerde kopyalanmasın; her yerde aynı metinle çıksın.

### 1.1 Kaynak dosya
- `src/lib/site-info.ts`

### 1.2 SSOT içinde tutulacak alanlar
- İşletme adı (Name)
- Adres tek satır metin (AddressText)
- Adres parçaları (street, district, city, postal code, country)
- Çalışma saatleri (UI için text + yapılandırılmış alanlar)
- Google Maps URL (yol tarifi/link için)
- Google Maps embed src (iframe için)
- Geo (lat/lng)

> Kural: Adres/saat/harita ile ilgili metinler UI’da hardcode edilmez; `SITE_INFO` import edilir.

---

## 2) Footer Kontratı (3 Slot)
Amaç: Footer hem kullanıcıya güven verir hem de Local SEO’da NAP tutarlılığını destekler.

### 2.1 Bileşen
- `src/components/app/site-footer.tsx`
- (Footer mount noktası) app shell/layout içinde tek yerden kullanılır.

### 2.2 Slot yapısı
1) **Slot-1 (NAP)**
   - logo/isim
   - adres (SITE_INFO)
   - çalışma saatleri (SITE_INFO)
   - “Haritada aç” linki (SITE_INFO.googleMapsUrl)
2) **Slot-2 (Sosyal)**
   - sosyal link ikonları (44px+ hit area, press feedback)
3) **Slot-3 (Copyright)**
   - yıl + marka

### 2.3 UI kuralları (native)
- Link ve ikonlar: `min 44px` hit area
- Press feedback var
- Light/Dark kontrast semantik tokenlarla

---

## 3) /iletisim Sayfası Kontratı
Amaç: “Google gözünden” (tutarlı NAP) ve “kullanıcı gözünden” (tek ekranda yol tarifi/iletişim) doğru sayfa.

### 3.1 Sayfa dosyası
- `src/app/(app)/iletisim/page.tsx`

### 3.2 İçerik blokları
- Başlık + kısa açıklama
- NAP kartı (SITE_INFO)
- CTA alanı:
  - **Ara**
  - **WhatsApp**
  - **Yol tarifi al (Maps link)**
- Harita embed (iframe):
  - responsive container
  - `loading="lazy"`
  - src = `SITE_INFO.googleMapsEmbedSrc`

### 3.3 Mobile overflow kuralı (kritik)
CTA’lar mobilde asla viewport dışına taşmaz.
- Mobilde **2 satır grid**:
  - 1. satır: “Ara” (full width)
  - 2. satır: “WhatsApp” + “Yol tarifi” (2 kolon)
- Butonlar: `min-h-11 w-full min-w-0`
- Label’lar: `truncate`

---

## 4) Structured Data (JSON-LD) Kontratı
Amaç: Google’ın işletmeyi daha doğru anlaması + breadcrumb/yerel sinyal güçlendirme.

### 4.1 LocalBusiness / TattooParlor JSON-LD
- `src/components/seo/local-business-jsonld.tsx`

**Kurallar**
- Veriyi `SITE_INFO`’dan okur (hardcode yok).
- `@type`: V1’de “TattooParlor” (uygun görülen yerel iş tipi) veya gerekli görülürse “LocalBusiness”.
- Address: `PostalAddress`
- Geo: lat/lng
- Opening hours: mümkün olduğunca yapılandırılmış format

### 4.2 BreadcrumbList JSON-LD
- `src/components/seo/breadcrumb-list-jsonld.tsx`

**Kurallar**
- Route bazlı breadcrumb üretimi (IA tutarlılığı)
- Her sayfada breadcrumb doğru hiyerarşi kurar (Home → bölüm → detay)

### 4.3 Mount noktası
- JSON-LD bileşenleri app router layout’unda uygun yerde **tek kez** veya sayfa bazlı mount edilir.
- Duplicate script basılmaz.

---

## 5) “Tek Tip Bilgi” Temizliği
Amaç: eski sabit metinleri sıfırlayıp tek kaynağa bağlamak.

Bu pencerede yapılan prensip:
- Home / Right rail / Footer / İletişim gibi yerlerde görünen NAP bilgileri `SITE_INFO`’a bağlandı.
- Aynı bilgilerin 2 farklı metinle yazılması yasak.

---

## 6) QA Checklist (Local)
Aşağıdaki kontrol listesi bu dokümanın “pass” kriteridir:

- NAP
  - [ ] Footer’daki adres/saat ile /iletisim aynı
  - [ ] “Haritada aç” linki doğru
- /iletisim
  - [ ] CTA’lar mobilde taşmıyor
  - [ ] Harita iframe lazy
- JSON-LD
  - [ ] sayfada LocalBusiness/TattooParlor JSON-LD var
  - [ ] Breadcrumb JSON-LD var (ilgili sayfalarda)
- Light/Dark
  - [ ] Footer ve /iletisim kontrastı okunabilir
- Build
  - [ ] `npm run build` PASS

---

## 7) Notlar / TODO
- Internal link planı V1’de yok (ayrı dokümana TODO olarak eklenecek).
- Sitemap sözleşmesi / Search Console süreç detayları başka pencereden çıkarılacak.

---
