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
  labEmbedSchema,
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
  type SourceTier,
  type VenueContent,
  type VenueProp,
} from "./schema";

export const manchester: CityChapter = cityChapterSchema.parse(manchesterRaw);

export function venueById(
  chapter: CityChapter,
  venueId: string,
): VenueContent | undefined {
  return chapter.venues.find((v) => v.id === venueId);
}
