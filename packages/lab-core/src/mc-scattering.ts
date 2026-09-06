import type { LabPlugin } from "./plugin";

/** Softened 1/r² Coulomb scatter of a pedagogical α beam past a central charge. */

export type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;
  age: number;
};

export type HistogramBin = {
  /** Degrees. */
  thetaMin: number;
  thetaMax: number;
  count: number;
};

export type Scintillation = {
  x: number;
  y: number;
  theta: number;
  age: number;
};

export type McScatteringState = {
  particles: Particle[];
  histogram: HistogramBin[];
  flashes: Scintillation[];
  detected: number;
  largeAngle: number;
  time: number;
  nextId: number;
  spawnAcc: number;
  rng: () => number;
  chargeStrength: number;
  spawnRate: number;
  beamSpeed: number;
};

export type McScatteringOptions = {
  seed?: number;
  particleCount?: number;
  chargeStrength?: number;
  spawnRate?: number;
  beamSpeed?: number;
};

export type HistogramMeasure = {
  bins: HistogramBin[];
  total: number;
  largeAngle: number;
  /** Fraction of detections with θ > 90°. Crude, not a physical rate. */
  largeAngleFraction: number;
};

export type ScatteringConclusion = {
  /** Textbook-facing; does not put the word "nucleus" in Rutherford's 1911 mouth. */
  summary: string;
  largeAngleFraction: number;
  detected: number;
};

const BIN_EDGES = [0, 15, 30, 60, 90, 120, 180];
const SOURCE_X = -1.4;
const DETECT_R = 1.6;
const MAX_PARTICLES = 72;
const SOFTENING = 4e-4;
const FLASH_LIFE = 0.55;
const CLOSE_FRACTION = 0.24;

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function emptyHistogram(): HistogramBin[] {
  const bins: HistogramBin[] = [];
  for (let i = 0; i < BIN_EDGES.length - 1; i++) {
    bins.push({ thetaMin: BIN_EDGES[i]!, thetaMax: BIN_EDGES[i + 1]!, count: 0 });
  }
  return bins;
}

function binIndex(thetaDeg: number): number {
  for (let i = 0; i < BIN_EDGES.length - 1; i++) {
    if (thetaDeg < BIN_EDGES[i + 1]!) return i;
  }
  return BIN_EDGES.length - 2;
}

function spawnParticle(state: McScatteringState, x = SOURCE_X): Particle {
  const close = state.rng() < CLOSE_FRACTION;
  const spread = close ? 0.045 : 0.38;
  const y = (state.rng() * 2 - 1) * spread;
  const id = state.nextId;
  state.nextId += 1;
  return {
    id,
    x,
    y,
    vx: state.beamSpeed,
    vy: 0,
    alive: true,
    age: 0,
  };
}

function detect(state: McScatteringState, p: Particle): void {
  const speed = Math.hypot(p.vx, p.vy) || 1;
  const cos = Math.min(1, Math.max(-1, p.vx / speed));
  const theta = (Math.acos(cos) * 180) / Math.PI;
  const i = binIndex(theta);
  const bin = state.histogram[i];
  if (bin) bin.count += 1;
  state.detected += 1;
  if (theta > 90) state.largeAngle += 1;
  state.flashes.push({ x: p.x, y: p.y, theta, age: 0 });
  if (state.flashes.length > 48) state.flashes.shift();
}

function integrate(state: McScatteringState, dt: number): void {
  const k = state.chargeStrength;
  for (const p of state.particles) {
    if (!p.alive) continue;
    p.age += dt;
    const r2 = p.x * p.x + p.y * p.y + SOFTENING;
    const r = Math.sqrt(r2);
    const a = k / r2;
    const ax = (a * p.x) / r;
    const ay = (a * p.y) / r;
    p.vx += ax * dt;
    p.vy += ay * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    const dist = Math.hypot(p.x, p.y);
    if (dist > DETECT_R || p.age > 4.5) {
      if (dist > DETECT_R * 0.85) detect(state, p);
      p.alive = false;
    }
  }

  for (const f of state.flashes) f.age += dt;
  state.flashes = state.flashes.filter((f) => f.age < FLASH_LIFE);
}

export const mcScattering: LabPlugin<
  McScatteringState,
  HistogramMeasure,
  ScatteringConclusion,
  McScatteringOptions
> = {
  id: "mc-scattering",

  setup(options = {}) {
    const rng = mulberry32(options.seed ?? 1911);
    const state: McScatteringState = {
      particles: [],
      histogram: emptyHistogram(),
      flashes: [],
      detected: 0,
      largeAngle: 0,
      time: 0,
      nextId: 1,
      spawnAcc: 0,
      rng,
      chargeStrength: options.chargeStrength ?? 0.12,
      spawnRate: options.spawnRate ?? 14,
      beamSpeed: options.beamSpeed ?? 2.15,
    };
    const n = options.particleCount ?? 28;
    for (let i = 0; i < n; i++) {
      const x = SOURCE_X + (i / n) * 1.1;
      state.particles.push(spawnParticle(state, x));
    }
    return state;
  },

  step(state, dt) {
    const clamped = Math.min(Math.max(dt, 0), 0.05);
    const sub = Math.max(1, Math.ceil(clamped / (1 / 120)));
    const h = clamped / sub;
    state.time += clamped;
    for (let s = 0; s < sub; s++) integrate(state, h);

    state.spawnAcc += clamped * state.spawnRate;
    while (state.spawnAcc >= 1) {
      state.spawnAcc -= 1;
      const dead = state.particles.find((p) => !p.alive);
      if (dead) {
        const fresh = spawnParticle(state);
        dead.id = fresh.id;
        dead.x = fresh.x;
        dead.y = fresh.y;
        dead.vx = fresh.vx;
        dead.vy = fresh.vy;
        dead.alive = true;
        dead.age = 0;
      } else if (state.particles.length < MAX_PARTICLES) {
        state.particles.push(spawnParticle(state));
      }
    }
    return state;
  },

  measure(state) {
    return {
      bins: state.histogram.map((b) => ({ ...b })),
      total: state.detected,
      largeAngle: state.largeAngle,
      largeAngleFraction: state.detected === 0 ? 0 : state.largeAngle / state.detected,
    };
  },

  conclude(state) {
    const measure = mcScattering.measure(state);
    return {
      detected: measure.total,
      largeAngleFraction: measure.largeAngleFraction,
      summary:
        "A few α particles scatter through large angles. That sits badly with a plum-pudding atom and fits a concentrated central charge. Rutherford’s 1911 paper does not use the word nucleus; later textbooks call this the nuclear model (核式结构).",
    };
  },

  dispose(state) {
    state.particles.length = 0;
    state.flashes.length = 0;
    state.histogram = emptyHistogram();
  },
};
