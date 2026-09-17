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

export class BffTransportError extends Error {
  readonly code: string;
  readonly quotaRemaining?: number;
  constructor(message: string, code: string, quotaRemaining?: number) {
    super(message);
    this.name = "BffTransportError";
    this.code = code;
    this.quotaRemaining = quotaRemaining;
  }
}

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

      let res: Response;
      try {
        res = await fetchImpl(url, {
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
            playerTurnId: req.playerTurnId,
          }),
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          throw new BffTransportError(
            "Request aborted (timeout or navigation).",
            "aborted",
          );
        }
        throw new BffTransportError(
          err instanceof Error
            ? `Network error talking to debate BFF: ${err.message}`
            : "Network error talking to debate BFF.",
          "network_error",
        );
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new BffTransportError(
          `Debate BFF HTTP ${res.status}: ${text.slice(0, 160) || res.statusText}`,
          "http_error",
        );
      }

      const ctype = res.headers.get("content-type") ?? "";
      if (!ctype.includes("text/event-stream") || !res.body) {
        const json = (await res.json().catch(() => null)) as
          | GroundedReplyDraft
          | { error?: string; message?: string }
          | null;
        if (json && "text" in json && typeof json.text === "string") {
          return {
            text: json.text,
            cite: Array.isArray(json.cite) ? json.cite : [],
            challenge_ids: json.challenge_ids,
            quotaRemaining:
              typeof (json as { quotaRemaining?: number }).quotaRemaining ===
              "number"
                ? (json as { quotaRemaining: number }).quotaRemaining
                : undefined,
          };
        }
        throw new BffTransportError(
          `Debate BFF expected SSE, got ${ctype || "unknown"} (${JSON.stringify(json)?.slice(0, 100)})`,
          "bad_response",
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
  let lastCode = "bff_error";
  let quotaRemaining: number | undefined;

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
        if (event.event === "meta") {
          const data = event.data as { quotaRemaining?: number };
          if (typeof data.quotaRemaining === "number") {
            quotaRemaining = data.quotaRemaining;
          }
        } else if (event.event === "final") {
          const data = event.data as Partial<GroundedReplyDraft> & {
            quotaRemaining?: number;
          };
          if (typeof data.quotaRemaining === "number") {
            quotaRemaining = data.quotaRemaining;
          }
          finalDraft = {
            text: typeof data.text === "string" ? data.text : "",
            cite: Array.isArray(data.cite) ? data.cite : [],
            challenge_ids: Array.isArray(data.challenge_ids)
              ? data.challenge_ids
              : undefined,
            quotaRemaining,
          };
        } else if (event.event === "error") {
          const data = event.data as {
            message?: string;
            code?: string;
            quotaRemaining?: number;
          };
          lastError = data.message || data.code || "bff_error";
          lastCode = data.code || "bff_error";
          if (typeof data.quotaRemaining === "number") {
            quotaRemaining = data.quotaRemaining;
          }
        }
      }
    }
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }

  if (finalDraft) {
    return {
      ...finalDraft,
      quotaRemaining:
        finalDraft.quotaRemaining ?? quotaRemaining,
    };
  }
  throw new BffTransportError(
    lastError || "Debate BFF stream ended without a final event.",
    lastCode,
    quotaRemaining,
  );
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
