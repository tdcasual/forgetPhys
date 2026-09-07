import type { EraOpinionCard } from "@physics-chronicle/content";
import type { CardId } from "./types";

export interface EraOpinionStore {
  load(fileIds?: string[]): Promise<void>;
  get(id: CardId): EraOpinionCard | undefined;
  list(filter?: {
    era?: string;
    venue_tags?: string[];
    year?: number;
  }): EraOpinionCard[];
  has(id: CardId): boolean;
  mayFillSlots(id: CardId): false;
}

export class InMemoryEraOpinionStore implements EraOpinionStore {
  private cards: EraOpinionCard[] = [];
  private readonly seed: EraOpinionCard[];
  private readonly fileLoaders: Record<string, () => EraOpinionCard[]>;

  constructor(
    seed: EraOpinionCard[] = [],
    fileLoaders: Record<string, () => EraOpinionCard[]> = {},
  ) {
    this.seed = seed;
    this.fileLoaders = fileLoaders;
    this.cards = [...seed];
  }

  async load(fileIds?: string[]): Promise<void> {
    if (!fileIds || fileIds.length === 0) {
      this.cards = [...this.seed];
      return;
    }
    const next: EraOpinionCard[] = [];
    const seen = new Set<string>();
    for (const id of fileIds) {
      const loader = this.fileLoaders[id];
      if (!loader) {
        throw new Error(`Unknown EraOpinionStore file id: ${id}`);
      }
      for (const card of loader()) {
        if (!seen.has(card.id)) {
          seen.add(card.id);
          next.push(card);
        }
      }
    }
    this.cards = next;
  }

  get(id: CardId): EraOpinionCard | undefined {
    return this.cards.find((c) => c.id === id);
  }

  list(filter?: {
    era?: string;
    venue_tags?: string[];
    year?: number;
  }): EraOpinionCard[] {
    return this.cards.filter((c) => {
      if (filter?.year != null) {
        const [a, b] = c.year_range;
        if (filter.year < a || filter.year > b) return false;
      }
      if (filter?.era) {
        const m = /^(\d{4})-(\d{4})$/.exec(filter.era);
        if (m) {
          const lo = Number(m[1]);
          const hi = Number(m[2]);
          const [a, b] = c.year_range;
          if (b < lo || a > hi) return false;
        }
      }
      if (filter?.venue_tags) {
        void filter.venue_tags;
      }
      return true;
    });
  }

  has(id: CardId): boolean {
    return this.cards.some((c) => c.id === id);
  }

  mayFillSlots(_id: CardId): false {
    return false;
  }
}
