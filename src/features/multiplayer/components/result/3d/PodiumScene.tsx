"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Sparkles } from "@react-three/drei";
import { memo, useMemo } from "react";
import { Avatar } from "./Avatar";
import { PodiumBlock, PodiumRank } from "./PodiumBlock";

export type PlayerResult = {
  id: string;
  name: string;
  avatarUrl?: string;
  rank: PodiumRank;
  score: number;
  wpm?: number;
  accuracy?: number;
};

interface PodiumSceneProps {
  players: PlayerResult[];
}

const PODIUM_CONFIG: Record<PodiumRank, { position: [number, number, number]; height: number; color: string }> = {
  1: { position: [0, 0, 0], height: 2.5, color: "#d4af37" },
  2: { position: [-3, -0.5, 0], height: 1.6, color: "#94a3b8" },
  3: { position: [3, -0.8, 0], height: 1.2, color: "#cd7f32" },
};

const RANK_ORDER: PodiumRank[] = [2, 1, 3];

function Stage() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.82, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0b1e3b" roughness={0.95} metalness={0.08} />
      </mesh>

      <mesh position={[0, -0.52, -2.4]} receiveShadow>
        <cylinderGeometry args={[6.9, 6.9, 0.35, 72]} />
        <meshStandardMaterial color="#132544" roughness={0.78} metalness={0.22} />
      </mesh>

      <mesh position={[0, 3.1, -8.3]}>
        <planeGeometry args={[34, 10.5]} />
        <meshStandardMaterial color="#0b2243" emissive="#0f2a55" emissiveIntensity={0.45} />
      </mesh>

      <mesh position={[-11.2, 2.1, -4.7]} rotation={[0, Math.PI / 2.8, 0]}>
        <planeGeometry args={[18, 10]} />
        <meshStandardMaterial color="#0a1f3e" emissive="#0f2a55" emissiveIntensity={0.36} side={2} />
      </mesh>

      <mesh position={[12.0, 2.15, -4.2]} rotation={[0, -Math.PI / 3.3, 0]}>
        <planeGeometry args={[20, 10.5]} />
        <meshStandardMaterial color="#112b54" emissive="#1d4b87" emissiveIntensity={0.5} side={2} />
      </mesh>

      <mesh position={[0, 2.4, -6.7]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.3, 0.08, 24, 120]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.7} />
      </mesh>

      <mesh position={[0, 2.4, -6.5]} rotation={[Math.PI / 2, 0, Math.PI / 5]}>
        <torusGeometry args={[4.7, 0.05, 24, 140]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.65} />
      </mesh>
    </>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.46} />

      <directionalLight
        position={[7, 11, 5]}
        intensity={1.15}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={28}
      />

      <spotLight
        position={[0, 10, 2]}
        angle={0.34}
        penumbra={0.55}
        intensity={0.95}
        color="#bfdbfe"
        castShadow
      />

      <pointLight position={[0, 4.8, -5.8]} intensity={1.15} color="#67e8f9" distance={18} />
      <pointLight position={[-6, 3, -2]} intensity={0.55} color="#34d399" distance={14} />
      <pointLight position={[6, 3, -2]} intensity={0.55} color="#f59e0b" distance={14} />
    </>
  );
}

export const PodiumScene = memo(function PodiumScene({ players }: PodiumSceneProps) {
  const podiumPlayers = useMemo(() => {
    const filtered = players
      .filter((player) => player.rank === 1 || player.rank === 2 || player.rank === 3)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 3);

    return filtered;
  }, [players]);

  return (
    <div className="h-120 w-full sm:h-136">
      <Canvas
        shadows
        camera={{ position: [0, 7.2, 10.2], fov: 46 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.75]}
      >
        <color attach="background" args={["#030712"]} />

        <Lights />
        <Stage />
        <Sparkles count={90} scale={[16, 7, 10]} size={4} speed={0.45} color="#fde68a" />
        <Sparkles count={50} scale={[14, 5, 8]} position={[0, 2, -4]} size={5} speed={0.35} color="#93c5fd" />

        {RANK_ORDER.map((rank) => {
          const player = podiumPlayers.find((item) => item.rank === rank);
          const config = PODIUM_CONFIG[rank];

          if (!player) {
            return null;
          }

          return (
            <group key={player.id}>
              <PodiumBlock
                rank={rank}
                height={config.height}
                position={config.position}
                color={config.color}
              />

              <Avatar
                id={player.id}
                name={player.name}
                rank={rank}
                avatarUrl={player.avatarUrl}
                color={config.color}
                score={player.score}
                wpm={player.wpm}
                accuracy={player.accuracy}
                position={[config.position[0], config.position[1] + config.height + 0.02, config.position[2]]}
              />
            </group>
          );
        })}

        <Environment preset="studio" />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={0.75}
          maxPolarAngle={1.25}
          minAzimuthAngle={-0.45}
          maxAzimuthAngle={0.45}
          target={[0, 1.35, 0]}
        />
      </Canvas>
    </div>
  );
});
