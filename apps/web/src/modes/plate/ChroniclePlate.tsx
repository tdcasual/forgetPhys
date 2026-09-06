import { useGame } from "../../app/GameState";

const PLATE_SRC = "/assets/atlas/plates/plate-glimpse-atom.png";

/** Full-screen chapter illustration (图志) after city/story chosen — not a map. */
export function ChroniclePlate() {
  const { mode, continueToCity, returnToWorldMap, pendingVenueId } = useGame();
  if (mode !== "chroniclePlate") return null;

  return (
    <div className="chronicle-plate" role="dialog" aria-label="章节图志 · 窥见原子">
      <div className="chronicle-plate-frame">
        <img
          className="chronicle-plate-art"
          src={PLATE_SRC}
          alt="窥见原子 — Coupland Street 1909 章节图志"
        />
        <div className="chronicle-plate-copy">
          <p className="chronicle-plate-kicker">章节图志 · 第一章</p>
          <h1>窥见原子</h1>
          <p className="chronicle-plate-blurb">
            1909 年曼彻斯特 Coupland Street。α 粒子穿过金箔——绝大多数几乎直行，
            少数大角偏转，把「中心电荷」从暗室里推到纸面上。
          </p>
          <p className="chronicle-plate-meta">
            Coupland Street · Manchester · 1909–1911
            {pendingVenueId ? ` · ${pendingVenueId}` : ""}
          </p>
          <p className="chronicle-plate-margin">人教选必三 §4</p>
          <div className="chronicle-plate-actions">
            <button type="button" className="paper-btn ghost" onClick={returnToWorldMap}>
              返回世界地图
            </button>
            <button type="button" className="paper-btn" onClick={continueToCity}>
              进入曼彻斯特
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
