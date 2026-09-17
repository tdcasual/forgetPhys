/**
 * M3.2 soft choice runtime stub — schema in content; EN copy in manchester-choices.json.
 * Soft effects only (tags / badge / deep-link lab). Does not soft-lock Hard.
 */
import {
  manchesterChoices,
  type ScriptedChoice,
  type ScriptedChoiceOption,
  type DialogueLine,
} from "@physics-chronicle/content";

export type SoftChoiceEffectKind =
  | "pushback_tag"
  | "interpretation_warning"
  | "lexicon_clean"
  | "deep_link_lab"
  | "stay_city"
  | "model_central_charge";

export type SoftChoiceEffect = {
  kind: SoftChoiceEffectKind;
  /** Tag persisted on progress.softChoiceTags when present. */
  tag?: string;
};

export type ChoiceResolution = {
  choice: ScriptedChoice;
  option: ScriptedChoiceOption;
  effects: SoftChoiceEffect[];
  consequenceLines: DialogueLine[];
  /** When true, host should open labEmbed after consequence beats. */
  deepLinkLab: boolean;
  /** When true, host should show InterpretationBadge / lodge warning. */
  interpretationWarning: boolean;
};

const TAG_TO_EFFECT: Record<string, SoftChoiceEffectKind> = {
  "model-pushback": "pushback_tag",
  "interpretation-warning": "interpretation_warning",
  "shell-late": "interpretation_warning",
  "lexicon-clean": "lexicon_clean",
  "deep-link-lab": "deep_link_lab",
  "stay-city": "stay_city",
  "model-central-charge": "model_central_charge",
};

export function listScriptedChoices(): ScriptedChoice[] {
  return manchesterChoices.choices;
}

export function getScriptedChoice(choiceId: string): ScriptedChoice | null {
  return manchesterChoices.choices.find((c) => c.id === choiceId) ?? null;
}

export function choicesForPlacement(
  placement: ScriptedChoice["placement"],
): ScriptedChoice[] {
  return manchesterChoices.choices.filter((c) => c.placement === placement);
}

export function effectsFromOption(
  option: ScriptedChoiceOption,
): SoftChoiceEffect[] {
  const effects: SoftChoiceEffect[] = [];
  for (const tag of option.tags ?? []) {
    const kind = TAG_TO_EFFECT[tag];
    if (kind) effects.push({ kind, tag });
    else effects.push({ kind: "pushback_tag", tag });
  }
  return effects;
}

/**
 * Resolve a pick — returns consequence lines + soft effects for the host to apply.
 * Copy EN lines live in content JSON; this module does not invent dialogue.
 */
export function resolveScriptedChoice(
  choiceId: string,
  optionId: string,
): ChoiceResolution | null {
  const choice = getScriptedChoice(choiceId);
  if (!choice) return null;
  const option = choice.options.find((o) => o.id === optionId);
  if (!option) return null;
  const effects = effectsFromOption(option);
  return {
    choice,
    option,
    effects,
    consequenceLines: option.consequenceLines,
    deepLinkLab: effects.some((e) => e.kind === "deep_link_lab"),
    interpretationWarning: effects.some(
      (e) => e.kind === "interpretation_warning",
    ),
  };
}

export function tagsFromResolution(res: ChoiceResolution): string[] {
  return res.effects.map((e) => e.tag).filter((t): t is string => Boolean(t));
}
