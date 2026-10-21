
"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import type { ReactNode, PointerEvent as ReactPointerEvent } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface MascotGLBModelProps {
  onLoadSuccess?: () => void;
}

function MascotGLBModel({ onLoadSuccess }: MascotGLBModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/images/model.glb");

  // Improve material rendering and enable shadows.
  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      child.castShadow = true;
      child.receiveShadow = true;

      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materials.forEach((material) => {
        if (material instanceof THREE.MeshStandardMaterial) {
          material.side = THREE.DoubleSide;
          material.roughness = THREE.MathUtils.clamp(
            material.roughness ?? 0.5,
            0.3,
            0.85
          );
          material.metalness = THREE.MathUtils.clamp(
            material.metalness ?? 0.1,
            0,
            0.35
          );
          material.needsUpdate = true;
        }
      });
    });

    onLoadSuccess?.();
  }, [scene, onLoadSuccess]);

  // Subtle breathing and natural floating animation.
  useFrame((state) => {
    const model = group.current;
    if (!model) return;

    const t = state.clock.getElapsedTime();
    const breath = Math.sin(t * 2.2);
    const baseScale = 0.92;

    model.scale.y = baseScale * (1 + breath * 0.014);
    model.scale.x = baseScale * (1 - breath * 0.007);
    model.scale.z = baseScale * (1 + breath * 0.01);

    model.position.y = -0.06 + Math.sin(t * 1.8) * 0.028;
    model.position.x = Math.sin(t * 0.9) * 0.015;

    // Subtle posture movement — horizontal pointer tracking only.
    const targetRoll = Math.sin(t * 0.9) * 0.012;
    const targetRotY = THREE.MathUtils.clamp(
      (state.pointer.x * Math.PI) / 6,
      -Math.PI / 5,
      Math.PI / 5
    );

    model.rotation.z = THREE.MathUtils.lerp(
      model.rotation.z,
      targetRoll,
      0.08
    );
    model.rotation.y = THREE.MathUtils.lerp(
      model.rotation.y,
      targetRotY,
      0.07
    );
    // Gradually return X rotation to 0 (no vertical tilt tracking)
    model.rotation.x = THREE.MathUtils.lerp(model.rotation.x, 0, 0.05);
  });

  return (
    <group ref={group} position={[0, -0.06, 0]} scale={0.92}>
      <primitive object={scene} />
    </group>
  );
}

interface Mascot3DCanvasProps {
  fallback?: ReactNode;
  onModelClick?: () => void;
}

export default function Mascot3DCanvas({
  fallback,
  onModelClick,
}: Mascot3DCanvasProps) {
  const [modelAvailable, setModelAvailable] = useState<boolean | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasMovedRef = useRef(false);

  // Check whether the 3D model is available.
  useEffect(() => {
    let mounted = true;

    fetch("/images/model.glb", { method: "HEAD" })
      .then((response) => {
        if (mounted) setModelAvailable(response.ok);
      })
      .catch(() => {
        if (mounted) setModelAvailable(false);
      });

    const handleWindowPointerUp = () => {
      setIsRotating(false);
      dragStartRef.current = null;
    };

    window.addEventListener("pointerup", handleWindowPointerUp);

    return () => {
      mounted = false;
      window.removeEventListener("pointerup", handleWindowPointerUp);
    };
  }, []);

  // Preserve the fallback image if the GLB is unavailable.
  if (modelAvailable === false) {
    return <>{fallback}</>;
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
    hasMovedRef.current = false;
    setIsRotating(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start) return;

    const dx = Math.abs(event.clientX - start.x);
    const dy = Math.abs(event.clientY - start.y);

    if (dx > 5 || dy > 5) {
      hasMovedRef.current = true;
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;

    setIsRotating(false);

    if (start && !hasMovedRef.current) {
      const dx = Math.abs(event.clientX - start.x);
      const dy = Math.abs(event.clientY - start.y);

      if (dx <= 6 && dy <= 6) {
        onModelClick?.();
      }
    }

    dragStartRef.current = null;
    hasMovedRef.current = false;
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        setIsRotating(false);
        dragStartRef.current = null;
        hasMovedRef.current = false;
      }}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        cursor: isRotating ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "pan-y",
      }}
      title="Spin Padayappa • Click to chat"
    >
      <Suspense fallback={fallback}>
        <Canvas
          shadows
          camera={{ position: [0, 0, 4.3], fov: 34 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          dpr={[1, 1.5]}
          style={{ width: "100%", height: "100%" }}
        >
          <ambientLight intensity={1.35} />

          <directionalLight
            position={[3, 4.5, 3.5]}
            intensity={2.2}
            color="#FFFDF7"
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
            shadow-camera-near={1}
            shadow-camera-far={10}
            shadow-bias={-0.0005}
          />

          <directionalLight
            position={[-2.8, 1.8, 2.2]}
            intensity={1}
            color="#FDE68A"
          />

          <directionalLight
            position={[0, 3.2, -3.2]}
            intensity={1.4}
            color="#38BDF8"
          />

          <MascotGLBModel
            onLoadSuccess={() => setModelAvailable(true)}
          />

          <ContactShadows
            position={[0, -0.96, 0]}
            opacity={0.78}
            scale={2.2}
            blur={1.6}
            far={1.6}
            resolution={256}
            color="#000000"
          />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableDamping
            dampingFactor={0.07}
            rotateSpeed={0.85}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

// Preload the model for faster startup.
useGLTF.preload("/images/model.glb");
