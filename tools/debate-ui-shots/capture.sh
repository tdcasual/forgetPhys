#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/shots/debate-ui"
REF="$ROOT/docs/refs/debate-ui/p1b"
UD="$ROOT/.chrome-ud"
mkdir -p "$OUT" "$REF" "$UD"
BASE="${1:-http://127.0.0.1:5173}"
shot() {
  local name="$1" url="$2"
  google-chrome --headless --disable-gpu --no-sandbox --disable-dev-shm-usage \
    --disable-crash-reporter --user-data-dir="$UD" --window-size=1280,800 \
    --screenshot="$OUT/$name" "$url" >/dev/null
  echo "wrote $OUT/$name"
}
# P1b baseline
shot 01-empty-dossier.png "$BASE/?harness=debate-ui&state=empty"
shot 02-filed-2-stamps.png "$BASE/?harness=debate-ui&state=filed2"
shot 03-persuaded.png "$BASE/?harness=debate-ui&state=persuaded"
# P1b.1 hierarchy
shot 11-hierarchy-empty.png "$BASE/?harness=debate-ui&state=empty"
shot 12-hierarchy-filed2.png "$BASE/?harness=debate-ui&state=filed2"
# P1b.2 polish
shot 21-p1b2-empty.png "$BASE/?harness=debate-ui&state=empty"
shot 22-p1b2-filed2.png "$BASE/?harness=debate-ui&state=filed2"
cp -f "$OUT"/01-empty-dossier.png "$OUT"/02-filed-2-stamps.png "$OUT"/03-persuaded.png \
  "$OUT"/11-hierarchy-empty.png "$OUT"/12-hierarchy-filed2.png \
  "$OUT"/21-p1b2-empty.png "$OUT"/22-p1b2-filed2.png \
  "$REF/"
