import type {
  CriticPolicy,
  CriticContext,
} from "./critic-policy";
import type {
  GroundedReplyDraft,
  GroundedReplyRequest,
  GroundedReplyTransport,
} from "./types";

export type { GroundedReplyDraft, GroundedReplyRequest, GroundedReplyTransport };

export interface GroundedReply {
  generate(
    req: GroundedReplyRequest,
    policy: CriticPolicy,
    transport: GroundedReplyTransport,
    opts?: { maxRetries?: number },
  ): Promise<GroundedReplyDraft>;
}

/** P1a: no live LLM — transport is injected (apps/web BFF later). */
export const noopGroundedReplyTransport: GroundedReplyTransport = {
  async complete(_req: GroundedReplyRequest): Promise<GroundedReplyDraft> {
    return { text: "", cite: [] };
  },
};

export class StubGroundedReply implements GroundedReply {
  async generate(
    req: GroundedReplyRequest,
    policy: CriticPolicy,
    transport: GroundedReplyTransport,
    opts?: { maxRetries?: number },
  ): Promise<GroundedReplyDraft> {
    const maxRetries = opts?.maxRetries ?? 2;
    let last: GroundedReplyDraft = { text: "", cite: [] };

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const result = await transport.complete(req);
      if (isAsyncIterable(result)) {
        let text = "";
        for await (const chunk of result) text += chunk;
        last = { text, cite: req.hits.filter((h) => h.store === "fact").map((h) => h.id).slice(0, 3) };
      } else {
        last = result;
      }

      const ctx: CriticContext = {
        mode: req.mode,
        hits: req.hits,
        reply: last,
      };
      const verdict = policy.check(ctx);
      if (verdict.ok) return last;
    }

    return {
      text: last.text || "(uncertainty: could not ground reply after retries)",
      cite: last.cite,
      challenge_ids: last.challenge_ids,
    };
  }
}

function isAsyncIterable(v: unknown): v is AsyncIterable<string> {
  return (
    v != null &&
    typeof v === "object" &&
    Symbol.asyncIterator in (v as object)
  );
}
