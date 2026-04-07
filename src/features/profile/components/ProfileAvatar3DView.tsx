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

interface StatHudCardProps {
  label: string;
  value: string;
  accentClass: string;
}

function StatHudCard({ label, value, accentClass }: StatHudCardProps) {
  return (
    <div className="rounded-xl border border-white/12 bg-slate-950/56 px-3 py-2.5 backdrop-blur">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-black ${accentClass}`}>{value}</p>
    </div>
  );
}

export function ProfileAvatar3DView({ profileIdentity, stats }: ProfileAvatar3DViewProps) {
  const modelPath = useMemo(() => chooseModelPath(profileIdentity.id), [profileIdentity.id]);

  const leftStats = [
    {
      label: "Solo Sessions",
      value: String(stats.soloSessions),
      accentClass: "text-white",
    },
    {
      label: "Best Solo WPM",
      value: metric(stats.bestSoloWpm),
      accentClass: "text-cyan-200",
    },
    {
      label: "Avg Solo Accuracy",
      value: `${metric(stats.avgSoloAccuracy)}%`,
      accentClass: "text-emerald-200",
    },
  ];

  const rightStats = [
    {
      label: "Race Count",
      value: String(stats.raceCount),
      accentClass: "text-white",
    },
    {
      label: "Best Race WPM",
      value: metric(stats.bestRaceWpm),
      accentClass: "text-cyan-200",
    },
    {
      label: "Wins / Podiums",
      value: `${stats.wins} / ${stats.podiums}`,
      accentClass: "text-amber-200",
    },
  ];

  return (
    <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-cyan-300/20 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.22),rgba(2,6,23,0.86)_55%)]">
      <div className="relative h-136 w-full sm:h-144 lg:h-152">
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

        <div className="pointer-events-none absolute inset-3 hidden items-center justify-between gap-4 lg:flex">
          <div className="w-full max-w-52 space-y-3">
            {leftStats.map((stat) => (
              <StatHudCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                accentClass={stat.accentClass}
              />
            ))}
          </div>
          <div className="w-full max-w-52 space-y-3">
            {rightStats.map((stat) => (
              <StatHudCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                accentClass={stat.accentClass}
              />
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 lg:hidden">
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/12 bg-slate-950/68 p-3 backdrop-blur">
            {[...leftStats, ...rightStats].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 px-2 py-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{stat.label}</p>
                <p className={`mt-1 text-lg font-black ${stat.accentClass}`}>{stat.value}</p>
              </div>
            ))}
            <div className="col-span-2 rounded-xl border border-white/10 bg-white/5 px-2 py-2">
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Mode / Country</p>
              <p className="mt-1 text-sm font-semibold text-cyan-100">
                {profileIdentity.favoriteMode} / {profileIdentity.country || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

useGLTF.preload(MODEL_POOL[0]);
useGLTF.preload(MODEL_POOL[1]);
useGLTF.preload(MODEL_POOL[2]);
