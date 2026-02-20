#!/usr/bin/env bash
# Check that src/ does not contain raw palette classes (gray, zinc, slate, neutral, stone, white, black as color).
# Semantic tokens only (bg-background, text-foreground, border-border, etc.) are allowed.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if command -v rg >/dev/null 2>&1; then
  # Match palette-like classes in src (excluding semantic tokens)
  # Pattern: bg-white, bg-black, bg-gray-*, text-gray-*, border-gray-*, zinc-*, slate-*, neutral-*, stone-*
  FOUND=$(rg -n --no-heading \
    -e 'bg-white\b' -e 'bg-black\b' -e 'text-white\b' -e 'text-black\b' \
    -e 'bg-gray-[a-z0-9-]+' -e 'text-gray-[a-z0-9-]+' -e 'border-gray-[a-z0-9-]+' \
    -e 'bg-zinc-[a-z0-9-]+' -e 'text-zinc-[a-z0-9-]+' -e 'border-zinc-[a-z0-9-]+' \
    -e 'bg-slate-[a-z0-9-]+' -e 'text-slate-[a-z0-9-]+' -e 'border-slate-[a-z0-9-]+' \
    -e 'bg-neutral-[a-z0-9-]+' -e 'text-neutral-[a-z0-9-]+' -e 'border-neutral-[a-z0-9-]+' \
    -e 'bg-stone-[a-z0-9-]+' -e 'text-stone-[a-z0-9-]+' -e 'border-stone-[a-z0-9-]+' \
    src/ 2>/dev/null || true)
  if [ -n "$FOUND" ]; then
    echo "check-no-palette: forbidden palette classes found in src/:"
    echo "$FOUND"
    exit 1
  fi
else
  echo "check-no-palette: ripgrep (rg) not found; skip. Install rg to enable this check."
fi
echo "check-no-palette: ok (no forbidden palette classes in src/)"
exit 0
