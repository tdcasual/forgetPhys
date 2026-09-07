import type { HardSlotsFile, SlotDef } from "@physics-chronicle/content";
import type {
  DebateMode,
  EvidenceBoardSnapshot,
  SlotId,
} from "@physics-chronicle/debate";

function fillLabel(
  slotId: SlotId,
  snap: EvidenceBoardSnapshot | null,
): string | null {
  const fill = snap?.fills.find((f) => f.slotId === slotId);
  if (!fill) return null;
  if (fill.factId) return fill.factId;
  if (fill.labEmbedKind) return `lab · ${fill.labEmbedKind}`;
  return fill.source;
}

export function EvidenceBoardPanel({
  hardSlots,
  mode,
  snap,
  ghostSlots,
  onSelectSlot,
  selectedSlotId,
}: {
  hardSlots: HardSlotsFile;
  mode: DebateMode;
  snap: EvidenceBoardSnapshot | null;
  ghostSlots: SlotId[];
  onSelectSlot: (slot: SlotDef) => void;
  selectedSlotId: string | null;
}) {
  const need = hardSlots.win.N;
  const filled = snap?.filledCount ?? 0;
  const critic = snap?.criticPassCount ?? 0;
  const ghostOnly = mode === "free";
  const ghostSet = new Set(ghostSlots);

  return (
    <aside
      className={`debate-evidence-board parchment-panel${ghostOnly ? " debate-evidence-board--ghost" : ""}`}
      aria-label="证据板"
    >
      <header className="debate-evidence-board__head">
        <h2>证据板</h2>
        {ghostOnly ? (
          <span className="debate-evidence-board__watermark">预览 · 不写入</span>
        ) : (
          <span className="debate-evidence-board__meta">
            已填 {filled} / {hardSlots.win.M} · 需 ≥{need}
            {hardSlots.win.require_critic_pass ? " 且 Critic" : ""}
            {critic > 0 ? ` · 通过 ${critic}` : ""}
          </span>
        )}
      </header>
      <div className="debate-evidence-board__grid" role="list">
        {hardSlots.slots.map((slot) => {
          const label = fillLabel(slot.id, snap);
          const isFilled = Boolean(label) && !ghostOnly;
          const isGhost = ghostOnly && ghostSet.has(slot.id);
          const selected = selectedSlotId === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              role="listitem"
              className={[
                "debate-slot",
                isFilled ? "debate-slot--filled" : "",
                isGhost ? "debate-slot--ghost" : "",
                selected ? "debate-slot--selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              title={slot.what_counts}
              onClick={() => onSelectSlot(slot)}
            >
              <span className="debate-slot__id">{slot.label_zh}</span>
              <span className="debate-slot__state">
                {isFilled
                  ? label
                  : isGhost
                    ? "可能落入"
                    : ghostOnly
                      ? "空（预览）"
                      : "空"}
              </span>
            </button>
          );
        })}
      </div>
      <p className="debate-evidence-board__note">
        胜条件：说服时代主流理解 / 证据板 — 非卢瑟福本人。
      </p>
    </aside>
  );
}
