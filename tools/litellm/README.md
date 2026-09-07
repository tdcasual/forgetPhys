# LiteLLM gateway (ForgetPhys debate)

**Locked (2026-09-07):** ForgetPhys uses **LiteLLM** as the OpenAI-compatible LLM gateway. The web app talks **only** to LiteLLM via **Vercel AI SDK** (single `baseURL`). No vendor SDKs in app code.

## Shapes

| Mode | When |
|---|---|
| **Sidecar** | Local/dev: run LiteLLM as Docker or a process next to the app |
| **Remote** | Point env at a LiteLLM URL students/school already host |

## Env (secrets never in this repo)

| Variable | Purpose |
|---|---|
| `LITELLM_BASE_URL` | LiteLLM proxy base (often ends with `/v1`) |
| `OPENAI_COMPATIBLE_BASE_URL` | Accepted alias if it points at the same LiteLLM |
| `LITELLM_API_KEY` / `OPENAI_API_KEY` | Gateway auth — use secret env / deploy secrets only |
| `LITELLM_MODEL` | Alias such as `forgetphys-debate` (mapped in `litellm_config.yaml`) |

## Config

See [`litellm_config.yaml`](./litellm_config.yaml) for placeholder `model_list` aliases. Swap OpenAI ↔ DeepSeek ↔ Ollama by editing that file only; the app keeps calling `forgetphys-debate`.

## P1 scope

- Stub GroundedReply client + this example config.
- **Not** full multi-provider polish.

SillyTavern also speaks Chat Completions — same protocol family; ForgetPhys does **not** fork ST.
