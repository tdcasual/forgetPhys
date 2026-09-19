import { DEFAULT_LOCALE } from "@physics-chronicle/content";
import { DialoguePanel, InterpretationBadge } from "@physics-chronicle/ui";
import { useGame } from "../app/GameState";
import { ChoiceBeat } from "../choices";

export function DialogueController() {
  const {
    venue,
    dialogueIndex,
    dialogueOpen,
    advanceDialogue,
    mode,
    progress,
    activeChoice,
    pickScriptedChoiceOption,
    choiceConsequenceLines,
    choiceConsequenceIndex,
    hasInterpretationWarning,
  } = useGame();

  if (mode !== "venue" || !venue || !dialogueOpen) return null;

  const locale = progress.settings?.locale ?? DEFAULT_LOCALE;

  if (activeChoice) {
    return (
      <div className="dialogue-slot">
        {hasInterpretationWarning ? (
          <InterpretationBadge variant="corner" />
        ) : null}
        <ChoiceBeat
          choice={activeChoice}
          locale={locale}
          onPick={pickScriptedChoiceOption}
        />
      </div>
    );
  }

  const inConsequence = choiceConsequenceLines.length > 0;
  const line = inConsequence
    ? choiceConsequenceLines[choiceConsequenceIndex]
    : venue.dialogue[dialogueIndex];
  if (!line) return null;

  const isLast = inConsequence
    ? choiceConsequenceIndex >= choiceConsequenceLines.length - 1
    : dialogueIndex >= venue.dialogue.length - 1;

  return (
    <div className="dialogue-slot">
      {hasInterpretationWarning ? (
        <InterpretationBadge variant="corner" />
      ) : null}
      <DialoguePanel
        line={line}
        locale={locale}
        onAdvance={advanceDialogue}
        isLast={isLast}
      />
    </div>
  );
}
