import { Text } from "@react-three/drei";
import { memo } from "react";

export type PodiumRank = 1 | 2 | 3;

interface PodiumBlockProps {
  rank: PodiumRank;
  color: string;
  height: number;
  position: [number, number, number];
}

export const PodiumBlock = memo(function PodiumBlock({ rank, color, height, position }: PodiumBlockProps) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, height, 1.9]} />
        <meshStandardMaterial color={color} roughness={0.28} metalness={0.42} />
      </mesh>

      <mesh position={[0, height + 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[1.05, 1.05, 0.06, 48]} />
        <meshStandardMaterial color="#0f172a" roughness={0.75} metalness={0.2} />
      </mesh>

      <Text
        position={[0, height * 0.52, 0.98]}
        fontSize={0.5}
        color="#f8fafc"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#020617"
      >
        #{rank}
      </Text>
    </group>
  );
});
