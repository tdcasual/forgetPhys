import type { CriticChallengeTemplate } from "@physics-chronicle/content";

export function ChallengeCard({
  template,
  visible,
}: {
  template: CriticChallengeTemplate | null;
  visible: boolean;
}) {
  if (!visible) return null;

  const title = template
    ? `挑战 · ${claimTitle(template.claimId)}`
    : "挑战 · 时代主流理解";
  const body = template?.text_zh
    ?? "课堂主流仍是弥散正电球加微粒的图景。提交实验证据，说服时代的主流理解。";

  return (
    <aside
      className={`debate-challenge${template ? "" : " debate-challenge--empty"}`}
      aria-label="时代主流理解挑战"
    >
      <span className="debate-challenge__blot" aria-hidden />
      <p className="debate-challenge__kicker">质疑 · 时代意见</p>
      <h2 className="debate-challenge__title">{title}</h2>
      <p className="debate-challenge__body">「{body}」</p>
      <p className="debate-challenge__task">
        你的任务：拖入事实卡或实验读数入档，反驳成见，说服<strong>时代主流理解</strong>
        （非卢瑟福本人）。
      </p>
      <span className="debate-challenge__seal" aria-hidden>
        FP
      </span>
    </aside>
  );
}

function claimTitle(claimId: string): string {
  const map: Record<string, string> = {
    C1: "多次散射尾部 (1909)",
    C2: "布丁模型 (1904)",
    C3: "暂缓结构判决",
    C4: "外层散射说",
    C5: "解释≠完整原子论",
    C7: "方法疑虑",
    C9: "厚靶怀疑",
    C10: "课堂惯性",
  };
  return map[claimId] ?? claimId;
}
