# Debate Self-Audit — ForgetPhys · 2026-09-07

Status: **Next-phase + post-mode-lock architecture audit** · **B1 + B2 user-locked 2026-09-07**  
SoT: `docs/DEBATE_ARCHITECTURE.md` (Spec v3) · Director SoT: `docs/DEBATE_SCHEME_V3.md` · Prior summary: `docs/DEBATE_SCHEME_REFINED.md`  
Key path: `docs/LLM_KEY_PATH.md`  
Voice: 导演自检 / director self-audit（CN-friendly · bilingual headers）

---

## Verdict · 总判

| | |
|---|---|
| **Overall** | Architecture direction **SOUND** after three modes locked; **B1 + B2 now LOCKED** |
| **Code readiness** | **NOT ready** to code-dump full P1 until **H2** (P1a/P1b/P2 scope split) is followed — B1/B2 no longer block design |
| **What to do next** | Fine-design **P1a** per `DEBATE_SCHEME_V3.md` (no code-dump until BFF ADR); CriticPolicy + H1 propose-fill + Watson essay path; BFF stub in **P1b**; defer cite-or-retry LLM to **P2**. Era Critic = **stance by default**（时代主流理解）; 考证 named-peer shortlist **optional** (Fajans/Thomson/Crowther P2+ flavor; no invented names). |

---

## What's locked & healthy · 已锁定且健康

| Item | Note |
|---|---|
| Three modes | scripted / free / hard |
| Dual stores | FactStore vs EraOpinionStore; era opinions never fill Hard slots |
| Rules Judge | Not LLM “who argued better” |
| No ST fork | DebateSession on Venue2D inside ForgetPhys |
| LiteLLM gateway | Provider-agnostic OpenAI-compatible proxy locked |
| **B1 · Keys never in browser** | **LOCKED 2026-09-07** — same family as SillyTavern: SPA → BFF/debate-proxy (holds `LITELLM_API_KEY`) → LiteLLM; **OR** school LiteLLM via session/student token. See `LLM_KEY_PATH.md` + architecture §12. |
| **B2 · Who persuaded (Hard)** | **LOCKED = A** — includes **stance-without-name**: Hard persuade target = **时代主流理解（era-mainstream stance）** and/or optional named contemporaries / board — **NOT Rutherford**. Named peer is **optional flavor**, not a P1a blocker. Default persona: `persona-era-peer-1909` (`name_zh` 时代主流理解). |
| Hard win | **4 / 6** slots + ≥1 CriticPolicy pass; chronicle freeze; win = convince **era understanding / peers / board** |
| Venue2D overlay | DebateSession layer; no separate app shell |

---

## Findings · 发现（severity）

| ID | Sev | Title | Summary | Recommend |
|---|---|---|---|---|
| **B1** | **LOCKED** | Browser must not hold LiteLLM API key | Was: SPA → LiteLLM with client key = leak | **LOCKED pattern:** ST = Node server holds keys; ForgetPhys = BFF / debate-proxy holds `LITELLM_API_KEY` **OR** school LiteLLM session/student-token auth. Documented in §12 + `LLM_KEY_PATH.md`. |
| **B2** | **LOCKED = A** | Who is being persuaded in Hard? | Was: Rutherford dual role → lore dissonance | **LOCKED A:** persuade **era Critic = stance by default**（时代主流理解; board = win). Named peer optional after 考证 — **not** required for P1a. Rutherford stays lab chief. **Do not invent names without 考证**. |
| **H1** | High | Player agency to fill slots underspecified | Flow is Player utterance → NPC cite → `tryFill`. Missing: can player pin a Fact card / lab readout to a slot without NPC agreeing? | Hard allows **player propose fill** (pick card → slot) + CriticPolicy; NPC may challenge with `era_opinion` but **cannot veto** legal Fact fill. Judge still rules. |
| **H2** | High | P1 scope overload + Critic ownership split | Architecture P1 omits CriticPolicy while scheme checklist includes it; Hard + labEmbed **needs Critic in P1** | Split **P1a / P1b / P2** (see Next-phase plan). **Remaining design gate before code-dump.** |
| **H3** | High | Naming collision | `PRODUCT_FLOW` modes (`worldMap2d` / `venue2d`) vs debate modes (`scripted` / `free` / `hard`) | Rename debate field to **`debateMode`** everywhere in new code/docs. |
| **M1** | Med | Scripted ↔ Debate coexistence UX fuzzy | When does scripted pause? Can free interrupt mid-beat? | DebateSession = **modal overlay**; entering free/hard **pauses** scripted beat index; exit resumes or jumps to post-debate beat flag. |
| **M2** | Med | Free EvidenceBoard “preview” | Must not fill Hard slots in free | Preview = **ghost UI only**. Lock: free **never** mutates EvidenceBoard fills. |
| **M3** | Med | Keyword Retriever bilingual risk | CN player + EN cards | P1: dual-language keys on cards; P2: optional embedding later — **not** full RAG. |
| **M4** | Med | `PRODUCT_FLOW` stale 3D top section | Top section still 3D-era; append is pure-2D | Cleanup chore — **not** a debate blocker. *(One-line note only; do not silently rewrite PRODUCT_FLOW in this pass.)* |
| **L1** | Low | Zod schemas still optional | Card loaders lack required validation | Make Zod **P1a required** for card loaders. |
| **L2** | Low | `packages/debate` empty | Runtime stub only | OK until P1a. |
| **L3** | Low | Mid-session board persistence | Still open in §18 | Default recommend: **persist fills per venue** until chapter complete or reset. |

### B2 · LOCKED = A（原三选一已拍板）

| Option | Shape | Status |
|---|---|---|
| **(A)** | Hard persuades an **era Critic / peer stance** (board is the win); Rutherford stays lab chief who accepts evidence. **A includes stance-without-name**（时代主流理解）; named peer optional | **LOCKED 2026-09-07** |
| **(B)** | Rutherford plays devil’s-advocate until N slots filled then yields in-character | Rejected for Hard win-condition (may still color speech) |
| **(C)** | Win is **Watson + EvidenceBoard certification** for the chronicle plate | Not chosen; board remains necessary but persuade object = era understanding / peers |

**Clarification (director lock 2026-09-07):** B2=A still stands. **A includes stance-without-name** — Hard antagonist need NOT be a named historical person. Default = abstract era-mainstream stance; player rebuts through **Watson** long-form input; EvidenceBoard + rules Judge decide win. **考证 shortlist for named peers is optional** (P2+ flavor), not a P1a blocker. Default id `persona-era-peer-1909` — **no fake historical name**.

---

## Architecture confirmed · 模式锁定后确认

```
PRODUCT shell (2D): map → plate → city → venue2d → labEmbed
                              debateMode: scripted | free | hard
                              DebateSession owns turn loop when free|hard
packages/content/debate JSON → FactStore / EraOpinionStore / Personas / HardSlots
packages/debate runtime → Retriever, CriticPolicy, EvidenceBoard, Judge, GroundedReply
apps/web SPA → BFF / debate-proxy (keys) → LiteLLM → upstream
Hard win object → era understanding / stance Critic / optional peers / board (B2=A); Rutherford = lab chief
```

---

## Next-phase plan · 下阶段（修订）

| Phase | Scope | Owners |
|---|---|---|
| **P1a** | Session shell, mode UI (`debateMode`), dual stores, keyword Retriever, EvidenceBoard, Judge, labEmbed contract, **CriticPolicy for fills (no live LLM)**, Zod on card loaders, free = ghost preview only | 游戏架构 · 游戏设计导演 |
| **P1b** | Stub GroundedReply + LiteLLM sidecar smoke via **BFF / debate-proxy** (keys **server-side only**; local mock OK) | 游戏架构 |
| **P2** | Live GroundedReply + cite-or-retry + multi-NPC; stance Critic already default; optional named-peer after 考证; optional embedding Retriever | 游戏架构 · 史料考证 · 游戏设计导演 |

Ordered checklist:

1. ~~User lock B1~~ — **DONE** · BFF / debate-proxy **OR** school LiteLLM session/token (see `LLM_KEY_PATH.md`).  
2. ~~User lock B2~~ — **DONE = A** · era understanding / stance (named peer optional) / board; Rutherford ≠ win object.  
3. P1a: DebateSession modal + pause scripted beat; `debateMode` naming.  
4. P1a: FactStore / EraOpinionStore + bilingual keyword Retriever.  
5. P1a: EvidenceBoard + Judge (4/6) + CriticPolicy for labEmbed / Fact fills (no LLM).  
6. P1a: Player propose-fill path (H1) + NPC era challenge without veto.  
7. P1a: Zod required on card loaders (L1).  
8. P1b: stub GroundedReply + LiteLLM sidecar smoke via **BFF / debate-proxy**.  
9. P2: live GroundedReply + cite-or-retry; optional 考证 named-peer shortlist; multi-NPC.  
10. Chore (non-blocker): cleanup `PRODUCT_FLOW` stale 3D top section (M4).

---

## Decisions locked · 已拍板（原 Blocker）

| # | Decision | Lock |
|---|---|---|
| **1 · B1** | Live LLM key path | **LOCKED** — keys never in browser; BFF (`apps/web` Vite route or `apps/debate-proxy`) holds `LITELLM_API_KEY` **OR** school LiteLLM auth via session/student token. Same family as SillyTavern Node server. |
| **2 · B2** | Who is persuaded in Hard? | **LOCKED = A** — **includes stance-without-name**（时代主流理解）; optional named peers; **NOT Rutherford**. Rutherford = lab chief / interlocutor. Default `persona-era-peer-1909`; 考证 shortlist **optional**. |

Remaining before P2 live: implement BFF; optional named-peer 考证. H2/H3 still gate clean P1a code.

---

## Related paths · 相关路径

| Path | Role |
|---|---|
| `docs/DEBATE_AUDIT_2026-09-07.md` | This audit |
| `docs/DEBATE_ARCHITECTURE.md` | EN architecture SoT (§12 security · §17/§18 B2=A) |
| `docs/DEBATE_SCHEME_V3.md` | **Director SoT Spec v3**（角色矩阵 / H1 / BFF / P1a 验收） |
| `docs/DEBATE_SCHEME_REFINED.md` | Prior director summary → points to V3 |
| `docs/LLM_KEY_PATH.md` | ST vs ForgetPhys key path (B1) |
| `docs/HARD_EVIDENCE_SLOTS_ALPHA.md` | Coupland Hard slots · win = era understanding / peers / board |
| `docs/PRODUCT_FLOW.md` | Product flow — **top section stale vs pure-2D** (M4 chore) |
| `packages/content/src/debate/` | Card JSON SoT (incl. `persona-era-peer-1909.json`) |
| `packages/debate/` | Runtime empty until P1a |
