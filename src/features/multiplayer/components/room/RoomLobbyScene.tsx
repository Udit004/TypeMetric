"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Environment, Sparkles, Text, useGLTF } from "@react-three/drei";
import { memo, useMemo } from "react";
import { Box3, Mesh, Object3D, Vector3 } from "three";
import { MultiplayerPlayer } from "../../types/multiplayerTypes";

interface RoomLobbySceneProps {
  participants: MultiplayerPlayer[];
  title?: string;
  description?: string;
}

const MODEL_POOL = [
  "/models/resultModels/avatar1.glb",
  "/models/resultModels/avatar2.glb",
  "/models/resultModels/avatar3.glb",
] as const;

function hashSeed(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33 + value.charCodeAt(index)) % 2147483647;
  }

  return hash;
}

function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const list = [...items];
  let state = seed || 1;

  for (let index = list.length - 1; index > 0; index -= 1) {
    state = (state * 48271) % 2147483647;
    const swapIndex = state % (index + 1);
    const current = list[index];
    list[index] = list[swapIndex] as T;
    list[swapIndex] = current;
  }

  return list;
}

const LobbyAvatar = memo(function LobbyAvatar({
  name,
  modelPath,
  position,
}: {
  name: string;
  modelPath: string;
  position: [number, number, number];
}) {
  const { scene } = useGLTF(modelPath);

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
    const uniformScale = 1.78 / safeHeight;

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
    <group position={position}>
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <cylinderGeometry args={[0.95, 1.05, 0.14, 42]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.65} />
      </mesh>

      <group scale={scale} position={[offset.x, offset.y + 0.06, offset.z]}>
        <primitive object={cloned} />
      </group>

      <Billboard follow lockX={false} lockY={false} lockZ={false} position={[0, 2.02, 0]}>
        <Text
          fontSize={0.2}
          color="#e2e8f0"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.3}
          textAlign="center"
          outlineWidth={0.01}
          outlineColor="#020617"
        >
          {name}
        </Text>
      </Billboard>
    </group>
  );
});

function CameraController({ targetY }: { targetY: number }) {
  useFrame(({ camera: threeCamera }) => {
    threeCamera.lookAt(0, targetY, 0);
  });

  return null;
}

function LobbyStage({
  players,
  title,
  description,
}: {
  players: MultiplayerPlayer[];
  title: string;
  description: string;
}) {
  const arranged = useMemo(() => {
    const visible = players.slice(0, 6);
    const spacing = visible.length <= 3 ? 2.1 : 1.65;
    const startX = -((visible.length - 1) * spacing) / 2;

    const poolSeed = hashSeed(visible.map((player) => player.userId).sort().join("|"));
    const uniquePool = seededShuffle(MODEL_POOL, poolSeed);

    return visible.map((player, index) => {
      const x = startX + index * spacing;
      const z = 0;
      // First 3 players always get unique avatars when three users are in room.
      const modelPath = uniquePool[index % uniquePool.length] ?? MODEL_POOL[0];

      return {
        ...player,
        position: [x, 0, z] as [number, number, number],
        modelPath,
      };
    });
  }, [players]);

  return (
    <>
      <mesh position={[-3.2, 2.52, -2.95]}>
        <planeGeometry args={[8.0, 2.25]} />
        <meshStandardMaterial color="#0f1b3e" emissive="#1d4ed8" emissiveIntensity={0.3} side={2} />
      </mesh>

      <mesh position={[-3.2, 2.52, -2.87]}>
        <planeGeometry args={[7.52, 1.78]} />
        <meshStandardMaterial color="#0a294a" emissive="#0891b2" emissiveIntensity={0.24} side={2} />
      </mesh>

      <mesh position={[-3.2, 3.36, -2.86]}>
        <planeGeometry args={[7.35, 0.07]} />
        <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={0.86} />
      </mesh>

      <Text
        position={[-3.2,2.5, -2.78]}
        fontSize={0.3}
        color="#7dd3fc"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#020617"
      >
        LOBBY
      </Text>


      {/* <Text
        position={[-3.2, 2.44, -2.78]}
        fontSize={0.145}
        color="#cbd5e1"
        anchorX="center"
        anchorY="middle"
        maxWidth={6.0}
        lineHeight={1.35}
        textAlign="center"
        outlineWidth={0.01}
        outlineColor="#020617"
      >
        {description}
      </Text> */}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
        <planeGeometry args={[20, 14]} />
        <meshStandardMaterial color="#102347" roughness={0.9} metalness={0.08} />
      </mesh>

      <mesh position={[0, 4.1, -8]}>
        <planeGeometry args={[28, 11]} />
        <meshStandardMaterial color="#1d4ed8" emissive="#2563eb" emissiveIntensity={0.26} />
      </mesh>

      <mesh position={[-9.5, 2.1, -4.5]} rotation={[0, Math.PI / 3, 0]}>
        <planeGeometry args={[14, 7]} />
        <meshStandardMaterial color="#14b8a6" emissive="#14b8a6" emissiveIntensity={0.32} side={2} />
      </mesh>

      <mesh position={[9.5, 2.1, -4.5]} rotation={[0, -Math.PI / 3, 0]}>
        <planeGeometry args={[14, 7]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.28} side={2} />
      </mesh>

      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[4.2, 4.6, 0.12, 64]} />
        <meshStandardMaterial color="#1e3a8a" emissive="#0ea5e9" emissiveIntensity={0.33} />
      </mesh>

      {arranged.map((player) => (
        <LobbyAvatar
          key={player.userId}
          name={player.name}
          modelPath={player.modelPath}
          position={player.position}
        />
      ))}
    </>
  );
}

export const RoomLobbyScene = memo(function RoomLobbyScene({
  participants,
  title = "Ready Check Arena",
  description = "All players wait here before each round. Prompt is hidden until the race starts.",
}: RoomLobbySceneProps) {
  return (
    <div className="h-80 w-full sm:h-96">
      <Canvas
        shadows
        camera={{ position: [0, 0.6, 9.5], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.75]}
      >
        <color attach="background" args={["#0b1f4d"]} />
        <fog attach="fog" args={["#102347", 10, 30]} />

        <ambientLight intensity={0.62} />
        <directionalLight position={[7, 10, 6]} intensity={1.1} castShadow />
        <pointLight position={[0, 4.2, -4]} intensity={1.15} color="#67e8f9" distance={16} />
        <pointLight position={[-5, 2, 2]} intensity={0.52} color="#34d399" distance={12} />
        <pointLight position={[5, 2, 2]} intensity={0.52} color="#f59e0b" distance={12} />
        <pointLight position={[0, 1.4, 6]} intensity={0.45} color="#a78bfa" distance={12} />

        <Sparkles count={50} scale={[12, 4, 8]} size={4} speed={0.3} color="#93c5fd" />
        <Sparkles count={42} scale={[11, 3.4, 7]} position={[0, 1.2, -1]} size={5} speed={0.24} color="#fef08a" />

        <CameraController targetY={0.8} />

        <LobbyStage players={participants} title={title} description={description} />

        <Environment preset="city" />
      </Canvas>
    </div>
  );
});

useGLTF.preload(MODEL_POOL[0]);
useGLTF.preload(MODEL_POOL[1]);
useGLTF.preload(MODEL_POOL[2]);
