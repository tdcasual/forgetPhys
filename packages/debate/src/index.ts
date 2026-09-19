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
  assembleGroundedReplyMessages,
  uncertaintyDraft,
  UNCERTAINTY_EN,
  UNCERTAINTY_ZH,
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

export {
  classifyLabReadout,
  labEmbedFillSlotsFromContracts,
  READOUT_CONTRACT_LARGE_ANGLE,
  READOUT_CONTRACT_FORWARD_MAJORITY,
  READOUT_CONTRACT_WEAK,
  type LabReadoutContractId,
  type LabReadoutSource,
  type ClassifiedLabReadout,
} from "./lab-readout-contracts";

export {
  checkCouplandBenchObservationGate,
  boardHasBenchOrFactObservation,
  boardClaimsConcentration,
  shouldFireBenchObservationChallenge,
  BENCH_OBSERVATION_CLAIM_ID,
  BENCH_OBSERVATION_SLOTS,
  SLOT_LARGE_ANGLE_EXISTS,
  SLOT_FORWARD_MAJORITY,
  SLOT_CHARGE_MASS_CONCENTRATED,
} from "./bench-observation-gate";
