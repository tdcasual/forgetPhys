import { Html, useGLTF } from "@react-three/drei";
import { Suspense, useMemo, useState } from "react";
import * as THREE from "three";
import type { Mesh, Object3D } from "three";

const IND =
  "/assets/atlas/city-clusters/kenney-city-kit-industrial/Models/GLB%20format";
const COM =
  "/assets/atlas/city-clusters/kenney-city-kit-commercial/Models/GLB%20format";
const SUB =
  "/assets/atlas/city-clusters/kenney-city-kit-suburban/Models/GLB%20format";
const FAN =
  "/assets/atlas/city-clusters/kenney-fantasy-town-kit/Models/GLB%20format";

/** Kenney city GLBs are ~2u cubes centered on origin (Y −1…+1). */
const GROUND_Y = 1;

type PieceSpec = {
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
};

export type CityFeature = {
  type: "Feature";
  properties: {
    id: string;
    name: string;
    era?: string;
    p0_entry?: boolean;
    venue?: string;
  };
  geometry: { type: "Point"; coordinates: [number, number] };
};

function tintMaterial(
  src: THREE.Material,
  locked: boolean,
): THREE.Material {
  const mat = src.clone() as THREE.MeshStandardMaterial;
  if (!("color" in mat) || !mat.color) return mat;
  if (locked) {
    const c0 = mat.color;
    const luma = c0.r * 0.3 + c0.g * 0.59 + c0.b * 0.11;
    // Strong grey-blue lock wash so clusters read locked at atlas distance
    mat.color.setRGB(
      luma * 0.28 + 0.32,
      luma * 0.28 + 0.34,
      luma * 0.3 + 0.38,
    );
    if (mat.emissive) {
      mat.emissive.set("#000000");
      mat.emissiveIntensity = 0;
    }
    if ("map" in mat && mat.map) {
      // Keep map for silhouette; multiply toward slate
      mat.color.multiplyScalar(0.85);
    }
    mat.roughness = Math.min(1, (mat.roughness ?? 0.7) + 0.25);
    mat.metalness = 0.05;
  } else if (mat.color) {
    mat.color.offsetHSL(0.02, 0.08, -0.04);
  }
  return mat;
}

function GltfPiece({
  url,
  position,
  rotation,
  scale = 1,
  locked,
}: PieceSpec & { locked: boolean }) {
  const { scene } = useGLTF(url);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o: Object3D) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((m) => tintMaterial(m, locked));
      } else if (mesh.material) {
        mesh.material = tintMaterial(mesh.material, locked);
      }
    });
    return c;
  }, [scene, locked]);

  return (
    <primitive
      object={obj}
      position={position}
      rotation={rotation ?? [0, 0, 0]}
      scale={scale}
    />
  );
}

function WindowGlow({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <mesh position={position} scale={scale}>
      <boxGeometry args={[0.08, 0.06, 0.02]} />
      <meshStandardMaterial
        color="#f6d080"
        emissive="#e8a838"
        emissiveIntensity={1.35}
        roughness={0.4}
      />
    </mesh>
  );
}

function manchesterPieces(): PieceSpec[] {
  const s = 0.165;
  return [
    {
      url: `${IND}/chimney-large.glb`,
      position: [-0.28, 0, 0.05],
      scale: s * 1.15,
    },
    { url: `${IND}/chimney-basic.glb`, position: [0.22, 0, -0.18], scale: s },
    {
      url: `${IND}/chimney-medium.glb`,
      position: [0.05, 0, 0.28],
      scale: s * 0.9,
    },
    {
      url: `${IND}/building-d.glb`,
      position: [-0.05, 0, -0.32],
      scale: s * 0.95,
    },
    { url: `${IND}/building-f.glb`, position: [0.35, 0, 0.12], scale: s * 0.85 },
    {
      url: `${IND}/building-g.glb`,
      position: [-0.38, 0, -0.22],
      scale: s * 0.8,
    },
    { url: `${IND}/building-h.glb`, position: [0.12, 0, 0.02], scale: s * 0.88 },
    { url: `${IND}/building-e.glb`, position: [-0.18, 0, 0.32], scale: s * 0.75 },
  ];
}

function cambridgePieces(): PieceSpec[] {
  const s = 0.135;
  return [
    { url: `${SUB}/building-type-a.glb`, position: [-0.22, 0, -0.1], scale: s },
    {
      url: `${SUB}/building-type-c.glb`,
      position: [0.2, 0, 0.15],
      scale: s * 0.95,
    },
    {
      url: `${COM}/building-a.glb`,
      position: [0.05, 0, -0.28],
      scale: s * 0.85,
    },
    {
      url: `${COM}/low-detail-building-c.glb`,
      position: [-0.32, 0, 0.22],
      scale: s * 0.9,
    },
    {
      url: `${FAN}/wall-block.glb`,
      position: [0.08, 0, 0.05],
      scale: [s * 0.55, s * 0.7, s * 0.55],
    },
    {
      url: `${FAN}/roof-high-point.glb`,
      position: [0.08, s * 1.35, 0.05],
      scale: s * 0.7,
    },
    {
      url: `${FAN}/wall-block.glb`,
      position: [-0.05, 0, 0.28],
      scale: [s * 0.4, s * 0.55, s * 0.4],
    },
    {
      url: `${FAN}/roof-point.glb`,
      position: [-0.05, s * 1.05, 0.28],
      scale: s * 0.55,
    },
  ];
}

function copenhagenPieces(): PieceSpec[] {
  const s = 0.125;
  return [
    { url: `${SUB}/building-type-b.glb`, position: [-0.25, 0, 0.05], scale: s },
    {
      url: `${SUB}/building-type-e.glb`,
      position: [0.05, 0, -0.18],
      scale: s * 0.95,
    },
    {
      url: `${SUB}/building-type-h.glb`,
      position: [0.28, 0, 0.08],
      scale: s * 0.9,
    },
    {
      url: `${COM}/building-b.glb`,
      position: [-0.05, 0, 0.28],
      scale: s * 0.8,
    },
    {
      url: `${COM}/low-detail-building-a.glb`,
      position: [0.22, 0, -0.28],
      scale: s * 0.85,
    },
    {
      url: `${SUB}/building-type-k.glb`,
      position: [-0.32, 0, -0.22],
      scale: s * 0.85,
    },
  ];
}

function piecesFor(id: string): PieceSpec[] {
  if (id === "manchester") return manchesterPieces();
  if (id === "cambridge") return cambridgePieces();
  return copenhagenPieces();
}

function ClusterFallback({ locked }: { locked: boolean }) {
  const color = locked ? "#7a7874" : "#8a5a3a";
  return (
    <group>
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.35, 0.24, 0.28]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[0.12, 0.28, -0.05]} castShadow>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial
          color={locked ? "#6a6864" : "#5a4038"}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
}

function CityClusterBody({
  cityId,
  unlocked,
}: {
  cityId: string;
  unlocked: boolean;
}) {
  const pieces = piecesFor(cityId);
  const locked = !unlocked;
  const sAvg =
    cityId === "manchester" ? 0.165 : cityId === "cambridge" ? 0.135 : 0.125;

  return (
    <group>
      {pieces.map((p, i) => {
        const sc = p.scale ?? 1;
        const sy = Array.isArray(sc) ? sc[1] : sc;
        const pos: [number, number, number] = [
          p.position[0],
          p.position[1] + sy * GROUND_Y,
          p.position[2],
        ];
        return (
          <GltfPiece
            key={`${cityId}-${i}`}
            url={p.url}
            position={pos}
            rotation={p.rotation}
            scale={p.scale}
            locked={locked}
          />
        );
      })}
      {unlocked && cityId === "manchester" ? (
        <>
          <WindowGlow position={[-0.05, sAvg * 1.35, -0.42]} />
          <WindowGlow position={[0.35, sAvg * 1.2, 0.12]} scale={0.9} />
          <WindowGlow position={[0.12, sAvg * 1.15, 0.02]} scale={0.85} />
          <pointLight
            position={[0, 0.55, 0]}
            intensity={0.85}
            distance={2.2}
            color="#ffc070"
            castShadow={false}
          />
        </>
      ) : null}
      {cityId === "copenhagen" ? (
        <mesh
          position={[0.05, 0.03, 0.48]}
          rotation={[0, 0.15, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.55, 0.045, 0.12]} />
          <meshStandardMaterial
            color={locked ? "#6a6860" : "#6b5340"}
            roughness={0.9}
          />
        </mesh>
      ) : null}
    </group>
  );
}

export function CityCluster({
  city,
  selected,
  elev,
  worldPos,
  onActivate,
}: {
  city: CityFeature;
  selected: boolean;
  elev: number;
  worldPos: [number, number, number];
  onActivate: () => void;
}) {
  const [hot, setHot] = useState(false);
  const unlocked = Boolean(city.properties.p0_entry);
  const larger = city.properties.id === "manchester" ? 1.25 : 1;
  const [x, , z] = worldPos;

  return (
    <group position={[x, elev, z]} scale={larger}>
      <mesh
        position={[0, 0.28, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (unlocked) onActivate();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (!unlocked) return;
          setHot(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHot(false);
          document.body.style.cursor = "auto";
        }}
      >
        <cylinderGeometry args={[0.55, 0.55, 0.7, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <Suspense fallback={<ClusterFallback locked={!unlocked} />}>
        <CityClusterBody cityId={city.properties.id} unlocked={unlocked} />
      </Suspense>

      {selected && unlocked ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.55, 0.68, 48]} />
          <meshBasicMaterial color="#e8c36a" transparent opacity={0.92} />
        </mesh>
      ) : null}

      {!unlocked ? (
        <Html
          center
          position={[0.42, 0.55, 0]}
          style={{ pointerEvents: "none", userSelect: "none" }}
          zIndexRange={[10, 0]}
          distanceFactor={9}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 3,
              background: "#3a3530cc",
              border: "1px solid #8a8074",
              color: "#c8c0b4",
              fontSize: 11,
              lineHeight: "16px",
              textAlign: "center",
              fontFamily: "sans-serif",
            }}
            title="未解锁"
          >
            🔒
          </div>
        </Html>
      ) : null}

      <Html
        center
        position={[0, 0.95, 0]}
        style={{ pointerEvents: "none", userSelect: "none" }}
        zIndexRange={[10, 0]}
        distanceFactor={8}
      >
        <div
          style={{
            fontFamily:
              'Palatino, "Palatino Linotype", "Songti SC", "Noto Serif CJK SC", Georgia, serif',
            fontSize: "12px",
            letterSpacing: "0.08em",
            whiteSpace: "nowrap",
            color: unlocked ? "#2a1e14" : "#4a453c",
            background: unlocked ? "#f3e6c8ee" : "#d8d2c8cc",
            border: `1px solid ${unlocked ? "#5c3d2e" : "#7a7468"}`,
            padding: "3px 8px",
            textAlign: "center",
            boxShadow: "0 4px 12px #0004",
          }}
        >
          <div>{city.properties.name}</div>
          {!unlocked ? (
            <div style={{ fontSize: "10px", opacity: 0.85, marginTop: 2 }}>
              未解锁
            </div>
          ) : selected || hot ? (
            <div style={{ fontSize: "10px", opacity: 0.9, marginTop: 2 }}>
              Coupland Street
            </div>
          ) : null}
        </div>
      </Html>
    </group>
  );
}

const PRELOAD = [
  `${IND}/chimney-large.glb`,
  `${IND}/chimney-basic.glb`,
  `${IND}/chimney-medium.glb`,
  `${IND}/building-d.glb`,
  `${IND}/building-f.glb`,
  `${IND}/building-g.glb`,
  `${IND}/building-h.glb`,
  `${IND}/building-e.glb`,
  `${SUB}/building-type-a.glb`,
  `${SUB}/building-type-b.glb`,
  `${SUB}/building-type-c.glb`,
  `${SUB}/building-type-e.glb`,
  `${SUB}/building-type-h.glb`,
  `${SUB}/building-type-k.glb`,
  `${COM}/building-a.glb`,
  `${COM}/building-b.glb`,
  `${COM}/low-detail-building-a.glb`,
  `${COM}/low-detail-building-c.glb`,
  `${FAN}/roof-high-point.glb`,
  `${FAN}/roof-point.glb`,
  `${FAN}/wall-block.glb`,
];
for (const u of PRELOAD) useGLTF.preload(u);
