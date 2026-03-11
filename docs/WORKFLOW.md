# WORKFLOW

Bu dosya repo içindeki çalışma kitabıdır. Görev sırası, kalite kapıları, doküman rol ayrımı ve değişiklik tipine göre kısa reçeteler burada tutulur.

## 1) Çalışma Modeli

- Çalışma ağacı `main` kabul edilir.
- Branch açma.
- `git stash`, `git restore`, `git clean`, `git reset --hard` kullanma.
- Repo gerçeği dışında varsayım yazma.
- Doğrulanamayan şeyi `UNKNOWN` olarak işaretle.
- Değişiklik yapmadan önce canonical kaynağı bul.
- Aynı bilgiyi ikinci yerde üretmek yerine asıl evine referans ver.

## 2) Doküman Rolleri

- `README.md`: repo giriş kapısı
- `docs/README.md`: doküman haritası
- `docs/SSOT.md`: teknik kanonik sözleşme
- `docs/UI-SYSTEM.md`: UI kontratları
- `docs/WORKFLOW.md`: çalışma biçimi ve kalite kapıları
- `docs/OPS.md`: repo-içi runbook, local DB ve smoke-check seti

Kural:

- Teknik gerçek `SSOT`’a gider.
- UI ritmi, copy ve shell kuralı `UI-SYSTEM`’e gider.
- Çalışma disiplini ve komut reçetesi `WORKFLOW`’da kalır.
- Runtime/runbook/smoke bilgisi `OPS`’a gider.

## 3) Günlük Çalışma Sırası

1. `main` durumunu ve worktree farkını kontrol et.
2. Hedef dosyaları ve ilgili canonical kaynağı oku.
3. Kod, schema, route ve action yüzeylerinden kanıt topla.
4. Etkilenecek docs ve generated dosyaları önceden eşleştir.
5. Uygulamayı yap.
6. İlgili kalite kapılarını çalıştır.
7. Diff’i, docs rol ayrımını ve `UNKNOWN` sınırını son kez kontrol et.

## 4) Temel Kalite Kapıları

Asgari komut seti:

- `npm run lint`
- `npm run build`
- `npm run check:no-palette`
- `npm run check:all`

Duruma göre:

- UI regression için `npm run ui:audit`, `npm run ui:audit:tr`
- Route-content değiştiyse `python3 scripts/generate-route-content.py`
- DB schema değiştiyse `npm run db:generate`
- Mesaj seti değiştiyse `node scripts/i18n/check-messages.mjs`

Notlar:

- `check:all` generator çalıştırmaz.
- `node scripts/i18n/check-messages.mjs` npm script değildir; doğrudan çağrılır.

## 5) Local Preview ve Local DB Standardı

- Uygulamanın script tabanlı default portu `3002`’dir (`npm run dev`, `npm run start`).
- İzole preview gerekiyorsa doküman örneklerinde önce `3012`, gerekirse `3013` kullanılır.
- `3004` kullanılmaz.
- Bu preview portları workflow konvansiyonudur; kod tarafında zorunlu kılınmış ayrı preview script’i yoktur.
- Local DB akışı PostgreSQL + Drizzle üstünden yürür.
- Repo Docker compose tarifi vermez; fakat yerel PostgreSQL instance’ı `DATABASE_URL` ile sağlanır ve çalışma standardı Docker-backed local PostgreSQL kabul edilir.
- `drizzle.config.ts` fallback URL’si `postgresql://postgres:postgres@127.0.0.1:5432/enki_tattoo` değerini taşır.
- Makineye özel `.env.local` override’ları repo gerçeği değildir; örnek olarak okunabilir ama standart ilan edilmez.

## 6) Docs-only Reçetesi

Önce bak:

- İlgili aktif dokümanın rolüne
- İlgili canonical kod dosyasına
- Gerekirse ilgili migration ve commit zincirine

Adımlar:

1. Çelişki varsa kodu esas al.
2. Tekrarlanan bilgiyi kısalt; bilgi kaybı yaratma.
3. Kullanıcıya dönük copy örneklerinde gerçek Türkçe karakter kullan.
4. Repo içinden doğrulanmayan iddiayı yazma.
5. Gerekiyorsa açıkça `UNKNOWN` bırak.

Zorunlu komut yoktur; fakat en azından hedef diff ve hedef grep kontrolü yapılır.

## 7) Kısa Task-type Reçeteleri

### Public route veya metadata

- Önce: page dosyası, route-content CSV, generator zinciri
- Komut: `python3 scripts/generate-route-content.py`, `npm run build`
- Docs etkisi: çoğu durumda `docs/SSOT.md`

### UI shell veya copy

- Önce: `docs/UI-SYSTEM.md`, canonical component, `src/app/globals.css`
- Komut: `npm run check:no-palette`, `npm run build`
- Gözle kontrol: mobile, tablet, desktop, copy dili, taşma
- Docs etkisi: `docs/UI-SYSTEM.md`

### DB schema veya migration

- Önce: `src/db/schema/*`, `drizzle.config.ts`, mevcut migration zinciri
- Komut: `npm run db:generate`, `npm run build`
- Docs etkisi: teknik sözleşme değiştiyse `docs/SSOT.md`, runbook değiştiyse `docs/OPS.md`

### Ops auth veya guard

- Önce: `src/lib/ops/auth/*`, `src/app/ops/**`, bootstrap script
- Komut: `npm run lint`, `npm run build`
- Gözle kontrol: `/ops`, `/ops/giris`, staff/user redirect ve guard akışı
- Docs etkisi: sözleşme değiştiyse `docs/SSOT.md`, runbook değiştiyse `docs/OPS.md`

### Yalnız doküman

- Önce: bilginin asıl evi
- Komut: hedef diff, hedef grep, `git status -sb`
- Kontrol: rol ayrımı, tekrar, yanlış kesinlik, `UNKNOWN`

## 8) Commit Hazırlığı

| Değişiklik türü | Zorunlu komut | Gözle kontrol | Docs etkisi |
|---|---|---|---|
| Route / metadata | `python3 scripts/generate-route-content.py`, `npm run build` | sitemap, robots, canonical | çoğu durumda `SSOT` |
| UI kontratı | `npm run check:no-palette`, `npm run build` | mobile/tablet/desktop, copy, taşma | `UI-SYSTEM` |
| DB schema / migration | `npm run db:generate`, `npm run build` | migration SQL, env beklentisi | `SSOT`, bazen `OPS` |
| Ops auth / guard | `npm run lint`, `npm run build` | `/ops` redirect, staff/user guard, bootstrap/login | `SSOT`, bazen `OPS` |
| Docs-only | hedef diff ve grep | rol ayrımı, tekrar, `UNKNOWN` | ilgili aktif docs |

## 9) Hata Önleme

- Generated dosyayı elle düzenleme.
- Artifact veya local output’u canonical source sanma.
- `next build` sonrası `tsconfig.json` içine eklenen `.next/dev/types/**/*.ts` include’ını canonical sanma; commit’e alma.
- Public route ile internal route’u karıştırma.
- Bir tablo veya route davranışını yalnız eski dokümana bakarak yazma.
- Kullanıcıya dönük copy ile iç sistem notunu karıştırma.
- Repo dışı production topolojisini kesin hüküm gibi yazma.

## 10) `UNKNOWN` Sınırı

- Production host, reverse proxy, Cloudflare ve servis topolojisi repo dışıdır.
- Production env inventory tam listesi repo dışıdır.
- Repo dışı görsel bulgular veya kullanıcı raporları, koddan doğrulanmadıkça `UNKNOWN` kalır.
