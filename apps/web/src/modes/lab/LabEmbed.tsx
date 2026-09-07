import { normalizeVenueId } from "@physics-chronicle/content";
import { useEffect, useRef } from "react";
import { useGame } from "../../app/GameState";
import {
  buildHostHello,
  DEFAULT_LAB_EMBED_CONFIG,
  defaultLabEmbedOriginAllowlist,
  isAllowedLabEmbedOrigin,
  mapLabEmbedToCandidateSlots,
  parseAlphaScatterSummary,
  type LabEmbedConfig,
} from "./labEmbedMessages";
import type { LabEmbedReadout } from "@physics-chronicle/debate";

const DEFAULT_URL = "https://x.infinitas.fun/";
const DEFAULT_TITLE = "α 粒子散射 · 实验台";

function emitLabFill(readout: LabEmbedReadout, config: LabEmbedConfig = DEFAULT_LAB_EMBED_CONFIG) {
  const slots = mapLabEmbedToCandidateSlots(readout, config);
  window.dispatchEvent(
    new CustomEvent("forgetphys:labEmbed-fill", {
      detail: { readout, slots },
    }),
  );
}

export function LabEmbed() {
  const {
    mode,
    venue,
    closeLab,
    recordLabEmbedVisit,
    setPendingLabEmbed,
  } = useGame();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const allowlistRef = useRef(defaultLabEmbedOriginAllowlist());

  useEffect(() => {
    if (mode !== "labEmbed") return;

    const onMessage = (event: MessageEvent) => {
      if (!isAllowedLabEmbedOrigin(event.origin, allowlistRef.current)) {
        return;
      }

      const readout = parseAlphaScatterSummary(event.data);
      if (!readout) {
        if (import.meta.env.DEV) {
          console.debug("[labEmbed] ignored non-allowlisted payload", event.origin);
        }
        return;
      }

      recordLabEmbedVisit();
      setPendingLabEmbed(readout);
      emitLabFill(readout);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [mode, recordLabEmbedVisit, setPendingLabEmbed]);

  const onIframeLoad = () => {
    const win = iframeRef.current?.contentWindow;
    if (!win || !venue) return;
    const venueId = normalizeVenueId(venue.id);
    try {
      const target = new URL(iframeRef.current?.src || DEFAULT_URL).origin;
      win.postMessage(buildHostHello(venueId), target);
    } catch {
      /* ignore */
    }
  };

  const simulateReadout = () => {
    const readout: LabEmbedReadout = {
      kind: "alpha_scatter_summary",
      angle_deg: 150,
      fraction_forward: 0.999,
      large_angle_count: 3,
    };
    recordLabEmbedVisit();
    setPendingLabEmbed(readout);
    emitLabFill(readout);
  };

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
            ref={iframeRef}
            className="lab-embed-iframe"
            src={url}
            title={title}
            referrerPolicy="no-referrer"
            allow="fullscreen"
            onLoad={onIframeLoad}
          />
        </div>
        <p className="lab-embed-footnote">
          实验宿主可在内容 JSON <code>labEmbed.url</code> 替换 · 当前 {url}
          <br />
          postMessage 仅接受白名单 origin · kind=
          <code>alpha_scatter_summary</code> · largeAngle≥
          {DEFAULT_LAB_EMBED_CONFIG.largeAngleDegThreshold}°
        </p>
        <div className="lab-embed-dev">
          <button
            type="button"
            className="paper-btn ghost"
            onClick={simulateReadout}
          >
            模拟读数（QA）
          </button>
        </div>
      </div>
    </div>
  );
}
