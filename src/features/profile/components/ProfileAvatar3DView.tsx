"use client";

import { Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import { Box3, Mesh, Object3D, Vector3 } from "three";

import { ProfileIdentity } from "../types";
import { metric } from "./profileFormatters";

const MODEL_POOL = [
  "/models/resultModels/avatar1.glb",
  "/models/resultModels/avatar2.glb",
  "/models/resultModels/avatar3.glb",
] as const;

const CAMERA_FOCUS_Y = 0.78;

function hashSeed(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33 + value.charCodeAt(index)) % 2147483647;
  }

  return hash;
}

function chooseModelPath(userId: string): string {
  const seed = hashSeed(userId || "guest");
  const index = Math.abs(seed) % MODEL_POOL.length;
  return MODEL_POOL[index] ?? MODEL_POOL[0];
}

function AvatarModel({ path }: { path: string }) {
  const { scene } = useGLTF(path);

  const { cloned, scale, offset } = useMemo(() => {
    const model = scene.clone(true);

    model.traverse((node: Object3D) => {
      if (node instanceof Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    const box = new Box3().setFromObject(model);
    const size = new Vector3();
    const center = new Vector3();

    box.getSize(size);
    box.getCenter(center);

    const safeHeight = Math.max(size.y, 0.001);
    const uniformScale = 1.88 / safeHeight;

    return {
      cloned: model,
      scale: uniformScale,
      offset: {
        x: -center.x * uniformScale,
        y: -box.min.y * uniformScale,
        z: -center.z * uniformScale,
      },
    };
  }, [scene]);

  return (
    <group>
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <cylinderGeometry args={[1.16, 1.24, 0.12, 52]} />
        <meshStandardMaterial color="#1e293b" metalness={0.28} roughness={0.68} />
      </mesh>
      <group scale={scale} position={[offset.x, offset.y + 0.02, offset.z]}>
        <primitive object={cloned} />
      </group>
    </group>
  );
}

function CameraFocus({ targetY }: { targetY: number }) {
  useFrame(({ camera }) => {
    camera.lookAt(0, targetY, 0);
  });

  return null;
}

interface ProfileAvatar3DViewProps {
  profileIdentity: ProfileIdentity;
  stats: {
    soloSessions: number;
    bestSoloWpm: number;
    avgSoloAccuracy: number;
    raceCount: number;
    bestRaceWpm: number;
    wins: number;
    podiums: number;
  };
}

export function ProfileAvatar3DView({ profileIdentity, stats }: ProfileAvatar3DViewProps) {
  const modelPath = useMemo(() => chooseModelPath(profileIdentity.id), [profileIdentity.id]);

  return (
    <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-cyan-300/20 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.22),rgba(2,6,23,0.86)_55%)]">
      <div className="relative h-72 w-full sm:h-80 lg:h-96">
        <Canvas shadows camera={{ position: [0, 1, 3.15], fov: 50 }} dpr={[1, 1.8]}>
          <CameraFocus targetY={CAMERA_FOCUS_Y} />
          <ambientLight intensity={0.65} />
          <directionalLight position={[3, 5, 3]} intensity={1.05} castShadow />
          <pointLight position={[-2, 1.2, 2]} intensity={0.48} color="#22d3ee" distance={8} />
          <pointLight position={[2, 1.1, 2]} intensity={0.48} color="#34d399" distance={8} />

          <Suspense fallback={null}>
            <AvatarModel path={modelPath} />
            <Environment preset="city" />
          </Suspense>
        </Canvas>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-2xl border border-white/12 bg-slate-950/68 p-3 backdrop-blur">
          <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-[0.14em] text-slate-300">
            <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-1.5">
              <p className="text-slate-400">Mode</p>
              <p className="mt-1 text-cyan-100">{profileIdentity.favoriteMode}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-1.5">
              <p className="text-slate-400">Country</p>
              <p className="mt-1 truncate text-cyan-100">{profileIdentity.country || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-t border-white/10 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-slate-950/55 p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Solo Sessions</p><p className="mt-2 text-2xl font-black text-white">{stats.soloSessions}</p></div>
        <div className="rounded-xl border border-white/10 bg-slate-950/55 p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Best Solo WPM</p><p className="mt-2 text-2xl font-black text-cyan-200">{metric(stats.bestSoloWpm)}</p></div>
        <div className="rounded-xl border border-white/10 bg-slate-950/55 p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Avg Solo Accuracy</p><p className="mt-2 text-2xl font-black text-emerald-200">{metric(stats.avgSoloAccuracy)}%</p></div>
        <div className="rounded-xl border border-white/10 bg-slate-950/55 p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Race Count</p><p className="mt-2 text-2xl font-black text-white">{stats.raceCount}</p></div>
        <div className="rounded-xl border border-white/10 bg-slate-950/55 p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Best Race WPM</p><p className="mt-2 text-2xl font-black text-cyan-200">{metric(stats.bestRaceWpm)}</p></div>
        <div className="rounded-xl border border-white/10 bg-slate-950/55 p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Wins / Podiums</p><p className="mt-2 text-2xl font-black text-amber-200">{stats.wins} / {stats.podiums}</p></div>
      </div>
    </div>
  );
}

useGLTF.preload(MODEL_POOL[0]);
useGLTF.preload(MODEL_POOL[1]);
useGLTF.preload(MODEL_POOL[2]);
