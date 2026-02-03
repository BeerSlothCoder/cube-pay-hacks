import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { theme } from "./theme";

export interface CubeCanvasProps {
  width?: number;
  height?: number;
  enableRotation?: boolean;
  enableInteraction?: boolean;
  onCubeClick?: (faceIndex: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const CubeCanvas: React.FC<CubeCanvasProps> = ({
  width = 400,
  height = 400,
  enableRotation = true,
  enableInteraction = true,
  onCubeClick,
  className,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cubeRef = useRef<THREE.Mesh | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.colors.bgBlack);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Cube geometry with multi-colored faces
    const geometry = new THREE.BoxGeometry(2, 2, 2);

    // Create different materials for each face
    const materials = [
      new THREE.MeshStandardMaterial({
        color: theme.colors.faceBlue,
        metalness: 0.8,
        roughness: 0.2,
        emissive: theme.colors.faceBlue,
        emissiveIntensity: 0.3,
      }),
      new THREE.MeshStandardMaterial({
        color: theme.colors.faceTeal,
        metalness: 0.8,
        roughness: 0.2,
        emissive: theme.colors.faceTeal,
        emissiveIntensity: 0.3,
      }),
      new THREE.MeshStandardMaterial({
        color: theme.colors.facePurple,
        metalness: 0.8,
        roughness: 0.2,
        emissive: theme.colors.facePurple,
        emissiveIntensity: 0.3,
      }),
      new THREE.MeshStandardMaterial({
        color: theme.colors.faceOrange,
        metalness: 0.8,
        roughness: 0.2,
        emissive: theme.colors.faceOrange,
        emissiveIntensity: 0.3,
      }),
      new THREE.MeshStandardMaterial({
        color: theme.colors.faceCyan,
        metalness: 0.8,
        roughness: 0.2,
        emissive: theme.colors.faceCyan,
        emissiveIntensity: 0.3,
      }),
      new THREE.MeshStandardMaterial({
        color: theme.colors.faceMagenta,
        metalness: 0.8,
        roughness: 0.2,
        emissive: theme.colors.faceMagenta,
        emissiveIntensity: 0.3,
      }),
    ];

    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);
    cubeRef.current = cube;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Animation loop
    const animate = () => {
      if (enableRotation && cubeRef.current) {
        cubeRef.current.rotation.x += 0.005;
        cubeRef.current.rotation.y += 0.01;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Interaction
    if (enableInteraction && onCubeClick) {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const handleClick = (event: MouseEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(cube);

        if (intersects.length > 0 && intersects[0].faceIndex !== undefined) {
          const faceIndex = Math.floor(intersects[0].faceIndex / 2);
          onCubeClick(faceIndex);
        }
      };

      canvasRef.current.addEventListener("click", handleClick);

      return () => {
        canvasRef.current?.removeEventListener("click", handleClick);
      };
    }

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      geometry.dispose();
      materials.forEach((mat) => mat.dispose());
      renderer.dispose();
    };
  }, [width, height, enableRotation, enableInteraction, onCubeClick]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.md,
        ...style,
      }}
    />
  );
};
