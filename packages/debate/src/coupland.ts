import {
  loadCouplandDebatePack,
  normalizeVenueId,
} from "@physics-chronicle/content";
import { InMemoryFactStore } from "./fact-store";
import { InMemoryEraOpinionStore } from "./era-opinion-store";
import { KeywordRetriever } from "./retriever";
import { RulesCriticPolicy } from "./critic-policy";
import { InMemoryEvidenceBoard } from "./evidence-board";
import { RulesJudge } from "./judge";
import { createDebateSession, type DebateSession } from "./session";
import type { DebateSessionDeps } from "./session";

/** Wire Coupland α cards into a ready DebateSession (state off until enter). */
export function createCouplandDebateRuntime(): {
  session: DebateSession;
  deps: DebateSessionDeps;
  venueId: string;
} {
  const pack = loadCouplandDebatePack();
  const venueId = normalizeVenueId(pack.hardSlots.venue_id);

  const facts = new InMemoryFactStore(pack.facts.cards, {
    [pack.facts.id]: () => pack.facts.cards,
  });
  const eras = new InMemoryEraOpinionStore(pack.eraOpinions.cards, {
    [pack.eraOpinions.id]: () => pack.eraOpinions.cards,
  });
  const retriever = new KeywordRetriever();
  const policy = new RulesCriticPolicy(
    { largeAngleDegThreshold: 90 },
    eras,
  );
  const board = new InMemoryEvidenceBoard();
  const judge = new RulesJudge();

  const deps: DebateSessionDeps = {
    facts,
    eras,
    retriever,
    policy,
    board,
    judge,
    hardSlots: pack.hardSlots,
  };

  const session = createDebateSession(deps);
  return { session, deps, venueId };
}
