"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StrandParams {
  offset: number;
  speed: number;
  amplitude: number;
  radius: number;
  phase: number;
  opacity: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(x: number, center: number, width: number) {
  const d = (x - center) / width;
  return Math.exp(-d * d);
}

interface StrandLine {
  params: StrandParams;
  line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
}

/**
 * Module-level frame writer: mutates only Three.js buffers (never React
 * state), reusing the same Float32Array every frame with no allocation.
 */
function writeStrandPositions(
  strands: StrandLine[],
  points: number,
  t: number,
  radiusMul: number,
  amplitudeMul: number,
  opacityMul: number,
) {
  const breath = 1 + Math.sin(t * 0.4) * 0.04;
  for (let s = 0; s < strands.length; s++) {
    const { params: sp, line } = strands[s];
    const attr = line.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < points; i++) {
      const tt = i / (points - 1);
      const angle = tt * Math.PI * 2 + t * sp.speed * 10;
      arr[i * 3] =
        Math.cos(angle + sp.phase) * sp.radius * radiusMul * breath +
        Math.sin(t + s) * 2;
      arr[i * 3 + 1] =
        ((tt - 0.5) * 60 +
          Math.sin(t * sp.speed + tt * 5 + sp.offset) *
            sp.amplitude *
            amplitudeMul) *
        0.55;
      arr[i * 3 + 2] =
        Math.sin(angle + sp.phase) * sp.radius * radiusMul * breath +
        Math.cos(t + s) * 2;
    }
    attr.needsUpdate = true;
    line.material.opacity = sp.opacity * opacityMul;
  }
}

function Strands({ count, points }: { count: number; points: number }) {
  const groupRef = React.useRef<THREE.Group>(null);
  const pointer = React.useRef({ x: 0, y: 0, tx: 0, ty: 0, enabled: false });
  const time = React.useRef(0);

  // Built imperatively (rather than <line> JSX, which collides with the SVG
  // intrinsic) and attached via <primitive>.
  const strands = React.useMemo(() => {
    const rand = mulberry32(20261017);
    return Array.from({ length: count }, () => {
      const params: StrandParams = {
        offset: rand() * Math.PI * 2,
        speed: 0.005 + rand() * 0.01,
        amplitude: 2 + rand() * 5,
        radius: 5 + rand() * 15,
        phase: rand() * Math.PI * 2,
        opacity: 0.08 + rand() * 0.22,
      };
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(points * 3), 3),
      );
      const material = new THREE.LineBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: params.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const line = new THREE.Line(geometry, material);
      line.frustumCulled = false;
      return { params, line };
    });
  }, [count, points]);

  // Lines, geometries, and materials are created once per mount.
  React.useEffect(() => {
    const created = strands;
    return () => {
      for (const { line } of created) {
        line.geometry.dispose();
        line.material.dispose();
      }
    };
  }, [strands]);

  React.useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    pointer.current.enabled = fine && !coarse;
    if (!pointer.current.enabled) return;
    const onMove = (event: PointerEvent) => {
      pointer.current.tx = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.ty = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, rawDelta) => {
    const group = groupRef.current;
    if (!group) return;
    const delta = Math.min(rawDelta, 0.05);
    time.current += delta;
    const t = time.current;

    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1,
    );
    const scroll = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);

    // Scroll choreography: loose hero strands -> converge near the hub ->
    // ordered during approach cards -> soften and disperse near contact.
    const converge = gaussian(scroll, 0.32, 0.16);
    const ordered = gaussian(scroll, 0.58, 0.18);
    const disperse = Math.min(Math.max((scroll - 0.78) / 0.22, 0), 1);
    const radiusMul = 1 - 0.45 * converge;
    const amplitudeMul = (1 - 0.55 * ordered) * (1 + 0.6 * disperse);
    const opacityMul = (1 - 0.35 * ordered) * (1 - 0.5 * disperse);

    // Subtle damped pointer parallax on fine-pointer desktops only.
    const p = pointer.current;
    p.x += (p.tx - p.x) * 0.03;
    p.y += (p.ty - p.y) * 0.03;
    group.rotation.y = p.enabled ? p.x * 0.06 : 0;
    group.rotation.x = p.enabled ? p.y * 0.04 : 0;

    writeStrandPositions(strands, points, t, radiusMul, amplitudeMul, opacityMul);
  });

  return (
    <group ref={groupRef}>
      {strands.map(({ line }, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}

export function StrandScene({ paused }: { paused: boolean }) {
  const [compact, setCompact] = React.useState(
    () =>
      typeof window !== "undefined" &&
      (window.innerWidth < 768 ||
        window.matchMedia("(pointer: coarse)").matches),
  );
  const [hidden, setHidden] = React.useState(false);

  // Resize/orientation-aware density: recompute on viewport or pointer
  // changes instead of pinning the first-paint value.
  React.useEffect(() => {
    const compute = () =>
      window.innerWidth < 768 ||
      window.matchMedia("(pointer: coarse)").matches;
    const coarse = window.matchMedia("(pointer: coarse)");
    const onChange = () => setCompact(compute());
    window.addEventListener("resize", onChange);
    window.addEventListener("orientationchange", onChange);
    coarse.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("orientationchange", onChange);
      coarse.removeEventListener("change", onChange);
    };
  }, []);

  // Stop rendering while the tab is hidden; R3F resumes the loop on return.
  React.useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () =>
      document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const count = compact ? 20 : 40;
  const points = compact ? 32 : 50;
  const dpr: [number, number] = compact ? [1, 1.5] : [1, 2];

  return (
    <Canvas
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 30], fov: 60 }}
      dpr={dpr}
      frameloop={paused || hidden ? "never" : "always"}
      aria-hidden="true"
      onCreated={({ gl }) => {
        // Surface context loss to the wrapper so it can swap in the static
        // fallback instead of leaving a dead canvas on screen.
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent("moorxe:webgl-lost"));
        });
      }}
    >
      <Strands count={count} points={points} />
    </Canvas>
  );
}
