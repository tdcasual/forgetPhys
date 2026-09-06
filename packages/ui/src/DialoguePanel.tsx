import type { DialogueLine } from "@physics-chronicle/content";
import { CitationDrawer } from "./CitationDrawer";
import { InterpretationBadge } from "./InterpretationBadge";
import "./dialogue.css";

export function DialoguePanel({
  line,
  onAdvance,
  isLast,
}: {
  line: DialogueLine;
  onAdvance: () => void;
  isLast: boolean;
}) {
  const showBadge = line.claim.source_tier === "interpretation";
  return (
    <section className="pc-dialogue" role="dialog" aria-label="对话">
      {showBadge ? <InterpretationBadge variant="corner" /> : null}
      {/* Ren'Py-style namebox — primary name UI (G7 revised) */}
      <div className="pc-dialogue-namebox" aria-label="说话人">
        {line.speaker}
      </div>
      <p className="pc-dialogue-text">{line.text}</p>
      <div className="pc-dialogue-actions">
        <CitationDrawer claim={line.claim} />
        <button type="button" onClick={onAdvance}>
          {isLast ? "收起" : "继续"}
        </button>
      </div>
    </section>
  );
}
