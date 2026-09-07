import { describe, expect, it } from "vitest";
import {
  loadCouplandDebatePack,
  loadHardSlotsAlpha1909,
  normalizeVenueId,
  CANON_VENUE_LAB_COUPLAND,
  LEGACY_VENUE_COUPLAND_LAB,
  hardSlotsFileSchema,
} from "@physics-chronicle/content";
import {
  InMemoryFactStore,
  InMemoryEraOpinionStore,
  RulesCriticPolicy,
  InMemoryEvidenceBoard,
  RulesJudge,
  createDebateSession,
  labEmbedCandidateSlots,
  DEFAULT_LARGE_ANGLE_DEG_THRESHOLD,
} from "../index";

function makeRuntime() {
  const pack = loadCouplandDebatePack();
  const facts = new InMemoryFactStore(pack.facts.cards);
  const eras = new InMemoryEraOpinionStore(pack.eraOpinions.cards);
  const policy = new RulesCriticPolicy(
    { largeAngleDegThreshold: DEFAULT_LARGE_ANGLE_DEG_THRESHOLD },
    eras,
  );
  const board = new InMemoryEvidenceBoard();
  const judge = new RulesJudge();
  const session = createDebateSession({
    facts,
    eras,
    retriever: { retrieve: () => [] },
    policy,
    board,
    judge,
    hardSlots: pack.hardSlots,
  });
  return { pack, facts, eras, policy, board, judge, session };
}

describe("normalizeVenueId", () => {
  it("maps coupland-lab → lab-coupland (canon)", () => {
    expect(normalizeVenueId(LEGACY_VENUE_COUPLAND_LAB)).toBe(
      CANON_VENUE_LAB_COUPLAND,
    );
    expect(normalizeVenueId("lab-coupland")).toBe("lab-coupland");
  });

  it("hard-slots loader persists canon venue id", () => {
    const slots = loadHardSlotsAlpha1909();
    expect(slots.venue_id).toBe("lab-coupland");

    const aliased = hardSlotsFileSchema.parse({
      ...slots,
      venue_id: "coupland-lab",
    });
    expect(aliased.venue_id).toBe("lab-coupland");
  });
});

describe("Judge", () => {
  it("3 fills → not persuaded; 4 fills + criticPass → persuaded", () => {
    const { pack, judge } = makeRuntime();
    const win = pack.hardSlots.win;
    expect(win.N).toBe(4);
    expect(win.require_critic_pass).toBe(true);
    expect(win.rutherford_is_win_object).toBe(false);
    expect(win.persuade_target).not.toMatch(/rutherford/i);

    const three = judge.evaluate({
      board: {
        venueId: "lab-coupland",
        fills: [
          {
            slotId: "a",
            source: "fact",
            turnIndex: 0,
          },
          {
            slotId: "b",
            source: "fact",
            turnIndex: 1,
          },
          {
            slotId: "c",
            source: "fact",
            turnIndex: 2,
          },
        ],
        filledCount: 3,
        criticPassCount: 1,
      },
      win,
      turnsUsed: 3,
    });
    expect(three).toBe("continue");

    const fourNoCritic = judge.evaluate({
      board: {
        venueId: "lab-coupland",
        fills: [],
        filledCount: 4,
        criticPassCount: 0,
      },
      win,
      turnsUsed: 4,
    });
    expect(fourNoCritic).toBe("continue");

    const fourWithCritic = judge.evaluate({
      board: {
        venueId: "lab-coupland",
        fills: [],
        filledCount: 4,
        criticPassCount: 1,
      },
      win,
      turnsUsed: 4,
    });
    expect(fourWithCritic).toBe("persuaded");
  });
});

describe("CriticPolicy", () => {
  it("blocks era_opinion fill", () => {
    const { pack, facts, eras, policy } = makeRuntime();
    const eraId = pack.eraOpinions.cards[0]!.id;
    expect(eras.has(eraId)).toBe(true);
    expect(facts.has(eraId)).toBe(false);

    const verdict = policy.checkFill({
      slotId: "slot-large-angle-exists",
      factId: eraId,
      hardSlots: pack.hardSlots,
      facts,
      eras,
    });
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.reasons.some((r) => /era_opinion/i.test(r))).toBe(true);
    }
  });

  it("labEmbed angle 150 candidates large-angle slot; 45 does not", () => {
    const candidates150 = labEmbedCandidateSlots(
      { kind: "alpha_scatter_summary", angle_deg: 150 },
      { largeAngleDegThreshold: 90 },
    );
    expect(candidates150).toContain("slot-large-angle-exists");

    const candidates45 = labEmbedCandidateSlots(
      { kind: "alpha_scatter_summary", angle_deg: 45 },
      { largeAngleDegThreshold: 90 },
    );
    expect(candidates45).not.toContain("slot-large-angle-exists");

    const { pack, facts, policy } = makeRuntime();
    const ok150 = policy.checkFill({
      slotId: "slot-large-angle-exists",
      labEmbed: { kind: "alpha_scatter_summary", angle_deg: 150 },
      hardSlots: pack.hardSlots,
      facts,
    });
    expect(ok150.ok).toBe(true);

    const bad45 = policy.checkFill({
      slotId: "slot-large-angle-exists",
      labEmbed: { kind: "alpha_scatter_summary", angle_deg: 45 },
      hardSlots: pack.hardSlots,
      facts,
    });
    expect(bad45.ok).toBe(false);
  });
});

describe("EvidenceBoard free ghost", () => {
  it("ghostPreview does not mutate durable board", () => {
    const { pack, board, session } = makeRuntime();
    session.enter("free", {
      venueId: "coupland-lab",
      mode: "free",
      hardSlots: pack.hardSlots,
    });

    const before = board.snapshot();
    expect(before.venueId).toBe("lab-coupland");
    expect(before.filledCount).toBe(0);
    expect(before.criticPassCount).toBe(0);

    const ghosts = board.ghostPreview(["fact-gm1909-diffuse-reflection"]);
    expect(ghosts).toContain("slot-large-angle-exists");

    const afterGhost = board.snapshot();
    expect(afterGhost.filledCount).toBe(0);
    expect(afterGhost.criticPassCount).toBe(0);
    expect(afterGhost.fills).toEqual([]);

    // proposeFill in free must not durable-mutate either
    const propose = session.proposeFill(
      "slot-large-angle-exists",
      "fact-gm1909-diffuse-reflection",
    );
    expect(propose.ok).toBe(false);
    const afterPropose = board.snapshot();
    expect(afterPropose.filledCount).toBe(0);
    expect(afterPropose.fills).toEqual([]);
  });

  it("hard proposeFill durably fills and can persuade", () => {
    const { pack, board, session, facts } = makeRuntime();
    session.enter("hard", {
      venueId: "lab-coupland",
      mode: "hard",
      hardSlots: pack.hardSlots,
    });

    const fills: Array<{ slotId: string; factId: string }> = [
      {
        slotId: "slot-large-angle-exists",
        factId: "fact-gm1909-diffuse-reflection",
      },
      {
        slotId: "slot-forward-majority",
        factId: "fact-gm1909-forward-majority",
      },
      {
        slotId: "slot-experimental-method",
        factId: "fact-gm1909-zns-method",
      },
      {
        slotId: "slot-plum-pudding-fails",
        factId: "fact-ruth1911-plum-pudding-fails-large-angle",
      },
    ];

    for (const f of fills) {
      expect(facts.has(f.factId)).toBe(true);
      const v = session.proposeFill(f.slotId, f.factId);
      expect(v.ok).toBe(true);
    }

    const snap = board.snapshot();
    expect(snap.filledCount).toBe(4);
    expect(snap.criticPassCount).toBeGreaterThanOrEqual(1);
    expect(session.phase).toBe("persuaded");
  });
});

describe("content pack load", () => {
  it("parses Coupland JSON via Zod loaders", () => {
    const pack = loadCouplandDebatePack();
    expect(pack.facts.cards.length).toBeGreaterThan(0);
    expect(pack.eraOpinions.cards.every((c) => c.fills_slots === false)).toBe(
      true,
    );
    expect(pack.hardSlots.slots).toHaveLength(6);
    expect(pack.criticTemplates.templates.length).toBeGreaterThanOrEqual(10);
    expect(pack.venueId).toBe("lab-coupland");
  });
});
