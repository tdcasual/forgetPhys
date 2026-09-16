import type {
  CriticPolicy,
  CriticContext,
} from "./critic-policy";
import type {
  GroundedReplyDraft,
  GroundedReplyRequest,
  GroundedReplyTransport,
  RetrieveHit,
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

export const UNCERTAINTY_EN =
  "I don't have a card for that — I won't invent numbers.";
export const UNCERTAINTY_ZH = "考证库里没有这条，我不能编造数字。";

/**
 * Build chat messages for Free/Hard GroundedReply (docs/GROUNDED_REPLY_PROMPTS.md).
 * No secrets — content + retrieved snippets only.
 */
export function assembleGroundedReplyMessages(
  req: GroundedReplyRequest,
): { role: "system" | "user" | "assistant"; content: string }[] {
  const systemParts: string[] = [];

  const personaBlock = [
    req.persona.system_prompt?.trim(),
    req.persona.name ? `You speak as ${req.persona.name}.` : "",
    req.persona.era ? `Era context: ${req.persona.era}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
  if (personaBlock) systemParts.push(personaBlock);

  const bans = req.persona.bans ?? [];
  if (bans.length) {
    systemParts.push(`Hard bans (never say): ${bans.join("; ")}`);
  }

  systemParts.push(formatRetrievedSnippets(req.hits));
  systemParts.push(formatModeRules(req));
  systemParts.push(
    [
      "Output schema (JSON only, no prose outside JSON):",
      '{ "text": string, "cite": string[], "challenge_ids"?: string[] }',
      "cite ids MUST be a subset of the retrieved card ids listed above.",
      "Never invent facts, numbers, apparatus, or card ids.",
      "If you cannot ground the claim, use an uncertainty line and cite: [].",
    ].join("\n"),
  );

  if (req.path === "essay") {
    systemParts.push(
      "Path: Watson essay — substantial written rebuttal; may reference multiple open evidence slots; essay alone does not win; still cite Facts.",
    );
  }

  const system = systemParts.filter(Boolean).join("\n\n");
  const out: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: system },
  ];
  for (const m of req.messages) {
    if (m.role === "system") continue; // already assembled
    out.push({
      role: m.role,
      content: m.content,
    });
  }
  return out;
}

function formatRetrievedSnippets(hits: RetrieveHit[]): string {
  if (!hits.length) {
    return "Retrieved snippets: (none — prefer uncertainty; do not invent).";
  }
  const lines = hits.map(
    (h) =>
      `- [${h.id}] store=${h.store} tier=${h.tier} score=${h.score.toFixed(2)} :: ${h.snippet}`,
  );
  return `Retrieved snippets (cite ONLY these ids):\n${lines.join("\n")}`;
}

function formatModeRules(req: GroundedReplyRequest): string {
  if (req.mode === "hard") {
    return [
      "Mode: hard",
      "- Fact / labEmbed cites may support EvidenceBoard fills.",
      "- era_opinion may color speech or challenge_ids but NEVER fills slots.",
      "- Measurable claims need Fact cites whose text supports the numbers.",
    ].join("\n");
  }
  return [
    "Mode: free",
    "- Cite speech only; EvidenceBoard is ghost preview — no durable fills.",
    "- Still cite-or-refuse; never invent facts.",
  ].join("\n");
}

export function uncertaintyDraft(locale: "en" | "zh" = "en"): GroundedReplyDraft {
  return {
    text: locale === "zh" ? UNCERTAINTY_ZH : UNCERTAINTY_EN,
    cite: [],
  };
}

/**
 * Cite-or-retry GroundedReply for Free/Hard.
 * Transport (apps/web BFF) supplies the model output; CriticPolicy gates cites.
 */
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
        last = {
          text,
          cite: req.hits
            .filter((h) => h.store === "fact")
            .map((h) => h.id)
            .slice(0, 3),
        };
      } else {
        last = result;
      }

      // Critic first (invented cite ids must fail), then hygiene for accepted drafts
      const ctx: CriticContext = {
        mode: req.mode,
        hits: req.hits,
        reply: last,
      };
      const verdict = policy.check(ctx);
      if (!verdict.ok) continue;

      const allow = new Set(req.hits.map((h) => h.id));
      last = {
        ...last,
        cite: (last.cite ?? []).filter((id) => allow.has(id)),
        challenge_ids: last.challenge_ids?.filter((id) => allow.has(id)),
      };
      return last;
    }

    // After K=2 fail — never invent; fixed uncertainty template
    return uncertaintyDraft("en");
  }
}

function isAsyncIterable(v: unknown): v is AsyncIterable<string> {
  return (
    v != null &&
    typeof v === "object" &&
    Symbol.asyncIterator in (v as object)
  );
}
