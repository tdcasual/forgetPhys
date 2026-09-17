import {
  DEFAULT_LOCALE,
  lineText,
  resolveLocalized,
  type Locale,
  type ScriptedChoice,
} from "@physics-chronicle/content";

/** Minimal soft-choice UI stub (M3.2). EN SoT labels from content JSON. */
export function ChoiceBeat({
  choice,
  locale = DEFAULT_LOCALE,
  onPick,
}: {
  choice: ScriptedChoice;
  locale?: Locale;
  onPick: (optionId: string) => void;
}) {
  const prompt = resolveLocalized(choice.prompt, locale);
  return (
    <section
      className="choice-beat parchment-panel"
      role="group"
      aria-label={prompt}
      style={{
        margin: "0.75rem 0",
        padding: "0.85rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.55rem",
      }}
    >
      <p style={{ margin: 0, fontWeight: 600 }}>{prompt}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {choice.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className="paper-btn"
            onClick={() => onPick(opt.id)}
          >
            {resolveLocalized(opt.label, locale)}
          </button>
        ))}
      </div>
    </section>
  );
}

/** Re-export lineText for consequence playback helpers. */
export { lineText };
