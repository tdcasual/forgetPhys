import factsRaw from "./facts-alpha-scattering-1909.json";
import eraOpinionsRaw from "./era-opinions-1909-atomic.json";
import hardSlotsRaw from "./hard-slots-alpha-1909.json";
import criticTemplatesRaw from "./critic-challenge-templates-alpha-1909.json";
import personaRutherfordRaw from "./persona-rutherford-1909.json";
import personaWatsonRaw from "./persona-watson.json";
import personaEraPeerRaw from "./persona-era-peer-1909.json";
import {
  criticChallengeTemplatesFileSchema,
  eraOpinionStoreFileSchema,
  factStoreFileSchema,
  hardSlotsFileSchema,
  normalizeVenueId,
  personaCardSchema,
  type CriticChallengeTemplatesFile,
  type EraOpinionStoreFile,
  type FactStoreFile,
  type HardSlotsFile,
  type PersonaCard,
} from "./schema";

export {
  normalizeVenueId,
  CANON_VENUE_LAB_COUPLAND,
  LEGACY_VENUE_COUPLAND_LAB,
} from "./schema";

export function loadPersonaRutherford1909(): PersonaCard {
  return personaCardSchema.parse(personaRutherfordRaw);
}

export function loadPersonaWatson(): PersonaCard {
  return personaCardSchema.parse(personaWatsonRaw);
}

export function loadPersonaEraPeer1909(): PersonaCard {
  return personaCardSchema.parse(personaEraPeerRaw);
}

export function loadAllPersonas(): PersonaCard[] {
  return [
    loadPersonaRutherford1909(),
    loadPersonaWatson(),
    loadPersonaEraPeer1909(),
  ];
}

export function loadFactsAlphaScattering1909(): FactStoreFile {
  return factStoreFileSchema.parse(factsRaw);
}

export function loadEraOpinions1909Atomic(): EraOpinionStoreFile {
  return eraOpinionStoreFileSchema.parse(eraOpinionsRaw);
}

export function loadHardSlotsAlpha1909(): HardSlotsFile {
  return hardSlotsFileSchema.parse(hardSlotsRaw);
}

export function loadCriticChallengeTemplatesAlpha1909(): CriticChallengeTemplatesFile {
  return criticChallengeTemplatesFileSchema.parse(criticTemplatesRaw);
}

/** Coupland α debate pack — venue keys always canon `lab-coupland`. */
export function loadCouplandDebatePack(): {
  venueId: string;
  personas: PersonaCard[];
  facts: FactStoreFile;
  eraOpinions: EraOpinionStoreFile;
  hardSlots: HardSlotsFile;
  criticTemplates: CriticChallengeTemplatesFile;
} {
  const hardSlots = loadHardSlotsAlpha1909();
  const criticTemplates = loadCriticChallengeTemplatesAlpha1909();
  return {
    venueId: normalizeVenueId(hardSlots.venue_id),
    personas: loadAllPersonas(),
    facts: loadFactsAlphaScattering1909(),
    eraOpinions: loadEraOpinions1909Atomic(),
    hardSlots,
    criticTemplates,
  };
}
