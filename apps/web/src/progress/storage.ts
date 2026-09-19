import type { DebateMode } from "@physics-chronicle/content";
import { normalizeVenueId } from "@physics-chronicle/content";
import type { Locale } from "@physics-chronicle/content";
import { DEFAULT_LOCALE, isLocale } from "@physics-chronicle/content";
import {
  classifyLabReadout,
  type ClassifiedLabReadout,
  type LabEmbedReadout,
  type SlotFill,
} from "@physics-chronicle/debate";
import {
  DEFAULT_CHAPTER_ID,
  DEFAULT_PROGRESS_SETTINGS,
  type ChapterProgress,
  type DebateSessionDurable,
  type VenueEvidenceBoardSave,
  type VenueLastLabReadout,
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
      lodgeComplete: false,
      quizPassed: false,
      teaserSeen: false,
    },
    settings: { ...DEFAULT_PROGRESS_SETTINGS },
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
    const lastRaw = isObject(blob.lastLabReadout) ? blob.lastLabReadout : null;
    let lastLabReadout: VenueLastLabReadout | null | undefined;
    if (lastRaw) {
      const readoutObj = isObject(lastRaw.readout) ? lastRaw.readout : null;
      if (readoutObj && typeof readoutObj.kind === "string") {
        const contracts = Array.isArray(lastRaw.contracts)
          ? lastRaw.contracts.filter((c): c is string => typeof c === "string")
          : [];
        lastLabReadout = {
          readout: readoutObj as unknown as LabEmbedReadout,
          contracts: contracts as VenueLastLabReadout["contracts"],
          weak: Boolean(lastRaw.weak),
          source:
            lastRaw.source === "simulated" ? "simulated" : "lab_embed",
          receivedAt:
            typeof lastRaw.receivedAt === "string"
              ? lastRaw.receivedAt
              : new Date().toISOString(),
        };
      }
    } else if (blob.lastLabReadout === null) {
      lastLabReadout = null;
    }
    const softChoiceTags = Array.isArray(blob.softChoiceTags)
      ? blob.softChoiceTags.filter((t): t is string => typeof t === "string")
      : undefined;
    durableByVenue[normalizeVenueId(vid)] = {
      lastExitReason:
        typeof blob.lastExitReason === "string"
          ? (blob.lastExitReason as never)
          : undefined,
      resumeBeatHint:
        typeof blob.resumeBeatHint === "string" || blob.resumeBeatHint === null
          ? (blob.resumeBeatHint as string | null)
          : undefined,
      lastLabReadout,
      softChoiceTags,
    };
  }

  const settingsRaw = isObject(raw.settings) ? raw.settings : {};
  const locale: Locale = isLocale(settingsRaw.locale)
    ? settingsRaw.locale
    : DEFAULT_LOCALE;

  return {
    v: 1,
    chapterId:
      typeof raw.chapterId === "string" ? raw.chapterId : chapterId,
    unlock: {
      labEmbedVisit: Boolean(unlock.labEmbedVisit),
      freeUnlocked: Boolean(unlock.freeUnlocked),
      hardUnlocked: Boolean(unlock.hardUnlocked),
      lodgeComplete: Boolean(unlock.lodgeComplete),
      quizPassed: Boolean(unlock.quizPassed),
      teaserSeen: Boolean(unlock.teaserSeen),
    },
    settings: { locale },
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


export function setLocale(
  progress: ChapterProgress,
  locale: Locale,
): ChapterProgress {
  return {
    ...progress,
    settings: {
      ...progress.settings,
      locale,
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


export function saveLastLabReadout(
  progress: ChapterProgress,
  venueId: string,
  classified: ClassifiedLabReadout,
): ChapterProgress {
  const canon = normalizeVenueId(venueId);
  const prev = progress.debateSession.durable.byVenue[canon] ?? {};
  const lastLabReadout: VenueLastLabReadout = {
    readout: classified.readout,
    contracts: classified.contracts,
    weak: classified.weak,
    source: classified.source,
    receivedAt: new Date().toISOString(),
  };
  return {
    ...progress,
    debateSession: {
      ...progress.debateSession,
      durable: {
        byVenue: {
          ...progress.debateSession.durable.byVenue,
          [canon]: {
            ...prev,
            lastLabReadout,
          },
        },
      },
    },
  };
}

export function getLastLabReadout(
  progress: ChapterProgress,
  venueId: string,
): VenueLastLabReadout | null {
  return (
    progress.debateSession.durable.byVenue[normalizeVenueId(venueId)]
      ?.lastLabReadout ?? null
  );
}

/** Restore pending readout for session; re-classify with current thresholds. */
export function restorePendingLabEmbed(
  progress: ChapterProgress,
  venueId: string,
): ClassifiedLabReadout | null {
  const last = getLastLabReadout(progress, venueId);
  if (!last?.readout) return null;
  return classifyLabReadout(last.readout, { source: last.source });
}

export function appendSoftChoiceTags(
  progress: ChapterProgress,
  venueId: string,
  tags: string[],
): ChapterProgress {
  if (!tags.length) return progress;
  const canon = normalizeVenueId(venueId);
  const prev: DebateSessionDurable =
    progress.debateSession.durable.byVenue[canon] ?? {};
  const merged = [...new Set([...(prev.softChoiceTags ?? []), ...tags])];
  return {
    ...progress,
    debateSession: {
      ...progress.debateSession,
      durable: {
        byVenue: {
          ...progress.debateSession.durable.byVenue,
          [canon]: {
            ...prev,
            softChoiceTags: merged,
          },
        },
      },
    },
  };
}

/** M3.5 — mark Coupland lodge pedagogy complete (soft gate for teaser). */
export function markLodgeComplete(progress: ChapterProgress): ChapterProgress {
  if (progress.unlock.lodgeComplete) return progress;
  return {
    ...progress,
    unlock: {
      ...progress.unlock,
      lodgeComplete: true,
    },
  };
}

/** M3.5 — exit quiz passed (≥ passNeed correct). */
export function markQuizPassed(progress: ChapterProgress): ChapterProgress {
  if (progress.unlock.quizPassed) return progress;
  return {
    ...progress,
    unlock: {
      ...progress.unlock,
      quizPassed: true,
    },
  };
}

/** M3.5 — Bohr locked teaser was displayed on city page. */
export function markTeaserSeen(progress: ChapterProgress): ChapterProgress {
  if (progress.unlock.teaserSeen) return progress;
  return {
    ...progress,
    unlock: {
      ...progress.unlock,
      teaserSeen: true,
    },
  };
}
