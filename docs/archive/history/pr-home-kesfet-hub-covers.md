# PR: Home + Keşfet kategori kartları için public `.webp` kapak bağlama

## Ne değişti
- Home (`/`) ve Keşfet (`/kesfet`) hub kartlarının `card-media-hub` alanlarına gerçek kapak görselleri bağlandı.
- Görseller `next/image` ile `fill + object-cover + sizes` kullanılarak eklendi.
- Görsel bulunmayan slug’larda mevcut gradient placeholder davranışı korundu.
- Slug -> cover path eşleştirmesi tek noktada toplandı.

## Neden
- Boş/gradient görünen kartları gerçek kapaklarla native/premium görünüme taşımak.
- Kart oranı (`card-media-hub` / 4:5) ve CLS güvenliğini korumak.
- Eşleştirme mantığını merkezi hale getirip bakım kolaylığı sağlamak.

## Keşif kanıtı

### 1) `public` altındaki mevcut webp dosyaları
Komut: `ls -la public | rg -n "\\.webp$"`

```text
... dovme-kapatma.webp
... minimal-fine-line-dovme.webp
... portre-dovme.webp
... realistik-dovme.webp
... traditional-dovme.webp
... yazi-isim-dovme.webp
```

### 2) Hub slug listesi (SSOT)
Komut: `rg -n "mainHubs|specialHubs|slug" src/lib/hub/hubs.v1.ts`

```text
slug: "minimal-fine-line-dovme"
slug: "yazi-isim-dovmesi"
slug: "realistik-dovme"
slug: "portre-dovme"
slug: "traditional-dovme"
slug: "dovme-kapatma"
... (specialHubs)
```

## Mapping tablosu (slug -> image src)
| slug | image src | not |
|---|---|---|
| minimal-fine-line-dovme | /minimal-fine-line-dovme.webp | birebir |
| yazi-isim-dovmesi | /yazi-isim-dovme.webp | dosya adı slug ile birebir değil (`-si` farkı) |
| realistik-dovme | /realistik-dovme.webp | birebir |
| portre-dovme | /portre-dovme.webp | birebir |
| traditional-dovme | /traditional-dovme.webp | birebir |
| dovme-kapatma | /dovme-kapatma.webp | birebir |

## Kritik değişiklik kanıtı (dosya yolu + snippet)

### 1) Merkezi mapping
Dosya: `src/lib/hub/hub-cover-map.ts`

```ts
const HUB_COVER_BY_SLUG: Record<string, string> = {
  "minimal-fine-line-dovme": "/minimal-fine-line-dovme.webp",
  "yazi-isim-dovmesi": "/yazi-isim-dovme.webp",
  "realistik-dovme": "/realistik-dovme.webp",
  "portre-dovme": "/portre-dovme.webp",
  "traditional-dovme": "/traditional-dovme.webp",
  "dovme-kapatma": "/dovme-kapatma.webp",
};
```

### 2) Home kart medya alanı (`/`)
Dosya: `src/app/(app)/page.tsx`

```tsx
<div className="card-media-hub relative overflow-hidden bg-muted/50 bg-gradient-to-br from-surface-1 to-surface-2">
  {coverSrc ? (
    <>
      <Image
        fill
        src={coverSrc}
        alt={`${hub.titleTR} kapak`}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
    </>
  ) : null}
</div>
```

### 3) Keşfet kart medya alanı (`/kesfet`)
Dosya: `src/app/(app)/kesfet/page.tsx`

```tsx
<div className="card-media-hub relative overflow-hidden bg-muted/60 bg-gradient-to-br from-surface-1 to-surface-2">
  {coverSrc ? (
    <>
      <Image
        fill
        src={coverSrc}
        alt={`${titleTR} kapak`}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
    </>
  ) : null}
</div>
```

## Risk
- Eşleştirme listesinde olmayan slugs (özellikle `specialHubs`) placeholder gösterecek; beklenen fallback davranışı.
- `public` dosya adları değişirse mapping güncellenmezse görsel yerine fallback görünür.

## Test
1. Build
- Komut: `npm run build`
- Sonuç: Başarılı.

2. Build özeti
```text
✓ Compiled successfully
✓ Generating static pages (34/34)
└ ○ /, ○ /kesfet
```

## Değişen dosyalar
- `src/lib/hub/hub-cover-map.ts`
- `src/app/(app)/page.tsx`
- `src/app/(app)/kesfet/page.tsx`
- `docs/output/pr-home-kesfet-hub-covers.md`
