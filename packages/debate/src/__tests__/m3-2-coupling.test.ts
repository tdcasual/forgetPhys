import { describe, expect, it } from "vitest";
import {
  loadCouplandDebatePack,
  loadCriticChallengeTemplatesAlpha1909,
} from "@physics-chronicle/content";
import {
  RulesCriticPolicy,
  RulesJudge,
  InMemoryFactStore,
  classifyLabReadout,
  checkCouplandBenchObservationGate,
  boardHasBenchOrFactObservation,
  shouldFireBenchObservationChallenge,
  labEmbedCandidateSlots,
  DEFAULT_LARGE_ANGLE_DEG_THRESHOLD,
  DEFAULT_FORWARD_MAJORITY_MIN,
  READOUT_CONTRACT_LARGE_ANGLE,
  READOUT_CONTRACT_FORWARD_MAJORITY,
  READOUT_CONTRACT_WEAK,
  BENCH_OBSERVATION_CLAIM_ID,
  type EvidenceBoardSnapshot,
  type SlotFill,
} from "../index";

function board(fills: SlotFill[], criticPassCount = 1): EvidenceBoardSnapshot {
  return {
    venueId: "lab-coupland",
    fills,
    filledCount: fills.length,
    criticPassCount,
  };
}

describe("M3.2 lab readout contracts", () => {
  it("readout-large-angle maps to slot-large-angle-exists", () => {
    const byCount = classifyLabReadout({
      kind: "alpha_scatter_summary",
      large_angle_count: 2,
    });
    expect(byCount.contracts).toContain(READOUT_CONTRACT_LARGE_ANGLE);
    expect(byCount.fillSlots).toContain("slot-large-angle-exists");
    expect(byCount.weak).toBe(false);

    const byAngle = classifyLabReadout({
      kind: "alpha_scatter_summary",
      angle_deg: 90,
    });
    expect(byAngle.contracts).toContain(READOUT_CONTRACT_LARGE_ANGLE);
    expect(byAngle.fillSlots).toEqual(
      expect.arrayContaining(["slot-large-angle-exists"]),
    );
  });

  it("readout-forward-majority maps when fraction_forward >= default min", () => {
    const c = classifyLabReadout({
      kind: "alpha_scatter_summary",
      fraction_forward: DEFAULT_FORWARD_MAJORITY_MIN,
    });
    expect(c.contracts).toContain(READOUT_CONTRACT_FORWARD_MAJORITY);
    expect(c.fillSlots).toContain("slot-forward-majority");
    expect(c.weak).toBe(false);
  });

  it("readout-weak: message received but neither threshold — chip only, no fill slots", () => {
    const weak = classifyLabReadout({
      kind: "alpha_scatter_summary",
      angle_deg: 30,
      fraction_forward: 0.2,
      large_angle_count: 0,
    });
    expect(weak.contracts).toEqual([READOUT_CONTRACT_WEAK]);
    expect(weak.fillSlots).toEqual([]);
    expect(weak.weak).toBe(true);

    // Align with labEmbedCandidateSlots thresholds
    expect(
      labEmbedCandidateSlots(weak.readout, {
        largeAngleDegThreshold: DEFAULT_LARGE_ANGLE_DEG_THRESHOLD,
        forwardMajorityMin: DEFAULT_FORWARD_MAJORITY_MIN,
      }),
    ).toEqual([]);
  });

  it("strong readout can fill both accepts_lab_embed slots via CriticPolicy", () => {
    const pack = loadCouplandDebatePack();
    const facts = new InMemoryFactStore(pack.facts.cards);
    const policy = new RulesCriticPolicy({
      largeAngleDegThreshold: DEFAULT_LARGE_ANGLE_DEG_THRESHOLD,
      forwardMajorityMin: DEFAULT_FORWARD_MAJORITY_MIN,
    });
    const readout = {
      kind: "alpha_scatter_summary" as const,
      angle_deg: 150,
      fraction_forward: 0.999,
      large_angle_count: 3,
    };
    const classified = classifyLabReadout(readout);
    expect(classified.fillSlots).toEqual(
      expect.arrayContaining([
        "slot-large-angle-exists",
        "slot-forward-majority",
      ]),
    );
    for (const slotId of classified.fillSlots) {
      const v = policy.checkFill({
        slotId,
        labEmbed: readout,
        hardSlots: pack.hardSlots,
        facts,
      });
      expect(v.ok).toBe(true);
    }
  });
});

describe("M3.2 Coupland Hard bench observation gate (C11)", () => {
  it("blocks pass when concentration claimed without large-angle and without forward-majority", () => {
    const snap = board([
      {
        slotId: "slot-charge-mass-concentrated",
        factId: "fact-ruth1911-central-charge",
        source: "fact",
        turnIndex: 0,
      },
      {
        slotId: "slot-foil-extremely-thin",
        factId: "fact-gm1909-thin-gold-layer",
        source: "fact",
        turnIndex: 1,
      },
      {
        slotId: "slot-plum-pudding-fails",
        factId: "fact-ruth1911-plum-pudding-fails-large-angle",
        source: "fact",
        turnIndex: 2,
      },
      {
        slotId: "slot-experimental-method",
        factId: "fact-gm1909-zns-method",
        source: "fact",
        turnIndex: 3,
      },
    ]);
    expect(boardHasBenchOrFactObservation(snap)).toBe(false);
    const gate = checkCouplandBenchObservationGate(snap);
    expect(gate.ok).toBe(false);
    if (!gate.ok) {
      expect(gate.reasons.some((r) => r.includes(BENCH_OBSERVATION_CLAIM_ID))).toBe(
        true,
      );
    }

    const pack = loadCouplandDebatePack();
    const judge = new RulesJudge();
    expect(
      judge.evaluate({
        board: snap,
        win: pack.hardSlots.win,
        turnsUsed: 4,
      }),
    ).toBe("continue");
  });

  it("allows pass when Fact observation fills large-angle (no labEmbed required)", () => {
    const snap = board([
      {
        slotId: "slot-charge-mass-concentrated",
        factId: "fact-ruth1911-central-charge",
        source: "fact",
        turnIndex: 0,
      },
      {
        slotId: "slot-large-angle-exists",
        factId: "fact-gm1909-diffuse-reflection",
        source: "fact",
        turnIndex: 1,
      },
      {
        slotId: "slot-foil-extremely-thin",
        factId: "fact-gm1909-thin-gold-layer",
        source: "fact",
        turnIndex: 2,
      },
      {
        slotId: "slot-plum-pudding-fails",
        factId: "fact-ruth1911-plum-pudding-fails-large-angle",
        source: "fact",
        turnIndex: 3,
      },
    ]);
    expect(checkCouplandBenchObservationGate(snap).ok).toBe(true);
    const pack = loadCouplandDebatePack();
    expect(
      new RulesJudge().evaluate({
        board: snap,
        win: pack.hardSlots.win,
        turnsUsed: 4,
      }),
    ).toBe("persuaded");
  });

  it("allows pass when labEmbed filled forward-majority", () => {
    const snap = board([
      {
        slotId: "slot-charge-mass-concentrated",
        factId: "fact-ruth1911-central-charge",
        source: "fact",
        turnIndex: 0,
      },
      {
        slotId: "slot-forward-majority",
        labEmbedKind: "alpha_scatter_summary",
        source: "labEmbed",
        turnIndex: 1,
      },
      {
        slotId: "slot-foil-extremely-thin",
        factId: "fact-gm1909-thin-gold-layer",
        source: "fact",
        turnIndex: 2,
      },
      {
        slotId: "slot-experimental-method",
        factId: "fact-gm1909-zns-method",
        source: "fact",
        turnIndex: 3,
      },
    ]);
    expect(checkCouplandBenchObservationGate(snap).ok).toBe(true);
  });

  it("shouldFireBenchObservationChallenge on concentration fill without observation", () => {
    const empty = board([]);
    expect(
      shouldFireBenchObservationChallenge(
        empty,
        "slot-charge-mass-concentrated",
      ),
    ).toBe(true);
    const withObs = board([
      {
        slotId: "slot-large-angle-exists",
        factId: "fact-gm1909-diffuse-reflection",
        source: "fact",
        turnIndex: 0,
      },
    ]);
    expect(
      shouldFireBenchObservationChallenge(
        withObs,
        "slot-charge-mass-concentrated",
      ),
    ).toBe(false);
  });

  it("C11 template is present with blocks_pass", () => {
    const file = loadCriticChallengeTemplatesAlpha1909();
    const c11 = file.templates.find((t) => t.claimId === "C11");
    expect(c11).toBeTruthy();
    expect(c11!.blocks_pass).toBe(true);
    expect(c11!.requires_observation_slots).toEqual(
      expect.arrayContaining([
        "slot-large-angle-exists",
        "slot-forward-majority",
      ]),
    );
  });
});
