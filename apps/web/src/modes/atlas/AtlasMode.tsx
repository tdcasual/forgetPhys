import { useEffect, useState } from "react";
import { useGame } from "../../app/GameState";
import {
  subscribeAtlasSelection,
  type AtlasSelection,
} from "./atlasSelection";

export { AtlasScene } from "./AtlasScene";

export function AtlasHud() {
  const { mode, selectDestiny } = useGame();
  const [selection, setSelection] = useState<AtlasSelection>(null);

  useEffect(() => subscribeAtlasSelection(setSelection), []);

  if (mode !== "worldMap") return null;

  return (
    <div className="hud">
      <div className="hud-title hud-title--parchment">
        <h1>物理编年 · 选择命运之地</h1>
        <p>世界地图 · 欧洲彩沙盘 · ~1900</p>
        <p>曼彻斯特已解锁 · 剑桥 / 哥本哈根 未解锁</p>
      </div>
      <div className="hud-hint hud-hint--parchment">
        {selection?.unlocked
          ? `已选 ${selection.name} · 打开章节图志`
          : "点击曼彻斯特城簇进入 · 灰城为未解锁"}
      </div>
      {selection?.unlocked ? (
        <div className="hud-enter">
          <button
            type="button"
            className="paper-btn"
            onClick={() => selectDestiny(selection.venueId)}
          >
            打开《窥见原子》
          </button>
        </div>
      ) : null}
    </div>
  );
}
