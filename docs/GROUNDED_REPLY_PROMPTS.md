# GroundedReply prompts — P2 SoT

Status: **Prompt SoT (design)** · 2026-09-07 · P2 live path  
Runtime: **not implemented** — assembly rules only; no API keys in prompts or client bundles.  
Related: [`DEBATE_ARCHITECTURE.md`](./DEBATE_ARCHITECTURE.md) §§6 · 12 · 15 · [`DEBATE_SCHEME_V3.md`](./DEBATE_SCHEME_V3.md) §9 · [`adr/0003-debate-bff.md`](./adr/0003-debate-bff.md) · [`LLM_KEY_PATH.md`](./LLM_KEY_PATH.md) · [`HARD_CRITIC_CLAIMS_ALPHA.md`](./HARD_CRITIC_CLAIMS_ALPHA.md)

> P1b may return canned `GroundedReply` JSON through the BFF. This document is the **prompt + output contract** for P2 live GroundedReply + cite-or-retry.

---

## 1. Assembly order (locked)

Build the model messages in this order (system → user/tool context). Do **not** reorder casually — CriticPolicy and cite chips assume this shape.

| # | Block | Source | Notes |
|---|---|---|---|
| 1 | **System (persona)** | PersonaCard `system_prompt` (+ name / era / venue_tags) | One speaking role per call (Rutherford, Watson, or stance Critic) |
| 2 | **Bans** | PersonaCard `bans` ∪ global ban list | Hard-fail phrases; modern jargon forced into 1909; invented apparatus |
| 3 | **Retrieved snippets** | Retriever hits: **FactStore** + **EraOpinionStore** | Include `id`, `tier`, short text; optional labEmbed readout as measurement context (never as free-form lore) |
| 4 | **Mode rules** | `debateMode`: `free` \| `hard` (+ session flags) | free = cite speech, ghost board only; hard = Fact/labEmbed may propose fills; era_opinion never fills |
| 5 | **Output schema** | This doc §2 | Model must emit JSON matching the schema |

Optional trailing: `mes_example` few-shots (persona), open EvidenceBoard slot ids (hard), Watson essay vs short-chat instruction (§4).

**Never** put `LITELLM_API_KEY`, vendor keys, `VITE_*` secrets, or gateway tokens into any prompt block, tool description, or example.

---

## 2. Required JSON / cite format

Every successful GroundedReply (stream final or non-stream) must parse as:

```json
{
  "text": "string — spoken line or essay body shown in UI",
  "cite": ["fact-or-era-card-id", "..."],
  "challenge_ids": ["era-opinion-card-id"]
}
```

| Field | Required | Rules |
|---|---|---|
| `text` | **yes** | Non-empty after trim; UI primary string |
| `cite` | **yes** | Array of card ids; **⊆ Retriever hit set** for this turn (CriticPolicy §15). May be `[]` only for pure uncertainty templates (§3) |
| `challenge_ids` | optional | Hard stance Critic only: EraOpinionStore ids used as **challenge lines**. **Never** used for EvidenceBoard fills |

### Cite hygiene

- Measurable / historical claims in `text` need matching Fact (or labeled era_opinion) cites.
- Numeric tokens must literally match retrieved Fact text or an approved labEmbed measurement.
- `tier: era_opinion` cites may color speech (badge **时代观点**) but **cannot** fill Hard slots.
- Invented ids → Critic fail → retry (max **K = 2**) → uncertainty template.

---

## 3. Uncertainty templates (after K = 2 fail)

When CriticPolicy rejects the draft **K = 2** times, do **not** invent. Speak a fixed / lightly templated line and return `cite: []` (optionally omit `challenge_ids`).

| Locale | Template (canonical) |
|---|---|
| **EN** | I don't have a card for that — I won't invent numbers. |
| **CN** | 考证库里没有这条，我不能编造数字。 |

Variants may soft-match persona voice (short preface) but must keep the no-invent meaning. Never escalate to a third LLM invent-pass.

---

## 4. Watson essay vs short chat

| Path | When | Prompt / UX difference | Budget |
|---|---|---|---|
| **Short chat** | free · hard turn-by-turn | Single utterance; one reply JSON; typical 1 cite cluster | 1 turn |
| **Watson essay** | hard long-text rebuttal UI (multiline) | System block adds: substantial written rebuttal; may reference multiple open slots; Critic still requires cites / legal fills — **essay alone does not win** | **Recommend 1 essay submit = 1 turn**; if Critic passes per slot, one submit may **propose multi-slot fill** |

Essay assembly still follows §1. Extra mode-rule bullets for essay:

- Prefer FactStore cites that map to open `linked_fact_ids`.
- Do not claim victory or rewrite chronicle fate.
- Stance Critic may answer with `era_opinion` challenges (`challenge_ids`); Critic **cannot veto** a legal Fact fill.

---

## 5. Stance Critic challenge prompt

Hard antagonist default = **stance Critic** / 时代主流理解 (`persona-era-peer-1909`, `form: stance`).

| Rule | Detail |
|---|---|
| Store | **EraOpinionStore only** for challenges (C1–C10 map — see `HARD_CRITIC_CLAIMS_ALPHA.md`) |
| Output | Same JSON schema; put challenge card ids in `challenge_ids` (and optionally mirror in `cite` for chip display if labeled era_opinion) |
| **No slot fill** | Critic speech **never** calls `EvidenceBoard.tryFill`; era_opinion **never** fills |
| No veto | Legal Fact / labEmbed fills that passed CriticPolicy stay filled |
| Identity | Default abstract stance — no invented historical names; named skins optional P2+ |

Challenge system addendum (sketch):

```
You speak as 1909-era mainstream caution (stance Critic).
Challenge the player's / Watson's claim using ONLY retrieved era_opinion cards.
Do not fill evidence slots. Do not invent names, numbers, or apparatus.
Return JSON: { text, cite, challenge_ids }.
```

---

## 6. Security / keys

- Prompts are content — **never** embed API keys, LiteLLM master tokens, or school session secrets.
- Client sends messages to BFF (`POST /api/debate/complete`); server injects `LITELLM_API_KEY` — see ADR-0003 + `LLM_KEY_PATH.md`.
- Error / SSE bodies must not echo upstream keys.

---

## 7. Pointers

| Doc | Role |
|---|---|
| `DEBATE_ARCHITECTURE.md` §6 · §15 | Turn flow · CriticPolicy K=2 |
| `DEBATE_SCHEME_V3.md` §9 | Watson essay · stance Critic |
| `adr/0003-debate-bff.md` | Accepted BFF path |
| `LABEMBED_POSTMESSAGE.md` | Measurement context (not prompt lore) |
| `PROGRESS_SAVE_SCHEMA.md` | Persist unlocks / fills — not prompts |
