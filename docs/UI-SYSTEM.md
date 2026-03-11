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
- Sayfa başlığı ve kısa intro metni tutulur; ilk gerçek iş bloğu fold üstüne mümkün olduğunca yakın gelmelidir.
- Mobil alt navigasyon `safe-pb-ops-nav` ve `safe-pb-ops-shell` ile çalışır; etiketler tam okunur kalır.
- Staff mobile nav etiketi seti `Kasa`, `Randevu`, `Müşteri`, `Profil` olarak tam görünür (`src/lib/ops/navigation.ts`, `src/components/ops/ops-shell.tsx`).

### Tek iş odağı

- Mobilde ana his “native app” ve “tek iş” olmalıdır.
- Her `/ops` sayfasında birincil aksiyon görsel olarak açık olmalıdır; ikincil özetler ana işi gölgelememelidir.
- Form, liste ve özetler aynı ekranda varsa öncelik sırası açık kurulmalıdır.

### Ekran bazlı öncelik kuralları

- Kasa: hızlı kayıt birincil yüzeydir; kompakt `Gelir / Gider` kontrolü, kısa preset etiketleri, tutar ve `Kaydı ekle` akışı öne çıkar. Tarih secondary, not disclosure, gün özeti ve defter ikincil destek katmanıdır.
- Randevular: ilk görünür ana yüzey aylık takvimdir; kullanıcı önce gün seçer, hemen ardından seçili gün operasyon paneli gelir. Seçili gün listesi ve hızlı create bu panel içinde birlikte çalışır.
- Müşteri detayı: profil, form, açık onay, randevu ve staff notu aynı yüzeyde olabilir; fakat iç model terimleri kullanıcı copy’sine sızmamalıdır.
- Profil ve placeholder benzeri sayfalar ürün dışı açıklama diline kaymamalıdır.

## 5) Kanıtlı Known Issues ve Polish Backlog

Bu bölüm çözüldü listesi değildir; repo içindeki mevcut durumun kısa kaydıdır.

- `OpsShell` üst alanı ve sayfa intro yoğunluğu azaltılmıştır; buna rağmen bazı staff ve user yüzeylerinde fold üstünde hâlâ bilgi baskısı oluşabilir (`src/components/ops/ops-shell.tsx`, `src/app/ops/staff/*.tsx`, `src/app/ops/user/*.tsx`).
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
