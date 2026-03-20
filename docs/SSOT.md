# SSOT

Bu dosya repo içindeki teknik gerçeklerin ana evidir. Route, i18n, SEO, `/ops` sınırı, auth/rol akışı, tablo omurgası ve audit sözleşmesi burada tutulur.

Repo kararı sırası:

1. Canlı source code, schema, action ve route davranışı
2. Aktif dokümanlar
3. İlgili commit zinciri bağlamı

## 1) Kapsam ve Doküman Rolleri

- `README.md`: repo giriş kapısı
- `docs/README.md`: doküman haritası
- `docs/SSOT.md`: teknik kanonik sözleşme
- `docs/UI-SYSTEM.md`: yaşayan UI kontratları
- `docs/WORKFLOW.md`: çalışma biçimi ve kalite kapıları
- `docs/OPS.md`: repo-içi çalışma runbook’u ve smoke-check seti

Teknik bir bilgi ikinci kez yazılacaksa kısa referans verilir; asıl evi taşınmaz.

### Current runtime lock ve roadmap sınırı

- Bu dosya repo içinde doğrulanabilen teknik current runtime’ı yazar. Plan notları ancak açıkça `planned roadmap` olarak etiketlenirse girer; kodun yerine geçmez.
- Current runtime lock staff tarafında appointment-first teknik omurgayı korurken visible ürün modelini tek müşteri + tek işlem diline indirir; unified day workspace akışı, appointment create/edit/delete ve walk-in create/edit davranışı, appointment-linked `service_intakes` foundation’ı, service-intake collection event’lerinden otomatik beslenen cash ledger’ı, user/deeper runtime’daki combined consent omurgası ve `serviceIntakeId` bazlı operasyon sözleşmesi preview + browser print + 1/2 copy seçimini birlikte doğrular.
- Planned roadmap notları bu dosyada yalnız repo içine inmediği açık olan başlıklar için tutulur; current runtime yerine geçmez.
- `service_intakes` şeması `flowType = walk_in` enum değerini foundation olarak taşır. Current runtime’da yeni route açmadan `/ops/staff/randevular` selected-day workspace’i içinde walk-in create/edit akışı kanıtlıdır; visible staff UI bu source farkını badge/selector olarak göstermez. `service session` ifadesi ayrı modül adı değil, bu ortak işlem omurgasının ürün dilidir.
- Staff visible top-level contract current runtime’da source-neutral kalır: top-level nav `İşlemler / Müşteriler / Rapor / Ayarlar` setiyle çalışır, source badge/selector/copy görünmez ve consent version/status/badge/copy staff top-level surfaces’e çıkmaz. `/ops/staff/kasa` helper yüzeyi bu rapor grubunun altında kalır. Eski dijital onay mirası deeper runtime içinde durabilir; visible staff kontratı manuel imza ve nötr işlem dili üstünde kalır.

## 2) Kısa Runtime ve Canonical Kaynaklar

- Framework: Next.js 16 App Router, React 19, TypeScript (`package.json`)
- Public i18n: `next-intl` (`src/i18n/routing.ts`, `src/i18n/request.ts`)
- Veri katmanı: PostgreSQL + Drizzle (`src/db/*`, `drizzle.config.ts`)
- Ops auth: yerel e-posta/şifre + imzalı oturum çerezi (`src/lib/ops/auth/*`, `src/app/ops/giris/actions.ts`)
- Site URL kaynağı: `src/lib/site/base-url.ts`
- Route-content üretimi: `data/route-content/enki-v1-sitemap-seo-template.csv` -> `scripts/generate-route-content.py` -> `src/lib/route-content.generated.ts`
- Dev/start portu: `3002` (`package.json`)
- Generated output ve artifact klasörleri runtime source-of-truth değildir; teknik truth route/action/schema/migration zincirindedir.

### Canonical kaynak matrisi

| Konu | Canonical dosya | Tüketen yüzey |
|---|---|---|
| Public route ve SEO registry | `data/route-content/enki-v1-sitemap-seo-template.csv` | metadata, sitemap, `src/lib/route-content.generated.ts` |
| Keşfet hub slug seti | `src/lib/hub/hubs.v1.ts` | home, `/kesfet`, `/kesfet/[hub]`, galeri bağlantıları |
| Galeri normalize katmanı | `src/lib/gallery/manifest.v1.ts` | `/galeri-tasarim`, hub-gallery bağlantıları |
| Locale yönlendirme | `src/i18n/routing.ts` | `src/middleware.ts`, locale-aware navigation |
| Mesaj yükleme zinciri | `src/i18n/request.ts` | `NextIntlClientProvider`, `useTranslations`, `getTranslations` |
| Hukuki içerik registry ve loader | `src/lib/legal/legal-registry.ts`, `src/lib/legal/legal-content.ts` | prefixsiz public legal route’lar, footer bilgilendirme linkleri, `/ops/user/onaylar` |
| Ops auth/session sözleşmesi | `src/lib/ops/auth/*.ts` | `src/app/ops/**`, bootstrap script |
| Ops tablo sözleşmesi | `src/db/schema/*.ts` | `src/db/migrations/*`, `src/db/index.ts` |
| İşletme/NAP kaynağı | `src/lib/site-info.ts`, `src/lib/site/links.ts` | footer, iletişim, JSON-LD |

## 3) Route Omurgası

### Public canonical route seti

- `/`
- `/kesfet`
- `/kesfet/[hub]`
- `/piercing`
- `/piercing/[hub]`
- `/[slug]` (`kvkk-aydinlatma-metni`, `gizlilik-politikasi`, `cerez-politikasi`, `dovme-ve-piercing-sozlesmesi`)
- `/galeri-tasarim`
- `/dovme-egitimi`
- `/artistler`
- `/artistler/[slug]`
- `/iletisim`
- `/sss`

### Dahili ve SEO-dışı yüzeyler

- `/styleguide`: dahili kontrol yüzeyi
- `/ops`: operasyon namespace’i; locale ağacının dışındadır
- `/ops/giris`
- `/ops/staff/*`
- `/ops/staff/raporlar`
- `/ops/user/*`
- `/ops/user/onaylar`
- `/robots.txt`
- `/sitemap.xml`
- `/manifest.webmanifest`

### Aktif redirect’ler

Sadece şu redirect’ler tanımlıdır (`next.config.ts`):

- `/book` -> `/iletisim`
- `/explore` -> `/kesfet`
- `/profile` -> `/artistler`

Notlar:

- `/galeri` canonical route değildir; canonical route `/galeri-tasarim`dır.
- `/gallery` için redirect yoktur.

## 4) Public Locale ve SEO Sözleşmesi

- Varsayılan locale `tr`’dir; prefixsiz public istekler middleware içinde `tr`’ye rewrite edilir (`src/middleware.ts`).
- `/tr` ve `/tr/...` canonical public yola `308` ile döner (`src/middleware.ts`).
- Geçerli locale seti `tr`, `sq`, `sr`, `en` ile sınırlıdır (`src/i18n/routing.ts`).
- `src/middleware.ts` current runtime’da locale request zincirinin aktif davranış kaynağıdır; `/ops` bypass, RSC-like request için no-store header seti, internal rewrite header, `x-next-intl-locale` enjeksiyonu, default locale rewrite ve `/tr` canonical redirect aynı dosyada yürür (`src/middleware.ts`, `src/i18n/routing.ts`).
- Repo build’inde `middleware` -> `proxy` deprecated warning’i görünse de runtime contract değişmemiştir; `localePrefix: 'as-needed'`, `localeDetection: false`, `localeCookie: false` ve `next-intl` plugin bağı nedeniyle bu migration current runtime’da yapılmış sayılmaz. Çalışan translate/locale davranışını korumak warning’i susturmaktan daha kritik olduğu için iş ayrı bakım/backlog olarak ertelenmiştir (`src/middleware.ts`, `src/i18n/routing.ts`, `next.config.ts`).
- Public sayfa metadata’sı `getRouteContent(path)` ile üretilir (`src/lib/route-content.ts`).
- Prefixsiz public legal route’lar da locale ağacı içinde yaşar; metadata ve sitemap görünürlüğü route-content registry üzerinden taşınır (`data/route-content/enki-v1-sitemap-seo-template.csv`, `src/app/[locale]/(app)/[slug]/page.tsx`).
- Sitemap yalnız route-content registry içinden üretilir (`src/app/sitemap.ts`).
- `NOINDEX` davranışı route-content tabanlıdır (`src/lib/route-content.ts`, `src/app/sitemap.ts`).
- NAP ve business linkleri component içine gömülmez; `src/lib/site-info.ts` ve `src/lib/site/links.ts` kullanılır.

## 5) `/ops` Ayrımı ve Auth Sözleşmesi

- `/ops` istekleri middleware locale rewrite katmanından bypass edilir (`src/middleware.ts`).
- `/ops` metadata’sı public metadata hattından ayrıdır (`src/app/ops/layout.tsx`).
- Ops tarafı `next-intl` mesaj zincirine bağlı değildir; plain `next/link` ve plain `next/navigation` yaklaşımı kullanılır.
- `/ops` layout kökü ve `OpsShell` current runtime’da `min-h-viewport` utility’sini kullanır; mobile bottom nav `safe-pb-ops-shell` ve `safe-pb-ops-nav` zinciriyle viewport’a fixed kalır (`src/app/ops/layout.tsx`, `src/components/ops/ops-shell.tsx`, `src/app/globals.css`).
- `OpsShell` right action current runtime’da path-aware çalışır; global default logout taşımaz. `/ops/staff/raporlar` için `Defteri aç` görünür, `/ops/staff/kasa` için `Manuel giriş` yalnız mobil / dar genişlikte görünür; diğer `/ops` yüzeylerinde header sağ alanı boş kalabilir (`src/components/ops/ops-shell.tsx`).
- Staff mobile nav label seti current runtime’da `İşlemler`, `Müşteriler`, `Rapor`, `Ayarlar` olarak tam görünür; `/ops/staff/kasa` helper route’u da bu `Rapor` grubuna aktif sayılır (`src/lib/ops/navigation.ts`, `src/components/ops/ops-shell.tsx`).
- Giriş modeli yerel telefon veya e-posta + şifre akışıdır; aynı `/ops/giris` yüzeyi `admin`, `artist` ve `user` için ortak giriş kapısıdır (`src/app/ops/giris/actions.ts`, `src/lib/ops/auth/password.ts`, `src/lib/ops/auth/users.ts`).
- Telefon lookup current runtime’da normalize-phone eşlemesiyle çalışır. Aynı normalize telefona birden fazla hesap düşerse login deterministik olmayan hesabı seçmez; ambiguite hatası döner. Repo içi local DB’de duplicate normalized phone verisi bulunduğu için DB-level unique phone index bu PR’da canonical runtime’a inmemiştir (`src/lib/ops/phone.ts`, `src/lib/ops/auth/users.ts`).
- `/ops/giris` aynı zamanda minimum müşteri hesap kaydı girişini taşır; başarılı kayıt aktif `user` rolü üretir ve `Onaylar` alanına yönlenir. Current runtime login/register yüzeyi kısa `Giriş yap` / `Hesap oluştur` başlık sistemiyle çalışır; login görünümünde kısa ikinci yardımcı satır açılır (`src/app/ops/giris/page.tsx`, `src/app/ops/giris/actions.ts`, `src/lib/ops/customers.ts`).
- Oturum `enki_ops_session` adlı imzalı çerez ile `/ops` path’inde tutulur (`src/lib/ops/auth/constants.ts`, `src/lib/ops/auth/session.ts`).
- `OPS_SESSION_SECRET` en az 32 karakter olmalıdır (`src/lib/ops/auth/session.ts`).
- `DATABASE_URL` ve `OPS_SESSION_SECRET` yoksa ops auth hazır kabul edilmez (`src/lib/ops/auth/session.ts`, `src/db/index.ts`).

### Rol çözümü

- Staff alanı: `admin`, `artist`
- User alanı: yalnız `user`
- `/ops` dashboard değildir; session yoksa `/ops/giris`, staff rolü varsa `/ops/staff/randevular`, yalnız `user` rolü varsa `/ops/user/onaylar` yönlenir (`src/app/ops/page.tsx`, `src/lib/ops/auth/roles.ts`).

## 6) Ops Feature Omurgası

### Temel tablolar

- `users`
- `user_profiles`
- `user_roles`
- `consent_acceptances`
- `appointments`
- `service_intakes`
- `cash_entries`
- `customer_notes`
- `audit_logs`

### User workspace

- `/ops/user/onaylar` current runtime’da tek combined sözleşme kartı gösterir; liste üst açıklaması `Sözleşmenizi buradan açıp onay verebilirsiniz.` olarak görünür ve pending kart özeti `Sözleşmeyi açıp onay verebilirsiniz.` dilini kullanır. Tam metin approval reader ve prefixsiz public legal route tarafından aynı markdown kaynağından beslenir (`src/lib/legal/legal-content.ts`, `src/app/ops/user/onaylar/page.tsx`, `src/app/ops/user/onaylar/[documentId]/page.tsx`).
- User primary nav label seti current runtime’da desktop ve mobile için `Onaylar`, `Randevular`, `Ayarlar` olarak tanımlıdır (`src/lib/ops/navigation.ts`, `src/components/ops/ops-shell.tsx`).
- `/ops/user/profil` ayarlar yüzeyi olarak `users` + `user_profiles` üzerinde profil bilgilerini günceller ve mevcut parola doğrulamasıyla şifre değiştirme akışı açar. Visible logout trigger aynı sayfanın altındaki `Oturum` bloğunda `/ops/cikis` linki olarak yer alır.
- Onay kayıtları `consent_acceptances` tablosunda belge tipi + sürüm bazında tekilleşir.
- Güncel combined sözleşme onayı belge tipi `tattoo_piercing_consent`, sürümü `2026-03-combined-v1` olarak sabittir (`src/lib/ops/user-workspace.ts`).
- `/ops/user/onaylar/[documentId]` ops içi focused approval reader route’udur; combined sözleşme için ana sayfa scroll’u + belge sonu marker’ı ile scroll-gated tek checkbox + save akışı sunar. Reader gövdesi aynı markdown kaynağının sanitize edilmiş sürümüdür; `Sitede kullanılacak ...` ve `Kısa ekran özeti` gibi iç kullanım başlıkları user-facing ops yüzeyine taşınmaz. Pending state tek kısa durum bloğu taşır; detail header yalnız gerekli meta bilgisini gösterir (`src/lib/legal/legal-content.ts`, `src/app/ops/user/onaylar/[documentId]/page.tsx`, `src/components/ops/ops-approval-reader.tsx`).
- Approval submit action mevcut `consent_acceptances` omurgasını reuse eder; kayıt `acceptCurrentCombinedConsent()` yoluyla kaydolur ve audit `consent.accepted` kaydı korunur (`src/app/ops/user/actions.ts`, `src/lib/ops/user-workspace.ts`).
- Randevu readiness mantığı current runtime’da yalnız profil üzerinden çalışır; `consent_acceptances` bu hesaplamaya dahil edilmez (`src/lib/ops/user-workspace.ts`).
- `/ops/user/profil` sayfası current runtime’da `Ayarlar` yüzeyi olarak profil bilgileri + şifre değiştirme bloklarını ve altta kısa `Oturum` çıkış aksiyonunu gösterir; status badge veya helper kutu açmaz ve user lane içinde ayrı dövme detay yüzeyi ya da buna giden CTA yaşamaz (`src/app/ops/user/profil/page.tsx`, `src/lib/ops/user-workspace.ts`, `src/app/ops/settings/actions.ts`, `src/app/ops/cikis/route.ts`).
- `/ops/user/randevular` sayfası yaklaşan randevuyu `appointmentLists.upcoming` içinden hesaplar; yaklaşan kayıt varsa bu listeyi ana yüzey olarak gösterir. Liste açıklamaları `Aktif randevularınızı buradan görüntüleyebilirsiniz.` ve `Geçmiş randevularınız burada görünür.` metinleriyle çalışır; prerequisite veya yeni talep kartı yalnız yaklaşan randevu yoksa görünür ve create kartı `Uygun gün ve saati seçerek randevu oluşturabilirsiniz.` açıklamasını taşır (`src/lib/ops/appointments.ts`, `src/app/ops/user/randevular/page.tsx`).
- `/ops/user/form` current runtime’da user route setinin parçası değildir; user lane içinde bu path’e giden CTA, helper veya readiness dependency kalmamıştır. `tattoo_forms` runtime omurgası kaldırılmıştır (`src/app/ops/user/profil/page.tsx`, `src/app/ops/user/randevular/page.tsx`, `src/lib/ops/user-workspace.ts`, `src/app/ops/user/actions.ts`).
- Staff customer detail visible top-level staff contract içinde consent özeti açmaz; user lane consent runtime içeride kalır ve staff detail yalnız profil readiness verisini small status satırı olarak taşır (`src/lib/ops/user-workspace.ts`, `src/app/ops/staff/musteriler/[userId]/page.tsx`).
- Eski dijital onay altyapısı repo içinde user lane veya deeper runtime katmanlarında yaşayabilir; current runtime’da bu bilgi staff top-level visible customer, cash, profile veya appointments yüzeyine consent badge/version/status copy’si olarak taşınmaz.

UI kontratı, IA gerilimleri ve open question’lar `docs/UI-SYSTEM.md` içinde tutulur; burada yalnız runtime ve teknik kaynak gerçekleri yazılır.

### Appointments

- Randevu modeli işletme bazlıdır; `appointments.artist_id` yoktur. Artist ataması current runtime’da `service_intakes.artist_user_id` üstünde tutulur ve unified service-session create/edit zinciri bu alanı yazar (`src/db/schema/appointments.ts`, `src/db/schema/service-intakes.ts`, `src/app/ops/randevular/actions.ts`).
- Teknik randevu modeli tek saatlidir; payload yalnız `appointmentDate` + `appointmentTime` taşır. Başlangıç/bitiş alanı ve süre mantığı yoktur (`src/app/ops/randevular/actions.ts`, `src/lib/ops/appointments.ts`).
- Status seti: `scheduled`, `completed`, `cancelled`, `no_show`
- Source seti: `customer`, `admin`, `artist`
- Slot motoru yoktur.
- Aynı tarih + aynı saat için ikinci aktif `scheduled` kayıt açılamaz; hem partial unique index hem uygulama guard’ı vardır (`src/db/schema/appointments.ts`, `src/lib/ops/appointments.ts`).
- `createStaffAppointmentAction` staff guard’ı ile korunur; bu akış hem `admin` hem `artist` için açıktır (`src/app/ops/randevular/actions.ts`, `src/lib/ops/auth/guards.ts`).
- Staff create sırasında `source`, rol bazında `admin` veya `artist` olarak seçilir (`src/lib/ops/appointments.ts`).
- Staff create/edit current runtime’da müşteri seçimi aynı sheet içinde tek picker trigger ile çalışır; visible form ayrı `Mevcut müşteri / Yeni müşteri` sekmeleri taşımaz. Picker arama sonuçlarını `listCustomers(searchQuery)` semantiğiyle ad soyad / görünen ad / telefon / e-posta üstünden okur ve seçim form state’ine doğrudan bağlanır (`src/components/ops/ops-staff-appointment-create-form.tsx`, `src/app/ops/randevular/actions.ts`, `src/lib/ops/customers.ts`).
- Staff randevu içi müşteri create akışı picker içinde secondary yol olarak kalır; varsayılan alanlar `Ad soyad` + `Telefon`, opsiyonel `E-posta` disclosure’dır. Başarıda yeni müşteri otomatik seçilir, picker kapanır ve randevu formundaki tarih/saat/işlem tipi/tutar/not bağlamı korunur (`src/components/ops/ops-staff-appointment-create-form.tsx`, `src/components/ops/ops-staff-appointments-workspace.tsx`).
- Staff randevu içi müşteri picker/create kontratı typed action state üstünden çalışır; bu akış redirect atmaz, kullanıcı yüzeyine `NEXT_REDIRECT` veya ham teknik hata stringi sızdırmaz. Oturum veya rol uygun değilse kullanıcıya insan-okunur hata döner ve sheet bağlamı korunur (`src/app/ops/randevular/actions.ts`, `src/lib/ops/auth/guards.ts`, `src/components/ops/ops-staff-appointment-create-form.tsx`).
- Staff appointments V2 görünür akışı month-first root -> day sheet -> detail sheet -> create/edit sheet zinciridir; month cell içinde exact count yerine decoration tabanlı occupancy kullanılır. Current runtime’da selected day sheet appointment + walk-in kayıtlarını aynı liste içinde source badge göstermeden gösterir; month root occupancy appointment-first teknik omurgayı korurken visible yüzeyde neutral işlem yoğunluğu olarak okunur. UI ritmi `docs/UI-SYSTEM.md` içinde yaşar (`src/app/ops/staff/randevular/page.tsx`, `src/components/ops/ops-staff-appointments-workspace.tsx`).
- Selected-day workspace current runtime’da root takvimin hemen altında inline/fold üstü konumlanır; mobile ve desktop görünümde takvim-first hiyerarşi korunur (`src/app/ops/staff/randevular/page.tsx`, `src/components/ops/ops-staff-appointments-workspace.tsx`).
- Staff create/edit formu current runtime’da browser native required tooltip’ine yaslanmaz; `customerUserId`, artist, tarih/saat ve tutar hataları typed action state üzerinden kısa app-level mesaj olarak döner. Create sheet seçili gün ile prefill açılsa da `scheduledDate` form içinde düzenlenebilir kalır; varsayılan saat create day içindeki mevcut işlemler ve bugün-zaman bağlamı üzerinden önerilir. `sessionSource` form payload’ında visible selector olarak gösterilmez ve artist default zinciri staff session + aktif artist listesi üzerinden çözülür. Visible para label’ları `Toplam / Kapora` dilini kullanır (`src/components/ops/ops-staff-appointment-create-form.tsx`, `src/app/ops/randevular/actions.ts`, `src/lib/ops/artists.ts`).
- Staff appointments current runtime’da mobile month root’u shell hack’iyle değil, workspace kendi dikey budget’ını yöneterek screen-first calendar surface gibi kurar; gerçek cihaz viewport’unda ilk açılışta page vertical scroll üretmez. Bu davranış shell bottom nav anchoring kontratından ayrıdır (`src/components/ops/ops-staff-appointments-workspace.tsx`, `src/components/ops/ops-shell.tsx`).
- Staff create action current runtime’da tek transaction zinciriyle appointment kaydı açar, ardından `flowType = appointment` `service_intake` kaydı üretir, artist atamasını bu kayda yazar ve bunu yeni appointment’a bağlar. Visible success copy neutral kalır: `İşlem kaydı açıldı.` (`src/app/ops/randevular/actions.ts`, `src/lib/ops/service-intakes.ts`).
- Staff walk-in create current runtime’da typed state action ile aynı workspace içinde kalır; yeni kayıt `flowType = walk_in`, `appointmentId = null` ve nullable olmayan artist atamasıyla oluşur. Visible success copy burada da neutral kalır: `İşlem kaydı açıldı.` (`src/app/ops/randevular/actions.ts`, `src/lib/ops/service-intakes.ts`).
- Staff appointments detail surface’i bağlı `service_intake` özetini doğrudan işlem bağlamında gösterir. Appointment summary verisi `/ops/staff/randevular` server page içinde `listLatestServiceIntakesByAppointmentIds()` ile, walk-in kayıtları ise `listWalkInServiceIntakesForMonth()` ile toplanır; unified day/detail/edit workspace bu iki kaynağı internal source farkını koruyarak birleştirir ve summary içinde hızlı bakış için `İşlem tipi + Toplam / Kapora` satırlarını taşır. Artist seçimi edit formunda korunur (`src/app/ops/staff/randevular/page.tsx`, `src/lib/ops/service-intakes.ts`, `src/components/ops/ops-staff-appointments-workspace.tsx`).
- Staff appointments edit surface current runtime’da duplicate summary veya ek üst bağlam kartı taşımaz; `İşlem tipi`, `Toplam`, `Kapora`, müşteri, tarih ve saat değerleri doğrudan form alanları içinden düzenlenir (`src/components/ops/ops-staff-appointments-workspace.tsx`, `src/components/ops/ops-staff-appointment-create-form.tsx`).
- Staff appointments detail surface’i current runtime’da bağlı `serviceIntakeId` varsa `Belge` aksiyonu da taşır; bu aksiyon selected session bağlamını koruyarak `/ops/staff/belgeler/[serviceIntakeId]` route’una gider (`src/components/ops/ops-staff-appointments-workspace.tsx`).
- `/ops/staff/belgeler/[serviceIntakeId]` current runtime’da staff-only server-rendered print preview route’udur. Packet verisi doğrudan seçilmiş `service_intake` kaydı, ilgili müşteri (`users` + `user_profiles`) ve combined consent markdown kaynağından yüklenir; `latestServiceIntake` veya `cash_entries` packet truth’u olarak kullanılmaz (`src/app/ops/staff/belgeler/[serviceIntakeId]/page.tsx`, `src/lib/ops/document-packets.ts`, `src/lib/legal/legal-content.ts`).
- Staff packet preview current runtime’da kart-heavy packet yerine tek sayfa A4 operasyon sözleşmesi şablonu render eder: sol üstte `Sayı`, sağ üstte `Kayıt Tarihi`, ortada daha resmi hiyerarşili başlık, gövdede combined legal maddeler ve altta müşteri / işlem bilgisi blokları görünür. İşlem bilgisi alanı artist satırını ve `TL` ekli para display’ini taşır; E-posta, internal version string, consent warning bandı ve `Kalan` bu yüzeye taşınmaz (`src/components/ops/ops-staff-document-packet.tsx`, `src/lib/ops/document-packets.ts`).
- Staff packet preview toolbar current runtime’da `Geri`, `Yazdır` ve `1 kopya / 2 kopya` seçimini taşır; print sırasında toolbar gizlenir ve seçilen kopya sayısı kadar aynı sözleşme A4 portrait + `break-after: page` düzeninde basılır. `Müşteri nüshası` / `Stüdyo nüshası` küçük üst notları current runtime kontratından çıkmıştır; dijital imza, PDF exporter veya yeni packet/signature schema açılmaz (`src/components/ops/ops-staff-document-packet.tsx`, `src/app/globals.css`).
- Staff service session formunda `Kapora` current runtime’da opsiyoneldir; boş değer `0` kabul edilir, negatif veya bozuk sayı app-level hata üretir, `collected > total` guard’ı korunur (`src/components/ops/ops-staff-appointment-create-form.tsx`, `src/app/ops/randevular/actions.ts`).
- Current runtime’da `service_intake` create/edit zinciri `collectedAmountCents` delta’sını otomatik `cash_entries` satırına çevirir. Pozitif delta `service_collection` + `income`, negatif delta `service_adjustment` + `expense` üretir; `total`, müşteri, tarih, saat ve not değişimi tek başına cash entry oluşturmaz (`src/lib/ops/service-intakes.ts`, `src/lib/ops/appointments.ts`, `src/lib/ops/cashbook.ts`).
- Staff appointment edit current runtime’da yalnız appointment satırını değil, bağlı `flowType = appointment` `service_intake` kaydının müşteri, artist, işlem tipi, tarih, saat, toplam, alınan ve not alanlarını da senkron tutar (`src/lib/ops/appointments.ts`, `src/app/ops/randevular/actions.ts`).
- Staff walk-in edit current runtime’da aynı form omurgasını reuse eder; `service_intake` kaydı source-aware typed action ile müşteri, artist ve işlem alanlarıyla güncellenir, `appointmentId` null kalır ve audit `service_intake.updated` kaydı yazılır (`src/app/ops/randevular/actions.ts`, `src/lib/ops/service-intakes.ts`).
- Staff appointment delete current runtime’da transaction içindedir. Bağlı `flowType = appointment` `service_intake` kayıtlarında aktif tahsilat izi varsa delete guard çalışır ve randevu silinmez; aktif tahsilat izi yoksa appointment-side intake kayıtları appointment ile birlikte silinir, non-appointment linkler güvenli şekilde detach edilir. Delete sonrası `/ops/staff/randevular`, `/ops/staff/musteriler` ve ilgili müşteri detail yüzeyleri revalidate edilir (`src/lib/ops/appointments.ts`, `src/lib/ops/cashbook.ts`, `src/app/ops/randevular/actions.ts`).
- Staff appointment delete UI current runtime’da native browser confirm kullanmaz; confirm aynı workspace içinde app-level dialog olarak açılır. Başarılı delete sonrası detail sheet kapanır, seçili appointment temizlenir ve day drawer kendiliğinden yeniden açılmaz (`src/components/ops/ops-staff-appointments-workspace.tsx`).
- Current runtime’da `service_intakes` write/read omurgası staff `/ops/staff/randevular` workspace’inde iki kaynaktan beslenir: appointment side mevcut appointment + linked summary zinciri, walk-in side ise yalnız `flowType = walk_in` kayıtlarını çeken ayrı month helper’dır. İkinci bir route veya paralel staff workspace yoktur.
- Walk-in aynı gün ve aynı saatte birden fazla olabilir; current runtime walk-in create/edit zinciri için slot conflict guard veya uyarı yazmaz. Bu fark internal runtime davranışıdır; staff visible copy’de ayrı source dili olarak taşınmaz (`src/app/ops/randevular/actions.ts`, `src/lib/ops/service-intakes.ts`).
- Repo içinde admin’e özel create engeli görünmez. Canlı ortamda farklı bir admin create davranışı raporlanıyorsa, bu repo içinden doğrulanamaz ve `UNKNOWN` kabul edilir.

### Cashbook

- `cash_entries` randevudan bağımsız kalır; zorunlu appointment FK yoktur. Current runtime PR-C ile tablo `entry_reason` ve nullable `service_intake_id` alanlarıyla service-source metadata taşır (`src/db/schema/cashbook.ts`).
- `entry_type` seti `income` / `expense` ile sınırlıdır.
- `amount_cents` pozitif integer olarak saklanır.
- Kasa otomasyon kaynağı `service_intakes.collectedAmountCents` delta zinciridir; `postServiceIntakeCashDelta()` önceki ve sonraki alınan tutarı karşılaştırır. Pozitif delta `income + service_collection`, negatif delta `expense + service_adjustment`, sıfır delta ise no-op üretir (`src/lib/ops/cashbook.ts`, `src/lib/ops/service-intakes.ts`, `src/lib/ops/appointments.ts`).
- Staff kasa yüzeyi current runtime’da otomatik service hareketleri + manuel istisna mantığıyla çalışır; service-intake kaynaklı satırlar read-only görünür, manuel giriş formu gider / istisna / correction yüzeyi olarak kalır. Current runtime kullanıcı yüzeyinde cash-only davranır; ödeme tipi görünmez ve create/update action’ları manuel kayıtlarda yeni satırları `cash` olarak yazar (`src/app/ops/staff/kasa/page.tsx`, `src/components/ops/ops-cash-entry-form.tsx`, `src/app/ops/kasa/actions.ts`, `src/lib/ops/cashbook.ts`).
- `payment_method` kolonu veri modelinde hâlâ bulunur; bu PR current runtime’da bu alanı rapor foundation/backward compatibility için saklar ama kullanıcı yüzeyine yansıtmaz (`src/db/schema/cashbook.ts`, `src/lib/ops/cashbook.ts`).
- Kasa presetleri UI seviyesindedir; mevcut payload içinde `note` alanını hızlandırır, ayrı kategori kolonu açmaz (`src/lib/ops/cashbook-copy.ts`, `src/app/ops/kasa/actions.ts`).
- Staff kasa note disclosure row’u current runtime’da mobile-safe’tir; `Not ekle` / `Kapat` satırı yatay taşma üretmez (`src/components/ops/ops-cash-entry-form.tsx`).
- Soft delete alanları `deleted_at` ve `deleted_by_user_id`’dir.
- Staff kasa geçmişi current runtime’da `admin` ve `artist` için aynı capability setiyle çalışır; her iki rol de seçili gün defterini açabilir, manuel kayıt ekleyebilir ve manuel geçmiş kayıtları yönetebilir. System-generated cash entry’ler read-only kalır ve manage dialog yalnız manuel kayıtlar için görünür (`src/lib/ops/cashbook.ts`, `src/app/ops/kasa/actions.ts`, `src/app/ops/staff/kasa/page.tsx`).
- `/ops/staff/kasa` current runtime’da top-level rapor girişi taşımaz; mobile bottom nav’a ayrı item eklenmez ve helper defter yüzeyi olarak `Rapor` grubunun altında kalır. Shell header right action bu route’ta yalnız mobil / dar genişlikte görünen `Manuel giriş` sayfa içi atlamasıdır (`src/app/ops/staff/kasa/page.tsx`, `src/lib/ops/navigation.ts`, `src/components/ops/ops-shell.tsx`).
- Staff kasa current runtime’da ana operasyon merkezi gibi değil, manuel giriş öncelikli yardımcı yüzey gibi okunur. Görünür öncelik `Manuel giriş -> Defter kontrolü -> Defter` sırasıdır; sistem üretimi satırlarda kart üstü destek meta insan odaklı kısa tarih/saat ile kalır, `işlem #...` ve `otomatik` gibi teknik etiketler görünür listede yer almaz (`src/app/ops/staff/kasa/page.tsx`).
- `/ops/staff/profil` current runtime’da `Ayarlar` yüzeyidir; shared profil formu + şifre değiştirme bloğu hem `admin` hem `artist` için aynı kalır ve sayfanın altındaki `Oturum` bloğu görünür logout girişini taşır. Admin aynı sayfada admin-only `Artist yönetimi` bölümünü görür; bu bölüm yalnız `artist` rolündeki hesapları create/update/active-passive akışına açar, admin veya user yönetimi açmaz (`src/app/ops/staff/profil/page.tsx`, `src/app/ops/settings/actions.ts`, `src/lib/ops/artists.ts`, `src/app/ops/cikis/route.ts`).

### Reports

- `/ops/staff/raporlar` staff guard’ı ile korunur; hem `admin` hem `artist` erişebilir (`src/app/ops/staff/raporlar/page.tsx`, `src/lib/ops/auth/guards.ts`).
- Staff rapor yüzeyi current runtime’da `admin` ve `artist` için aynıdır; ana rapor girişidir ve `tarih aralığı + işlem tipi + artist + kayıt kaynağı` filtreleriyle çalışır. Shell header right action bu route’ta `Defteri aç` olarak `/ops/staff/kasa` yüzeyine gider. Summary ve hareket listesi aynı filtre kapsamına göre üretilir; liste cash-ledger odaklıdır ve service-intake bağlı kayıtlarda artist / source / service type sinyallerini, manuel kayıtlarda ise kısa not + oluşturan bilgisini taşır (`src/app/ops/staff/raporlar/page.tsx`, `src/lib/ops/reports.ts`, `src/components/ops/ops-shell.tsx`).
- Rapor hesaplamaları mevcut `cash_entries` ve `appointments` omurgasını reuse eder; PR-C sonrası service-intake kaynaklı otomatik kasa satırları da aynı `cash_entries` summary hattına dahil olur, yeni analytics schema veya chart sistemi açılmaz (`src/lib/ops/reports.ts`, `src/lib/ops/cashbook.ts`, `src/lib/ops/appointments.ts`).

### Customer workspace

- Staff müşteri listesi ve detay yüzeyleri `/ops/staff/musteriler` ailesinde çalışır.
- Staff hızlı müşteri oluşturma akışı `users` + `user_profiles` + `user_roles` üzerinde aktif `user` hesabı açar; bu kayıt staff müşteri listesi ve staff randevu müşteri seçeneklerine dahil olur (`src/app/ops/musteriler/actions.ts`, `src/lib/ops/customers.ts`, `src/lib/ops/appointments.ts`).
- Staff müşteri create kartı current runtime’da ana akışta `Ad soyad` + `Telefon` alanlarını açık tutar; `Not` alanı aynı form içinde disclosure olarak secondary açılır (`src/components/ops/ops-staff-customer-create-form.tsx`).
- Staff müşteri create disclosure row’u current runtime’da mobile-safe’tir; `Not` / `Ekle` / `Kapat` satırı yatay taşma üretmez (`src/components/ops/ops-staff-customer-create-form.tsx`).
- Liste yalnız `user` rolündeki aktif hesapları gösterir; staff-only hesaplar listeye dahil edilmez (`src/lib/ops/customers.ts`).
- Liste araması `full_name`, `display_name`, `phone`, `email` alanları üzerinde çalışır.
- Staff müşteri listesi current runtime’da arama-first + hızlı create yan akışıyla çalışır; boş durumda müşteri listesi, arama aktifken `Arama sonuçları` başlığı ve sonuç sayısı copy’si görünür. Kart visible hiyerarşisi `ad soyad -> telefon -> yaklaşan randevu tarihi/saat veya "Yaklaşan randevu yok"` olarak sadeleşmiştir; görünür e-posta, `Sıradaki işlem` etiketi ve geçmiş işlem özeti kartta yer almaz. Kartın tamamı primary action gibi okunur ve arama davranışı e-posta/telefon/ad üstünden çalışmayı sürdürür (`src/app/ops/staff/musteriler/page.tsx`, `src/lib/ops/customers.ts`).
- Detay yüzeyi current runtime’da müşteri kimliğini ve kısa iletişim bilgisini fold üstünde verir; visible hiyerarşi `Temel bilgi`, `İşlem özeti`, `Artist notu`, `Yaklaşan işlemler`, `Geçmiş işlemler` ekseninde kuruludur. `Profil durumu` satırı visible yüzeyden kaldırılmıştır; visible consent/version/status bloğu taşımaz (`src/app/ops/staff/musteriler/[userId]/page.tsx`).
- Staff müşteri detail `İşlem özeti` kartı doğrudan `getCustomerDetail(userId)` içindeki `latestServiceIntake` alanından beslenir; bu alan `getLatestServiceIntakeForCustomer(userId)` ile aynı `customerUserId` üzerinden okunur. Kart `Kaynak` alanı taşımaz ve yeni walk-in create/edit sonrası da müşteri bazlı latest intake sorgusunu gösterir; kartın kaynağı appointment detail sheet değil, müşteri bazlı latest intake sorgusudur (`src/lib/ops/customers.ts`, `src/lib/ops/service-intakes.ts`, `src/app/ops/staff/musteriler/[userId]/page.tsx`).
- Staff müşteri detail current runtime’da packet preview için primary trigger değildir; packet route seçilmiş `serviceIntakeId` bağlamıyla yalnız staff day/detail workspace içinden açılır (`src/components/ops/ops-staff-appointments-workspace.tsx`, `src/lib/ops/document-packets.ts`).
- `customer_notes.user_id` unique kalır; not upsert edilir, boş not gönderilirse kayıt temizlenir (`src/app/ops/musteriler/actions.ts`, `src/lib/ops/customers.ts`).
- Ops-visible para display current runtime’da kuruşsuz whole-number ritmine ve `TL` ekine hizalanmıştır; shared kasa/rapor helper’ı ile müşteri detail, staff işlem summary ve belge preview aynı sade sayı gösterimini kullanır. `formatCashAmountInput()` ve benzeri input serialization helper’ları bu display kontratına dahil değildir (`src/lib/ops/cashbook.ts`, `src/lib/ops/money.ts`, `src/app/ops/staff/musteriler/[userId]/page.tsx`, `src/components/ops/ops-staff-appointments-workspace.tsx`, `src/components/ops/ops-staff-document-packet.tsx`).
- Ops dark theme current runtime’da route, action ve layout kontratını değiştirmez; `/ops/giris`, `/ops/staff/randevular`, `/ops/staff/musteriler`, `/ops/staff/raporlar` ve `/ops/staff/profil` yüzeylerinde card/input/border/helper-meta kontrastı light mode’a yakın okunurluk için güçlendirilmiştir (`src/app/globals.css`, `src/app/ops/giris/page.tsx`, `src/components/ops/ops-login-form.tsx`, `src/components/ops/ops-staff-appointments-workspace.tsx`, `src/components/ops/ops-staff-appointment-create-form.tsx`, `src/app/ops/staff/musteriler/page.tsx`, `src/app/ops/staff/musteriler/[userId]/page.tsx`, `src/app/ops/staff/raporlar/page.tsx`, `src/app/ops/staff/profil/page.tsx`).

## 7) Audit Foundation

- `audit_logs` tablosu ilk ops foundation migration’ında açılmıştır (`src/db/migrations/0000_init_ops_foundation.sql`).
- Audit kullanımı için ayrı yeni migration açılmamıştır; runtime yazımı mevcut tablo üstündedir (`src/db/schema/audit-logs.ts`, `src/lib/ops/audit.ts`).
- Kritik mutasyonlar helper üzerinden hafif payload ile kayıt üretir.

### Kanıtlı action seti

- `profile.updated`
- `consent.accepted`
- `appointment.created`
- `appointment.updated`
- `appointment.status_updated`
- `appointment.deleted`
- `cash_entry.created`
- `cash_entry.updated`
- `cash_entry.soft_deleted`
- `customer_note.saved`
- `artist.created`
- `artist.updated`
- `artist.status_updated`
- `ops_auth.logged_in`
- `ops_auth.logged_out`
- `password.changed`
- `service_intake.created`
- `service_intake.appointment_attached`
- `service_intake.appointment_synced`
- `service_intake.updated`
- `service_intake.deleted`
- `service_intake.appointment_detached`

### Audit notları

- Login/logout kaydı best-effort tutulur; auth akışını bozmaz (`src/app/ops/giris/actions.ts`, `src/app/ops/cikis/route.ts`).
- Payload hafif tutulur; örnek olarak yalnız değişen alanlar, kaynak, tarih/saat, not varlığı gibi özet bilgiler yazılır.
- Parola, hash, session secret ve benzeri hassas veriler audit payload’ına yazılmaz.

## 8) Değişiklik Etki Haritası

- Public route değişirse: CSV -> generator -> route-content -> metadata -> sitemap
- Locale veya mesaj değişirse: `messages/*` veya `src/content/**` -> `src/i18n/request.ts` -> public build ve locale smoke-check
- Ops auth değişirse: `src/lib/ops/auth/*` -> `/ops/giris` -> `/ops`, `/ops/staff/*`, `/ops/user/*`
- Schema değişirse: `src/db/schema/*` -> `npm run db:generate` -> `src/db/migrations/*`
- NAP/link değişirse: `site-info` / `site/links` -> footer, iletişim, JSON-LD

## 9) Bilinen Repo Gerçekleri ve Sınırlar

- Piercing için keşfet tarafındaki gibi tekil bir master slug dosyası yoktur; sahiplik route-content, route dosyası ve UI lookup katmanı arasında dağılmıştır.
- Home page kendi review/maps sabitlerini ayrıca taşır; site-level link kaynağıyla birebir birleşmiş değildir.
- `/ops` route’ları route-content ve sitemap hattına dahil değildir.
- Prefixsiz public legal route `src/app/[locale]/(app)/[slug]/page.tsx` içinde public app tree’de render edilir; `BreadcrumbListJsonLd`, route-content metadata ve `LegalMarkdown` aynı yüzeyde çalışır.
- Legacy `/hukuki/[slug]` path’i locale-aware `308` redirect ile yeni prefixsiz canonical yola taşınır; legacy `dovme-sozlesmesi` ve `piercing-sozlesmesi` slug’ları da combined canonical slug’a döner (`src/app/[locale]/(app)/hukuki/[slug]/page.tsx`, `src/app/[locale]/(app)/[slug]/page.tsx`).
- Public mobile drawer hesap utility bloğu current runtime’da yalnız `/ops/giris` ve `/ops/giris?kayit=1` akışlarına çıkar; copy form-flow referansı taşımaz (`src/components/app/mobile-header.tsx`, `messages/*.json`).
- Prefixsiz legal page, markdown içeriğinin ilk `#` başlığını strip eder ve `Sitede kullanılacak ...` ile `Kısa ekran özeti` gibi iç kullanım başlıklarını public render’dan sanitize eder (`src/app/[locale]/(app)/[slug]/page.tsx`, `src/lib/legal/legal-content.ts`).
- Repo içindeki kanıtlı markdown başlık örnekleri arasında `Sitede kullanılacak zorunlu onay metni` ve `Kısa ekran özeti` bulunur (`src/content/ops/legal/dovme-sozlesmesi-yetiskin.md`).
- Footer bilgilendirme linkleri prefixsiz public legal route’lara gider; `/ops/user/onaylar` içindeki `Sözleşmeyi aç` linki ise ops approval reader route’una açılır. İki yüzey aynı markdown kaynağını paylaşır (`src/app/ops/user/onaylar/page.tsx`, `src/app/ops/user/onaylar/[documentId]/page.tsx`, `src/components/app/site-footer.tsx`, `src/lib/legal/legal-registry.ts`).

## 10) UNKNOWN

- Host-level `www`/apex redirect zinciri `UNKNOWN`dur.
- Reverse proxy, Cloudflare ve production host topolojisi `UNKNOWN`dur.
- Canlı ortam env envanterinin tam listesi `UNKNOWN`dur.
- Repo dışı görsel render bulguları, örneğin “Türkçe karakterler ekranda bozuluyor” raporu, repo içinden doğrudan doğrulanamaz; kaynak copy tek başına bu görsel sonucu kanıtlamaz.
