import { useMemo, useState } from "react";
import { useGame } from "../../app/GameState";

/** Europe crop matching Natural Earth atlas rasters (lon/lat degrees). */
const LON_MIN = -25;
const LON_MAX = 45;
const LAT_MIN = 34;
const LAT_MAX = 72;

const MAP_SRC = "/assets/bg/map-europe.png";

type Hotspot = {
  id: string;
  name: string;
  zh: string;
  era: string;
  blurb: string;
  lon: number;
  lat: number;
  unlocked: boolean;
  venueId: string;
};

const HOTSPOTS: Hotspot[] = [
  {
    id: "manchester",
    name: "Manchester",
    zh: "曼彻斯特",
    era: "1909–1911",
    blurb: "Coupland Street · α 散射",
    lon: -2.2426,
    lat: 53.4808,
    unlocked: true,
    venueId: "coupland-lab",
  },
  {
    id: "cambridge",
    name: "Cambridge",
    zh: "剑桥",
    era: "1897",
    blurb: "完成散射后方可前往",
    lon: 0.1218,
    lat: 52.2053,
    unlocked: false,
    venueId: "cavendish",
  },
  {
    id: "copenhagen",
    name: "Copenhagen",
    zh: "哥本哈根",
    era: "1913",
    blurb: "玻尔钩子 · 未解锁",
    lon: 12.5683,
    lat: 55.6761,
    unlocked: false,
    venueId: "apartment-study",
  },
];

function lonLatToPct(lon: number, lat: number): { left: string; top: string } {
  const left = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 100;
  const top = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100;
  return { left: `${left}%`, top: `${top}%` };
}

export function WorldMap2D() {
  const { mode, selectDestiny } = useGame();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => HOTSPOTS.find((h) => h.id === selectedId) ?? null,
    [selectedId],
  );
  const hovered = useMemo(
    () => HOTSPOTS.find((h) => h.id === hoverId) ?? null,
    [hoverId],
  );

  if (mode !== "worldMap") return null;

  return (
    <div className="wm2d" role="application" aria-label="命运地图 · 欧洲">
      <div className="wm2d-frame">
        <img className="wm2d-map" src={MAP_SRC} alt="欧洲插画地图" draggable={false} />
        <div className="wm2d-hotspots">
          {HOTSPOTS.map((h) => {
            const pos = lonLatToPct(h.lon, h.lat);
            const active = selectedId === h.id || hoverId === h.id;
            return (
              <button
                key={h.id}
                type="button"
                className={`wm2d-pin ${h.unlocked ? "unlocked" : "locked"} ${active ? "active" : ""}`}
                style={{ left: pos.left, top: pos.top }}
                aria-label={`${h.zh}${h.unlocked ? "" : "（未解锁）"}`}
                onMouseEnter={() => setHoverId(h.id)}
                onMouseLeave={() => setHoverId(null)}
                onFocus={() => setHoverId(h.id)}
                onBlur={() => setHoverId(null)}
                onClick={() => {
                  if (!h.unlocked) return;
                  setSelectedId(h.id);
                }}
              >
                <span className="wm2d-pin-dot" />
                <span className="wm2d-pin-label">{h.zh}</span>
              </button>
            );
          })}
        </div>

        {(hovered || selected) && (
          <aside className="wm2d-card" aria-live="polite">
            {(() => {
              const h = hovered ?? selected!;
              return (
                <>
                  <p className="wm2d-card-kicker">{h.era}</p>
                  <h2>{h.zh}</h2>
                  <p>{h.blurb}</p>
                  {!h.unlocked ? <p className="wm2d-card-lock">墨灰 · 未解锁</p> : null}
                </>
              );
            })()}
          </aside>
        )}
      </div>

      <header className="wm2d-hud parchment">
        <h1>物理编年 · 选择命运之地</h1>
        <p>插画欧洲 · 曼彻斯特已解锁 · 剑桥 / 哥本哈根 墨灰</p>
      </header>

      <footer className="wm2d-hint parchment">
        {selected?.unlocked
          ? `已选 ${selected.zh} · 打开章节图志`
          : "点击曼彻斯特金点进入 · 灰城为未解锁"}
      </footer>

      {selected?.unlocked ? (
        <div className="wm2d-enter">
          <button
            type="button"
            className="paper-btn"
            onClick={() => selectDestiny(selected.venueId, selected.id)}
          >
            打开《窥见原子》
          </button>
        </div>
      ) : null}
    </div>
  );
}
