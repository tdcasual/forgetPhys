import type { HardSlotsFile } from "@physics-chronicle/content";
import type { EvidenceBoardSnapshot, JudgeOutcome } from "./types";

export interface Judge {
  evaluate(args: {
    board: EvidenceBoardSnapshot;
    win: HardSlotsFile["win"];
    turnsUsed: number;
    turnBudget?: number;
    aborted?: boolean;
  }): JudgeOutcome;
}

/**
 * Rules-only Judge.
 * persuaded iff filledCount >= win.N AND (require_critic_pass ⇒ criticPassCount >= 1).
 * Win target is era peers / board — never hardcode Rutherford.
 */
export class RulesJudge implements Judge {
  evaluate(args: {
    board: EvidenceBoardSnapshot;
    win: HardSlotsFile["win"];
    turnsUsed: number;
    turnBudget?: number;
    aborted?: boolean;
  }): JudgeOutcome {
    if (args.aborted) return "aborted";

    const needCritic = args.win.require_critic_pass;
    const filledOk = args.board.filledCount >= args.win.N;
    const criticOk = !needCritic || args.board.criticPassCount >= 1;

    if (filledOk && criticOk) {
      // persuade_target is informational; rutherford_is_win_object locked false in schema
      return "persuaded";
    }

    if (
      args.turnBudget != null &&
      args.turnsUsed >= args.turnBudget &&
      !(filledOk && criticOk)
    ) {
      return "budget_exhausted";
    }

    return "continue";
  }
}
