/**
 * Server-side student LLM turn quota (M3.1 Accepted caps).
 * Critic retries that reuse the same playerTurnId do not consume an extra turn.
 */

export const QUOTA_CAPS = {
  free: 20,
  hard: 12,
  scripted: 0,
} as const;

export type QuotaMode = keyof typeof QUOTA_CAPS;

type SessionBucket = {
  mode: QuotaMode;
  /** Distinct player-turn ids already counted for this DebateSession. */
  usedTurnIds: Set<string>;
};

/** In-memory per process — fine for local / single-node class deploy. */
const buckets = new Map<string, SessionBucket>();

export type QuotaDecision =
  | { ok: true; quotaRemaining: number; counted: boolean }
  | { ok: false; code: "budget_exhausted"; message: string; quotaRemaining: 0 };

export function quotaCapFor(mode: string | undefined | null): number {
  if (mode === "hard") return QUOTA_CAPS.hard;
  if (mode === "scripted") return QUOTA_CAPS.scripted;
  if (mode === "free") return QUOTA_CAPS.free;
  // Default to free cap when mode omitted (SPA always sends free|hard for live).
  return QUOTA_CAPS.free;
}

function normalizeMode(mode: string | undefined | null): QuotaMode {
  if (mode === "hard") return "hard";
  if (mode === "scripted") return "scripted";
  return "free";
}

function bucketKey(anonId: string, debateSessionId: string | null | undefined): string {
  return `${anonId}::${debateSessionId ?? "no-session"}`;
}

/**
 * Reserve / check a player turn. Same playerTurnId within a session is a
 * Critic retry and does not increment the counter.
 */
export function checkAndConsumeQuota(args: {
  anonId: string;
  debateSessionId?: string | null;
  mode?: string | null;
  playerTurnId?: string | null;
}): QuotaDecision {
  const mode = normalizeMode(args.mode);
  const cap = QUOTA_CAPS[mode];
  const key = bucketKey(args.anonId, args.debateSessionId);
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { mode, usedTurnIds: new Set() };
    buckets.set(key, bucket);
  } else if (bucket.mode !== mode) {
    // Mode switch mid-session — keep counts, apply new cap.
    bucket.mode = mode;
  }

  const turnId =
    (typeof args.playerTurnId === "string" && args.playerTurnId.trim()) ||
    `auto-${bucket.usedTurnIds.size + 1}`;

  if (bucket.usedTurnIds.has(turnId)) {
    return {
      ok: true,
      quotaRemaining: Math.max(0, cap - bucket.usedTurnIds.size),
      counted: false,
    };
  }

  if (bucket.usedTurnIds.size >= cap) {
    return {
      ok: false,
      code: "budget_exhausted",
      message: playerBudgetMessage(mode, cap),
      quotaRemaining: 0,
    };
  }

  bucket.usedTurnIds.add(turnId);
  return {
    ok: true,
    quotaRemaining: Math.max(0, cap - bucket.usedTurnIds.size),
    counted: true,
  };
}

export function peekQuotaRemaining(args: {
  anonId: string;
  debateSessionId?: string | null;
  mode?: string | null;
}): number {
  const mode = normalizeMode(args.mode);
  const cap = QUOTA_CAPS[mode];
  const bucket = buckets.get(bucketKey(args.anonId, args.debateSessionId));
  if (!bucket) return cap;
  return Math.max(0, cap - bucket.usedTurnIds.size);
}

function playerBudgetMessage(mode: QuotaMode, cap: number): string {
  if (mode === "scripted") {
    return "Scripted mode does not call the live LLM. Switch to Free or Hard, or continue the authored beats.";
  }
  if (mode === "hard") {
    return `Hard debate turn budget exhausted (${cap} turns). Continue from the Evidence Board read-only, or resume scripted beats — cites will not be invented.`;
  }
  return `Free debate turn budget exhausted (${cap} turns). Resume scripted beats or come back next session — cites will not be invented.`;
}

/** Test helper. */
export function __resetQuotaForTests(): void {
  buckets.clear();
}
