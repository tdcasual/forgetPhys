import type {
  GroundedReplyDraft,
  GroundedReplyRequest,
  GroundedReplyTransport,
} from "@physics-chronicle/debate";
import { assembleGroundedReplyMessages } from "@physics-chronicle/debate";

const MODEL_ALIAS = "forgetphys-debate";

export type BffTransportOptions = {
  /** Override fetch (tests). */
  fetchImpl?: typeof fetch;
  /** Endpoint path; default same-origin BFF. */
  url?: string;
  signal?: AbortSignal;
};

/**
 * SPA → apps/web BFF only. Browser holds zero vendor keys.
 */
export function createBffGroundedReplyTransport(
  opts: BffTransportOptions = {},
): GroundedReplyTransport {
  const url = opts.url ?? "/api/debate/complete";
  const fetchImpl = opts.fetchImpl ?? fetch;

  return {
    async complete(req: GroundedReplyRequest): Promise<GroundedReplyDraft> {
      const requestId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `req-${Date.now()}`;
      const messages = assembleGroundedReplyMessages(req);
      const allowedCiteIds = req.hits.map((h) => h.id);

      const res = await fetchImpl(url, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        signal: opts.signal,
        body: JSON.stringify({
          messages,
          modelAlias: MODEL_ALIAS,
          debateSessionId: req.debateSessionId,
          mode: req.mode === "scripted" ? "free" : req.mode,
          debateSession: "active",
          requestId,
          allowedCiteIds,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`BFF HTTP ${res.status}: ${text.slice(0, 120)}`);
      }

      const ctype = res.headers.get("content-type") ?? "";
      if (!ctype.includes("text/event-stream") || !res.body) {
        // Non-SSE fallback (JSON error / mock)
        const json = (await res.json().catch(() => null)) as
          | GroundedReplyDraft
          | { error?: string }
          | null;
        if (json && "text" in json && typeof json.text === "string") {
          return {
            text: json.text,
            cite: Array.isArray(json.cite) ? json.cite : [],
            challenge_ids: json.challenge_ids,
          };
        }
        throw new Error(
          `BFF expected SSE, got ${ctype || "unknown"} (${JSON.stringify(json)?.slice(0, 80)})`,
        );
      }

      return consumeDebateSse(res.body, opts.signal);
    },
  };
}

async function consumeDebateSse(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): Promise<GroundedReplyDraft> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalDraft: GroundedReplyDraft | null = null;
  let lastError: string | null = null;

  const onAbort = () => {
    void reader.cancel().catch(() => undefined);
  };
  signal?.addEventListener("abort", onAbort, { once: true });

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const block of parts) {
        const event = parseSseBlock(block);
        if (!event) continue;
        if (event.event === "final") {
          const data = event.data as Partial<GroundedReplyDraft>;
          finalDraft = {
            text: typeof data.text === "string" ? data.text : "",
            cite: Array.isArray(data.cite) ? data.cite : [],
            challenge_ids: Array.isArray(data.challenge_ids)
              ? data.challenge_ids
              : undefined,
          };
        } else if (event.event === "error") {
          const data = event.data as { message?: string; code?: string };
          lastError = data.message || data.code || "bff_error";
        } else if (event.event === "done") {
          // end
        }
      }
    }
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }

  if (finalDraft) return finalDraft;
  throw new Error(lastError || "BFF stream ended without final event");
}

function parseSseBlock(
  block: string,
): { event: string; data: unknown } | null {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  if (!dataLines.length) return null;
  try {
    return { event, data: JSON.parse(dataLines.join("\n")) };
  } catch {
    return { event, data: dataLines.join("\n") };
  }
}
