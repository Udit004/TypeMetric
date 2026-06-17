"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const fragmentShader = `
varying float vDistance;
void main() {
  vec2 xy = gl_PointCoord.xy - vec2(0.5);
  float ll = length(xy);
  if(ll > 0.5) discard;
  
  // Color based on distance to mouse
  vec3 colorA = vec3(0.3, 1.0, 1.0); // Bright Cyan
  vec3 colorB = vec3(0.1, 0.5, 0.9); // Brighter blue
  
  vec3 finalColor = mix(colorA, colorB, smoothstep(0.0, 2.5, vDistance));
  
  // Make center brighter
  float alpha = (0.5 - ll) * 2.0;
  alpha *= smoothstep(0.0, 1.0, 4.0 - vDistance); // fade out far particles slightly
  
  gl_FragColor = vec4(finalColor, alpha * 1.5);
}
`;

const vertexShader = `
uniform float uTime;
uniform vec3 uMouse;
varying float vDistance;

void main() {
  vec3 pos = position;
  
  // calculate distance to mouse
  float dist = distance(pos.xy, uMouse.xy);
  vDistance = dist;
  
  // Repel effect
  float repelRadius = 2.0;
  if(dist < repelRadius) {
    vec3 dir = pos - vec3(uMouse.xy, 0.0);
    // Add small epsilon to avoid divide by zero if exactly on top
    if(length(dir) < 0.001) dir = vec3(0.0, 1.0, 0.0);
    dir = normalize(dir);
    
    // Push outwards
    float force = (repelRadius - dist) / repelRadius;
    // Smoother push function
    force = smoothstep(0.0, 1.0, force);
    pos += dir * force * 1.8;
  }
  
  // Idle animation
  pos.z += sin(pos.x * 2.0 + uTime) * 0.1;
  pos.z += cos(pos.y * 2.0 + uTime) * 0.1;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = (45.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  // Create particles in a circle
  const particlesCount = 4000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      // Random position in a wide ring/circle
      const r = 1.0 + Math.random() * 6.0;
      const theta = Math.random() * Math.PI * 2;

      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(theta) * r;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5; // slight depth
    }
    return pos;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector3(-10, -10, 0) }, // Start offscreen
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Convert normalized mouse coordinates to world coordinates
      const x = (state.mouse.x * viewport.width) / 2;
      const y = (state.mouse.y * viewport.height) / 2;

      // Smoothly interpolate mouse position for a trailing repel effect
      materialRef.current.uniforms.uMouse.value.lerp(new THREE.Vector3(x, y, 0), 0.15);
    }

    // Slow rotation of the entire particle system
    if (pointsRef.current) {
      pointsRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function BackgroundParticles() {
  return (
    <div className="absolute inset-0 z-[-1] pointer-events-none" style={{ top: '-10vh', height: '120vh' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        eventSource={typeof document !== 'undefined' ? document.body : undefined}
      >
        <Particles />
      </Canvas>
    </div>
  );
}
