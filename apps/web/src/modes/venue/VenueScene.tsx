import { useGLTF } from "@react-three/drei";
import {
  Component,
  Suspense,
  useMemo,
  type ErrorInfo,
  type ReactNode,
} from "react";
import type { Mesh, Object3D } from "three";
import { CharacterStub } from "../../characters/CharacterStub";
import { ScatteringViz } from "./ScatteringViz";

const KENNEY = "/assets/venue/kenney-building-kit/Models/GLB%20format";

const PATHS = {
  floor: `${KENNEY}/floor.glb`,
  wall: `${KENNEY}/wall.glb`,
  wallWindow: `${KENNEY}/wall-window-square.glb`,
  wallDoor: `${KENNEY}/wall-doorway-square.glb`,
  column: `${KENNEY}/column.glb`,
  foil: "/assets/props/gold-foil-stage/gold_foil_stage.gltf",
} as const;

class ModelErrorBoundary extends Component<
  { fallback: ReactNode; label: string; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(
      `[venue] glTF load failed (${this.props.label}):`,
      error.message,
    );
    console.warn(info.componentStack);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function GltfInstance({
  url,
  position,
  rotation,
  scale,
}: {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const { scene } = useGLTF(url);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o: Object3D) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
    });
    return c;
  }, [scene]);
  return (
    <primitive
      object={obj}
      position={position}
      rotation={rotation}
      scale={scale ?? 1}
    />
  );
}

function LabShellFallback() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#5a4434" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.5, -3]}>
        <boxGeometry args={[8, 3, 0.2]} />
        <meshStandardMaterial color="#6a5a48" roughness={0.85} />
      </mesh>
      <mesh position={[-4, 1.5, 0]}>
        <boxGeometry args={[0.2, 3, 6]} />
        <meshStandardMaterial color="#534636" roughness={0.85} />
      </mesh>
      <mesh position={[4, 1.5, 0]}>
        <boxGeometry args={[0.2, 3, 6]} />
        <meshStandardMaterial color="#534636" roughness={0.85} />
      </mesh>
    </group>
  );
}

/**
 * Compact Kenney modular lab (kept small so headless/SwiftShader stays stable).
 * Floors 3×2, back wall with window, side walls, doorway, two columns.
 */
function KenneyLabShell() {
  return (
    <group>
      {(
        [
          [-2, -1],
          [0, -1],
          [2, -1],
          [-2, 1],
          [0, 1],
          [2, 1],
        ] as const
      ).map(([x, z]) => (
        <GltfInstance key={`f-${x}-${z}`} url={PATHS.floor} position={[x, 0, z]} />
      ))}

      <GltfInstance
        url={PATHS.wall}
        position={[-2, 0, -2.05]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <GltfInstance
        url={PATHS.wallWindow}
        position={[0, 0, -2.05]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <GltfInstance
        url={PATHS.wall}
        position={[2, 0, -2.05]}
        rotation={[0, Math.PI / 2, 0]}
      />

      <GltfInstance url={PATHS.wall} position={[-3.05, 0, -1]} />
      <GltfInstance url={PATHS.wall} position={[-3.05, 0, 1]} />

      <GltfInstance
        url={PATHS.wallDoor}
        position={[3.05, 0, -1]}
        rotation={[0, Math.PI, 0]}
      />
      <GltfInstance
        url={PATHS.wall}
        position={[3.05, 0, 1]}
        rotation={[0, Math.PI, 0]}
      />

      <GltfInstance url={PATHS.column} position={[-2.9, 0, -1.9]} />
      <GltfInstance url={PATHS.column} position={[2.9, 0, -1.9]} />

      <mesh position={[0, 2.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 5]} />
        <meshStandardMaterial color="#14110e" />
      </mesh>
      <mesh position={[0, 1.35, -2.2]}>
        <planeGeometry args={[1.3, 1.1]} />
        <meshStandardMaterial
          color="#1c2430"
          emissive="#3a5070"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

function GoldFoilFallback() {
  return (
    <group position={[0, 0.42, 0]}>
      <mesh>
        <boxGeometry args={[1.2, 0.05, 0.4]} />
        <meshStandardMaterial color="#3a2a1c" roughness={0.85} />
      </mesh>
      <mesh position={[-0.5, 0.16, 0]}>
        <boxGeometry args={[0.1, 0.25, 0.1]} />
        <meshStandardMaterial color="#2a2c30" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.05, 0.22, 0]}>
        <boxGeometry args={[0.02, 0.28, 0.008]} />
        <meshStandardMaterial
          color="#d7b356"
          metalness={0.85}
          roughness={0.25}
          emissive="#8a6a18"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

function GoldFoilStage() {
  return <GltfInstance url={PATHS.foil} position={[0, 0.38, 0]} scale={3.6} />;
}

function ApparatusBench() {
  return (
    <group>
      <mesh position={[0, 0.36, 0]}>
        <boxGeometry args={[2.0, 0.07, 0.95]} />
        <meshStandardMaterial color="#4a3428" roughness={0.82} />
      </mesh>
      {(
        [
          [-0.85, -0.35],
          [0.85, -0.35],
          [-0.85, 0.35],
          [0.85, 0.35],
        ] as const
      ).map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.175, z]}>
          <boxGeometry args={[0.07, 0.35, 0.07]} />
          <meshStandardMaterial color="#3a281c" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function FluorescentScreen() {
  return (
    <group position={[1.45, 0.95, 0]}>
      <mesh rotation={[0, -0.4, 0]}>
        <planeGeometry args={[0.9, 0.7]} />
        <meshStandardMaterial
          color="#1c3a24"
          emissive="#3dff7a"
          emissiveIntensity={0.45}
          roughness={0.55}
        />
      </mesh>
      <mesh position={[0, 0, -0.02]} rotation={[0, -0.4, 0]}>
        <boxGeometry args={[0.96, 0.76, 0.035]} />
        <meshStandardMaterial color="#2a2218" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function VenueScene({
  onMeasure,
}: {
  onMeasure?: (total: number, large: number, bins: number[]) => void;
}) {
  return (
    <group>
      <color attach="background" args={["#0c0b0a"]} />
      <ambientLight intensity={0.2} />
      <hemisphereLight args={["#556070", "#1a120c", 0.35]} />
      <pointLight
        position={[-1.4, 2.2, 1.2]}
        intensity={20}
        distance={10}
        color="#ffcc88"
        decay={2}
      />
      <pointLight
        position={[1.55, 1.2, 0.15]}
        intensity={2.0}
        distance={3.5}
        color="#7dff9a"
        decay={2}
      />
      <pointLight
        position={[0, 1.7, -1.8]}
        intensity={5}
        distance={6}
        color="#6a8ab0"
        decay={2}
      />

      <ModelErrorBoundary label="kenney-lab" fallback={<LabShellFallback />}>
        <Suspense fallback={<LabShellFallback />}>
          <KenneyLabShell />
        </Suspense>
      </ModelErrorBoundary>

      <ApparatusBench />
      <FluorescentScreen />

      <ModelErrorBoundary label="gold-foil-stage" fallback={<GoldFoilFallback />}>
        <Suspense fallback={<GoldFoilFallback />}>
          <GoldFoilStage />
        </Suspense>
      </ModelErrorBoundary>

      <ScatteringViz onMeasure={onMeasure} />
      <CharacterStub name="卢瑟福" position={[-1.7, 0, 1.1]} color="#6b4a3a" />
      <CharacterStub name="华生" position={[1.8, 0, 1.35]} color="#7fa3b3" />
    </group>
  );
}

useGLTF.preload(PATHS.floor);
useGLTF.preload(PATHS.wall);
useGLTF.preload(PATHS.wallWindow);
useGLTF.preload(PATHS.wallDoor);
useGLTF.preload(PATHS.column);
useGLTF.preload(PATHS.foil);
