import manchesterRaw from "./data/manchester.json";
import { cityChapterSchema } from "./schema";
import type { CityChapter, VenueContent } from "./schema";

export {
  atlasNodeSchema,
  cityChapterSchema,
  claimMetaSchema,
  dialogueLineSchema,
  sourceTierSchema,
  venueSchema,
  SOURCE_TIER_LABEL,
  type AtlasNode,
  type CityChapter,
  type ClaimMeta,
  type DialogueLine,
  type SourceTier,
  type VenueContent,
} from "./schema";

export const manchester: CityChapter = cityChapterSchema.parse(manchesterRaw);

export function venueById(
  chapter: CityChapter,
  venueId: string,
): VenueContent | undefined {
  return chapter.venues.find((v) => v.id === venueId);
}
