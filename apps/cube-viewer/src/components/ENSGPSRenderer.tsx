import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useThree, useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { gpsTo3DPosition } from '@cubepay/payment-cube';
import {
  createPaymentCubeGeometry,
  createMultiFaceMaterials,
  applyRotationAnimation,
  detectCubeClick,
} from '@cubepay/payment-cube';
import { useNearbyCubes, calculateBearing } from '../hooks/useNearbyCubes';
import { usePaymentStore } from '../stores/paymentStore';

interface ENSGPSRendererProps {
  userLatitude: number;
  userLongitude: number;
  radius?: number;
  showENSBadges?: boolean;
}

interface EnhancedCube {
  id: string;
  agent_name: string;
  ens_domain?: string;
  ens_verified?: boolean;
  ens_payment_enabled?: boolean;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface ENSCubeMarkerProps {
  cube: EnhancedCube;
  userLat: number;
  userLon: number;
  onSelect: (cube: EnhancedCube) => void;
  showENSBadges?: boolean;
}

/**
 * ENS-Enhanced Cube Marker with verification badges
 */
const ENSCubeMarker: React.FC<ENSCubeMarkerProps> = ({
  cube,
  userLat,
  userLon,
  onSelect,
  showENSBadges = true,
}) => {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();

  // Calculate 3D position from GPS coordinates
  const position = gpsTo3DPosition(
    userLat,
    userLon,
    cube.latitude,
    cube.longitude,
    10 // scale factor: 1 unit = 10 meters
  );

  // Create cube with multi-face colors
  const geometry = createPaymentCubeGeometry();
  const materials = createMultiFaceMaterials();

  // Determine cube color based on ENS status
  const cubeColor = cube.ens_payment_enabled ? '#FFB800' : '#1E40AF'; // Amber for ENS, Blue for normal
  const emissiveColor = cube.ens_verified ? '#22C55E' : '#FFB800'; // Green for verified, Amber for not

  // Handle click
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!meshRef.current) return;

      const intersection = detectCubeClick(
        event,
        camera,
        meshRef.current,
        gl.domElement
      );

      if (intersection) {
        onSelect(cube);
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [camera, gl, cube, onSelect]);

  // Animate rotation
  useFrame(() => {
    if (meshRef.current) {
      applyRotationAnimation(meshRef.current, { speed: 0.01 });
    }
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Payment Cube with enhanced material */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={materials}
        scale={0.5}
      >
        {/* Enhanced emissive glow for ENS-enabled cubes */}
        {cube.ens_payment_enabled && (
          <meshStandardMaterial
            emissive={emissiveColor}
            emissiveIntensity={0.5}
          />
        )}
      </mesh>

      {/* Agent Name Label */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.25}
        color={cube.ens_payment_enabled ? '#FFB800' : '#FFFFFF'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
        font="/fonts/roboto-bold.woff"
      >
        {cube.agent_name}
      </Text>

      {/* Distance Label */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.18}
        color="#00D4FF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {cube.distance ? `${cube.distance.toFixed(0)}m` : ''}
      </Text>

      {/* ENS Domain Label - Billboard ensures it always faces camera */}
      {showENSBadges && cube.ens_domain && (
        <Billboard>
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.16}
            color="#FDE047"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
            maxWidth={2}
          >
            Ξ {cube.ens_domain}
          </Text>
        </Billboard>
      )}

      {/* ENS Verification Badge */}
      {showENSBadges && cube.ens_payment_enabled && (
        <Billboard lockZ>
          {/* Verification badge sphere */}
          <mesh position={[0.6, 0.8, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color={cube.ens_verified ? '#22C55E' : '#EAB308'}
              emissive={cube.ens_verified ? '#22C55E' : '#EAB308'}
              emissiveIntensity={0.8}
            />
          </mesh>

          {/* Verification icon/symbol */}
          <Text
            position={[0.6, 0.8, 0.2]}
            fontSize={0.12}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {cube.ens_verified ? '✓' : 'Ξ'}
          </Text>
        </Billboard>
      )}

      {/* Payment Enabled Indicator */}
      {showENSBadges && cube.ens_payment_enabled && (
        <Billboard lockZ>
          <Text
            position={[-0.6, 0.8, 0]}
            fontSize={0.12}
            color="#FFB800"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
            fontWeight="bold"
          >
            PAYS
          </Text>
        </Billboard>
      )}
    </group>
  );
};

/**
 * ENS-Enhanced GPS-based Cube Renderer
 * Displays payment cubes with ENS domain information and verification status
 */
export const ENSGPSRenderer: React.FC<ENSGPSRendererProps> = ({
  userLatitude,
  userLongitude,
  radius = 1000,
  showENSBadges = true,
}) => {
  const { cubes: rawCubes, loading, error } = useNearbyCubes({
    latitude: userLatitude,
    longitude: userLongitude,
    radius,
  });
  const { selectAgent } = usePaymentStore();

  // Cast cubes to enhanced type
  const cubes = rawCubes as EnhancedCube[];

  // Statistics
  const ensEnabledCount = cubes.filter((c) => c.ens_payment_enabled).length;
  const verifiedCount = cubes.filter(
    (c) => c.ens_verified && c.ens_payment_enabled
  ).length;

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-black bg-opacity-75 px-6 py-4 rounded-lg">
          <p className="text-white text-lg">🔍 Scanning for agents...</p>
          <p className="text-gray-400 text-sm mt-2">Looking for ENS payments...</p>
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
          <p className="text-white text-lg">📍 No agents within {radius}m</p>
          <p className="text-gray-400 text-sm mt-2">
            Try increasing search radius
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
        style={{ pointerEvents: 'auto' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, 5, -10]} intensity={0.4} />

        {/* Render all nearby cubes */}
        {cubes.map((cube) => (
          <ENSCubeMarker
            key={cube.id}
            cube={cube}
            userLat={userLatitude}
            userLon={userLongitude}
            onSelect={selectAgent}
            showENSBadges={showENSBadges}
          />
        ))}
      </Canvas>

      {/* Stats Overlay */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 px-4 py-2 rounded-lg pointer-events-none">
        <p className="text-white text-sm font-bold">
          🎲 {cubes.length} agent{cubes.length !== 1 ? 's' : ''} nearby
        </p>
        {showENSBadges && ensEnabledCount > 0 && (
          <p className="text-amber-400 text-xs mt-1">
            Ξ {ensEnabledCount} accept ENS payments
            {verifiedCount > 0 && ` • ✓ ${verifiedCount} verified`}
          </p>
        )}
      </div>

      {/* Nearest Agent Card */}
      {cubes.length > 0 && (
        <div
          className={`absolute bottom-4 right-4 rounded-lg border px-4 py-2 pointer-events-none ${
            cubes[0].ens_payment_enabled
              ? 'bg-amber-950 border-amber-600'
              : 'bg-blue-900 border-blue-500'
          }`}
        >
          <p className={`text-xs font-semibold ${
            cubes[0].ens_payment_enabled ? 'text-amber-400' : 'text-blue-300'
          }`}>
            NEAREST
          </p>
          <p className="text-white text-sm font-bold">{cubes[0].agent_name}</p>
          {cubes[0].ens_domain && (
            <p className="text-amber-300 text-xs font-mono">
              Ξ {cubes[0].ens_domain}
            </p>
          )}
          <p className={`text-xs ${
            cubes[0].ens_payment_enabled ? 'text-amber-400' : 'text-blue-400'
          }`}>
            {cubes[0].distance?.toFixed(0)}m away
          </p>
        </div>
      )}

      {/* Legend */}
      {showENSBadges && ensEnabledCount > 0 && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 px-3 py-2 rounded-lg text-xs space-y-1 pointer-events-none max-w-xs">
          <p className="text-gray-300 font-semibold mb-1">Legend</p>
          <p className="text-amber-400">🟡 ENS Payment Enabled</p>
          <p className="text-green-400">✓ Verified Domain</p>
          <p className="text-blue-400">🔵 Standard Agent</p>
        </div>
      )}
    </div>
  );
};

export default ENSGPSRenderer;
