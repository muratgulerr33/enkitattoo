# WORKFLOW

Bu dosya repo içindeki çalışma kitabıdır. Tek kişi geliştirme, kalite kapıları, görev tipine göre recipe'ler, AI ile çalışma sırası ve commit hazırlığı burada tutulur.

## 1) Çalışma Modeli

- Çalışma ağacı `main` kabul edilir.
- Branch açma.
- `git stash`, `git restore`, `git clean`, `git reset --hard` kullanma.
- Repo gerçeği dışında varsayım yazma; doğrulanamayan şeyi `UNKNOWN` olarak işaretle.
- Değişiklik yapmadan önce canonical kaynağı bul; aynı bilgiyi ikinci yerde üretme.

## 2) Günlük Çalışma Sırası

1. Önce `main` durumunu kontrol et.
2. Uzak repo kullanılıyorsa güncel durumu al.
3. Çalışmadan önce mevcut değişiklikleri ve hedef dosyaları oku.
4. Uygulamadan önce değişiklik sınırını ve etkilenecek kaynakları netleştir.
5. Geliştirmeyi yap.
6. İlgili kalite kapılarını çalıştır.
7. Commit hazırlığından önce docs, generated ve artifact etkisini tekrar kontrol et.

## 3) Temel Kalite Kapıları

Asgari kontrol seti:

- `npm run lint`
- `npm run build`
- `npm run check:no-palette`
- `npm run check:all`

Duruma göre:

- UI regression için `npm run ui:audit`, `npm run ui:audit:tr`
- Route-content değiştiyse `python3 scripts/generate-route-content.py`
- Mesaj seti değiştiyse `node scripts/i18n/check-messages.mjs`

Not:

- `check:all` generator'ı otomatik çalıştırmaz.
- `node scripts/i18n/check-messages.mjs` şu an npm script değildir; doğrudan çağrılır.

## 4) Doküman Asıl Ev Kuralı

- `README.md`: repo giriş kapısı
- `docs/README.md`: docs haritası
- `docs/SSOT.md`: teknik gerçekler, route, i18n, SEO, source-of-truth
- `docs/UI-SYSTEM.md`: UI kontratları
- `docs/WORKFLOW.md`: çalışma sırası ve kalite kapıları
- `docs/OPS.md`: repo-side hazırlık runbook'u

Kural:

- Doküman değişikliği yapmadan önce bilginin asıl evini belirle.
- Aynı teknik bilgiyi ikinci kez yazmak yerine asıl eve kısa referans ver.

## 5) Task-type Recipes

### Yeni public page

- Önce bak:
  - `src/app/[locale]/(app)`
  - `data/route-content/enki-v1-sitemap-seo-template.csv`
  - benzer metadata pattern'leri (`kesfet`, `artistler/[slug]`)
- Adımlar:
  - page dosyasını aç
  - canonical path için CSV'ye satır ekle
  - `getRouteContent(path)` ile metadata bağla
  - gerekiyorsa breadcrumb / JSON-LD ekle
- Komutlar:
  - `python3 scripts/generate-route-content.py`
  - `npm run build`
- Kontrol:
  - public/internal route ayrımı
  - sitemap / robots etkisi
  - prefixsiz ve prefixli locale açılışı
- Docs etkisi:
  - teknik karar değiştiyse `docs/SSOT.md`

### Yeni hub slug

- Önce bak:
  - `src/lib/hub/hubs.v1.ts`
  - `src/app/[locale]/(app)/kesfet/page.tsx`
  - `src/app/[locale]/(app)/kesfet/[hub]/page.tsx`
  - `src/lib/gallery/manifest.v1.ts`
- Adımlar:
  - hub config'e slug ve `canonicalPath` ekle
  - route-content CSV'ye aynı path'i ekle
  - gerekirse gallery normalize katmanını güncelle
- Komutlar:
  - `python3 scripts/generate-route-content.py`
  - `npm run build`
- Kontrol:
  - `/kesfet` landing kartı
  - detail page açılışı
  - gallery bağlantıları
- Docs etkisi:
  - ownership veya canonical kural değiştiyse `docs/SSOT.md`

### Yeni artist slug

- Önce bak:
  - `src/app/[locale]/(app)/artistler/[slug]/page.tsx`
  - `src/app/[locale]/(app)/artistler/page.tsx`
  - route-content CSV
- Adımlar:
  - `ARTIST_SLUGS` ve artist info map'ini güncelle
  - listing kartını besleyen veriyi tamamla
  - route-content CSV'ye detail path ekle
  - ilgili locale key'lerini tamamla
- Komutlar:
  - `python3 scripts/generate-route-content.py`
  - `npm run build`
- Kontrol:
  - `/artistler`
  - yeni detail route
  - en az bir prefixli locale
- Docs etkisi:
  - slug ownership değiştiyse `docs/SSOT.md`

### Yeni locale key

- Önce bak:
  - ilgili component/page
  - `messages/tr.json`
  - diğer locale dosyaları
- Adımlar:
  - key'i önce `tr` içine ekle
  - aynı key setini `en`, `sq`, `sr` içine tamamla
  - component/page kullanımını güncelle
- Komutlar:
  - `node scripts/i18n/check-messages.mjs`
  - `npm run build`
- Kontrol:
  - missing key yok mu
  - uzun metin taşması var mı
  - prefixli locale açılıyor mu
- Docs etkisi:
  - yalnız süreç değiştiyse `docs/WORKFLOW.md`; teknik contract değiştiyse `docs/SSOT.md`

### Yeni content namespace

- Önce bak:
  - `src/i18n/request.ts`
  - `src/content/**`
  - tüketen component/page
- Adımlar:
  - locale bazlı content dosyalarını ekle
  - explicit import zincirini güncelle
  - merge objesini bozmadığını doğrula
- Komutlar:
  - `node scripts/i18n/check-messages.mjs` gerekiyorsa
  - `npm run build`
- Kontrol:
  - runtime translation erişimi
  - namespace tüketen UI
- Docs etkisi:
  - i18n contract değiştiyse `docs/SSOT.md`

### Route-content düzenleme

- Önce bak:
  - `data/route-content/enki-v1-sitemap-seo-template.csv`
  - `scripts/generate-route-content.py`
  - `src/lib/route-content.ts`
- Adımlar:
  - CSV'yi güncelle
  - generator'ı çalıştır
  - generated farkını kontrol et
- Komutlar:
  - `python3 scripts/generate-route-content.py`
  - `npm run build`
- Kontrol:
  - ilgili page metadata
  - sitemap / robots
  - noindex / canonical etkisi
- Docs etkisi:
  - canonical kaynak veya karar değiştiyse `docs/SSOT.md`

### UI shell / header / footer / card değişikliği

- Önce bak:
  - `docs/UI-SYSTEM.md`
  - ilgili canonical component
  - `src/app/globals.css`
- Adımlar:
  - mevcut patterni bozmadan değiştir
  - gerekiyorsa supporting file'ı birlikte güncelle
- Komutlar:
  - `npm run check:no-palette`
  - `npm run build`
  - gerekiyorsa `npm run ui:audit`
- Kontrol:
  - mobile/tablet/desktop
  - locale taşması
  - focus / hit area / truncate zinciri
- Docs etkisi:
  - UI kontratı değiştiyse `docs/UI-SYSTEM.md`

### Docs-only değişiklik

- Önce bak:
  - bilginin asıl evi
  - ilgili canonical kod dosyası
- Adımlar:
  - yalnız doğrulanmış bilgiyi yaz
  - tekrar eden bilgiyi kısalt
  - `UNKNOWN` sınırını koru
- Komutlar:
  - zorunlu komut yok
- Kontrol:
  - rol ayrımı bozuldu mu
  - artifact source-of-truth gibi anlatılıyor mu
- Docs etkisi:
  - yalnız ilgili aktif docs dosyası

## 6) Commit Readiness Matrix

| Değişiklik türü | Zorunlu komut | Opsiyonel komut | Gözle kontrol | Docs güncelleme gereği |
|---|---|---|---|---|
| Route / metadata | `python3 scripts/generate-route-content.py`, `npm run build` | `npm run lint` | sitemap, robots, canonical | çoğu durumda `SSOT` |
| UI kontratı | `npm run check:no-palette`, `npm run build` | `npm run ui:audit` | mobile/tablet/desktop, locale taşması | gerekirse `UI-SYSTEM` |
| I18n key/content | `node scripts/i18n/check-messages.mjs`, `npm run build` | `npm run lint` | prefixsiz + prefixli locale | süreç değişirse `WORKFLOW`, contract değişirse `SSOT` |
| NAP / links | `npm run build` | `npm run lint` | footer, contact, JSON-LD | çoğu durumda `SSOT`, bazen `UI-SYSTEM` |
| Docs-only | zorunlu yok | yok | rol ayrımı, tekrar, `UNKNOWN` | ilgili docs dosyası |

## 7) AI Operating Mode

- Keşif:
  - önce canonical kaynağı bul
  - artifact ile gerçek kaynağı ayır
- Mapping:
  - hangi dosya sahip, hangi dosya derived bunu çıkar
  - değişiklik etkisini önceden listele
- Uygulama:
  - source-of-truth'tan başla
  - generated dosyaya doğrudan yazma
- Audit:
  - komut sonucu, smoke check ve docs etkisini birlikte değerlendir
- Kanıt toplama:
  - kod dosyasına dayanmayan iddia yazma
- `UNKNOWN` koruma:
  - prod, proxy, Cloudflare, VPS ve env inventory alanlarını repo dışı kabul et
- Source-of-truth doğrulama:
  - aynı bilgi iki yerde varsa hangisinin canonical olduğunu belirlemeden yazma

## 8) Legacy Transition Notes

- `scripts/i18n/check-messages.mjs` fiziksel olarak hâlâ `docs/output/i18n-*.json` üretir. Hedef model `artifacts/` olsa da mevcut repo gerçeği budur.
- Bazı output/artifact taşıma kararları tamamlanmış olsa da bu script legacy çıkış noktası olarak korunur.
- Home page içindeki maps/reviews URL ayrışması bilinçli olarak dokümante edilmiştir; tek kaynağa indirilmiş değildir.
- Prod keşfi yapılmadan ops dokümanı bilinçli olarak repo-side hazırlık runbook'u seviyesinde tutulur.

## 9) Common Mistake Prevention

- Generated dosyayı elle düzenleme.
- Docs dışı gerçeği docs'a kesin hüküm gibi yazma.
- `/styleguide` veya `/gallery` benzeri yolları canonical public route sanma.
- I18n key ekleyip diğer locale setlerini tamamlamama.
- `src/i18n/request.ts` merge zincirini unutma.
- Business veya source veriyi component içine gömme.
- Artifact'i canonical source gibi gösterme.

## 10) Commit Hazırlığı

- Çalışma ağacında gereksiz generated veya output farkı kalmadığını kontrol et.
- Değişiklik yalnız kodda değil karar seviyesinde ise ilgili aktif docs dosyasını da güncelle.
- `UNKNOWN` olması gereken ifadeleri kesin hüküm olarak bırakma.
- Artifact'i canonical source gibi sunma.
