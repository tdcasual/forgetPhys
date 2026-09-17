# Debate BFF SSE contract

Status: **P2 live path** · 2026-09-16  
Related: [`adr/0003-debate-bff.md`](./adr/0003-debate-bff.md) · [`adr/0005-debate-sse-auth.md`](./adr/0005-debate-sse-auth.md) · [`LLM_KEY_PATH.md`](./LLM_KEY_PATH.md) · [`GROUNDED_REPLY_PROMPTS.md`](./GROUNDED_REPLY_PROMPTS.md)

## Endpoint

```
POST /api/debate/complete
Content-Type: application/json
Accept: text/event-stream
Credentials: same-origin (anon-local HttpOnly cookie)
```

### Request body

| Field | Required | Notes |
|---|---|---|
| `messages` | **yes** | OpenAI-style `{ role, content }[]` (assembled by SPA via `assembleGroundedReplyMessages`) |
| `modelAlias` | no | Default `forgetphys-debate` |
| `debateSessionId` | no | Correlation id |
| `mode` | no | `free` \| `hard` (mirrors `debateMode`) |
| `debateSession` | no | `off` \| `active` overlay flag — do not overload `mode` |
| `requestId` | no | Client-generated; echoed in SSE `meta` / errors |
| `allowedCiteIds` | no | Hit ids for server-side cite hygiene |
| `playerTurnId` | no | Stable player-turn id; Critic retries reuse it (no extra quota) |

### Response — SSE events

| Event | Data | When |
|---|---|---|
| `meta` | `{ requestId, modelAlias, debateSessionId, mode, anonId, quotaRemaining }` | First |
| `delta` | `{ text, requestId }` | Token / chunk deltas |
| `final` | `{ text, cite, challenge_ids?, requestId, quotaRemaining }` | Parsed `GroundedReply` |
| `error` | `{ code, message, requestId, status?, quotaRemaining? }` | Failures (**never** echoes API keys). `budget_exhausted` / `missing_api_key` / `upstream_auth` / `upstream_timeout` are player-readable. |
| `done` | `{}` | Stream end |

Abort: client `AbortController` aborts the fetch; BFF aborts upstream when the request socket closes.

## Upstream (P2)

BFF prefers:

1. `LITELLM_BASE_URL` (default `https://api.deepseek.com`)
2. `DEEPSEEK_API_KEY` (or `LITELLM_API_KEY` fallback)
3. Model: env `LITELLM_MODEL` (default `deepseek/deepseek-chat`); alias `forgetphys-debate` maps to DeepSeek chat. Official DeepSeek host strips the `deepseek/` prefix.

Local LiteLLM gateway still OK: point `LITELLM_BASE_URL` at the gateway and keep alias mapping in `tools/litellm/litellm_config.yaml`.

`DEBATE_BFF_MOCK=1` → canned SSE without upstream (tests / offline).


## Quota (M3.1 Accepted)

| Mode | Cap (LLM turns / DebateSession) |
|------|----------------------------------|
| free | 20 |
| hard | 12 |
| scripted | 0 |

Enforced in `apps/web/server/quota.ts`. Critic retries (K≤2) sharing `playerTurnId` do not consume an extra turn.
