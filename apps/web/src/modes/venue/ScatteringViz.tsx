import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { DoubleSide, Object3D, type InstancedMesh, type Mesh } from "three";
import { createCouplandSession } from "./VenueSession";

const dummy = new Object3D();

export function ScatteringViz({
  onMeasure,
}: {
  onMeasure?: (total: number, large: number, bins: number[]) => void;
}) {
  const session = useMemo(() => createCouplandSession(), []);
  const mesh = useRef<InstancedMesh>(null);
  const foil = useRef<Mesh>(null);
  const acc = useRef(0);

  useLayoutEffect(() => {
    session.enter();
    return () => session.dispose();
  }, [session]);

  useFrame((_, dt) => {
    session.tick(dt);
    const state = session.getState();
    const inst = mesh.current;
    if (!state || !inst) return;

    let i = 0;
    for (const p of state.particles) {
      if (!p.alive) continue;
      dummy.position.set(p.x * 1.15, 0.92 + Math.min(0.06, p.age * 0.01), p.y);
      dummy.scale.setScalar(0.035);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
      i += 1;
    }
    for (; i < inst.count; i++) {
      dummy.position.set(0, -10, 0);
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;

    if (foil.current) {
      const pulse = 0.35 + 0.25 * Math.sin(state.time * 6);
      const mat = foil.current.material;
      if (mat && !Array.isArray(mat) && "emissiveIntensity" in mat) {
        (mat as { emissiveIntensity: number }).emissiveIntensity = pulse;
      }
    }

    acc.current += dt;
    if (acc.current > 0.25 && onMeasure && session.lab) {
      acc.current = 0;
      const m = session.lab.measure(state) as {
        total: number;
        largeAngle: number;
        bins: { count: number }[];
      };
      onMeasure(
        m.total,
        m.largeAngle,
        m.bins.map((b) => b.count),
      );
    }
  });

  return (
    <group>
      <mesh position={[0, 0.92, 0]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial
          color="#e8d48a"
          emissive="#c9a227"
          emissiveIntensity={0.6}
          metalness={0.4}
        />
      </mesh>
      <mesh ref={foil} position={[0, 0.92, 0]} rotation={[0, 0, 0.02]}>
        <planeGeometry args={[0.02, 0.42]} />
        <meshStandardMaterial
          color="#d7b356"
          metalness={0.85}
          roughness={0.25}
          emissive="#8a6a18"
          side={DoubleSide}
        />
      </mesh>
      <instancedMesh ref={mesh} args={[undefined, undefined, 72]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#c8f59a" />
      </instancedMesh>
    </group>
  );
}
