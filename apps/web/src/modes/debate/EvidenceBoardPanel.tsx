/**
 * Legacy engineer panel — kept for imports; P1b hard/free shell uses DossierBoard.
 * Player chrome must not show filledCount / criticPass strings.
 */
import type { FactCard, HardSlotsFile, SlotDef } from "@physics-chronicle/content";
import type {
  DebateMode,
  EvidenceBoardSnapshot,
  SlotId,
} from "@physics-chronicle/debate";
import { DossierBoard } from "./components/DossierBoard";

export function EvidenceBoardPanel({
  hardSlots,
  mode,
  snap,
  ghostSlots,
  onSelectSlot,
  selectedSlotId,
  facts = [],
}: {
  hardSlots: HardSlotsFile;
  mode: DebateMode;
  snap: EvidenceBoardSnapshot | null;
  ghostSlots: SlotId[];
  onSelectSlot: (slot: SlotDef) => void;
  selectedSlotId: string | null;
  facts?: FactCard[];
}) {
  return (
    <DossierBoard
      hardSlots={hardSlots}
      mode={mode}
      snap={snap}
      ghostSlots={ghostSlots}
      onSelectSlot={onSelectSlot}
      onDropCite={() => {}}
      selectedSlotId={selectedSlotId}
      dropHoverSlotId={null}
      rejectSlotId={null}
      facts={facts}
    />
  );
}
