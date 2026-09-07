import type { FactCard, SlotDef } from "@physics-chronicle/content";
import type { LabEmbedReadout } from "@physics-chronicle/debate";

export function ProposeFillSheet({
  slot,
  facts,
  pendingLab,
  acceptsLab,
  onCancel,
  onProposeFact,
  onProposeLab,
  lastError,
}: {
  slot: SlotDef;
  facts: FactCard[];
  pendingLab: LabEmbedReadout | null;
  acceptsLab: boolean;
  onCancel: () => void;
  onProposeFact: (factId: string) => void;
  onProposeLab: () => void;
  lastError: string | null;
}) {
  const linked = facts.filter((f) => slot.linked_fact_ids.includes(f.id));

  return (
    <div className="debate-propose parchment-panel" role="dialog" aria-label="提议填入">
      <header className="debate-propose__head">
        <h3>提议填入 · {slot.label_zh}</h3>
        <button type="button" className="paper-btn ghost" onClick={onCancel}>
          取消
        </button>
      </header>
      <p className="debate-propose__hint">{slot.what_counts}</p>

      <div className="debate-propose__section">
        <h4>Fact 卡</h4>
        <ul className="debate-propose__list">
          {linked.length === 0 ? (
            <li className="debate-propose__empty">无关联 Fact</li>
          ) : (
            linked.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  className="debate-propose__option"
                  onClick={() => onProposeFact(f.id)}
                >
                  <span className="debate-propose__option-id">{f.id}</span>
                  <span className="debate-propose__option-body">
                    {f.content_zh || f.content}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {acceptsLab ? (
        <div className="debate-propose__section">
          <h4>实验室读数</h4>
          {pendingLab ? (
            <button
              type="button"
              className="debate-propose__option"
              onClick={onProposeLab}
            >
              <span className="debate-propose__option-id">
                labEmbed · {pendingLab.kind}
              </span>
              <span className="debate-propose__option-body">
                angle={pendingLab.angle_deg ?? "—"} · forward=
                {pendingLab.fraction_forward ?? "—"} · large=
                {pendingLab.large_angle_count ?? "—"}
              </span>
            </button>
          ) : (
            <p className="debate-propose__empty">
              尚无白名单读数 — 先去实验台跑一次散射。
            </p>
          )}
        </div>
      ) : null}

      {lastError ? (
        <p className="debate-propose__error" role="alert">
          {lastError}
        </p>
      ) : null}
    </div>
  );
}
