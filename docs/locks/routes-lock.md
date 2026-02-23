# Routes Lock — Kesfet + Galeri + Artistler + Piercing

Tarih: 2026-02-24

## Kilitlenen Prefix
- `/kesfet/<slug>`
- `/artistler/<slug>`
- `/piercing/<slug>`
- `/galeri-tasarim`

## Final Slug Listesi (Yeni)
- `minimal-fine-line-dovme`
- `yazi-isim-dovmesi`
- `realistik-dovme`
- `portre-dovme`
- `traditional-dovme`
- `dovme-kapatma`
- `ataturk-temali-dovme`
- `blackwork-dovme`
- `kisiye-ozel-dovme-tasarimi`

## Eski -> Yeni Mapping
| Eski slug | Yeni slug |
|---|---|
| `minimal-fine-line` | `minimal-fine-line-dovme` |
| `lettering` | `yazi-isim-dovmesi` |
| `realism` | `realistik-dovme` |
| `portrait` | `portre-dovme` |
| `traditional-old-school` | `traditional-dovme` |
| `cover-up` | `dovme-kapatma` |
| `ataturk` | `ataturk-temali-dovme` |
| `blackwork` | `blackwork-dovme` |
| `custom` | `kisiye-ozel-dovme-tasarimi` |

## Kural
- Eski sluglar için redirect/301 uygulanmadı.
- Eski sluglar 404 dönebilir (PR-1 kabulü ile uyumlu).
- `/galeri` route'u kaldırıldı; pre-launch dönemde 404 kabul.

## Artistler Slug (PR-3)
- `halit-yalvac`

## Piercing Slug Listesi (PR-3)
- `kulak`
- `burun`
- `kas`
- `dudak`
- `dil`
- `gobek`
- `septum`
- `industrial`
- `kisiye-ozel`
