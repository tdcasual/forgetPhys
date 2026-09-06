import { useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useGame } from "../../app/GameState";
import { setAtlasSelection } from "./atlasSelection";
import { CityCluster, type CityFeature } from "./CityClusters";

/** Europe crop matching Natural Earth atlas rasters (lon/lat degrees). */
export const LON_MIN = -25;
export const LON_MAX = 45;
export const LAT_MIN = 34;
export const LAT_MAX = 72;

const DEG_SCALE = 0.22;
const PLANE_W = (LON_MAX - LON_MIN) * DEG_SCALE;
const PLANE_H = (LAT_MAX - LAT_MIN) * DEG_SCALE;
const SEG_X = 160;
const SEG_Y = 96;
const DISPLACE = 0.85;

/** Hypso with water tint (Natural Earth); recolored further in shader. */
const HYP_URL = "/assets/atlas/europe-hyp-sr-w-50m.jpg";
const SR_URL = "/assets/atlas/europe-sr-50m.jpg";

const SKY_ZENITH = "#6eb0ea";
const SKY_HORIZON = "#f0d2a8";
const FOG_COLOR = "#c5d8e8";

/** Equirectangular → XZ ground plane (Y up). */
export function projectLonLat(
  lon: number,
  lat: number,
  elev = 0,
): [number, number, number] {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN) - 0.5) * PLANE_W;
  const z = ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN) - 0.5) * PLANE_H;
  return [x, elev, z];
}

function heightAt(
  heights: Float32Array | null,
  lon: number,
  lat: number,
): number {
  if (!heights) return 0.08;
  const u = (lon - LON_MIN) / (LON_MAX - LON_MIN);
  const v = (lat - LAT_MIN) / (LAT_MAX - LAT_MIN);
  const ix = Math.min(SEG_X, Math.max(0, Math.round(u * SEG_X)));
  const iy = Math.min(SEG_Y, Math.max(0, Math.round((1 - v) * SEG_Y)));
  return heights[iy * (SEG_X + 1) + ix] + 0.12;
}

function sampleDisplacement(image: HTMLImageElement): Float32Array {
  const w = SEG_X + 1;
  const h = SEG_Y + 1;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(image, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  const out = new Float32Array(w * h);
  let min = 1;
  let max = 0;
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    const lum =
      (data[o] * 0.299 + data[o + 1] * 0.587 + data[o + 2] * 0.114) / 255;
    out[i] = lum;
    if (lum < min) min = lum;
    if (lum > max) max = lum;
  }
  const range = Math.max(1e-4, max - min);
  for (let i = 0; i < out.length; i++) {
    const n = (out[i] - min) / range;
    out[i] = Math.pow(n, 1.35) * DISPLACE;
  }
  return out;
}

function SkyDome() {
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.SphereGeometry(55, 48, 24);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        zenith: { value: new THREE.Color(SKY_ZENITH) },
        horizon: { value: new THREE.Color(SKY_HORIZON) },
        nadir: { value: new THREE.Color("#6a9aaa") },
      },
      vertexShader: /* glsl */ `
        varying vec3 vPos;
        void main() {
          vPos = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 zenith;
        uniform vec3 horizon;
        uniform vec3 nadir;
        varying vec3 vPos;
        void main() {
          float h = vPos.y;
          vec3 col = mix(horizon, zenith, smoothstep(-0.02, 0.72, h));
          col = mix(nadir, col, smoothstep(-0.55, 0.05, h));
          // soft warm band at horizon
          float band = exp(-pow((h - 0.02) * 6.0, 2.0)) * 0.22;
          col += vec3(0.18, 0.08, 0.02) * band;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    return { geometry: geo, material: mat };
  }, []);
  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}

function applyCivSandboxSkin(mat: THREE.MeshStandardMaterial) {
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      /* glsl */ `
      #include <map_fragment>
      // Civ painted-sandbox recolor: sat boost, teal ocean, green plains, warm peaks
      vec3 c = diffuseColor.rgb;
      float luma = dot(c, vec3(0.299, 0.587, 0.114));
      float mx = max(c.r, max(c.g, c.b));
      float mn = min(c.r, min(c.g, c.b));
      float sat = mx - mn;
      // Boost saturation (toy / boardgame readable)
      c = mix(vec3(luma), c, 1.65);
      // Pale / low-sat → teal ocean (hyp-w oceans are light)
      float oceanMask = smoothstep(0.58, 0.88, luma) * (1.0 - smoothstep(0.04, 0.2, sat));
      vec3 oceanCol = vec3(0.12, 0.52, 0.58);
      vec3 oceanDeep = vec3(0.08, 0.38, 0.48);
      vec3 oceanMix = mix(oceanDeep, oceanCol, smoothstep(0.7, 0.95, luma));
      c = mix(c, oceanMix, oceanMask * 0.92);
      // Greener plains
      float greenish = clamp((c.g - max(c.r, c.b)) * 3.0, 0.0, 1.0);
      c = mix(c, vec3(0.22, 0.52, 0.24), greenish * 0.4 * (1.0 - oceanMask));
      // Slight warm lift on midland greens
      float midland = (1.0 - oceanMask) * smoothstep(0.25, 0.55, luma) * (1.0 - smoothstep(0.62, 0.85, luma));
      c = mix(c, vec3(0.35, 0.55, 0.28), midland * 0.28);
      // Warmer mountains / highlands (beige → ochre)
      float warm = clamp((c.r - c.b) * 1.6, 0.0, 1.0) * (1.0 - oceanMask);
      float highland = smoothstep(0.55, 0.82, luma) * warm;
      c = mix(c, vec3(0.72, 0.52, 0.32), highland * 0.45);
      // Soft snow on brightest peaks
      float snow = smoothstep(0.88, 0.97, luma) * (1.0 - oceanMask);
      c = mix(c, vec3(0.92, 0.94, 0.96), snow * 0.55);
      diffuseColor.rgb = clamp(c, 0.0, 1.0);
      `,
    );
  };
  mat.needsUpdate = true;
}

function EuropeTerrain({
  onHeights,
}: {
  onHeights: (h: Float32Array) => void;
}) {
  const hyp = useLoader(THREE.TextureLoader, HYP_URL);
  const sr = useLoader(THREE.TextureLoader, SR_URL);

  useEffect(() => {
    for (const t of [hyp, sr]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    }
  }, [hyp, sr]);

  const { geometry, heights } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(PLANE_W, PLANE_H, SEG_X, SEG_Y);
    geo.rotateX(-Math.PI / 2);
    const img = sr.image as HTMLImageElement | undefined;
    if (!img || !img.width) {
      return { geometry: geo, heights: null as Float32Array | null };
    }
    const heights = sampleDisplacement(img);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, heights[i]);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return { geometry: geo, heights };
  }, [sr]);

  useEffect(() => {
    if (heights) onHeights(heights);
  }, [heights, onHeights]);

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: hyp,
      bumpMap: sr,
      bumpScale: 0.55,
      roughness: 0.88,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
    applyCivSandboxSkin(mat);
    return mat;
  }, [hyp, sr]);

  return (
    <mesh
      geometry={geometry}
      material={material}
      receiveShadow
      castShadow
      frustumCulled={false}
    />
  );
}

export function AtlasScene() {
  const { selectDestiny } = useGame();
  const [cities, setCities] = useState<CityFeature[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [heights, setHeights] = useState<Float32Array | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cityFc = await fetch("/assets/atlas/cities-p0.geojson").then((r) =>
        r.json(),
      );
      if (cancelled) return;
      const list = (cityFc.features ?? []) as CityFeature[];
      setCities(list);
      const pre = new URLSearchParams(window.location.search).get("select");
      if (pre) {
        const hit = list.find((c) => c.properties.id === pre);
        if (hit?.properties.p0_entry) {
          setSelectedId(hit.properties.id);
          setAtlasSelection({
            id: hit.properties.id,
            name: hit.properties.name,
            venueId: hit.properties.venue || "coupland-lab",
            unlocked: true,
          });
        }
      }
    })().catch((err) => console.error("atlas load failed", err));
    return () => {
      cancelled = true;
      setAtlasSelection(null);
    };
  }, []);

  return (
    <group>
      <color attach="background" args={[FOG_COLOR]} />
      <fog attach="fog" args={[FOG_COLOR, 28, 62]} />
      <SkyDome />

      {/* Warm golden-hour key + soft sky fill */}
      <ambientLight intensity={0.38} color="#ffe8c8" />
      <hemisphereLight args={["#9ec8f0", "#6a5a40", 0.72]} />
      <directionalLight
        position={[10, 13, 5]}
        intensity={1.45}
        color="#ffd4a0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={45}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.00035}
        shadow-radius={4}
      />
      <directionalLight
        position={[-7, 7, -9]}
        intensity={0.32}
        color="#88aacc"
      />

      <EuropeTerrain onHeights={setHeights} />

      {/* Soft teal under-plane — table / far ocean, not black void */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.08, 0]}
        receiveShadow
      >
        <planeGeometry args={[PLANE_W * 1.55, PLANE_H * 1.55]} />
        <meshStandardMaterial color="#2a6e78" roughness={0.95} metalness={0} />
      </mesh>

      {cities.map((city) => {
        const [lon, lat] = city.geometry.coordinates;
        const worldPos = projectLonLat(lon, lat, 0);
        return (
          <CityCluster
            key={city.properties.id}
            city={city}
            elev={heightAt(heights, lon, lat)}
            worldPos={worldPos}
            selected={selectedId === city.properties.id}
            onActivate={() => {
              const unlocked = Boolean(city.properties.p0_entry);
              const venueId = city.properties.venue || "coupland-lab";
              const already = selectedId === city.properties.id;
              setSelectedId(city.properties.id);
              setAtlasSelection({
                id: city.properties.id,
                name: city.properties.name,
                venueId,
                unlocked,
              });
              if (already && unlocked) {
                selectDestiny(venueId);
              }
            }}
          />
        );
      })}
    </group>
  );
}
