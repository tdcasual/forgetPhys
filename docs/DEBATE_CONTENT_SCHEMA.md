# Debate content schema — cards under `packages/content/src/debate`

Status: **Design SoT (JSON shapes)** · 2026-09-07 · Zod runtime **not yet** in `packages/content` (**P1a required**)  
Canonical JSON: `packages/content/src/debate/`  
Related: [`DEBATE_ARCHITECTURE.md`](./DEBATE_ARCHITECTURE.md) §4–5 · [`DEBATE_SCHEME_V3.md`](./DEBATE_SCHEME_V3.md) · [`HARD_EVIDENCE_SLOTS_ALPHA.md`](./HARD_EVIDENCE_SLOTS_ALPHA.md) · [`HARD_CRITIC_CLAIMS_ALPHA.md`](./HARD_CRITIC_CLAIMS_ALPHA.md) · [`DEBATE_PACKAGE_API.md`](./DEBATE_PACKAGE_API.md)

> Scripted venue dialogue (`manchester.json`) uses a **different** Zod stack in `packages/content/src/schema.ts` — see [`SCRIPTED_DIALOGUE_AUTHORING.md`](./SCRIPTED_DIALOGUE_AUTHORING.md). This doc covers **debate cards only**.

---

## 1. File inventory

| File | Shape | Role |
|---|---|---|
| `persona-rutherford-1909.json` | PersonaCard | Lab chief / interlocutor |
| `persona-watson.json` | PersonaCard | Ally / essay mouthpiece |
| `persona-era-peer-1909.json` | PersonaCard (stance Critic) | Hard antagonist = 时代主流理解 |
| `facts-alpha-scattering-1909.json` | FactStore file | Fact cards (may fill slots) |
| `era-opinions-1909-atomic.json` | EraOpinionStore file | Era opinions (speech / challenge only) |
| `hard-slots-alpha-1909.json` | HardSlots file | Coupland α EvidenceBoard defs |

Mirror sample: `docs/debate/persona-era-peer-1909.json`.

---

## 2. Tier enums

### Fact / era card `tier` (debate stores)

| Value | Store | May fill Hard slots? |
|---|---|---|
| `primary` | FactStore | Yes (if linked) |
| `textbook` | FactStore | Yes (if linked) |
| `fact` | FactStore (alias / future) | Yes (if linked) |
| `era_opinion` | EraOpinionStore | **Never** |

### Scripted dialogue `claim.source_tier` (manchester — not debate cards)

`primary` \| `secondary` \| `textbook` \| `interpretation` — see authoring doc. Do not confuse with debate `tier`.

### Critic historiography `source_tier` on some era cards

Optional letter grades (e.g. `"C"`) on newer Critic foils — **historiography note**, not manchester `source_tier`. Always pair with `"fills_slots": false`.

---

## 3. PersonaCard

Card-V2-inspired single object (not a `{ cards: [] }` wrapper).

### Required / expected fields

| Field | Type | Notes |
|---|---|---|
| `id` | string | e.g. `persona-rutherford-1909` |
| `spec` | string | `"character-card-v2-inspired"` |
| `name` / `name_zh` | string | Display |
| `charId` | string \| `null` | Asset folder; stance Critic uses `null` |
| `description` | string | |
| `personality` | string | |
| `scenario` | string | |
| `system_prompt` | string | Injected for GroundedReply |
| `mes_example` | array | `{ user, assistant }[]` (may be `[]`) |
| `bans` | string[] | Hard-fail behaviours |
| `era` | string | e.g. `1909-1911` |
| `venue_tags` | string[] | Retriever filter |
| `modes` | `("free"\|"hard")[]` | Which debate modes load this persona |
| `default_stance` | string | Short stance id |

### Stance Critic extras (`persona-era-peer-1909`)

| Field | Example | Notes |
|---|---|---|
| `aliases` | `["persona-era-stance-1909"]` | Conceptual primary name |
| `form` | `"stance"` | Locked default antagonist form |
| `identity_locked` | `false` | Not a named historical person by default |
| `optional_named_skins_ref` | path/string | 考证 shortlist pointer |

### Snippet (ids only)

```json
{
  "id": "persona-era-peer-1909",
  "form": "stance",
  "charId": null,
  "identity_locked": false,
  "modes": ["hard"]
}
```

```json
{
  "id": "persona-rutherford-1909",
  "charId": "char-rutherford",
  "modes": ["free", "hard"]
}
```

---

## 4. FactStore file + FactCard

### File wrapper

| Field | Required | Notes |
|---|---|---|
| `id` | yes | e.g. `facts-alpha-scattering-1909` |
| `era` | yes | |
| `venue_tags` | yes | |
| `source_note` | optional | Provenance blurb |
| `cards` | yes | FactCard[] |

### FactCard

| Field | Required | Notes |
|---|---|---|
| `id` | yes | Stable cite id (`fact-gm1909-diffuse-reflection`) |
| `keys` | yes | Bilingual retriever keys |
| `content` / `content_zh` | yes | Immutable claim text |
| `year_range` | yes | `[start, end]` |
| `tier` | yes | `primary` \| `textbook` (… ) — **not** `era_opinion` |
| `citation` | yes | Short bibliographic string |

### Snippet

```json
{
  "id": "fact-gm1909-diffuse-reflection",
  "keys": ["large angle", "backscatter", "大角", "漫反射"],
  "tier": "primary",
  "year_range": [1909, 1909]
}
```

---

## 5. EraOpinionStore file + EraOpinionCard

### File wrapper

Same pattern as FactStore (`id`, `era`, `venue_tags`, `note`, `cards`).

### EraOpinionCard

| Field | Required | Notes |
|---|---|---|
| `id` | yes | e.g. `era-op-thomson-uniform-sphere` |
| `keys` | yes | |
| `content` / `content_zh` | yes | |
| `year_range` | yes | |
| `tier` | yes | **Must be** `era_opinion` |
| `citation` | optional | |
| `claim` | optional | Short challenge thesis (Critic foils) |
| `source_tier` | optional | Historiography grade (e.g. `C`) |
| **`fills_slots`** | **required on Critic foils; default false everywhere** | **Must be `false`** — era opinions **never** fill EvidenceBoard |

P1a Zod must default / enforce `fills_slots: false` for every `tier: era_opinion` card even when the field is omitted on older cards.

### Snippet

```json
{
  "id": "era-op-alpha-outer-layer",
  "tier": "era_opinion",
  "fills_slots": false,
  "claim": "α particles leave (or scatter from) the atom's outer layers…"
}
```

---

## 6. HardSlots file

| Field | Required | Notes |
|---|---|---|
| `id` | yes | `hard-slots-alpha-1909` |
| `title_zh` | yes | |
| `venue_id` | yes | e.g. `coupland-lab` |
| `docs` | optional | Pointer to human SoT |
| `win` | yes | See below |
| `slots` | yes | SlotDef[] |

### `win` object

| Field | Example | Notes |
|---|---|---|
| `M` / `N` | `6` / `4` | Need ≥ N of M filled |
| `require_critic_pass` | `true` | ≥1 CriticPolicy pass |
| `judge` | `"rules"` | Not LLM |
| `rewrite_chronicle_ending` | `false` | Locked |
| `suggested_turn_budget` | `12` | Aligns quota draft |
| `persuade_target` | `"era_peers_board"` | B2=A |
| `rutherford_is_win_object` | `false` | Locked |

### SlotDef

| Field | Required | Notes |
|---|---|---|
| `id` | yes | e.g. `slot-large-angle-exists` |
| `label_zh` | yes | |
| `what_counts` | yes | Human rule text |
| `linked_fact_ids` | yes | FactCard ids Critic accepts |
| `accepts_lab_embed` | yes | bool — whitelist still in postMessage doc |

### Snippet

```json
{
  "id": "slot-forward-majority",
  "linked_fact_ids": ["fact-gm1909-forward-majority"],
  "accepts_lab_embed": true
}
```

---

## 7. Future Zod (P1a required)

- Add Zod schemas under `packages/content` (e.g. `src/debate/schema.ts` or extend `schema.ts`) and validate on load.
- Fail visibly if cards fail parse (V3 P1a acceptance).
- Enforce: `era_opinion` ⇒ `fills_slots === false`; Fact tiers ≠ `era_opinion`; Hard slot `linked_fact_ids` reference known Fact ids (warn or error).
- Scripted `manchester.json` Zod **already exists** — do not overload it for debate cards without a separate schema export.

Until Zod lands, treat this markdown + the JSON files as the shape SoT.

---

## 8. Related paths

| Path | Role |
|---|---|
| `packages/content/src/debate/*` | Card JSON SoT |
| `docs/DEBATE_PACKAGE_API.md` | Runtime TS interfaces consuming these cards |
| `docs/HARD_CRITIC_CLAIMS_ALPHA.md` | Claim → slot map for Critic foils |
| `docs/debate/README.md` | Pointer hub |
