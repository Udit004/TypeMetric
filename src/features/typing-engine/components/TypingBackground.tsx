"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sparkles, Float, MeshDistortMaterial } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function AnimatedAura() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.05;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      {/* A shifting, wireframe holographic sphere acting as a data core */}
      <mesh ref={meshRef} position={[0, -1, -5]} scale={3.5}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial 
          color="#0f172a" 
          emissive="#0d9488" 
          emissiveIntensity={0.6}
          distort={0.4} 
          speed={2} 
          roughness={0.2}
          metalness={0.8}
          wireframe={true} 
          transparent={true}
          opacity={0.3}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#818cf8" />
      <directionalLight position={[-10, -10, -5]} intensity={0.8} color="#2dd4bf" />
      
      {/* Deep background stars for infinite depth */}
      <Stars radius={50} depth={50} count={5000} factor={4} saturation={1} fade speed={1.5} />
      
      {/* Floating magical tech dust (cyan and indigo) */}
      <Sparkles count={400} size={2.5} color="#4fd1c5" scale={[20, 15, 10]} speed={0.4} opacity={0.6} />
      <Sparkles count={200} size={4} color="#818cf8" scale={[20, 15, 10]} speed={0.6} opacity={0.4} />

      {/* Central living tech entity / aura */}
      <AnimatedAura />
    </>
  );
}

export function TypingBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-slate-950 overflow-hidden">
      {/* Gradient ambient glow behind the 3D canvas */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/15 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-teal-500/15 blur-[120px] animate-[pulse_10s_ease-in-out_infinite_reverse]" />
      <div className="absolute top-[20%] left-[40%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] animate-[pulse_12s_ease-in-out_infinite]" />
      
      {/* 3D Canvas */}
      <div className="absolute inset-0 opacity-80 mix-blend-screen">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <Scene />
        </Canvas>
      </div>
      
      {/* Stronger Vignette to blend the edges deeply into the app UI */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,6,23,0.95)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-transparent to-slate-950/90" />
    </div>
  );
}
