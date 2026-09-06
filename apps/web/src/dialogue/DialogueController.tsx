import { DialoguePanel } from "@physics-chronicle/ui";
import { useGame } from "../app/GameState";

export function DialogueController() {
  const { venue, dialogueIndex, dialogueOpen, advanceDialogue, mode } = useGame();
  if (mode !== "venue" || !venue || !dialogueOpen) return null;
  const line = venue.dialogue[dialogueIndex];
  if (!line) return null;
  return (
    <div className="dialogue-slot">
      <DialoguePanel
        line={line}
        onAdvance={advanceDialogue}
        isLast={dialogueIndex >= venue.dialogue.length - 1}
      />
    </div>
  );
}
