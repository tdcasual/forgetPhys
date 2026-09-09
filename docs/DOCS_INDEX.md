# ForgetPhys docs index

Status: Catalog · 2026-09-07  
Tree: `docs/` (+ `adr/`, `debate/`, `qa/`, `github-examples/`, `refs/`)  
Debate director **SoT** → [`DEBATE_SCHEME_V3.md`](./DEBATE_SCHEME_V3.md)（EN architecture SoT → [`DEBATE_ARCHITECTURE.md`](./DEBATE_ARCHITECTURE.md)）  
Gaps checklist → [`DESIGN_GAPS.md`](./DESIGN_GAPS.md)

Legend: **SoT** = current source of truth · **archive** = superseded / historical entry · **gate** = mandatory checklist · **draft** = proposed

---

## Product

| Doc | Role |
|---|---|
| [`PRODUCT_FLOW.md`](./PRODUCT_FLOW.md) | **SoT** — pure-2D shell flow + debate overlay blurb (M4) |
| [`DESIGN_GAPS.md`](./DESIGN_GAPS.md) | **draft** — filled vs open design checklist |
| [`BRAND.md`](./BRAND.md) | Brand notes |
| [`CHAPTER1_BRIEF.md`](./CHAPTER1_BRIEF.md) | Ch1 product brief |
| [`2D_SCENE_LIST.md`](./2D_SCENE_LIST.md) | 2D scene inventory |
| [`PROP_LAYOUT.md`](./PROP_LAYOUT.md) | Prop layout |
| [`p0-art-decisions.md`](./p0-art-decisions.md) | P0 art decision log |
| [`P0_ART_LIST.md`](./P0_ART_LIST.md) | P0 art list |

---

## Architecture

| Doc | Role |
|---|---|
| [`adr/0001-p0-architecture.md`](./adr/0001-p0-architecture.md) | **SoT** — P0 executable architecture (Accepted) |
| [`adr/0002-product-modes.md`](./adr/0002-product-modes.md) | **SoT** — early `worldMap` \| `chroniclePlate` \| `venue` (Accepted; default shell = 2D — see PRODUCT_FLOW) |
| [`adr/0003-debate-bff.md`](./adr/0003-debate-bff.md) | **SoT** — Debate BFF = `apps/web` internal proxy (**Accepted** 2026-09-07) |
| [`LLM_KEY_PATH.md`](./LLM_KEY_PATH.md) | **SoT** — B1 key path (SPA → BFF → LiteLLM) |
| [`STUDENT_LLM_QUOTA.md`](./STUDENT_LLM_QUOTA.md) | **draft** — turn/token caps; class key vs BYOK; offline fallback |
| [`GROUNDED_REPLY_PROMPTS.md`](./GROUNDED_REPLY_PROMPTS.md) | **SoT** — P2 GroundedReply prompt assembly + JSON cite schema |
| [`LABEMBED_POSTMESSAGE.md`](./LABEMBED_POSTMESSAGE.md) | **SoT** — Infinitas postMessage contract (from Architecture §16) |
| [`PROGRESS_SAVE_SCHEMA.md`](./PROGRESS_SAVE_SCHEMA.md) | **draft** — unlock / debateSession / EvidenceBoard save sketch |
| [`ASSET_SOURCE_OF_TRUTH.md`](./ASSET_SOURCE_OF_TRUTH.md) | Asset SoT pointer |
| [`STYLE_BIBLE.md`](./STYLE_BIBLE.md) | Visual / presentation bible |

---

## Debate

| Doc | Role |
|---|---|
| [`DEBATE_SCHEME_V3.md`](./DEBATE_SCHEME_V3.md) | **SoT** — CN director actionable Spec v3 |
| [`DEBATE_ARCHITECTURE.md`](./DEBATE_ARCHITECTURE.md) | **SoT** — EN full architecture Spec v3 |
| [`DEBATE_UX.md`](./DEBATE_UX.md) | **SoT** — DebateSession UX wireframes / inventory |
| [`DEBATE_CONTENT_SCHEMA.md`](./DEBATE_CONTENT_SCHEMA.md) | **SoT** — Persona / Fact / EraOpinion / HardSlots JSON shapes (Zod P1a) |
| [`DEBATE_PACKAGE_API.md`](./DEBATE_PACKAGE_API.md) | **draft** — `packages/debate` TypeScript interfaces (types only) |
| [`COPY_AGENT_CHARTER.md`](./COPY_AGENT_CHARTER.md) | 文案叙事 agent 职责 · 先卡+先声后文 |
| [`VOICE_STYLE_REFS.md`](./VOICE_STYLE_REFS.md) | 对话写法范本（伽利略对话等技法） |
| [`COPY_DEAI_SOURCES.md`](./COPY_DEAI_SOURCES.md) | 去 AI 味 GitHub 来源 + 本地 skill |
| [`SCRIPTED_DIALOGUE_AUTHORING.md`](./SCRIPTED_DIALOGUE_AUTHORING.md) | Thin guide — `manchester.json` claims / badges / interpretation |
| [`STUDENT_LLM_QUOTA.md`](./STUDENT_LLM_QUOTA.md) | **draft** — student cost / quota (also under Architecture) |
| [`GROUNDED_REPLY_PROMPTS.md`](./GROUNDED_REPLY_PROMPTS.md) | **SoT** — GroundedReply prompts (also under Architecture) |
| [`LABEMBED_POSTMESSAGE.md`](./LABEMBED_POSTMESSAGE.md) | **SoT** — labEmbed postMessage (also under Architecture) |
| [`PROGRESS_SAVE_SCHEMA.md`](./PROGRESS_SAVE_SCHEMA.md) | Progress / EvidenceBoard save sketch |
| [`DESIGN_GAPS.md`](./DESIGN_GAPS.md) | Filled vs open debate/product gaps |
| [`DEBATE_SCHEME_REFINED.md`](./DEBATE_SCHEME_REFINED.md) | **archive** — v2 director summary → points to V3 |
| [`DEBATE_AUDIT_2026-09-07.md`](./DEBATE_AUDIT_2026-09-07.md) | Audit after B1/B2 lock |
| [`HARD_EVIDENCE_SLOTS_ALPHA.md`](./HARD_EVIDENCE_SLOTS_ALPHA.md) | **SoT** — Coupland α six slots |
| [`HARD_CRITIC_CLAIMS_ALPHA.md`](./HARD_CRITIC_CLAIMS_ALPHA.md) | **SoT** — stance Critic claims → slots |
| [`debate/README.md`](./debate/README.md) | Pointer to content cards + debate docs |
| [`debate/persona-era-peer-1909.json`](./debate/persona-era-peer-1909.json) | Mirror / sample persona (canonical under packages) |

### packages/content/src/debate（卡片 JSON SoT）

| File | Role |
|---|---|
| `packages/content/src/debate/persona-rutherford-1909.json` | Rutherford persona |
| `packages/content/src/debate/persona-watson.json` | Watson persona |
| `packages/content/src/debate/persona-era-peer-1909.json` | Era Critic (stance default) |
| `packages/content/src/debate/era-opinions-1909-atomic.json` | EraOpinionStore cards |
| `packages/content/src/debate/facts-alpha-scattering-1909.json` | FactStore cards |
| `packages/content/src/debate/hard-slots-alpha-1909.json` | Hard EvidenceBoard slot defs |

Scripted dialogue SoT: `packages/content/src/data/manchester.json` → [`SCRIPTED_DIALOGUE_AUTHORING.md`](./SCRIPTED_DIALOGUE_AUTHORING.md)

---

## Art gates

| Doc | Role |
|---|---|
| [`ART_GATES_INDEX.md`](./ART_GATES_INDEX.md) | **SoT** — gate index |
| [`UI_GATE.md`](./UI_GATE.md) | **gate** — parchment UI U1–U5 |
| [`SCENE_QA_GATE.md`](./SCENE_QA_GATE.md) | **gate** — venue composite G1–G8 |
| [`BACKGROUND_AUTH_GATE.md`](./BACKGROUND_AUTH_GATE.md) | **gate** — building auth B1–B6 |
| [`MAP_GATE.md`](./MAP_GATE.md) | **gate** — destiny map M1–M4 |
| [`STYLE_UNIFY_GATE.md`](./STYLE_UNIFY_GATE.md) | **gate** — cross-layer skin S1–S3 |
| [`LICENSE_ART_GATE.md`](./LICENSE_ART_GATE.md) | **gate** — license L1–L3 |
| [`WATSON_ERA_OUTFIT_GATE.md`](./WATSON_ERA_OUTFIT_GATE.md) | **gate** — Watson era outfits W1–W6 |
| [`INSTRUMENT_AUTH_GATE.md`](./INSTRUMENT_AUTH_GATE.md) | **gate** — instrument auth I1–I8 |
| [`CHAR_CONSISTENCY_CONSTRAINTS.md`](./CHAR_CONSISTENCY_CONSTRAINTS.md) | Char likeness constraints |
| [`COMPANION_WATSON_NAMEPLATE.md`](./COMPANION_WATSON_NAMEPLATE.md) | Watson nameplate |
| [`SPRITE_PIPELINE_REVISED.md`](./SPRITE_PIPELINE_REVISED.md) | Bust / sit scale pipeline |
| [`ART_ENHANCEMENT.md`](./ART_ENHANCEMENT.md) | Enhancement roadmap |
| [`ART_SCORECARD.md`](./ART_SCORECARD.md) | Scorecard baseline |
| [`ART_SCORE_PLAN.md`](./ART_SCORE_PLAN.md) | Ten-dimension score plan |
| [`ART_PIPELINE_AUDIT.md`](./ART_PIPELINE_AUDIT.md) | Pipeline audit |
| [`ART_TOOLING.md`](./ART_TOOLING.md) | LFS / Actions / Comfy tooling |
| [`AUDIT_2D_PRESENTATION.md`](./AUDIT_2D_PRESENTATION.md) | 2D presentation audit |
| [`ASSET_CLEANUP_LOG.md`](./ASSET_CLEANUP_LOG.md) | Cleanup log |
| [`art-provenance.md`](./art-provenance.md) | Provenance log |
| [`GITHUB_ART_BOARD.md`](./GITHUB_ART_BOARD.md) | GitHub Projects art board |
| [`INSTRUMENT_ORIENT_AUDIT.md`](./INSTRUMENT_ORIENT_AUDIT.md) | Instrument orientation audit |

---

## Chapter1

| Doc | Role |
|---|---|
| [`CHAPTER1_BRIEF.md`](./CHAPTER1_BRIEF.md) | Ch1 brief (also under Product) |
| [`HARD_EVIDENCE_SLOTS_ALPHA.md`](./HARD_EVIDENCE_SLOTS_ALPHA.md) | Coupland Hard slots |
| [`HARD_CRITIC_CLAIMS_ALPHA.md`](./HARD_CRITIC_CLAIMS_ALPHA.md) | Critic claims map |
| [`SCRIPTED_DIALOGUE_AUTHORING.md`](./SCRIPTED_DIALOGUE_AUTHORING.md) | manchester.json authoring |
| `qa/SCENE_QA_lab-coupland.md` | Coupland scene QA |
| `qa/SCENE_QA_lodge-night.md` | Lodge night QA |
| `qa/style-unify-ch1-checklist.md` | Ch1 style unify checklist |

---

## QA

| Doc | Role |
|---|---|
| [`qa/SCENE_QA_CHECKLIST.md`](./qa/SCENE_QA_CHECKLIST.md) | Scene QA master checklist |
| [`qa/SCENE_QA_lab-coupland.md`](./qa/SCENE_QA_lab-coupland.md) | Coupland |
| [`qa/SCENE_QA_lodge-night.md`](./qa/SCENE_QA_lodge-night.md) | Lodge night |
| [`qa/INSTRUMENT_QA_CHECKLIST.md`](./qa/INSTRUMENT_QA_CHECKLIST.md) | Instrument QA |
| [`qa/style-unify-ch1-checklist.md`](./qa/style-unify-ch1-checklist.md) | Style unify Ch1 |
| [`qa/score-p1-gap-inventory.md`](./qa/score-p1-gap-inventory.md) | Score P1 gaps |
| [`qa/score-p1-temp-list.md`](./qa/score-p1-temp-list.md) | Score P1 temp list |
| [`qa/DIRECTOR_NOTES_G2.md`](./qa/DIRECTOR_NOTES_G2.md) | Director notes G2 |
| [`SCENE_QA_GATE.md`](./SCENE_QA_GATE.md) | Gate doc (linked from Art gates) |

---

## Tooling

| Doc | Role |
|---|---|
| [`ART_TOOLING.md`](./ART_TOOLING.md) | Art tooling |
| [`github-examples/validate-art.yml`](./github-examples/validate-art.yml) | Example Actions workflow |
| [`GITHUB_ART_BOARD.md`](./GITHUB_ART_BOARD.md) | Projects board setup |
| `refs/2d/*` · `refs/worldmap/*` | Visual reference images (not prose SoT) |

---

## Quick debate map

```
DEBATE_SCHEME_V3 (CN SoT)
    ├── DEBATE_ARCHITECTURE (EN SoT)
    ├── DEBATE_UX (wireframes)
    ├── DEBATE_CONTENT_SCHEMA (card JSON shapes)
    ├── DEBATE_PACKAGE_API (packages/debate types)
    ├── SCRIPTED_DIALOGUE_AUTHORING (manchester.json)
    ├── STUDENT_LLM_QUOTA (draft caps)
    ├── DESIGN_GAPS (filled vs open)
    ├── adr/0003-debate-bff (Accepted · apps/web proxy)
    ├── LLM_KEY_PATH (B1)
    ├── GROUNDED_REPLY_PROMPTS (P2 prompt SoT)
    ├── LABEMBED_POSTMESSAGE (§16 standalone)
    ├── PROGRESS_SAVE_SCHEMA (unlocks / fills)
    ├── HARD_*_ALPHA (slots + claims)
    ├── debate/README → packages/content/src/debate/*
    └── DEBATE_SCHEME_REFINED (archive → V3)
```

- `DEBATE_UI_REDESIGN.md` — Hard 案卷拖牌 UI + era skins
- `adr/0006-i18n-locale.md` — locale + dialogue language switch
