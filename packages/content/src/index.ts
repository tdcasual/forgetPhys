import manchesterRaw from "./data/manchester.json";
import { cityChapterSchema } from "./schema";
import type { CityChapter, VenueContent } from "./schema";

export {
  atlasNodeSchema,
  cityChapterSchema,
  claimMetaSchema,
  companionSchema,
  dialogueEmotionSchema,
  dialoguePoseSchema,
  dialogueLineSchema,
  localizedTextSchema,
  labEmbedSchema,
  propLayoutSchema,
  propSlotDefSchema,
  sourceTierSchema,
  venuePropSchema,
  venueSchema,
  SOURCE_TIER_LABEL,
  type AtlasNode,
  type CityChapter,
  type ClaimMeta,
  type CompanionConfig,
  type DialogueEmotion,
  type DialoguePose,
  type DialogueLine,
  type LabEmbed,
  type PropLayout,
  type PropSlotDef,
  type SourceTier,
  type VenueContent,
  type VenueProp,
} from "./schema";

export {
  CANON_VENUE_LAB_COUPLAND,
  LEGACY_VENUE_COUPLAND_LAB,
  normalizeVenueId,
  debateModeSchema,
  factTierSchema,
  eraTierSchema,
  yearRangeSchema,
  mesExampleSchema,
  personaCardSchema,
  factCardSchema,
  factStoreFileSchema,
  eraOpinionCardSchema,
  eraOpinionStoreFileSchema,
  hardWinSchema,
  slotDefSchema,
  hardSlotsFileSchema,
  criticChallengeTemplateSchema,
  criticChallengeTemplatesFileSchema,
  type DebateMode,
  type FactTier,
  type EraTier,
  type PersonaCard,
  type FactCard,
  type FactStoreFile,
  type EraOpinionCard,
  type EraOpinionStoreFile,
  type HardWin,
  type SlotDef,
  type HardSlotsFile,
  type CriticChallengeTemplate,
  type CriticChallengeTemplatesFile,
} from "./debate/schema";

export {
  loadPersonaRutherford1909,
  loadPersonaWatson,
  loadPersonaEraPeer1909,
  loadAllPersonas,
  loadFactsAlphaScattering1909,
  loadEraOpinions1909Atomic,
  loadHardSlotsAlpha1909,
  loadCriticChallengeTemplatesAlpha1909,
  loadCouplandDebatePack,
} from "./debate/load";


export {
  DEFAULT_LOCALE,
  LOCALES,
  DIALOGUE_UI,
  isLocale,
  lineText,
  resolveLocalized,
  speakerDisplayName,
  type Locale,
  type LocalizedText,
  type SpeakerLookup,
} from "./locale";

export const manchester: CityChapter = cityChapterSchema.parse(manchesterRaw);

export function venueById(
  chapter: CityChapter,
  venueId: string,
): VenueContent | undefined {
  return chapter.venues.find((v) => v.id === venueId);
}
