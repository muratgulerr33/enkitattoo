# PR-1: Piercing category card labels (native short names)

## Ne değişti

- Kart label üretimi, route content `h1` yerine yeni helper ile kısa native isimlerden üretilir hale getirildi.
- SEO alanları (sayfa `h1`, description, metadata) değiştirilmedi.

## Kanıt (dosya yolu + snippet)

### 1) SSOT referansı (piercingCategories)
Dosya: `src/lib/hub/hubs.v1.ts`

```ts
export const piercingCategories: string[] = [
  "kulak",
  "burun",
  "kas",
  "dudak",
  "dil",
  "gobek",
  "septum",
  "industrial",
  "kisiye-ozel",
];
```

### 2) Yeni helper (slug -> kısa label)
Dosya: `src/lib/piercing/piercing-labels.ts`

```ts
export const PIERCING_LABELS: Record<string, string> = {
  "/piercing/kulak": "Kulak",
  "/piercing/burun": "Burun",
  "/piercing/kas": "Kaş",
  "/piercing/dudak": "Dudak",
  "/piercing/dil": "Dil",
  "/piercing/gobek": "Göbek",
  "/piercing/septum": "Septum",
  "/piercing/industrial": "Industrial",
  "/piercing/kisiye-ozel": "Kişiye Özel",
};

export function getPiercingLabel(slug: string): string {
  const normalizedSlug = normalizeSlug(slug);
  const knownLabel = PIERCING_LABELS[normalizedSlug];
  if (knownLabel) return knownLabel;

  const lastSegment = normalizedSlug.split("/").filter(Boolean).pop();
  if (!lastSegment) return "Piercing";

  return lastSegment.split("-").filter(Boolean).map(toTitleCase).join(" ");
}
```

### 3) Piercing sayfasında kart title bağlama
Dosya: `src/app/(app)/piercing/page.tsx`

```tsx
import { getPiercingLabel } from "@/lib/piercing/piercing-labels";

{knownPiercingPaths.map((path) => {
  const label = getPiercingLabel(path);

  return (
    <Link key={path} href={path} ...>
      ...
      <span className="t-body text-foreground">{label}</span>
    </Link>
  );
})}
```

## Neden

- Kategori kartlarında uzun SEO/H1 metinleri yerine kısa, native, okunabilir başlıklar gösterilmesi için.
- Label dönüşümü tek sorumluluklu helper dosyasında toplandı.

## Risk

- Yeni kategori slug eklenirse map güncellenmezse fallback Title Case devreye girer (kırılma değil, olası isim standardı farkı).

## Test

1. Build
- Komut: `npm run build`
- Sonuç: Başarılı.

2. /piercing label doğrulaması (manual note)
- `npm run start -- --port 4010` ile sayfa içeriği kontrol edildi.
- Beklenen kısa labellar bulundu: `Kulak`, `Burun`, `Kaş`, `Dudak`, `Dil`, `Göbek`, `Septum`, `Industrial`, `Kişiye Özel`.
- `Mersin Kulak Piercing` ifadesi `/piercing` kart başlıklarında görülmedi.

## Commit mesaj önerisi

`feat(piercing): use short native category labels`
