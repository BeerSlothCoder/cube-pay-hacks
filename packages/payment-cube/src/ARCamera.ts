import * as THREE from "three";

/**
 * AR Camera configuration
 */
export interface ARCameraConfig {
  fov?: number;
  near?: number;
  far?: number;
  enableDeviceOrientation?: boolean;
}

/**
 * Default AR camera configuration
 */
export const DEFAULT_AR_CAMERA_CONFIG: ARCameraConfig = {
  fov: 75,
  near: 0.1,
  far: 1000,
  enableDeviceOrientation: true,
};

/**
 * AR Camera with device orientation tracking
 */
export class ARCamera {
  private camera: THREE.PerspectiveCamera;
  private config: ARCameraConfig;
  private orientationPermissionGranted: boolean = false;

  constructor(
    aspect: number = window.innerWidth / window.innerHeight,
    config: Partial<ARCameraConfig> = {},
  ) {
    this.config = { ...DEFAULT_AR_CAMERA_CONFIG, ...config };

    this.camera = new THREE.PerspectiveCamera(
      this.config.fov!,
      aspect,
      this.config.near!,
      this.config.far!,
    );

    // Default camera position
    this.camera.position.set(0, 1.6, 5); // Eye level, 5 units back

    if (this.config.enableDeviceOrientation) {
      this.initDeviceOrientation();
    }
  }

  /**
   * Get the Three.js camera instance
   */
  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  /**
   * Initialize device orientation tracking
   */
  private async initDeviceOrientation(): Promise<void> {
    if (typeof DeviceOrientationEvent === "undefined") {
      console.warn("DeviceOrientationEvent not supported");
      return;
    }

    // Request permission on iOS 13+
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const permission = await (
          DeviceOrientationEvent as any
        ).requestPermission();
        this.orientationPermissionGranted = permission === "granted";
      } catch (error) {
        console.error("Error requesting device orientation permission:", error);
      }
    } else {
      this.orientationPermissionGranted = true;
    }

    if (this.orientationPermissionGranted) {
      window.addEventListener(
        "deviceorientation",
        this.handleOrientation.bind(this),
      );
    }
  }

  /**
   * Handle device orientation events
   */
  private handleOrientation(event: DeviceOrientationEvent): void {
    if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
      const alpha = THREE.MathUtils.degToRad(event.alpha); // Z axis rotation
      const beta = THREE.MathUtils.degToRad(event.beta); // X axis rotation
      const gamma = THREE.MathUtils.degToRad(event.gamma); // Y axis rotation

      // Apply device orientation to camera
      this.camera.rotation.set(beta, alpha, -gamma, "YXZ");
    }
  }

  /**
   * Update camera aspect ratio (call on window resize)
   */
  updateAspect(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Set camera position
   */
  setPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
  }

  /**
   * Look at a specific point
   */
  lookAt(x: number, y: number, z: number): void {
    this.camera.lookAt(x, y, z);
  }

  /**
   * Request device orientation permission (for iOS 13+)
   */
  async requestOrientationPermission(): Promise<boolean> {
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const permission = await (
          DeviceOrientationEvent as any
        ).requestPermission();
        this.orientationPermissionGranted = permission === "granted";

        if (this.orientationPermissionGranted) {
          window.addEventListener(
            "deviceorientation",
            this.handleOrientation.bind(this),
          );
        }

        return this.orientationPermissionGranted;
      } catch (error) {
        console.error("Error requesting device orientation permission:", error);
        return false;
      }
    }
    return true; // Already granted or not needed
  }

  /**
   * Dispose of the camera and remove event listeners
   */
  dispose(): void {
    window.removeEventListener(
      "deviceorientation",
      this.handleOrientation.bind(this),
    );
  }
}

/**
 * Create a standard AR camera with device orientation
 */
export function createARCamera(
  aspect?: number,
  config?: Partial<ARCameraConfig>,
): THREE.PerspectiveCamera {
  const arCamera = new ARCamera(aspect, config);
  return arCamera.getCamera();
}
