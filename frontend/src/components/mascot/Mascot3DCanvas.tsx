"use client";

import React, { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

interface Mascot3DModelProps {
  onLoadSuccess?: () => void;
  onLoadError?: () => void;
}

function MascotGLBModel({ onLoadSuccess }: Mascot3DModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/mascot.glb");
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    onLoadSuccess?.();
    // Play idle animation if present in the GLB
    const idleAction = actions?.idle || actions?.Idle || Object.values(actions || {})[0];
    if (idleAction) {
      idleAction.reset().fadeIn(0.5).play();
    }
  }, [actions, onLoadSuccess]);

  useFrame((state) => {
    if (!group.current) return;
    // Gentle floating motion
    const t = state.clock.getElapsedTime();
    group.current.position.y = -1.15 + Math.sin(t * 2.5) * 0.03;
    // Slight turn toward mouse pointer
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      (state.pointer.x * Math.PI) / 8,
      0.08
    );
  });

  return (
    <primitive
      ref={group}
      object={scene}
      position={[0, -1.15, 0]}
      scale={1.8}
    />
  );
}

export default function Mascot3DCanvas({
  fallback,
}: {
  fallback?: React.ReactNode;
}) {
  const [hasModel, setHasModel] = useState<boolean | null>(null);

  // Check if /models/mascot.glb exists on the server
  useEffect(() => {
    fetch("/models/mascot.glb", { method: "HEAD" })
      .then((res) => {
        if (res.ok) {
          setHasModel(true);
        } else {
          setHasModel(false);
        }
      })
      .catch(() => {
        setHasModel(false);
      });
  }, []);

  if (hasModel === false) {
    return <>{fallback}</>;
  }

  return (
    <div style={{ width: "100%", height: "100%", pointerEvents: "none" }}>
      <Suspense fallback={fallback}>
        <Canvas
          camera={{
            position: [0, 0.1, 4.8],
            fov: 34,
          }}
          gl={{
            alpha: true,
            antialias: true,
          }}
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[3, 5, 4]} intensity={2} color="#FFF8E7" />
          <directionalLight position={[-3, 2, -2]} intensity={0.7} color="#38BDF8" />
          <MascotGLBModel onLoadSuccess={() => setHasModel(true)} />
        </Canvas>
      </Suspense>
    </div>
  );
}
