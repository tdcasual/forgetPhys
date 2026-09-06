import { useState } from "react";
import { useGame } from "../../app/GameState";

function Building({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#5a3f34" roughness={0.9} />
    </mesh>
  );
}

function NodePin({
  position,
  onEnter,
}: {
  position: [number, number, number];
  onEnter: () => void;
}) {
  const [hot, setHot] = useState(false);
  return (
    <group position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onEnter();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHot(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHot(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.18, 20, 20]} />
        <meshStandardMaterial
          color={hot ? "#e8c36a" : "#d4a054"}
          emissive={hot ? "#c9892a" : "#7a4e16"}
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]}>
        <ringGeometry args={[0.26, 0.32, 24]} />
        <meshBasicMaterial color="#f3e6c8" />
      </mesh>
      <mesh position={[0.02, -0.55, 0.02]}>
        <planeGeometry args={[2.6, 0.38]} />
        <meshBasicMaterial color="#1a120ecc" transparent opacity={0.82} />
      </mesh>
    </group>
  );
}

export function AtlasScene() {
  const { chapter, enterNode } = useGame();
  const node = chapter.atlas.nodes[0];
  if (!node) return null;

  return (
    <group>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 8]} intensity={1.1} color="#f0e2c4" />
      <mesh position={[0, -0.4, -0.2]} rotation={[-0.08, 0, 0]}>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial color="#c4a574" roughness={1} />
      </mesh>
      <mesh position={[-0.6, 0.6, -0.05]} rotation={[-0.08, 0.18, 0.35]}>
        <planeGeometry args={[9, 1.1]} />
        <meshStandardMaterial color="#6a8794" roughness={0.7} />
      </mesh>
      <Building position={[-3.4, 0.7, 0]} size={[1.2, 2.2, 0.8]} />
      <Building position={[-2.1, 0.4, 0.1]} size={[0.9, 1.6, 0.7]} />
      <Building position={[-0.7, 0.9, 0]} size={[1.4, 2.6, 0.9]} />
      <Building position={[0.8, 0.55, 0.05]} size={[1.1, 1.9, 0.7]} />
      <Building position={[2.3, 0.75, 0]} size={[1.6, 2.3, 0.85]} />
      <Building position={[4.1, 0.45, 0.1]} size={[1.2, 1.7, 0.7]} />
      <mesh position={[-0.85, 2.35, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 1.1, 8]} />
        <meshStandardMaterial color="#3d2a24" />
      </mesh>
      <mesh position={[2.1, 2.2, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.9, 8]} />
        <meshStandardMaterial color="#3d2a24" />
      </mesh>
      <NodePin
        position={[node.x, node.y, 0.4]}
        onEnter={() => enterNode(node.venueId)}
      />
    </group>
  );
}
