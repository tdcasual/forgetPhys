import type { HardSlotsFile } from "@physics-chronicle/content";
import type { FactStore } from "./fact-store";
import type { EraOpinionStore } from "./era-opinion-store";
import type {
  CriticPolicyOptions,
  CriticVerdict,
  EvidenceBoardSnapshot,
  GroundedReplyDraft,
  LabEmbedReadout,
  RetrieveHit,
  SlotId,
  DebateMode,
} from "./types";
import {
  DEFAULT_FORWARD_MAJORITY_MIN,
  DEFAULT_LARGE_ANGLE_DEG_THRESHOLD,
} from "./types";

export interface CriticContext {
  mode: DebateMode;
  hits: RetrieveHit[];
  reply: GroundedReplyDraft;
  labEmbed?: LabEmbedReadout | null;
  board?: EvidenceBoardSnapshot;
  hardSlots?: HardSlotsFile;
}

export interface CriticPolicy {
  check(ctx: CriticContext): CriticVerdict;
  checkFill(args: {
    slotId: SlotId;
    factId?: string;
    labEmbed?: LabEmbedReadout | null;
    hardSlots: HardSlotsFile;
    facts: FactStore;
    eras?: EraOpinionStore;
  }): CriticVerdict;
}

function fail(reasons: string[]): CriticVerdict {
  return { ok: false, reasons };
}

function ok(): CriticVerdict {
  return { ok: true };
}

export function labEmbedCandidateSlots(
  labEmbed: LabEmbedReadout,
  opts: CriticPolicyOptions = {},
): SlotId[] {
  const threshold =
    opts.largeAngleDegThreshold ?? DEFAULT_LARGE_ANGLE_DEG_THRESHOLD;
  const forwardMin = opts.forwardMajorityMin ?? DEFAULT_FORWARD_MAJORITY_MIN;
  const slots: SlotId[] = [];

  if (labEmbed.kind !== "alpha_scatter_summary") return slots;

  const largeByCount =
    labEmbed.large_angle_count != null &&
    Number.isInteger(labEmbed.large_angle_count) &&
    labEmbed.large_angle_count > 0;
  const largeByAngle =
    labEmbed.angle_deg != null &&
    Number.isFinite(labEmbed.angle_deg) &&
    labEmbed.angle_deg >= threshold;
  if (largeByCount || largeByAngle) {
    slots.push("slot-large-angle-exists");
  }

  if (
    labEmbed.fraction_forward != null &&
    Number.isFinite(labEmbed.fraction_forward) &&
    labEmbed.fraction_forward >= forwardMin &&
    labEmbed.fraction_forward <= 1
  ) {
    slots.push("slot-forward-majority");
  }

  return slots;
}

function validateLabEmbedRanges(
  labEmbed: LabEmbedReadout,
): string[] {
  const reasons: string[] = [];
  if (labEmbed.kind !== "alpha_scatter_summary") {
    reasons.push(`labEmbed kind not whitelisted: ${labEmbed.kind}`);
  }
  if (labEmbed.angle_deg != null && !Number.isFinite(labEmbed.angle_deg)) {
    reasons.push("labEmbed.angle_deg must be finite");
  }
  if (labEmbed.fraction_forward != null) {
    if (
      !Number.isFinite(labEmbed.fraction_forward) ||
      labEmbed.fraction_forward < 0 ||
      labEmbed.fraction_forward > 1
    ) {
      reasons.push("labEmbed.fraction_forward must be in [0, 1]");
    }
  }
  if (labEmbed.large_angle_count != null) {
    if (
      !Number.isInteger(labEmbed.large_angle_count) ||
      labEmbed.large_angle_count < 0
    ) {
      reasons.push("labEmbed.large_angle_count must be integer >= 0");
    }
  }
  return reasons;
}

export class RulesCriticPolicy implements CriticPolicy {
  constructor(
    private readonly opts: CriticPolicyOptions = {},
    private readonly eras?: EraOpinionStore,
  ) {}

  check(ctx: CriticContext): CriticVerdict {
    const reasons: string[] = [];
    const hitIds = new Set(ctx.hits.map((h) => h.id));

    for (const id of ctx.reply.cite) {
      if (!hitIds.has(id)) {
        reasons.push(`cite not in retrieved hits: ${id}`);
      }
    }

    if (ctx.labEmbed) {
      reasons.push(...validateLabEmbedRanges(ctx.labEmbed));
    }

    // Era-opinion cites are allowed in speech but must not be treated as fills.
    for (const id of ctx.reply.cite) {
      const hit = ctx.hits.find((h) => h.id === id);
      if (hit?.store === "era_opinion" && ctx.mode === "hard") {
        // Speech OK; fill path is separate. Soft note only if board fill attempted elsewhere.
      }
    }

    if (reasons.length > 0) return fail(reasons);
    return ok();
  }

  checkFill(args: {
    slotId: SlotId;
    factId?: string;
    labEmbed?: LabEmbedReadout | null;
    hardSlots: HardSlotsFile;
    facts: FactStore;
    eras?: EraOpinionStore;
  }): CriticVerdict {
    const reasons: string[] = [];
    const slot = args.hardSlots.slots.find((s) => s.id === args.slotId);
    if (!slot) {
      return fail([`unknown slot: ${args.slotId}`]);
    }

    const eras = args.eras ?? this.eras;

    if (args.factId) {
      if (eras?.has(args.factId)) {
        return fail([
          `era_opinion cannot fill slots: ${args.factId}`,
        ]);
      }
      if (!args.facts.has(args.factId)) {
        reasons.push(`unknown fact id (not in FactStore): ${args.factId}`);
      } else {
        const card = args.facts.get(args.factId);
        if (card && (card.tier as string) === "era_opinion") {
          reasons.push(`era_opinion tier cannot fill: ${args.factId}`);
        }
        if (!slot.linked_fact_ids.includes(args.factId)) {
          reasons.push(
            `fact ${args.factId} not in linked_fact_ids for ${args.slotId}`,
          );
        }
      }
    }

    if (args.labEmbed) {
      reasons.push(...validateLabEmbedRanges(args.labEmbed));
      if (!slot.accepts_lab_embed) {
        reasons.push(`slot ${args.slotId} does not accept labEmbed`);
      } else {
        const candidates = labEmbedCandidateSlots(args.labEmbed, this.opts);
        if (!candidates.includes(args.slotId)) {
          reasons.push(
            `labEmbed readout does not map to slot ${args.slotId}`,
          );
        }
      }
    }

    if (!args.factId && !args.labEmbed) {
      reasons.push("fill requires factId or labEmbed");
    }

    if (reasons.length > 0) return fail(reasons);
    return ok();
  }
}
