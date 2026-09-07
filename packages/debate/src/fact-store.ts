import type { FactCard } from "@physics-chronicle/content";
import type { CardId } from "./types";

export interface FactStore {
  load(fileIds?: string[]): Promise<void>;
  get(id: CardId): FactCard | undefined;
  list(filter?: { era?: string; venue_tags?: string[] }): FactCard[];
  has(id: CardId): boolean;
}

export class InMemoryFactStore implements FactStore {
  private cards: FactCard[] = [];
  private readonly seed: FactCard[];
  private readonly fileLoaders: Record<string, () => FactCard[]>;

  constructor(
    seed: FactCard[] = [],
    fileLoaders: Record<string, () => FactCard[]> = {},
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
    const next: FactCard[] = [];
    const seen = new Set<string>();
    for (const id of fileIds) {
      const loader = this.fileLoaders[id];
      if (!loader) {
        throw new Error(`Unknown FactStore file id: ${id}`);
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

  get(id: CardId): FactCard | undefined {
    return this.cards.find((c) => c.id === id);
  }

  list(filter?: { era?: string; venue_tags?: string[] }): FactCard[] {
    return this.cards.filter((c) => {
      if (filter?.era) {
        const [a, b] = c.year_range;
        // era string like "1909-1911" — soft match via year overlap if numeric range
        const m = /^(\d{4})-(\d{4})$/.exec(filter.era);
        if (m) {
          const lo = Number(m[1]);
          const hi = Number(m[2]);
          if (b < lo || a > hi) return false;
        }
      }
      if (filter?.venue_tags && filter.venue_tags.length > 0) {
        // Fact cards themselves don't carry venue_tags; filtering is file-level.
        // Keep all when cards are already scoped by load().
        void filter.venue_tags;
      }
      return true;
    });
  }

  has(id: CardId): boolean {
    return this.cards.some((c) => c.id === id);
  }
}
