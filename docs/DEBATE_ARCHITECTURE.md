# Debate Architecture — ForgetPhys (physics-chronicle SoT)

Status: **Spec v3 · 2026-09-07** · LiteLLM gateway **locked** · **B1 + B2 + stance-critic locked** · H1 player propose-fill **design-locked**  
Runtime LLM code: **not implemented yet** — this document + content JSON only. BFF placement **Accepted** (`apps/web` internal proxy — [`adr/0003-debate-bff.md`](./adr/0003-debate-bff.md)); **do not code-dump** in docs batches.  
Shell: stay inside **ForgetPhys** (`physics-chronicle` web app). Debate is a `DebateSession` layer on Venue2D — **do not fork SillyTavern**.  
Director SoT (CN, actionable): [`docs/DEBATE_SCHEME_V3.md`](./DEBATE_SCHEME_V3.md).  
Prior director summary: `docs/DEBATE_SCHEME_REFINED.md` (points to V3).

---

## 1. Goals

| Goal | Detail |
|---|---|
| Three debate modes | 常规 scripted · 自由 free LLM · Hard evidence-slot |
| Grounded speech | Dual stores: `FactStore` vs `EraOpinionStore`; cite-or-retry |
| Fair win | **Judge is rules**, not an LLM “who argued better” score |
| Chronicle safety | Hard mode fills evidence slots; **does not rewrite** chronicle ending |
| Integration | Venue2D, Manchester content, Infinitas `labEmbed` results, IMA / kaozheng 考证库 |

Non-goals (P0): ST fork, full lorebook engine, multi-agent facilitator runtime, inventing lab numbers.

---

## 2. Three modes

| Mode | CN | Who speaks | Grounding | Win / exit |
|---|---|---|---|---|
| **scripted** | 常规 | Fixed dialogue from `manchester.json` (and chapter cards) | Claims already tagged `source_tier` / citation | Advance beats; no free LLM |
| **free** | 自由 | Persona LLM (Rutherford / Watson / …) with Retriever | Must cite Fact or EraOpinion card ids; cite-or-retry | Soft exit: player ends, or beat budget; optional EvidenceBoard preview |
| **hard** | Hard · 证据槽 | Same personas + CriticPolicy + EvidenceBoard + **Era Critic = stance default (B2=A)** | Slots fill only from FactStore (and approved labEmbed measurements); era opinions may color speech but **do not fill slots** | Fill **N of M** slots **and** pass one CriticPolicy check; Judge = rules; **win = persuade era understanding / peers / board — NOT Rutherford** |

Shared constraints across free + hard:

- No inventing facts (especially lab numbers, foil thicknesses, fractions like 1/8000 or 1/20000 without a card).
- Era opinions are allowed if **labeled** (`tier: era_opinion`) and never promoted to fact.
- Hard does **not** rewrite the chronicle plate ending or chapter fate text.

---

## 3. Shell placement (ForgetPhys)

```
ForgetPhys shell (apps/web)
  worldMap2d → chroniclePlate → cityPage → venue2d → labEmbed(Infinitas)
                                              │
                                              └── DebateSession (overlay / panel)
                                                    packages/debate/*  (future runtime)
                                                    packages/content/src/debate/*.json  (cards)
```

- **Venue2D** hosts dialogue + optional DebateSession entry (e.g. Coupland lab after or alongside scripted beats).
- **DebateSession** owns turn loop, mode flag, EvidenceBoard state, Judge outcome.
- Reuse existing character ids (`char-rutherford`, `char-watson`), outfits, and Venue props — do not stand up a separate ST app.
- SillyTavern / Character Card V2 / WorldInfo are **spec references only** (field shapes, activation ideas) — not a dependency.

---

## 4. Dual stores

```
┌─────────────────────┐     ┌──────────────────────────┐
│     FactStore       │     │    EraOpinionStore         │
│ tier: fact          │     │ tier: era_opinion          │
│       primary       │     │ year_range, era keys       │
│       textbook      │     │ may be wrong by modern std │
│ immutable claims    │     │ must be UI-labeled         │
│ cite → EvidenceBoard│     │ cite → speech color only   │
└─────────────────────┘     └──────────────────────────┘
```

| Rule | FactStore | EraOpinionStore |
|---|---|---|
| Can fill Hard slots? | Yes (linked fact ids) | **No** |
| Can appear in free/Hard speech? | Yes | Yes, if labeled |
| Invented numbers? | Forbidden | Forbidden (opinions without numbers still need a card) |
| Source | kaozheng / IMA / primary papers / textbook anchors | Contemporary mainstream 1909 framing (e.g. plum-pudding caution) |

**Cite-or-retry:** any free/Hard reply that asserts a measurable or historical claim must include one or more `cite: [cardId, …]` from Retriever hits. CriticPolicy rejects missing / mismatched cites → GroundedReply retries (bounded).

---

## 5. Module map (`packages/debate` — future runtime)

| Module | Role |
|---|---|
| **PersonaCard** | Load Card-V2-inspired JSON (name, description, personality, scenario, system_prompt, mes_example, bans, era, venue_tags) |
| **FactStore** | Index + fetch fact / primary / textbook cards |
| **EraOpinionStore** | Index + fetch era_opinion cards (year_range filtered) |
| **Retriever** | Query both stores by keys / venue / evidence slot; returns ranked card snippets for prompt |
| **GroundedReply** | LLM call + cite attachment + retry loop — prompts: [`GROUNDED_REPLY_PROMPTS.md`](./GROUNDED_REPLY_PROMPTS.md) |
| **EvidenceBoard** | Hard-mode slot state; links utterances / labEmbed results to slot fills |
| **CriticPolicy** | Deterministic checks: cites present, no banned invent, slot fill legality, mild consistency |
| **Judge** | Rules engine: `filledCount >= N` ∧ CriticPolicy pass → persuade win vs **era understanding / peers / board** (B2=A); never “LLM voted winner”; Rutherford is not the win object |

Content drafts live under `packages/content/src/debate/` (SoT JSON). Runtime package README stubs to `docs/DEBATE_ARCHITECTURE.md`.

---

## 6. Data flow — one turn (free / hard)

```
Player utterance (Venue2D DebateSession)
        │
        ▼
  Retriever(query, mode, era, venue_tags, open_slots?)
        │  hits: FactStore ∪ EraOpinionStore (+ optional labEmbed readout)
        ▼
  PersonaCard + system_prompt + bans + mes_example
        │
        ▼
  GroundedReply (LLM) ──► draft text + cite[]
        │
        ▼
  CriticPolicy
        │ fail → retry (max K) or speak “I don’t have a card for that”
        │ pass
        ▼
  [Hard only] EvidenceBoard.tryFill(cites, labEmbed)
        │
        ▼
  Judge.evaluate(board, policy)  → continue | persuaded | failed_budget
        │
        ▼
  UI: reply + labeled cites + board progress (Hard)
```

Scripted mode skips Retriever / GroundedReply / Judge and plays `manchester.json` dialogue with existing claim badges.

---

## 7. References (spec only — do not vendor)

| Ref | Use |
|---|---|
| **character-card-spec-v2** | Field names / shapes for Persona JSON |
| **SillyTavern WorldInfo** | Activation / key ideas for Retriever keys — not ST runtime |
| **Vellium LoreBook vs RAG** | Prefer structured cards + retrieval over dumping a whole lorebook into context |
| **vada-simulator** | Structured argument / claim simulation patterns |
| **argus-ai-debate** | Multi-turn debate UX / turn discipline patterns |
| **IMA / kaozheng** (`/workspace/kaozheng`) | Authoritative fact drafting; FactStore aligns to 考证卡 |

---

## 8. Implementation order

> **Spec v3 note:** Director actionable SoT is [`DEBATE_SCHEME_V3.md`](./DEBATE_SCHEME_V3.md) (role matrix, player propose-fill UX, BFF contract sketch, DebateSession lifecycle, P1a Coupland acceptance). This §8 remains the EN phase checklist; **no runtime code** until 游戏架构 ADR selects BFF placement (`apps/web` Vite/SSR route vs `apps/debate-proxy`).

### P0 — Docs + cards (this drop)

- [x] `docs/DEBATE_ARCHITECTURE.md`
- [x] `docs/DEBATE_SCHEME_V3.md` (director Spec v3)
- [x] Persona / era-opinion / fact JSON drafts
- [x] Hard evidence slots for α scattering
- [x] `PRODUCT_FLOW.md` pointer
- [ ] Zod schemas for cards (optional follow-up in `packages/content` — **required in P1a**)

### P1 — Session wiring (no full LLM polish)

Split recommended by audit (`DEBATE_AUDIT_2026-09-07.md`): **P1a** (no live LLM) then **P1b** (sidecar smoke).

**P1a (required):**

- DebateSession shell on Venue2D (mode switch UI; field name **`debateMode`**; modal overlay; pause/resume scripted beat)
- FactStore / EraOpinionStore loaders + Retriever (keyword; bilingual keys)
- EvidenceBoard UI + Judge rules for Coupland Hard (win = era peers / board 4/6)
- **Player propose-fill (H1)** — pick Fact card or attach last labEmbed → CriticPolicy → fill; EraPeer scripted challenge templates only (no veto)
- Wire Infinitas labEmbed readouts as candidate slot fillers (typed measurements only)
- **CriticPolicy for labEmbed / Fact fills** — deterministic fill legality even **without** live LLM (Hard + labEmbed needs Critic in P1)
- free = ghost EvidenceBoard preview only (never mutates fills)
- Zod schemas required for card loaders
- Acceptance checklist: see V3 §6 (Coupland only)

**P1b:**

- Stub GroundedReply client (Vercel AI SDK → **server proxy** → LiteLLM baseURL) + example `litellm_config.yaml` under `tools/litellm/` — **not** full multi-provider polish; browser must **not** hold `LITELLM_API_KEY`

### P2 — Grounded LLM

- Live GroundedReply + **full cite-or-retry** + CriticPolicy on LLM replies (fill Critic already in P1a)
- Persona prompts for Rutherford 1909 / Watson
- Free-mode clarifying questions; Hard mild devil’s advocate toggle (Watson default: ally); multi-NPC

---

## 9. Integration points

| Surface | How debate hooks in |
|---|---|
| **Venue2D** | Entry from Coupland lab / lodge; shares chars, props, outfit (`edwardian-1909`) |
| **Manchester content** | `packages/content/src/data/manchester.json` remains scripted SoT; debate cards complement, do not replace |
| **Infinitas labEmbed** | Experiment results (scattering counts / angles) may propose fills for linked slots after CriticPolicy validates shape |
| **IMA 考证库 / kaozheng** | Authors update FactStore from 考证卡; debate never invents past the library |

---

## 10. Safety

1. **No inventing facts** — especially numerical lab claims; refuse or retry without a FactStore cite.
2. **Era opinions allowed if labeled** — e.g. 1909 mainstream plum-pudding caution; UI badge `时代观点`.
3. **Hard does not rewrite chronicle ending** — persuade = EvidenceBoard + Judge vs **era understanding / peers / board** (B2=A); Rutherford ≠ win object; plate / fate copy stays authored.
4. **Bans on PersonaCards** — no modern nucleus jargon forced into 1909 speech unless textbook-mode narrator; prefer “central charge / 中心电荷”.
5. **Judge ≠ LLM** — no win-by-eloquence.

---

## 11. Related paths

| Path | Role |
|---|---|
| `docs/DEBATE_ARCHITECTURE.md` | This file (EN architecture SoT · Spec v3) |
| `docs/DEBATE_SCHEME_V3.md` | **Director SoT (CN, actionable Spec v3)** |
| `docs/DEBATE_SCHEME_REFINED.md` | Prior director summary → points to V3 |
| `docs/DEBATE_AUDIT_2026-09-07.md` | Next-phase + post-mode-lock self-audit (B1/B2 locked; P1a·P1b·P2) |
| `docs/LLM_KEY_PATH.md` | B1: ST vs ForgetPhys key path (keys never in browser) |
| `docs/HARD_EVIDENCE_SLOTS_ALPHA.md` | Coupland Hard slots + win rule (era peers / board) |
| `packages/content/src/debate/` | Persona, era-opinion, fact JSON |
| `packages/debate/README.md` | Runtime stub → docs |
| `docs/PRODUCT_FLOW.md` | Product flow + debate pointer |
| `packages/content/src/data/manchester.json` | Scripted venue dialogue |

---

## 12. LLM connection (not SillyTavern fork)

**Decision locked (2026-09-07):** **LiteLLM** is the OpenAI-compatible LLM gateway (provider-agnostic). ForgetPhys is **not** a SillyTavern fork. ST also speaks Chat Completions — same protocol family — but remains a **reference only** (client shape / Character Card field ideas), not a product shell or dependency.

| Piece | Role |
|---|---|
| **LiteLLM** | **Locked** gateway: OpenAI-compatible proxy; routes aliases → real upstream providers |
| **ForgetPhys app** | Owns `DebateSession` + **Vercel AI SDK** → **BFF / debate-proxy** → LiteLLM `baseURL`; **never** vendor SDKs in the app; **never** browser-held `LITELLM_API_KEY` (B1) |
| **SillyTavern** | External Chat Completions client pattern (`/v1`) — reference only; same protocol family |

### Deployment shapes

LiteLLM can be:

1. **(a) Sidecar** — Docker / local process next to the app for local/dev.
2. **(b) Remote URL** — students or school already host a LiteLLM (or compatible) endpoint; app points at it via env.

### Env (secrets never in repo)

| Variable | Purpose |
|---|---|
| `LITELLM_BASE_URL` | Preferred: LiteLLM proxy base URL (OpenAI-compatible, often `…/v1`) |
| `OPENAI_COMPATIBLE_BASE_URL` | Alias accepted if it points at the same LiteLLM gateway |
| `LITELLM_API_KEY` / `OPENAI_API_KEY` | Gateway/auth key via secret env / deployment secrets only |
| `LITELLM_MODEL` | Model **alias** (e.g. `forgetphys-debate`) — not a raw vendor model id in app code |

**Never commit** live keys, `.env` with credentials, or provider secrets. Placeholders only in example configs.


### Security · keys never in browser (**B1 LOCKED** 2026-09-07)

**Same family as SillyTavern:** ST = local/remote **Node server** serves UI; browser talks to ST; ST holds API keys and calls OpenAI/LiteLLM — browser never gets provider keys in normal setup.

**ForgetPhys locked shape:**

| Path | Who holds keys | Browser |
|---|---|---|
| **BFF (`apps/web` internal proxy)** — **Accepted** ADR-0003 | Server route under `apps/web` holds `LITELLM_API_KEY` and forwards to LiteLLM; separate `apps/debate-proxy` **deferred** until independent rate-limit / multi-client need | SPA calls **only** the BFF — no vendor / gateway master key in client bundle |
| **School-hosted LiteLLM** | LiteLLM authenticates via **session cookie / per-student token** (still no vendor key in SPA) | SPA may point at school URL with student auth only |

```
Browser (SPA / Vercel AI SDK client)
        │  no LITELLM_API_KEY
        ▼
BFF / debate-proxy  (or session-authed school LiteLLM)
        │  holds LITELLM_API_KEY (server env)
        ▼
LiteLLM gateway  →  upstream providers
```

- **Never** expose `LITELLM_API_KEY` / vendor keys via `VITE_*` or any client-visible env.
- P1 stub may mock locally; **P2 live path = server-side proxy → LiteLLM**.
- Short SoT: `docs/LLM_KEY_PATH.md`.

### BFF endpoint sketch (Spec v3)

Placement **Accepted** (ADR-0003): `apps/web` internal proxy. Pattern locked; separate `debate-proxy` deferred.

```
POST /api/debate/complete   (or POST /api/llm/chat)
Body: {
  "messages": [...],
  "modelAlias": "forgetphys-debate",
  "debateSessionId": "<id>",
  "mode": "free" | "hard"
}
```

| Rule | Detail |
|---|---|
| Server | Injects `LITELLM_API_KEY`, calls LiteLLM, **streams SSE** back to SPA |
| Never | Return upstream / gateway master key to the client (incl. error bodies) |
| Rate limit | Hooks placeholder for student budget / turn caps (no-op OK in P1b) |
| P1b | Mock handler returns canned `GroundedReply` JSON with `cite[]` (fake stream OK) |
| Placement | **Accepted:** `apps/web` internal proxy ([`adr/0003-debate-bff.md`](./adr/0003-debate-bff.md)); `apps/debate-proxy` deferred |

Client uses Vercel AI SDK against **this BFF only** — never against LiteLLM with a browser-held key.

### Model alias → provider (config only)

`litellm_config.yaml` (see `tools/litellm/`) maps aliases such as `forgetphys-debate` to an upstream (`openai/…`, `deepseek/…`, `ollama/…`, …). Swapping OpenAI ↔ DeepSeek ↔ Ollama is **config-only**; the app keeps calling the same alias through Vercel AI SDK → LiteLLM.

### P1 vs polish

P1 includes:

- Stub **GroundedReply** client (Vercel AI SDK → **BFF / debate-proxy** → LiteLLM `baseURL` + alias).
- Example `litellm_config.yaml` under `tools/litellm/` (or `docs/examples`).

**Not** in P1: full multi-provider polish, production routing dashboards, or BYOK UX.

### Streaming UX

- Stream token deltas from the SDK into a **DialoguePanel-like** UI (same venue chrome as scripted lines).
- Cite chips and EvidenceBoard updates apply after CriticPolicy pass (or on final streamed chunk + post-check), not mid-hallucination.

P1 may stub GroundedReply with a fake stream; live calls still go through the locked LiteLLM env shape when enabled.

---

## 13. UX / mode entry

### Where the player picks 常规 / 自由 / Hard

- Primary: **city page** mode picker, and/or venue **⋯ overflow menu** (Coupland lab / lodge).
- Scripted (常规) is always available wherever authored dialogue exists.
- **自由 (free)** unlocks after the first successful `labEmbed` return **or** after a lodge beat (content flag).
- **Hard** unlock: recommend **after at least one Infinitas visit** (player has seen scattering readouts). Alternative lock: after lodge beat — prefer Infinitas gate for pedagogy.

### EvidenceBoard UI

- Parchment **side panel** (Hard mode).
- **6 slots** matching `HARD_EVIDENCE_SLOTS_ALPHA.md` / `hard-slots-alpha-1909.json`.
- Filled slots show checkmarks; empty slots stay muted until legal fill.

### Cite chips

- Under NPC (and player-grounded) lines: chip per `cite` id.
- Tier badges: **事实** (`fact` / `primary` / `textbook`) · **时代观点** (`era_opinion`) · **演绎** (derived / non-slot speech inference — never fills Hard slots).

---

## 14. Session state machine

```
                    ┌─────────────────┐
                    │  idle_scripted  │◄── default / exit soft
                    └────────┬────────┘
           enter free │      │ enter hard
                      ▼      ▼
              debate_free   debate_hard
                      │      │
        end / budget  │      │ fill N + Critic pass
                      ▼      ▼
            budget_exhausted / persuaded
                      │
                      ▼
                 idle_scripted  (chronicle ending unchanged)

aborted ← user cancel / navigation away (persist partial board optional)
```

| State | Meaning |
|---|---|
| `idle_scripted` | Playing authored `manchester.json` (or venue cards); no free LLM loop |
| `debate_free` | Free mode turn loop active |
| `debate_hard` | Hard mode + EvidenceBoard active |
| `persuaded` | Judge win (Hard): `filled_count >= N` ∧ CriticPolicy pass once — vs **era understanding / peers / board** (B2=A); Rutherford ≠ win object |
| `budget_exhausted` | Turn / token budget hit without win; soft fail |
| `aborted` | User left session; no fate rewrite |

### Persistence

- Progress flags in **content progress** (preferred for unlock gates: first labEmbed, lodge beat, Infinitas visit).
- Session scratch (open mode, board fills mid-run, turn count) in **`localStorage`** keyed by chapter / venue id — cleared or archived on `persuaded` / `aborted` per product policy.
- Never persist invented cites; only validated slot fills + mode unlocks.
- Schema sketch: [`PROGRESS_SAVE_SCHEMA.md`](./PROGRESS_SAVE_SCHEMA.md). Overlay flag **`debateSession: off | active`** does **not** replace **`debateMode`** (ADR-0003).

---

## 15. CriticPolicy checklist (deterministic)

CriticPolicy is **rules**, not an LLM judge. Explicit checklist (Hard + free grounded replies):

1. **Cite ids ⊆ retrieved** — every `cite` in the reply must appear in the Retriever hit set for this turn (no freestyle ids).
2. **Numbers must match card text** — any numeric token (angles, fractions like 1/8000 or 1/20000, thicknesses) must literally match a retrieved FactStore card or an approved labEmbed measurement; else reject.
3. **`era_opinion` cannot fill slots** — may appear in speech with 时代观点 badge; `EvidenceBoard.fill` ignores those cites.
4. **Banned phrases** — from PersonaCard `bans` + global list (modern jargon forced into 1909 speech, invented apparatus names, etc.).
5. **Max retries `K = 2`** — GroundedReply may regenerate up to 2 times after Critic fail; then fall through.
6. **On fail → uncertainty template** — speak a fixed / lightly templated line: e.g. “I don’t have a card for that” / 「考证库里没有这条，我不能编造数字」— do not invent to please the player. Full prompt assembly + JSON schema: [`GROUNDED_REPLY_PROMPTS.md`](./GROUNDED_REPLY_PROMPTS.md).

Hard fill extras (see also `HARD_EVIDENCE_SLOTS_ALPHA.md`): slot↔`linked_fact_ids` legality; ≥1 Critic pass on a filling turn before `persuaded`.

---

## 16. LabEmbed → slot fill contract

**Standalone copy:** [`LABEMBED_POSTMESSAGE.md`](./LABEMBED_POSTMESSAGE.md) (origin whitelist · kinds · ranges · slot map · security · examples).

Infinitas iframe posts **typed JSON** via `postMessage` (whitelist origin). Example payload shape:

```json
{
  "kind": "alpha_scatter_summary",
  "angle_deg": 150,
  "fraction_forward": 0.999,
  "large_angle_count": 3
}
```

| Field | Type | Notes |
|---|---|---|
| `kind` | string | Discriminator; only known kinds accepted |
| `angle_deg?` | number | Optional large-angle sample / max |
| `fraction_forward?` | number | In `[0, 1]` |
| `large_angle_count?` | number | Non-negative integer |

### Whitelist mapping → slot ids

| labEmbed signal | Candidate slot |
|---|---|
| `large_angle_count > 0` or `angle_deg` above configured large-angle threshold | `slot-large-angle-exists` |
| `fraction_forward` in configured “majority forward” band | `slot-forward-majority` |

Other slots (thin foil, central charge, plum-pudding fails, method) remain **FactStore-cite only** unless a future kind is explicitly whitelisted.

### Validation

- CriticPolicy validates **ranges** and kind whitelist before `EvidenceBoard.tryFill`.
- Out-of-range / unknown fields → ignore fill (may still show readout in UI as unverified).
- labEmbed never rewrites chronicle plate copy.

---

## 17. Multi-NPC later · who-persuaded (**B2 LOCKED = A** · stance-critic LOCKED)

**B2 LOCKED = A (2026-09-07; stance-critic LOCKED after 考证 shortlist):** Hard persuade target is the **era-mainstream stance / understanding（时代主流理解）** and/or optional named contemporaries — **NOT Rutherford**. **Era Critic = stance by default** (`form: stance`, `identity_locked: false`, `charId: null` — no named historical person required). Named peer = **optional P2+ 加分** from 考证 — **not** a P1a blocker. Rutherford stays **lab chief / interlocutor** who can accept evidence; he is **not** the win-condition object. Win = EvidenceBoard fills (4/6) + CriticPolicy + persuading the **era understanding / peers / board**. Player rebuts via **Watson** with **substantial written input** (long-text essay path); Critic challenges with `era_opinion`; long text alone does not win without cites / slot fills; Critic **cannot veto** legal Fact fills.

**史料考证 (2026-09-07):** named-peer **shortlist arrived** → `kaozheng/ch1-ForgetPhys-Hard质疑者短名单.md`. Optional skins (**加分, not required**): **Fajans** · **Thomson** · **Crowther**. Default remains abstract stance / 「主流冷淡」氛围. **Do not invent names.** Default persona: `packages/content/src/debate/persona-era-peer-1909.json` (`id: persona-era-peer-1909`, aliases `persona-era-stance-1909`, `name` Era mainstream understanding, `name_zh` 时代主流理解, `form: stance`, `optional_named_skins_ref` → 考证短名单).

**Pending 史料考证 (do not invent):** **可驳斥主张清单 → EvidenceBoard mapping** — requested; wait for 考证 before writing claim↔slot tables.

**P2 sketch** (not P1 scope):

| Role | Who | Notes |
|---|---|---|
| Lab chief / interlocutor | Rutherford | Free + Hard dialogue; can accept evidence; **not** Hard win object |
| Ally / player mouthpiece | Watson | Default ally; Hard **long-text essay rebuttal** UI (multiline); may propose multi-slot fills in one submit if Critic passes each |
| **Hard persuade target (default)** | **Stance Critic** · 时代主流理解 | **Hard only**; faceless / silhouette; EraOpinionStore lines; `persona-era-peer-1909` |
| **Hard persuade target (optional)** | Named peer skins | P2+ 加分: Fajans / Thomson / Crowther; same board rules; flavor only |
| Judge | Rules engine | **Still not an LLM** — Critic cannot award `persuaded` |

---

## 18. Open questions / decisions locked

### Locked

- Single ForgetPhys shell; **no SillyTavern fork**.
- Three modes: 常规 / 自由 / Hard.
- Dual stores: FactStore vs EraOpinionStore; era opinions do not fill Hard slots.
- Judge = **rules**; CriticPolicy deterministic checklist; `K = 2`.
- Hard win: **N = 4 of M = 6** Coupland α slots + ≥1 Critic pass; **no chronicle ending rewrite**.
- **LiteLLM gateway locked** (2026-09-07): OpenAI-compatible, provider-agnostic; model alias via `litellm_config.yaml`.
- **B1 LOCKED (2026-09-07) — keys never in browser:** SPA → **BFF / debate-proxy** (holds `LITELLM_API_KEY`) → LiteLLM; **OR** school LiteLLM with session/student-token auth. Same family as SillyTavern Node server. See §12 security + `docs/LLM_KEY_PATH.md`. Frontend = Vercel AI SDK → BFF (never vendor SDKs; never client-held gateway key).
- **B2 LOCKED = A (2026-09-07) — who-persuaded:** Hard persuade target = **era-mainstream stance / understanding（时代主流理解）** and/or optional named peers / board — **NOT Rutherford**. **Stance Critic is default** (named person **not** required). Rutherford = lab chief / interlocutor. Default `persona-era-peer-1909` (`form: stance`).
- **stance-critic LOCKED (2026-09-07):** Abstract era-mainstream stance by default; optional named skins **Fajans / Thomson / Crowther** from 考证 shortlist (P2+ 加分); no invented names.
- Hard unlock recommendation: after ≥1 Infinitas visit.
- labEmbed → slots via typed `postMessage` + whitelist + range checks.
- **H1 design-locked (Spec v3):** Hard allows **player propose-fill** (Fact card or labEmbed → CriticPolicy → fill). EraPeer may emit `era_opinion` challenge lines but **cannot veto** a legal Fact fill. NPC cite remains an alternate fill path. Judge remains rules-only.

### Still open

- **Which upstream model** the LiteLLM alias (`forgetphys-debate`) maps to for class deploy (config-only; not an app decision).
- **Cost budget per student** — strategy drafted in [`STUDENT_LLM_QUOTA.md`](./STUDENT_LLM_QUOTA.md) (**Draft · not locked**); turn/token numbers still need product lock.
- **Multi-chapter debate** continuity and **pedagogy assessment** — still open; see [`DESIGN_GAPS.md`](./DESIGN_GAPS.md).
- Exact free-mode unlock beat (first labEmbed vs lodge) if content pacing changes.
- Whether mid-session EvidenceBoard fills persist across venue re-entry — **L3 default (V3):** persist fills per venue until chapter complete or reset.
- Optional named-skin **art / full persona** authoring (P2+) for Fajans / Thomson / Crowther — not a P1a blocker; default stance already locked.
- **可驳斥主张清单 → EvidenceBoard mapping** — **delivered** → [`HARD_CRITIC_CLAIMS_ALPHA.md`](./HARD_CRITIC_CLAIMS_ALPHA.md); do **not** invent new claim lists in-repo without 考证.
- ~~Concrete BFF implementation choice~~ — **Accepted ADR-0003:** `apps/web` internal proxy; `apps/debate-proxy` deferred until independent rate-limit / multi-client need.
- ~~PRODUCT_FLOW M4~~ — **done** → [`PRODUCT_FLOW.md`](./PRODUCT_FLOW.md) pure-2D default.
- Card schema docs: [`DEBATE_CONTENT_SCHEMA.md`](./DEBATE_CONTENT_SCHEMA.md); package API sketch: [`DEBATE_PACKAGE_API.md`](./DEBATE_PACKAGE_API.md) (Zod + runtime still P1a+).

**Locked / confirmed 2026-09-07:**

- **`debateMode` naming (H3):** `debateMode: scripted | free | hard` — do not collide with PRODUCT_FLOW shell modes (`worldMap2d` / `venue2d`).
- **`debateSession: off | active`:** overlay on venue; does **not** replace `debateMode`. Shell `GameMode` stays spatial only (ADR-0003).
