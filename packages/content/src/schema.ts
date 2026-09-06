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

export const dialogueLineSchema = z.object({
  id: z.string(),
  speaker: z.string(),
  speakerRole: z.enum(["scientist", "companion", "narrator"]).optional(),
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

export const venueSchema = z.object({
  id: z.string(),
  name: z.string(),
  place: z.string(),
  years: z.string(),
  kind: z.enum(["lab", "study"]),
  labId: z.enum(["mc-scattering"]).nullable(),
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
