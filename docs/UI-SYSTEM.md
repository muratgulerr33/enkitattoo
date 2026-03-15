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
| Footer ve iletişim | `src/components/app/site-footer.tsx`, `src/app/[locale]/(app)/iletisim/page.tsx`, `src/lib/legal/legal-registry.ts` | ikinci NAP/link kaynağı açılmaz; footer bilgilendirme linkleri prefixsiz public legal route’lara registry üzerinden beslenir |
| Hub kartı | `src/components/hub/hub-card.tsx` | medya oranı ve text taşma zinciri korunur |
| Galeri grid | `src/app/[locale]/(app)/galeri-tasarim/gallery-grid.tsx` | query-param ve viewer davranışı bozulmaz |
| Piercing yüzeyleri | `src/components/piercing/*` | lookup/data/layout birlikte ele alınır |

## 3) Public Shell Kontratı

- Public shell `src/components/app/app-shell.tsx` içindedir.
- `main` container şu zinciri korur: `app-container app-mobile-header-offset app-safe-bottom no-overflow-x`.
- Header hide/show davranışı `useHideHeaderOnScroll` ile çalışır; scroll dinleyicisi frame-frame React state ile yeniden kurulmaz.
- Top-level nav kaynağı tek yerde kalır; ikinci nav kaynağı açılmaz.
- Mobil drawer footer CTA alanı hesap açma ve giriş akışına hizmet eder; `Kullanıcı hesabı` utility bloğu tek kısa yardımcı satır taşır ve kaldırılmış form akışına referans vermez (`src/components/app/mobile-header.tsx`, `messages/*.json`).
- Footer ve iletişim yüzeyi business bilgilerini component içine gömmez; `src/lib/site-info.ts` ve `src/lib/site/links.ts` kullanılır.
- Footer bilgilendirme linkleri locale-aware kalır; bölüm başlığı `Bilgilendirme` olarak görünür ve mobilde daha sıkı grid ritmiyle taranır. Link seti `KVKK Aydınlatma Metni`, `Gizlilik Politikası`, `Çerez Politikası`, `Dövme Sözleşmesi`, `Piercing Sözleşmesi` olarak kalır ve `src/lib/legal/legal-registry.ts` içinden beslenir.
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
- Placeholder ve seçilmemiş select değeri gerçek veri gibi görünmez; düşük kontrastlı, ikincil yardımcı katman olarak kalır (`src/components/ui/input.tsx`, `src/components/ui/textarea.tsx`, `src/components/ui/select.tsx`).

### Shell ritmi

- `OpsShell` zaten sticky üst bar, desktop nav ve fixed mobile bottom nav taşır (`src/components/ops/ops-shell.tsx`).
- Shell üst alanı kısa ve sakin kalmalıdır; kullanıcı adı, rol bilgisi, çıkış aksiyonu ve nav aynı anda baskın görünmemelidir.
- Sayfa içi hero alanları bu shell’i tekrar etmemelidir.
- Özellikle badge + başlık + açıklama tekrarları dikey alan tüketimini artırıyorsa sadeleştirme tercih edilir.
- Shell altındaki `/ops` sayfalarında page-body H1 ve intro varsayılan değildir; kullanıcı konumu shell üst barı ve alt nav üzerinden anlaşılır kalmalıdır.
- İlk gerçek iş bloğu fold üstüne mümkün olduğunca yakın gelmelidir.
- Mobil alt navigasyon `safe-pb-ops-nav` ve `safe-pb-ops-shell` ile çalışır; etiketler tam okunur kalır ve bar viewport’a fixed native tab bar gibi bağlı kalır.
- User mobile shell fold üstünde daha ekonomik kalır; alt nav ve page-body padding içerikten gereksiz alan çalmaz (`src/components/ops/ops-shell.tsx`).
- Staff mobile nav etiketi seti `Kasa`, `Randevu`, `Müşteri`, `Profil` olarak tam görünür (`src/lib/ops/navigation.ts`, `src/components/ops/ops-shell.tsx`).
- User mobile nav etiketi seti `Onaylar`, `Randevular`, `Profil` olarak tam görünür; kolon yapısı item sayısına göre akar (`src/lib/ops/navigation.ts`, `src/components/ops/ops-shell.tsx`).

### Tek iş odağı

- Mobilde ana his “native app” ve “tek iş” olmalıdır.
- Her `/ops` sayfasında birincil aksiyon görsel olarak açık olmalıdır; ikincil özetler ana işi gölgelememelidir.
- Form, liste ve özetler aynı ekranda varsa öncelik sırası açık kurulmalıdır.

### Ekran bazlı öncelik kuralları

- Kasa: hızlı kayıt birincil yüzeydir; kompakt `Gelir / Gider` kontrolü, kısa preset etiketleri, tutar ve `Kaydı ekle` akışı öne çıkar. Tarih secondary, not disclosure, gün özeti ve defter ikincil destek katmanıdır. Disclosure row mobile-safe kalır ve x-overflow üretmez.
- Randevular: ilk görünür ana yüzey aylık takvimdir; mobile ve tablet month root, shell safe padding dışında kalan genişliği mümkün olduğunca kullanır ve dar ortalı kart gibi durmaz.
- Staff month overview sessiz kalır; hücre içinde yalnız gün numarası, kategorik occupancy decoration ve seçili state görünür.
- Staff month root içinde exact count rakamı gösterilmez; doluluk bilgisi küçük ikinci numeral yerine decoration tabanlı marker ile verilir.
- Staff month occupancy final kontratı sabittir: `low` kısa kapsül, `medium` daha geniş kapsül, `high` en geniş ve daha güçlü kapsüldür; hiçbir seviyede ikinci numeral kullanılmaz.
- Staff month state kontratı sabittir: `selected` ana dolu bloktur, `today` hafif ama net ikincil işarettir, `occupancy` tarih rakamıyla yarışmayan ayrı secondary decoration ailesidir.
- Mobile month root screen-first davranır; dış card hissi ve gereksiz inset azaltılır, takvim ana yüzey olarak okunur ve gerçek cihaz viewport’unda ilk açılışta page vertical scroll üretmez.
- Staff day/detail bağlamı exact count bilgisini taşır; month grid tarama yüzeyi olarak kategorik yoğunluk okutur.
- Staff randevu katmanları mobilde net ayrılır: month overview -> day agenda sheet -> detail sheet -> create/edit form sheet.
- Day agenda utility sheet gibi davranır; kısa liste, exact count ve yakın create bağlamı taşır. Detail sheet read-first, create/edit sheet form-first davranır.
- Desktop staff randevu yüzeyi mobilin büyütülmüş hali gibi kalmaz; root takvim alanı daha geniş kullanılır, day/create katmanları sağ panel veya floating panel hissine yaklaşır, detail tek odaklı ayrı katman olarak okunur.
- Staff randevu FAB görünürlük kuralı sabittir: root month view görünür, day agenda görünür, detail gizli, create/edit gizli.
- Staff randevu FAB, grid veya sheet listesinin üstüne veri örtecek şekilde bırakılmaz; mobile’da içerik alt padding’i ve safe area birlikte düşünülür.
- Staff v1 görünür aksiyonları yeni randevu, düzenle ve sil ile sınırlıdır; status yönetimi bu yüzeyde görünmez.
- Müşteriler: arama ve hızlı create aynı workspace içinde birlikte görünür; yeni müşteri oluşturma yolu gizlenmez. Hızlı create kartı ana akışta `Ad soyad` + `Telefon` alanlarını önde tutar, `Kısa not` disclosure olarak secondary açılır. Staff disclosure row pattern’i mobile-safe kalır ve x-overflow üretmez.
- Müşteri detayı: ilk taramada müşteri kimliği, kısa iletişim bilgisi, onay durumu, yaklaşan randevu ve staff notu okunmalıdır. Temel bilgi büyük iç kartlara bölünmez; profil hazır bilgisi pasif büyük kutu gibi davranmaz; onaylar sürüm ve tarih satırıyla daha sakin özetlenir.
- Prefixsiz public legal sayfalar ve `/ops/user/onaylar` aynı markdown kaynak ailesini kullanır (`src/content/legal/*.md`, `src/content/ops/legal/*.md`); içerik ikinci kez hardcode edilmez.
- Profil ve placeholder benzeri sayfalar ürün dışı açıklama diline kaymamalıdır.

### User lane karar matrisi

#### Lock kararlar

- Kullanıcı login/register sonrası `Onaylar` alanına düşer.
- User lane primary top-level hedefleri `Onaylar`, `Randevular`, `Profil` olarak sabittir.
- `Onaylar` user lane içinde bağımsız alandır; başka bir user yüzeyinin alt adımı gibi kurgulanmamalıdır.
- User lane kullanıcıyı lineer `profil -> onay -> randevu` kontratına zorlamamalıdır.
- Onaylar kullanıcı hesabına bağlanır ve staff müşteri detayında görünür. Bu lock karar current runtime’da uygulanmıştır; ancak staff müşteri listesi onay badge’i hâlâ tattoo current consent odaklıdır.

#### Current runtime

- User primary nav desktop ve mobile’da `Onaylar`, `Randevular`, `Profil` setiyle görünür; user lane içinde ayrı dövme detay route’u veya tab’ı bulunmaz (`src/lib/ops/navigation.ts`, `src/components/ops/ops-shell.tsx`).
- `/ops/user/onaylar` current runtime’da tattoo ve piercing belgelerini özet kartlarla gösterir; üst açıklama ve pending kart özeti sizli-resmi dille konuşur, `Metni oku` prefixsiz public legal route’a değil ops içi focused approval reader’a gider.
- `/ops/user/onaylar`, `/ops/user/randevular` ve `/ops/user/profil` current runtime’da mobile-first daha sıkı card padding, daha kısa yardımcı metin ve tek net aksiyon hiyerarşisiyle çalışır; aynı işi tekrar eden ikinci CTA açılmaz.
- Ops approval reader aynı markdown kaynağını kullanır; tattoo ve piercing için scroll sonuna inmeden tek checkbox ve kayıt CTA’sı açılmaz. Reader gövdesi ops yüzeyinde sanitize edilir; `Sitede kullanılacak ...` ve `Kısa ekran özeti` gibi iç kullanım başlıkları kullanıcıya gösterilmez. Current runtime iç scroll yerine ana sayfa scroll’u ve belge sonu marker’ı ile gating uygular; pending state tek kısa durum bloğu taşır.
- `/ops/user/profil` current runtime’da yalnız profil alanıdır; başlık + tek kısa açıklama + form ritmiyle çalışır, status badge veya helper kutu taşımaz.
- `/ops/user/randevular` current runtime’da aktif yaklaşan randevu varsa bunu sayfanın ana yüzeyi yapar; liste açıklamaları sizli-resmi dille yazılır. Prerequisite veya yeni talep yüzeyi yalnız yaklaşan randevu yoksa görünür; create kartı badge taşımaz ve `Uygun gün ve saati seçerek randevu oluşturabilirsiniz.` açıklamasıyla açılır. Prerequisite mantığı yalnız profil eksiğine bakar; ayrı dövme detay prerequisite’i yoktur.
- `/ops/user/form` current runtime’da user surface olarak yaşamaz; bu path’e giden CTA, helper veya readiness bağı kalmamıştır.
- Tattoo ve piercing onayı kaydedildiğinde `/ops/user/onaylar` kartları kısa kullanıcı özeti gösterir; staff customer detail aynı onayları sürüm ve onay tarihiyle görünür tutar.
- Ops mobile shell current runtime’da `min-h-viewport` + fixed bottom nav zinciriyle çalışır; alt nav viewport’a sabit kalır ve staff shell’de native tab bar hissini korur.
- Staff müşteri listesi current runtime’da daha kompakt tarama ritmiyle çalışır; kart içinde güçlü isim, kısa iletişim bilgisi, tek satırlık `Sıradaki randevu` özeti ve daha görünür `Detaya git` aksiyonu yer alır.
- Staff müşteri listesi current runtime’da yalnız güncel tattoo onay badge’ini gösterir; badge copy’si bunu açıkça `Dövme onayı` olarak yazar. Customer detail ise tattoo ve piercing onaylarını ayrı bloklarda özetler.
- Staff kasa ve staff müşteri create disclosure row’ları current runtime’da mobile-safe’dir; `Not / Ekle / Kapat` ve `Kısa not / Not ekle / Kapat` satırları yatay taşma üretmez.
- Staff randevular current runtime’da mobile month root’u shell hack’iyle değil, workspace kendi dikey budget’ını yöneterek screen-first calendar surface gibi gösterir; gerçek cihaz viewport’unda ilk açılışta page vertical scroll üretmez. Bu kontrat shell bottom nav anchoring fix’inden ayrıdır.
- Prefixsiz public legal page, public site shell içinde açılır; ops shell devamlılığı taşımaz.

#### Current inconsistency

- Prefixsiz public legal page belge-odaklı özel yüzey değildir; mevcut durumda public site shell içinde yaşar ve belge odağını dağıtan site-level bağlamı taşır.
- Prefixsiz public legal page ilk `#` başlık dışındaki markdown gövdesini aynen render eder. Ops approval reader bu markdown’ın user-facing sanitize edilmiş sürümünü gösterse de public legal route tam gövdeyi göstermeye devam eder. Repo içindeki kanıtlı iç kullanım başlık örnekleri `Sitede kullanılacak zorunlu onay metni` ve `Kısa ekran özeti`dir.

## 5) Kanıtlı Known Issues ve Polish Backlog

Bu bölüm çözüldü listesi değildir; repo içindeki mevcut durumun kısa kaydıdır.

- `OpsShell` üst alanı sakin tutulur; buna rağmen bazı dense workspace yüzeylerinde kart yoğunluğu veya secondary copy yeni polish turlarında daha da azaltılabilir (`src/components/ops/ops-shell.tsx`, `src/app/ops/staff/*.tsx`, `src/app/ops/user/*.tsx`).
- Kasa ekranı artık hızlı kayıt merkezlidir; mobilde form fold üstünde daha nettir, desktop’ta summary rail daha sakin destek yüzeyi gibi davranır. Yine de içerik yoğunluğu, spacing ve micro-copy tarafında polish alanı kalır (`src/app/ops/staff/kasa/page.tsx`, `src/components/ops/ops-cash-entry-form.tsx`).
- Bazı user workspace yüzeylerinde kart yoğunluğu hâlâ yüksektir; ürün dili temizlenmiş olsa da bilgi hiyerarşisi sonraki polish turlarında sadeleştirilebilir (`src/app/ops/user/randevular/page.tsx`).
- Aktif bir hydration mismatch hatası current runtime kodundan doğrulanamaz; archive notları vardır ama canlı bir bug kanıtı olmadan kesin hüküm yazılmaz.
- Repo içinde görülen `middleware` -> `proxy` build uyarısı ayrı bakım konusudur; mevcut UI polish bunu çözülmüş varsaymaz.

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
