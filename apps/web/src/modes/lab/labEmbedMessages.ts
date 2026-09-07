/**
 * LabEmbed postMessage contract — docs/LABEMBED_POSTMESSAGE.md
 * Origin + kind whitelist; default largeAngleDegThreshold = 90.
 */
import {
  DEFAULT_FORWARD_MAJORITY_MIN,
  DEFAULT_LARGE_ANGLE_DEG_THRESHOLD,
  labEmbedCandidateSlots,
  type LabEmbedReadout,
  type SlotId,
} from "@physics-chronicle/debate";

export const LABEMBED_ENVELOPE_TYPE = "labEmbed" as const;
export const LABEMBED_KIND_ALPHA = "alpha_scatter_summary" as const;

/** Build-time / env allowlist; never "*". */
export function defaultLabEmbedOriginAllowlist(): string[] {
  const fromEnv =
    typeof import.meta !== "undefined" &&
    typeof import.meta.env?.VITE_LABEMBED_ORIGINS === "string"
      ? import.meta.env.VITE_LABEMBED_ORIGINS.split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];
  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
  return [
    ...new Set([
      origin,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://x.infinitas.fun",
      ...fromEnv,
    ]),
  ];
}

export function isAllowedLabEmbedOrigin(
  origin: string,
  allowlist: string[] = defaultLabEmbedOriginAllowlist(),
): boolean {
  return allowlist.includes(origin);
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/** Unwrap optional { v, type:"labEmbed", payload } envelope or bare readout. */
export function unwrapLabEmbedPayload(data: unknown): unknown {
  if (data == null || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  if (obj.type === LABEMBED_ENVELOPE_TYPE && "payload" in obj) {
    return obj.payload;
  }
  return data;
}

/**
 * Parse + range-check alpha_scatter_summary.
 * Returns null if kind unknown / out of range / wrong types.
 */
export function parseAlphaScatterSummary(data: unknown): LabEmbedReadout | null {
  const payload = unwrapLabEmbedPayload(data);
  if (payload == null || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  if (p.kind !== LABEMBED_KIND_ALPHA) return null;

  const out: LabEmbedReadout = { kind: LABEMBED_KIND_ALPHA };

  if ("angle_deg" in p) {
    if (!isFiniteNumber(p.angle_deg)) return null;
    out.angle_deg = p.angle_deg;
  }
  if ("fraction_forward" in p) {
    if (
      !isFiniteNumber(p.fraction_forward) ||
      p.fraction_forward < 0 ||
      p.fraction_forward > 1
    ) {
      return null;
    }
    out.fraction_forward = p.fraction_forward;
  }
  if ("large_angle_count" in p) {
    if (
      typeof p.large_angle_count !== "number" ||
      !Number.isInteger(p.large_angle_count) ||
      p.large_angle_count < 0
    ) {
      return null;
    }
    out.large_angle_count = p.large_angle_count;
  }

  return out;
}

export type LabEmbedConfig = {
  largeAngleDegThreshold: number;
  forwardMajorityMin: number;
};

export const DEFAULT_LAB_EMBED_CONFIG: LabEmbedConfig = {
  largeAngleDegThreshold: DEFAULT_LARGE_ANGLE_DEG_THRESHOLD,
  forwardMajorityMin: DEFAULT_FORWARD_MAJORITY_MIN,
};

/** Map validated readout → Coupland candidate slot ids (Critic still required before fill). */
export function mapLabEmbedToCandidateSlots(
  readout: LabEmbedReadout,
  config: LabEmbedConfig = DEFAULT_LAB_EMBED_CONFIG,
): SlotId[] {
  return labEmbedCandidateSlots(readout, {
    largeAngleDegThreshold: config.largeAngleDegThreshold,
    forwardMajorityMin: config.forwardMajorityMin,
  });
}

export type HostHelloPayload = {
  kind: "host_hello";
  venueId: string;
  acceptKinds: string[];
};

export function buildHostHello(venueId: string): {
  v: 1;
  type: typeof LABEMBED_ENVELOPE_TYPE;
  payload: HostHelloPayload;
} {
  return {
    v: 1,
    type: LABEMBED_ENVELOPE_TYPE,
    payload: {
      kind: "host_hello",
      venueId,
      acceptKinds: [LABEMBED_KIND_ALPHA],
    },
  };
}
