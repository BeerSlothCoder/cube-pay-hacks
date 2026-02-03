import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useNearbyCubes, calculateBearing } from "../hooks/useNearbyCubes";
import { usePaymentStore } from "../stores/paymentStore";
import { gpsTo3DPosition } from "@cubepay/payment-cube";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import {
  createCubeGeometry,
  createMultiFaceMaterial,
  animateCubeRotation,
  checkCubeIntersection,
} from "@cubepay/payment-cube";
import { useFrame, useThree } from "@react-three/fiber";

interface GPSCubeRendererProps {
  userLatitude: number;
  userLongitude: number;
  radius?: number;
}

interface CubeMarkerProps {
  cube: any;
  userLat: number;
  userLon: number;
  onSelect: (cube: any) => void;
}

const CubeMarker: React.FC<CubeMarkerProps> = ({
  cube,
  userLat,
  userLon,
  onSelect,
}) => {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();

  // Calculate 3D position from GPS coordinates
  const position = gpsTo3DPosition(
    userLat,
    userLon,
    cube.latitude,
    cube.longitude,
    10, // scale factor: 1 unit = 10 meters
  );

  // Create cube with multi-face colors
  const geometry = createCubeGeometry();
  const faceColors = [
    "#00D4FF",
    "#7C3AED",
    "#3B82F6",
    "#F59E0B",
    "#64748B",
    "#64748B",
  ];
  const material = createMultiFaceMaterial(faceColors);

  // Handle click
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!meshRef.current) return;

      const intersection = checkCubeIntersection(
        event,
        camera,
        meshRef.current,
        gl.domElement,
      );

      if (intersection) {
        onSelect(cube);
      }
    };

    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [camera, gl, cube, onSelect]);

  // Animate rotation
  useFrame(() => {
    if (meshRef.current) {
      animateCubeRotation(meshRef.current);
    }
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Payment Cube */}
      <mesh ref={meshRef} geometry={geometry} material={material} scale={0.5} />

      {/* Distance label */}
      <Text
        position={[0, 1, 0]}
        fontSize={0.2}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {cube.agent_name}
      </Text>

      <Text
        position={[0, 0.7, 0]}
        fontSize={0.15}
        color="#00D4FF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {cube.distance ? `${cube.distance.toFixed(0)}m` : ""}
      </Text>
    </group>
  );
};

/**
 * GPS-based Cube Renderer
 * Displays payment cubes at their real-world GPS locations in 3D space
 */
export const GPSCubeRenderer: React.FC<GPSCubeRendererProps> = ({
  userLatitude,
  userLongitude,
  radius = 1000,
}) => {
  const { cubes, loading, error } = useNearbyCubes({
    latitude: userLatitude,
    longitude: userLongitude,
    radius,
  });
  const { selectAgent } = usePaymentStore();

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-black bg-opacity-75 px-6 py-4 rounded-lg">
          <p className="text-white text-lg">🔍 Scanning for nearby agents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-red-900 bg-opacity-75 px-6 py-4 rounded-lg border border-red-600">
          <p className="text-white text-lg">❌ Error: {error}</p>
        </div>
      </div>
    );
  }

  if (cubes.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-black bg-opacity-75 px-6 py-4 rounded-lg">
          <p className="text-white text-lg">
            📍 No agents found within {radius}m
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Try increasing the search radius
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 1.6, 0], fov: 75 }}
        gl={{ alpha: true }}
        style={{ pointerEvents: "auto" }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, 5, -10]} intensity={0.4} />

        {/* Render all nearby cubes */}
        {cubes.map((cube) => (
          <CubeMarker
            key={cube.id}
            cube={cube}
            userLat={userLatitude}
            userLon={userLongitude}
            onSelect={selectAgent}
          />
        ))}
      </Canvas>

      {/* Cube count overlay */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 px-4 py-2 rounded-lg pointer-events-none">
        <p className="text-white text-sm">
          🎲 {cubes.length} agent{cubes.length !== 1 ? "s" : ""} nearby
        </p>
      </div>

      {/* Nearest cube indicator */}
      {cubes.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-blue-900 bg-opacity-75 px-4 py-2 rounded-lg border border-blue-500 pointer-events-none">
          <p className="text-blue-300 text-xs font-semibold">NEAREST</p>
          <p className="text-white text-sm font-bold">{cubes[0].agent_name}</p>
          <p className="text-blue-400 text-xs">
            {cubes[0].distance?.toFixed(0)}m away
          </p>
        </div>
      )}
    </div>
  );
};
