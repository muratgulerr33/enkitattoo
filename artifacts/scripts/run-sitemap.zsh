cd /Users/apple/dev/enkitattoo || exit 1

emulate -L zsh
setopt NO_NOMATCH
set -euo pipefail

OUT_DIR="docs/output"
OUT_FILE="$OUT_DIR/README.md"
APP_DIR="src/app"

mkdir -p "$OUT_DIR"

# 1) README'yi baştan oluştur (overwrite)
cat > "$OUT_FILE" <<'MD'
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

MD

# 2) Route listesi + tree aynı dosyaya ekle
{
  echo
  echo "- Generated at (UTC): $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  echo "- Source: $APP_DIR"
  echo

  echo "## Routes (Public UI)"
  echo '```txt'
  node - <<'NODE'
const fs = require("fs");
const path = require("path");

const APP_DIR = path.join(process.cwd(), "src", "app");

// Ayarlar: neleri hariç tutacağız?
const EXCLUDE_DIR_PREFIXES = ["_", "."];
const EXCLUDE_DIR_NAMES = new Set([
  "api",
  "styleguide", // internal
  "node_modules",
]);
const EXCLUDE_PARALLEL_PREFIX = "@"; // parallel routes
const EXCLUDE_FILES = new Set([
  "layout.tsx","layout.ts","layout.jsx","layout.js",
  "error.tsx","error.ts","error.jsx","error.js",
  "not-found.tsx","not-found.ts","not-found.jsx","not-found.js",
  "loading.tsx","loading.ts","loading.jsx","loading.js",
  "template.tsx","template.ts","template.jsx","template.js",
  "route.ts","route.js", // API routes
  "sitemap.ts","sitemap.js",
  "robots.ts","robots.js",
]);

function isGroupSegment(seg) {
  return seg.startsWith("(") && seg.endsWith(")");
}
function segToUrl(seg) {
  // dynamic: [id] -> :id, [...slug] -> *slug, [[...slug]] -> *slug?
  if (/^\[\[\.\.\.(.+)\]\]$/.test(seg)) return `*${seg.match(/^\[\[\.\.\.(.+)\]\]$/)[1]}?`;
  if (/^\[\.\.\.(.+)\]$/.test(seg)) return `*${seg.match(/^\[\.\.\.(.+)\]$/)[1]}`;
  if (/^\[(.+)\]$/.test(seg)) return `:${seg.match(/^\[(.+)\]$/)[1]}`;
  return seg;
}

function walk(dirAbs, relParts = []) {
  const ents = fs.readdirSync(dirAbs, { withFileTypes: true });
  for (const ent of ents) {
    const name = ent.name;
    if (ent.isDirectory()) {
      if (name.startsWith(EXCLUDE_PARALLEL_PREFIX)) continue;
      if (EXCLUDE_DIR_PREFIXES.some(p => name.startsWith(p))) continue;
      if (EXCLUDE_DIR_NAMES.has(name)) continue;
      walk(path.join(dirAbs, name), relParts.concat([name]));
      continue;
    }
    if (!ent.isFile()) continue;
    if (EXCLUDE_FILES.has(name)) continue;

    // page.* => route
    if (/^page\.(tsx|ts|jsx|js)$/.test(name)) {
      const parts = relParts.filter(p => !isGroupSegment(p));
      // exclude internal styleguide even if nested
      if (parts.includes("styleguide")) continue;

      const urlParts = parts.map(segToUrl);
      const route = "/" + urlParts.join("/");
      console.log(route === "/" ? "/" : route.replace(/\/+/g, "/"));
    }
  }
}

if (!fs.existsSync(APP_DIR)) {
  console.error("ERROR: src/app not found:", APP_DIR);
  process.exit(1);
}

const routes = [];
// collect by intercepting console.log is overkill; easiest: run walk to stdout then re-sort outside.
// Instead: capture stdout by collecting.
function collectWalk(dirAbs, relParts = []) {
  const ents = fs.readdirSync(dirAbs, { withFileTypes: true });
  for (const ent of ents) {
    const name = ent.name;
    if (ent.isDirectory()) {
      if (name.startsWith(EXCLUDE_PARALLEL_PREFIX)) continue;
      if (EXCLUDE_DIR_PREFIXES.some(p => name.startsWith(p))) continue;
      if (EXCLUDE_DIR_NAMES.has(name)) continue;
      collectWalk(path.join(dirAbs, name), relParts.concat([name]));
      continue;
    }
    if (!ent.isFile()) continue;
    if (EXCLUDE_FILES.has(name)) continue;

    if (/^page\.(tsx|ts|jsx|js)$/.test(name)) {
      const parts = relParts.filter(p => !isGroupSegment(p));
      if (parts.includes("styleguide")) continue;

      const urlParts = parts.map(segToUrl);
      const route = "/" + urlParts.join("/");
      routes.push(route === "/" ? "/" : route.replace(/\/+/g, "/"));
    }
  }
}
collectWalk(APP_DIR);

const uniq = Array.from(new Set(routes)).sort((a,b) => a.localeCompare(b, "en"));
for (const r of uniq) console.log(r);
console.log("");
console.log(`Total: ${uniq.length}`);
NODE
  echo '```'
  echo

  echo "## Route Tree"
  echo '```txt'
  node - <<'NODE'
const fs = require("fs");
const path = require("path");

const APP_DIR = path.join(process.cwd(), "src", "app");
const EXCLUDE_DIR_PREFIXES = ["_", "."];
const EXCLUDE_DIR_NAMES = new Set(["api","styleguide","node_modules"]);
const EXCLUDE_PARALLEL_PREFIX = "@";
const EXCLUDE_FILES = new Set([
  "layout.tsx","layout.ts","layout.jsx","layout.js",
  "error.tsx","error.ts","error.jsx","error.js",
  "not-found.tsx","not-found.ts","not-found.jsx","not-found.js",
  "loading.tsx","loading.ts","loading.jsx","loading.js",
  "template.tsx","template.ts","template.jsx","template.js",
  "route.ts","route.js",
  "sitemap.ts","sitemap.js",
  "robots.ts","robots.js",
]);

function isGroupSegment(seg) {
  return seg.startsWith("(") && seg.endsWith(")");
}
function segToUrl(seg) {
  if (/^\[\[\.\.\.(.+)\]\]$/.test(seg)) return `*${seg.match(/^\[\[\.\.\.(.+)\]\]$/)[1]}?`;
  if (/^\[\.\.\.(.+)\]$/.test(seg)) return `*${seg.match(/^\[\.\.\.(.+)\]$/)[1]}`;
  if (/^\[(.+)\]$/.test(seg)) return `:${seg.match(/^\[(.+)\]$/)[1]}`;
  return seg;
}

function collectRoutes() {
  const routes = [];
  function walk(dirAbs, relParts = []) {
    const ents = fs.readdirSync(dirAbs, { withFileTypes: true });
    for (const ent of ents) {
      const name = ent.name;
      if (ent.isDirectory()) {
        if (name.startsWith(EXCLUDE_PARALLEL_PREFIX)) continue;
        if (EXCLUDE_DIR_PREFIXES.some(p => name.startsWith(p))) continue;
        if (EXCLUDE_DIR_NAMES.has(name)) continue;
        walk(path.join(dirAbs, name), relParts.concat([name]));
        continue;
      }
      if (!ent.isFile()) continue;
      if (EXCLUDE_FILES.has(name)) continue;

      if (/^page\.(tsx|ts|jsx|js)$/.test(name)) {
        const parts = relParts.filter(p => !isGroupSegment(p));
        if (parts.includes("styleguide")) continue;

        const urlParts = parts.map(segToUrl);
        const route = "/" + urlParts.join("/");
        routes.push(route === "/" ? "/" : route.replace(/\/+/g, "/"));
      }
    }
  }
  walk(APP_DIR);
  return Array.from(new Set(routes)).sort((a,b) => a.localeCompare(b, "en"));
}

function buildTrie(routes) {
  const root = { _end: false, kids: new Map() };
  for (const r of routes) {
    const parts = r === "/" ? [""] : r.split("/").filter(Boolean);
    let node = root;
    if (r === "/") { node._end = true; continue; }
    for (const p of parts) {
      if (!node.kids.has(p)) node.kids.set(p, { _end: false, kids: new Map() });
      node = node.kids.get(p);
    }
    node._end = true;
  }
  return root;
}

function printTrie(node, prefix = "", isRoot = true) {
  const entries = Array.from(node.kids.entries()).sort((a,b)=>a[0].localeCompare(b[0], "en"));
  entries.forEach(([key, child], idx) => {
    const last = idx === entries.length - 1;
    const branch = last ? "└─ " : "├─ ";
    const nextPrefix = prefix + (last ? "   " : "│  ");
    const label = key === "" ? "/" : key;
    console.log((isRoot ? "" : prefix) + branch + label + (child._end ? "" : ""));
    printTrie(child, nextPrefix, false);
  });
}

if (!fs.existsSync(APP_DIR)) {
  console.error("ERROR: src/app not found:", APP_DIR);
  process.exit(1);
}
const routes = collectRoutes();
console.log("/");
const trie = buildTrie(routes.filter(r => r !== "/"));
printTrie(trie, "", true);
NODE
  echo '```'
} >> "$OUT_FILE"

echo "✅ OK: sitemap keşfi yazıldı -> $OUT_FILE"
echo "ℹ️ Not: docs/output/ klasörü generated çıktıdır; canonical değildir."