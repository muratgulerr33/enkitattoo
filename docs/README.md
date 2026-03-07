# Docs

Bu klasördeki aktif çekirdek beş dosyadır. Bunlar yaşayan dokümandır; `docs/archive/` aynı statüde değildir.

1. `docs/README.md`: docs haritası, rol ayrımı ve okuma sırası
2. `docs/SSOT.md`: route, i18n, SEO, source-of-truth ve teknik gerçekler
3. `docs/UI-SYSTEM.md`: yaşayan UI kontratları
4. `docs/WORKFLOW.md`: günlük çalışma biçimi, kalite kapıları ve AI akışı
5. `docs/OPS.md`: repo içinden doğrulanabilen runtime ve deploy hazırlığı

## Ne Zaman Hangisini Oku

- Repo gerçeğini, canonical kaynakları ve değişiklik etkisini anlamak için önce `docs/SSOT.md`
- UI shell, header, card, footer veya responsive davranış değişecekse `docs/UI-SYSTEM.md`
- Çalışma sırası, generator, i18n ve kalite kapıları için `docs/WORKFLOW.md`
- Build/deploy öncesi repo-side kontrol için `docs/OPS.md`
- Çekirdeğin yapısını ve hangi bilginin hangi evde yaşadığını hatırlamak için bu dosya

## AI Okuma Protokolü

1. Önce `docs/SSOT.md` ile canonical kaynakları ve `UNKNOWN` sınırını al.
2. Değişiklik UI ise `docs/UI-SYSTEM.md`, süreç ise `docs/WORKFLOW.md`, deploy hazırlığı ise `docs/OPS.md` oku.
3. Sonra ilgili kod dosyasına git; docs tek başına kodun yerine geçmez.
4. Artifact veya generated dosyayı source-of-truth sanma.

## Dizin Modeli

- `docs/`: yaşayan çekirdek ve `docs/archive/`
- `docs/archive/`: tarihsel, duplicate veya artık aktif olmayan dokümanlar
- `artifacts/`: discovery, audit, report, inventory, cherry-pick ve benzeri çıktılar
- `data/`: yaşayan makine girdileri; ör. `data/route-content/enki-v1-sitemap-seo-template.csv`

## Geçiş Notu

- Hedef modelde kalite çıktıları `artifacts/` altında tutulur.
- Repo gerçeğinde `scripts/i18n/check-messages.mjs` hâlâ fiziksel olarak `docs/output/i18n-*.json` üretir.
- Bu yüzden `docs/output/` aktif doküman alanı değildir; i18n kalite scripti için kalan legacy output noktasıdır.

## Kullanım Kuralları

- Teknik gerçek başka dosyada tekrar üretilecekse kısa referans ver; asıl evi değiştirme.
- Artifact veya generated dosyayı canonical source gibi kullanma.
- Repo içinden doğrulanamayan bilgi çekirdeğe girmez; `UNKNOWN` olarak işaretlenir.
