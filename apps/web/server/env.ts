/**
 * Server-only env resolution for debate BFF.
 * Never import this from client / Vite client bundles.
 */

export type DebateUpstreamEnv = {
  baseUrl: string;
  apiKey: string | null;
  /** Model id sent upstream (DeepSeek or LiteLLM). */
  model: string;
  /** Alias the SPA / ADR uses. */
  modelAlias: string;
  mock: boolean;
};

const DEFAULT_BASE = "https://api.deepseek.com";
const DEFAULT_MODEL_ALIAS = "forgetphys-debate";
const DEFAULT_UPSTREAM_MODEL = "deepseek/deepseek-chat";

export function readDebateUpstreamEnv(
  env: NodeJS.ProcessEnv = process.env,
): DebateUpstreamEnv {
  const baseUrl = trimSlash(
    env.LITELLM_BASE_URL?.trim() || DEFAULT_BASE,
  );
  const modelAlias = env.LITELLM_MODEL_ALIAS?.trim() || DEFAULT_MODEL_ALIAS;
  const configuredModel =
    env.LITELLM_MODEL?.trim() || DEFAULT_UPSTREAM_MODEL;
  const apiKey =
    env.DEEPSEEK_API_KEY?.trim() ||
    env.LITELLM_API_KEY?.trim() ||
    null;
  const mock =
    env.DEBATE_BFF_MOCK === "1" ||
    env.DEBATE_BFF_MOCK === "true";

  return {
    baseUrl,
    apiKey,
    model: resolveUpstreamModel(baseUrl, configuredModel, modelAlias),
    modelAlias,
    mock,
  };
}

/** Map forgetphys / LiteLLM-style ids onto DeepSeek official chat model names. */
export function resolveUpstreamModel(
  baseUrl: string,
  configuredModel: string,
  modelAlias: string,
): string {
  const host = baseUrl.toLowerCase();
  const isDeepSeekOfficial =
    host.includes("api.deepseek.com") || host.includes("deepseek.com");

  let model = configuredModel;
  if (model === modelAlias || model === "forgetphys-debate") {
    model = DEFAULT_UPSTREAM_MODEL;
  }

  if (isDeepSeekOfficial) {
    // Official DeepSeek Chat Completions expects `deepseek-chat`, not `deepseek/...`.
    if (model.startsWith("deepseek/")) {
      return model.slice("deepseek/".length);
    }
    if (model === "forgetphys-debate") return "deepseek-chat";
  }

  return model;
}

export function chatCompletionsUrl(baseUrl: string): string {
  const base = trimSlash(baseUrl);
  if (base.endsWith("/v1")) return `${base}/chat/completions`;
  return `${base}/v1/chat/completions`;
}

function trimSlash(s: string): string {
  return s.replace(/\/+$/, "");
}
