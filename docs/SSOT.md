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
- Staff visible top-level contract current runtime’da source-neutral kalır: top-level nav `İşlemler / Müşteriler / Kasa / Profil` setiyle çalışır, source badge/selector/copy görünmez ve consent version/status/badge/copy staff top-level surfaces’e çıkmaz. Eski dijital onay mirası deeper runtime içinde durabilir; visible staff kontratı manuel imza ve nötr işlem dili üstünde kalır.

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
- Staff mobile nav label seti current runtime’da `İşlemler`, `Müşteriler`, `Kasa`, `Profil` olarak tam görünür (`src/lib/ops/navigation.ts`, `src/components/ops/ops-shell.tsx`).
- Giriş modeli yerel e-posta/şifre akışıdır (`src/app/ops/giris/actions.ts`, `src/lib/ops/auth/password.ts`).
- `/ops/giris` aynı zamanda minimum müşteri hesap kaydı girişini taşır; başarılı kayıt aktif `user` rolü üretir ve `Onaylar` alanına yönlenir. Current runtime login/register yüzeyi kısa `Giriş yap` / `Hesap oluştur` başlık sistemiyle çalışır; başlık altında ikinci açıklama satırı açılmaz (`src/app/ops/giris/page.tsx`, `src/app/ops/giris/actions.ts`, `src/lib/ops/customers.ts`).
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
- User primary nav label seti current runtime’da desktop ve mobile için `Onaylar`, `Randevular`, `Profil` olarak tanımlıdır (`src/lib/ops/navigation.ts`, `src/components/ops/ops-shell.tsx`).
- `/ops/user/profil` profil bilgilerini `users` + `user_profiles` üzerinde günceller.
- Onay kayıtları `consent_acceptances` tablosunda belge tipi + sürüm bazında tekilleşir.
- Güncel combined sözleşme onayı belge tipi `tattoo_piercing_consent`, sürümü `2026-03-combined-v1` olarak sabittir (`src/lib/ops/user-workspace.ts`).
- `/ops/user/onaylar/[documentId]` ops içi focused approval reader route’udur; combined sözleşme için ana sayfa scroll’u + belge sonu marker’ı ile scroll-gated tek checkbox + save akışı sunar. Reader gövdesi aynı markdown kaynağının sanitize edilmiş sürümüdür; `Sitede kullanılacak ...` ve `Kısa ekran özeti` gibi iç kullanım başlıkları user-facing ops yüzeyine taşınmaz. Pending state tek kısa durum bloğu taşır; detail header yalnız gerekli meta bilgisini gösterir (`src/lib/legal/legal-content.ts`, `src/app/ops/user/onaylar/[documentId]/page.tsx`, `src/components/ops/ops-approval-reader.tsx`).
- Approval submit action mevcut `consent_acceptances` omurgasını reuse eder; kayıt `acceptCurrentCombinedConsent()` yoluyla kaydolur ve audit `consent.accepted` kaydı korunur (`src/app/ops/user/actions.ts`, `src/lib/ops/user-workspace.ts`).
- Randevu readiness mantığı current runtime’da yalnız profil üzerinden çalışır; `consent_acceptances` bu hesaplamaya dahil edilmez (`src/lib/ops/user-workspace.ts`).
- `/ops/user/profil` sayfası current runtime’da yalnız profil bilgilerini gösterir ve günceller; başlık altında tek kısa açıklama taşır, status badge veya helper kutu açmaz ve user lane içinde ayrı dövme detay yüzeyi ya da buna giden CTA yaşamaz (`src/app/ops/user/profil/page.tsx`, `src/lib/ops/user-workspace.ts`).
- `/ops/user/randevular` sayfası yaklaşan randevuyu `appointmentLists.upcoming` içinden hesaplar; yaklaşan kayıt varsa bu listeyi ana yüzey olarak gösterir. Liste açıklamaları `Aktif randevularınızı buradan görüntüleyebilirsiniz.` ve `Geçmiş randevularınız burada görünür.` metinleriyle çalışır; prerequisite veya yeni talep kartı yalnız yaklaşan randevu yoksa görünür ve create kartı `Uygun gün ve saati seçerek randevu oluşturabilirsiniz.` açıklamasını taşır (`src/lib/ops/appointments.ts`, `src/app/ops/user/randevular/page.tsx`).
- `/ops/user/form` current runtime’da user route setinin parçası değildir; user lane içinde bu path’e giden CTA, helper veya readiness dependency kalmamıştır. `tattoo_forms` runtime omurgası kaldırılmıştır (`src/app/ops/user/profil/page.tsx`, `src/app/ops/user/randevular/page.tsx`, `src/lib/ops/user-workspace.ts`, `src/app/ops/user/actions.ts`).
- Staff customer detail visible top-level staff contract içinde consent özeti açmaz; user lane consent runtime içeride kalır ve staff detail yalnız profil readiness verisini small status satırı olarak taşır (`src/lib/ops/user-workspace.ts`, `src/app/ops/staff/musteriler/[userId]/page.tsx`).
- Eski dijital onay altyapısı repo içinde user lane veya deeper runtime katmanlarında yaşayabilir; current runtime’da bu bilgi staff top-level visible customer, cash, profile veya appointments yüzeyine consent badge/version/status copy’si olarak taşınmaz.

UI kontratı, IA gerilimleri ve open question’lar `docs/UI-SYSTEM.md` içinde tutulur; burada yalnız runtime ve teknik kaynak gerçekleri yazılır.

### Appointments

- Randevu modeli işletme bazlıdır; `appointments.artist_id` yoktur (`src/db/schema/appointments.ts`).
- Teknik randevu modeli tek saatlidir; payload yalnız `appointmentDate` + `appointmentTime` taşır. Başlangıç/bitiş alanı ve süre mantığı yoktur (`src/app/ops/randevular/actions.ts`, `src/lib/ops/appointments.ts`).
- Status seti: `scheduled`, `completed`, `cancelled`, `no_show`
- Source seti: `customer`, `admin`, `artist`
- Slot motoru yoktur.
- Aynı tarih + aynı saat için ikinci aktif `scheduled` kayıt açılamaz; hem partial unique index hem uygulama guard’ı vardır (`src/db/schema/appointments.ts`, `src/lib/ops/appointments.ts`).
- `createStaffAppointmentAction` staff guard’ı ile korunur; bu akış hem `admin` hem `artist` için açıktır (`src/app/ops/randevular/actions.ts`, `src/lib/ops/auth/guards.ts`).
- Staff create sırasında `source`, rol bazında `admin` veya `artist` olarak seçilir (`src/lib/ops/appointments.ts`).
- Staff create current runtime’da müşteri seçimi aynı sheet içinde kalır; müşteri alanı `Mevcut müşteri` ve `Yeni müşteri` seçimleriyle ayrılır. `Yeni müşteri` seçimi küçük inline create alanı açar ve bu alan mevcut müşteri oluşturma omurgasını reuse eder (`src/components/ops/ops-staff-appointment-create-form.tsx`, `src/app/ops/randevular/actions.ts`, `src/lib/ops/customers.ts`).
- Staff randevu içi inline müşteri create alanı `Ad soyad`, `Telefon`, opsiyonel `E-posta` ile çalışır; başarıda yeni müşteri otomatik seçilir ve randevu formundaki tarih/saat/işlem tipi/tutar/not bağlamı korunur (`src/components/ops/ops-staff-appointment-create-form.tsx`, `src/components/ops/ops-staff-appointments-workspace.tsx`).
- Staff randevu içi inline müşteri create kontratı typed state üstünden çalışır; bu akış redirect atmaz, kullanıcı yüzeyine `NEXT_REDIRECT` veya ham teknik hata stringi sızdırmaz. Oturum veya rol uygun değilse kullanıcıya insan-okunur hata döner ve sheet bağlamı korunur (`src/app/ops/randevular/actions.ts`, `src/lib/ops/auth/guards.ts`, `src/components/ops/ops-staff-appointment-create-form.tsx`).
- Staff appointments V2 görünür akışı month-first root -> day sheet -> detail sheet -> create/edit sheet zinciridir; month cell içinde exact count yerine decoration tabanlı occupancy kullanılır. Current runtime’da selected day sheet appointment + walk-in kayıtlarını aynı liste içinde source badge göstermeden gösterir; month root occupancy appointment-first teknik omurgayı korurken visible yüzeyde neutral işlem yoğunluğu olarak okunur. UI ritmi `docs/UI-SYSTEM.md` içinde yaşar (`src/app/ops/staff/randevular/page.tsx`, `src/components/ops/ops-staff-appointments-workspace.tsx`).
- Staff create/edit formu current runtime’da browser native required tooltip’ine yaslanmaz; `customerUserId`, tarih/saat ve tutar hataları typed action state üzerinden kısa app-level mesaj olarak döner. `sessionSource` form payload’ında visible selector olarak gösterilmez; create akışı minimum-risk internal default ile çalışır (`src/components/ops/ops-staff-appointment-create-form.tsx`, `src/app/ops/randevular/actions.ts`).
- Staff appointments current runtime’da mobile month root’u shell hack’iyle değil, workspace kendi dikey budget’ını yöneterek screen-first calendar surface gibi kurar; gerçek cihaz viewport’unda ilk açılışta page vertical scroll üretmez. Bu davranış shell bottom nav anchoring kontratından ayrıdır (`src/components/ops/ops-staff-appointments-workspace.tsx`, `src/components/ops/ops-shell.tsx`).
- Staff create action current runtime’da tek transaction zinciriyle appointment kaydı açar, ardından `flowType = appointment` `service_intake` kaydı üretir ve bunu yeni appointment’a bağlar. Visible success copy neutral kalır: `İşlem kaydı açıldı.` (`src/app/ops/randevular/actions.ts`, `src/lib/ops/service-intakes.ts`).
- Staff walk-in create current runtime’da typed state action ile aynı workspace içinde kalır; yeni kayıt `flowType = walk_in`, `appointmentId = null` ile oluşur. Visible success copy burada da neutral kalır: `İşlem kaydı açıldı.` (`src/app/ops/randevular/actions.ts`, `src/lib/ops/service-intakes.ts`).
- Staff appointments detail surface’i bağlı `service_intake` özetini doğrudan işlem bağlamında gösterir. Appointment summary verisi `/ops/staff/randevular` server page içinde `listLatestServiceIntakesByAppointmentIds()` ile, walk-in kayıtları ise `listWalkInServiceIntakesForMonth()` ile toplanır; unified day/detail/edit workspace bu iki kaynağı internal source farkını koruyarak birleştirir (`src/app/ops/staff/randevular/page.tsx`, `src/lib/ops/service-intakes.ts`, `src/components/ops/ops-staff-appointments-workspace.tsx`).
- Staff appointments detail surface’i current runtime’da bağlı `serviceIntakeId` varsa `Belge paketi` aksiyonu da taşır; bu aksiyon selected session bağlamını koruyarak `/ops/staff/belgeler/[serviceIntakeId]` route’una gider (`src/components/ops/ops-staff-appointments-workspace.tsx`).
- `/ops/staff/belgeler/[serviceIntakeId]` current runtime’da staff-only server-rendered print preview route’udur. Packet verisi doğrudan seçilmiş `service_intake` kaydı, ilgili müşteri (`users` + `user_profiles`) ve combined consent markdown kaynağından yüklenir; `latestServiceIntake` veya `cash_entries` packet truth’u olarak kullanılmaz (`src/app/ops/staff/belgeler/[serviceIntakeId]/page.tsx`, `src/lib/ops/document-packets.ts`, `src/lib/legal/legal-content.ts`).
- Staff packet preview current runtime’da kart-heavy packet yerine tek sayfa A4 operasyon sözleşmesi şablonu render eder: sol üstte `Sayı`, sağ üstte `Sözleşme tarihi`, ortada `Enki Tattoo Dövme ve Piercing Sözleşmesi` başlığı, gövdede combined legal maddeler ve altta imza + işlem bilgisi alanları görünür. E-posta, internal version string, consent warning bandı ve `Kalan` bu yüzeye taşınmaz (`src/components/ops/ops-staff-document-packet.tsx`, `src/lib/ops/document-packets.ts`).
- Staff packet preview toolbar current runtime’da `Geri`, `Yazdır` ve `1 kopya / 2 kopya` seçimini taşır; print sırasında toolbar gizlenir ve seçilen kopya sayısı kadar aynı sözleşme `Müşteri nüshası` / `Stüdyo nüshası` notuyla A4 portrait + `break-after: page` düzeninde basılır. Dijital imza, PDF exporter veya yeni packet/signature schema açılmaz (`src/components/ops/ops-staff-document-packet.tsx`, `src/app/globals.css`).
- Staff service session formunda `Alınan tutar` current runtime’da opsiyoneldir; boş değer `0` kabul edilir, negatif veya bozuk sayı app-level hata üretir, `collected > total` guard’ı korunur (`src/components/ops/ops-staff-appointment-create-form.tsx`, `src/app/ops/randevular/actions.ts`).
- Current runtime’da `service_intake` create/edit zinciri `collectedAmountCents` delta’sını otomatik `cash_entries` satırına çevirir. Pozitif delta `service_collection` + `income`, negatif delta `service_adjustment` + `expense` üretir; `total`, müşteri, tarih, saat ve not değişimi tek başına cash entry oluşturmaz (`src/lib/ops/service-intakes.ts`, `src/lib/ops/appointments.ts`, `src/lib/ops/cashbook.ts`).
- `Alınan tutar` input’undaki varsayılan `0,00` yazım ergonomisi ve toast feedback sistemi current runtime lock’un parçası değildir; bunlar PR-B sonrası bloklamayan follow-up polish konularıdır.
- Staff appointment edit current runtime’da yalnız appointment satırını değil, bağlı `flowType = appointment` `service_intake` kaydının müşteri, işlem tipi, tarih, saat, toplam, alınan ve not alanlarını da senkron tutar (`src/lib/ops/appointments.ts`, `src/app/ops/randevular/actions.ts`).
- Staff walk-in edit current runtime’da aynı form omurgasını reuse eder; `service_intake` kaydı source-aware typed action ile güncellenir, `appointmentId` null kalır ve audit `service_intake.updated` kaydı yazılır (`src/app/ops/randevular/actions.ts`, `src/lib/ops/service-intakes.ts`).
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
- Artist yalnız bugünün kasasına kayıt açabilir.
- Geçmiş kayıt düzenleme ve soft delete yalnız admin’e açıktır; ayrıca system-generated cash entry’ler read-only kalır ve manage dialog yalnız manuel kayıtlar için görünür (`src/lib/ops/cashbook.ts`, `src/app/ops/kasa/actions.ts`, `src/app/ops/staff/kasa/page.tsx`).
- `/ops/staff/kasa` current runtime’da küçük secondary `Raporlar` girişini taşır; mobile bottom nav’a ayrı item eklenmez (`src/app/ops/staff/kasa/page.tsx`, `src/lib/ops/navigation.ts`).
- Staff kasa current runtime’da ana operasyon merkezi gibi değil, yardımcı / son kontrol yüzeyi gibi okunur. Görünür defter satırları `Gelir/Gider -> işlem tipi -> tutar -> kısa destekleyici bilgi` sırasını öne çıkarır; sistem üretimi, işlem id ve admin/saat meta bilgisi görünür listede baskın durmaz (`src/app/ops/staff/kasa/page.tsx`).

### Reports

- `/ops/staff/raporlar` staff guard’ı ile korunur; hem `admin` hem `artist` erişebilir (`src/app/ops/staff/raporlar/page.tsx`, `src/lib/ops/auth/guards.ts`).
- Admin current runtime’da günlük, haftalık ve seçili tarih aralığı raporlarını görür; bu yüzey kasa özeti, randevu özeti ve seçilen aralıktaki randevu listesi üretir (`src/app/ops/staff/raporlar/page.tsx`, `src/lib/ops/reports.ts`).
- Artist current runtime’da yalnız bugün, bu hafta ve tüm randevuların read-only listesini görür; admin seviyesindeki custom date-range ve cash summary surface’i server tarafında üretilmez (`src/app/ops/staff/raporlar/page.tsx`, `src/lib/ops/reports.ts`).
- Rapor hesaplamaları mevcut `cash_entries` ve `appointments` omurgasını reuse eder; PR-C sonrası service-intake kaynaklı otomatik kasa satırları da aynı `cash_entries` summary hattına dahil olur, yeni analytics schema veya chart sistemi açılmaz (`src/lib/ops/reports.ts`, `src/lib/ops/cashbook.ts`, `src/lib/ops/appointments.ts`).

### Customer workspace

- Staff müşteri listesi ve detay yüzeyleri `/ops/staff/musteriler` ailesinde çalışır.
- Staff hızlı müşteri oluşturma akışı `users` + `user_profiles` + `user_roles` üzerinde aktif `user` hesabı açar; bu kayıt staff müşteri listesi ve staff randevu müşteri seçeneklerine dahil olur (`src/app/ops/musteriler/actions.ts`, `src/lib/ops/customers.ts`, `src/lib/ops/appointments.ts`).
- Staff müşteri create kartı current runtime’da ana akışta `Ad soyad` + `Telefon` alanlarını açık tutar; `Not` alanı aynı form içinde disclosure olarak secondary açılır (`src/components/ops/ops-staff-customer-create-form.tsx`).
- Staff müşteri create disclosure row’u current runtime’da mobile-safe’tir; `Not` / `Ekle` / `Kapat` satırı yatay taşma üretmez (`src/components/ops/ops-staff-customer-create-form.tsx`).
- Liste yalnız `user` rolündeki aktif hesapları gösterir; staff-only hesaplar listeye dahil edilmez (`src/lib/ops/customers.ts`).
- Liste araması `full_name`, `display_name`, `phone`, `email` alanları üzerinde çalışır.
- Staff müşteri listesi current runtime’da arama-first + hızlı create yan akışıyla çalışır; boş durumda müşteri listesi, arama aktifken `Arama sonuçları` başlığı ve sonuç sayısı copy’si görünür. Kart üstünde isim ve kısa iletişim bilgisi, arama aktifken isim/telefon/e-posta eşleşmesini anlatan hafif ipucu, alt satırda tek `Sıradaki işlem` özeti ve kartın tamamını primary action gibi hissettiren hafif bir yön affordance’ı yer alır; visible consent badge veya dijital onay copy’si taşımaz (`src/app/ops/staff/musteriler/page.tsx`, `src/lib/ops/customers.ts`).
- Detay yüzeyi current runtime’da müşteri kimliğini ve kısa iletişim bilgisini fold üstünde verir; visible hiyerarşi `Temel bilgi`, `İşlem özeti`, `Staff notu`, `Yaklaşan işlemler`, `Geçmiş işlemler` ekseninde kuruludur. Profil hazır bilgisi temel bilgi içinde küçük durum satırı olarak kalır; visible consent/version/status bloğu taşımaz (`src/app/ops/staff/musteriler/[userId]/page.tsx`).
- Staff müşteri detail `İşlem özeti` kartı doğrudan `getCustomerDetail(userId)` içindeki `latestServiceIntake` alanından beslenir; bu alan `getLatestServiceIntakeForCustomer(userId)` ile aynı `customerUserId` üzerinden okunur. Kart `Kaynak` alanı taşımaz ve yeni walk-in create/edit sonrası da müşteri bazlı latest intake sorgusunu gösterir; kartın kaynağı appointment detail sheet değil, müşteri bazlı latest intake sorgusudur (`src/lib/ops/customers.ts`, `src/lib/ops/service-intakes.ts`, `src/app/ops/staff/musteriler/[userId]/page.tsx`).
- Staff müşteri detail current runtime’da packet preview için primary trigger değildir; packet route seçilmiş `serviceIntakeId` bağlamıyla yalnız staff day/detail workspace içinden açılır (`src/components/ops/ops-staff-appointments-workspace.tsx`, `src/lib/ops/document-packets.ts`).
- `customer_notes.user_id` unique kalır; not upsert edilir, boş not gönderilirse kayıt temizlenir (`src/app/ops/musteriler/actions.ts`, `src/lib/ops/customers.ts`).

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
- `ops_auth.logged_in`
- `ops_auth.logged_out`
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
