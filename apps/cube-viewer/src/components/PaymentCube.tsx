import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import type { DeployedObject } from '@cubepay/types';
import { usePaymentStore } from '../stores/paymentStore';
import type { PaymentFace } from '../stores/paymentStore';
import * as THREE from 'three';

interface CubeProps {
  agent: DeployedObject;
}

const faces: Array<{ 
  face: PaymentFace; 
  label: string; 
  color: string; 
  position: [number, number, number]; 
  rotation: [number, number, number] 
}> = [
  { face: 'crypto_qr', label: 'Crypto QR', color: '#00D4FF', position: [0, 0, 0.51], rotation: [0, 0, 0] },
  { face: 'virtual_card', label: 'Virtual Card', color: '#7C3AED', position: [0, 0, -0.51], rotation: [0, Math.PI, 0] },
  { face: 'on_off_ramp', label: 'On/Off Ramp', color: '#3B82F6', position: [0.51, 0, 0], rotation: [0, Math.PI / 2, 0] },
  { face: 'ens_payment', label: 'ENS Pay', color: '#F59E0B', position: [-0.51, 0, 0], rotation: [0, -Math.PI / 2, 0] },
  { face: 'sound_pay', label: 'Sound Pay', color: '#64748B', position: [0, 0.51, 0], rotation: [-Math.PI / 2, 0, 0] },
  { face: 'voice_pay', label: 'Voice Pay', color: '#64748B', position: [0, -0.51, 0], rotation: [Math.PI / 2, 0, 0] },
];

function RotatingCube({ agent }: CubeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { selectPaymentFace } = usePaymentStore();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main Cube Body - Metallic Blue */}
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#1E40AF" 
          metalness={0.8} 
          roughness={0.2}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Face Panels */}
      {faces.map(({ face, label, color, position, rotation }) => (
        <group key={face} position={position} rotation={rotation}>
          <mesh
            onClick={() => selectPaymentFace(face)}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'default';
            }}
          >
            <planeGeometry args={[0.9, 0.9]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.08}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.8}
          >
            {label}
          </Text>
        </group>
      ))}
    </group>
  );
}

export const PaymentCube: React.FC<CubeProps> = ({ agent }) => {
  const { deselectAgent } = usePaymentStore();

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80" style={{ zIndex: 20 }}>
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
        <p className="text-cubepay-text-secondary text-sm">Select a payment method</p>
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
