import * as THREE from "three";

/**
 * Configuration for payment cube faces
 */
export interface CubeFaceConfig {
  index: number;
  label: string;
  type: string;
  icon: string;
  color: string;
}

/**
 * Standard payment cube face configurations
 */
export const CUBE_FACE_CONFIGS: CubeFaceConfig[] = [
  {
    index: 0,
    label: "Crypto QR",
    type: "qr-payment",
    icon: "📱",
    color: "#0066cc",
  },
  {
    index: 1,
    label: "Sound Pay",
    type: "audio-payment",
    icon: "🔊",
    color: "#00aa88",
  },
  {
    index: 2,
    label: "Voice Pay",
    type: "voice-payment",
    icon: "🎤",
    color: "#8800aa",
  },
  {
    index: 3,
    label: "Virtual Card",
    type: "card-payment",
    icon: "💳",
    color: "#aa6600",
  },
  {
    index: 4,
    label: "ENS Payment",
    type: "ens-payment",
    icon: "🌐",
    color: "#00aacc",
  },
  {
    index: 5,
    label: "On-Ramp",
    type: "fiat-onramp",
    icon: "🏦",
    color: "#cc0066",
  },
];

/**
 * Creates a standard payment cube geometry
 * 1x1x1 box with 6 faces for different payment methods
 */
export class CubeGeometry {
  private geometry: THREE.BoxGeometry;

  constructor(
    public width: number = 1,
    public height: number = 1,
    public depth: number = 1,
  ) {
    this.geometry = new THREE.BoxGeometry(width, height, depth);
  }

  /**
   * Get the Three.js BoxGeometry instance
   */
  getGeometry(): THREE.BoxGeometry {
    return this.geometry;
  }

  /**
   * Create a mesh with the cube geometry and provided material
   */
  createMesh(material: THREE.Material | THREE.Material[]): THREE.Mesh {
    return new THREE.Mesh(this.geometry, material);
  }

  /**
   * Dispose of the geometry to free memory
   */
  dispose(): void {
    this.geometry.dispose();
  }
}

/**
 * Factory function to create a standard payment cube geometry
 */
export function createPaymentCubeGeometry(): THREE.BoxGeometry {
  return new THREE.BoxGeometry(1, 1, 1);
}
