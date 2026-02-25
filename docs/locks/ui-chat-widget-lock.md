# LOCK: UI Chat Widget (Tawk.to)

## Scope
- Loader: `src/components/chat/tawk-loader.tsx`
- Global mount: `src/app/(app)/layout.tsx`
- Shell cleanup: `src/components/app/app-shell.tsx`

## Removal Lock
- Mock chat bubble kaldırılmış olmalı.
- `src/components/app/chat-bubble.tsx` tekrar geri eklenmemeli.
- "Yakında: canlı sohbet" benzeri placeholder toast/bubble UI kullanılmamalı.

## Load Strategy Lock
- Tawk script yalnızca client-side yüklenir (`"use client"` + `useEffect`).
- Minimum gecikme zorunlu: UI açıldıktan sonra en az `5000ms` dolmadan script yüklenmez.
- `requestIdleCallback` varsa script idle slotta yüklenir; yoksa doğrudan yüklenir.
- Kullanıcı etkileşimi (`scroll`, `touchstart`, `mousemove`, `keydown`) yüklemeyi tetikleyebilir, ancak yalnızca `readyAt` zamanı geçildiyse.

## Single Instance + Cleanup Lock
- Çift yükleme guard zorunlu:
  - `window.Tawk_API` varlığı kontrolü
  - `script[data-tawk="true"]` varlığı kontrolü
- Script attribute standardı:
  - `src="https://embed.tawk.to/658867b870c9f2407f83115e/1hiedaa44"`
  - `async=true`
  - `charset="UTF-8"`
  - `crossorigin="*"`
  - `data-tawk="true"`
- Unmount temizliği:
  - timeout temizlenir
  - varsa idle callback iptal edilir
  - interaction listener'ları kaldırılır

## Mount Lock
- Loader sadece bir kez mount edilir (`src/app/(app)/layout.tsx`).
- SSR çıktısına inline chat script eklenmez.
