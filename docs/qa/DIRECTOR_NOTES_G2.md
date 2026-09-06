# Director notes — Manchester G2 (2026-09-06)

Per `SPRITE_PIPELINE_REVISED.md` + SCENE_QA_GATE §5 amendment.

## Implemented (runtime)
- Dialogue default **bust** + venue lit variants (`__lab-left` / `__lodge-right`); latest Rutherford bust (less temple grey).
- **方案 B** L/R smaller bust slots; shared contact line (~lower 1/3); `?debug=contact` overlay.
- **Name UI:** Ren'Py parchment **namebox** on dialogue (卢瑟福/华生). Chest `top:55%` overlay **disabled** (FAIL).
- Player-visible **P0** strings stripped from Manchester dialogue.
- Desk occluder code kept but **`ENABLE_DESK_OCCLUDER=false`** — not final G2 strategy.

## G2 status
| ID | Status | Notes |
|---|---|---|
| G2.1 | **PASS** | Bust path; no feet on chair/table |
| G2.2 | **PASS** (bust path) | No CSS chair composite; sit-baked = art follow-up |
| G2.3 | **DEFER** | Occluder not final; prefer sit-with-chair or L/R bust |
| G2.4 | **PASS** | Watson bust; not floating sit without chair |

## Shots
- `shots/qa/lab-coupland-runtime-clean.png`
- `shots/qa/lab-coupland-runtime-contact.png`
- `shots/qa/lodge-night-runtime-clean.png`
- `shots/qa/lodge-night-runtime-contact.png`

## Art still needed for full G2 clear
- Optional sit-with-chair baked sprites + bg chair removal (方案 A)
- Optional tiny chest badge (bbox-anchored) — not required for name UX

## 2026-09-06 user reject — lodge sit-baked scale FAIL
- Sit-with-chair at bust-slot height made chairs look ON the desk.
- **Path chosen:** bust L/R for **both** lab and lodge (`preferSitBaked` → false).
- sit-baked requires scene-matched scale; wrong scale FAIL — re-enable only with room-scale art + floor anchor below desk.
- QA shots: `shots/qa/lodge-night-runtime-fixed.png`, `shots/qa/lab-coupland-runtime-v3.png`

