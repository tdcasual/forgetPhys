#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/shots/debate-ui"
UD="$ROOT/.chrome-ud"
mkdir -p "$OUT" "$UD"
BASE="${1:-http://127.0.0.1:5173}"
shot() {
  local name="$1" url="$2"
  google-chrome --headless --disable-gpu --no-sandbox --disable-dev-shm-usage \
    --disable-crash-reporter --user-data-dir="$UD" --window-size=1400,900 \
    --screenshot="$OUT/$name" "$url" >/dev/null
  echo "wrote $OUT/$name"
}
shot 01-empty-dossier.png "$BASE/?harness=debate-ui&state=empty"
shot 02-filed-2-stamps.png "$BASE/?harness=debate-ui&state=filed2"
shot 03-persuaded.png "$BASE/?harness=debate-ui&state=persuaded"
cp -f "$OUT"/01-empty-dossier.png "$OUT"/02-filed-2-stamps.png "$OUT"/03-persuaded.png \
  "$ROOT/docs/refs/debate-ui/p1b/"
