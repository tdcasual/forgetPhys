# Student LLM quota / cost strategy

Status: **Draft · not locked** · 2026-09-07  
Related: [`LLM_KEY_PATH.md`](./LLM_KEY_PATH.md) · [`adr/0003-debate-bff.md`](./adr/0003-debate-bff.md) · [`DEBATE_SCHEME_V3.md`](./DEBATE_SCHEME_V3.md) §4 · [`HARD_EVIDENCE_SLOTS_ALPHA.md`](./HARD_EVIDENCE_SLOTS_ALPHA.md) (`suggested_turn_budget`) · [`DESIGN_GAPS.md`](./DESIGN_GAPS.md)

> Open product decision — document suggestions so P1b/P2 can implement hooks. **Do not treat numbers below as locked SoT.**

---

## 1. Goals

- Keep class deploys affordable when the school shares one LiteLLM / gateway key.
- Align **Hard** turn pressure with the Coupland α `suggested_turn_budget: 12` (see hard-slots JSON / Hard slots doc).
- Never put vendor / master keys in the SPA (B1). Quota is enforced **server-side** on the BFF.
- When quota is exhausted, degrade to **offline / scripted** play — never invent cites to keep chatting.

---

## 2. Suggested turn caps (draft)

| Mode | Soft / product default | Hard stop (draft) | Notes |
|---|---|---|---|
| **free** | **20** LLM turns / DebateSession | Same or slightly above soft | Ghost board only; still cite-or-retry when live |
| **hard** | Align to EvidenceBoard budget | **12** turns / session | Matches `suggested_turn_budget` on Coupland α; 1 Watson essay submit = **1 turn** (recommend) |
| **scripted** | 0 LLM | — | Authored `manchester.json` only |

- Turn = one successful (or uncertainty-template) GroundedReply cycle, **or** one essay submit.
- CriticPolicy retries inside a turn (K ≤ 2) **do not** each count as a new player turn (draft).
- Session reset / chapter reset clears counters (same L3 venue-fill policy family as progress save).

---

## 3. Token soft caps (draft)

| Cap | Suggestion | Enforcement |
|---|---|---|
| Per-turn completion tokens | Soft warn ~1.5–2k; hard truncate / refuse oversized essay | BFF before / after LiteLLM |
| Per-session token budget | Soft; optional class-wide daily ceiling | BFF counter; LiteLLM budget later |
| Prompt size | Retriever top-k snippets only; no full lore dump | `packages/debate` Retriever + prompt assembly |

Exact numbers stay **config**, not hardcoded product lore.

---

## 4. Class shared key vs BYOK

| Deploy shape | Who pays | Auth | Quota owner |
|---|---|---|---|
| **Class shared key** (default draft) | School / project holds `LITELLM_API_KEY` on BFF or school LiteLLM | Session cookie / class code / per-student token | BFF (or school gateway) per `debateSessionId` + student id |
| **BYOK** (optional later) | Student or teacher brings own LiteLLM-compatible endpoint + key | Key stays **server-side** (user pastes into BFF-held secret store — never `VITE_*`) | Same turn caps; spend is their upstream bill |

BYOK UX is **out of P1**; document only. Shared-key class deploy is the primary path.

---

## 5. Where enforcement lives

```
SPA  →  BFF (apps/web)  →  LiteLLM
         ↑ turn / token counters
         ↑ reject or degrade when exhausted
```

| Layer | Role (draft) |
|---|---|
| **BFF** | **Required** — count turns, soft/hard refuse, strip keys, attach `quotaRemaining` to responses |
| **LiteLLM budgets** | **Optional later** — provider-side `$` / TPM budgets per virtual key; nice for multi-class ops |
| **Client UI** | Display remaining turns; never trust client to enforce |

P1b rate-limit hooks may be no-op stubs that still expose the counter fields.

---

## 6. Exhausted → offline / scripted fallback

When free/hard quota hits the hard stop:

1. End live GroundedReply path (`budget_exhausted` — already in DebateSession outcomes).
2. Offer **resume scripted** beat (pause/resume already in V3 lifecycle) or stay on EvidenceBoard read-only.
3. Hard: Judge may still evaluate existing fills; no new LLM challenge lines — use **scripted Critic templates** (P1a) if needed.
4. Never invent Fact numbers to “finish the chat.”

---

## 7. Config sketch (non-normative)

```yaml
# illustrative only — not locked
forgetphys_quota:
  free_turn_cap: 20
  hard_turn_cap: 12
  count_critic_retries_as_turn: false
  essay_submit_counts_as: 1
  token_soft_per_turn: 2048
  fallback: scripted_or_readonly_board
```

---

## 8. Status / next

| Item | State |
|---|---|
| Documented draft caps | **This doc** |
| Director lock on numbers | **Open** |
| BFF counter implementation | P1b+ |
| LiteLLM virtual-key budgets | Optional ops |

See [`DESIGN_GAPS.md`](./DESIGN_GAPS.md) for remaining open product items.
