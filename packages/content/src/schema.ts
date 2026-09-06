import { z } from "zod";

export const sourceTierSchema = z.enum([
  "textbook",
  "primary",
  "secondary",
  "interpretation",
]);

export type SourceTier = z.infer<typeof sourceTierSchema>;

export const claimMetaSchema = z.object({
  source_tier: sourceTierSchema,
  citation: z.string().min(1),
  locator: z.string().optional(),
  notes: z.string().optional(),
});

export type ClaimMeta = z.infer<typeof claimMetaSchema>;

export const dialogueEmotionSchema = z.enum([
  "idle",
  "speak",
  "surprise",
  "tease",
  "think",
]);

export type DialogueEmotion = z.infer<typeof dialogueEmotionSchema>;

/** Body pose (separate from facial emotion). Assets: {pose}__{emotion}.png */
export const dialoguePoseSchema = z.enum([
  "stand",
  "sit-chair",
  "sit-stool",
  "lean-bench",
  "point-screen",
  "write-desk",
]);

export type DialoguePose = z.infer<typeof dialoguePoseSchema>;

export const dialogueLineSchema = z.object({
  id: z.string(),
  speaker: z.string(),
  speakerRole: z.enum(["scientist", "companion", "narrator"]).optional(),
  /** Portrait folder under assets/chars/, e.g. char-rutherford / char-watson */
  charId: z.string().optional(),
  /** Emotion file stem: idle/speak/surprise/tease/think */
  emotion: dialogueEmotionSchema.optional(),
  /** Body pose; falls back to emotion-only / idle assets when missing */
  pose: dialoguePoseSchema.optional(),
  text: z.string().min(1),
  claim: claimMetaSchema,
});

export type DialogueLine = z.infer<typeof dialogueLineSchema>;

export const atlasNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  subtitle: z.string().optional(),
  x: z.number(),
  y: z.number(),
  venueId: z.string(),
});

export type AtlasNode = z.infer<typeof atlasNodeSchema>;

export const labEmbedSchema = z.object({
  provider: z.literal("infinitas"),
  url: z.string().url(),
  title: z.string().min(1),
  fallbackUrl: z.string().url().optional(),
});

export type LabEmbed = z.infer<typeof labEmbedSchema>;


export const venuePropSchema = z.object({
  id: z.string().min(1),
  /** Normalized stage coords [x, y] in 0–1 (origin top-left of venue stage). */
  hotspot: z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]),
  /** Optional prop state stem under assets/props/{id}/states/{state}.png */
  state: z.string().optional(),
});

export type VenueProp = z.infer<typeof venuePropSchema>;

/** Companion (Watson) era outfit wiring for a venue. */
export const companionSchema = z.object({
  charId: z.string().optional(),
  /** Era outfit slug under assets/chars/char-watson/outfits/{outfit}/ */
  outfit: z.string().min(1),
});

export type CompanionConfig = z.infer<typeof companionSchema>;

export const venueSchema = z.object({
  id: z.string(),
  name: z.string(),
  place: z.string(),
  years: z.string(),
  kind: z.enum(["lab", "study", "lodge"]),
  labId: z.enum(["mc-scattering"]).nullable(),
  labEmbed: labEmbedSchema.optional(),
  /** Watson era outfit for this venue (preferred). */
  companion: companionSchema.optional(),
  /** Alias for companion.outfit when companion block omitted. */
  watsonOutfit: z.string().optional(),
  /** Independent prop layers (not baked into bg). */
  props: z.array(venuePropSchema).optional(),
  dialogue: z.array(dialogueLineSchema).min(1),
});

export type VenueContent = z.infer<typeof venueSchema>;

export const cityChapterSchema = z.object({
  id: z.string(),
  city: z.string(),
  era: z.string(),
  atlas: z.object({
    title: z.string(),
    caption: z.string(),
    nodes: z.array(atlasNodeSchema).min(1),
  }),
  venues: z.array(venueSchema).min(1),
});

export type CityChapter = z.infer<typeof cityChapterSchema>;

export const SOURCE_TIER_LABEL: Record<SourceTier, string> = {
  textbook: "教材",
  primary: "一手",
  secondary: "二手",
  interpretation: "演绎",
};
