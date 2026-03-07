# PR-3: Make “Kişiye Özel” card full-width on Piercing page

## Ne değişti
- `/piercing` kategori gridinde sadece `"/piercing/kisiye-ozel"` kartı için `col-span-2` eklendi.
- Kart iç layout (ikon + label), SEO metinleri ve diğer sayfalar etkilenmedi.

## Neden
- Gridde tek kalan son kartın görsel dengesini iyileştirmek.
- "Kişiye Özel" kartını tam satıra taşıyarak boşluk hissini azaltmak.

## Kanıt (dosya yolu + snippet)

### 1) Hedef dosyada kategori gridi ve koşullu full-width
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
{knownPiercingPaths.map((path) => {
  const label = getPiercingLabel(path);
  const Icon = getPiercingIcon(path);
  const isCustom = path === "/piercing/kisiye-ozel" || path.endsWith("/kisiye-ozel");

  return (
    <Link
      key={path}
      href={path}
      className={`flex min-h-14 items-center gap-3 rounded-xl border border-border bg-surface-2 p-4 shadow-soft transition-colors hover:bg-accent/50 ${
        isCustom ? "col-span-2" : ""
      }`}
    >
      <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      <span className="t-body text-foreground">{label}</span>
    </Link>
  );
})}
```

## Risk
- `path` formatı değişirse (`/piercing/kisiye-ozel` dışında farklı slug) koşul güncellenmelidir.
- `col-span-2` tüm breakpoint'lerde aktif; mevcut beklentiyle uyumlu.

## Test
1. Build
- Komut: `npm run build`
- Sonuç: Başarılı.

2. Manuel doğrulama (`/piercing`)
- `npm run start -- --port 4011` + `curl` ile render çıktısı kontrol edildi.
- `"/piercing/kisiye-ozel"` kartında `col-span-2` sınıfı bulundu.

## Commit önerisi
- `feat(piercing): make custom category card full-width`
