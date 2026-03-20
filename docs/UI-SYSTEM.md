# UI-SYSTEM

Bu dosya yaşayan UI kontratlarının evidir. Tarihçe anlatmaz; mevcut shell, component ve copy kurallarını yazar.

## 1) Kapsam

- Public web shell’i `src/components/app/*` etrafında yaşar.
- `/ops` shell’i ayrı bir yüzeydir; public `AppShell` sözleşmesine dahil değildir.
- Component veya sayfa değişikliği yapılırken önce bu dosya, sonra ilgili canonical component okunur.
- Bu dosya yalnız current runtime visible behavior’ı yazar; implement edilmemiş roadmap ekranları ayrı ve açıkça `planned roadmap` diye işaretlenir.
- Current runtime ops lock appointment-first teknik omurgayı korurken visible staff ürün modelini tek müşteri + tek işlem diline indirir: staff `İşlemler / Müşteriler / Rapor / Ayarlar`, selected day içinde unified işlem workspace, customer detail `İşlem özeti`, service-intake event’lerinden otomatik beslenen kasa yardımcı yüzeyi ve staff `Belge paketi` operasyon sözleşmesi route’u birlikte doğrulanır.

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
- Footer bilgilendirme linkleri locale-aware kalır; bölüm başlığı `Bilgilendirme` olarak görünür ve mobilde daha sıkı grid ritmiyle taranır. Link seti `KVKK Aydınlatma Metni`, `Gizlilik Politikası`, `Çerez Politikası`, `Dövme ve Piercing Sözleşmesi` olarak `src/lib/legal/legal-registry.ts` içinden beslenir.
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
- Current runtime’da top-level staff shell container `max-w-[92rem]` ritmiyle çalışır; 1920x1200 desktop görünümünde içerik eksik sayfa hissi vermeden daha dengeli yayılır (`src/components/ops/ops-shell.tsx`).
- Shell üst alanı kısa ve sakin kalmalıdır; kullanıcı adı, rol bilgisi, bağlamsal header aksiyonu ve nav aynı anda baskın görünmemelidir. Global varsayılan `Çıkış` aksiyonu bu alanda yaşamaz; header sağ alanı sayfa bağlamına göre kullanılır veya boş kalır.
- Sayfa içi hero alanları bu shell’i tekrar etmemelidir.
- Özellikle badge + başlık + açıklama tekrarları dikey alan tüketimini artırıyorsa sadeleştirme tercih edilir.
- Shell altındaki `/ops` sayfalarında page-body H1 ve intro varsayılan değildir; kullanıcı konumu shell üst barı ve alt nav üzerinden anlaşılır kalmalıdır.
- İlk gerçek iş bloğu fold üstüne mümkün olduğunca yakın gelmelidir.
- Mobil alt navigasyon `safe-pb-ops-nav` ve `safe-pb-ops-shell` ile çalışır; etiketler tam okunur kalır ve bar viewport’a fixed native tab bar gibi bağlı kalır. Staff yüzeylerinde son içerik bloğu ile nav arasında rahat ama şişmeyen final clearance korunur.
- User mobile shell fold üstünde daha ekonomik kalır; alt nav ve page-body padding içerikten gereksiz alan çalmaz (`src/components/ops/ops-shell.tsx`).
- Staff mobile nav etiketi seti `İşlemler`, `Müşteriler`, `Rapor`, `Ayarlar` olarak tam görünür; `/ops/staff/kasa` helper yüzeyi açıkken de `Rapor` sekmesi aktif grup olarak okunur (`src/lib/ops/navigation.ts`, `src/components/ops/ops-shell.tsx`).
- User mobile nav etiketi seti `Onaylar`, `Randevular`, `Ayarlar` olarak tam görünür; kolon yapısı item sayısına göre akar (`src/lib/ops/navigation.ts`, `src/components/ops/ops-shell.tsx`).

### Tek iş odağı

- Mobilde ana his “native app” ve “tek iş” olmalıdır.
- Her `/ops` sayfasında birincil aksiyon görsel olarak açık olmalıdır; ikincil özetler ana işi gölgelememelidir.
- Form, liste ve özetler aynı ekranda varsa öncelik sırası açık kurulmalıdır.

### Ekran bazlı öncelik kuralları

- Kasa: current runtime’da gün özeti ve defter service-intake kaynaklı otomatik hareketleri taşır; manuel form yalnız istisna / gider / correction yüzeyi olarak kalır. `Gelir / Gider` kontrolü, kısa kategori etiketi, tutar ve `Kaydı ekle` akışı manuel kayıt için yaşar; sistem satırları read-only kalır. Yüzey cash-only çalışır; ödeme tipi görünmez. Mobile ve desktop öncelik sırası `Manuel giriş -> Defter kontrolü -> Defter` olarak okunur; manuel giriş bu yüzeyin ilk ve birincil işidir. Header sağ aksiyonu current runtime’da yalnız mobil / dar genişlikte görünen `Manuel giriş` sayfa içi atlamasıdır. Disclosure row mobile-safe kalır ve x-overflow üretmez.
- Raporlar: mobile-first sakin bloklar halinde taranır; ağır dashboard veya grafik hissi yoktur. Staff bu yüzeyde `filtreler -> özet -> hareket listesi` sırasıyla çalışır. Filtre seti current runtime’da `tarih aralığı`, `işlem tipi`, `artist` ve `kayıt kaynağı` alanlarını taşır; özet ve liste aynı filtre kapsamına göre güncellenir. Header sağ aksiyonu current runtime’da `Defteri aç` olarak `/ops/staff/kasa` yüzeyine gider; aynı CTA gövde içinde ikinci kez açılmaz. Liste ana bakışta `Gelir/Gider -> Tahsilat/Düzeltme/Manuel -> kısa işlem tipi -> tutar -> kısa destek bilgisi` ritmiyle okunur.
- Kasa otomasyonu current runtime’ın parçasıdır; visible yüzeyde kasa ana başlangıç ekranı değil, otomatik hareketleri kontrol eden ve gerektiğinde manuel gider / düzeltme girilen yardımcı yüzey gibi davranır.
- İşlemler: ilk görünür ana yüzey aylık takvimdir; mobile ve tablet month root, shell safe padding dışında kalan genişliği mümkün olduğunca kullanır ve dar ortalı kart gibi durmaz.
- Selected-day workspace current runtime’da root takvimin hemen altında inline/fold üstü okunur; mobile ve desktop hiyerarşisi `month root -> selected day workspace -> detail/create-edit katmanları` sırasıyla net kalır.
- Staff month overview sessiz kalır; hücre içinde yalnız gün numarası, kategorik occupancy decoration ve seçili state görünür.
- Staff month root içinde exact count rakamı gösterilmez; doluluk bilgisi küçük ikinci numeral yerine decoration tabanlı marker ile verilir.
- Staff month root current runtime’da source-aware ikinci sinyal göstermez; occupancy dili tek neutral işlem yoğunluğu olarak kalır.
- Staff month occupancy final kontratı sabittir: `low` kısa kapsül, `medium` daha geniş kapsül, `high` en geniş ve daha güçlü kapsüldür; hiçbir seviyede ikinci numeral kullanılmaz.
- Staff month state kontratı sabittir: `selected` ana dolu bloktur ve bir kademe daha net okunur, `today` hafif ama net ikincil işarettir, `occupancy` tarih rakamıyla yarışmayan ayrı secondary decoration ailesidir.
- Mobile month root screen-first davranır; dış card hissi ve gereksiz inset azaltılır, takvim ana yüzey olarak okunur ve gerçek cihaz viewport’unda ilk açılışta page vertical scroll üretmez.
- Staff day/detail bağlamı exact count bilgisini taşır; month grid tarama yüzeyi olarak kategorik yoğunluk okutur.
- Staff işlem katmanları mobilde net ayrılır: month overview -> day agenda sheet -> detail sheet -> create/edit form sheet.
- Day agenda utility sheet gibi davranır; kısa liste, exact count ve yakın create bağlamı taşır. Detail sheet read-first, create/edit sheet form-first davranır.
- Desktop staff işlemler yüzeyi mobilin büyütülmüş hali gibi kalmaz; root takvim alanı daha geniş kullanılır, day/create katmanları sağ panel veya floating panel hissine yaklaşır, detail tek odaklı ayrı katman olarak okunur.
- Staff işlem FAB görünürlük kuralı sabittir: root month view görünür, day agenda görünür, detail gizli, create/edit gizli.
- Staff işlem FAB, grid veya sheet listesinin üstüne veri örtecek şekilde bırakılmaz; mobile’da içerik alt padding’i ve safe area birlikte düşünülür. Root takvim bittikten sonra anlamsız büyük boşluk bırakılmaz; desktop’ta FAB viewport kenarına kopuk düşmez, ana içerik bloğunun sağ ritmiyle hizalanır.
- Staff görünür aksiyonları yeni işlem, düzenle ve sil ile sınırlıdır; status yönetimi bu yüzeyde görünmez.
- Current runtime IA appointment-first kalır; yeni route veya tab açılmaz. Unified service session workspace aynı `/ops/staff/randevular` yüzeyinde, month root’u bozmadan selected day/detail/create-edit katmanında görünür olur.
- Staff day agenda current runtime’da appointment ve walk-in kayıtlarını aynı liste içinde gösterir; visible ürün dili source badge göstermez, sıra aynı gün/saat içinde deterministic kalır.
- Staff create formu current runtime’da tek visible işlem formudur; source selector görünmez. Ortak alanlar müşteri, artist, işlem tipi, tarih, saat, toplam, kapora ve not olarak aynı kalır. Create sheet seçili gün ile prefill açılır, tarih alanı form içinden düzenlenebilir kalır ve varsayılan saat seçili günün mevcut işlemleriyle bugün-zaman bağlamına göre önerilir.
- Staff service session formu current runtime’da `noValidate` yaklaşımıyla browser native required tooltip’ine yaslanmaz; boş/bozuk alanlar aynı sheet içinde app-level hata metniyle görünür.
- Staff service session formunda `Kapora` opsiyoneldir; boş bırakılabilir veya `0` olabilir. Yardımcı copy bunu açıkça opsiyonel anlatır.
- Staff service session tarafında current runtime PR-C ile `Kapora` değişimleri otomatik kasa satırı üretir; pozitif delta tahsilat, negatif delta düzeltme olarak görünür. `Toplam`, tarih, saat, müşteri ve not değişimi tek başına kasa satırı üretmez.
- Staff işlem formunda müşteri alanı `Mevcut müşteri` ve `Yeni müşteri` seçimleriyle net ayrılır. `Yeni müşteri` seçimi aynı form içinde küçük inline `Hızlı müşteri` alanını açar.
- Staff işlem içi inline müşteri oluşturma alanı mobile-first kompakt kalır; `Ad soyad`, `Telefon`, opsiyonel `E-posta` alanlarıyla çalışır, başarıda yeni müşteri otomatik seçilir, tarih/saat/işlem tipi/tutar/not bağlamı korunur.
- Inline `Yeni müşteri` akışı aynı sheet içinde kalır; redirect etmez, kullanıcıya `NEXT_REDIRECT` veya ham teknik hata stringi göstermez. Başarısızlıkta kısa ve insan-okunur alan/işlem hatası görünür.
- Staff detail sheet read-first davranır; müşteri + tarih/saat bloğunun hemen altında read-only `İşlem özeti` görünür. Bu özet minimum olarak `İşlem tipi`, `Artist`, `Toplam`, `Kapora`, `Kalan` alanlarını taşır ve artist alanı sonradan eklenmiş gibi değil, aynı kompakt summary ritmi içinde okunur.
- Staff detail sheet current runtime’da bağlı `serviceIntakeId` varsa görünür `Belge` aksiyonu taşır; bu aksiyon customer detail’e değil packet preview route’una gider ve edit/destructive aksiyonlardan ayrı üst seviye kalır.
- Staff edit sheet form-first kalır ama üstünde kısa müşteri bağlamı ve read-only `İşlem özeti` gösterir; appointment ve walk-in aynı form omurgasını reuse eder. Drawer yüksekliği ve iç spacing ana summary + form başlangıcını ilk görünürde daha rahat okunur tutar.
- Appointment ve walk-in detail/edit sheet aynı summary kontratını taşır; summary alan adları customer detail `İşlem özeti` kartıyla uyumlu kalır.
- `/ops/staff/belgeler/[serviceIntakeId]` packet-first değil, sözleşme-first yüzeydir; ops shell nav/header chrome’u bu route’ta görünmez. Üstte yalnız sade `Geri`, `Yazdır` ve `1 kopya / 2 kopya` seçimi kalır; print sırasında bu bar gizlenir.
- Staff document preview current runtime’da kart-heavy app preview gibi değil, tek sayfa A4 operasyon sözleşmesi gibi görünür: sol üst `Sayı`, sağ üst `Kayıt Tarihi`, ortada resmi hiyerarşili başlık, gövdede yalnız maddeler ve altta daha kurumsal iki kolonlu müşteri / işlem bilgisi alanları bulunur.
- Staff document preview seçilen kopya sayısı kadar aynı sözleşmeyi render eder. `1 kopya / 2 kopya` davranışı render ve print sayısını değiştirir ama `Müşteri nüshası` / `Stüdyo nüshası` küçük üst notları görünmez; işlem bilgisi alanında artist satırı yer alır ve para alanları `TL` ile görünür.
- Staff document preview’de legal maddeler current runtime’da tek continuous ordered-list olarak akar; her kopyada 1..7 numaralandırması korunur, her satır yeni `1.` gibi kırılmaz.
- Ops mobile shell ve staff sayfaları current runtime’da fixed bottom nav üstünde daha güvenli alt boşluk taşır; müşteri list/detail, kasa, randevu workspace ve sözleşme preview son içerikleri nav veya screen edge ile çakışmadan okunur.
- Staff işlem delete confirm browser `confirm()` ile değil, app-level dialog ile açılır; `Vazgeç` güvenli default, destructive aksiyon açık metinle görünür kalır.
- Detail sheet içinden başarılı delete sonrası seçili appointment temizlenir ve workspace yeniden day drawer’a zıplamaz; kullanıcı yeni seçim yapana kadar yüzey stabil kalır.
- İşlem detail içindeki destructive action feedback temiz ve kısa kalır; kullanıcıya teknik DB hata metni gösterilmez. Walk-in detail bu PR’da delete açmaz, yalnız edit aksiyonu taşır.
- Staff randevu empty-state copy’leri kısa ve doğal Türkçe ile kalır; kırık, yarım veya placeholder metin bırakılmaz.
- Müşteriler: arama ana akış, hızlı create yan akış olarak aynı workspace içinde birlikte görünür; yeni müşteri oluşturma yolu gizlenmez. Desktop’ta arama bloğu daha baskın, hızlı create daha sessiz yardımcı blok gibi okunur. Kartın tamamı primary action gibi okunur; trailing affordance daha net ama bağırmayan bir yön işareti olarak kalır. Kartın okunma sırası `ad soyad -> telefon -> yaklaşan randevu tarihi/saat veya "Yaklaşan randevu yok" -> yön affordance` şeklindedir. Kartta görünür e-posta, `Sıradaki işlem` etiketi veya geçmiş işlem özeti yer almaz. Visible consent badge, dijital onay dili veya sürüm copy’si staff liste yüzeyine çıkmaz. Hızlı create kartı `Ad soyad` + `Telefon` alanlarını önde tutar, `Not` disclosure olarak secondary açılır. Staff disclosure row pattern’i mobile-safe kalır ve x-overflow üretmez.
- Müşteri detayı: ilk taramada müşteri kimliği, kısa iletişim bilgisi, işlem özeti, artist notu ve yaklaşan/geçmiş işlemler okunmalıdır. Temel bilgi büyük iç kartlara bölünmez; `Profil durumu` satırı görünür yüzeyde yer almaz; visible consent kartı, dijital onay badge’i veya version/status copy’si bu yüzeye çıkmaz.
- Staff müşteri detail `İşlem özeti` kartı müşteri bazlı latest service intake kaydını gösterir; bu kart `Kaynak` alanı taşımaz ve day/detail workspace’in devamı değil, müşteri zaman çizgisinin son özetidir.
- Staff müşteri detail current runtime’da belge paketi için primary trigger değildir; yanlış session açmamak için packet aksiyonu bu yüzeyde açılmaz.
- Staff kasa defterinde system-generated satırlar görünür kart düzeyinde teknik log meta taşımaz; destek satırı insan odaklı kısa tarih/saat bilgisiyle kalır ve manage affordance yalnız manuel kayıtlarda görünür. Bu yüzey ikinci bir finans ekranı açmadan aynı listede manual ve automated satırları birlikte okutur.
- Staff ayarlar yüzeyi yardımcı ritmi korur; shared hesap formu ve şifre değiştir blokları kısa kalır. `Çıkış` aynı sayfanın altındaki sakin `Oturum` bloğunda yer alır. Admin için eklenen `Artist yönetimi` bölümü aynı sayfada sade ikinci kolon gibi görünür, ayrı panel mimarisi kurmaz.
- Prefixsiz public legal sayfalar ve `/ops/user/onaylar` aynı markdown kaynak ailesini kullanır (`src/content/legal/*.md`, `src/content/ops/legal/*.md`); içerik ikinci kez hardcode edilmez.
- Profil ve placeholder benzeri sayfalar ürün dışı açıklama diline kaymamalıdır.

### User lane karar matrisi

#### Lock kararlar

- Kullanıcı login/register sonrası `Onaylar` alanına düşer.
- User lane primary top-level hedefleri `Onaylar`, `Randevular`, `Ayarlar` olarak sabittir.
- `Onaylar` user lane içinde bağımsız alandır; başka bir user yüzeyinin alt adımı gibi kurgulanmamalıdır.
- User lane kullanıcıyı lineer `profil -> onay -> randevu` kontratına zorlamamalıdır.
- Onaylar kullanıcı hesabına bağlanır ve user lane içinde kalır. Staff top-level surfaces current runtime’da dijital onay badge/copy taşımaz; visible operasyon dili tek müşteri + tek işlem ekseninde kalır.

#### Current runtime

- User primary nav desktop ve mobile’da `Onaylar`, `Randevular`, `Ayarlar` setiyle görünür; user lane içinde ayrı dövme detay route’u veya tab’ı bulunmaz (`src/lib/ops/navigation.ts`, `src/components/ops/ops-shell.tsx`).
- `/ops/user/onaylar` current runtime’da tek combined sözleşme kartı gösterir; üst açıklama ve pending kart özeti sizli-resmi dille konuşur, `Sözleşmeyi aç` aksiyonu prefixsiz public legal route’a değil ops içi focused approval reader’a gider.
- `/ops/user/onaylar`, `/ops/user/randevular` ve `/ops/user/profil` current runtime’da mobile-first daha sıkı card padding, daha kısa yardımcı metin ve tek net aksiyon hiyerarşisiyle çalışır; aynı işi tekrar eden ikinci CTA açılmaz.
- Ops approval reader aynı markdown kaynağını kullanır; combined sözleşme için scroll sonuna inmeden tek checkbox ve kayıt CTA’sı açılmaz. Reader gövdesi ops yüzeyinde sanitize edilir; `Sitede kullanılacak ...` ve `Kısa ekran özeti` gibi iç kullanım başlıkları kullanıcıya gösterilmez. Current runtime iç scroll yerine ana sayfa scroll’u ve belge sonu marker’ı ile gating uygular; pending state tek kısa durum bloğu taşır.
- `/ops/user/profil` current runtime’da `Ayarlar` yüzeyidir; profil bilgileri ve şifre değiştirme aynı sakin kart ritmiyle görünür, status badge veya helper kutu taşımaz. `Çıkış` bu yüzeyin altındaki sakin `Oturum` bloğunda yer alır.
- `/ops/user/randevular` current runtime’da aktif yaklaşan randevu varsa bunu sayfanın ana yüzeyi yapar; liste açıklamaları sizli-resmi dille yazılır. Prerequisite veya yeni talep yüzeyi yalnız yaklaşan randevu yoksa görünür; create kartı badge taşımaz ve `Uygun gün ve saati seçerek randevu oluşturabilirsiniz.` açıklamasıyla açılır. Prerequisite mantığı yalnız profil eksiğine bakar; ayrı dövme detay prerequisite’i yoktur.
- `/ops/user/form` current runtime’da user surface olarak yaşamaz; bu path’e giden CTA, helper veya readiness bağı kalmamıştır.
- Combined sözleşme onayı kaydedildiğinde `/ops/user/onaylar` kartı kısa kullanıcı özeti gösterir; staff top-level surfaces bu onayı visible badge/kart olarak açmaz.
- Ops mobile shell current runtime’da `min-h-viewport` + fixed bottom nav zinciriyle çalışır; alt nav viewport’a sabit kalır ve staff shell’de native tab bar hissini korur.
- Staff müşteri listesi current runtime’da daha kompakt tarama ritmiyle çalışır; boş durumda `Müşteriler`, arama aktifken `Arama sonuçları` başlığı ve sonuç sayısı copy’si görünür. Desktop’ta sonuç kartları daha rahat tarama için tek dev sütun hissinden çıkarılabilir. Kart içinde güçlü isim, telefon, doğrudan yaklaşan randevu tarihi/saat veya `Yaklaşan randevu yok` satırı ve kart primary action’ını destekleyen hafif bir yön affordance’ı yer alır; görünür e-posta veya `Sıradaki işlem` etiketi açılmaz.
- Staff müşteri detail current runtime’da bilgi yoğunluğunu yükseltmeden çalışır; `Temel bilgi`, `İşlem özeti`, tek güncel artist notu ve yaklaşan/geçmiş randevu blokları sakinleşmiş copy ve kompakt spacing ile aynı ekranda kalır. Header ve temel bilgi alanında görünür e-posta açılmaz; `Profil durumu` satırı visible yüzeyde açılmaz. Visible consent bölümü açılmaz.
- Ops-visible para gösterimi current runtime’da kuruşsuz ve `TL` ekli sade sayı formatıyla hizalanır; kasa, raporlar, müşteri `İşlem özeti`, staff işlem summary’leri ve belge paketi aynı whole-number display ritmini kullanır. Input serialization helper’ları bu kontratın parçası değildir.
- Staff kasa ve staff müşteri create disclosure row’ları current runtime’da mobile-safe’dir; `Not / Ekle / Kapat` satırları yatay taşma üretmez.
- Staff randevular current runtime’da mobile month root’u shell hack’iyle değil, workspace kendi dikey budget’ını yöneterek screen-first calendar surface gibi gösterir; gerçek cihaz viewport’unda ilk açılışta page vertical scroll üretmez. Bu kontrat shell bottom nav anchoring fix’inden ayrıdır.
- Prefixsiz public legal page, public site shell içinde açılır; ops shell devamlılığı taşımaz.

#### Current inconsistency

- Prefixsiz public legal page belge-odaklı özel yüzey değildir; mevcut durumda public site shell içinde yaşar ve belge odağını dağıtan site-level bağlamı taşır.

## 5) Kanıtlı Known Issues ve Polish Backlog

Bu bölüm çözüldü listesi değildir; repo içindeki mevcut durumun kısa kaydıdır.

- `OpsShell` üst alanı sakin tutulur; buna rağmen bazı dense workspace yüzeylerinde kart yoğunluğu veya secondary copy yeni polish turlarında daha da azaltılabilir (`src/components/ops/ops-shell.tsx`, `src/app/ops/staff/*.tsx`, `src/app/ops/user/*.tsx`).
- Kasa yardımcı / son kontrol yüzeyi current runtime’da daha sakinleşmiştir; buna rağmen rapor girişi, geçmiş yönetimi ve micro-copy tarafında ileride yeni küçük polish alanları kalabilir (`src/app/ops/staff/kasa/page.tsx`, `src/components/ops/ops-cash-entry-form.tsx`, `src/app/ops/staff/raporlar/page.tsx`).
- PR-C sonrası kasa ekranında service-source satırlar read-only kalsa da source detay linki veya daha zengin reconciliation görünümü açılmaz; ilk tur aynı listeyi badge/copy seviyesinde ayırır (`src/app/ops/staff/kasa/page.tsx`).
- Bazı user workspace yüzeylerinde kart yoğunluğu hâlâ yüksektir; ürün dili temizlenmiş olsa da bilgi hiyerarşisi sonraki polish turlarında sadeleştirilebilir (`src/app/ops/user/randevular/page.tsx`).
- Toast feedback sistemi current runtime kontratı değildir; create/edit success ve hata geri bildirimi ayrı follow-up PR’da ele alınacaktır.
- Aktif bir hydration mismatch hatası current runtime kodundan doğrulanamaz; archive notları vardır ama canlı bir bug kanıtı olmadan kesin hüküm yazılmaz.
- Repo içinde görülen `middleware` -> `proxy` build uyarısı ayrı bakım konusudur; mevcut runtime’da aktif davranış kaynağı hâlâ `src/middleware.ts` içindeki bypass, internal rewrite header, `x-next-intl-locale`, default locale rewrite ve `/tr` canonical redirect zinciridir. `src/i18n/routing.ts` tarafındaki `localePrefix: 'as-needed'`, `localeDetection: false`, `localeCookie: false` ayarları ve `next-intl` plugin bağı nedeniyle kanıtsız refactor yapılmaz; warning’den büyük risk çalışan locale/translate davranışını bozmak olduğu için bu iş ancak izole keşif + birebir davranış doğrulamasıyla ileride ele alınır.

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
