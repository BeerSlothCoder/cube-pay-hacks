import * as THREE from "three";

/**
 * Raycasting result with cube information
 */
export interface RaycastResult {
  intersected: boolean;
  object?: THREE.Object3D;
  point?: THREE.Vector3;
  distance?: number;
  faceIndex?: number;
}

/**
 * Raycaster utility for detecting cube interactions
 */
export class CubeRaycaster {
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private camera: THREE.Camera;

  constructor(camera: THREE.Camera) {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.camera = camera;
  }

  /**
   * Update mouse position from event
   */
  updateMousePosition(event: MouseEvent | Touch, element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * Cast ray and check for intersections with cubes
   */
  castRay(objects: THREE.Object3D[]): RaycastResult {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(objects, true);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      return {
        intersected: true,
        object: intersection.object,
        point: intersection.point,
        distance: intersection.distance,
        faceIndex: intersection.faceIndex,
      };
    }

    return { intersected: false };
  }

  /**
   * Get which face of the cube was clicked
   * Assumes cube is oriented with default rotation
   */
  getFaceFromIndex(faceIndex?: number): number | null {
    if (faceIndex === undefined) return null;

    // BoxGeometry has 12 triangles (2 per face)
    // Face indices: 0-1 (right), 2-3 (left), 4-5 (top), 6-7 (bottom), 8-9 (front), 10-11 (back)
    return Math.floor(faceIndex / 2);
  }

  /**
   * Get the payment method type based on face index
   */
  getPaymentMethodFromFace(faceIndex?: number): string | null {
    const face = this.getFaceFromIndex(faceIndex);
    if (face === null) return null;

    const paymentMethods = [
      "qr-payment", // Face 0
      "audio-payment", // Face 1
      "voice-payment", // Face 2
      "card-payment", // Face 3
      "ens-payment", // Face 4
      "fiat-onramp", // Face 5
    ];

    return paymentMethods[face] || null;
  }

  /**
   * Dispose of the raycaster
   */
  dispose(): void {
    // Raycaster doesn't need explicit disposal
  }
}

/**
 * Helper function to detect cube tap on mobile
 */
export function detectCubeTap(
  event: TouchEvent,
  camera: THREE.Camera,
  cubes: THREE.Object3D[],
  element: HTMLElement,
): RaycastResult {
  const raycaster = new CubeRaycaster(camera);

  if (event.touches.length > 0) {
    raycaster.updateMousePosition(event.touches[0], element);
    return raycaster.castRay(cubes);
  }

  return { intersected: false };
}

/**
 * Helper function to detect cube click on desktop
 */
export function detectCubeClick(
  event: MouseEvent,
  camera: THREE.Camera,
  cubes: THREE.Object3D[],
  element: HTMLElement,
): RaycastResult {
  const raycaster = new CubeRaycaster(camera);
  raycaster.updateMousePosition(event, element);
  return raycaster.castRay(cubes);
}
