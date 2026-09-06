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
  return (
    <group position={position}>
      <mesh castShadow={false} position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.16, 0.55, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <Html position={[0, 1.4, 0]} center distanceFactor={8}>
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
