import { useGLTF, useTexture } from "@react-three/drei";
import { Suspense } from "react";
import { RepeatWrapping, SRGBColorSpace } from "three";
import { CharacterStub } from "../../characters/CharacterStub";
import { ScatteringViz } from "./ScatteringViz";

function LabShell() {
  const wood = useTexture(
    "/assets/textures/old-wood-floor/old_wood_floor_diff_2k.jpg",
  );
  const brick = useTexture(
    "/assets/textures/plaster-brick/plaster_brick_01_diff_2k.jpg",
  );
  wood.colorSpace = SRGBColorSpace;
  brick.colorSpace = SRGBColorSpace;
  wood.wrapS = wood.wrapT = RepeatWrapping;
  brick.wrapS = brick.wrapT = RepeatWrapping;
  wood.repeat.set(4, 3);
  brick.repeat.set(2, 1.4);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial map={wood} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.5, -3]}>
        <planeGeometry args={[8, 3]} />
        <meshStandardMaterial map={brick} roughness={0.85} />
      </mesh>
      <mesh position={[-4, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial map={brick} roughness={0.85} />
      </mesh>
      <mesh position={[4, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#3d342c" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#1a1512" />
      </mesh>
      <mesh position={[-1.6, 1.7, -2.98]}>
        <planeGeometry args={[1.1, 1.3]} />
        <meshStandardMaterial
          color="#1c2430"
          emissive="#243044"
          emissiveIntensity={0.25}
        />
      </mesh>
    </group>
  );
}

function GoldFoilStage() {
  const gltf = useGLTF("/assets/props/gold-foil-stage/gold_foil_stage.gltf");
  return (
    <primitive
      object={gltf.scene}
      position={[0, 0.44, 0]}
      scale={3.2}
      rotation={[0, 0, 0]}
    />
  );
}

function ApparatusTable() {
  return (
    <mesh position={[0, 0.4, 0]}>
      <boxGeometry args={[2.4, 0.08, 1.15]} />
      <meshStandardMaterial color="#4a3428" roughness={0.8} />
    </mesh>
  );
}

function LeadChamber() {
  return (
    <mesh position={[-1.05, 0.62, 0]}>
      <boxGeometry args={[0.32, 0.28, 0.24]} />
      <meshStandardMaterial
        color="#2a2c30"
        metalness={0.7}
        roughness={0.45}
      />
    </mesh>
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
          emissiveIntensity={0.22}
          roughness={0.55}
        />
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
      <ambientLight intensity={0.08} />
      <pointLight
        position={[-1.4, 2.2, 1.2]}
        intensity={18}
        distance={8}
        color="#ffcc88"
      />
      <pointLight
        position={[1.55, 1.2, 0.15]}
        intensity={1.4}
        distance={3.2}
        color="#7dff9a"
      />
      <Suspense
        fallback={
          <mesh>
            <boxGeometry />
            <meshBasicMaterial color="#222" />
          </mesh>
        }
      >
        <LabShell />
      </Suspense>
      <ApparatusTable />
      <LeadChamber />
      <FluorescentScreen />
      <Suspense fallback={null}>
        <GoldFoilStage />
      </Suspense>
      <ScatteringViz onMeasure={onMeasure} />
      <CharacterStub
        name="卢瑟福"
        position={[-1.7, 0, 1.1]}
        color="#6b4a3a"
      />
      <CharacterStub name="伴灵" position={[1.8, 0, 1.35]} color="#7fa3b3" />
    </group>
  );
}

useGLTF.preload("/assets/props/gold-foil-stage/gold_foil_stage.gltf");
