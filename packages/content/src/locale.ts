/** Supported player locales (UI + dialogue single switch). */
export type Locale = "en" | "zh-Hans";

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALES: readonly Locale[] = ["en", "zh-Hans"] as const;

export function isLocale(v: unknown): v is Locale {
  return v === "en" || v === "zh-Hans";
}

/**
 * Bilingual map or legacy plain string.
 * Legacy **string = en** (Coupland EN SoT landed; ADR-0006 Decision §2).
 */
export type LocalizedText =
  | string
  | {
      en: string;
      "zh-Hans"?: string;
    };

/** Resolve localized string: requested → en → first available. */
export function resolveLocalized(
  text: LocalizedText,
  locale: Locale = DEFAULT_LOCALE,
): string {
  if (typeof text === "string") {
    // Legacy string text = en
    return text;
  }
  const requested = text[locale];
  if (typeof requested === "string" && requested.length > 0) return requested;
  if (typeof text.en === "string" && text.en.length > 0) return text.en;
  for (const v of Object.values(text)) {
    if (typeof v === "string" && v.length > 0) return v;
  }
  return "";
}

/**
 * Runtime helper: `lineText(line, locale)` or `lineText(text, locale)`.
 * Falls back: requested → en → first available.
 */
export function lineText(
  lineOrText: { text: LocalizedText } | LocalizedText,
  locale: Locale = DEFAULT_LOCALE,
): string {
  if (
    typeof lineOrText === "object" &&
    lineOrText != null &&
    "text" in lineOrText
  ) {
    return resolveLocalized(lineOrText.text, locale);
  }
  return resolveLocalized(lineOrText as LocalizedText, locale);
}

/** Display names keyed by charId (preferred). */
const CHAR_DISPLAY: Record<string, Record<Locale, string>> = {
  "char-rutherford": { en: "Rutherford", "zh-Hans": "卢瑟福" },
  "char-watson": { en: "Watson", "zh-Hans": "华生" },
  "char-weiguang": { en: "Watson", "zh-Hans": "华生" },
  "char-companion": { en: "Watson", "zh-Hans": "华生" },
  "char-geiger": { en: "Geiger", "zh-Hans": "盖革" },
  "char-thomson": { en: "Thomson", "zh-Hans": "汤姆孙" },
  "char-bohr": { en: "Bohr", "zh-Hans": "玻尔" },
};

/** Role fallback when charId missing (narrator / companion / scientist). */
const ROLE_DISPLAY: Record<string, Record<Locale, string>> = {
  narrator: { en: "Narrator", "zh-Hans": "旁白" },
  companion: { en: "Watson", "zh-Hans": "华生" },
  scientist: { en: "Rutherford", "zh-Hans": "卢瑟福" },
};

/**
 * Known speaker-field aliases (Chinese content labels ↔ EN).
 * Used when charId/role do not resolve.
 */
const SPEAKER_ALIAS: Record<string, Record<Locale, string>> = {
  华生: { en: "Watson", "zh-Hans": "华生" },
  Watson: { en: "Watson", "zh-Hans": "华生" },
  卢瑟福: { en: "Rutherford", "zh-Hans": "卢瑟福" },
  Rutherford: { en: "Rutherford", "zh-Hans": "卢瑟福" },
  旁白: { en: "Narrator", "zh-Hans": "旁白" },
  Narrator: { en: "Narrator", "zh-Hans": "旁白" },
  盖革: { en: "Geiger", "zh-Hans": "盖革" },
  Geiger: { en: "Geiger", "zh-Hans": "盖革" },
  汤姆孙: { en: "Thomson", "zh-Hans": "汤姆孙" },
  Thomson: { en: "Thomson", "zh-Hans": "汤姆孙" },
  玻尔: { en: "Bohr", "zh-Hans": "玻尔" },
  Bohr: { en: "Bohr", "zh-Hans": "玻尔" },
};

export type SpeakerLookup = {
  charId?: string | null;
  speakerRole?: string | null;
  /** Legacy string speaker label (often Chinese in content). */
  speaker?: string | LocalizedText | null;
};

/**
 * Localized speaker display name.
 * Prefer charId table → role table → speaker bilingual/alias → raw string.
 */
export function speakerDisplayName(
  lookup: SpeakerLookup,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const charId = lookup.charId ?? undefined;
  if (charId && CHAR_DISPLAY[charId]) {
    return CHAR_DISPLAY[charId][locale];
  }

  const role = lookup.speakerRole ?? undefined;
  if (role && ROLE_DISPLAY[role]) {
    return ROLE_DISPLAY[role][locale];
  }

  const speaker = lookup.speaker;
  if (speaker == null) return "";
  if (typeof speaker !== "string") {
    return resolveLocalized(speaker, locale);
  }
  const alias = SPEAKER_ALIAS[speaker];
  if (alias) return alias[locale];
  return speaker;
}

/** DialoguePanel chrome (advance / dismiss). */
export const DIALOGUE_UI: Record<
  Locale,
  { continue: string; dismiss: string; dialogLabel: string; speakerLabel: string }
> = {
  en: {
    continue: "Continue",
    dismiss: "Close",
    dialogLabel: "Dialogue",
    speakerLabel: "Speaker",
  },
  "zh-Hans": {
    continue: "继续",
    dismiss: "收起",
    dialogLabel: "对话",
    speakerLabel: "说话人",
  },
};
