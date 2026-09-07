import { useState } from "react";
import { useGame } from "../../app/GameState";

export function CityPage() {
  const { mode, chapter, enterVenue, returnToWorldMap, returnToPlate, progress } =
    useGame();
  const [debatePick, setDebatePick] = useState<"scripted" | "free" | "hard">(
    "scripted",
  );
  const [lockHint, setLockHint] = useState<string | null>(null);

  if (mode !== "cityPage") return null;

  const freeOk = progress.unlock.freeUnlocked;
  const hardOk = progress.unlock.hardUnlocked;

  const enterLab = () => {
    setLockHint(null);
    if (debatePick === "free" && !freeOk) {
      setLockHint("完成一次散射实验以解锁自由辩论");
      return;
    }
    if (debatePick === "hard" && !hardOk) {
      setLockHint("完成一次散射实验以解锁 Hard");
      return;
    }
    if (debatePick === "scripted") {
      enterVenue("coupland-lab");
    } else {
      enterVenue("coupland-lab", { debate: debatePick });
    }
  };

  return (
    <div className="city-page" role="main" aria-label="曼彻斯特 Coupland">
      <div className="city-page-skyline" aria-hidden>
        <img
          className="city-page-bg"
          src="/assets/bg/city-manchester.png"
          alt=""
          draggable={false}
        />
      </div>
      <div className="city-page-panel parchment-panel">
        <p className="city-kicker">城市页 · 80 Days 结构</p>
        <h1>{chapter.atlas.title}</h1>
        <p className="city-street">Coupland Street · {chapter.era}</p>
        <p className="city-caption">{chapter.atlas.caption}</p>

        <div className="city-debate-picker" role="group" aria-label="辩论模式">
          <p className="city-debate-picker__label">辩论模式</p>
          <div className="city-debate-picker__row">
            <button
              type="button"
              className={`paper-btn city-debate-btn${debatePick === "scripted" ? " city-debate-btn--on" : ""}`}
              onClick={() => setDebatePick("scripted")}
            >
              常规
              <span className="city-debate-btn__sub">scripted</span>
            </button>
            <button
              type="button"
              className={`paper-btn city-debate-btn${debatePick === "free" ? " city-debate-btn--on" : ""}`}
              onClick={() => setDebatePick("free")}
              title={freeOk ? "自由辩论" : "锁定"}
            >
              自由 {freeOk ? "✓" : "🔒"}
              <span className="city-debate-btn__sub">free</span>
            </button>
            <button
              type="button"
              className={`paper-btn city-debate-btn${debatePick === "hard" ? " city-debate-btn--on" : ""}`}
              onClick={() => setDebatePick("hard")}
              title={hardOk ? "Hard 证据槽" : "完成散射实验解锁"}
            >
              Hard {hardOk ? "✓" : "🔒"}
              <span className="city-debate-btn__sub">证据槽</span>
            </button>
          </div>
          {lockHint ? (
            <p className="city-debate-picker__hint" role="status">
              {lockHint}
            </p>
          ) : null}
        </div>

        <div className="city-actions">
          <button
            type="button"
            className="paper-btn city-btn"
            onClick={enterLab}
          >
            实验室
          </button>
          <button
            type="button"
            className="paper-btn city-btn"
            onClick={() => enterVenue("coupland-lodge")}
          >
            租屋
          </button>
          <button type="button" className="paper-btn city-btn" disabled title="后做">
            街巷
          </button>
        </div>

        <div className="city-nav">
          <button type="button" className="paper-btn ghost" onClick={returnToPlate}>
            回图志
          </button>
          <button type="button" className="paper-btn ghost" onClick={returnToWorldMap}>
            回地图
          </button>
        </div>
      </div>
    </div>
  );
}
