# 03 — Zaman Tüneli: Enki Tattoo Web (V1)

## T0 — Hedef netleşti
- Amaç: Enki Tattoo'yu Mersin'de tattoo/piercing anahtar kelimelerinde organik büyüme ile üst sıralara taşımak.
- UX: 2026 native pattern'ları, premium ama anlaşılır.
- Tech: Next.js App Router + TS + Tailwind + shadcn/ui + Light/Dark.

## T1 — Design System temeli kuruldu
- shadcn/ui "new-york" + baseColor "neutral" + css variables.
- Semantic token disiplini: hard-coded palette sınıfları yasaklandı.
- Light "paper/off-white" background hedefi kilitlendi.
- docs/01-Design rules.md oluşturuldu (tek kaynak).

## T2 — Proje kurulumları tamamlandı
- Next.js proje: TypeScript, App Router, src/, ESLint.
- Tailwind v4 + @tailwindcss/postcss + tw-animate-css kuruldu.
- next-themes ThemeProvider eklendi (system default).
- Font: sadece Geist (ikinci font iptal).

## T3 — Styleguide sayfası çıktı
- /styleguide: Tokens + Typography + Components.
- Typography utilities eklendi (t-h1..t-body vs).
- Component state'leri test edilebilir hale geldi.

## T4 — Neutral token hatası düzeltildi
- Primary'nin mavi çıkmasına sebep olan token/mapping düzeltildi.
- Canonical shadcn neutral token seti baz alındı, sadece background/card/popover paper tweak kaldı.

## T5 — IA + Hub Mimari V1 entegre edildi
- Üst seviye IA: Ana Sayfa, Keşfet, Piercing, Galeri, Artistler, İletişim.
- Keşfet: 6 ana hub + "Özel" (Atatürk/Blackwork/Custom) + Piercing CTA.
- Galeri: grid + filtre şeması (stil/artist/tema).
- Piercing ayrı dünya olarak ayrı sayfada.

## T6 — Facebook Android benzeri mobil header uygulandı
- 2 katmanlı header: Top bar (hamburger/back + actions) + Tab bar (5 sekme).
- Scroll hide/show threshold ile tek parça animasyon.
- Back stratejisi: history yoksa / fallback.
- İletişim tab'dan çıkarılıp top action'a taşındı.
- Chat bubble header'dan bağımsız sticky kaldı.

## T7 — Responsive polish (xl 1280 breakpoint)
- <1280: "app mode", tek kolon.
- >=1280: 2 kolon layout + right rail (CTA + popüler hub'lar).
- Sayfa bazlı grid kırılımları (Home/Kesfet/Galeri/Piercing/Artistler/İletişim).
- Safe-area padding ve tap target standartları iyileştirildi.
- docs/02-responsive-checklist.md eklendi.

## T8 — Governance Pack (repo hygiene + canonical + masterpack)
- Repo hygiene: `.gitignore`, `.editorconfig`, `.env.example`, `README.md`, `docs/04-repo-hygiene.md` güncellendi/oluşturuldu.
- Guardrail: `scripts/check-no-palette.sh` + `npm run check:no-palette` / `npm run check:all` (palette sınıfları yasak).
- Route canonicalization: `/book`→`/iletisim`, `/explore`→`/kesfet`, `/gallery`→`/galeri`, `/profile`→`/artistler` sunucu yönlendirmesi.
- Social-feed bileşenleri `src/components/legacy/social-mock/` altına taşındı; public sayfalarda kullanılmıyor.
- `docs/00-masterpack.md` oluşturuldu (proje özeti, IA, hub, header, tasarım, repo kuralları, quality gates, prompt library).

## Şu anki durum
- İskelet sağlam: theme/token sistemi, IA/hub mimarisi, header davranışı, responsive düzen.
- Governance Pack uygulandı: tek kaynak dokümanlar, canonical route’lar, palette guardrail, masterpack.
- Demo için gerekli: içeriklerin hub mimarisine sadık kalması (social feed yok), CTA'ların netliği, görsel placeholder'ların tutarlılığı.

## Sıradaki kilit işler (V1)
1) SEO/Organic Growth foundation:
   - sitemap/robots/manifest
   - per-route metadata (TR)
   - Hub detail sayfalarında SEO blokları + FAQ + breadcrumb JSON-LD
2) Galeri data modeli:
   - WorkItem slug + /galeri/[slug] detay
   - görsel pipeline (next/image + blur placeholders)
3) Dönüşüm:
   - WhatsApp deep link standardı
   - İletişim sayfası: konum/telefon/instagram net CTA
