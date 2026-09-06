import { OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { useGame } from "../app/GameState";

export type GameMode = "atlas" | "venue";
export type CutPhase = "idle" | "cover" | "hold" | "reveal";

/** Cover + hold + reveal stay inside the ADR 200–400 ms hard-cut window. */
export const CUT_COVER_MS = 140;
export const CUT_HOLD_MS = 40;
export const CUT_REVEAL_MS = 140;
export const CUT_TOTAL_MS = CUT_COVER_MS + CUT_HOLD_MS + CUT_REVEAL_MS;

function LookAt({
  target,
}: {
  target: [number, number, number];
}) {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.lookAt(target[0], target[1], target[2]);
    camera.updateProjectionMatrix();
  }, [camera, target]);
  return null;
}

/** Same R3F canvas: ortho atlas camera vs perspective venue camera. */
export function GameCameras() {
  const mode = useGame().mode;
  const atlas = mode === "atlas";
  return (
    <>
      <OrthographicCamera
        makeDefault={atlas}
        position={[0, 0, 18]}
        zoom={58}
        near={0.1}
        far={80}
      />
      <PerspectiveCamera
        makeDefault={!atlas}
        position={[2.85, 1.65, 3.9]}
        fov={42}
        near={0.05}
        far={80}
      />
      <LookAt target={atlas ? [0, 0, 0] : [0.1, 0.95, 0]} />
    </>
  );
}

export function CutMask() {
  const phase = useGame().cutPhase;
  return (
    <div className={`cut-mask ${phase}`} aria-hidden>
      <div className="shutter top" />
      <div className="shutter bottom" />
    </div>
  );
}
