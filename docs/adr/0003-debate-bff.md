# ADR 0003 — Debate BFF placement (apps/web internal proxy)

Status: **Accepted** · 2026-09-07  
Accepted by: **游戏架构** + **游戏设计**  
Author: design docs batch · 2026-09-07  
Related: [`../DEBATE_SCHEME_V3.md`](../DEBATE_SCHEME_V3.md) §4 · [`../LLM_KEY_PATH.md`](../LLM_KEY_PATH.md) · [`../DEBATE_ARCHITECTURE.md`](../DEBATE_ARCHITECTURE.md) §12 · [`../DEBATE_UX.md`](../DEBATE_UX.md) · [`../GROUNDED_REPLY_PROMPTS.md`](../GROUNDED_REPLY_PROMPTS.md) · [`../PROGRESS_SAVE_SCHEMA.md`](../PROGRESS_SAVE_SCHEMA.md)

## Context

ForgetPhys DebateSession (free / hard) needs OpenAI-compatible chat completions through **LiteLLM**, with **B1 LOCKED**: vendor / gateway keys never reach the browser. Spec v3 left BFF *package placement* open (`apps/web` Vite/SSR route vs `apps/debate-proxy`) while locking the pattern SPA → BFF → LiteLLM.

P1 needs a concrete placement so P1b can mock `POST /api/debate/complete` without a second deployable. Independent rate-limit / school-wide / multi-client proxy may still justify a separate service later.

`debateMode` must stay orthogonal to product shell modes (`worldMap2d` / `chroniclePlate` / `cityPage` / `venue2d`) — see ADR-002 and PRODUCT_FLOW. Overlay lifecycle needs a separate flag so “session open” does not collide with “which debate ruleset.”

## Decision

**Accepted 2026-09-07 (游戏架构 + 游戏设计):**

1. **BFF = (1) `apps/web` internal proxy** — Vite middleware or a small Node handler **colocated** with the SPA. It proxies OpenAI-compatible chat to LiteLLM. Secrets stay **server-only** (`LITELLM_*` never in `VITE_*` / client bundle).
2. **Defer separate `apps/debate-proxy`** until an independent rate-limit, multi-client, or multi-app sharing need appears. Public path should stay `/api/debate/complete` so extraction is a deploy move, not a schema break.
3. **Env (server-only):**
   - `LITELLM_BASE_URL`
   - `LITELLM_API_KEY`
   - `LITELLM_MODEL=forgetphys-debate` (alias; upstream mapping lives in LiteLLM config)
4. **Endpoint sketch:** `POST /api/debate/complete` — **SSE stream** of chat deltas / final `GroundedReply` (P1b may fake-stream canned JSON). Alternate path name `/api/llm/chat` is **not** preferred.
5. **Field name lock — `debateMode`:** values `scripted` | `free` | `hard` only. **Never** overload product shell / `GameMode` ids. Request body may carry `mode` mirroring `debateMode` for the free|hard turn.
6. **Field name lock — `debateSession`:** values `off` | `active`. This is an **overlay** on the current venue — it does **not** replace `debateMode`. Enter free/hard → `debateSession: active` (while `debateMode` is `free` or `hard`); exit → `debateSession: off` (typically resume `debateMode: scripted`).
7. **Shell `GameMode` stays spatial only** — `worldMap` / `chroniclePlate` / `venue` (and 2D siblings `worldMap2d` / `cityPage` / `venue2d` / `labEmbed`). Debate never becomes a shell mode.

Client path (locked elsewhere): Vercel AI SDK → **this BFF only** → LiteLLM → upstream. No vendor SDKs in the app.

## Consequences

- P1b mock handler lives next to Vite — no second package or deploy unit for P1.
- `debateMode` and `debateSession` are orthogonal: mode = ruleset; session = overlay open/closed. UX / progress / request bodies must not collapse them.
- Shell routing / CameraDirector / PRODUCT_FLOW `GameMode` remain spatial-only; debate overlays Venue2D only.
- School / class rate-limit and multi-app sharing may later extract `apps/debate-proxy` — keep `/api/debate/complete` stable.
- Ops must keep `LITELLM_*` out of client env; CI should fail on accidental `VITE_LITELLM*` / key leaks (see LLM_KEY_PATH).
- Prompt assembly / cite schema: [`../GROUNDED_REPLY_PROMPTS.md`](../GROUNDED_REPLY_PROMPTS.md). Progress keys: [`../PROGRESS_SAVE_SCHEMA.md`](../PROGRESS_SAVE_SCHEMA.md).
- **Accepted** — design docs may proceed; **no runtime BFF code in this docs batch** (implement in a later runtime PR).

## Status

**Accepted** — 2026-09-07 by 游戏架构 + 游戏设计. Placement = `apps/web` internal proxy; `debate-proxy` deferred.
