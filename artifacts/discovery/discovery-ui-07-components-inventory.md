# Discovery UI 07 — Components Inventory

## KANIT
### K1 — Shadcn yapılandırma
```json
// components.json:2-14
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "iconLibrary": "lucide"
}
```

### K2 — UI primitive örnekleri (variant/props)
```tsx
// src/components/ui/button.tsx:7-16
const buttonVariants = cva(
  "... rounded-md text-sm ... focus-visible:ring-[3px] ...",
  {
    variants: {
      variant: { default, destructive, outline, secondary, ghost, link },
      size: { default, xs, sm, lg, icon, "icon-xs", "icon-sm", "icon-lg" },
```

```tsx
// src/components/ui/badge.tsx:8-20
const badgeVariants = cva(
  "... rounded-full ... text-xs ...",
  { variants: { variant: { default, secondary, destructive, outline, ghost, link } } }
)
```

```tsx
// src/components/ui/select.tsx:27-40
function SelectTrigger({ className, size = "default", ...props }) {
  return (
    <SelectPrimitive.Trigger
      data-size={size}
      className={cn("... rounded-md border ... text-sm ...", className)}
```

### K3 — Dialog/Sheet/Tabs/Toast
```tsx
// src/components/ui/dialog.tsx:64-74
className={cn("... data-[state=open]:animate-in ... rounded-lg border p-6 ... duration-200 ...")}

// src/components/ui/sheet.tsx:63-72
className={cn("... fixed z-50 ... transition ease-in-out ... duration-300/500 ...",
  side === "right" && "... env(safe-area-inset-*) ...")}

// src/components/ui/sonner.tsx:17-25
<Sonner ... icons={{ success, info, warning, error, loading: <Loader2Icon ... animate-spin /> }} />
```

### K4 — Kullanım referansları
```bash
$ rg -n "@/components/ui/(button|badge|input|select|dialog|sheet|tabs|card|sonner|textarea|table|skeleton|avatar|dropdown-menu)" -S src/app src/components
src/app/layout.tsx:4:import { Toaster } from "@/components/ui/sonner";
src/app/styleguide/page.tsx:6:import { Badge } from "@/components/ui/badge";
src/app/styleguide/page.tsx:24:} from "@/components/ui/dialog";
src/app/styleguide/page.tsx:35:import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
src/app/(app)/galeri-tasarim/filters.tsx:10:} from "@/components/ui/select";
src/components/app/mobile-header.tsx:31:} from "@/components/ui/sheet";
```

### K5 — Styleguide içinde komponent demo alanları
```tsx
// src/app/styleguide/page.tsx:211-216
<section id="components" className="space-y-8">
  <h2 className="typo-h2">Components</h2>
  <Card>
    <CardHeader>
      <CardTitle>Buttons</CardTitle>
```

```tsx
// src/app/styleguide/page.tsx:335-343
<Card>
  <CardHeader>
    <CardTitle>Dialog + Toast</CardTitle>
  </CardHeader>
  <CardContent className="flex flex-wrap gap-2">
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
```

## BULGULAR
| Component | Dosya | Varyant/Props özeti | Token/Class paterni | Kullanım referansı (1-3) |
|---|---|---|---|---|
| Button | `src/components/ui/button.tsx` | `variant`, `size`, `asChild` | `rounded-md`, `text-sm`, `focus-visible:ring` | `src/app/(app)/page.tsx`, `src/components/app/mobile-header.tsx`, `src/app/styleguide/page.tsx` |
| Badge | `src/components/ui/badge.tsx` | `variant`, `asChild` | `rounded-full`, `text-xs`, `border` | `src/app/styleguide/page.tsx`, `src/components/legacy/social-mock/feed-list.tsx` |
| Card | `src/components/ui/card.tsx` | `CardHeader/Content/Footer` slotları | `rounded-xl border shadow-sm` | `src/app/(app)/iletisim/page.tsx`, `src/components/app/right-rail.tsx`, `src/app/styleguide/page.tsx` |
| Input | `src/components/ui/input.tsx` | native input props | `h-9`, `rounded-md`, `focus-visible:ring-[3px]` | `src/components/app/app-header.tsx`, `src/components/app/mobile-header.tsx`, `src/app/styleguide/page.tsx` |
| Textarea | `src/components/ui/textarea.tsx` | native textarea props | `min-h-16`, `rounded-md`, `focus-visible:ring-[3px]` | `src/app/styleguide/page.tsx` |
| Select | `src/components/ui/select.tsx` | `size`, `SelectItem`, `SelectContent` | `rounded-md border`, animated popover | `src/app/(app)/galeri-tasarim/filters.tsx`, `src/app/styleguide/page.tsx` |
| Tabs | `src/components/ui/tabs.tsx` | `variant` (`default/line`) | `rounded-lg`, `data-state=active`, `transition-all` | `src/app/styleguide/page.tsx` |
| Dialog | `src/components/ui/dialog.tsx` | `showCloseButton`, overlay/content/header/footer | `animate-in/out`, `rounded-lg`, `shadow-lg` | `src/app/styleguide/page.tsx` |
| Sheet | `src/components/ui/sheet.tsx` | `side`, `showCloseButton` | slide animasyonu + safe-area env paddings | `src/components/app/mobile-header.tsx` |
| DropdownMenu | `src/components/ui/dropdown-menu.tsx` | primitive wrappers | popover animation + `rounded-md border` | `src/components/mode-toggle.tsx`, `src/components/app/mobile-header.tsx` |
| Avatar | `src/components/ui/avatar.tsx` | `size`, group/badge alt parçaları | `rounded-full`, ring/group classes | `src/components/app/app-header.tsx`, `src/components/legacy/social-mock/*` |
| Skeleton | `src/components/ui/skeleton.tsx` | `className` | `animate-pulse rounded-md` | `src/app/(app)/page.tsx`, `src/app/(app)/kesfet/[hub]/page.tsx` |
| Table | `src/components/ui/table.tsx` | header/body/row/cell bileşenleri | `border`, `hover:bg-muted/50` | `src/app/styleguide/page.tsx` |
| Toaster (Sonner) | `src/components/ui/sonner.tsx` | `theme`, icon set | CSS vars `--normal-bg/text/border` | `src/app/layout.tsx` |

- Filtre/chip benzeri UI gerçek route’ta `galeri-tasarim/filters.tsx` içinde `Select` + reset button ile kurulmuş; ayrı `Chip` primitive bulunmuyor (K4, K5).

## UNKNOWN (varsa)
- UNKNOWN: `Accordion` primitive/component bulunamadı.
  - Gerekli ek kanıt: `accordion` dosyası veya kullanım importu.
- UNKNOWN: Form state yönetimi için ayrı form library (örn. RHF/Zod) kanıtı yok.
  - Gerekli ek kanıt: `react-hook-form`, `zod` dependency ve kullanım dosyaları.
