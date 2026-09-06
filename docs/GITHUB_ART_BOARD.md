# ForgetPhys · GitHub 美术看板


How to create and operate the art progress board for physics-chronicle.

## Create the Project

1. On the GitHub repo (or org): **Projects** → **New project** → **Board**.
2. Name: **美术进度**
3. Set visibility to match the repo (private if the repo is private).

## Columns (aligned to gates)

Create these columns left → right:

| Column | Meaning |
|--------|---------|
| `Backlog` | Accepted need; not started |
| `史料卡` | Provenance / history card in progress (B/I gates) |
| `出图中` | Generating / drawing (FaceID, Comfy, hand paint) |
| `并排QA` | Side-by-side QA vs canon / refs |
| `导演过检` | Director review (scene G gates, framing) |
| `PASS/入库` | Checklist PASS; landed under `assets/` |
| `精修` | Post-PASS polish (non-blocking polish queue) |

Move cards only forward unless a gate fails — then return to `出图中` or `史料卡` with a `gate-block` label.

## Issue fields (use Art asset template)

Open issues with **Art asset** template (`.github/ISSUE_TEMPLATE/art-asset.yml`):

- **Asset path** — e.g. `assets/chars/char-rutherford/_canon/face.png`
- **Gate IDs** — `B` background · `I` instrument · `W` Watson outfit · `S` style · `U` UI · `M` map · `G` scene QA
- **Era** — e.g. `manchester-1909`, `edwardian-1909`
- **Owner** — artist handle

## Labels

Create if missing:

- `art` — any art work
- `char` / `bg` / `prop` / `map` / `ui` — kind
- `gate-block` — failed a mandatory gate; do not merge / do not PASS

## Seed issue title examples (Ch1 Manchester)

- `[art][char] char-rutherford/_canon/face.png — lock FaceID`
- `[art][char] char-watson/outfits/edwardian-1909/stand__idle.png`
- `[art][bg] bg/manchester-lab-1909/final.png — B+G gates`
- `[art][prop] props/znS-scintillation-screen-1909 — I gate + card.md`
- `[art][prop] props/alpha-source-geometry-1909 — I gate`
- `[art][ui] dialogue panel chrome — U1–U5`
- `[art][map] atlas europe plate Ch1 — M1–M4`

## Related

- Gates index: [`ART_GATES_INDEX.md`](./ART_GATES_INDEX.md)
- Tooling umbrella: [`ART_TOOLING.md`](./ART_TOOLING.md)
