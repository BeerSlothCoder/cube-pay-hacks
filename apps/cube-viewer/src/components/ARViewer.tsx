import React, { useEffect, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import type { DeployedObject } from "@cubepay/types";
import {
  createPaymentCubeGeometry,
  createMultiFaceMaterials,
  applyRotationAnimation,
} from "@cubepay/payment-cube";
import {
  normalizeAgentType,
  isVirtualTerminal,
  getAgentTypeIcon,
} from "../utils/agentTypeMapping";

interface ARViewerProps {
  agents: DeployedObject[];
  userLatitude?: number;
  userLongitude?: number;
  radius?: number;
  onAgentSelect: (agent: DeployedObject) => void;
}

interface ScreenPositionCalculation {
  x: number;
  y: number;
  z: number;
}

/**
 * Convert screen percentage coordinates (0-100%) to 3D AR space coordinates
 *
 * This function handles the transformation from 2D screen space (percentages)
 * to 3D world space that can be rendered by Three.js
 *
 * @param screenX - Horizontal position as percentage (0-100, 0=left, 100=right)
 * @param screenY - Vertical position as percentage (0-100, 0=top, 100=bottom)
 * @param index - Agent index for slight offset to prevent exact overlap
 * @returns 3D position in AR space
 */
const convertScreenPercentToAR = (
  screenX: number,
  screenY: number,
  index: number = 0,
): ScreenPositionCalculation => {
  // Get current viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Convert percentages to pixels
  const pixelX = (screenX / 100) * viewportWidth;
  const pixelY = (screenY / 100) * viewportHeight;

  // Convert pixel coordinates to normalized device coordinates (NDC)
  // NDC range: -1 (left/top) to 1 (right/bottom)
  const ndcX = (pixelX / viewportWidth) * 2 - 1;
  const ndcY = -(pixelY / viewportHeight) * 2 + 1; // Flip Y axis

  // Convert NDC to 3D AR space
  // Assumes camera is at origin looking down Z axis
  // Adjust these parameters based on camera setup
  const distance = 10; // Distance from camera
  const vFOV = (45 * Math.PI) / 180; // Vertical field of view
  const height = 2 * Math.tan(vFOV / 2) * distance;
  const width = height * (viewportWidth / viewportHeight);

  const x = (ndcX * width) / 2;
  const y = (ndcY * height) / 2;
  const z = -distance;

  // Add small offset per agent to prevent exact overlap
  const offset = index * 0.05;

  return {
    x: x + offset,
    y: y + offset,
    z: z - offset,
  };
};

/**
 * Calculate 3D position from GPS coordinates
 * Using simplified bearing and distance calculation
 */
const gpsTo3DPosition = (
  userLat: number,
  userLon: number,
  targetLat: number,
  targetLon: number,
  scaleFactor: number = 10,
) => {
  // Calculate distance in degrees (approximate)
  const deltaLat = targetLat - userLat;
  const deltaLon =
    (targetLon - userLon) * Math.cos((targetLat * Math.PI) / 180);

  // Convert to rough meters (1 degree ≈ 111km at equator)
  const distance =
    Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon) * 111000;

  // Calculate bearing
  const bearing =
    Math.atan2(
      (targetLon - userLon) * Math.cos((targetLat * Math.PI) / 180),
      targetLat - userLat,
    ) *
    (180 / Math.PI);

  const bearingRad = (bearing * Math.PI) / 180;
  const scaledDistance = Math.min(distance / scaleFactor, 15);

  return {
    x: Math.sin(bearingRad) * scaledDistance,
    y: 0,
    z: -Math.cos(bearingRad) * scaledDistance,
  };
};

interface AgentMarkerProps {
  agent: DeployedObject;
  position: ScreenPositionCalculation;
  index: number;
  onSelect: (agent: DeployedObject) => void;
}

/**
 * Agent marker component with dual positioning support
 */
const AgentMarker: React.FC<AgentMarkerProps> = ({
  agent,
  position,
  index,
  onSelect,
}) => {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();

  const geometry = createPaymentCubeGeometry();
  const materials = createMultiFaceMaterials();

  // Handle click on agent
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
  });

  const positioningModeBadge =
    agent.positioning_mode === "screen" ? "SCREEN" : "GPS";
  const badgeColor =
    agent.positioning_mode === "screen" ? "#3b82f6" : "#10b981";

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Payment Cube */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={materials}
        scale={0.5}
      />

      {/* Agent Name Label */}
      <Text
        position={[0, 1, 0]}
        fontSize={0.2}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {agent.agent_name || "Unknown Agent"}
      </Text>

      {/* Positioning Mode Badge */}
      <mesh position={[0, -0.5, 0]}>
        <planeGeometry args={[0.8, 0.3]} />
        <meshBasicMaterial
          color={badgeColor}
          transparent
          opacity={0.8}
          sRGBColor
        />
      </mesh>

      <Text
        position={[0, -0.5, 0.01]}
        fontSize={0.1}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        {positioningModeBadge}
      </Text>
    </group>
  );
};

/**
 * AR Viewer with Dual Positioning System
 * Supports both GPS-based (physical world) and screen-based (overlay) agent positioning
 */
export const ARViewer: React.FC<ARViewerProps> = ({
  agents,
  userLatitude = 34.0522,
  userLongitude = -118.2437,
  radius = 1000,
  onAgentSelect,
}) => {
  const [displayAgents, setDisplayAgents] = useState<
    (DeployedObject & { position: ScreenPositionCalculation; index: number })[]
  >([]);
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Process agents and calculate their positions
  useMemo(() => {
    const processed = agents
      .map((agent, index) => {
        // Backward compatibility: normalize agent_type
        // Handles legacy "home_security" → "Virtual Terminal" conversion
        // Also handles string "null" from database
        const normalizedAgent = {
          ...agent,
          agent_type:
            normalizeAgentType(agent.agent_type || null) || agent.agent_type,
        };

        let position: ScreenPositionCalculation;

        if (normalizedAgent.positioning_mode === "screen") {
          // Screen positioning - convert screen percentages to 3D AR space
          if (
            normalizedAgent.screen_position_x !== undefined &&
            normalizedAgent.screen_position_y !== undefined
          ) {
            console.log(
              `📍 Rendering screen-positioned agent: ${normalizedAgent.agent_name} at (${normalizedAgent.screen_position_x}%, ${normalizedAgent.screen_position_y}%)`,
            );
            position = convertScreenPercentToAR(
              normalizedAgent.screen_position_x,
              normalizedAgent.screen_position_y,
              index,
            );
          } else {
            // Fallback if screen coordinates are missing
            console.warn(
              `⚠️ Screen mode but missing coordinates for ${normalizedAgent.agent_name}, using fallback position`,
            );
            position = convertScreenPercentToAR(50, 50, index);
          }
        } else {
          // GPS positioning (default) - convert GPS coords to 3D space
          if (
            normalizedAgent.latitude !== undefined &&
            normalizedAgent.longitude !== undefined
          ) {
            console.log(
              `📍 Rendering GPS-positioned agent: ${normalizedAgent.agent_name} at (${normalizedAgent.latitude}, ${normalizedAgent.longitude})`,
            );
            position = gpsTo3DPosition(
              userLatitude,
              userLongitude,
              normalizedAgent.latitude,
              normalizedAgent.longitude,
              10,
            );
          } else {
            // Fallback - place at center
            console.warn(
              `⚠️ GPS mode but missing coordinates for ${normalizedAgent.agent_name}, using center position`,
            );
            position = { x: 0, y: 0, z: -10 };
          }
        }

        return { ...normalizedAgent, position, index };
      })
      .slice(0, 20); // Limit to 20 agents for performance

    setDisplayAgents(processed);
  }, [agents, userLatitude, userLongitude]);

  // Handle window resize
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        console.log(
          "📐 Viewport resized, recalculating screen-positioned agents",
        );
        setViewportSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });

        // Trigger re-calculation by updating display agents
        setDisplayAgents((prevAgents) => [...prevAgents]);
      }, 300);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  if (agents.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-black bg-opacity-75 px-6 py-4 rounded-lg">
          <p className="text-white text-lg">📍 No agents available</p>
        </div>
      </div>
    );
  }

  const screenPositionedCount = displayAgents.filter(
    (a) => a.positioning_mode === "screen",
  ).length;
  const gpsPositionedCount = displayAgents.filter(
    (a) => !a.positioning_mode || a.positioning_mode === "gps",
  ).length;

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

        {/* Render all agents with their respective positioning */}
        {displayAgents.map((agent, idx) => (
          <AgentMarker
            key={agent.id}
            agent={agent}
            position={agent.position}
            index={idx}
            onSelect={onAgentSelect}
          />
        ))}
      </Canvas>

      {/* Statistics overlay */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 px-4 py-3 rounded-lg pointer-events-none space-y-1">
        <p className="text-white text-sm font-semibold">Agent Statistics</p>
        <p className="text-blue-400 text-xs">
          🖥️ Screen: {screenPositionedCount} agent
          {screenPositionedCount !== 1 ? "s" : ""}
        </p>
        <p className="text-green-400 text-xs">
          📍 GPS: {gpsPositionedCount} agent
          {gpsPositionedCount !== 1 ? "s" : ""}
        </p>
        <p className="text-gray-400 text-xs">
          Total: {displayAgents.length} agent
          {displayAgents.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Viewport info (useful for debugging) */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 px-3 py-2 rounded text-xs text-gray-400 pointer-events-none">
        <p>
          {viewportSize.width}x{viewportSize.height}
        </p>
      </div>
    </div>
  );
};

export { convertScreenPercentToAR, gpsTo3DPosition };
