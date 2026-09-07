import { loadCouplandDebatePack } from "@physics-chronicle/content";
import {
  createCouplandDebateRuntime,
  type DebateSession,
} from "@physics-chronicle/debate";

export type CouplandDebateRuntime = {
  session: DebateSession;
  venueId: string;
  pack: ReturnType<typeof loadCouplandDebatePack>;
};

let singleton: CouplandDebateRuntime | null = null;

/** Process-lifetime Coupland runtime — survives Venue↔LabEmbed remounts. */
export function getCouplandDebateRuntime(): CouplandDebateRuntime {
  if (!singleton) {
    const { session, venueId } = createCouplandDebateRuntime();
    const pack = loadCouplandDebatePack();
    singleton = { session, venueId, pack };
  }
  return singleton;
}
