# discovery

scope_include: src/**/*, app/**/*, pages/**/*, components/**/*, lib/**/*
scope_exclude: docs/**, scripts/**, public/**, *.md, *.txt, node_modules, .next, dist, build, coverage, .git

framework_versions (from package.json):
- next: 16.1.6
- react: 19.2.3
- tailwindcss: ^4.1.18
- typescript: ^5

package.json evidence:
```txt
18:    "next": "16.1.6",
22:    "react": "19.2.3",
26:    "tailwindcss": "^4.1.18"
35:    "typescript": "^5"
```

## discovery-sitemap-tree
```txt
DISCOVERY SITEMAP TREE
scope_include: src/**/*, app/**/*, pages/**/*, components/**/*, lib/**/*
scope_exclude: docs/**, scripts/**, public/**, *.md, *.txt, node_modules, .next, dist, build, coverage, .git

## src
src
├── app
│   ├── (app)
│   │   ├── artistler
│   │   │   └── page.tsx
│   │   ├── book
│   │   │   └── page.tsx
│   │   ├── explore
│   │   │   └── page.tsx
│   │   ├── galeri
│   │   │   ├── galeri-filters.tsx
│   │   │   └── page.tsx
│   │   ├── gallery
│   │   │   └── page.tsx
│   │   ├── iletisim
│   │   │   └── page.tsx
│   │   ├── kesfet
│   │   │   ├── [hub]
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── piercing
│   │   │   └── page.tsx
│   │   └── profile
│   │       └── page.tsx
│   ├── .DS_Store
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.module.css
│   └── styleguide
│       └── page.tsx
├── components
│   ├── app
│   │   ├── app-header.tsx
│   │   ├── bottom-nav.tsx
│   │   ├── chat-bubble.tsx
│   │   ├── mobile-header.tsx
│   │   └── right-rail.tsx
│   ├── legacy
│   │   └── social-mock
│   │       ├── feed-list.tsx
│   │       ├── feed-skeleton.tsx
│   │       ├── home-composer.tsx
│   │       ├── post-card.tsx
│   │       └── stories-row.tsx
│   ├── styleguide
│   │   └── token-grid.tsx
│   ├── theme
│   │   └── theme-switch.tsx
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── ui
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
└── lib
    ├── hub
    │   └── hubs.v1.ts
    ├── mock
    │   ├── categories.ts
    │   ├── enki.ts
    │   └── feed.ts
    ├── ui
    │   └── metrics.ts
    └── utils.ts

25 directories, 54 files

MISSING: app

MISSING: pages

MISSING: components

MISSING: lib

```

## discovery-styleguide
```txt
DISCOVERY STYLEGUIDE

[Config files]
tailwind.config.*: none found
postcss.config.mjs

[Global/theme token CSS candidates]
src/app/globals.css

[Token and typography evidence matches]
./src/app/globals.css:101:  --surface-1: oklch(0.975 0 0);
./src/app/globals.css:102:  --surface-2: oklch(0.99 0 0);
./src/app/globals.css:103:  --overlay: oklch(0 0 0 / 40%);
./src/app/globals.css:104:  --overlay-strong: oklch(0 0 0 / 50%);
./src/app/globals.css:10:  --color-surface-2: var(--surface-2);
./src/app/globals.css:110:  --background: oklch(0.145 0 0);
./src/app/globals.css:111:  --foreground: oklch(0.985 0 0);
./src/app/globals.css:113:  --card: oklch(0.205 0 0);
./src/app/globals.css:114:  --card-foreground: var(--foreground);
./src/app/globals.css:115:  --popover: oklch(0.269 0 0);
./src/app/globals.css:116:  --popover-foreground: var(--foreground);
./src/app/globals.css:118:  --primary: oklch(0.922 0 0);
./src/app/globals.css:119:  --primary-foreground: oklch(0.205 0 0);
./src/app/globals.css:11:  --color-overlay: var(--overlay);
./src/app/globals.css:121:  --secondary: oklch(0.269 0 0);
./src/app/globals.css:122:  --secondary-foreground: oklch(0.985 0 0);
./src/app/globals.css:124:  --muted: oklch(0.269 0 0);
./src/app/globals.css:125:  --muted-foreground: oklch(0.708 0 0);
./src/app/globals.css:127:  --accent: oklch(0.371 0 0);
./src/app/globals.css:128:  --accent-foreground: oklch(0.985 0 0);
./src/app/globals.css:12:  --color-overlay-strong: var(--overlay-strong);
./src/app/globals.css:130:  --destructive: oklch(0.704 0.191 22.216);
./src/app/globals.css:131:  --destructive-foreground: oklch(0.985 0 0);
./src/app/globals.css:133:  --border: oklch(1 0 0 / 10%);
./src/app/globals.css:134:  --input: oklch(1 0 0 / 15%);
./src/app/globals.css:135:  --ring: oklch(0.556 0 0);
./src/app/globals.css:137:  --chart-1: oklch(0.488 0.243 264.376);
./src/app/globals.css:138:  --chart-2: oklch(0.696 0.171 62.48);
./src/app/globals.css:139:  --chart-3: oklch(0.769 0.188 70.08);
./src/app/globals.css:140:  --chart-4: oklch(0.627 0.265 303.9);
./src/app/globals.css:141:  --chart-5: oklch(0.645 0.246 16.439);
./src/app/globals.css:143:  --sidebar: oklch(0.205 0 0);
./src/app/globals.css:144:  --sidebar-foreground: oklch(0.985 0 0);
./src/app/globals.css:145:  --sidebar-primary: oklch(0.488 0.243 264.376);
./src/app/globals.css:146:  --sidebar-primary-foreground: oklch(0.985 0 0);
./src/app/globals.css:147:  --sidebar-accent: oklch(0.269 0 0);
./src/app/globals.css:148:  --sidebar-accent-foreground: oklch(0.985 0 0);
./src/app/globals.css:149:  --sidebar-border: oklch(1 0 0 / 10%);
./src/app/globals.css:14:  --shadow-soft: 0 1px 3px 0 oklch(0 0 0 / 0.06), 0 1px 2px -1px oklch(0 0 0 / 0.06);
./src/app/globals.css:150:  --sidebar-ring: oklch(0.439 0 0);
./src/app/globals.css:153:  --surface-1: oklch(0.205 0 0);
./src/app/globals.css:154:  --surface-2: oklch(0.269 0 0);
./src/app/globals.css:155:  --overlay: oklch(0 0 0 / 55%);
./src/app/globals.css:156:  --overlay-strong: oklch(0 0 0 / 65%);
./src/app/globals.css:15:  --shadow-popover: 0 4px 6px -1px oklch(0 0 0 / 0.08), 0 2px 4px -2px oklch(0 0 0 / 0.06);
./src/app/globals.css:17:  --font-sans: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
./src/app/globals.css:18:  --font-display: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
./src/app/globals.css:20:  --color-ring: var(--ring);
./src/app/globals.css:21:  --color-input: var(--input);
./src/app/globals.css:22:  --color-border: var(--border);
./src/app/globals.css:24:  --color-primary: var(--primary);
./src/app/globals.css:25:  --color-primary-foreground: var(--primary-foreground);
./src/app/globals.css:26:  --color-secondary: var(--secondary);
./src/app/globals.css:27:  --color-secondary-foreground: var(--secondary-foreground);
./src/app/globals.css:28:  --color-muted: var(--muted);
./src/app/globals.css:29:  --color-muted-foreground: var(--muted-foreground);
./src/app/globals.css:30:  --color-accent: var(--accent);
./src/app/globals.css:31:  --color-accent-foreground: var(--accent-foreground);
./src/app/globals.css:32:  --color-destructive: var(--destructive);
./src/app/globals.css:33:  --color-destructive-foreground: var(--destructive-foreground);
./src/app/globals.css:35:  --color-card: var(--card);
./src/app/globals.css:36:  --color-card-foreground: var(--card-foreground);
./src/app/globals.css:37:  --color-popover: var(--popover);
./src/app/globals.css:38:  --color-popover-foreground: var(--popover-foreground);
./src/app/globals.css:40:  --color-chart-1: var(--chart-1);
./src/app/globals.css:41:  --color-chart-2: var(--chart-2);
./src/app/globals.css:42:  --color-chart-3: var(--chart-3);
./src/app/globals.css:43:  --color-chart-4: var(--chart-4);
./src/app/globals.css:44:  --color-chart-5: var(--chart-5);
./src/app/globals.css:46:  --radius-sm: calc(var(--radius) - 4px);
./src/app/globals.css:47:  --radius-md: calc(var(--radius) - 2px);
./src/app/globals.css:48:  --radius-lg: var(--radius);
./src/app/globals.css:49:  --radius-xl: calc(var(--radius) + 4px);
./src/app/globals.css:50:  --radius-2xl: calc(var(--radius) + 8px);
./src/app/globals.css:53::root {
./src/app/globals.css:55:  --radius: 0.625rem;
./src/app/globals.css:58:  --background: oklch(0.985 0 0);
./src/app/globals.css:59:  --foreground: oklch(0.145 0 0);
./src/app/globals.css:61:  --card: oklch(0.99 0 0);
./src/app/globals.css:62:  --card-foreground: var(--foreground);
./src/app/globals.css:63:  --popover: oklch(0.99 0 0);
./src/app/globals.css:64:  --popover-foreground: var(--foreground);
./src/app/globals.css:66:  --primary: oklch(0.205 0 0);
./src/app/globals.css:67:  --primary-foreground: oklch(0.985 0 0);
./src/app/globals.css:69:  --secondary: oklch(0.97 0 0);
./src/app/globals.css:6:@theme inline {
./src/app/globals.css:70:  --secondary-foreground: oklch(0.205 0 0);
./src/app/globals.css:72:  --muted: oklch(0.97 0 0);
./src/app/globals.css:73:  --muted-foreground: oklch(0.556 0 0);
./src/app/globals.css:75:  --accent: oklch(0.97 0 0);
./src/app/globals.css:76:  --accent-foreground: oklch(0.205 0 0);
./src/app/globals.css:78:  --destructive: oklch(0.577 0.245 27.325);
./src/app/globals.css:79:  --destructive-foreground: oklch(0.985 0 0);
./src/app/globals.css:7:  --color-background: var(--background);
./src/app/globals.css:81:  --border: oklch(0.922 0 0);
./src/app/globals.css:82:  --input: oklch(0.922 0 0);
./src/app/globals.css:83:  --ring: oklch(0.708 0 0);
./src/app/globals.css:85:  --chart-1: oklch(0.646 0.222 41.116);
./src/app/globals.css:86:  --chart-2: oklch(0.6 0.118 184.704);
./src/app/globals.css:87:  --chart-3: oklch(0.398 0.072 27.392);
./src/app/globals.css:88:  --chart-4: oklch(0.828 0.189 84.429);
./src/app/globals.css:89:  --chart-5: oklch(0.769 0.188 70.08);
./src/app/globals.css:8:  --color-foreground: var(--foreground);
./src/app/globals.css:91:  --sidebar: oklch(0.985 0 0);
./src/app/globals.css:92:  --sidebar-foreground: oklch(0.145 0 0);
./src/app/globals.css:93:  --sidebar-primary: oklch(0.205 0 0);
./src/app/globals.css:94:  --sidebar-primary-foreground: oklch(0.985 0 0);
./src/app/globals.css:95:  --sidebar-accent: oklch(0.97 0 0);
./src/app/globals.css:96:  --sidebar-accent-foreground: oklch(0.205 0 0);
./src/app/globals.css:97:  --sidebar-border: oklch(0.922 0 0);
./src/app/globals.css:98:  --sidebar-ring: oklch(0.708 0 0);
./src/app/globals.css:9:  --color-surface-1: var(--surface-1);
./src/app/layout.tsx:2:import { Geist } from "next/font/google";
./src/app/page.module.css:10:  --button-secondary-border: #ebebeb;
./src/app/page.module.css:131:    --background: #000;
./src/app/page.module.css:132:    --foreground: #000;
./src/app/page.module.css:134:    --text-primary: #ededed;
./src/app/page.module.css:135:    --text-secondary: #999;
./src/app/page.module.css:137:    --button-primary-hover: #ccc;
./src/app/page.module.css:138:    --button-secondary-hover: #1a1a1a;
./src/app/page.module.css:139:    --button-secondary-border: #1a1a1a;
./src/app/page.module.css:16:  font-family: var(--font-geist-sans);
./src/app/page.module.css:2:  --background: #fafafa;
./src/app/page.module.css:3:  --foreground: #fff;
./src/app/page.module.css:5:  --text-primary: #000;
./src/app/page.module.css:6:  --text-secondary: #666;
./src/app/page.module.css:8:  --button-primary-hover: #383838;
./src/app/page.module.css:9:  --button-secondary-hover: #f2f2f2;

[Summary]
colors:
  - ./src/app/globals.css:101:  --surface-1: oklch(0.975 0 0);
  - ./src/app/globals.css:102:  --surface-2: oklch(0.99 0 0);
  - ./src/app/globals.css:103:  --overlay: oklch(0 0 0 / 40%);
  - ./src/app/globals.css:104:  --overlay-strong: oklch(0 0 0 / 50%);
  - ./src/app/globals.css:10:  --color-surface-2: var(--surface-2);
  - ./src/app/globals.css:110:  --background: oklch(0.145 0 0);
  - ./src/app/globals.css:111:  --foreground: oklch(0.985 0 0);
  - ./src/app/globals.css:113:  --card: oklch(0.205 0 0);
  - ./src/app/globals.css:114:  --card-foreground: var(--foreground);
  - ./src/app/globals.css:115:  --popover: oklch(0.269 0 0);
  - ./src/app/globals.css:116:  --popover-foreground: var(--foreground);
  - ./src/app/globals.css:118:  --primary: oklch(0.922 0 0);
  - ./src/app/globals.css:119:  --primary-foreground: oklch(0.205 0 0);
  - ./src/app/globals.css:121:  --secondary: oklch(0.269 0 0);
  - ./src/app/globals.css:122:  --secondary-foreground: oklch(0.985 0 0);
  - ./src/app/globals.css:124:  --muted: oklch(0.269 0 0);
  - ./src/app/globals.css:125:  --muted-foreground: oklch(0.708 0 0);
  - ./src/app/globals.css:127:  --accent: oklch(0.371 0 0);
  - ./src/app/globals.css:128:  --accent-foreground: oklch(0.985 0 0);
  - ./src/app/globals.css:130:  --destructive: oklch(0.704 0.191 22.216);
  - ./src/app/globals.css:131:  --destructive-foreground: oklch(0.985 0 0);
  - ./src/app/globals.css:133:  --border: oklch(1 0 0 / 10%);
  - ./src/app/globals.css:134:  --input: oklch(1 0 0 / 15%);
  - ./src/app/globals.css:135:  --ring: oklch(0.556 0 0);
  - ./src/app/globals.css:137:  --chart-1: oklch(0.488 0.243 264.376);
  - ./src/app/globals.css:138:  --chart-2: oklch(0.696 0.171 62.48);
  - ./src/app/globals.css:139:  --chart-3: oklch(0.769 0.188 70.08);
  - ./src/app/globals.css:140:  --chart-4: oklch(0.627 0.265 303.9);
  - ./src/app/globals.css:141:  --chart-5: oklch(0.645 0.246 16.439);
  - ./src/app/globals.css:143:  --sidebar: oklch(0.205 0 0);
  - ./src/app/globals.css:144:  --sidebar-foreground: oklch(0.985 0 0);
  - ./src/app/globals.css:145:  --sidebar-primary: oklch(0.488 0.243 264.376);
  - ./src/app/globals.css:146:  --sidebar-primary-foreground: oklch(0.985 0 0);
  - ./src/app/globals.css:147:  --sidebar-accent: oklch(0.269 0 0);
  - ./src/app/globals.css:148:  --sidebar-accent-foreground: oklch(0.985 0 0);
  - ./src/app/globals.css:149:  --sidebar-border: oklch(1 0 0 / 10%);
  - ./src/app/globals.css:14:  --shadow-soft: 0 1px 3px 0 oklch(0 0 0 / 0.06), 0 1px 2px -1px oklch(0 0 0 / 0.06);
  - ./src/app/globals.css:150:  --sidebar-ring: oklch(0.439 0 0);
  - ./src/app/globals.css:153:  --surface-1: oklch(0.205 0 0);
  - ./src/app/globals.css:154:  --surface-2: oklch(0.269 0 0);
  - ./src/app/globals.css:155:  --overlay: oklch(0 0 0 / 55%);
  - ./src/app/globals.css:156:  --overlay-strong: oklch(0 0 0 / 65%);
  - ./src/app/globals.css:15:  --shadow-popover: 0 4px 6px -1px oklch(0 0 0 / 0.08), 0 2px 4px -2px oklch(0 0 0 / 0.06);
  - ./src/app/globals.css:24:  --color-primary: var(--primary);
  - ./src/app/globals.css:25:  --color-primary-foreground: var(--primary-foreground);
  - ./src/app/globals.css:26:  --color-secondary: var(--secondary);
  - ./src/app/globals.css:27:  --color-secondary-foreground: var(--secondary-foreground);
  - ./src/app/globals.css:28:  --color-muted: var(--muted);
  - ./src/app/globals.css:29:  --color-muted-foreground: var(--muted-foreground);
  - ./src/app/globals.css:30:  --color-accent: var(--accent);
  - ./src/app/globals.css:31:  --color-accent-foreground: var(--accent-foreground);
  - ./src/app/globals.css:32:  --color-destructive: var(--destructive);
  - ./src/app/globals.css:33:  --color-destructive-foreground: var(--destructive-foreground);
  - ./src/app/globals.css:35:  --color-card: var(--card);
  - ./src/app/globals.css:36:  --color-card-foreground: var(--card-foreground);
  - ./src/app/globals.css:37:  --color-popover: var(--popover);
  - ./src/app/globals.css:38:  --color-popover-foreground: var(--popover-foreground);
  - ./src/app/globals.css:40:  --color-chart-1: var(--chart-1);
  - ./src/app/globals.css:41:  --color-chart-2: var(--chart-2);
  - ./src/app/globals.css:42:  --color-chart-3: var(--chart-3);
  - ./src/app/globals.css:43:  --color-chart-4: var(--chart-4);
  - ./src/app/globals.css:44:  --color-chart-5: var(--chart-5);
  - ./src/app/globals.css:58:  --background: oklch(0.985 0 0);
  - ./src/app/globals.css:59:  --foreground: oklch(0.145 0 0);
  - ./src/app/globals.css:61:  --card: oklch(0.99 0 0);
  - ./src/app/globals.css:62:  --card-foreground: var(--foreground);
  - ./src/app/globals.css:63:  --popover: oklch(0.99 0 0);
  - ./src/app/globals.css:64:  --popover-foreground: var(--foreground);
  - ./src/app/globals.css:66:  --primary: oklch(0.205 0 0);
  - ./src/app/globals.css:67:  --primary-foreground: oklch(0.985 0 0);
  - ./src/app/globals.css:69:  --secondary: oklch(0.97 0 0);
  - ./src/app/globals.css:70:  --secondary-foreground: oklch(0.205 0 0);
  - ./src/app/globals.css:72:  --muted: oklch(0.97 0 0);
  - ./src/app/globals.css:73:  --muted-foreground: oklch(0.556 0 0);
  - ./src/app/globals.css:75:  --accent: oklch(0.97 0 0);
  - ./src/app/globals.css:76:  --accent-foreground: oklch(0.205 0 0);
  - ./src/app/globals.css:78:  --destructive: oklch(0.577 0.245 27.325);
  - ./src/app/globals.css:79:  --destructive-foreground: oklch(0.985 0 0);
  - ./src/app/globals.css:7:  --color-background: var(--background);
  - ./src/app/globals.css:81:  --border: oklch(0.922 0 0);
  - ./src/app/globals.css:82:  --input: oklch(0.922 0 0);
  - ./src/app/globals.css:83:  --ring: oklch(0.708 0 0);
  - ./src/app/globals.css:85:  --chart-1: oklch(0.646 0.222 41.116);
  - ./src/app/globals.css:86:  --chart-2: oklch(0.6 0.118 184.704);
  - ./src/app/globals.css:87:  --chart-3: oklch(0.398 0.072 27.392);
  - ./src/app/globals.css:88:  --chart-4: oklch(0.828 0.189 84.429);
  - ./src/app/globals.css:89:  --chart-5: oklch(0.769 0.188 70.08);
  - ./src/app/globals.css:8:  --color-foreground: var(--foreground);
  - ./src/app/globals.css:91:  --sidebar: oklch(0.985 0 0);
  - ./src/app/globals.css:92:  --sidebar-foreground: oklch(0.145 0 0);
  - ./src/app/globals.css:93:  --sidebar-primary: oklch(0.205 0 0);
  - ./src/app/globals.css:94:  --sidebar-primary-foreground: oklch(0.985 0 0);
  - ./src/app/globals.css:95:  --sidebar-accent: oklch(0.97 0 0);
  - ./src/app/globals.css:96:  --sidebar-accent-foreground: oklch(0.205 0 0);
  - ./src/app/globals.css:97:  --sidebar-border: oklch(0.922 0 0);
  - ./src/app/globals.css:98:  --sidebar-ring: oklch(0.708 0 0);
  - ./src/app/globals.css:9:  --color-surface-1: var(--surface-1);
  - ./src/app/page.module.css:131:    --background: #000;
  - ./src/app/page.module.css:132:    --foreground: #000;
  - ./src/app/page.module.css:17:  background-color: var(--background);
  - ./src/app/page.module.css:28:  background-color: var(--foreground);
  - ./src/app/page.module.css:2:  --background: #fafafa;
  - ./src/app/page.module.css:3:  --foreground: #fff;
  - ./src/app/page.module.css:88:  color: var(--background);
  - ./src/components/ui/sonner.tsx:29:          "--normal-bg": "var(--popover)",
  - ./src/components/ui/sonner.tsx:30:          "--normal-text": "var(--popover-foreground)",
radius:
  - ./src/app/globals.css:46:  --radius-sm: calc(var(--radius) - 4px);
  - ./src/app/globals.css:47:  --radius-md: calc(var(--radius) - 2px);
  - ./src/app/globals.css:48:  --radius-lg: var(--radius);
  - ./src/app/globals.css:49:  --radius-xl: calc(var(--radius) + 4px);
  - ./src/app/globals.css:50:  --radius-2xl: calc(var(--radius) + 8px);
  - ./src/app/globals.css:55:  --radius: 0.625rem;
  - ./src/app/styleguide/page.tsx:193:                --radius (base), rounded-md, rounded-lg, rounded-xl
  - ./src/components/ui/sonner.tsx:32:          "--border-radius": "var(--radius)",
spacing:
  - ./src/app/page.module.css:121:    letter-spacing: -1.92px;
  - ./src/app/page.module.css:45:  letter-spacing: -2.4px;
  - ./src/app/styleguide/page.tsx:145:                  A second paragraph keeps the same line height and spacing so
typography:
  - ./src/app/globals.css:17:  --font-sans: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
  - ./src/app/globals.css:18:  --font-display: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
  - ./src/app/layout.tsx:2:import { Geist } from "next/font/google";
  - ./src/app/layout.tsx:9:  variable: "--font-geist",
  - ./src/app/page.module.css:16:  font-family: var(--font-geist-sans);
  - 3:    "@tailwindcss/postcss": {},
```

## discovery-layout
```txt
DISCOVERY LAYOUT

[Layout files under app/ and src/app/]
src/app/(app)/layout.tsx
src/app/layout.tsx

[Shell component candidates by filename/export]
files:
  - src/components/app/app-header.tsx
  - src/components/app/bottom-nav.tsx
  - src/components/app/mobile-header.tsx
  - src/components/app/right-rail.tsx
exports:
  - src/components/app/app-header.tsx:11:export function AppHeader({
  - src/components/app/bottom-nav.tsx:17:export function BottomNav({
  - src/components/app/mobile-header.tsx:64:export function MobileHeader() {
  - src/components/app/right-rail.tsx:25:export function RightRail() {

[Providers]
./src/app/layout.tsx:25:        <ThemeProvider
./src/app/layout.tsx:34:        </ThemeProvider>
./src/app/layout.tsx:3:import { ThemeProvider } from "@/components/theme-provider";
./src/components/theme-provider.tsx:4:import { ThemeProvider as NextThemesProvider } from "next-themes";
./src/components/theme-provider.tsx:6:export function ThemeProvider({

[Layout composition evidence]
src/app/(app)/layout.tsx:14:      <MobileHeader />
src/app/(app)/layout.tsx:15:      <AppHeader className="hidden md:block" />
src/app/(app)/layout.tsx:1:import { AppHeader } from "@/components/app/app-header";
src/app/(app)/layout.tsx:20:          {children}
src/app/(app)/layout.tsx:23:          <RightRail />
src/app/(app)/layout.tsx:26:      <BottomNav />
src/app/(app)/layout.tsx:27:      <ChatBubble />
src/app/(app)/layout.tsx:2:import { BottomNav } from "@/components/app/bottom-nav";
src/app/(app)/layout.tsx:3:import { ChatBubble } from "@/components/app/chat-bubble";
src/app/(app)/layout.tsx:4:import { MobileHeader } from "@/components/app/mobile-header";
src/app/(app)/layout.tsx:5:import { RightRail } from "@/components/app/right-rail";
src/app/layout.tsx:1:import type { Metadata } from "next";
src/app/layout.tsx:25:        <ThemeProvider
src/app/layout.tsx:2:import { Geist } from "next/font/google";
src/app/layout.tsx:32:          {children}
src/app/layout.tsx:33:          <Toaster />
src/app/layout.tsx:3:import { ThemeProvider } from "@/components/theme-provider";
src/app/layout.tsx:4:import { Toaster } from "@/components/ui/sonner";
src/app/layout.tsx:5:import "./globals.css";
```

## discovery-components
```txt
DISCOVERY COMPONENTS

[Component inventory by folder]
folder: src/components
src/components/app/app-header.tsx
src/components/app/bottom-nav.tsx
src/components/app/chat-bubble.tsx
src/components/app/mobile-header.tsx
src/components/app/right-rail.tsx
src/components/legacy/social-mock/feed-list.tsx
src/components/legacy/social-mock/feed-skeleton.tsx
src/components/legacy/social-mock/home-composer.tsx
src/components/legacy/social-mock/post-card.tsx
src/components/legacy/social-mock/stories-row.tsx
src/components/styleguide/token-grid.tsx
src/components/theme-provider.tsx
src/components/theme-toggle.tsx
src/components/theme/theme-switch.tsx
src/components/ui/avatar.tsx
src/components/ui/badge.tsx
src/components/ui/button.tsx
src/components/ui/card.tsx
src/components/ui/dialog.tsx
src/components/ui/dropdown-menu.tsx
src/components/ui/input.tsx
src/components/ui/label.tsx
src/components/ui/select.tsx
src/components/ui/separator.tsx
src/components/ui/sheet.tsx
src/components/ui/skeleton.tsx
src/components/ui/sonner.tsx
src/components/ui/tabs.tsx
src/components/ui/textarea.tsx

folder: components
MISSING

folder: src/app/components
MISSING

folder: app/components
MISSING

[shadcn/ui candidates]
folder: src/components/ui
src/components/ui/avatar.tsx
src/components/ui/badge.tsx
src/components/ui/button.tsx
src/components/ui/card.tsx
src/components/ui/dialog.tsx
src/components/ui/dropdown-menu.tsx
src/components/ui/input.tsx
src/components/ui/label.tsx
src/components/ui/select.tsx
src/components/ui/separator.tsx
src/components/ui/sheet.tsx
src/components/ui/skeleton.tsx
src/components/ui/sonner.tsx
src/components/ui/tabs.tsx
src/components/ui/textarea.tsx

[Top 30 largest TSX files by line count in scope]
     378 src/components/app/mobile-header.tsx
     356 src/app/styleguide/page.tsx
     257 src/components/ui/dropdown-menu.tsx
     190 src/components/ui/select.tsx
     180 src/app/(app)/page.tsx
     158 src/components/ui/dialog.tsx
     143 src/components/ui/sheet.tsx
     126 src/components/app/right-rail.tsx
     119 src/app/(app)/kesfet/page.tsx
     109 src/app/(app)/galeri/galeri-filters.tsx
     109 src/components/ui/avatar.tsx
      92 src/components/ui/card.tsx
      91 src/app/(app)/piercing/page.tsx
      91 src/components/ui/tabs.tsx
      90 src/components/legacy/social-mock/post-card.tsx
      85 src/app/(app)/iletisim/page.tsx
      80 src/components/legacy/social-mock/feed-list.tsx
      79 src/components/styleguide/token-grid.tsx
      64 src/components/ui/button.tsx
      61 src/app/(app)/kesfet/[hub]/page.tsx
      56 src/app/(app)/artistler/page.tsx
      56 src/components/app/bottom-nav.tsx
      50 src/components/app/app-header.tsx
      49 src/components/legacy/social-mock/home-composer.tsx
      48 src/components/ui/badge.tsx
      47 src/components/legacy/social-mock/feed-skeleton.tsx
      40 src/components/ui/sonner.tsx
      39 src/components/legacy/social-mock/stories-row.tsx
      38 src/app/layout.tsx
      37 src/app/(app)/galeri/page.tsx
```

## discovery-services
```txt
DISCOVERY SERVICES

[Service/data-layer roots]
root: src/lib
src/lib/hub/hubs.v1.ts
src/lib/mock/categories.ts
src/lib/mock/enki.ts
src/lib/mock/feed.ts
src/lib/ui/metrics.ts
src/lib/utils.ts

root: lib
MISSING

root: src/services
MISSING

root: services
MISSING

root: src/api
MISSING

root: api
MISSING

root: src/server
MISSING

root: server
MISSING

root: src/app/api
MISSING

root: app/api
MISSING

[Network call evidence: fetch/axios/graphql/trpc]
UNKNOWN

[Server action evidence: use server]
UNKNOWN

[Data-fetch pattern summary]
local lib data imports detected:
  - ./src/app/(app)/galeri/galeri-filters.tsx:11:import { mainHubs, specialHubs, themeFilters } from "@/lib/hub/hubs.v1";
  - ./src/app/(app)/iletisim/page.tsx:18:} from "@/lib/mock/enki";
  - ./src/app/(app)/kesfet/[hub]/page.tsx:3:import { getHubBySlug, isValidHubSlug } from "@/lib/hub/hubs.v1";
  - ./src/app/(app)/kesfet/[hub]/page.tsx:4:import { whatsappUrl } from "@/lib/mock/enki";
  - ./src/app/(app)/kesfet/page.tsx:2:import { mainHubs, specialHubs } from "@/lib/hub/hubs.v1";
  - ./src/app/(app)/page.tsx:12:} from "@/lib/mock/enki";
  - ./src/app/(app)/page.tsx:5:import { mainHubs, specialHubs } from "@/lib/hub/hubs.v1";
  - ./src/app/(app)/piercing/page.tsx:1:import { piercingCategories } from "@/lib/hub/hubs.v1";
  - ./src/app/(app)/piercing/page.tsx:2:import { whatsappUrl } from "@/lib/mock/enki";
  - ./src/app/styleguide/page.tsx:24:import { feedItems } from "@/lib/mock/feed";
  - ./src/components/app/app-header.tsx:7:import { icon, iconBtn } from "@/lib/ui/metrics";
  - ./src/components/app/app-header.tsx:9:import { cn } from "@/lib/utils";
  - ./src/components/app/bottom-nav.tsx:6:import { cn } from "@/lib/utils";
  - ./src/components/app/mobile-header.tsx:19:import { cn } from "@/lib/utils";
  - ./src/components/app/mobile-header.tsx:35:import { mainHubs, specialHubs } from "@/lib/hub/hubs.v1";
  - ./src/components/app/mobile-header.tsx:36:import { whatsappUrl } from "@/lib/mock/enki";
  - ./src/components/app/mobile-header.tsx:37:import { icon, iconBtn } from "@/lib/ui/metrics";
  - ./src/components/app/right-rail.tsx:12:import { mainHubs } from "@/lib/hub/hubs.v1";
  - ./src/components/app/right-rail.tsx:17:} from "@/lib/mock/enki";
  - ./src/components/legacy/social-mock/feed-list.tsx:8:import type { FeedItem } from "@/lib/mock/feed";
  - ./src/components/legacy/social-mock/home-composer.tsx:6:import { whatsappUrl } from "@/lib/mock/enki";
  - ./src/components/legacy/social-mock/post-card.tsx:7:import type { FeedItem } from "@/lib/mock/feed";
  - ./src/components/legacy/social-mock/post-card.tsx:8:import { cn } from "@/lib/utils";
  - ./src/components/legacy/social-mock/stories-row.tsx:4:import { storyItems, type StoryItem } from "@/lib/mock/feed";
  - ./src/components/legacy/social-mock/stories-row.tsx:5:import { cn } from "@/lib/utils";
  - ./src/components/styleguide/token-grid.tsx:4:import { cn } from "@/lib/utils";
  - ./src/components/ui/avatar.tsx:6:import { cn } from "@/lib/utils"
  - ./src/components/ui/badge.tsx:5:import { cn } from "@/lib/utils"
  - ./src/components/ui/button.tsx:5:import { cn } from "@/lib/utils"
  - ./src/components/ui/card.tsx:3:import { cn } from "@/lib/utils"
  - ./src/components/ui/dialog.tsx:7:import { cn } from "@/lib/utils"
  - ./src/components/ui/dropdown-menu.tsx:7:import { cn } from "@/lib/utils"
  - ./src/components/ui/input.tsx:3:import { cn } from "@/lib/utils"
  - ./src/components/ui/label.tsx:6:import { cn } from "@/lib/utils"
  - ./src/components/ui/select.tsx:7:import { cn } from "@/lib/utils"
  - ./src/components/ui/separator.tsx:6:import { cn } from "@/lib/utils"
  - ./src/components/ui/sheet.tsx:7:import { cn } from "@/lib/utils"
  - ./src/components/ui/skeleton.tsx:1:import { cn } from "@/lib/utils"
  - ./src/components/ui/tabs.tsx:7:import { cn } from "@/lib/utils"
  - ./src/components/ui/textarea.tsx:3:import { cn } from "@/lib/utils"
```

## discovery-routes
```txt
DISCOVERY ROUTES
scope_include: src/**/*, app/**/*, pages/**/*, components/**/*, lib/**/*
scope_exclude: docs/**, scripts/**, public/**, *.md, *.txt, node_modules, .next, dist, build, coverage, .git

[App Router entry files under app/ and src/app/]
base: app
none found (directory missing)

base: src/app
src/app/(app)/artistler/page.tsx
src/app/(app)/book/page.tsx
src/app/(app)/explore/page.tsx
src/app/(app)/galeri/page.tsx
src/app/(app)/gallery/page.tsx
src/app/(app)/iletisim/page.tsx
src/app/(app)/kesfet/[hub]/page.tsx
src/app/(app)/kesfet/page.tsx
src/app/(app)/layout.tsx
src/app/(app)/page.tsx
src/app/(app)/piercing/page.tsx
src/app/(app)/profile/page.tsx
src/app/layout.tsx
src/app/styleguide/page.tsx

[Pages Router files under pages/ and src/pages/]
base: pages
none found (directory missing)

base: src/pages
none found (directory missing)

[Route Map]
LAYOUT_SCOPE / <= src/app/(app)/layout.tsx
LAYOUT_SCOPE / <= src/app/layout.tsx
PAGE / <= src/app/(app)/page.tsx
PAGE /artistler <= src/app/(app)/artistler/page.tsx
PAGE /book <= src/app/(app)/book/page.tsx
PAGE /explore <= src/app/(app)/explore/page.tsx
PAGE /galeri <= src/app/(app)/galeri/page.tsx
PAGE /gallery <= src/app/(app)/gallery/page.tsx
PAGE /iletisim <= src/app/(app)/iletisim/page.tsx
PAGE /kesfet <= src/app/(app)/kesfet/page.tsx
PAGE /kesfet/[hub] [dynamic] <= src/app/(app)/kesfet/[hub]/page.tsx
PAGE /piercing <= src/app/(app)/piercing/page.tsx
PAGE /profile <= src/app/(app)/profile/page.tsx
PAGE /styleguide <= src/app/styleguide/page.tsx

[Next redirects evidence]
6:      { source: "/book", destination: "/iletisim", permanent: true },
7:      { source: "/explore", destination: "/kesfet", permanent: true },
8:      { source: "/gallery", destination: "/galeri", permanent: true },
9:      { source: "/profile", destination: "/artistler", permanent: true },
```

## discovery-references
```txt
DISCOVERY REFERENCES
patterns: <Link ... href=, href="/...", router.push/replace, redirect/permanentRedirect

./src/app/(app)/artistler/page.tsx:48:                <Link href={`/galeri?artist=${artist.id}`}>İşlerini gör</Link>
./src/app/(app)/book/page.tsx:4:  redirect("/iletisim");
./src/app/(app)/explore/page.tsx:4:  redirect("/kesfet");
./src/app/(app)/galeri/galeri-filters.tsx:50:    router.push(`/galeri?${next.toString()}`);
./src/app/(app)/galeri/galeri-filters.tsx:54:    router.push("/galeri");
./src/app/(app)/gallery/page.tsx:4:  redirect("/galeri");
./src/app/(app)/kesfet/[hub]/page.tsx:45:          <Link href={`/galeri?style=${styleParam}`}>Galeri&apos;de gör</Link>
./src/app/(app)/kesfet/page.tsx:81:          href="/piercing"
./src/app/(app)/page.tsx:107:          href="/piercing"
./src/app/(app)/page.tsx:135:            <Link href="/galeri" className="gap-2">
./src/app/(app)/page.tsx:173:          <Link href="/iletisim" className="gap-2">
./src/app/(app)/page.tsx:45:            <Link href="/kesfet" className="gap-2">
./src/app/(app)/profile/page.tsx:4:  redirect("/artistler");
./src/components/app/app-header.tsx:19:        <Link href="/" className="flex shrink-0 flex-col leading-tight">
./src/components/app/mobile-header.tsx:190:                    href="/iletisim"
./src/components/app/mobile-header.tsx:240:          href="/"
./src/components/app/mobile-header.tsx:339:            <Link href="/iletisim">
./src/components/app/mobile-header.tsx:82:      router.push("/");
./src/components/app/right-rail.tsx:120:            <Link href="/kesfet">Tümünü keşfet</Link>
./src/components/app/right-rail.tsx:83:            <Link href="/iletisim" className="inline-flex items-center">
```

## Questions / Missing Info
- UNKNOWN: no 'use server' server actions found in scope
- UNKNOWN: no fetch/axios/graphql/trpc usage found in scope
- UNKNOWN: tailwind.config.* not found (may be CSS-first Tailwind setup)
- missing app router root: app
- missing component folder: app/components
- missing component folder: components
- missing component folder: src/app/components
- missing include root: app
- missing include root: components
- missing include root: lib
- missing include root: pages
- missing pages router root: pages
- missing pages router root: src/pages
- missing service root: api
- missing service root: app/api
- missing service root: lib
- missing service root: server
- missing service root: services
- missing service root: src/api
- missing service root: src/app/api
- missing service root: src/server
- missing service root: src/services
