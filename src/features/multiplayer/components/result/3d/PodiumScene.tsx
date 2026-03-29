"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { memo, useMemo } from "react";
import { Avatar } from "./Avatar";
import { PodiumBlock, PodiumRank } from "./PodiumBlock";

export type PlayerResult = {
  id: string;
  name: string;
  avatarUrl?: string;
  rank: PodiumRank;
  score: number;
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
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0b1e3b" roughness={0.95} metalness={0.08} />
      </mesh>

      <mesh position={[0, -0.52, -2.4]} receiveShadow>
        <cylinderGeometry args={[6.9, 6.9, 0.35, 72]} />
        <meshStandardMaterial color="#132544" roughness={0.78} metalness={0.22} />
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
        intensity={0.8}
        color="#bfdbfe"
        castShadow
      />
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
