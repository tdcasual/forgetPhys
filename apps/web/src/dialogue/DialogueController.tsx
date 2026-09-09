import { DEFAULT_LOCALE } from "@physics-chronicle/content";
import { DialoguePanel } from "@physics-chronicle/ui";
import { useGame } from "../app/GameState";

export function DialogueController() {
  const { venue, dialogueIndex, dialogueOpen, advanceDialogue, mode, progress } =
    useGame();
  if (mode !== "venue" || !venue || !dialogueOpen) return null;
  const line = venue.dialogue[dialogueIndex];
  if (!line) return null;
  const locale = progress.settings?.locale ?? DEFAULT_LOCALE;
  return (
    <div className="dialogue-slot">
      <DialoguePanel
        line={line}
        locale={locale}
        onAdvance={advanceDialogue}
        isLast={dialogueIndex >= venue.dialogue.length - 1}
      />
    </div>
  );
}
