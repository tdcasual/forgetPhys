import { describe, expect, it } from "vitest";
import { manchesterChoices } from "@physics-chronicle/content";
import {
  getScriptedChoice,
  resolveScriptedChoice,
  tagsFromResolution,
} from "../choices";

describe("M3.2 scripted choice runtime stub", () => {
  it("loads three Coupland soft choices from EN SoT", () => {
    expect(manchesterChoices.choices.map((c) => c.id)).toEqual(
      expect.arrayContaining([
        "choice-model-push",
        "choice-shell-metaphor",
        "choice-return-bench",
      ]),
    );
  });

  it("resolve choice-return-bench yes → deep-link lab soft effect", () => {
    const res = resolveScriptedChoice("choice-return-bench", "opt-return-lab");
    expect(res).toBeTruthy();
    expect(res!.deepLinkLab).toBe(true);
    expect(res!.consequenceLines.length).toBeGreaterThan(0);
    expect(tagsFromResolution(res!)).toContain("deep-link-lab");
  });

  it("shell-as-fact → interpretation warning tag", () => {
    const res = resolveScriptedChoice(
      "choice-shell-metaphor",
      "opt-shell-as-lab-fact",
    );
    expect(res!.interpretationWarning).toBe(true);
    expect(getScriptedChoice("choice-shell-metaphor")?.placement).toBe("lab");
  });
});
