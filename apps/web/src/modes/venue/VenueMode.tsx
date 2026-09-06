import { useGame } from "../../app/GameState";

export { VenueScene } from "./VenueScene";

const BIN_LABELS = ["0–15°", "15–30°", "30–60°", "60–90°", "90–120°", "120–180°"];

export function VenueHud({
  total,
  large,
  bins,
}: {
  total: number;
  large: number;
  bins: number[];
}) {
  const { mode, venue, returnToAtlas, openDialogue, dialogueOpen } = useGame();
  if (mode !== "venue" || !venue) return null;
  const max = Math.max(1, ...bins);

  return (
    <div className="hud">
      <div className="hud-title">
        <h1>{venue.name}</h1>
        <p>
          {venue.place} · {venue.years}
        </p>
      </div>
      <button type="button" className="paper-btn hud-back" onClick={returnToAtlas}>
        返回图志
      </button>
      <aside className="hud-readout" aria-label="散射计数">
        <h2>荧光计数（粗直方图）</h2>
        {BIN_LABELS.map((label, i) => (
          <div className="hist-row" key={label}>
            <span>{label}</span>
            <div className={`hist-bar ${i >= 4 ? "wide" : ""}`}>
              <span style={{ width: `${((bins[i] ?? 0) / max) * 100}%` }} />
            </div>
            <span>{bins[i] ?? 0}</span>
          </div>
        ))}
        <p style={{ margin: "0.45rem 0 0", fontSize: "0.75rem" }}>
          探测 {total} · 大角（&gt;90°）{large}
        </p>
        {!dialogueOpen ? (
          <button
            type="button"
            className="paper-btn"
            style={{ marginTop: "0.5rem" }}
            onClick={openDialogue}
          >
            再听一遍
          </button>
        ) : null}
      </aside>
    </div>
  );
}
