# UI-SYSTEM

Bu dosya yaşayan UI kontratlarının evidir. Tarihçe anlatmaz; mevcut component, shell ve utility düzenini koruyan kuralları yazar.

## 1) UI Ownership Matrix

| Alan | Canonical component/file | Supporting file | Dikkat edilecek kontrat |
|---|---|---|---|
| App shell | `src/components/app/app-shell.tsx` | `src/app/globals.css`, `src/app/[locale]/(app)/layout.tsx` | `app-container app-mobile-header-offset app-safe-bottom no-overflow-x` zinciri korunur |
| Mobile header | `src/components/app/mobile-header.tsx` | `src/lib/ui/use-hide-header-on-scroll.ts`, `src/components/ui/icon-button.tsx` | top-level route seti, locale switch, active state, hide/show davranışı birlikte düşünülür |
| Drawer | `src/components/app/mobile-header.tsx` | `MenuRow`, `Sheet` primitive'leri | text-only satır deseni korunur; ikinci nav kaynağı açılmaz |
| Top-level nav | `src/components/app/mobile-header.tsx` | `@/i18n/navigation` | route listesi ve locale-aware link aynı yerde kalır |
| Hub card | `src/components/hub/hub-card.tsx` | `src/lib/hub/hub-cover-map.ts`, `src/app/globals.css` | `min-w-0`, `truncate`, `card-media-hub`, CTA ritmi korunur |
| Footer / contact | `src/components/app/site-footer.tsx`, `src/app/[locale]/(app)/iletisim/page.tsx` | `src/lib/site-info.ts`, `src/lib/site/links.ts` | ikinci NAP/link kaynağı açılmaz |
| Icon button | `src/components/ui/icon-button.tsx` | `src/components/app/mobile-header.tsx` | min `h-11 w-11`, `ariaLabel`, focus-visible zorunlu |
| SEO-related UI | `src/components/seo/local-business-jsonld.tsx`, `src/components/seo/breadcrumb-list-jsonld.tsx`, `src/components/seo/faqpage-jsonld.tsx` | ilgili route page'leri | UI içeriği ile schema kaynağı drift etmemeli |
| Gallery grid | `src/app/[locale]/(app)/galeri-tasarim/gallery-grid.tsx` | `src/lib/gallery/manifest.v1.ts` | grid ritmi, viewer state, query-param davranışı korunur |
| Featured carousel / piercing UI | `src/components/piercing/featured-piercing-carousel.tsx`, `src/components/piercing/piercing-category-grid.tsx` | `src/lib/piercing/featured-piercing.ts`, `src/lib/piercing/piercing-labels.ts`, `src/lib/piercing/piercing-icons.ts` | featured data, label/icon lookup ve layout birlikte düşünülür |

## 2) Good Example References

| Davranış | Referans dosya |
|---|---|
| Shell, safe-area ve desktop right rail | `src/components/app/app-shell.tsx` |
| Scroll ile header hide/show | `src/lib/ui/use-hide-header-on-scroll.ts` |
| Locale-aware header, drawer ve nav | `src/components/app/mobile-header.tsx` |
| Hub kartı ve text taşma kontrolü | `src/components/hub/hub-card.tsx` |
| Footer quick links ve NAP tüketimi | `src/components/app/site-footer.tsx` |
| Contact CTA ve maps yüzeyi | `src/app/[locale]/(app)/iletisim/page.tsx` |
| Icon-only action | `src/components/ui/icon-button.tsx` |
| Gallery filter + grid + viewer | `src/app/[locale]/(app)/galeri-tasarim/page.tsx`, `gallery-grid.tsx` |
| Piercing carousel ve category grid | `src/components/piercing/featured-piercing-carousel.tsx`, `src/components/piercing/piercing-category-grid.tsx` |

## 3) Temel Katman

- Theme sistemi `next-themes` ile çalışır; `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`, `storageKey="enki-theme"` kullanılır (`src/app/layout.tsx`).
- Ham palette sınıfı kullanımı yasaktır; semantik tokenlar kullanılır. Kontrol komutu `npm run check:no-palette` (`package.json`, `scripts/check-no-palette.sh`).
- `src/app/globals.css` şu temel katmanları taşır:
  - renk tokenları
  - `typo-*` ve `t-*` alias tipografi sistemi
  - `app-container`, `app-section`, `grid-cards`, `grid-cards-compact`
  - `app-mobile-header-offset`, `app-safe-bottom`, `no-overflow-x`

### Yapılmalı

- `bg-background`, `text-foreground`, `border-border`, `bg-surface-1`, `bg-surface-2`, `ring-ring` gibi tokenları kullan.
- Mevcut `typo-*` ve utility sınıflarını yeniden üretmek yerine kullan.

### Yapılmamalı

- `bg-white`, `text-black`, `bg-gray-*`, `text-zinc-*` benzeri palette sınıflarını app UI içinde açma.
- Aynı iş için ikinci tipografi, spacing veya token sistemi kurma.

## 4) App Shell, Header ve Drawer Kontratı

- App shell `src/components/app/app-shell.tsx` içindedir.
- Mobil shell `<xl`, desktop shell `xl+` çalışır.
- `main` container şu zinciri korur: `app-container app-mobile-header-offset app-safe-bottom no-overflow-x`.
- `src/app/globals.css` içindeki `--app-mobile-topbar-h`, `--app-mobile-tabbar-h`, `--app-mobile-header-h` shell yüksekliği hesabının parçasıdır.
- Mobil header ve drawer mantığı `src/components/app/mobile-header.tsx` içindedir.
- Top-level tab seti sabittir: `/`, `/kesfet`, `/piercing`, `/galeri-tasarim`, `/artistler`.
- Drawer/top-level route listesi: `/`, `/kesfet`, `/piercing`, `/galeri-tasarim`, `/artistler`, `/sss`, `/iletisim`.
- Header hide/show davranışı `useHideHeaderOnScroll` ile transform tabanlı çalışır; passive scroll + `requestAnimationFrame` kullanır.

### Yapılmalı

- Sayfa wrapper'larında `app-section` ve `no-overflow-x` kullan.
- Safe-area ve header offset için utility sınıfları kullan.
- Drawer satırlarını `MenuRow` pattern'i ile text-only tut.
- Icon-only aksiyonlarda `IconButton` kullan.
- `aria-current`, `aria-label`, `focus-visible` ve `active:scale-*` davranışını koru.

### Yapılmamalı

- Mobil header offset'i ayrı hack'lerle çözme.
- İkinci shell veya ikinci nav kaynağı açma.
- Header animasyonunu React state ile frame-frame yeniden kurma.
- Top-level route listesini page içinde yeniden kopyalama.

## 5) Kart, Medya ve Text Surface Kontratı

- Hub kart medyası `card-media-hub` (`4:5`) kullanır.
- Gallery kart medyası `card-media-gallery` (`3:4`) kullanır.
- Legacy `card-media` (`5:4`) hâlâ utility olarak vardır.
- Hub kartların ortak evi `src/components/hub/hub-card.tsx`tir.
- Hub kart metinleri `min-w-0`, `truncate`, `whitespace-nowrap` zinciri ile korunur; footer alanı `min-h-[92px]`tir.
- Gallery grid `GalleryGrid` içindedir; query-param destekli viewer açılışı ve progressive yükleme mantığı vardır.
- Featured piercing carousel ayrı data kaynağı (`FEATURED_PIERCING`) ile çalışır.

### Yapılmalı

- Yeni kartta önce `HubCard`, `GalleryGrid`, `FeaturedPiercingCarousel` ve mevcut CTA desenlerini referans al.
- Card/grid değişirse mobil, tablet ve desktop ritmini birlikte kontrol et.
- Text surface açarken `min-w-0`, `truncate`, `line-clamp`, esnek width zincirini düşün.

### Yapılmamalı

- Aynı bilgi türü için ikinci kart markup sistemi açma.
- Translation uzunluğu yüzünden CTA veya medya oranını bozma.
- Query-param ile çalışan gallery viewer davranışını sayfa dışında tekrar kurma.

## 6) Footer, Contact, Icon ve Safe-area Kontratı

- Footer `src/components/app/site-footer.tsx` içinde üç bloklu yapı ile render edilir.
- Footer quick links `src/lib/site/links.ts` kaynaklıdır.
- Contact ve footer aksiyonları minimum `h-11` hit area ve truncate ile çalışır.
- Business info UI içinde hardcode edilmez; `SITE_INFO` ve site linkleri kullanılır.
- `IconButton` min `h-11 w-11`, `ariaLabel`, `focus-visible` ve active state kontratı taşır.
- Safe-area için `app-safe-bottom` ve ilgili padding hesapları kullanılır; sayfa bazlı farklı sistem açılmaz.

### Yapılmalı

- CTA, footer ve drawer action'larında `min-h-11`, `min-w-0`, `truncate`, `focus-visible`, `active:scale-*` zincirini koru.
- Footer/contact güncellemesinde `src/lib/site-info.ts` ve `src/lib/site/links.ts` kaynaklarını referans al.
- Icon-only action varsa erişilebilir label zorunlu kabul et.

### Yapılmamalı

- Footer/contact için ikinci NAP veya link kaynağı açma.
- Icon-only action'ı düz `<button>` ile kontratsız açma.
- Safe-area ve header offset'i utility yerine sayfa içine gömme.

## 7) Component Decision Rules

- Yeni action eklerken:
  - önce `Button`, `IconButton`, `ExternalLink`, `IconRouteCta`, `WhatsAppCta`, `PhoneCta` kontrol edilir.
  - yeni primitive son çaredir.
- Yeni nav eklerken:
  - `@/i18n/navigation` kullanılır.
  - top-level nav / drawer route seti tek yerde tutulur.
- Yeni card eklerken:
  - önce `HubCard`, gallery grid item deseni veya featured carousel kartı referans alınır.
  - medya oranı ve text yüzeyi mevcut utility ile çözülür.
- Yeni text surface eklerken:
  - çevrilebilir mi diye önce düşünülür.
  - çevrilebilir ise `messages/*.json` veya ilgili content namespace kullanılır.
  - taşma ihtimali varsa `min-w-0`, `truncate`, `line-clamp`, `whitespace-nowrap` planlanır.

## 8) Responsive Acceptance Criteria

| Yüzey | Kabul kriteri |
|---|---|
| Mobile | yatay taşma yok; header offset ve safe-area doğru |
| Tablet | grid ritmi bozulmaz; CTA'lar kırılmaz |
| Desktop | shell + right rail düzeni korunur |
| Long-locale-content | TR dışı locale'lerde button/header/footer/card metni taşmadan kalır |
| Icon-only actions | min 44px+ hit area ve `aria-label` korunur |
| Footer/contact overflow | link ve NAP satırları truncate veya wrap ile düzenli kalır |
| Card/grid rhythm | başlık/description/CTA zinciri grid yüksekliğini bozmaz |

## 9) UI Failure Modes

| Failure mode | Ne bozulur | İlk bakılacak yer |
|---|---|---|
| İkinci shell açılır | offset, safe-area ve header ritmi drift eder | `app-shell.tsx`, `globals.css` |
| Second nav source yaratılır | header, drawer ve route listesi ayrışır | `mobile-header.tsx` |
| Hardcoded text kalır | locale değişince UI drift eder | ilgili component, `messages/*`, `src/content/**` |
| `min-w-0` / `truncate` zinciri kırılır | card, header, footer ve CTA taşar | `HubCard`, `SiteFooter`, header yüzeyleri |
| Palette bypass edilir | tema kontratı ve `check:no-palette` disiplini bozulur | `globals.css`, ilgili component |
| NAP/link UI'ye gömülür | footer/contact/JSON-LD drift eder | `site-info.ts`, `site/links.ts` |

## 10) Locale-aware UI Kontratı

- Kullanıcıya görünen çevrilebilir UI metni `messages/*.json` veya locale bazlı content kaynağından gelmelidir.
- TR varsayılan locale'dir ama `sq`, `sr`, `en` first-class citizen kabul edilir.
- UI yalnızca TR metin uzunluğuna göre tasarlanmaz.
- Header, drawer, tab, footer, card ve CTA alanları locale uzamasına dayanmalıdır.

### Yapılmalı

- Button, card, header, footer, drawer ve chip alanlarında `min-w-0`, `truncate`, `line-clamp`, `whitespace-nowrap` ve esnek container kullan.
- Locale değişince satır yüksekliği, hit area ve focus davranışı korunmalı.
- Prefixli locale ile en az bir görsel smoke check yapılmalı.

### Yapılmamalı

- Çevrilebilir UI metnini component içine sabitleme.
- Locale değişince kırılan sabit genişlikli metin alanları bırakma.
- Flag, icon veya kısa label var diye text taşmasını önemsememe.

## 11) Accessibility ve Performance Minimumları

### Accessibility

- Icon-only action: minimum `44px+` hit area ve `aria-label`
- Aktif navigation: `aria-current="page"`
- Focus: `focus-visible:ring-*` görünür kalmalı
- Truncate kullanılsa bile action erişilebilirliği bozulmamalı

### Performance

- Header scroll davranışı passive scroll + `requestAnimationFrame` ile kalmalı.
- `prefers-reduced-motion` ve desktop breakpoint davranışı korunmalı.
- Büyük görsellerde mevcut `next/image` ve `sizes` yaklaşımı korunmalı.
- Gallery viewer ve carousel yüzeylerinde mevcut lazy/progressive desenler korunmalı; aynı sorunu çözen ikinci viewer/carousel mantığı açılmamalı.

## 12) UI Anti-patternler

- Hardcoded UI text
- İkinci shell veya ikinci header mantığı açmak
- Safe-area ve header offset'i utility yerine sayfa içine gömmek
- Footer/contact için ikinci business info kaynağı açmak
- Palette sınıflarıyla mevcut token sistemini bypass etmek
- Artifact veya mock veriyi production UI kaynağı gibi kullanmak
