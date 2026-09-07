# `packages/debate` — TypeScript interface sketch

Status: **Types-only design** · 2026-09-07 · **no implementation** in this drop  
Package stub: [`packages/debate/README.md`](../packages/debate/README.md)  
Cards SoT: [`DEBATE_CONTENT_SCHEMA.md`](./DEBATE_CONTENT_SCHEMA.md) · `packages/content/src/debate/`  
Related: [`DEBATE_ARCHITECTURE.md`](./DEBATE_ARCHITECTURE.md) §5–6 · [`GROUNDED_REPLY_PROMPTS.md`](./GROUNDED_REPLY_PROMPTS.md) · [`adr/0003-debate-bff.md`](./adr/0003-debate-bff.md)

> Sketch for P1a+. Signatures are illustrative TypeScript — not compiled package exports yet.

---

## 1. Dependency map

| Package / app | Depends on debate for | Debate depends on |
|---|---|---|
| **`packages/content`** | — | **Card JSON + future Zod** (Persona / Fact / EraOpinion / HardSlots) |
| **`packages/debate`** | Runtime stores, Retriever, Critic, Board, Judge, session SM | `content` types/cards only |
| **`apps/web` (UI)** | `DebateSession` overlay on Venue2D; renders board + cites | Imports debate API; owns DOM |
| **`apps/web` (BFF)** | `POST /api/debate/complete` (ADR-0003) | Called by `GroundedReply` transport — keys never in debate pkg |

```
packages/content (cards)
        ▲
packages/debate (logic)
        ▲
apps/web UI ──► BFF ──► LiteLLM
```

Do **not** put LiteLLM keys or Vite env reads inside `packages/debate`.

---

## 2. Shared aliases

```ts
export type DebateMode = "scripted" | "free" | "hard";
export type DebateSessionState = "off" | "active";

export type CardId = string;
export type SlotId = string;
export type PersonaId = string;

export type FactTier = "primary" | "textbook" | "fact";
export type EraTier = "era_opinion";

export interface CiteSet {
  cite: CardId[];
  challenge_ids?: CardId[];
}
```

Card value types mirror [`DEBATE_CONTENT_SCHEMA.md`](./DEBATE_CONTENT_SCHEMA.md) (`PersonaCard`, `FactCard`, `EraOpinionCard`, `HardSlotsFile`, `SlotDef`).

---

## 3. FactStore / EraOpinionStore

```ts
export interface FactStore {
  load(fileIds?: string[]): Promise<void>;
  get(id: CardId): FactCard | undefined;
  list(filter?: { era?: string; venue_tags?: string[] }): FactCard[];
  /** ids only — for Critic ⊆ checks */
  has(id: CardId): boolean;
}

export interface EraOpinionStore {
  load(fileIds?: string[]): Promise<void>;
  get(id: CardId): EraOpinionCard | undefined;
  list(filter?: { era?: string; venue_tags?: string[]; year?: number }): EraOpinionCard[];
  has(id: CardId): boolean;
  /** always false for fills — helper for CriticPolicy */
  mayFillSlots(id: CardId): false;
}
```

---

## 4. Retriever

```ts
export interface RetrieveQuery {
  text: string;
  mode: DebateMode;
  era?: string;
  venue_tags?: string[];
  open_slots?: SlotId[];
  topK?: number;
}

export interface RetrieveHit {
  id: CardId;
  store: "fact" | "era_opinion";
  tier: FactTier | EraTier;
  snippet: string;
  score: number;
}

export interface Retriever {
  retrieve(q: RetrieveQuery, facts: FactStore, eras: EraOpinionStore): RetrieveHit[];
}
```

P1a: keyword / bilingual `keys`. P2 optional: embeddings — same interface.

---

## 5. CriticPolicy

```ts
export type CriticVerdict =
  | { ok: true }
  | { ok: false; reasons: string[] };

export interface CriticContext {
  mode: DebateMode;
  hits: RetrieveHit[];
  reply: GroundedReplyDraft;
  labEmbed?: LabEmbedReadout | null;
  board?: EvidenceBoardSnapshot;
  hardSlots?: HardSlotsFile;
}

export interface CriticPolicy {
  /** cite ⊆ hits; numbers match card/labEmbed; no era_opinion fills; slot↔linked_fact_ids */
  check(ctx: CriticContext): CriticVerdict;
  /** Hard propose-fill path (player or NPC) */
  checkFill(args: {
    slotId: SlotId;
    factId?: CardId;
    labEmbed?: LabEmbedReadout | null;
    hardSlots: HardSlotsFile;
    facts: FactStore;
  }): CriticVerdict;
}
```

Deterministic — no LLM inside CriticPolicy.

---

## 6. EvidenceBoard

```ts
export interface SlotFill {
  slotId: SlotId;
  factId?: CardId;
  labEmbedKind?: string;
  source: "player" | "npc" | "labEmbed";
  turnIndex: number;
}

export interface EvidenceBoardSnapshot {
  venueId: string;
  fills: SlotFill[];
  filledCount: number;
  criticPassCount: number;
}

export interface EvidenceBoard {
  reset(venueId: string, slots: HardSlotsFile): void;
  snapshot(): EvidenceBoardSnapshot;
  /** free mode: preview only — must not mutate fills */
  ghostPreview(cites: CardId[]): SlotId[];
  tryFill(
    args: {
      slotId: SlotId;
      factId?: CardId;
      labEmbed?: LabEmbedReadout | null;
      source: SlotFill["source"];
      turnIndex: number;
    },
    policy: CriticPolicy,
    hardSlots: HardSlotsFile,
    facts: FactStore
  ): CriticVerdict & { filled?: SlotFill };
}
```

---

## 7. Judge

```ts
export type JudgeOutcome =
  | "continue"
  | "persuaded"
  | "budget_exhausted"
  | "aborted";

export interface Judge {
  evaluate(args: {
    board: EvidenceBoardSnapshot;
    win: HardSlotsFile["win"];
    turnsUsed: number;
    turnBudget?: number;
    aborted?: boolean;
  }): JudgeOutcome;
}
```

Rules only: typically `filledCount >= N` ∧ `criticPassCount >= 1` → `persuaded`; turn budget → `budget_exhausted`.

---

## 8. GroundedReply

```ts
export interface GroundedReplyDraft {
  text: string;
  cite: CardId[];
  challenge_ids?: CardId[];
}

export interface GroundedReplyRequest {
  persona: PersonaCard;
  mode: DebateMode;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  hits: RetrieveHit[];
  debateSessionId: string;
  /** essay vs short — see GROUNDED_REPLY_PROMPTS */
  path?: "short" | "essay";
}

export interface GroundedReplyTransport {
  /** BFF: POST /api/debate/complete — implemented in apps/web, not debate pkg */
  complete(req: GroundedReplyRequest): AsyncIterable<string> | Promise<GroundedReplyDraft>;
}

export interface GroundedReply {
  /** assemble prompts per GROUNDED_REPLY_PROMPTS; call transport; Critic retry ≤ K */
  generate(
    req: GroundedReplyRequest,
    policy: CriticPolicy,
    transport: GroundedReplyTransport,
    opts?: { maxRetries?: number } // default K = 2
  ): Promise<GroundedReplyDraft>;
}
```

Uncertainty templates after K failures live in the prompts doc.

---

## 9. DebateSession

```ts
export type SessionPhase =
  | "idle_scripted"
  | "debate_free"
  | "debate_hard"
  | "persuaded"
  | "budget_exhausted"
  | "aborted";

export interface DebateSessionConfig {
  venueId: string;
  mode: DebateMode;
  turnBudgetFree?: number; // draft default 20
  turnBudgetHard?: number; // draft default 12
  hardSlots?: HardSlotsFile;
}

export interface DebateSession {
  readonly state: DebateSessionState;
  readonly phase: SessionPhase;
  readonly mode: DebateMode;

  enter(mode: "free" | "hard", cfg: DebateSessionConfig): void;
  exit(action: "resume" | "jump", postDebateBeat?: string): void;

  /** one player utterance or essay submit */
  submitUserTurn(text: string, opts?: { essay?: boolean }): Promise<{
    reply: GroundedReplyDraft;
    board?: EvidenceBoardSnapshot;
    outcome: JudgeOutcome;
    quotaRemaining?: number;
  }>;

  proposeFill(slotId: SlotId, factId: CardId | { labEmbed: LabEmbedReadout }): CriticVerdict;
}
```

UI (`apps/web`) owns React state; this interface is the logic façade the UI calls.

---

## 10. LabEmbed readout (shared type)

Minimal shape for Critic / board — full postMessage contract: [`LABEMBED_POSTMESSAGE.md`](./LABEMBED_POSTMESSAGE.md).

```ts
export interface LabEmbedReadout {
  kind: string; // whitelist
  value: number | string;
  unit?: string;
  raw?: unknown;
}
```

---

## 11. Out of scope for this package

- DOM / parchment EvidenceBoard visuals → `apps/web` + [`DEBATE_UX.md`](./DEBATE_UX.md)
- LiteLLM auth / quota counters → BFF ([`STUDENT_LLM_QUOTA.md`](./STUDENT_LLM_QUOTA.md))
- Scripted beat player for `manchester.json` → existing content/web path
