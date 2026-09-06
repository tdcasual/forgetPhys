/** Lab plugin contract (ADR 0001). Pure TS — no renderer, no physics engine. */

export interface LabPlugin<
  TState = unknown,
  TMeasure = unknown,
  TConclusion = unknown,
  TOptions = unknown,
> {
  readonly id: string;
  setup(options?: TOptions): TState;
  step(state: TState, dt: number): TState;
  measure(state: TState): TMeasure;
  conclude(state: TState): TConclusion;
  dispose(state: TState): void;
}

/** Venue session (ADR 0001). `lab` may be null for study-only rooms. */
export interface VenueSession {
  enter(): void;
  exit(): void;
  tick(dt: number): void;
  dispose(): void;
  lab: LabPlugin | null;
}
