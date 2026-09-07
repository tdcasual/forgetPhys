import {
  normalizeVenueId,
  type HardSlotsFile,
  type PersonaCard,
} from "@physics-chronicle/content";
import type { FactStore } from "./fact-store";
import type { EraOpinionStore } from "./era-opinion-store";
import type { Retriever } from "./retriever";
import type { CriticPolicy } from "./critic-policy";
import { labEmbedCandidateSlots } from "./critic-policy";
import type { EvidenceBoard } from "./evidence-board";
import type { Judge } from "./judge";
import {
  StubGroundedReply,
  noopGroundedReplyTransport,
  type GroundedReply,
  type GroundedReplyTransport,
} from "./grounded-reply";
import type {
  CardId,
  CriticVerdict,
  DebateMode,
  DebateSessionConfig,
  DebateSessionState,
  EvidenceBoardSnapshot,
  GroundedReplyDraft,
  JudgeOutcome,
  LabEmbedReadout,
  SessionPhase,
  SlotId,
} from "./types";
import {
  DEFAULT_TURN_BUDGET_FREE,
  DEFAULT_TURN_BUDGET_HARD,
} from "./types";

export interface DebateSession {
  readonly state: DebateSessionState;
  readonly phase: SessionPhase;
  readonly mode: DebateMode;

  enter(mode: "free" | "hard", cfg: DebateSessionConfig): void;
  exit(action: "resume" | "jump", postDebateBeat?: string): void;

  submitUserTurn(
    text: string,
    opts?: { essay?: boolean },
  ): Promise<{
    reply: GroundedReplyDraft;
    board?: EvidenceBoardSnapshot;
    outcome: JudgeOutcome;
    quotaRemaining?: number;
  }>;

  proposeFill(
    slotId: SlotId,
    factId: CardId | { labEmbed: LabEmbedReadout },
  ): CriticVerdict;

  /** free-mode ghost candidates — never mutates durable board */
  ghostPreview(cites: CardId[]): SlotId[];

  boardSnapshot(): EvidenceBoardSnapshot;
}

export interface DebateSessionDeps {
  facts: FactStore;
  eras: EraOpinionStore;
  retriever: Retriever;
  policy: CriticPolicy;
  board: EvidenceBoard;
  judge: Judge;
  hardSlots: HardSlotsFile;
  groundedReply?: GroundedReply;
  transport?: GroundedReplyTransport;
  debateSessionId?: string;
  /** Optional interlocutor persona for GroundedReply (stub OK in P1a). */
  persona?: PersonaCard;
}

const STUB_PERSONA: PersonaCard = {
  id: "persona-stub",
  spec: "character-card-v2-inspired",
  name: "Stub",
  name_zh: "占位",
  charId: null,
  description: "",
  personality: "",
  scenario: "",
  system_prompt: "",
  mes_example: [],
  bans: [],
  era: "1909-1911",
  venue_tags: ["lab-coupland"],
  modes: ["free", "hard"],
};

export function createDebateSession(deps: DebateSessionDeps): DebateSession {
  return new DebateSessionImpl(deps);
}

class DebateSessionImpl implements DebateSession {
  private _state: DebateSessionState = "off";
  private _phase: SessionPhase = "idle_scripted";
  private _mode: DebateMode = "scripted";
  private turnsUsed = 0;
  private turnBudget = DEFAULT_TURN_BUDGET_HARD;
  private venueId = "";
  private hardSlots: HardSlotsFile;
  private readonly grounded: GroundedReply;
  private readonly transport: GroundedReplyTransport;
  private readonly debateSessionId: string;
  private readonly persona: PersonaCard;

  constructor(private readonly deps: DebateSessionDeps) {
    this.hardSlots = deps.hardSlots;
    this.grounded = deps.groundedReply ?? new StubGroundedReply();
    this.transport = deps.transport ?? noopGroundedReplyTransport;
    this.debateSessionId = deps.debateSessionId ?? "local-debate-session";
    this.persona = deps.persona ?? STUB_PERSONA;
  }

  get state(): DebateSessionState {
    return this._state;
  }

  get phase(): SessionPhase {
    return this._phase;
  }

  get mode(): DebateMode {
    return this._mode;
  }

  enter(mode: "free" | "hard", cfg: DebateSessionConfig): void {
    this._mode = mode;
    this._state = "active";
    this._phase = mode === "free" ? "debate_free" : "debate_hard";
    this.turnsUsed = 0;
    this.venueId = normalizeVenueId(cfg.venueId);
    if (cfg.hardSlots) this.hardSlots = cfg.hardSlots;
    this.turnBudget =
      mode === "free"
        ? (cfg.turnBudgetFree ?? DEFAULT_TURN_BUDGET_FREE)
        : (cfg.turnBudgetHard ??
          this.hardSlots.win.suggested_turn_budget ??
          DEFAULT_TURN_BUDGET_HARD);
    this.deps.board.reset(this.venueId, this.hardSlots);
  }

  exit(_action: "resume" | "jump", _postDebateBeat?: string): void {
    this._state = "off";
    this._phase = "idle_scripted";
    this._mode = "scripted";
  }

  ghostPreview(cites: CardId[]): SlotId[] {
    return this.deps.board.ghostPreview(cites);
  }

  boardSnapshot(): EvidenceBoardSnapshot {
    return this.deps.board.snapshot();
  }

  proposeFill(
    slotId: SlotId,
    factOrLab: CardId | { labEmbed: LabEmbedReadout },
  ): CriticVerdict {
    if (this._state !== "active") {
      return { ok: false, reasons: ["debateSession is off"] };
    }

    const factId = typeof factOrLab === "string" ? factOrLab : undefined;
    const labEmbed =
      typeof factOrLab === "object" ? factOrLab.labEmbed : null;

    // free mode: ghost-only — validate path exists but never durable-mutate
    if (this._mode === "free") {
      const verdict = this.deps.policy.checkFill({
        slotId,
        factId,
        labEmbed,
        hardSlots: this.hardSlots,
        facts: this.deps.facts,
        eras: this.deps.eras,
      });
      if (!verdict.ok) return verdict;
      return { ok: false, reasons: ["free mode is ghost-only; no durable fill"] };
    }

    if (this._mode !== "hard") {
      return {
        ok: false,
        reasons: [`proposeFill not allowed in mode ${this._mode}`],
      };
    }

    const source = labEmbed ? "labEmbed" : "player_propose";
    const result = this.deps.board.tryFill(
      {
        slotId,
        factId,
        labEmbed,
        source,
        turnIndex: this.turnsUsed,
      },
      this.deps.policy,
      this.hardSlots,
      this.deps.facts,
    );

    if (result.ok) {
      const outcome = this.deps.judge.evaluate({
        board: this.deps.board.snapshot(),
        win: this.hardSlots.win,
        turnsUsed: this.turnsUsed,
        turnBudget: this.turnBudget,
      });
      if (outcome === "persuaded") this._phase = "persuaded";
      else if (outcome === "budget_exhausted") this._phase = "budget_exhausted";
    }

    return result.ok ? { ok: true } : result;
  }

  async submitUserTurn(
    text: string,
    opts?: { essay?: boolean },
  ): Promise<{
    reply: GroundedReplyDraft;
    board?: EvidenceBoardSnapshot;
    outcome: JudgeOutcome;
    quotaRemaining?: number;
  }> {
    if (this._state !== "active") {
      return {
        reply: { text: "", cite: [] },
        outcome: "aborted",
      };
    }

    this.turnsUsed += 1;
    const hits = this.deps.retriever.retrieve(
      { text, mode: this._mode, topK: 8 },
      this.deps.facts,
      this.deps.eras,
    );

    // P1a: stub transport — no live GroundedReply LLM / BFF / SSE
    const reply = await this.grounded.generate(
      {
        persona: this.persona,
        mode: this._mode,
        messages: [{ role: "user", content: text }],
        hits,
        debateSessionId: this.debateSessionId,
        path: opts?.essay ? "essay" : "short",
      },
      this.deps.policy,
      this.transport,
    );

    if (this._mode === "free") {
      // ghost only — preview cites, do not tryFill
      this.deps.board.ghostPreview(reply.cite);
    }

    const board = this.deps.board.snapshot();
    const outcome = this.deps.judge.evaluate({
      board,
      win: this.hardSlots.win,
      turnsUsed: this.turnsUsed,
      turnBudget: this.turnBudget,
    });

    if (outcome === "persuaded") this._phase = "persuaded";
    else if (outcome === "budget_exhausted") this._phase = "budget_exhausted";
    else if (outcome === "aborted") this._phase = "aborted";

    return { reply, board, outcome };
  }
}

/** Helper: labEmbed angle candidates for UI (does not fill). */
export function previewLabEmbedSlots(
  labEmbed: LabEmbedReadout,
  largeAngleDegThreshold = 90,
): SlotId[] {
  return labEmbedCandidateSlots(labEmbed, { largeAngleDegThreshold });
}
