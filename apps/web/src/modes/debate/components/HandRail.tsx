import type { FactCard } from "@physics-chronicle/content";
import type { LabEmbedReadout } from "@physics-chronicle/debate";
import { useMemo } from "react";

export type HandCite =
  | { kind: "fact"; factId: string }
  | { kind: "lab" };

const LAB_PAYLOAD = "labEmbed";

export function encodeHandCite(cite: HandCite): string {
  return cite.kind === "lab" ? LAB_PAYLOAD : `fact:${cite.factId}`;
}

export function decodeHandCite(payload: string): HandCite | null {
  if (payload === LAB_PAYLOAD || payload === "lab") return { kind: "lab" };
  if (payload.startsWith("fact:")) {
    return { kind: "fact", factId: payload.slice(5) };
  }
  // plain fact id fallback
  if (payload.startsWith("fact-")) return { kind: "fact", factId: payload };
  return null;
}

/** Short label for fact cards (hand + dossier fills). */
export function factShortTitle(fact: FactCard): string {
  const zh = fact.content_zh || fact.content;
  const keys = fact.keys?.filter((k) => /[\u4e00-\u9fff]/.test(k)) ?? [];
  if (keys[0]) return keys[0];
  return zh.length > 18 ? `${zh.slice(0, 18)}…` : zh;
}

/** Always-visible 1–2 line gist (~40–56 chars). Citations stay hover-only. */
function shortGist(fact: FactCard): string {
  let zh = (fact.content_zh || fact.content).replace(/\s+/g, " ").trim();
  // Drop Latin bibliographic lead-ins (authors / journal) — keep Chinese gist.
  const cn = zh.search(/[\u4e00-\u9fff]/);
  if (cn > 0 && /^[A-Za-z]/.test(zh) && /[,&]/.test(zh.slice(0, cn))) {
    const quote = zh.lastIndexOf("《", cn);
    zh = zh.slice(quote >= 0 ? quote : cn);
  }
  zh = zh
    .replace(/[》，,]\s*(Proc\.|Nature|Phil\.|p\.\s*\d).*$/i, "")
    .replace(/^[《「]|[》」]$/g, "")
    .trim();
  if (zh.length <= 48) return zh;
  return `${zh.slice(0, 48)}…`;
}

export function HandRail({
  facts,
  pendingLab,
  picked,
  onPick,
  visible,
  returningId,
}: {
  facts: FactCard[];
  pendingLab: LabEmbedReadout | null;
  picked: HandCite | null;
  onPick: (cite: HandCite | null) => void;
  visible: boolean;
  returningId: string | null;
}) {
  const cards = useMemo(() => {
    // Prefer cards that appear in the Coupland pack; keep stable order from JSON.
    return facts;
  }, [facts]);

  if (!visible) return null;

  const pickedKey =
    picked?.kind === "lab"
      ? "lab"
      : picked?.kind === "fact"
        ? picked.factId
        : null;

  return (
    <div className="debate-hand" aria-label="事实手牌">
      <div className="debate-hand__hint" aria-hidden>
        拖入槽位
        <br />
        或点选→点槽
      </div>
      <div className="debate-hand__cards">
        {pendingLab ? (
          <button
            type="button"
            className={[
              "debate-hand-card",
              "debate-hand-card--lab",
              pickedKey === "lab" ? "debate-hand-card--picked" : "",
              returningId === "lab" ? "era-returning" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            draggable
            onDragStart={(e) => {
              const payload = encodeHandCite({ kind: "lab" });
              e.dataTransfer.setData("application/x-forgetphys-cite", payload);
              e.dataTransfer.setData("text/plain", payload);
              e.dataTransfer.effectAllowed = "move";
            }}
            onClick={() =>
              onPick(pickedKey === "lab" ? null : { kind: "lab" })
            }
          >
            <span className="debate-hand-card__tag">实验读数</span>
            <span className="debate-hand-card__title">ZnS / 散射摘要</span>
            <span className="debate-hand-card__body">
              角={pendingLab.angle_deg ?? "—"} · 前向=
              {pendingLab.fraction_forward ?? "—"} · 大角=
              {pendingLab.large_angle_count ?? "—"}
            </span>
          </button>
        ) : null}

        {cards.map((f) => {
          const isPicked = pickedKey === f.id;
          return (
            <button
              key={f.id}
              type="button"
              className={[
                "debate-hand-card",
                isPicked ? "debate-hand-card--picked" : "",
                returningId === f.id ? "era-returning" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              draggable
              title={f.content_zh || f.content}
              onDragStart={(e) => {
                const payload = encodeHandCite({ kind: "fact", factId: f.id });
                e.dataTransfer.setData(
                  "application/x-forgetphys-cite",
                  payload,
                );
                e.dataTransfer.setData("text/plain", payload);
                e.dataTransfer.effectAllowed = "move";
              }}
              onClick={() =>
                onPick(isPicked ? null : { kind: "fact", factId: f.id })
              }
            >
              <span className="debate-hand-card__tag">事实卡</span>
              <span className="debate-hand-card__title">{factShortTitle(f)}</span>
              <span className="debate-hand-card__body">{shortGist(f)}</span>
              <span className="debate-hand-card__cite">{f.citation}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
