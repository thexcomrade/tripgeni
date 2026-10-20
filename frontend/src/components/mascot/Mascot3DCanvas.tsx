"use client";

import React, { Suspense, useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface MascotGLBModelProps {
  onLoadSuccess?: () => void;
}

function MascotGLBModel({ onLoadSuccess }: MascotGLBModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/images/model.glb");

  // Enhance materials: DoubleSide rendering for 360 rotation & realistic PBR studio lighting
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            // Enable double-sided rendering so 360 rotation never clips or culls backfaces
            mat.side = THREE.DoubleSide;
            mat.roughness = THREE.MathUtils.clamp(mat.roughness ?? 0.5, 0.3, 0.85);
            mat.metalness = THREE.MathUtils.clamp(mat.metalness ?? 0.1, 0.0, 0.35);
            mat.needsUpdate = true;
          }
        }
      });
      onLoadSuccess?.();
    }
  }, [scene, onLoadSuccess]);

  // Procedural Life Animation: Organic breathing cycle, floating sway & weight shifts
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();

    // 1. Natural Breathing Cycle (chest & shoulder expansion)
    const breath = Math.sin(t * 2.2);
    const baseScale = 0.92;
    group.current.scale.y = baseScale * (1 + breath * 0.015);
    group.current.scale.x = baseScale * (1 - breath * 0.008);
    group.current.scale.z = baseScale * (1 + breath * 0.012);

    // 2. Organic Floating Sway & Micro Weight Shift
    const baseY = -0.06;
    group.current.position.y = baseY + Math.sin(t * 1.8) * 0.028;
    group.current.position.x = Math.sin(t * 0.9) * 0.014;

    // 3. Subtle Torso Posture Roll
    group.current.rotation.z = Math.sin(t * 0.9) * 0.012;
  });

  return (
    <group ref={group} position={[0, -0.06, 0]} scale={0.92}>
      <primitive object={scene} />
    </group>
  );
}

export default function Mascot3DCanvas({
  fallback,
  onModelClick,
}: {
  fallback?: React.ReactNode;
  onModelClick?: () => void;
}) {
  const [modelAvailable, setModelAvailable] = useState<boolean | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

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

  // Pointer tracking to distinguish between a drag-rotation and a click-to-open-chat
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setIsRotating(true);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsRotating(false);
    if (dragStartRef.current) {
      const dx = Math.abs(e.clientX - dragStartRef.current.x);
      const dy = Math.abs(e.clientY - dragStartRef.current.y);
      // If movement is under 6px, it is a deliberate click/tap
      if (dx < 6 && dy < 6) {
        onModelClick?.();
      }
    }
    dragStartRef.current = null;
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        cursor: isRotating ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none",
      }}
      title="Drag to rotate 3D character • Click to chat"
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
          style={{ width: "100%", height: "100%" }}
        >
          {/* STUDIO PHYSICAL LIGHTING (No harsh neon glow, photorealistic depth) */}
          <ambientLight intensity={1.35} />

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

          {/* 360-DEGREE ROTATION CONTROLS (Smooth inertia damping, locked pan/zoom) */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableDamping={true}
            dampingFactor={0.07}
            rotateSpeed={0.85}
            minPolarAngle={Math.PI / 2 - 0.28}
            maxPolarAngle={Math.PI / 2 + 0.22}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

// Pre-load the GLB model in browser cache for instant startup
useGLTF.preload("/images/model.glb");
