import type { DebateMode } from "@physics-chronicle/content";
import type { LabEmbedReadout, SlotFill } from "@physics-chronicle/debate";

export type ProgressUnlock = {
  labEmbedVisit: boolean;
  freeUnlocked: boolean;
  hardUnlocked: boolean;
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

export type DebateSessionDurable = {
  lastExitReason?: "resume" | "jump" | "persuaded" | "budget_exhausted" | "aborted";
  resumeBeatHint?: string | null;
};

export type ChapterProgress = {
  v: 1;
  chapterId: string;
  unlock: ProgressUnlock;
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
