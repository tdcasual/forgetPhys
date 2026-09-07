import { z } from "zod";

/** Canon venue id for Coupland α debate board / persist keys. */
export const CANON_VENUE_LAB_COUPLAND = "lab-coupland" as const;
export const LEGACY_VENUE_COUPLAND_LAB = "coupland-lab" as const;

/**
 * Map legacy alias `coupland-lab` → canon `lab-coupland`.
 * Other ids pass through unchanged.
 */
export function normalizeVenueId(venueId: string): string {
  if (venueId === LEGACY_VENUE_COUPLAND_LAB) return CANON_VENUE_LAB_COUPLAND;
  return venueId;
}

export const debateModeSchema = z.enum(["scripted", "free", "hard"]);
export type DebateMode = z.infer<typeof debateModeSchema>;

export const factTierSchema = z.enum(["primary", "textbook", "fact"]);
export type FactTier = z.infer<typeof factTierSchema>;

export const eraTierSchema = z.literal("era_opinion");
export type EraTier = z.infer<typeof eraTierSchema>;

export const yearRangeSchema = z.tuple([z.number(), z.number()]);

export const mesExampleSchema = z.object({
  user: z.string(),
  assistant: z.string(),
});

export const personaCardSchema = z.object({
  id: z.string().min(1),
  spec: z.string().min(1),
  name: z.string().min(1),
  name_zh: z.string().min(1),
  charId: z.string().nullable(),
  description: z.string(),
  personality: z.string(),
  scenario: z.string(),
  system_prompt: z.string(),
  mes_example: z.array(mesExampleSchema),
  bans: z.array(z.string()),
  era: z.string().min(1),
  venue_tags: z.array(z.string()),
  modes: z.array(debateModeSchema).min(1),
  default_stance: z.string().optional(),
  aliases: z.array(z.string()).optional(),
  form: z.string().optional(),
  identity_locked: z.boolean().optional(),
  optional_named_skins_ref: z.string().optional(),
  hard_role_default: z.string().optional(),
  hard_role_optional: z.string().optional(),
  notes: z.string().optional(),
});

export type PersonaCard = z.infer<typeof personaCardSchema>;

export const factCardSchema = z.object({
  id: z.string().min(1),
  keys: z.array(z.string()).min(1),
  content: z.string().min(1),
  content_zh: z.string().min(1),
  year_range: yearRangeSchema,
  tier: factTierSchema,
  citation: z.string().min(1),
});

export type FactCard = z.infer<typeof factCardSchema>;

export const factStoreFileSchema = z.object({
  id: z.string().min(1),
  era: z.string().min(1),
  venue_tags: z.array(z.string()),
  source_note: z.string().optional(),
  cards: z.array(factCardSchema).min(1),
});

export type FactStoreFile = z.infer<typeof factStoreFileSchema>;

export const eraOpinionCardSchema = z
  .object({
    id: z.string().min(1),
    keys: z.array(z.string()).min(1),
    content: z.string().min(1),
    content_zh: z.string().min(1),
    year_range: yearRangeSchema,
    tier: eraTierSchema,
    citation: z.string().optional(),
    claim: z.string().optional(),
    source_tier: z.string().optional(),
    /** Era opinions never fill EvidenceBoard — default false when omitted. */
    fills_slots: z.boolean().default(false),
  })
  .superRefine((card, ctx) => {
    if (card.fills_slots !== false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `era_opinion card ${card.id} must have fills_slots === false`,
        path: ["fills_slots"],
      });
    }
  });

export type EraOpinionCard = z.infer<typeof eraOpinionCardSchema>;

export const eraOpinionStoreFileSchema = z.object({
  id: z.string().min(1),
  era: z.string().min(1),
  venue_tags: z.array(z.string()),
  note: z.string().optional(),
  cards: z.array(eraOpinionCardSchema).min(1),
});

export type EraOpinionStoreFile = z.infer<typeof eraOpinionStoreFileSchema>;

export const hardWinSchema = z.object({
  M: z.number().int().positive(),
  N: z.number().int().positive(),
  require_critic_pass: z.boolean(),
  judge: z.literal("rules"),
  rewrite_chronicle_ending: z.boolean(),
  suggested_turn_budget: z.number().int().positive().optional(),
  persuade_target: z.string().min(1),
  persuade_target_note: z.string().optional(),
  /** Locked false — Hard win is stance/board, not Rutherford. */
  rutherford_is_win_object: z.literal(false),
});

export type HardWin = z.infer<typeof hardWinSchema>;

export const slotDefSchema = z.object({
  id: z.string().min(1),
  label_zh: z.string().min(1),
  what_counts: z.string().min(1),
  linked_fact_ids: z.array(z.string()).min(1),
  accepts_lab_embed: z.boolean(),
});

export type SlotDef = z.infer<typeof slotDefSchema>;

export const hardSlotsFileSchema = z.object({
  id: z.string().min(1),
  title_zh: z.string().min(1),
  venue_id: z.string().min(1).transform(normalizeVenueId),
  docs: z.string().optional(),
  win: hardWinSchema,
  slots: z.array(slotDefSchema).min(1),
});

export type HardSlotsFile = z.infer<typeof hardSlotsFileSchema>;

export const criticChallengeTemplateSchema = z.object({
  claimId: z.string().min(1),
  eraOpinionIds: z.array(z.string()),
  aimSlots: z.array(z.string()),
  text_zh: z.string().min(1),
  text_en: z.string().optional(),
  voice: z.string().optional(),
  notes: z.string().optional(),
});

export type CriticChallengeTemplate = z.infer<
  typeof criticChallengeTemplateSchema
>;

export const criticChallengeTemplatesFileSchema = z.object({
  id: z.string().min(1),
  title_zh: z.string().min(1),
  venue_id: z.string().min(1).transform(normalizeVenueId),
  docs: z.string().optional(),
  voice: z.string().optional(),
  voice_note: z.string().optional(),
  rules: z
    .object({
      fills_slots: z.literal(false),
      store: z.string(),
      cannot_veto_legal_fact_fill: z.boolean(),
    })
    .optional(),
  templates: z.array(criticChallengeTemplateSchema).min(1),
});

export type CriticChallengeTemplatesFile = z.infer<
  typeof criticChallengeTemplatesFileSchema
>;
