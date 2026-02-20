#!/usr/bin/env zsh
emulate -LR zsh
set -euo pipefail

OUT_DIR="docs/output"
mkdir -p "$OUT_DIR"

SUMMARY="$OUT_DIR/repo-discovery.md"

DISC="$OUT_DIR/discovery.txt"
TREE="$OUT_DIR/discovery-sitemap-tree.txt"
ROUTES="$OUT_DIR/discovery-route.txt"
REFS="$OUT_DIR/discovery-references.txt"
STYLE="$OUT_DIR/discovery-styleguide.txt"
LAYOUT="$OUT_DIR/discovery-layout.txt"
COMP="$OUT_DIR/discovery-components.txt"
SERV="$OUT_DIR/discovery-services.txt"

have() { command -v "$1" >/dev/null 2>&1; }
hr() { printf '%s\n' "--------------------------------------------------------------------------------"; }

safe_find() {
  # safe_find <base> <find-args...>
  local base="$1"; shift
  [[ -d "$base" ]] || return 0
  find "$base" "$@" \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/coverage/*" \
    -not -path "*/.git/*"
}

rg_or_grep() {
  # rg_or_grep <pattern> <glob>
  local pattern="$1"
  local glob="$2"
  if have rg; then
    rg -n --hidden \
      --glob "$glob" \
      --glob '!**/node_modules/**' \
      --glob '!**/.next/**' \
      --glob '!**/dist/**' \
      --glob '!**/build/**' \
      --glob '!**/coverage/**' \
      --glob '!**/.git/**' \
      "$pattern" .
  else
    grep -RIn \
      --exclude-dir=node_modules \
      --exclude-dir=.next \
      --exclude-dir=dist \
      --exclude-dir=build \
      --exclude-dir=coverage \
      --exclude-dir=.git \
      -E "$pattern" .
  fi
}

# ---------------- discovery (genel) ----------------
{
  echo "ENKI TATTO — Repo Discovery (Auto)"
  echo "Generated: $(date)"
  hr
  echo "PWD: $(pwd)"
  echo "Git: $(have git && echo yes || echo no)"
  echo "rg: $(have rg && echo yes || echo no)"
  echo "tree: $(have tree && echo yes || echo no)"
  hr

  echo "[Top-level map]"
  ls -la
  hr

  if [[ -f package.json ]] && have node; then
    echo "[package.json summary]"
    node - <<'NODE' 2>/dev/null || true
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json","utf8"));
console.log("name:", pkg.name || "(none)");
console.log("private:", !!pkg.private);
console.log("type:", pkg.type || "(commonjs)");
console.log("\n[scripts]");
for (const [k,v] of Object.entries(pkg.scripts || {})) console.log(`- ${k}: ${v}`);
const deps = Object.assign({}, pkg.dependencies||{}, pkg.devDependencies||{});
const keys = ["next","react","react-dom","tailwindcss","typescript","zod","@radix-ui/react-dialog","@radix-ui/react-popover","@radix-ui/react-slot"];
console.log("\n[key deps]");
for (const k of keys) if (deps[k]) console.log(`- ${k}: ${deps[k]}`);
NODE
  fi
} > "$DISC"

# ---------------- discovery-sitemap tree ----------------
{
  echo "SITEMAP / TREE"
  echo "Generated: $(date)"
  hr
  if have tree; then
    tree -a -I "node_modules|.next|dist|build|coverage|.git" -L 6 .
  else
    echo "tree not installed. Fallback: find -maxdepth 6"
    hr
    find . -maxdepth 6 \
      -not -path "*/node_modules/*" \
      -not -path "*/.next/*" \
      -not -path "*/dist/*" \
      -not -path "*/build/*" \
      -not -path "*/coverage/*" \
      -not -path "*/.git/*" \
      -print | sort
  fi
} > "$TREE"

# ---------------- discovery-route ----------------
{
  echo "ROUTES (Next.js App Router / Pages Router)"
  echo "Generated: $(date)"
  hr

  if [[ -d app ]]; then
    echo "[App Router entry files: app/**/(page|route).*]"
    hr
    safe_find app -type f \( -name "page.*" -o -name "route.*" \) | sort
    hr
    echo "[App Router layouts: app/**/layout.*]"
    hr
    safe_find app -type f -name "layout.*" | sort
    hr
  else
    echo "No app/ directory found."
    hr
  fi

  if [[ -d pages ]]; then
    echo "[Pages Router: pages/**/*.(js|jsx|ts|tsx)]"
    hr
    safe_find pages -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) | sort
    hr
  else
    echo "No pages/ directory found."
    hr
  fi

  echo "[API endpoints (heuristic)]"
  hr
  [[ -d app/api ]] && safe_find app/api -type f -name "route.*" | sort || true
  [[ -d pages/api ]] && safe_find pages/api -type f \( -name "*.js" -o -name "*.ts" \) | sort || true
} > "$ROUTES"

# ---------------- discovery-references (internal paths) ----------------
{
  echo "INTERNAL PATH REFERENCES (href / Link / router.push / redirect)"
  echo "Generated: $(date)"
  hr
  rg_or_grep '(<Link[^>]+href=|\bhref=|router\.push\(|router\.replace\(|\bredirect\(|\bpermanentRedirect\(|navigate\(|to="/)' '*'
} > "$REFS"

# ---------------- discovery-styleguide ----------------
{
  echo "STYLEGUIDE DISCOVERY (tokens/theme/typography)"
  echo "Generated: $(date)"
  hr

  echo "[Tailwind / PostCSS configs]"
  hr
  setopt NULL_GLOB
  ls -la tailwind.config.* postcss.config.* 2>/dev/null || true
  unsetopt NULL_GLOB
  hr

  echo "[Global/theme css candidates]"
  hr
  safe_find . -type f \( -iname "*globals*.css" -o -iname "*theme*.css" -o -iname "*tokens*.css" -o -iname "*variables*.css" \) | sort
  hr

  echo "[Token patterns: :root, --vars, @theme, oklch]"
  hr
  rg_or_grep '(:root\b|--[a-zA-Z0-9_-]+\s*:|@theme\b|oklch\()' '*.{css,scss,ts,tsx,js,jsx,mjs,cjs}'
  hr

  echo "[Fonts: next/font, @font-face, font-family]"
  hr
  rg_or_grep '(next/font|@font-face\b|font-family\b)' '*.{css,scss,ts,tsx,js,jsx}'
} > "$STYLE"

# ---------------- discovery-layout ----------------
{
  echo "LAYOUT DISCOVERY (Header/Footer/Nav/Shell/Providers)"
  echo "Generated: $(date)"
  hr

  echo "[layout files]"
  hr
  safe_find app -type f -name "layout.*" | sort
  hr

  echo "[Header/Footer/Navbar/Sidebar/AppShell keywords]"
  hr
  rg_or_grep '\b(Header|Footer|Navbar|NavBar|Sidebar|AppShell|Shell|Topbar|BottomBar)\b' '*.{ts,tsx,js,jsx}'
  hr

  echo "[Providers]"
  hr
  rg_or_grep '\b(Providers|Provider|ThemeProvider|AuthProvider|SessionProvider)\b' '*.{ts,tsx,js,jsx}'
} > "$LAYOUT"

# ---------------- discovery-components ----------------
{
  echo "COMPONENTS DISCOVERY (inventory)"
  echo "Generated: $(date)"
  hr

  echo "[component folders]"
  hr
  for d in src/components components app/components; do
    if [[ -d "$d" ]]; then
      echo "## $d"
      safe_find "$d" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) | sort
      hr
    fi
  done

  echo "[shadcn/ui hint: components/ui]"
  hr
  if [[ -d src/components/ui ]]; then
    safe_find src/components/ui -type f -name "*.tsx" | sort
  elif [[ -d components/ui ]]; then
    safe_find components/ui -type f -name "*.tsx" | sort
  else
    echo "components/ui not detected"
  fi
  hr

  echo "[Largest TSX files (top 30 by lines)]"
  hr
  safe_find . -type f -name "*.tsx" -exec wc -l {} \; 2>/dev/null | sort -nr | head -n 30
} > "$COMP"

# ---------------- discovery-services ----------------
{
  echo "SERVICES DISCOVERY (api clients, fetchers, server actions)"
  echo "Generated: $(date)"
  hr

  echo "[service-ish folders]"
  hr
  for d in src/services services src/lib lib src/api api src/server server src/app/api app/api; do
    if [[ -d "$d" ]]; then
      echo "## $d"
      safe_find "$d" -type f | sort
      hr
    fi
  done

  echo "[network calls: fetch/axios/graphql/trpc]"
  hr
  rg_or_grep '\b(fetch\(|axios\.|graphql\b|urql\b|apollo\b|trpc\b)\b' '*.{ts,tsx,js,jsx}'
  hr

  echo "[Next Server Actions heuristic: use server]"
  hr
  rg_or_grep '["'\''"]use server["'\''"]' '*.{ts,tsx}'
} > "$SERV"

# ---------------- repo-discovery.md (tek parça) ----------------
{
  echo "# ENKI TATTO — Repo Discovery Output"
  echo
  echo "- Generated: $(date)"
  echo "- Repo: \`$(pwd)\`"
  echo

  echo "## discovery"
  echo '```txt'; cat "$DISC"; echo '```'; echo

  echo "## discovery-sitemap tree"
  echo '```txt'; cat "$TREE"; echo '```'; echo

  echo "## discovery-styleguide"
  echo '```txt'; cat "$STYLE"; echo '```'; echo

  echo "## discovery-layout"
  echo '```txt'; cat "$LAYOUT"; echo '```'; echo

  echo "## discovery-components"
  echo '```txt'; cat "$COMP"; echo '```'; echo

  echo "## discovery-services"
  echo '```txt'; cat "$SERV"; echo '```'; echo

  echo "## discovery-route"
  echo '```txt'; cat "$ROUTES"; echo '```'; echo

  echo "## discovery-references"
  echo '```txt'; cat "$REFS"; echo '```'; echo
} > "$SUMMARY"

echo "✅ OK: output folder -> $OUT_DIR"
echo "✅ OK: summary file  -> $SUMMARY"
