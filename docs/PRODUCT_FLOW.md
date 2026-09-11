# Product flow — pure 2D shell (default)

Status: Locked · pure-2D default **2026-09-06** · M4 cleanup **2026-09-07**  
Spatial modes (runtime): `worldMap2d` → `chroniclePlate` → `cityPage` → `venue2d` → `labEmbed`  
Debate overlay: `debateMode` / `debateSession` (does **not** replace spatial modes)  
ADR note: ADR-0002 named the early trio `worldMap` \| `chroniclePlate` \| `venue`; **default shipping shell is 2D** (ids below).

## Default player flow (pure 2D)

```
worldMap2d  --(select Manchester)-->  chroniclePlate  --(Continue)-->  cityPage
                                                                      |
                                                                      v
                                                              venue2d (Coupland)
                                                                      |
                                                                      v
                                                         labEmbed (Infinitas)  [optional]
```

1. **Start** on **worldMap2d** — DOM/Canvas destiny map (选择命运之地). Pick Manchester.
2. Hard-cut to **chroniclePlate** — full-screen chapter illustration 《窥见原子》(paper / woodcut / copperplate). **Not a map.**
3. Confirm → **cityPage** (city nodes / venue pick).
4. Enter **venue2d** — Coupland lab or lodge; scripted dialogue + optional DebateSession overlay.
5. From lab venue, open **labEmbed** (Infinitas α-scattering) via postMessage contract; return to venue2d.

**Lab return (VN-lab-03):** On `closeLab`, scripted dialogue jumps to the first line whose `id` equals `labEmbed.returnLineId` or starts with `labEmbed.returnLineIdPrefix` (default `mcr-ret-`) in `venues[].dialogue`, else in optional `dialogueAfterLab`. If neither has landed yet, the current index is kept. QA deep-link `?line=` accepts a numeric index or a line id (e.g. `mcr-ret-1`).

Leave venue → prefer **cityPage** / **chroniclePlate**, then back to **worldMap2d**.

## Naming

| Mode id | UI name (CN) | What it is |
|---|---|---|
| **worldMap2d** | 世界地图 / 选择命运之地 | Opening destiny geography (2D). Select Manchester. |
| **chroniclePlate** | 章节图志 / 图志 | **After** city chosen — chapter illustration. **Not a map.** P0: 《窥见原子》. |
| **cityPage** | 城市页 | City / venue picker between plate and venue. |
| **venue2d** | 场所 | Coupland lab / lodge (dialogue + debate overlay + MC entry). |
| **labEmbed** | 实验台 | Infinitas (or fallback) embed; not a GameMode replacement — overlay / route from venue. |

Deprecated phrase:「图志 = 地图封面」. 图志 = **ChroniclePlate** (fate-book page), not the opening map.  
Deprecated mode id: `atlas`.

## Legacy 3D (deprecated — not default)

Early spikes used R3F **worldMap** / **venue** 3D cameras (ADR-0002 language). Those paths may remain in-repo as **legacy / non-default**. Do **not** document or ship 3D Atlas/Venue as the primary shell. New work targets the pure-2D chain above.

## Camera / presentation (2D default)

- **worldMap2d**: DOM/Canvas map; no R3F requirement for default path.
- **chroniclePlate**: DOM fullscreen plate (`assets/atlas/plates/…`).
- **cityPage**: DOM city layout.
- **venue2d**: 2D venue composite + dialogue HUD.
- **labEmbed**: iframe / embed; see [`LABEMBED_POSTMESSAGE.md`](./LABEMBED_POSTMESSAGE.md).

## Debate modes (overlay on Venue2D) — Spec v3 (2026-09-07)

ForgetPhys keeps a single shell; debate is a **DebateSession** layer on venue (not a SillyTavern fork). Spec **v3**: **LiteLLM gateway locked**; **`debateMode`**: `scripted` | `free` | `hard`; **`debateSession`**: `off` | `active` (overlay — does **not** replace `debateMode`; shell `GameMode` stays spatial only). Vercel AI SDK → **BFF** → LiteLLM (keys server-only) — BFF **Accepted** in [`docs/adr/0003-debate-bff.md`](./adr/0003-debate-bff.md) (`apps/web` internal proxy; 游戏架构 + 游戏设计). CriticPolicy, labEmbed→slot, session SM — architecture §§12–18.

| Mode | CN | Summary |
|---|---|---|
| scripted | 常规 | Existing authored dialogue (`manchester.json` claims) |
| free | 自由 | Persona LLM + FactStore / EraOpinionStore; cite-or-retry; ghost board only |
| hard | Hard · 证据槽 | Fill N of M evidence slots + CriticPolicy; Judge = rules |

Director SoT (CN): **`docs/DEBATE_SCHEME_V3.md`**.  
UX wireframes: **`docs/DEBATE_UX.md`**.  
Full architecture (EN, v3): **`docs/DEBATE_ARCHITECTURE.md`**.  
BFF ADR: **`docs/adr/0003-debate-bff.md`** (Accepted).  
GroundedReply prompts: **`docs/GROUNDED_REPLY_PROMPTS.md`**.  
LabEmbed postMessage: **`docs/LABEMBED_POSTMESSAGE.md`**.  
Progress save: **`docs/PROGRESS_SAVE_SCHEMA.md`**.  
Student quota (draft): **`docs/STUDENT_LLM_QUOTA.md`**.  
Card schema: **`docs/DEBATE_CONTENT_SCHEMA.md`**.  
Debate package API sketch: **`docs/DEBATE_PACKAGE_API.md`**.  
Scripted authoring: **`docs/SCRIPTED_DIALOGUE_AUTHORING.md`**.  
Coupland α Hard slots: **`docs/HARD_EVIDENCE_SLOTS_ALPHA.md`**.  
Design gaps checklist: **`docs/DESIGN_GAPS.md`**.  
Card drafts: `packages/content/src/debate/`.  
Catalog: **`docs/DOCS_INDEX.md`**.

## Related docs

- `docs/STYLE_BIBLE.md` — WorldMap vs ChroniclePlate visual rows
- `docs/adr/0002-product-modes.md` — early mode rename (see legacy 3D note above)
- `docs/adr/0001-p0-architecture.md` — base P0 architecture
