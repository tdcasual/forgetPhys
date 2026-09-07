import {
  normalizeVenueId,
  type HardSlotsFile,
} from "@physics-chronicle/content";
import type { FactStore } from "./fact-store";
import type { CriticPolicy } from "./critic-policy";
import type {
  CardId,
  CriticVerdict,
  EvidenceBoardSnapshot,
  LabEmbedReadout,
  SlotFill,
  SlotId,
} from "./types";

export interface EvidenceBoard {
  reset(venueId: string, slots: HardSlotsFile): void;
  snapshot(): EvidenceBoardSnapshot;
  /** free mode: preview only — must not mutate fills */
  ghostPreview(cites: CardId[]): SlotId[];
  tryFill(
    args: {
      slotId: SlotId;
      factId?: CardId;
      labEmbed?: LabEmbedReadout | null;
      source: SlotFill["source"];
      turnIndex: number;
    },
    policy: CriticPolicy,
    hardSlots: HardSlotsFile,
    facts: FactStore,
  ): CriticVerdict & { filled?: SlotFill };
}

export class InMemoryEvidenceBoard implements EvidenceBoard {
  private venueId = "";
  private hardSlots: HardSlotsFile | null = null;
  private fills: SlotFill[] = [];
  private criticPassCount = 0;

  reset(venueId: string, slots: HardSlotsFile): void {
    this.venueId = normalizeVenueId(venueId);
    this.hardSlots = slots;
    this.fills = [];
    this.criticPassCount = 0;
  }

  snapshot(): EvidenceBoardSnapshot {
    return {
      venueId: this.venueId,
      fills: [...this.fills],
      filledCount: this.fills.length,
      criticPassCount: this.criticPassCount,
    };
  }

  ghostPreview(cites: CardId[]): SlotId[] {
    if (!this.hardSlots) return [];
    const filled = new Set(this.fills.map((f) => f.slotId));
    const open: SlotId[] = [];
    for (const slot of this.hardSlots.slots) {
      if (filled.has(slot.id)) continue;
      if (cites.some((id) => slot.linked_fact_ids.includes(id))) {
        open.push(slot.id);
      }
    }
    // Explicitly do not mutate fills / criticPassCount.
    return open;
  }

  tryFill(
    args: {
      slotId: SlotId;
      factId?: CardId;
      labEmbed?: LabEmbedReadout | null;
      source: SlotFill["source"];
      turnIndex: number;
    },
    policy: CriticPolicy,
    hardSlots: HardSlotsFile,
    facts: FactStore,
  ): CriticVerdict & { filled?: SlotFill } {
    if (this.fills.some((f) => f.slotId === args.slotId)) {
      return { ok: false, reasons: [`slot already filled: ${args.slotId}`] };
    }

    const verdict = policy.checkFill({
      slotId: args.slotId,
      factId: args.factId,
      labEmbed: args.labEmbed,
      hardSlots,
      facts,
    });

    if (!verdict.ok) return verdict;

    const filled: SlotFill = {
      slotId: args.slotId,
      factId: args.factId,
      labEmbedKind: args.labEmbed?.kind,
      source: args.source,
      turnIndex: args.turnIndex,
    };
    this.fills.push(filled);
    this.criticPassCount += 1;
    return { ok: true, filled };
  }
}
