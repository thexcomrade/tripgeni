"use client";

import React, { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface MascotGLBModelProps {
  onLoadSuccess?: () => void;
}

function MascotGLBModel({ onLoadSuccess }: MascotGLBModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/images/model.glb");

  // Enhance materials & enable shadows on all meshes
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.roughness = THREE.MathUtils.clamp(mat.roughness ?? 0.5, 0.3, 0.85);
            mat.metalness = THREE.MathUtils.clamp(mat.metalness ?? 0.1, 0.0, 0.35);
            mat.needsUpdate = true;
          }
        }
      });
      onLoadSuccess?.();
    }
  }, [scene, onLoadSuccess]);

  // Procedural Life Animation: Natural breathing, floating sway & smooth pointer tracking
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();

    // 1. Natural Breathing Cycle (subtle chest / shoulder expansion)
    const breath = Math.sin(t * 2.2);
    const baseScale = 0.92;
    group.current.scale.y = baseScale * (1 + breath * 0.014);
    group.current.scale.x = baseScale * (1 - breath * 0.007);
    group.current.scale.z = baseScale * (1 + breath * 0.01);

    // 2. Organic Floating Sway & Weight Shift
    const baseY = -0.06;
    group.current.position.y = baseY + Math.sin(t * 1.8) * 0.028;
    group.current.position.x = Math.sin(t * 0.9) * 0.015;

    // 3. Subtle Torso Roll / Posture Tilt
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      Math.sin(t * 0.9) * 0.015,
      0.08
    );

    // 4. Interactive Eye / Head Mouse Pointer Tracking (ROG Omni companion behavior)
    // Smoothly rotates toward user's cursor / touch point
    const targetRotY = THREE.MathUtils.clamp(
      (state.pointer.x * Math.PI) / 6,
      -Math.PI / 5,
      Math.PI / 5
    );
    const targetRotX = THREE.MathUtils.clamp(
      -(state.pointer.y * Math.PI) / 8,
      -Math.PI / 10,
      Math.PI / 10
    );

    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      targetRotY,
      0.07
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      targetRotX,
      0.07
    );
  });

  return (
    <group ref={group} position={[0, -0.06, 0]} scale={0.92}>
      <primitive object={scene} />
    </group>
  );
}

export default function Mascot3DCanvas({
  fallback,
}: {
  fallback?: React.ReactNode;
}) {
  const [modelAvailable, setModelAvailable] = useState<boolean | null>(null);

  // Check availability of /images/model.glb
  useEffect(() => {
    fetch("/images/model.glb", { method: "HEAD" })
      .then((res) => {
        if (res.ok) {
          setModelAvailable(true);
        } else {
          setModelAvailable(false);
        }
      })
      .catch(() => {
        setModelAvailable(false);
      });
  }, []);

  if (modelAvailable === false) {
    return <>{fallback}</>;
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <Suspense fallback={fallback}>
        <Canvas
          shadows
          camera={{
            position: [0, 0, 4.3],
            fov: 34,
          }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          dpr={[1, 1.5]}
          style={{ width: "100%", height: "100%", pointerEvents: "none" }}
        >
          {/* STUDIO PHYSICAL LIGHTING (No harsh neon glow, photorealistic depth) */}
          <ambientLight intensity={1.3} />

          {/* Key Light: Warm natural studio key */}
          <directionalLight
            position={[3.0, 4.5, 3.5]}
            intensity={2.2}
            color="#FFFDF7"
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
            shadow-camera-near={1}
            shadow-camera-far={10}
            shadow-bias={-0.0005}
          />

          {/* Fill Light: Soft warm ambient reflection */}
          <directionalLight
            position={[-2.8, 1.8, 2.2]}
            intensity={1.0}
            color="#FDE68A"
          />

          {/* Edge / Rim Light: Subtle cool separation from dark background */}
          <directionalLight
            position={[0, 3.2, -3.2]}
            intensity={1.4}
            color="#38BDF8"
          />

          {/* 3D GLB Model */}
          <MascotGLBModel onLoadSuccess={() => setModelAvailable(true)} />

          {/* Dynamic Photorealistic Ground Contact Shadow directly under feet */}
          <ContactShadows
            position={[0, -0.96, 0]}
            opacity={0.78}
            scale={2.2}
            blur={1.6}
            far={1.6}
            resolution={256}
            color="#000000"
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

// Pre-load the GLB model in browser cache for instant startup
useGLTF.preload("/images/model.glb");
