# UI-SYSTEM

Bu dosya yaşayan UI kontratlarının evidir. Tarihçe anlatmaz; mevcut shell, component ve copy kurallarını yazar.

## 1) Kapsam

- Public web shell’i `src/components/app/*` etrafında yaşar.
- `/ops` shell’i ayrı bir yüzeydir; public `AppShell` sözleşmesine dahil değildir.
- Component veya sayfa değişikliği yapılırken önce bu dosya, sonra ilgili canonical component okunur.

## 2) Public UI Ownership Matrix

| Alan | Canonical dosya | Not |
|---|---|---|
| App shell | `src/components/app/app-shell.tsx` | `app-container`, `app-mobile-header-offset`, `app-safe-bottom` zinciri korunur |
| Mobile header ve drawer | `src/components/app/mobile-header.tsx` | route listesi ve locale-aware navigation tek elde kalır |
| Footer ve iletişim | `src/components/app/site-footer.tsx`, `src/app/[locale]/(app)/iletisim/page.tsx` | ikinci NAP/link kaynağı açılmaz |
| Hub kartı | `src/components/hub/hub-card.tsx` | medya oranı ve text taşma zinciri korunur |
| Galeri grid | `src/app/[locale]/(app)/galeri-tasarim/gallery-grid.tsx` | query-param ve viewer davranışı bozulmaz |
| Piercing yüzeyleri | `src/components/piercing/*` | lookup/data/layout birlikte ele alınır |

## 3) Public Shell Kontratı

- Public shell `src/components/app/app-shell.tsx` içindedir.
- `main` container şu zinciri korur: `app-container app-mobile-header-offset app-safe-bottom no-overflow-x`.
- Header hide/show davranışı `useHideHeaderOnScroll` ile çalışır; scroll dinleyicisi frame-frame React state ile yeniden kurulmaz.
- Top-level nav kaynağı tek yerde kalır; ikinci nav kaynağı açılmaz.
- Mobil drawer footer CTA alanı hesap açma ve giriş akışına hizmet eder; WhatsApp burada birincil footer CTA değildir (`src/components/app/mobile-header.tsx`).
- Footer ve iletişim yüzeyi business bilgilerini component içine gömmez; `src/lib/site-info.ts` ve `src/lib/site/links.ts` kullanılır.
- Çevrilebilir public copy `messages/*.json` veya ilgili content namespace içinden gelir.

## 4) `/ops` UI Contract

### Sınır

- `/ops` public locale ağacından ayrıdır (`src/middleware.ts`, `src/app/ops/layout.tsx`).
- `/ops` shell’i `src/components/ops/ops-shell.tsx` içindedir.
- Staff ve user sayfaları bu shell üzerinde çalışır; public `AppShell` utility ve route mantığı taşınmaz.

### Dil ve copy

- Ops panel yalnız Türkçe kullanıcı akışı olarak tasarlanır.
- Kullanıcıya dönük copy gerçek Türkçe karakterlerle yazılmalıdır.
- Mevcut ops kaynak copy’si büyük ölçüde gerçek Türkçe karakter standardına çekilmiştir; yeni ve güncellenen yüzeyler aynı standardı korur.
- Kullanıcıya dönük metinlerde iç sistem dili gösterilmez.
- İngilizce iç terimler, rol anahtarları, altyapı notları ve placeholder/foundation anlatıları kullanıcı copy’sine taşınmamalıdır.

### Shell ritmi

- `OpsShell` zaten sticky üst bar, desktop nav ve fixed mobile bottom nav taşır (`src/components/ops/ops-shell.tsx`).
- Shell üst alanı kısa ve sakin kalmalıdır; kullanıcı adı, rol bilgisi, çıkış aksiyonu ve nav aynı anda baskın görünmemelidir.
- Sayfa içi hero alanları bu shell’i tekrar etmemelidir.
- Özellikle badge + başlık + açıklama tekrarları dikey alan tüketimini artırıyorsa sadeleştirme tercih edilir.
- Shell altındaki `/ops` sayfalarında page-body H1 ve intro varsayılan değildir; kullanıcı konumu shell üst barı ve alt nav üzerinden anlaşılır kalmalıdır.
- İlk gerçek iş bloğu fold üstüne mümkün olduğunca yakın gelmelidir.
- Mobil alt navigasyon `safe-pb-ops-nav` ve `safe-pb-ops-shell` ile çalışır; etiketler tam okunur kalır.
- Staff mobile nav etiketi seti `Kasa`, `Randevu`, `Müşteri`, `Profil` olarak tam görünür (`src/lib/ops/navigation.ts`, `src/components/ops/ops-shell.tsx`).

### Tek iş odağı

- Mobilde ana his “native app” ve “tek iş” olmalıdır.
- Her `/ops` sayfasında birincil aksiyon görsel olarak açık olmalıdır; ikincil özetler ana işi gölgelememelidir.
- Form, liste ve özetler aynı ekranda varsa öncelik sırası açık kurulmalıdır.

### Ekran bazlı öncelik kuralları

- Kasa: hızlı kayıt birincil yüzeydir; kompakt `Gelir / Gider` kontrolü, kısa preset etiketleri, tutar ve `Kaydı ekle` akışı öne çıkar. Tarih secondary, not disclosure, gün özeti ve defter ikincil destek katmanıdır.
- Randevular: ilk görünür ana yüzey aylık takvimdir; mobile ve tablet month root, shell safe padding dışında kalan genişliği mümkün olduğunca kullanır ve dar ortalı kart gibi durmaz.
- Staff month overview sessiz kalır; hücre içinde yalnız gün numarası, kategorik occupancy decoration ve seçili state görünür.
- Staff month root içinde exact count rakamı gösterilmez; doluluk bilgisi küçük ikinci numeral yerine decoration tabanlı marker ile verilir.
- Staff month occupancy final kontratı sabittir: `low` kısa kapsül, `medium` daha geniş kapsül, `high` en geniş ve daha güçlü kapsüldür; hiçbir seviyede ikinci numeral kullanılmaz.
- Staff month state kontratı sabittir: `selected` ana dolu bloktur, `today` hafif ama net ikincil işarettir, `occupancy` tarih rakamıyla yarışmayan ayrı secondary decoration ailesidir.
- Mobile month root mümkün olduğunca screen-first davranır; dış card hissi ve gereksiz inset azaltılır, takvim ana yüzey olarak okunur.
- Staff day/detail bağlamı exact count bilgisini taşır; month grid tarama yüzeyi olarak kategorik yoğunluk okutur.
- Staff randevu katmanları mobilde net ayrılır: month overview -> day agenda sheet -> detail sheet -> create/edit form sheet.
- Day agenda utility sheet gibi davranır; kısa liste, exact count ve yakın create bağlamı taşır. Detail sheet read-first, create/edit sheet form-first davranır.
- Desktop staff randevu yüzeyi mobilin büyütülmüş hali gibi kalmaz; root takvim alanı daha geniş kullanılır, day/create katmanları sağ panel veya floating panel hissine yaklaşır, detail tek odaklı ayrı katman olarak okunur.
- Staff randevu FAB görünürlük kuralı sabittir: root month view görünür, day agenda görünür, detail gizli, create/edit gizli.
- Staff randevu FAB, grid veya sheet listesinin üstüne veri örtecek şekilde bırakılmaz; mobile’da içerik alt padding’i ve safe area birlikte düşünülür.
- Staff v1 görünür aksiyonları yeni randevu, düzenle ve sil ile sınırlıdır; status yönetimi bu yüzeyde görünmez.
- Müşteriler: arama ve hızlı create aynı workspace içinde birlikte görünür; yeni müşteri oluşturma yolu gizlenmez.
- Müşteri detayı: profil, form, onay durumu, randevu ve staff notu aynı yüzeyde olabilir; fakat iç model terimleri kullanıcı copy’sine sızmamalıdır.
- User lane top-level hedefleri `Onaylar`, `Randevular`, `Formum`, `Profil` olarak görünür. Kullanıcı login/register sonrası `Onaylar` alanına düşer.
- `Onaylar` user lane içinde bağımsız, sakin, read-only bilgi merkezidir; form veya randevu alt adımı gibi kurgulanmaz.
- `Onaylar` form ve randevu alanlarından ayrı durur; belge adı, durum, sürüm ve hesap kaydı bilgisini kısa kartlarla gösterir; süreç özeti, placeholder etiketleri ve yönlendirici anlatı açmaz.
- User next-step mantığı yalnız gerçek eksik hazırlık adımlarını işaret eder; `Onaylar` alanı formu tamamlayınca açılan zorunlu kapı gibi yazılmaz.
- User randevuları: müşteri hazır değilse yeni randevu formu yerine eksik profile/form adımına yönlendiren baskın CTA görünür; hazırsa yeni randevu formu fold üstünde ana yüzey olur.
- Bu repo sürümünde `Onaylar` sayfası bilgi merkezi ve read-only durum yüzeyidir. Tek checkbox submit/save, hesap kaydı write akışı, admin müşteri görünürlüğü genişletmesi ve legal markdown binding sonraki PR kapsamıdır.
- Profil ve placeholder benzeri sayfalar ürün dışı açıklama diline kaymamalıdır.

## 5) Kanıtlı Known Issues ve Polish Backlog

Bu bölüm çözüldü listesi değildir; repo içindeki mevcut durumun kısa kaydıdır.

- `OpsShell` üst alanı sakin tutulur; buna rağmen bazı dense workspace yüzeylerinde kart yoğunluğu veya secondary copy yeni polish turlarında daha da azaltılabilir (`src/components/ops/ops-shell.tsx`, `src/app/ops/staff/*.tsx`, `src/app/ops/user/*.tsx`).
- Kasa ekranı artık hızlı kayıt merkezlidir; mobilde form fold üstünde daha nettir, desktop’ta summary rail daha sakin destek yüzeyi gibi davranır. Yine de spacing, micro-copy ve micro-motion tarafında ince polish alanı kalır (`src/app/ops/staff/kasa/page.tsx`, `src/components/ops/ops-cash-entry-form.tsx`).
- Müşteri ve user workspace yüzeylerinde kart yoğunluğu hâlâ yüksektir; ürün dili temizlenmiş olsa da bilgi hiyerarşisi sonraki polish turlarında sadeleştirilebilir (`src/app/ops/staff/musteriler/[userId]/page.tsx`, `src/app/ops/user/profil/page.tsx`, `src/app/ops/user/form/page.tsx`).
- Repo içinde görülen `middleware` -> `proxy` build uyarısı ayrı bakım konusudur; mevcut UI polish bunu çözülmüş varsaymaz.

Repo içinden doğrulanamayan “render’da Türkçe karakter bozuluyor” türü görsel raporlar burada kesin hüküm olarak yazılmaz; kaynak copy’nin mevcut hali tek başına bu görsel sonucu kanıtlamaz.

## 6) Shared UI Foundations

- Tema tokenları `src/app/globals.css` içindedir; palette sınıfı bypass edilmez.
- `app-container`, `app-section`, `safe-pb-ops-shell`, `safe-pb-ops-nav` gibi utility’ler yeniden yazılmaz.
- `IconButton`, `Button`, `Input`, `Textarea`, `Card` gibi mevcut primitive’ler varken ikinci primitive açılmaz.
- Responsive kontrolde mobile, tablet ve desktop birlikte düşünülür.

## 7) Minimum Kabul Kriterleri

| Yüzey | Kabul kriteri |
|---|---|
| Mobile | yatay taşma yok; safe-area ve fixed nav içeriği kapatmıyor |
| Desktop | shell ve içerik hiyerarşisi korunuyor |
| Bottom nav | etiketler okunabilir; anlam kaybı yaratacak kırpılma yok |
| Copy | kullanıcıya dönük metin gerçek Türkçe karakterlerle ve ürün diliyle yazılmış |
| Aksiyon hiyerarşisi | birincil iş akışı özet kartları veya teknik açıklamalar tarafından gölgelenmiyor |
| Erişilebilirlik | hit area, `aria-label`, `aria-current`, `focus-visible` korunuyor |

## 8) Anti-patternler

- Public ve `/ops` shell kurallarını birbirine karıştırmak
- Kullanıcı copy’sine teknik iç sistem terimi taşımak
- Sayfa içinde ikinci header ritmi açmak
- Mobil alt navigasyonda okunamayacak kısa etiketlere güvenmek
- Gerçek ürün alanında placeholder/foundation dili bırakmak
- Aynı işi çözen ikinci kart, form veya nav primitive’i açmak
