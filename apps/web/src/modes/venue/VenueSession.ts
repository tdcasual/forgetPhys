import {
  mcScattering,
  type LabPlugin,
  type McScatteringState,
  type VenueSession,
} from "@physics-chronicle/lab-core";

export type CouplandSession = VenueSession & {
  getState: () => McScatteringState | null;
};

export function createCouplandSession(
  lab: LabPlugin | null = mcScattering,
): CouplandSession {
  let active = false;
  let state: McScatteringState | null = null;
  return {
    lab,
    enter() {
      active = true;
      state = lab ? (lab.setup({ seed: 1909 }) as McScatteringState) : null;
    },
    exit() {
      active = false;
    },
    tick(dt: number) {
      if (!active || !lab || !state) return;
      state = lab.step(state, dt) as McScatteringState;
    },
    dispose() {
      if (lab && state) lab.dispose(state);
      state = null;
      active = false;
    },
    getState() {
      return state;
    },
  };
}
