import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import {
  createCubeGeometry,
  createMultiFaceMaterial,
  animateCubeRotation,
} from "@cubepay/payment-cube";

interface CubePreviewProps {
  className?: string;
  autoRotate?: boolean;
  showLabels?: boolean;
}

const PaymentCubeMesh: React.FC<{ autoRotate: boolean }> = ({ autoRotate }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create cube with multi-face colors
  const geometry = createCubeGeometry();
  const faceColors = [
    "#00D4FF", // Front: Crypto QR (Cyan)
    "#7C3AED", // Back: Virtual Card (Purple)
    "#3B82F6", // Right: On/Off Ramp (Blue)
    "#F59E0B", // Left: ENS Payment (Orange)
    "#64748B", // Top: Sound Pay (Gray)
    "#64748B", // Bottom: Voice Pay (Gray)
  ];
  const material = createMultiFaceMaterial(faceColors);

  useFrame(() => {
    if (meshRef.current && autoRotate) {
      animateCubeRotation(meshRef.current);
    }
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
};

/**
 * CubePreview - 3D preview of payment cube for deployment
 *
 * Shows the metallic blue payment cube with 6 colored faces
 * Supports auto-rotation and orbit controls for inspection
 * Used in Deployment Hub to preview cube before deployment
 */
export const CubePreview: React.FC<CubePreviewProps> = ({
  className = "",
  autoRotate = true,
  showLabels = false,
}) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, 5]} intensity={0.5} />

        {/* Payment Cube */}
        <PaymentCubeMesh autoRotate={autoRotate} />

        {/* Environment for reflections */}
        <Environment preset="city" />

        {/* Interactive camera controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={1.5}
          maxDistance={5}
          autoRotate={false}
        />
      </Canvas>

      {/* Legend */}
      {showLabels && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 p-3 rounded-lg text-xs text-cream">
          <div className="font-semibold mb-2">Payment Faces:</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: "#00D4FF" }}
              ></div>
              <span>Crypto QR</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: "#7C3AED" }}
              ></div>
              <span>Virtual Card</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: "#3B82F6" }}
              ></div>
              <span>On/Off Ramp</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: "#F59E0B" }}
              ></div>
              <span>ENS Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: "#64748B" }}
              ></div>
              <span>Sound/Voice Pay</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
