export type {
  DebateSessionState,
  CardId,
  SlotId,
  PersonaId,
  CiteSet,
  LabEmbedReadout,
  RetrieveQuery,
  RetrieveHit,
  CriticVerdict,
  GroundedReplyDraft,
  SlotFill,
  EvidenceBoardSnapshot,
  JudgeOutcome,
  SessionPhase,
  DebateSessionConfig,
  GroundedReplyRequest,
  GroundedReplyTransport,
  CriticPolicyOptions,
  DebateMode,
  FactCard,
  EraOpinionCard,
  HardSlotsFile,
  PersonaCard,
  FactTier,
  EraTier,
} from "./types";

export {
  DEFAULT_LARGE_ANGLE_DEG_THRESHOLD,
  DEFAULT_FORWARD_MAJORITY_MIN,
  DEFAULT_TURN_BUDGET_FREE,
  DEFAULT_TURN_BUDGET_HARD,
} from "./types";

export {
  InMemoryFactStore,
  type FactStore,
} from "./fact-store";

export {
  InMemoryEraOpinionStore,
  type EraOpinionStore,
} from "./era-opinion-store";

export {
  KeywordRetriever,
  type Retriever,
} from "./retriever";

export {
  RulesCriticPolicy,
  labEmbedCandidateSlots,
  type CriticPolicy,
  type CriticContext,
} from "./critic-policy";

export {
  InMemoryEvidenceBoard,
  type EvidenceBoard,
} from "./evidence-board";

export {
  RulesJudge,
  type Judge,
} from "./judge";

export {
  StubGroundedReply,
  noopGroundedReplyTransport,
  type GroundedReply,
} from "./grounded-reply";

export {
  createDebateSession,
  previewLabEmbedSlots,
  type DebateSession,
  type DebateSessionDeps,
} from "./session";

export { createCouplandDebateRuntime } from "./coupland";

// Re-export venue normalize from content for convenience
export { normalizeVenueId } from "@physics-chronicle/content";
