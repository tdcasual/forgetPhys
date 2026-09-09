import {
  DIALOGUE_UI,
  DEFAULT_LOCALE,
  lineText,
  speakerDisplayName,
  type DialogueLine,
  type Locale,
} from "@physics-chronicle/content";
import { CitationDrawer } from "./CitationDrawer";
import { InterpretationBadge } from "./InterpretationBadge";
import "./dialogue.css";

export function DialoguePanel({
  line,
  onAdvance,
  isLast,
  locale = DEFAULT_LOCALE,
}: {
  line: DialogueLine;
  onAdvance: () => void;
  isLast: boolean;
  /** Single UI+dialogue locale (ADR-0006). Default en. */
  locale?: Locale;
}) {
  const showBadge = line.claim.source_tier === "interpretation";
  const ui = DIALOGUE_UI[locale] ?? DIALOGUE_UI.en;
  const text = lineText(line, locale);
  const speaker = speakerDisplayName(
    {
      charId: line.charId,
      speakerRole: line.speakerRole,
      speaker: line.speaker,
    },
    locale,
  );
  return (
    <section className="pc-dialogue" role="dialog" aria-label={ui.dialogLabel}>
      {showBadge ? <InterpretationBadge variant="corner" /> : null}
      {/* Ren'Py-style namebox — primary name UI (G7 revised) */}
      <div className="pc-dialogue-namebox" aria-label={ui.speakerLabel}>
        {speaker}
      </div>
      <p className="pc-dialogue-text">{text}</p>
      <div className="pc-dialogue-actions">
        <CitationDrawer claim={line.claim} />
        <button type="button" onClick={onAdvance}>
          {isLast ? ui.dismiss : ui.continue}
        </button>
      </div>
    </section>
  );
}
