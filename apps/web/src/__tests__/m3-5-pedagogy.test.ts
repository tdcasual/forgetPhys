import { describe, expect, it } from "vitest";
import {
  manchesterExitQuiz,
  resolveLocalized,
} from "@physics-chronicle/content";
import {
  emptyProgress,
  markLodgeComplete,
  markQuizPassed,
  markTeaserSeen,
  parseProgress,
} from "../progress";

describe("M3.5 Manchester exit quiz + teaser", () => {
  it("parses 3-question quiz with passNeed 2 and locked Bohr teaser", () => {
    expect(manchesterExitQuiz.id).toBe("manchester-exit-quiz");
    expect(manchesterExitQuiz.passNeed).toBe(2);
    expect(manchesterExitQuiz.questions).toHaveLength(3);
    expect(manchesterExitQuiz.teaser.locked).toBe(true);
    expect(resolveLocalized(manchesterExitQuiz.teaser.title, "en")).toMatch(
      /Copenhagen/,
    );
    expect(
      resolveLocalized(manchesterExitQuiz.teaser.title, "zh-Hans"),
    ).toMatch(/哥本哈根/);
  });

  it("each question has exactly one correct choice", () => {
    for (const q of manchesterExitQuiz.questions) {
      const correct = q.choices.filter((c) => c.correct);
      expect(correct).toHaveLength(1);
    }
  });

  it("progress unlock fields quizPassed / teaserSeen / lodgeComplete persist", () => {
    let p = emptyProgress();
    expect(p.unlock.lodgeComplete).toBe(false);
    p = markLodgeComplete(p);
    p = markQuizPassed(p);
    p = markTeaserSeen(p);
    expect(p.unlock.lodgeComplete).toBe(true);
    expect(p.unlock.quizPassed).toBe(true);
    expect(p.unlock.teaserSeen).toBe(true);
    const round = parseProgress(JSON.parse(JSON.stringify(p)));
    expect(round.unlock.quizPassed).toBe(true);
    expect(round.unlock.teaserSeen).toBe(true);
    expect(round.unlock.lodgeComplete).toBe(true);
  });

  it("soft teaser gate: lodgeComplete alone is enough without quiz", () => {
    const p = markLodgeComplete(emptyProgress());
    expect(p.unlock.lodgeComplete || p.unlock.quizPassed).toBe(true);
    expect(p.unlock.quizPassed).toBe(false);
  });
});
