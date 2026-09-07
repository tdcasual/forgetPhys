import type {
  DebateMode,
  EraOpinionCard,
  FactCard,
  FactTier,
  HardSlotsFile,
  PersonaCard,
  EraTier,
} from "@physics-chronicle/content";

export type {
  DebateMode,
  EraOpinionCard,
  FactCard,
  FactTier,
  HardSlotsFile,
  PersonaCard,
  EraTier,
};

export type DebateSessionState = "off" | "active";

export type CardId = string;
export type SlotId = string;
export type PersonaId = string;

export interface CiteSet {
  cite: CardId[];
  challenge_ids?: CardId[];
}

export interface LabEmbedReadout {
  kind: "alpha_scatter_summary" | string;
  angle_deg?: number;
  fraction_forward?: number;
  large_angle_count?: number;
}

export interface RetrieveQuery {
  text: string;
  mode: DebateMode;
  era?: string;
  venue_tags?: string[];
  open_slots?: SlotId[];
  topK?: number;
}

export interface RetrieveHit {
  id: CardId;
  store: "fact" | "era_opinion";
  tier: FactTier | EraTier;
  snippet: string;
  score: number;
}

export type CriticVerdict =
  | { ok: true }
  | { ok: false; reasons: string[] };

export interface GroundedReplyDraft {
  text: string;
  cite: CardId[];
  challenge_ids?: CardId[];
}

export interface SlotFill {
  slotId: SlotId;
  factId?: CardId;
  labEmbedKind?: string;
  source: "fact" | "labEmbed" | "npc_cite" | "player_propose";
  turnIndex: number;
}

export interface EvidenceBoardSnapshot {
  venueId: string;
  fills: SlotFill[];
  filledCount: number;
  criticPassCount: number;
}

export type JudgeOutcome =
  | "continue"
  | "persuaded"
  | "budget_exhausted"
  | "aborted";

export type SessionPhase =
  | "idle_scripted"
  | "debate_free"
  | "debate_hard"
  | "persuaded"
  | "budget_exhausted"
  | "aborted";

export interface DebateSessionConfig {
  venueId: string;
  mode: DebateMode;
  turnBudgetFree?: number;
  turnBudgetHard?: number;
  hardSlots?: HardSlotsFile;
}

export interface GroundedReplyRequest {
  persona: PersonaCard;
  mode: DebateMode;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  hits: RetrieveHit[];
  debateSessionId: string;
  path?: "short" | "essay";
}

export interface GroundedReplyTransport {
  complete(
    req: GroundedReplyRequest,
  ): AsyncIterable<string> | Promise<GroundedReplyDraft>;
}

export interface CriticPolicyOptions {
  /** Degrees; angle_deg >= threshold may fill large-angle slot. Default 90. */
  largeAngleDegThreshold?: number;
  /** fraction_forward >= this may fill forward-majority. Default 0.5. */
  forwardMajorityMin?: number;
}

export const DEFAULT_LARGE_ANGLE_DEG_THRESHOLD = 90;
export const DEFAULT_FORWARD_MAJORITY_MIN = 0.5;
export const DEFAULT_TURN_BUDGET_FREE = 20;
export const DEFAULT_TURN_BUDGET_HARD = 12;
