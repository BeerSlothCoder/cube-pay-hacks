/**
 * Enhanced3DAgent Component
 * Handles 3D model rendering with proper agent type detection
 * Provides appropriate visual styling based on agent type
 */

import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import type { DeployedObject } from "@cubepay/types";
import {
  createPaymentCubeGeometry,
  createMultiFaceMaterials,
} from "@cubepay/payment-cube";
import {
  isVirtualTerminal,
  getAgentTypeBadge,
  getAgentTypeIcon,
} from "../utils/agentTypeMapping";

interface Enhanced3DAgentProps {
  agent: DeployedObject & { position: { x: number; y: number; z: number } };
  index: number;
  onSelect: (agent: DeployedObject) => void;
}

/**
 * Enhanced 3D agent marker with proper type-based rendering
 */
export const Enhanced3DAgent: React.FC<Enhanced3DAgentProps> = ({
  agent,
  index,
  onSelect,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowMeshRef = useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();

  const geometry = createPaymentCubeGeometry();
  const materials = createMultiFaceMaterials();

  // Determine glow color based on agent type
  // Virtual Terminal agents use blue glow (#0066ff)
  // Other agents use red glow (#dc143c) by default
  const isVirtual = isVirtualTerminal(agent.agent_type);
  const glowColor = isVirtual ? 0x0066ff : 0xdc143c; // Blue for ARTM, Red for others
  const glowIntensity = isVirtual ? 1.5 : 1.0;

  // Handle clicks on agent
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!meshRef.current) return;

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(meshRef.current);

      if (intersects.length > 0) {
        onSelect(agent);
      }
    };

    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [camera, gl, agent, onSelect]);

  // Animate rotation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.01;
    }

    // Animate glow pulsing
    if (glowMeshRef.current) {
      const material = glowMeshRef.current.material as THREE.MeshBasicMaterial;
      const pulse = Math.sin(Date.now() * 0.001) * 0.3 + 0.7;
      material.opacity = pulse;
    }
  });

  // Get badge for agent type
  const badge = getAgentTypeBadge(agent.agent_type);
  const icon = getAgentTypeIcon(agent.agent_type);

  return (
    <group position={[agent.position.x, agent.position.y, agent.position.z]}>
      {/* Glow effect around cube (inner) */}
      <mesh ref={glowMeshRef} geometry={geometry} scale={0.52}>
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>

      {/* Main Payment Cube */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={materials}
        scale={0.5}
      />

      {/* Agent Name Label */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.25}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {agent.agent_name || "Unknown Agent"}
      </Text>

      {/* Agent Type Badge (e.g., "ARTM", "POS") */}
      {badge && (
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.12}
          color={isVirtual ? "#0066ff" : "#dc143c"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {badge}
        </Text>
      )}

      {/* 3D Model Detection Badge */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.1}
        color={agent.model_url ? "#22c55e" : "#ef4444"}
        anchorX="center"
        anchorY="middle"
      >
        {agent.model_url ? "✓ 3D Model" : "📦 Cube"}
      </Text>

      {/* Virtual Terminal Indicator */}
      {isVirtual && (
        <mesh position={[0.35, 0.35, 0.35]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color={0x0066ff}
            emissive={0x0066ff}
            emissiveIntensity={0.8}
          />
        </mesh>
      )}
    </group>
  );
};

export default Enhanced3DAgent;
