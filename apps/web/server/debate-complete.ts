import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { ensureAnonCookie } from "./anon-cookie";
import {
  chatCompletionsUrl,
  readDebateUpstreamEnv,
  type DebateUpstreamEnv,
} from "./env";
import { endSse, initSse, writeSse } from "./sse";
import { checkAndConsumeQuota, peekQuotaRemaining } from "./quota";

export type DebateCompleteBody = {
  messages?: { role: string; content: string }[];
  modelAlias?: string;
  debateSessionId?: string;
  mode?: "scripted" | "free" | "hard";
  debateSession?: "off" | "active";
  requestId?: string;
  /** Allowed cite ids for post-parse hygiene (optional). */
  allowedCiteIds?: string[];
  /**
   * Stable id for one player turn. Critic retries (K<=2) must reuse the same
   * id so they do not consume extra quota.
   */
  playerTurnId?: string;
};

export type DebateCompleteDeps = {
  env?: DebateUpstreamEnv;
  fetchImpl?: typeof fetch;
};

type GroundedReplyJson = {
  text: string;
  cite: string[];
  challenge_ids?: string[];
};

/**
 * POST /api/debate/complete — SPA → BFF → DeepSeek / LiteLLM (SSE).
 * Keys stay server-side; error bodies never echo secrets.
 */
export async function handleDebateComplete(
  req: IncomingMessage,
  res: ServerResponse,
  deps: DebateCompleteDeps = {},
): Promise<void> {
  const env = deps.env ?? readDebateUpstreamEnv();
  const fetchImpl = deps.fetchImpl ?? fetch;
  const anonId = ensureAnonCookie(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders(req));
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "method_not_allowed" }));
    return;
  }

  let body: DebateCompleteBody;
  try {
    body = JSON.parse(await readBody(req)) as DebateCompleteBody;
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "invalid_json" }));
    return;
  }

  const requestId =
    (typeof body.requestId === "string" && body.requestId.trim()) ||
    randomUUID();
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "messages_required", requestId }));
    return;
  }

  const quotaArgs = {
    anonId,
    debateSessionId: body.debateSessionId,
    mode: body.mode,
    playerTurnId: body.playerTurnId,
  };
  const quota = checkAndConsumeQuota(quotaArgs);

  initSse(res);
  writeSse(res, "meta", {
    requestId,
    modelAlias: body.modelAlias ?? env.modelAlias,
    debateSessionId: body.debateSessionId ?? null,
    mode: body.mode ?? null,
    anonId,
    quotaRemaining: quota.ok ? quota.quotaRemaining : 0,
  });

  try {
    if (!quota.ok) {
      writeSse(res, "error", {
        code: quota.code,
        message: quota.message,
        requestId,
        quotaRemaining: 0,
      });
      endSse(res);
      return;
    }

    if (env.mock) {
      await streamMock(res, body, requestId, quota.quotaRemaining);
      endSse(res);
      return;
    }

    if (!env.apiKey) {
      writeSse(res, "error", {
        code: "missing_api_key",
        message:
          "Server missing DEEPSEEK_API_KEY (or LITELLM_API_KEY). Set it in gitignored .env — then retry. Offline: DEBATE_BFF_MOCK=1.",
        requestId,
        quotaRemaining: quota.quotaRemaining,
      });
      endSse(res);
      return;
    }

    let upstream: Awaited<ReturnType<typeof callUpstream>>;
    try {
      upstream = await callUpstream({
        env,
        messages,
        fetchImpl,
        signal: abortFromReq(req, 60_000),
      });
    } catch (err) {
      const aborted =
        (err instanceof Error && err.name === "AbortError") ||
        (typeof err === "object" &&
          err !== null &&
          "name" in err &&
          (err as { name: string }).name === "TimeoutError");
      writeSse(res, "error", {
        code: aborted ? "upstream_timeout" : "bff_error",
        message: aborted
          ? "Upstream model timed out. Check network / DEBATE_BFF_MOCK=1 for offline."
          : sanitizeErrorMessage(
              err instanceof Error ? err.message : "unknown_error",
            ),
        requestId,
        quotaRemaining: peekQuotaRemaining(quotaArgs),
      });
      endSse(res);
      return;
    }

    if (!upstream.ok) {
      const status = upstream.status;
      const message =
        status === 401 || status === 403
          ? "Upstream rejected the API key (401/403). Check DEEPSEEK_API_KEY in gitignored .env."
          : upstream.message;
      writeSse(res, "error", {
        code:
          status === 401 || status === 403 ? "upstream_auth" : "upstream_error",
        message,
        requestId,
        status,
        quotaRemaining: peekQuotaRemaining(quotaArgs),
      });
      endSse(res);
      return;
    }

    let assembled = "";
    for await (const chunk of upstream.deltas) {
      assembled += chunk;
      writeSse(res, "delta", { text: chunk, requestId });
    }

    const draft = parseGroundedReply(assembled, body.allowedCiteIds);
    writeSse(res, "final", {
      ...draft,
      requestId,
      quotaRemaining: quota.quotaRemaining,
    });
    endSse(res);
  } catch (err) {
    const message =
      err instanceof Error ? sanitizeErrorMessage(err.message) : "unknown_error";
    writeSse(res, "error", {
      code: "bff_error",
      message,
      requestId,
      quotaRemaining: peekQuotaRemaining(quotaArgs),
    });
    endSse(res);
  }
}

async function streamMock(
  res: ServerResponse,
  body: DebateCompleteBody,
  requestId: string,
  quotaRemaining = 19,
): Promise<void> {
  const cite =
    body.allowedCiteIds?.slice(0, 2) ??
    (body.mode === "hard" ? ["fact-mock-1"] : []);
  const text =
    '{"text":"I have a card for the large-angle scattering — I will not invent numbers.","cite":' +
    JSON.stringify(cite) +
    ',"challenge_ids":[]}';
  for (const part of chunkString(text, 24)) {
    writeSse(res, "delta", { text: part, requestId });
  }
  writeSse(res, "final", {
    ...parseGroundedReply(text, body.allowedCiteIds),
    requestId,
    quotaRemaining,
  });
}

async function callUpstream(args: {
  env: DebateUpstreamEnv;
  messages: { role: string; content: string }[];
  fetchImpl: typeof fetch;
  signal?: AbortSignal;
}): Promise<
  | { ok: true; deltas: AsyncIterable<string> }
  | { ok: false; status: number; message: string }
> {
  const url = chatCompletionsUrl(args.env.baseUrl);
  const res = await args.fetchImpl(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${args.env.apiKey}`,
    },
    body: JSON.stringify({
      model: args.env.model,
      messages: args.messages,
      stream: true,
      temperature: 0.3,
    }),
    signal: args.signal,
  });

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    return {
      ok: false,
      status: res.status,
      message: sanitizeErrorMessage(
        `Upstream ${res.status}: ${raw.slice(0, 200) || res.statusText}`,
      ),
    };
  }

  if (!res.body) {
    return { ok: false, status: 502, message: "Upstream returned empty body" };
  }

  return { ok: true, deltas: iterateOpenAiSse(res.body) };
}

async function* iterateOpenAiSse(
  body: ReadableStream<Uint8Array>,
): AsyncIterable<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[];
        };
        const piece = json.choices?.[0]?.delta?.content;
        if (typeof piece === "string" && piece.length) yield piece;
      } catch {
        // skip malformed chunk
      }
    }
  }
}

export function parseGroundedReply(
  raw: string,
  allowedCiteIds?: string[],
): GroundedReplyJson {
  const extracted = extractJsonObject(raw);
  if (!extracted) {
    return {
      text: raw.trim() || "(empty model output)",
      cite: [],
    };
  }
  try {
    const parsed = JSON.parse(extracted) as Partial<GroundedReplyJson>;
    const text = typeof parsed.text === "string" ? parsed.text.trim() : "";
    let cite = Array.isArray(parsed.cite)
      ? parsed.cite.filter((c): c is string => typeof c === "string")
      : [];
    let challenge_ids = Array.isArray(parsed.challenge_ids)
      ? parsed.challenge_ids.filter((c): c is string => typeof c === "string")
      : undefined;
    if (allowedCiteIds && allowedCiteIds.length) {
      const allow = new Set(allowedCiteIds);
      cite = cite.filter((id) => allow.has(id));
      if (challenge_ids) {
        challenge_ids = challenge_ids.filter((id) => allow.has(id));
      }
    }
    return {
      text: text || "(empty text field)",
      cite,
      ...(challenge_ids && challenge_ids.length ? { challenge_ids } : {}),
    };
  } catch {
    return { text: raw.trim() || "(unparseable)", cite: [] };
  }
}

function extractJsonObject(raw: string): string | null {
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1] : raw;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  return candidate.slice(start, end + 1);
}

function sanitizeErrorMessage(msg: string): string {
  return msg
    .replace(/sk-[a-zA-Z0-9]+/g, "[redacted]")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]");
}

function chunkString(s: string, size: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += size) out.push(s.slice(i, i + size));
  return out;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function abortFromReq(
  req: IncomingMessage,
  timeoutMs?: number,
): AbortSignal {
  const ac = new AbortController();
  req.on("close", () => {
    if (!req.complete) ac.abort();
  });
  if (timeoutMs && timeoutMs > 0) {
    const t = setTimeout(() => ac.abort(), timeoutMs);
    if (typeof t === "object" && t && "unref" in t) {
      (t as NodeJS.Timeout).unref();
    }
  }
  return ac.signal;
}

function corsHeaders(req: IncomingMessage): Record<string, string> {
  const origin = req.headers.origin;
  return {
    ...(typeof origin === "string"
      ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
      : {}),
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
