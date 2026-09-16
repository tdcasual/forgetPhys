# ADR 0005 — Debate BFF SSE + anon-local auth (P1b default)

Status: **Accepted** · 2026-09-16  
Related: [`0003-debate-bff.md`](./0003-debate-bff.md) · [`../DEBATE_BFF_SSE.md`](../DEBATE_BFF_SSE.md) · [`../LLM_KEY_PATH.md`](../LLM_KEY_PATH.md)

## Context

P1a shipped DebateSession without live LLM. P1b+/P2 need a stable SSE contract and a minimal SPA auth story so the BFF can later attach student quotas without redesigning the client.

## Decision

1. **SSE events** for `POST /api/debate/complete`: `meta` / `delta` / `final` / `error` / `done` — see [`../DEBATE_BFF_SSE.md`](../DEBATE_BFF_SSE.md).
2. **P1b default auth = anon-local HttpOnly cookie** (`fp_anon`). Localhost may omit `Secure`. No vendor keys in the browser.
3. Client may send `requestId` and use `AbortController`; BFF echoes `requestId` on `meta` / `error` / `final`.
4. **P2 live provider = DeepSeek** via server env (`DEEPSEEK_API_KEY`), optionally through LiteLLM alias `forgetphys-debate` — never `VITE_*`.

## Consequences

- School SSO / student tokens can replace anon-local later without changing the SSE event names.
- CI / static tests should fail if client bundles reference `DEEPSEEK_API_KEY` or `VITE_DEEPSEEK*`.
