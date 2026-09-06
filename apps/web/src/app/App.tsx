import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { CutMask, GameCameras } from "../camera/CameraDirector";
import { DialogueController } from "../dialogue/DialogueController";
import { AtlasHud, AtlasScene } from "../modes/atlas/AtlasMode";
import { VenueHud, VenueScene } from "../modes/venue/VenueMode";
import { CanvasGameBridge, GameProvider, useGame } from "./GameState";

function World({
  onMeasure,
}: {
  onMeasure: (total: number, large: number, bins: number[]) => void;
}) {
  const { mode } = useGame();
  return mode === "atlas" ? <AtlasScene /> : <VenueScene onMeasure={onMeasure} />;
}

function Shell() {
  const game = useGame();
  const [total, setTotal] = useState(0);
  const [large, setLarge] = useState(0);
  const [bins, setBins] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  return (
    <div className="shell">
      <Canvas className="stage" dpr={[1, 1.75]} gl={{ antialias: true }}>
        <CanvasGameBridge value={game}>
          <GameCameras />
          <World
            onMeasure={(t, l, b) => {
              setTotal(t);
              setLarge(l);
              setBins(b);
            }}
          />
        </CanvasGameBridge>
      </Canvas>
      <CutMask />
      <AtlasHud />
      <VenueHud total={total} large={large} bins={bins} />
      <DialogueController />
    </div>
  );
}

export function App() {
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  );
}
