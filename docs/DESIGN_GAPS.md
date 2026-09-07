# ForgetPhys design gaps — director checklist

Status: **Brief checklist** · 2026-09-07  
Purpose: What the recent doc batch **filled** vs what remains **open** (non-blocker unless noted).  
Debate SoT: [`DEBATE_SCHEME_V3.md`](./DEBATE_SCHEME_V3.md) · Catalog: [`DOCS_INDEX.md`](./DOCS_INDEX.md)

---

## Filled this batch (docs only · no runtime)

| Gap | Doc | Notes |
|---|---|---|
| Student LLM cost / quota strategy | [`STUDENT_LLM_QUOTA.md`](./STUDENT_LLM_QUOTA.md) | **Draft · not locked** — free ~20 / hard ~12; BFF enforces; offline fallback |
| Debate card Zod/shape documentation | [`DEBATE_CONTENT_SCHEMA.md`](./DEBATE_CONTENT_SCHEMA.md) | Documents JSON; **Zod code still P1a required** |
| `packages/debate` TS API sketch | [`DEBATE_PACKAGE_API.md`](./DEBATE_PACKAGE_API.md) | Types only |
| PRODUCT_FLOW M4 (3D-as-default top) | [`PRODUCT_FLOW.md`](./PRODUCT_FLOW.md) | Pure-2D default; legacy 3D deprecated note |
| Scripted dialogue authoring (thin) | [`SCRIPTED_DIALOGUE_AUTHORING.md`](./SCRIPTED_DIALOGUE_AUTHORING.md) | manchester.json / badges / interpretation |
| Docs catalog paths | [`DOCS_INDEX.md`](./DOCS_INDEX.md) · V3 related paths | Updated |

### Already filled earlier (still SoT)

| Item | Doc |
|---|---|
| B1 keys / BFF placement | `LLM_KEY_PATH.md` · ADR-0003 **Accepted** |
| B2 who-persuaded / stance Critic | V3 · Architecture · persona-era-peer |
| Coupland Hard slots + Critic claims | `HARD_*_ALPHA.md` |
| GroundedReply prompts | `GROUNDED_REPLY_PROMPTS.md` |
| labEmbed postMessage | `LABEMBED_POSTMESSAGE.md` |
| Progress / EvidenceBoard save sketch | `PROGRESS_SAVE_SCHEMA.md` |
| Debate UX wireframes | `DEBATE_UX.md` |

---

## Still open (director-visible)

| Gap | Severity | Notes |
|---|---|---|
| **Upstream model** behind LiteLLM alias `forgetphys-debate` | Open · config-only | Not an app code decision; ops / school choose model |
| **Quota numbers lock** | Open | Caps documented as draft; need product lock before class pilot |
| **Multi-chapter debate** | Open | P1a = Coupland only; no cross-chapter FactStore / board continuity design yet |
| **Pedagogy assessment** | Open | No rubric for learning outcomes, quiz hooks, or teacher dashboard beyond EvidenceBoard win |
| Free-mode exact unlock beat | Open · pacing | First labEmbed vs lodge — content call |
| Optional named peer skins (art + persona) | Open · P2+ 加分 | Fajans / Thomson / Crowther — not P1a |
| LiteLLM virtual-key $ budgets | Open · ops | Optional after BFF counters |
| Zod **implementation** for debate cards | **P1a required** | Doc exists; code not written (this batch = docs only) |
| `packages/debate` **runtime** | P1a+ | Interface sketch only |

---

## Explicitly not gaps / locked

- No SillyTavern fork  
- Judge = rules; era_opinion never fills slots  
- Hard win ≠ Rutherford  
- chroniclePlate fate text immutable from Hard  
- BFF = `apps/web` internal proxy  

---

## Suggested director next locks

1. Lock or revise free **20** / hard **12** turn caps.  
2. Confirm free unlock beat for Ch1.  
3. Defer multi-chapter debate + pedagogy assessment to post-P1a charter (track here until then).
