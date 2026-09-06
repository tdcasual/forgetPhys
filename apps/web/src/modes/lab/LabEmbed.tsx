import { useGame } from "../../app/GameState";

const DEFAULT_URL = "https://x.infinitas.fun/";
const DEFAULT_TITLE = "α 粒子散射 · 实验台";

export function LabEmbed() {
  const { mode, venue, closeLab } = useGame();
  if (mode !== "labEmbed") return null;

  const embed = venue?.labEmbed;
  const url = embed?.url ?? DEFAULT_URL;
  const title = embed?.title ?? DEFAULT_TITLE;

  return (
    <div className="lab-embed" role="dialog" aria-label={title}>
      <div className="lab-embed-chrome parchment-panel">
        <header className="lab-embed-header">
          <div>
            <p className="lab-embed-kicker">Infinitas · iframe</p>
            <h1>{title}</h1>
          </div>
          <button type="button" className="paper-btn" onClick={closeLab}>
            关闭
          </button>
        </header>
        <div className="lab-embed-frame">
          <iframe
            className="lab-embed-iframe"
            src={url}
            title={title}
            referrerPolicy="no-referrer"
            allow="fullscreen"
          />
        </div>
        <p className="lab-embed-footnote">
          实验宿主可在内容 JSON <code>labEmbed.url</code> 替换 · 当前 {url}
        </p>
      </div>
    </div>
  );
}
