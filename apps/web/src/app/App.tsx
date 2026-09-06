/**
 * Pure-2D main playable path (80 Days structure × Pentiment skin).
 * Legacy Three.js / R3F atlas+venue kept under modes/atlas and modes/venue
 * but is NOT mounted here — flip USE_LEGACY_3D only for experiments.
 */
import { CutMask } from "../camera/CameraDirector";
import { CityPage } from "../modes/city/CityPage";
import { LabEmbed } from "../modes/lab/LabEmbed";
import { ChroniclePlate } from "../modes/plate/ChroniclePlate";
import { Venue2D } from "../modes/venue2d/Venue2D";
import { WorldMap2D } from "../modes/worldmap2d/WorldMap2D";
import { GameProvider, useGame } from "./GameState";

const USE_LEGACY_3D = false;

function Shell2D() {
  const { cutPhase } = useGame();
  return (
    <div className="shell shell--2d">
      <WorldMap2D />
      <ChroniclePlate />
      <CityPage />
      <Venue2D />
      <LabEmbed />
      <CutMask phase={cutPhase} />
    </div>
  );
}

export function App() {
  if (USE_LEGACY_3D) {
    // Legacy 3D entry kept for reference — not the default path.
    // Import modes/atlas + modes/venue + R3F Canvas if needed.
    return (
      <GameProvider>
        <div className="shell">
          <p className="webgl-fallback">USE_LEGACY_3D is on — remount R3F App manually.</p>
        </div>
      </GameProvider>
    );
  }

  return (
    <GameProvider>
      <Shell2D />
    </GameProvider>
  );
}
