import type { FactStore } from "./fact-store";
import type { EraOpinionStore } from "./era-opinion-store";
import type { RetrieveHit, RetrieveQuery } from "./types";

export interface Retriever {
  retrieve(
    q: RetrieveQuery,
    facts: FactStore,
    eras: EraOpinionStore,
  ): RetrieveHit[];
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 0);
}

function scoreKeys(queryTokens: string[], keys: string[], content: string): number {
  if (queryTokens.length === 0) return 0;
  let score = 0;
  const keyLower = keys.map((k) => k.toLowerCase());
  const contentLower = content.toLowerCase();
  for (const t of queryTokens) {
    for (const k of keyLower) {
      if (k.includes(t) || t.includes(k)) {
        score += 2;
      }
    }
    if (contentLower.includes(t)) score += 1;
  }
  return score;
}

/** P1a keyword / bilingual `keys` retriever. */
export class KeywordRetriever implements Retriever {
  retrieve(
    q: RetrieveQuery,
    facts: FactStore,
    eras: EraOpinionStore,
  ): RetrieveHit[] {
    const tokens = tokenize(q.text);
    const topK = q.topK ?? 8;
    const hits: RetrieveHit[] = [];

    for (const card of facts.list({ era: q.era, venue_tags: q.venue_tags })) {
      const score = scoreKeys(tokens, card.keys, `${card.content} ${card.content_zh}`);
      if (score > 0) {
        hits.push({
          id: card.id,
          store: "fact",
          tier: card.tier,
          snippet: card.content.slice(0, 160),
          score,
        });
      }
    }

    for (const card of eras.list({ era: q.era, venue_tags: q.venue_tags })) {
      const score = scoreKeys(tokens, card.keys, `${card.content} ${card.content_zh}`);
      if (score > 0) {
        hits.push({
          id: card.id,
          store: "era_opinion",
          tier: card.tier,
          snippet: card.content.slice(0, 160),
          score,
        });
      }
    }

    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, topK);
  }
}
