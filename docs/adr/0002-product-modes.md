# ADR 0002 — Product modes: worldMap | chroniclePlate | venue

Status: Accepted (2026-09-06)
Author: 游戏架构

## Decision
Lock `GameMode` to three values:

- `worldMap` — opening destiny geography (3D Europe terrain)
- `chroniclePlate` — post-selection chapter illustration (图志); not a map
- `venue` — Coupland Street lab (unchanged)

**Deprecate** mode id `atlas` and the semantic「图志 = 地图封面」. Migrate call sites to `worldMap` / `chroniclePlate`. Flow: WorldMap → (select Manchester) → ChroniclePlate → Venue; return prefers plate then world map.

## Consequences
- CameraDirector: perspective terrain only for `worldMap`; plate is DOM/fullscreen art; venue camera unchanged.
- HUD opening copy: 选择命运之地 / 世界地图.
- See `docs/PRODUCT_FLOW.md`.
