import { useGame } from "../../app/GameState";

export { AtlasScene } from "./AtlasScene";

export function AtlasHud() {
  const { chapter, enterNode, mode } = useGame();
  if (mode !== "atlas") return null;
  const node = chapter.atlas.nodes[0];
  return (
    <div className="hud">
      <div className="hud-title">
        <h1>物理编年图志</h1>
        <p>
          {chapter.atlas.title} · {chapter.era}
        </p>
        <p>{chapter.atlas.caption}</p>
      </div>
      <div className="hud-hint">点击节点进入场所 · 同一画布正交图志</div>
      {node ? (
        <div className="hud-enter">
          <button
            type="button"
            className="paper-btn"
            onClick={() => enterNode(node.venueId)}
          >
            进入 {node.label}
          </button>
        </div>
      ) : null}
    </div>
  );
}
