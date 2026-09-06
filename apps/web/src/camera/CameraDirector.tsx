/** Locked product modes — pure-2D main path (ADR-002 + 2D_SCENE_LIST). */
export type GameMode =
  | "worldMap"
  | "chroniclePlate"
  | "cityPage"
  | "venue"
  | "labEmbed";

export type CutPhase = "idle" | "cover" | "hold" | "reveal";

/** Cover + hold + reveal stay inside the ADR 200–400 ms hard-cut window. */
export const CUT_COVER_MS = 140;
export const CUT_HOLD_MS = 40;
export const CUT_REVEAL_MS = 140;
export const CUT_TOTAL_MS = CUT_COVER_MS + CUT_HOLD_MS + CUT_REVEAL_MS;

export function isWorldMapMode(mode: GameMode): boolean {
  return mode === "worldMap";
}

/** DOM shutter — no Three.js dependency. */
export function CutMask({ phase }: { phase: CutPhase }) {
  return (
    <div className={`cut-mask ${phase}`} aria-hidden>
      <div className="shutter top" />
      <div className="shutter bottom" />
    </div>
  );
}
