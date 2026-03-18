# AGENTS

Repo gerçeği esastır: source code, schema, migration, route ve action davranışı dokümandan önce gelir.

## Çalışma Sırası

1. Önce `docs/SSOT.md`
2. Sonra görev tipine göre `docs/UI-SYSTEM.md`, `docs/WORKFLOW.md`, `docs/OPS.md`, `docs/README.md`
3. Sonra ilgili canonical kod dosyaları

Kod ve doküman çelişirse kod kazanır. Doğrulanamayan şeyi `UNKNOWN` bırak.

## Sabit Kurallar

- `main` üstünde çalış.
- `git stash`, `git restore`, `git clean`, `git reset --hard` kullanma.
- Generated, artifact ve machine-local output’u source-of-truth sanma.
- `tsconfig.json` içine build sonrası düşen `.next/dev/types/**/*.ts` include’ı commit’e alınmaz.
- Makineye özel `NEXT_DIST_DIR` izleri commit’e alınmaz.
- Current runtime ile planned roadmap’i karıştırma.

## Aktif Docs Rolleri

- `docs/SSOT.md`: route, schema, auth ve runtime sözleşmeleri
- `docs/UI-SYSTEM.md`: shell, IA, copy ve visible behavior
- `docs/WORKFLOW.md`: çalışma sırası, kalite kapıları ve docs-only reçetesi
- `docs/OPS.md`: env, local DB, bootstrap ve smoke-check
- `docs/README.md`: docs haritası ve okuma sırası

## Doğrulama

- Docs-only görevlerde hedef diff + hedef grep + `git status -sb`
- UI değişiminde `npm run check:no-palette` ve `npm run build`
- Schema değişiminde `npm run db:generate` ve `npm run build`

Uzun roadmap detayı bu dosyada tekrar edilmez; ilgili aktif docs’a gidilir.
