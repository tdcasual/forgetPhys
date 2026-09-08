import type { FactCard, HardSlotsFile, SlotDef } from "@physics-chronicle/content";
import type {
  DebateMode,
  EvidenceBoardSnapshot,
  SlotId,
} from "@physics-chronicle/debate";
import { factShortTitle } from "./HandRail";

function fillCaption(
  slotId: SlotId,
  snap: EvidenceBoardSnapshot | null,
  factById: Map<string, FactCard>,
): string | null {
  const fill = snap?.fills.find((f) => f.slotId === slotId);
  if (!fill) return null;
  if (fill.factId) {
    const card = factById.get(fill.factId);
    if (card) return factShortTitle(card);
    // Prefer never showing raw ids; last-resort if pack missing the card.
    return "事实卡";
  }
  if (fill.labEmbedKind) return `实验读数 · ${fill.labEmbedKind}`;
  return "已入档";
}

export function DossierBoard({
  hardSlots,
  mode,
  snap,
  ghostSlots,
  onSelectSlot,
  onDropCite,
  selectedSlotId,
  dropHoverSlotId,
  rejectSlotId,
  titleZh,
  facts = [],
}: {
  hardSlots: HardSlotsFile;
  mode: DebateMode;
  snap: EvidenceBoardSnapshot | null;
  ghostSlots: SlotId[];
  onSelectSlot: (slot: SlotDef) => void;
  onDropCite: (slot: SlotDef, payload: string) => void;
  selectedSlotId: string | null;
  dropHoverSlotId: string | null;
  rejectSlotId: string | null;
  titleZh?: string;
  /** Coupland pack / FactStore cards — used to resolve fill captions. */
  facts?: FactCard[];
}) {
  const filed = snap?.fills.length ?? 0;
  const need = hardSlots.win.N;
  const ghostOnly = mode === "free";
  const ghostSet = new Set(ghostSlots);
  const dossierTitle = titleZh ?? "α 散射案卷";
  const factById = new Map(facts.map((f) => [f.id, f]));

  return (
    <section
      className={`debate-dossier${ghostOnly ? " debate-dossier--ghost" : ""}`}
      aria-label={dossierTitle}
    >
      <div className="debate-dossier__inner">
        <header className="debate-dossier__head">
          <h2>{dossierTitle}</h2>
          {ghostOnly ? (
            <span className="debate-dossier__progress">预览 · 不写入</span>
          ) : (
            <span className="debate-dossier__progress">
              入档 {filed} / {hardSlots.win.M} · 需 ≥{need}
              {hardSlots.win.require_critic_pass ? " · 须过质疑" : ""}
            </span>
          )}
        </header>

        <div className="debate-dossier__grid" role="list">
          {hardSlots.slots.map((slot, i) => {
            const caption = fillCaption(slot.id, snap, factById);
            const isFilled = Boolean(caption) && !ghostOnly;
            const isGhost = ghostOnly && ghostSet.has(slot.id);
            const selected = selectedSlotId === slot.id;
            const dropTarget = dropHoverSlotId === slot.id;
            const rejecting = rejectSlotId === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                role="listitem"
                className={[
                  "debate-dossier-slot",
                  isFilled ? "debate-dossier-slot--filled" : "",
                  isGhost ? "debate-dossier-slot--ghost" : "",
                  selected ? "debate-dossier-slot--selected" : "",
                  dropTarget ? "debate-dossier-slot--drop-target" : "",
                  rejecting ? "debate-dossier-slot--reject" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                title={slot.what_counts}
                disabled={isFilled}
                onClick={() => {
                  if (!isFilled) onSelectSlot(slot);
                }}
                onDragOver={(e) => {
                  if (isFilled || ghostOnly) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  if (isFilled || ghostOnly) return;
                  e.preventDefault();
                  const payload =
                    e.dataTransfer.getData("application/x-forgetphys-cite") ||
                    e.dataTransfer.getData("text/plain");
                  if (payload) onDropCite(slot, payload);
                }}
              >
                {!isFilled ? (
                  <span className="debate-dossier-slot__crosshair" aria-hidden />
                ) : null}
                <span className="debate-dossier-slot__index">{i + 1}</span>
                <span className="debate-dossier-slot__label">{slot.short_label ?? slot.label_zh}</span>
                <span className="debate-dossier-slot__fill">
                  {isFilled
                    ? caption
                    : isGhost
                      ? "可能落入"
                      : ghostOnly
                        ? "空"
                        : "空"}
                </span>
                {isFilled ? (
                  <span className="debate-dossier-slot__stamp" aria-label="入档">
                    入档
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <p className="debate-dossier__note">
          说服对象：时代主流理解 / 案卷 — 非卢瑟福本人。
        </p>
      </div>
    </section>
  );
}
