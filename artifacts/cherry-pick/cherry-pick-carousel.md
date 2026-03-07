# Cherry Pick Runbook - OtherBrandProductsCarousel

Bu dokuman, PDP icindeki "diger marka modelleri" slider'ini baska projeye `%100 ayni davranis` ile tasimak icin gereken tum teknik bilgileri toplar.

## 1) Kaynak component

- Component export adi: `OtherBrandProductsCarousel`
- Dosya: `src/components/product/other-brand-products-carousel.tsx`
- PDP kullanim noktasi: `src/app/urun/[slug]/page.tsx`
- Veri kaynagi servis: `getOtherProductsByBrand(...)` (`src/lib/api/products.ts`)
- Bu component'i ekleyen commit: `c48f1da`

Not: `c48f1da` tek basina cherry-pick edilirse component gelir, ama tam goruntu/es davranis icin asagidaki transitive bagimliliklarin da hedef projede bulunmasi gerekir.

## 2) Bagimlilik grafigi (tam parity)

`OtherBrandProductsCarousel`
-> `@/components/ui/carousel`
-> `@/components/catalog/product-card`
-> `CategoryProduct` type (`@/lib/api/products`)

`Carousel` zinciri:
- `src/components/ui/carousel.tsx`
- `src/components/ui/button.tsx`
- Paketler: `embla-carousel-react`, `lucide-react`, `@radix-ui/react-slot`, `class-variance-authority`

`ProductCard` zinciri:
- `src/components/catalog/product-card.tsx`
- `src/lib/utils.ts` (`cn`, `formatPrice`, `formatProductName`)
- `src/components/favorites/favorite-button.tsx` (karttaki kalp ikonu)

`FavoriteButton` zinciri (eger kalp aynen kalsin istiyorsan):
- `src/components/favorites/favorites-provider.tsx`
- `src/app/actions/wishlist.ts`
- `src/components/auth/auth-provider.tsx` (`SessionProvider`)
- `src/auth.ts` (auth() server helper)
- `src/db/connection.ts`
- `src/db/schema.ts` (ozellikle `wishlist_items`, `users`, `products`)
- `sonner` (`Toaster`) layout baglantisi

`PDP data` zinciri:
- `src/lib/api/products.ts`: `CategoryProduct`, `normalizeGender`, `getOtherProductsByBrand`
- `src/app/urun/[slug]/page.tsx`: `otherBrandProducts` olusturma + component render

## 3) Zorunlu dosya listesi

Asagidaki liste "UI + davranis + veri akisi" parity icin referans listedir.

### 3.1 Core (slider'in gorunmesi ve kaymasi icin)

1. `src/components/product/other-brand-products-carousel.tsx`
2. `src/components/ui/carousel.tsx`
3. `src/components/ui/button.tsx`
4. `src/components/catalog/product-card.tsx`
5. `src/lib/utils.ts`

### 3.2 PDP entegrasyonu (dinamik veriyle ayni calissin diye)

1. `src/lib/api/products.ts` (en az su parcalar):
- `export type CategoryProduct`
- `export function normalizeGender(...)`
- `export async function getOtherProductsByBrand(...)`
2. `src/app/urun/[slug]/page.tsx` icindeki import ve render:
- `import { OtherBrandProductsCarousel } ...`
- `import { getOtherProductsByBrand, normalizeGender } ...`
- `const otherBrandProducts = await getOtherProductsByBrand(...)`
- `<OtherBrandProductsCarousel brandName={...} products={otherBrandProducts} />`

### 3.3 Favori kalbi de birebir calissin istiyorsan (opsiyonel degil, parity icin gerekli)

1. `src/components/favorites/favorite-button.tsx`
2. `src/components/favorites/favorites-provider.tsx`
3. `src/app/actions/wishlist.ts`
4. `src/components/auth/auth-provider.tsx`
5. `src/auth.ts`
6. `src/db/connection.ts`
7. `src/db/schema.ts` (`wishlist_items` dahil)
8. `src/app/layout.tsx` (Provider sirasi + `<Toaster />`)

## 4) NPM kutuphane gereksinimleri

Bu stack'te kullanilan paketler:

- `embla-carousel-react`
- `lucide-react`
- `@radix-ui/react-slot`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `next-auth` (favorite flow icin)
- `sonner` (toast icin)
- `drizzle-orm` + `pg` (wishlist action + products service icin)

Bu repodaki surumler (referans):

- `embla-carousel-react@^8.6.0`
- `lucide-react@^0.563.0`
- `@radix-ui/react-slot@^1.2.4`
- `class-variance-authority@^0.7.1`
- `clsx@^2.1.1`
- `tailwind-merge@^3.4.0`
- `next-auth@5.0.0-beta.25`
- `sonner@^2.0.7`
- `drizzle-orm@^0.45.1`
- `pg@^8.11.3`

## 5) Import/alias ve stil altyapisi

### 5.1 TS path alias

Dosyalar `@/` alias'i kullaniyor. Hedef projede yoksa iki secenek:

1. `tsconfig.json` icinde `@/* -> ./src/*` tanimla.
2. Tum importlari relative path'e cevir.

### 5.2 Tailwind/design token beklentisi

Component class'lari su tokenlari bekliyor:

- `bg-card`, `bg-background`
- `text-foreground`, `text-muted-foreground`
- `border-input`, `ring-*`, `focus-visible:ring-*`

Hedef projede bu tokenlar yoksa derleme olur ama goruntu ayni olmaz.

## 6) Servis contract (kritik)

`OtherBrandProductsCarousel` su prop contract'ini bekler:

```ts
type OtherBrandProductsCarouselProps = {
  brandName: string
  products: CategoryProduct[]
}

type CategoryProduct = {
  id: number
  title: string
  price: number // kurus beklenir
  image: string
  slug: string
  brand: string
}
```

`getOtherProductsByBrand(...)` davranisi:

- Ayni brand slug'a gore urunleri getirir.
- Mevcut urunu dislar (`excludeProductId`).
- Gender filtre davranisi:
  - `unisex` ise sadece `unisex`
  - `erkek/kadin` ise `[gender, "unisex"]`, once ayni gender
- Duplicate product satirlarini eler.
- Fiyati kurus formatina normalize eder:
  - `rawPrice >= 100000` ise oldugu gibi kabul eder
  - degilse `* 100` ile kurusa cevirir

## 7) Cherry-pick stratejisi

## 7.1 Onerilen yontem (secili dosya transferi, en temiz)

`c48f1da` commit'i baska degisiklikler de tasidigi icin tum commit'i cherry-pick etmek genelde riskli.
Bu nedenle secili dosya transferi onerilir:

```bash
# hedef projede
git remote add arti-optik /Users/apple/dev/arti-optik-next
git fetch arti-optik

# yeni branch
git checkout -b feat/other-brand-carousel

# gerekli dosyalari kaynak commit/branch'ten al
git restore --source arti-optik/main -- \
  src/components/product/other-brand-products-carousel.tsx \
  src/components/ui/carousel.tsx \
  src/components/ui/button.tsx \
  src/components/catalog/product-card.tsx \
  src/lib/utils.ts \
  src/lib/api/products.ts
```

Ardindan kendi PDP route dosyana entegrasyonu uygula.

Tam parity (favorite + provider + action + auth) istiyorsan yukaridaki sete su dosyalari da ekle:

```bash
git restore --source arti-optik/main -- \
  src/components/favorites/favorite-button.tsx \
  src/components/favorites/favorites-provider.tsx \
  src/components/auth/auth-provider.tsx \
  src/app/actions/wishlist.ts \
  src/auth.ts \
  src/db/connection.ts \
  src/db/schema.ts \
  src/app/layout.tsx
```

Hedef projede dosyalari "birebir kaynakla ayni" almak icin dogrulama komutu:

```bash
git diff -- \
  src/components/product/other-brand-products-carousel.tsx \
  src/components/ui/carousel.tsx \
  src/components/catalog/product-card.tsx \
  src/lib/api/products.ts
```

## 7.2 Gercek cherry-pick (tum commit)

Sadece hedef proje, bu commit'teki tum degisiklikleri kabul edecekse:

```bash
git cherry-pick c48f1da
```

Uyari: Bu commit, carousel disinda `globals.css`, `layout`, loading dosyalari gibi alanlari da etkiler.

## 7.3 Tek dosya bazli birebir cekim (alternatif)

Asagidaki yaklasim, dosyayi kaynak branch'ten birebir alir:

```bash
git show arti-optik/main:src/components/product/other-brand-products-carousel.tsx > src/components/product/other-brand-products-carousel.tsx
git show arti-optik/main:src/components/ui/carousel.tsx > src/components/ui/carousel.tsx
git show arti-optik/main:src/components/catalog/product-card.tsx > src/components/catalog/product-card.tsx
git show arti-optik/main:src/lib/api/products.ts > src/lib/api/products.ts
```

Not: Bu yontem dosyalari birebir overwrite eder.

## 8) Provider ve runtime checklist

Kalp/favori ayni calissin istiyorsan:

1. Root'ta `AuthProvider` + `FavoritesProvider` sarimi olsun.
2. Root'ta `<Toaster position="top-center" />` olsun.
3. `next-auth` konfig ve session akisi aktif olsun.
4. `wishlist_items` tablosu DB'de olsun.
5. `DATABASE_URL` set olsun.

Yoksa en tipik runtime hata:

- `useWishlist must be used within FavoritesProvider`

## 9) Hedef projede hizli dogrulama

1. `npm install`
2. `npm run lint`
3. `npm run dev`
4. PDP'de su kontroller:
- Baslik: diger brand modelleri basligi gorunuyor mu?
- Kartlar soldan saga kayiyor mu?
- Desktop'ta prev/next butonlari gorunuyor mu?
- Kart click'i `/urun/[slug]` route'una gidiyor mu?
- Fiyat `TL` ve kurus->TL formatiyla dogru mu?
- Favori kalbi tiklandiginda login/wishlist akisi bozulmuyor mu?

## 10) Kisa karar ozet

- Sadece slider UI lazimsa: `3.1 + 3.2` yeterli.
- Ekran goruntusundeki ile birebir parity lazimsa: `3.1 + 3.2 + 3.3` tamami gerekli.
- Bu repodan direkt tek commit cherry-pick yerine secili dosya transferi daha guvenli.
