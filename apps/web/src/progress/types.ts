import type { DebateMode, Locale } from "@physics-chronicle/content";
import { DEFAULT_LOCALE } from "@physics-chronicle/content";
import type { LabEmbedReadout, SlotFill } from "@physics-chronicle/debate";

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

export type DebateSessionDurable = {
  lastExitReason?: "resume" | "jump" | "persuaded" | "budget_exhausted" | "aborted";
  resumeBeatHint?: string | null;
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
