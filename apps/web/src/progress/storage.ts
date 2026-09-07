import type { DebateMode } from "@physics-chronicle/content";
import { normalizeVenueId } from "@physics-chronicle/content";
import type { LabEmbedReadout, SlotFill } from "@physics-chronicle/debate";
import {
  DEFAULT_CHAPTER_ID,
  type ChapterProgress,
  type VenueEvidenceBoardSave,
} from "./types";

const KEY_PREFIX = "forgetphys:progress:v1:";

export function progressStorageKey(chapterId: string = DEFAULT_CHAPTER_ID): string {
  return `${KEY_PREFIX}${chapterId}`;
}

export function emptyProgress(chapterId: string = DEFAULT_CHAPTER_ID): ChapterProgress {
  return {
    v: 1,
    chapterId,
    unlock: {
      labEmbedVisit: false,
      freeUnlocked: false,
      hardUnlocked: false,
    },
    debateModeLast: "scripted",
    debateSession: {
      scratch: null,
      durable: { byVenue: {} },
    },
    evidenceBoard: { byVenue: {} },
  };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v != null && !Array.isArray(v);
}

/** Best-effort parse; corrupt blobs → empty progress. */
export function parseProgress(raw: unknown, chapterId = DEFAULT_CHAPTER_ID): ChapterProgress {
  const base = emptyProgress(chapterId);
  if (!isObject(raw) || raw.v !== 1) return base;

  const unlock = isObject(raw.unlock) ? raw.unlock : {};
  const debateModeLast =
    raw.debateModeLast === "free" ||
    raw.debateModeLast === "hard" ||
    raw.debateModeLast === "scripted"
      ? (raw.debateModeLast as DebateMode)
      : "scripted";

  const evidenceByVenue: ChapterProgress["evidenceBoard"]["byVenue"] = {};
  const eb = isObject(raw.evidenceBoard) ? raw.evidenceBoard : {};
  const byVenue = isObject(eb.byVenue) ? eb.byVenue : {};
  for (const [vid, blob] of Object.entries(byVenue)) {
    if (!isObject(blob)) continue;
    const fillsRaw = isObject(blob.fills) ? blob.fills : {};
    const fills: VenueEvidenceBoardSave["fills"] = {};
    for (const [slotId, fill] of Object.entries(fillsRaw)) {
      if (!isObject(fill)) continue;
      const source = fill.source;
      if (
        source !== "fact" &&
        source !== "labEmbed" &&
        source !== "npc_cite" &&
        source !== "player_propose"
      ) {
        continue;
      }
      fills[slotId] = {
        source,
        kind: typeof fill.kind === "string" ? fill.kind : undefined,
        cite: Array.isArray(fill.cite)
          ? fill.cite.filter((c): c is string => typeof c === "string")
          : [],
        measurement: isObject(fill.measurement)
          ? (fill.measurement as Partial<LabEmbedReadout>)
          : undefined,
        filledAt:
          typeof fill.filledAt === "string"
            ? fill.filledAt
            : new Date().toISOString(),
      };
    }
    evidenceByVenue[normalizeVenueId(vid)] = {
      fills,
      criticPassCount:
        typeof blob.criticPassCount === "number" ? blob.criticPassCount : 0,
      updatedAt:
        typeof blob.updatedAt === "string"
          ? blob.updatedAt
          : new Date().toISOString(),
    };
  }

  const durableByVenue: ChapterProgress["debateSession"]["durable"]["byVenue"] =
    {};
  const ds = isObject(raw.debateSession) ? raw.debateSession : {};
  const durable = isObject(ds.durable) ? ds.durable : {};
  const dBy = isObject(durable.byVenue) ? durable.byVenue : {};
  for (const [vid, blob] of Object.entries(dBy)) {
    if (!isObject(blob)) continue;
    durableByVenue[normalizeVenueId(vid)] = {
      lastExitReason:
        typeof blob.lastExitReason === "string"
          ? (blob.lastExitReason as never)
          : undefined,
      resumeBeatHint:
        typeof blob.resumeBeatHint === "string" || blob.resumeBeatHint === null
          ? (blob.resumeBeatHint as string | null)
          : undefined,
    };
  }

  return {
    v: 1,
    chapterId:
      typeof raw.chapterId === "string" ? raw.chapterId : chapterId,
    unlock: {
      labEmbedVisit: Boolean(unlock.labEmbedVisit),
      freeUnlocked: Boolean(unlock.freeUnlocked),
      hardUnlocked: Boolean(unlock.hardUnlocked),
    },
    debateModeLast,
    debateSession: {
      scratch: null,
      durable: { byVenue: durableByVenue },
    },
    evidenceBoard: { byVenue: evidenceByVenue },
  };
}

export function loadProgress(chapterId = DEFAULT_CHAPTER_ID): ChapterProgress {
  try {
    const raw = localStorage.getItem(progressStorageKey(chapterId));
    if (!raw) return emptyProgress(chapterId);
    return parseProgress(JSON.parse(raw) as unknown, chapterId);
  } catch {
    return emptyProgress(chapterId);
  }
}

export function saveProgress(progress: ChapterProgress): void {
  try {
    localStorage.setItem(
      progressStorageKey(progress.chapterId),
      JSON.stringify(progress),
    );
  } catch {
    /* quota / private mode — ignore */
  }
}

export function markLabEmbedVisit(progress: ChapterProgress): ChapterProgress {
  return {
    ...progress,
    unlock: {
      ...progress.unlock,
      labEmbedVisit: true,
      freeUnlocked: true,
      hardUnlocked: true,
    },
  };
}

export function setDebateModeLast(
  progress: ChapterProgress,
  mode: DebateMode,
): ChapterProgress {
  return { ...progress, debateModeLast: mode };
}

export function saveVenueFills(
  progress: ChapterProgress,
  venueId: string,
  fills: SlotFill[],
  criticPassCount: number,
  measurements?: Record<string, Partial<LabEmbedReadout>>,
): ChapterProgress {
  const canon = normalizeVenueId(venueId);
  const now = new Date().toISOString();
  const fillMap: VenueEvidenceBoardSave["fills"] = {};
  for (const f of fills) {
    fillMap[f.slotId] = {
      source: f.source,
      kind: f.labEmbedKind,
      cite: f.factId ? [f.factId] : [],
      measurement: measurements?.[f.slotId],
      filledAt: now,
    };
  }
  return {
    ...progress,
    evidenceBoard: {
      byVenue: {
        ...progress.evidenceBoard.byVenue,
        [canon]: {
          fills: fillMap,
          criticPassCount,
          updatedAt: now,
        },
      },
    },
  };
}

export function clearChapterProgress(chapterId = DEFAULT_CHAPTER_ID): ChapterProgress {
  const empty = emptyProgress(chapterId);
  saveProgress(empty);
  return empty;
}

export function getVenueBoard(
  progress: ChapterProgress,
  venueId: string,
): VenueEvidenceBoardSave | null {
  return progress.evidenceBoard.byVenue[normalizeVenueId(venueId)] ?? null;
}
