/**
 * M3.2 §C — Coupland Hard: concentration claim requires a bench/Fact observation
 * cite on large-angle OR forward-majority before pass / persuaded.
 */
import type {
  CriticVerdict,
  EvidenceBoardSnapshot,
  SlotFill,
  SlotId,
} from "./types";

export const BENCH_OBSERVATION_CLAIM_ID = "C11" as const;

export const SLOT_LARGE_ANGLE_EXISTS = "slot-large-angle-exists" as const;
export const SLOT_FORWARD_MAJORITY = "slot-forward-majority" as const;
export const SLOT_CHARGE_MASS_CONCENTRATED =
  "slot-charge-mass-concentrated" as const;

/** Observation slots: labEmbed or Fact fills both count. */
export const BENCH_OBSERVATION_SLOTS: readonly SlotId[] = [
  SLOT_LARGE_ANGLE_EXISTS,
  SLOT_FORWARD_MAJORITY,
];

function fail(reasons: string[]): CriticVerdict {
  return { ok: false, reasons };
}

function ok(): CriticVerdict {
  return { ok: true };
}

export function boardHasSlotFill(
  board: EvidenceBoardSnapshot,
  slotId: SlotId,
): boolean {
  return board.fills.some((f) => f.slotId === slotId);
}

/** True when large-angle or forward-majority is filled (any legal source). */
export function boardHasBenchOrFactObservation(
  board: EvidenceBoardSnapshot,
): boolean {
  return BENCH_OBSERVATION_SLOTS.some((id) => boardHasSlotFill(board, id));
}

export function boardClaimsConcentration(
  board: EvidenceBoardSnapshot,
): boolean {
  return boardHasSlotFill(board, SLOT_CHARGE_MASS_CONCENTRATED);
}

/**
 * Blocks Hard pass when concentration is claimed without large-angle **and**
 * without forward-majority observation (neither filled).
 * Satisfied by labEmbed **or** Fact observation cards already on those slots.
 */
export function checkCouplandBenchObservationGate(
  board: EvidenceBoardSnapshot,
): CriticVerdict {
  if (!boardClaimsConcentration(board)) return ok();
  if (boardHasBenchOrFactObservation(board)) return ok();
  return fail([
    `${BENCH_OBSERVATION_CLAIM_ID}: concentration claim requires large-angle or forward-majority observation (labEmbed or Fact) before pass`,
  ]);
}

/** Whether a fill on this slot should surface the C11 blocking challenge. */
export function shouldFireBenchObservationChallenge(
  board: EvidenceBoardSnapshot,
  justFilledSlotId?: SlotId,
): boolean {
  if (justFilledSlotId === SLOT_CHARGE_MASS_CONCENTRATED) {
    return !boardHasBenchOrFactObservation(board);
  }
  return (
    boardClaimsConcentration(board) && !boardHasBenchOrFactObservation(board)
  );
}

export function observationFillSources(
  board: EvidenceBoardSnapshot,
): SlotFill[] {
  return board.fills.filter((f) =>
    BENCH_OBSERVATION_SLOTS.includes(f.slotId as typeof SLOT_LARGE_ANGLE_EXISTS),
  );
}
