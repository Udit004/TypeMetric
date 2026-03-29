import { useFrame } from "@react-three/fiber";
import { memo, useMemo, useRef } from "react";
import { Box3, Group, Mesh, Object3D, Vector3 } from "three";
import { Billboard, Text, useGLTF } from "@react-three/drei";

interface AvatarProps {
  id: string;
  name: string;
  rank: 1 | 2 | 3;
  avatarUrl?: string;
  color: string;
  position: [number, number, number];
}

const MODEL_PATHS = [
  "/models/resultModels/avatar1.glb",
  "/models/resultModels/avatar2.glb",
  "/models/resultModels/avatar3.glb",
] as const;

function hashSeed(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33 + value.charCodeAt(index)) % 100000;
  }

  return hash;
}

function resolveModelPath(id: string, rank: 1 | 2 | 3, avatarUrl?: string): string {
  if (avatarUrl && avatarUrl.endsWith(".glb")) {
    return avatarUrl.startsWith("/") ? avatarUrl : `/${avatarUrl}`;
  }

  const rankIndex = Math.max(0, rank - 1);
  const fallbackIndex = (hashSeed(id) + rankIndex) % MODEL_PATHS.length;
  return MODEL_PATHS[fallbackIndex] ?? MODEL_PATHS[0];
}

function targetModelHeight(rank: 1 | 2 | 3): number {
  if (rank === 1) {
    return 1.5;
  }

  if (rank === 2) {
    return 1.35;
  }

  return 1.28;
}

const CharacterModel = memo(function CharacterModel({ modelPath, rank }: { modelPath: string; rank: 1 | 2 | 3 }) {
  const { scene } = useGLTF(modelPath);
  const model = useMemo(() => scene.clone(true), [scene]);

  useMemo(() => {
    model.traverse((node: Object3D) => {
      if (node instanceof Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;

        if (node.material && "color" in node.material && node.material.color) {
          node.material.color.offsetHSL(0, 0, 0.03);
        }
      }
    });
  }, [model]);

  const normalizedTransform = useMemo(() => {
    const box = new Box3().setFromObject(model);
    const size = new Vector3();
    const center = new Vector3();

    box.getSize(size);
    box.getCenter(center);

    const safeHeight = Math.max(size.y, 0.001);
    const uniformScale = targetModelHeight(rank) / safeHeight;

    return {
      scale: uniformScale,
      x: -center.x * uniformScale,
      y: -box.min.y * uniformScale,
      z: -center.z * uniformScale,
    };
  }, [model, rank]);

  return (
    <group
      scale={normalizedTransform.scale}
      position={[normalizedTransform.x, normalizedTransform.y, normalizedTransform.z]}
    >
      <primitive object={model} />
    </group>
  );
});

export const Avatar = memo(function Avatar({ id, name, rank, avatarUrl, color, position }: AvatarProps) {
  const floatRef = useRef<Group>(null);
  const spinRef = useRef<Group>(null);
  const firstRankRingRef = useRef<Mesh>(null);

  const seed = useMemo(() => hashSeed(id), [id]);
  const floatSpeed = 1.1 + (seed % 7) * 0.04;
  const floatPhase = (seed % 360) * (Math.PI / 180);
  const modelPath = useMemo(() => resolveModelPath(id, rank, avatarUrl), [avatarUrl, id, rank]);
  const modelHeight = useMemo(() => targetModelHeight(rank), [rank]);

  useFrame((state, delta) => {
    if (!floatRef.current || !spinRef.current) {
      return;
    }

    spinRef.current.rotation.y += delta * 0.55;
    floatRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * floatSpeed + floatPhase) * 0.05;

    if (firstRankRingRef.current) {
      firstRankRingRef.current.rotation.z += delta * 0.9;
    }
  });

  return (
    <group ref={floatRef} position={position}>
      <group ref={spinRef}>
        <CharacterModel modelPath={modelPath} rank={rank} />

        {rank === 1 ? (
          <mesh
            ref={firstRankRingRef}
            position={[0, modelHeight + 0.18, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.7, 0.028, 16, 100]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
          </mesh>
        ) : null}
      </group>

      <Billboard follow lockX={false} lockY={false} lockZ={false} position={[0, modelHeight + 0.48, 0]}>
        <Text
          fontSize={0.24}
          color="#e2e8f0"
          anchorX="center"
          anchorY="bottom"
          maxWidth={2.7}
          textAlign="center"
          outlineWidth={0.012}
          outlineColor="#020617"
        >
          {name}
        </Text>
      </Billboard>
    </group>
  );
});

useGLTF.preload(MODEL_PATHS[0]);
useGLTF.preload(MODEL_PATHS[1]);
useGLTF.preload(MODEL_PATHS[2]);
