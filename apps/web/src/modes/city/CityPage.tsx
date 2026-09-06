import { useGame } from "../../app/GameState";

export function CityPage() {
  const { mode, chapter, enterVenue, returnToWorldMap, returnToPlate } = useGame();
  if (mode !== "cityPage") return null;

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

        <div className="city-actions">
          <button
            type="button"
            className="paper-btn city-btn"
            onClick={() => enterVenue("coupland-lab")}
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
