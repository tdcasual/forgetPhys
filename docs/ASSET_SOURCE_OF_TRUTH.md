# Asset source of truth

| Tree | Role |
|---|---|
| **`/workspace/physics-chronicle`** | **Canonical** product + docs + content + web app + `assets/` |
| **GitHub** | https://github.com/tdcasual/forgetPhys |

`assets/` is a **real directory** in this repo (materialized from the former `physics-game` mirror; `_archive/` / `_downloads/` stay local-only via `.gitignore`). Large images go through **Git LFS** (see `.gitattributes`).

## What to edit where

- **Code / JSON / Zod / Vite app:** this tree only  
- **PNG / prop cards / char outfits / bg finals:** `assets/` here (LFS)  
- **Gate docs (`UI_GATE`, `SCENE_QA`, …):** `docs/` in this repo  

## Local-only paths (not pushed)

```
assets/_archive/
assets/_downloads/
```

## Validate

```bash
cd /workspace/physics-chronicle
node scripts/validate-art-assets.mjs
```

## Optional box mirror

If a sibling `/workspace/physics-game` still exists for art iteration:

```bash
rsync -a --delete \
  --exclude '_archive/' \
  --exclude '_downloads/' \
  /workspace/physics-chronicle/assets/ /workspace/physics-game/assets/
```
