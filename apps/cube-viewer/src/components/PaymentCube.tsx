import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { DeployedObject } from "@cubepay/types";
import { usePaymentStore } from "../stores/paymentStore";
import type { PaymentFace } from "../stores/paymentStore";
import * as THREE from "three";
import {
  createCubeGeometry,
  createCubeMaterial,
  createMultiFaceMaterial,
  animateCubeRotation,
  animateHoverEffect,
  animateClickEffect,
  createARCamera,
  gpsTo3DPosition,
  setupRaycaster,
  checkCubeIntersection,
} from "@cubepay/payment-cube";

interface CubeProps {
  agent: DeployedObject;
}

const faces: Array<{
  face: PaymentFace;
  label: string;
  color: string;
}> = [
  { face: "crypto_qr", label: "Crypto QR", color: "#00D4FF" },
  { face: "virtual_card", label: "Virtual Card", color: "#7C3AED" },
  { face: "on_off_ramp", label: "On/Off Ramp", color: "#3B82F6" },
  { face: "ens_payment", label: "ENS Pay", color: "#F59E0B" },
  { face: "sound_pay", label: "Sound Pay", color: "#64748B" },
  { face: "voice_pay", label: "Voice Pay", color: "#64748B" },
];

function RotatingCube({ agent }: CubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, gl, raycaster, pointer } = useThree();
  const { selectPaymentFace } = usePaymentStore();
  const [hoveredFace, setHoveredFace] = useState<number | null>(null);

  // Initialize cube geometry and multi-face material
  const geometry = createCubeGeometry();
  const faceColors = faces.map((f) => f.color);
  const material = createMultiFaceMaterial(faceColors);

  // Handle click events
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!meshRef.current) return;

      const intersection = checkCubeIntersection(
        event,
        camera,
        meshRef.current,
        gl.domElement,
      );

      if (intersection && intersection.faceIndex !== undefined) {
        const face = faces[intersection.faceIndex];
        selectPaymentFace(face.face);

        // Animate click effect
        animateClickEffect(meshRef.current);
      }
    };

    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [camera, gl, selectPaymentFace]);

  // Handle hover effects
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!meshRef.current) return;

      const intersection = checkCubeIntersection(
        event,
        camera,
        meshRef.current,
        gl.domElement,
      );

      if (intersection && intersection.faceIndex !== undefined) {
        setHoveredFace(intersection.faceIndex);
        document.body.style.cursor = "pointer";
      } else {
        setHoveredFace(null);
        document.body.style.cursor = "default";
      }
    };

    gl.domElement.addEventListener("pointermove", handlePointerMove);
    return () =>
      gl.domElement.removeEventListener("pointermove", handlePointerMove);
  }, [camera, gl]);

  // Animate rotation
  useFrame((state) => {
    if (meshRef.current) {
      animateCubeRotation(meshRef.current);

      // Apply hover effect if face is hovered
      if (hoveredFace !== null) {
        animateHoverEffect(meshRef.current);
      }
    }
  });

  return (
    <group>
      {/* Main Cube with multi-face colors */}
      <mesh ref={meshRef} geometry={geometry} material={material} />

      {/* Face Labels */}
      {faces.map((face, index) => {
        const facePositions: [number, number, number][] = [
          [0, 0, 0.51], // Front
          [0, 0, -0.51], // Back
          [0.51, 0, 0], // Right
          [-0.51, 0, 0], // Left
          [0, 0.51, 0], // Top
          [0, -0.51, 0], // Bottom
        ];

        const faceRotations: [number, number, number][] = [
          [0, 0, 0], // Front
          [0, Math.PI, 0], // Back
          [0, Math.PI / 2, 0], // Right
          [0, -Math.PI / 2, 0], // Left
          [-Math.PI / 2, 0, 0], // Top
          [Math.PI / 2, 0, 0], // Bottom
        ];

        return (
          <group
            key={face.face}
            position={facePositions[index]}
            rotation={faceRotations[index]}
          >
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.08}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
              maxWidth={0.8}
            >
              {face.label}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

export const PaymentCube: React.FC<CubeProps> = ({ agent }) => {
  const { deselectAgent } = usePaymentStore();

  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80"
      style={{ zIndex: 20 }}
    >
      {/* Close Button */}
      <button
        onClick={deselectAgent}
        className="absolute top-2 right-2 w-8 h-8 bg-cubepay-bg bg-opacity-80 rounded-full text-white flex items-center justify-center z-10"
      >
        ✕
      </button>

      {/* Agent Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-cubepay-bg bg-opacity-90 p-3 text-center">
        <p className="text-cubepay-text font-semibold">{agent.agent_name}</p>
        <p className="text-cubepay-text-secondary text-sm">
          Select a payment method
        </p>
      </div>

      {/* 3D Cube */}
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <RotatingCube agent={agent} />
      </Canvas>
    </div>
  );
};
