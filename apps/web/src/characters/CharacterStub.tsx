import { Html } from "@react-three/drei";

export function CharacterStub({
  name,
  position,
  color,
}: {
  name: string;
  position: [number, number, number];
  color: string;
}) {
  const isCompanion = name.includes("伴") || name.includes("华生") || name.includes("微光");
  return (
    <group position={position}>
      <mesh position={[-0.07, 0.22, 0]}>
        <capsuleGeometry args={[0.055, 0.28, 4, 8]} />
        <meshStandardMaterial color="#2a2420" roughness={0.7} />
      </mesh>
      <mesh position={[0.07, 0.22, 0]}>
        <capsuleGeometry args={[0.055, 0.28, 4, 8]} />
        <meshStandardMaterial color="#2a2420" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <capsuleGeometry args={[0.17, 0.42, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.86, 0.12]}>
        <boxGeometry args={[0.14, 0.04, 0.04]} />
        <meshStandardMaterial
          color={isCompanion ? "#c9e4f0" : "#d8c4a0"}
          roughness={0.5}
        />
      </mesh>
      <mesh position={[0, 1.12, 0]}>
        <sphereGeometry args={[0.155, 16, 16]} />
        <meshStandardMaterial color="#c4a882" roughness={0.45} />
      </mesh>
      <mesh position={[0, isCompanion ? 1.22 : 1.2, isCompanion ? 0 : -0.02]}>
        <sphereGeometry args={[isCompanion ? 0.12 : 0.13, 12, 12]} />
        <meshStandardMaterial
          color={isCompanion ? "#9ec8d8" : "#3a2a22"}
          emissive={isCompanion ? "#5a9ab0" : "#000000"}
          emissiveIntensity={isCompanion ? 0.25 : 0}
          roughness={0.55}
        />
      </mesh>
      <Html position={[0, 1.48, 0]} center distanceFactor={8}>
        <div
          style={{
            color: "#f3e6c8",
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            whiteSpace: "nowrap",
            textShadow: "0 1px 4px #000",
          }}
        >
          {name}
        </div>
      </Html>
    </group>
  );
}
