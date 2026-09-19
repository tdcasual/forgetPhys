import type { DebateMode, Locale } from "@physics-chronicle/content";
import { DEFAULT_LOCALE } from "@physics-chronicle/content";
import type {
  LabEmbedReadout,
  LabReadoutContractId,
  LabReadoutSource,
  SlotFill,
} from "@physics-chronicle/debate";

export type ProgressUnlock = {
  labEmbedVisit: boolean;
  freeUnlocked: boolean;
  hardUnlocked: boolean;
};

export type ProgressSettings = {
  /** Single switch for UI + dialogue (ADR-0006). Default `en`. */
  locale: Locale;
};

export type VenueEvidenceBoardSave = {
  fills: Record<
    string,
    {
      source: SlotFill["source"];
      kind?: string;
      cite: string[];
      measurement?: Partial<LabEmbedReadout>;
      filledAt: string;
    }
  >;
  criticPassCount: number;
  updatedAt: string;
};

/** M3.2 — last classified lab readout for venue (session restore). */
export type VenueLastLabReadout = {
  readout: LabEmbedReadout;
  contracts: LabReadoutContractId[];
  weak: boolean;
  source: LabReadoutSource;
  receivedAt: string;
};

export type DebateSessionDurable = {
  lastExitReason?: "resume" | "jump" | "persuaded" | "budget_exhausted" | "aborted";
  resumeBeatHint?: string | null;
  /** M3.2 thin extend — persist last valid (or weak) readout for restore. */
  lastLabReadout?: VenueLastLabReadout | null;
  /** Soft choice tags accumulated this chapter (pushback / interpretation / …). */
  softChoiceTags?: string[];
};

export type ChapterProgress = {
  v: 1;
  chapterId: string;
  unlock: ProgressUnlock;
  /** Player preferences (locale, …). */
  settings: ProgressSettings;
  debateModeLast: DebateMode;
  debateSession: {
    scratch: null | {
      venueId: string;
      debateMode: DebateMode;
      debateSession: "active";
      turnCount: number;
      ghostFills: Record<string, true>;
      pendingLabEmbed: LabEmbedReadout | null;
    };
    durable: {
      byVenue: Record<string, DebateSessionDurable>;
    };
  };
  evidenceBoard: {
    byVenue: Record<string, VenueEvidenceBoardSave>;
  };
};

export const DEFAULT_CHAPTER_ID = "ch1";

export const DEFAULT_PROGRESS_SETTINGS: ProgressSettings = {
  locale: DEFAULT_LOCALE,
};
