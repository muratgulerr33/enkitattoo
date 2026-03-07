# docs/output (Generated)

Bu klasör **otomatik üretilen keşif/discovery çıktıları** içindir.

- **Canonical dokümantasyon**: `docs/` altındaki numaralı `.md` dosyalarıdır (örn. `docs/00-masterpack.md`).
- Bu klasördeki dosyalar **source of truth değildir**.
- İçerikler script/komutlarla tekrar üretilebilir; formatı/isimleri zamanla değişebilir.

## Public UI Sitemap (Auto)

Aşağıdaki route listesi, `src/app/**/page.*` üzerinden **müşteriye görünen UI sayfalarını** keşfederek üretilir.
- Route group klasörleri `(app)` gibi **URL’ye dahil değildir**.
- Dynamic segmentler `[id]` → `:id` olarak gösterilir.
- `styleguide` gibi iç sayfalar hariç tutulur.


- Generated at (UTC): 2026-02-21T16:13:52Z
- Source: src/app

## Routes (Public UI)
```txt
/
/artistler
/galeri
/iletisim
/kesfet
/kesfet/:hub
/piercing

Total: 7
```

## Route Tree
```txt
/
├─ artistler
├─ galeri
├─ iletisim
├─ kesfet
│  └─ :hub
└─ piercing
```
