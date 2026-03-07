# Discovery UI 01 — Stack + Entrypoints

## KANIT
### K1 — Çalışma dizini ve kök
```bash
$ pwd
/Users/apple/dev/enkitattoo

$ ls -la
...
-rw-r--r--    1 apple  staff     367 Feb 24 01:41 next.config.ts
-rw-r--r--    1 apple  staff      94 Feb  6 04:27 postcss.config.mjs
-rw-r--r--    1 apple  staff     464 Feb 23 16:46 components.json
drwxr-xr-x    7 apple  staff     224 Feb 23 16:46 src
drwxr-xr-x   17 apple  staff     544 Feb 24 01:19 public
...
```

### K2 — Git/Node/NPM
```bash
$ git status -sb
## main...origin/main
 M next-env.d.ts

$ git rev-parse --short HEAD
321659a

$ node -v || true
v22.14.0

$ pnpm -v || npm -v || true
10.9.2
```

### K3 — package.json (stack)
```json
{
  "dependencies": {
    "@tailwindcss/postcss": "^4.1.18",
    "lucide-react": "^0.563.0",
    "next": "16.1.6",
    "next-themes": "^0.4.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "sonner": "^2.0.7",
    "tailwindcss": "^4.1.18"
  }
}
```

### K4 — `app/src/components/styles/public` komutu
```bash
$ ls -la app src components styles public || true
ls: app: No such file or directory
ls: components: No such file or directory
ls: styles: No such file or directory

public:
...

src:
...
drwxr-xr-x  16 apple  staff   512 Feb 24 02:02 app
drwxr-xr-x  11 apple  staff   352 Feb 23 16:46 components
...
```

### K5 — Entrypoint/config dosyaları
```bash
$ ls -la next.config.* || true
-rw-r--r--  1 apple  staff  367 Feb 24 01:41 next.config.ts

$ ls -la postcss.config.* || true
-rw-r--r--  1 apple  staff  94 Feb  6 04:27 postcss.config.mjs

$ ls -la tailwind.config.* || true
zsh: no matches found: tailwind.config.*

$ ls -la components.json || true
-rw-r--r--  1 apple  staff  464 Feb 23 16:46 components.json
```

### K6 — `globals.css/layout.tsx/page.tsx` taraması
```bash
$ find . -maxdepth 3 -type f -name "globals.css" -o -name "layout.tsx" -o -name "page.tsx" | sort
./src/app/globals.css
./src/app/layout.tsx
```

### K7 — Route-dosya taraması (`app` vs `src/app`)
```bash
$ find app -type f \( -name "layout.tsx" -o -name "page.tsx" -o -name "loading.tsx" -o -name "not-found.tsx" -o -name "error.tsx" \) | sort
find: app: No such file or directory

$ find src/app -type f \( -name "layout.tsx" -o -name "page.tsx" -o -name "loading.tsx" -o -name "not-found.tsx" -o -name "error.tsx" \) | sort
src/app/(app)/artistler/[slug]/page.tsx
src/app/(app)/artistler/page.tsx
src/app/(app)/galeri-tasarim/page.tsx
src/app/(app)/iletisim/page.tsx
src/app/(app)/kesfet/[hub]/page.tsx
src/app/(app)/kesfet/page.tsx
src/app/(app)/layout.tsx
src/app/(app)/page.tsx
src/app/(app)/piercing/[hub]/page.tsx
src/app/(app)/piercing/page.tsx
src/app/layout.tsx
src/app/styleguide/page.tsx
```

## BULGULAR
- Proje Next.js App Router kullanıyor; aktif kök `src/app` (K4, K7).
- Stack: Next `16.1.6`, React `19.2.3`, Tailwind CSS `4.1.18`, `next-themes`, `sonner`, `lucide-react` (K3).
- Tailwind v4 CSS-first yaklaşımı var; `tailwind.config.*` bulunmadı (K5).
- Giriş config dosyaları: `next.config.ts`, `postcss.config.mjs`, `components.json` (K5).
- Repo temiz değil; `next-env.d.ts` modified durumda (K2).

## UNKNOWN (varsa)
- UNKNOWN: `pnpm` binary mevcut değil; `pnpm -v || npm -v` zinciri sadece `npm` sürümünü döndürüyor.
  - Gerekli ek kanıt: çalışma ortamında `pnpm` kurulumunu doğrulayan ayrı bir komut çıktısı.
- UNKNOWN: `find . -maxdepth 3 ...` komutu sadece iki dosya döndürdü; bu komut derin route dosyalarını kapsamaz.
  - Gerekli ek kanıt: `src/app` altında daha derin seviyede `find` çıktısı (K7 zaten bu boşluğu kapatmak için eklendi).
