# 物理编年图志 / Physics Chronicle

Web monorepo for chapter 1, P0: Manchester atlas → Coupland Street laboratory → α scattering → short sourced dialogue.

## Run

```bash
pnpm install
pnpm dev
```

Vite serves `apps/web` at http://localhost:5173. Click the Coupland Street node to hard-cut into the venue.

## Layout

```
apps/web/src/{app,modes/atlas,modes/venue,camera,dialogue,characters}
packages/{lab-core,content,ui}
docs/          architecture, brief, style bible
assets/        art kit (symlink; keep it)
```

| Package | Role |
|---|---|
| `@physics-chronicle/lab-core` | Pure TS `LabPlugin`. `mc-scattering` steps particles and returns a crude histogram. No three / Rapier. |
| `@physics-chronicle/content` | Zod schemas + Manchester / Coupland Street JSON. `ClaimMeta.source_tier`: `textbook` \| `primary` \| `secondary` \| `interpretation`. |
| `@physics-chronicle/ui` | Paper dialogue. `interpretation` claims show the 演绎 badge. |
| `@physics-chronicle/web` | Vite + React + TS + R3F. One canvas. `CameraDirector` mask hard-cut (200–400 ms) ortho atlas ↔ perspective venue. |

## Historical constraint

Rutherford, *Phil. Mag.* **21** (1911) 669–688, argues for a concentrated **central charge**. That paper does **not** use the word *nucleus*. Period talk uses “central charge / minute positively electrified body.” Textbook copy may say 核式结构. Late “cannon-shell through tissue paper” talk is `interpretation` (D) and must show the badge.

## P0 / not P0

**In:** one atlas node, one venue, mc-scattering viz, short dialogue, CameraDirector cut, zod content.

**Out:** Rapier teaching the scatter, VRM performance, multi-city stroll, flying the camera across projections.

See `docs/adr/0001-p0-architecture.md` and `docs/CHAPTER1_BRIEF.md`.
