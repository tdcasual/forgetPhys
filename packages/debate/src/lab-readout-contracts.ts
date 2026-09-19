/**
 * M3.2 lab readout contracts — docs/M3_2_COUPLING.md §A
 * Thresholds align with CriticPolicy (DEFAULT_*); do not invent physics numbers.
 */
import { labEmbedCandidateSlots } from "./critic-policy";
import type { CriticPolicyOptions, LabEmbedReadout, SlotId } from "./types";

export const READOUT_CONTRACT_LARGE_ANGLE = "readout-large-angle" as const;
export const READOUT_CONTRACT_FORWARD_MAJORITY =
  "readout-forward-majority" as const;
export const READOUT_CONTRACT_WEAK = "readout-weak" as const;

export type LabReadoutContractId =
  | typeof READOUT_CONTRACT_LARGE_ANGLE
  | typeof READOUT_CONTRACT_FORWARD_MAJORITY
  | typeof READOUT_CONTRACT_WEAK;

export type LabReadoutSource = "lab_embed" | "simulated";

export type ClassifiedLabReadout = {
  /** Validated whitelist readout (kind alpha_scatter_summary). */
  readout: LabEmbedReadout;
  /** Contract ids that fired (weak is exclusive when neither strong contract). */
  contracts: LabReadoutContractId[];
  /** Slots allowed for labEmbed auto-fill / propose (empty when weak-only). */
  fillSlots: SlotId[];
  /** True when message received but neither strong threshold met. */
  weak: boolean;
  source: LabReadoutSource;
};

const SLOT_LARGE = "slot-large-angle-exists";
const SLOT_FORWARD = "slot-forward-majority";

/**
 * Map a whitelisted alpha_scatter_summary readout to M3.2 contracts + fill slots.
 * Weak: chip only — no auto-fill slots.
 */
export function classifyLabReadout(
  readout: LabEmbedReadout,
  opts: CriticPolicyOptions & { source?: LabReadoutSource } = {},
): ClassifiedLabReadout {
  const source = opts.source ?? "lab_embed";
  const candidates = labEmbedCandidateSlots(readout, opts);
  const contracts: LabReadoutContractId[] = [];
  const fillSlots: SlotId[] = [];

  if (candidates.includes(SLOT_LARGE)) {
    contracts.push(READOUT_CONTRACT_LARGE_ANGLE);
    fillSlots.push(SLOT_LARGE);
  }
  if (candidates.includes(SLOT_FORWARD)) {
    contracts.push(READOUT_CONTRACT_FORWARD_MAJORITY);
    fillSlots.push(SLOT_FORWARD);
  }

  if (contracts.length === 0) {
    return {
      readout,
      contracts: [READOUT_CONTRACT_WEAK],
      fillSlots: [],
      weak: true,
      source,
    };
  }

  return {
    readout,
    contracts,
    fillSlots,
    weak: false,
    source,
  };
}

/** Slots that may receive labEmbed fill for this classified readout (never when weak). */
export function labEmbedFillSlotsFromContracts(
  classified: ClassifiedLabReadout,
): SlotId[] {
  if (classified.weak) return [];
  return [...classified.fillSlots];
}
