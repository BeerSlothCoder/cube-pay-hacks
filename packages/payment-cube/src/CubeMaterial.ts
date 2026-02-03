import * as THREE from "three";

/**
 * Configuration for payment cube material
 */
export interface CubeMaterialConfig {
  color?: string;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}

/**
 * Default material configuration for payment cubes
 * Metallic blue with emissive glow
 */
export const DEFAULT_CUBE_MATERIAL_CONFIG: CubeMaterialConfig = {
  color: "#0066cc",
  metalness: 0.8,
  roughness: 0.2,
  emissive: "#0044aa",
  emissiveIntensity: 0.3,
};

/**
 * Creates a metallic blue material for payment cubes
 */
export class CubeMaterial {
  private material: THREE.MeshStandardMaterial;

  constructor(config: CubeMaterialConfig = {}) {
    const finalConfig = { ...DEFAULT_CUBE_MATERIAL_CONFIG, ...config };

    this.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(finalConfig.color!),
      metalness: finalConfig.metalness!,
      roughness: finalConfig.roughness!,
      emissive: new THREE.Color(finalConfig.emissive!),
      emissiveIntensity: finalConfig.emissiveIntensity!,
    });
  }

  /**
   * Get the Three.js material instance
   */
  getMaterial(): THREE.MeshStandardMaterial {
    return this.material;
  }

  /**
   * Update the material color
   */
  setColor(color: string): void {
    this.material.color.set(color);
  }

  /**
   * Update the emissive color
   */
  setEmissive(color: string): void {
    this.material.emissive.set(color);
  }

  /**
   * Update the emissive intensity
   */
  setEmissiveIntensity(intensity: number): void {
    this.material.emissiveIntensity = intensity;
  }

  /**
   * Dispose of the material to free memory
   */
  dispose(): void {
    this.material.dispose();
  }
}

/**
 * Create materials for each face of the payment cube
 * Each face gets a different color representing a payment method
 */
export function createMultiFaceMaterials(): THREE.MeshStandardMaterial[] {
  const faceColors = [
    "#0066cc", // Face 0: Crypto QR (blue)
    "#00aa88", // Face 1: Sound Pay (teal)
    "#8800aa", // Face 2: Voice Pay (purple)
    "#aa6600", // Face 3: Virtual Card (orange)
    "#00aacc", // Face 4: ENS Payment (cyan)
    "#cc0066", // Face 5: On-Ramp (magenta)
  ];

  return faceColors.map(
    (color) =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        metalness: 0.8,
        roughness: 0.2,
        emissive: new THREE.Color(color).multiplyScalar(0.3),
        emissiveIntensity: 0.3,
      }),
  );
}

/**
 * Factory function to create a standard metallic blue material
 */
export function createPaymentCubeMaterial(
  config?: CubeMaterialConfig,
): THREE.MeshStandardMaterial {
  const finalConfig = { ...DEFAULT_CUBE_MATERIAL_CONFIG, ...config };

  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(finalConfig.color!),
    metalness: finalConfig.metalness!,
    roughness: finalConfig.roughness!,
    emissive: new THREE.Color(finalConfig.emissive!),
    emissiveIntensity: finalConfig.emissiveIntensity!,
  });
}
