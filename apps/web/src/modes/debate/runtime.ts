import { loadCouplandDebatePack } from "@physics-chronicle/content";
import {
  StubGroundedReply,
  createCouplandDebateRuntime,
  type DebateSession,
  type GroundedReplyTransport,
} from "@physics-chronicle/debate";
import { createBffGroundedReplyTransport } from "./bffTransport";

export type CouplandDebateRuntime = {
  session: DebateSession;
  venueId: string;
  pack: ReturnType<typeof loadCouplandDebatePack>;
  transport: GroundedReplyTransport;
};

let singleton: CouplandDebateRuntime | null = null;

/**
 * Process-lifetime Coupland runtime — survives Venue↔LabEmbed remounts.
 * Transport → same-origin BFF (ADR-0003 / ADR-0005); no vendor keys in SPA.
 */
export function getCouplandDebateRuntime(): CouplandDebateRuntime {
  if (!singleton) {
    const transport = createBffGroundedReplyTransport();
    const { session, venueId, deps } = createCouplandDebateRuntime({
      transport,
      groundedReply: new StubGroundedReply(),
    });
    const pack = loadCouplandDebatePack();
    // Keep deps.transport aligned if session was created with overrides
    void deps;
    singleton = { session, venueId, pack, transport };
  }
  return singleton;
}

/** Test helper — reset singleton between vitest cases. */
export function __resetCouplandDebateRuntimeForTests(): void {
  singleton = null;
}
