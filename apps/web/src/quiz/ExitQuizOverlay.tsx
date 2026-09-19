import { useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  manchesterExitQuiz,
  resolveLocalized,
  type Locale,
} from "@physics-chronicle/content";

export type ExitQuizResult = {
  correctCount: number;
  passed: boolean;
};

type Props = {
  locale?: Locale;
  open: boolean;
  onPass: (result: ExitQuizResult) => void;
  /** Soft skip — closes without requiring a pass. */
  onSkip: () => void;
  onClose: () => void;
};

/**
 * Optional Coupland exit quiz (M3.5). Soft skip allowed.
 * Pass when correct answers ≥ manchesterExitQuiz.passNeed (default 2).
 */
export function ExitQuizOverlay({
  locale = DEFAULT_LOCALE,
  open,
  onPass,
  onSkip,
  onClose,
}: Props) {
  const quiz = manchesterExitQuiz;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const correctCount = useMemo(() => {
    let n = 0;
    for (const q of quiz.questions) {
      const pick = answers[q.id];
      const choice = q.choices.find((c) => c.id === pick);
      if (choice?.correct) n += 1;
    }
    return n;
  }, [answers, quiz.questions]);

  const passed = correctCount >= quiz.passNeed;
  const allAnswered = quiz.questions.every((q) => Boolean(answers[q.id]));

  if (!open) return null;

  const title = resolveLocalized(quiz.title, locale);
  const ui =
    locale === "zh-Hans"
      ? {
          submit: "提交",
          skip: "稍后再测（软跳过）",
          close: "关闭",
          pass: "通过",
          fail: "未达线 — 可再试或跳过",
          need: `需答对 ${quiz.passNeed} / ${quiz.questions.length}`,
          lockedHint: "本章不解锁玻尔场所",
        }
      : {
          submit: "Submit",
          skip: "Skip for now (soft)",
          close: "Close",
          pass: "Passed",
          fail: "Below bar — retry or soft-skip",
          need: `Need ${quiz.passNeed} / ${quiz.questions.length} correct`,
          lockedHint: "Bohr venues stay locked this step",
        };

  const handleSubmit = () => {
    setSubmitted(true);
    if (correctCount >= quiz.passNeed) {
      onPass({ correctCount, passed: true });
    }
  };

  return (
    <div
      className="exit-quiz-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="exit-quiz-overlay__dim" aria-hidden onClick={onClose} />
      <div className="exit-quiz parchment-panel exit-quiz-overlay__panel">
        <header className="exit-quiz__head">
          <h2 className="exit-quiz__title">{title}</h2>
          <p className="exit-quiz__need">{ui.need}</p>
        </header>

        <ol className="exit-quiz__list">
          {quiz.questions.map((q, i) => {
            const prompt = resolveLocalized(q.prompt, locale);
            return (
              <li key={q.id} className="exit-quiz__q">
                <p className="exit-quiz__prompt">
                  <span className="exit-quiz__num">{i + 1}.</span> {prompt}
                </p>
                <div
                  className="exit-quiz__choices"
                  role="radiogroup"
                  aria-label={prompt}
                >
                  {q.choices.map((c) => {
                    const selected = answers[q.id] === c.id;
                    const showMark = submitted && selected;
                    const ok = c.correct;
                    return (
                      <label
                        key={c.id}
                        className={`exit-quiz__choice${selected ? " exit-quiz__choice--on" : ""}${
                          showMark
                            ? ok
                              ? " exit-quiz__choice--correct"
                              : " exit-quiz__choice--wrong"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={c.id}
                          checked={selected}
                          disabled={submitted && passed}
                          onChange={() => {
                            setSubmitted(false);
                            setAnswers((prev) => ({ ...prev, [q.id]: c.id }));
                          }}
                        />
                        <span>{resolveLocalized(c.label, locale)}</span>
                      </label>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ol>

        {submitted ? (
          <p
            className={`exit-quiz__result${passed ? " exit-quiz__result--pass" : ""}`}
            role="status"
          >
            {passed
              ? `${ui.pass} (${correctCount}/${quiz.questions.length})`
              : `${ui.fail} (${correctCount}/${quiz.questions.length})`}
            {" · "}
            {ui.lockedHint}
          </p>
        ) : null}

        <div className="exit-quiz__actions">
          <button
            type="button"
            className="paper-btn"
            disabled={!allAnswered || (submitted && passed)}
            onClick={handleSubmit}
          >
            {ui.submit}
          </button>
          <button type="button" className="paper-btn ghost" onClick={onSkip}>
            {ui.skip}
          </button>
          <button type="button" className="paper-btn ghost" onClick={onClose}>
            {ui.close}
          </button>
        </div>
      </div>
    </div>
  );
}
