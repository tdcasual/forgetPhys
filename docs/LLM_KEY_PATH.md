# LLM key path — SillyTavern vs ForgetPhys

Status: **B1 LOCKED** 2026-09-07 · Keys never in the browser  
Related: `docs/DEBATE_ARCHITECTURE.md` §12 · `docs/adr/0003-debate-bff.md` (**Accepted**) · `docs/DEBATE_AUDIT_2026-09-07.md` · `docs/GROUNDED_REPLY_PROMPTS.md`

## Pattern (same family)

| System | Who holds provider / gateway keys | Browser role |
|---|---|---|
| **SillyTavern** | Local or remote **Node server** serves the UI; ST holds API keys and calls OpenAI / LiteLLM | Browser talks only to ST — **never** gets provider keys in normal setup |
| **ForgetPhys** | **BFF = `apps/web` internal proxy** (ADR-0003 **Accepted**) holds `LITELLM_API_KEY` and forwards to LiteLLM; separate `apps/debate-proxy` deferred; **OR** school-hosted LiteLLM via session / student token | SPA talks only to BFF or session-authed LiteLLM — **no vendor key in SPA** |

## ForgetPhys live path (locked)

```
Browser (SPA)  →  BFF (apps/web)  →  LiteLLM  →  upstream
                     ↑ holds LITELLM_API_KEY
```

Alternative class deploy: school LiteLLM accepts **session cookie / per-student token** only — still no master vendor key in the SPA.

## Non-negotiables

- Do **not** put `LITELLM_API_KEY` / `OPENAI_API_KEY` / vendor keys in Vite `VITE_*` client env or bundle them into the SPA.
- P1 stub / local mock may skip live keys; **P2 live path must be server-side**.
- Never commit live keys or credentialed `.env` files.

See architecture §12 security subsection for env table and deployment shapes.

## Prompts

Never put API keys, gateway tokens, or `VITE_*` secrets into GroundedReply prompt assemblies — see `docs/GROUNDED_REPLY_PROMPTS.md`.
