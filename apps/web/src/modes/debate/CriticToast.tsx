import type { CriticChallengeTemplate } from "@physics-chronicle/content";

export type CriticToastState = {
  template: CriticChallengeTemplate;
  shownAt: number;
};

/** P1a Stance Critic — demoted toast (ChallengeCard is primary on table). */
export function CriticToast({
  toast,
  onDismiss,
  demoted = false,
}: {
  toast: CriticToastState | null;
  onDismiss: () => void;
  demoted?: boolean;
}) {
  if (!toast) return null;
  const { template } = toast;
  const eraCite = template.eraOpinionIds[0];

  return (
    <div
      className={`debate-critic-toast parchment-panel${demoted ? " debate-critic-toast--demoted" : ""}`}
      role="status"
      aria-live="polite"
    >
      <header className="debate-critic-toast__head">
        <span className="debate-critic-toast__kicker">质疑 · 短讯</span>
        <button
          type="button"
          className="debate-critic-toast__close"
          aria-label="关闭质疑"
          onClick={onDismiss}
        >
          ×
        </button>
      </header>
      <p className="debate-critic-toast__text">「{template.text_zh}」</p>
      <div className="debate-cite-chips">
        {eraCite ? (
          <span className="debate-cite-chip debate-cite-chip--era" title={eraCite}>
            时代观点
          </span>
        ) : null}
        <span className="debate-cite-chip debate-cite-chip--claim">
          {template.claimId}
        </span>
      </div>
    </div>
  );
}

/** Prefer templates aiming at the filled slot; else first P1a priority set. */
export function pickCriticTemplate(
  templates: CriticChallengeTemplate[],
  slotId?: string,
): CriticChallengeTemplate | null {
  if (!templates.length) return null;
  if (slotId) {
    const aimed = templates.filter((t) => t.aimSlots.includes(slotId));
    if (aimed.length) {
      return aimed[Math.floor(Math.random() * aimed.length)]!;
    }
  }
  const priority = ["C1", "C2", "C3", "C7", "C9", "C10"];
  for (const id of priority) {
    const hit = templates.find((t) => t.claimId === id);
    if (hit) return hit;
  }
  return templates[0] ?? null;
}
