<!-- pure-2D 2026-09-06 -->
# Product flow — three stages (locked)

Status: Locked (2026-09-06)  
Modes (ADR-002): `worldMap` | `chroniclePlate` | `venue`

## Naming

| Code mode | UI name (CN) | What it is |
|---|---|---|
| **worldMap** | 世界地图 / 选择命运之地 | Pre-story 3D Europe destiny geography (GoT-titles camera grammar later; science motifs). Select Manchester. |
| **chroniclePlate** | 章节图志 / 图志 | **After** story/city chosen — full-screen fixed-style **chapter illustration** (paper / woodcut / copperplate). **Not a map.** P0: 《窥见原子》 / Manchester α-scattering. |
| **venue** | 场所 | Existing Coupland Street lab (dialogue + MC scattering). |

Deprecated: mode id `atlas` and the phrase「图志 = 地图封面」. 图志 now means **ChroniclePlate** (fate-book page), not the opening map.

## Player flow

```
WorldMap  --(select Manchester)-->  ChroniclePlate  --(Continue)-->  Venue
    ^                                      |                          |
    +---------(返回世界地图)---------------+                          |
                                           <----(返回章节图志, prefer)-+
```

1. **Start** on WorldMap (3D terrain). HUD: 选择命运之地 / 世界地图.
2. Unlock node Manchester → open 《窥见原子》 → hard-cut to **ChroniclePlate**.
3. Plate shows title, short fate blurb, art; user confirms → hard-cut to **Venue**.
4. Leave venue → prefer **ChroniclePlate**, then back to WorldMap from the plate.

## Camera / presentation

- **worldMap**: R3F perspective terrain (CameraDirector world camera).
- **chroniclePlate**: DOM fullscreen plate (`assets/atlas/plates/…`); no map geometry required.
- **venue**: existing lab camera + session.

## Related docs

- `docs/STYLE_BIBLE.md` — WorldMap vs ChroniclePlate visual rows
- `docs/adr/0002-product-modes.md` — mode rename lock
- `docs/adr/0001-p0-architecture.md` — base P0 architecture


## Pure 2D (2026-09-06)
Modes: `worldMap2d` → `chroniclePlate` → `cityPage` → `venue2d` → `labEmbed(Infinitas)`.
3D Atlas/Venue retained only as legacy; default shell is DOM/Canvas 2D.
