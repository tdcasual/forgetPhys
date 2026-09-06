# Asset cleanup log

## 2026-09-06 — draft / REJECT / ARCHIVED / legacy 3D

**Action:** move (not delete) into `assets/_archive/2026-09-06/`.  
Assets live under physics-game (`physics-chronicle/assets` → symlink).

| Item | From | To |
|---|---|---|
| `city-manchester-draft-ai.png` | `assets/bg/` | `_archive/2026-09-06/bg/` |
| `lab-coupland-draft-ai.png` | `assets/bg/` | `_archive/2026-09-06/bg/` |
| `lodge-night-draft-ai.png` | `assets/bg/` | `_archive/2026-09-06/bg/` |
| `map-europe-draft-ai.png` | `assets/bg/` | `_archive/2026-09-06/bg/` |
| `lab-coupland-monitor-REJECT.png` | `assets/bg/` | `_archive/2026-09-06/bg/` |
| `plate-glimpse-atom-draft-ai.png` | `assets/atlas/plates/` | `_archive/2026-09-06/atlas/` |
| `_draft-parchment-dialog-eastasia-REJECT.png` | `assets/ui/` | `_archive/2026-09-06/ui/` |
| `char-companion/` | `assets/chars/` | `_archive/2026-09-06/chars/` |
| `char-weiguang-ARCHIVED/` | `assets/chars/` | `_archive/2026-09-06/chars/` |
| `idle-pretty-draft-archived.png` | `assets/chars/char-geiger/` | `_archive/2026-09-06/chars/` |
| Rutherford `_rejected_*` dirs | `assets/chars/char-rutherford/` | `_archive/2026-09-06/chars/char-rutherford/` |
| Watson edwardian rejects / NO-CHAIR | `outfits/edwardian-1909/` | `_archive/2026-09-06/outfits/` |
| `gold_foil_stage.gltf` + `.bin` | `assets/props/gold-foil-stage/` | `_archive/2026-09-06/props/gold-foil-stage/` |

READMEs left at:

- `assets/chars/README-ARCHIVE.md`
- `assets/bg/README-ARCHIVE.md`
- `assets/props/gold-foil-stage/README.md`
- `assets/chars/char-watson/outfits/edwardian-1909/README.md`
- `assets/_archive/2026-09-06/README.md`

Runtime must not load archived paths. Watson = `char-watson`; lab instruments = 2D props (`znS-*`, `alpha-source-*`).
