import * as THREE from "three";

/**
 * Animation configuration for payment cubes
 */
export interface AnimationConfig {
  rotation: { x: number; y: number; z?: number };
  hoverScale: number;
  clickScale: number;
  duration: number;
}

/**
 * Default animation configuration
 */
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  rotation: { x: 0.005, y: 0.01, z: 0 },
  hoverScale: 1.2,
  clickScale: 0.9,
  duration: 200,
};

/**
 * Handles animations for payment cubes
 */
export class CubeAnimations {
  private mesh: THREE.Mesh;
  private config: AnimationConfig;
  private isHovered: boolean = false;
  private isClicked: boolean = false;
  private targetScale: THREE.Vector3;
  private currentScale: THREE.Vector3;

  constructor(mesh: THREE.Mesh, config: Partial<AnimationConfig> = {}) {
    this.mesh = mesh;
    this.config = { ...DEFAULT_ANIMATION_CONFIG, ...config };
    this.targetScale = new THREE.Vector3(1, 1, 1);
    this.currentScale = new THREE.Vector3(1, 1, 1);
  }

  /**
   * Update continuous rotation animation
   * Call this in your render loop
   */
  updateRotation(): void {
    this.mesh.rotation.x += this.config.rotation.x;
    this.mesh.rotation.y += this.config.rotation.y;
    if (this.config.rotation.z) {
      this.mesh.rotation.z += this.config.rotation.z;
    }
  }

  /**
   * Set hover state and animate scale
   */
  setHovered(hovered: boolean): void {
    this.isHovered = hovered;
    if (hovered && !this.isClicked) {
      this.targetScale.setScalar(this.config.hoverScale);
    } else if (!this.isClicked) {
      this.targetScale.setScalar(1);
    }
  }

  /**
   * Set clicked state and animate scale
   */
  setClicked(clicked: boolean): void {
    this.isClicked = clicked;
    if (clicked) {
      this.targetScale.setScalar(this.config.clickScale);
    } else if (this.isHovered) {
      this.targetScale.setScalar(this.config.hoverScale);
    } else {
      this.targetScale.setScalar(1);
    }
  }

  /**
   * Update scale animation
   * Call this in your render loop
   */
  updateScale(delta: number): void {
    // Smooth interpolation towards target scale
    const lerpFactor = Math.min(delta * 10, 1);
    this.currentScale.lerp(this.targetScale, lerpFactor);
    this.mesh.scale.copy(this.currentScale);
  }

  /**
   * Update all animations
   * Call this in your render loop
   */
  update(delta: number): void {
    this.updateRotation();
    this.updateScale(delta);
  }

  /**
   * Reset all animations to default state
   */
  reset(): void {
    this.isHovered = false;
    this.isClicked = false;
    this.targetScale.setScalar(1);
    this.currentScale.setScalar(1);
    this.mesh.scale.setScalar(1);
    this.mesh.rotation.set(0, 0, 0);
  }

  /**
   * Get current animation state
   */
  getState(): { isHovered: boolean; isClicked: boolean } {
    return {
      isHovered: this.isHovered,
      isClicked: this.isClicked,
    };
  }
}

/**
 * Apply continuous rotation to a mesh
 */
export function applyRotationAnimation(
  mesh: THREE.Mesh,
  rotationSpeed: { x: number; y: number; z?: number } = { x: 0.005, y: 0.01 },
): void {
  mesh.rotation.x += rotationSpeed.x;
  mesh.rotation.y += rotationSpeed.y;
  if (rotationSpeed.z) {
    mesh.rotation.z += rotationSpeed.z;
  }
}

/**
 * Animate scale with easing
 */
export function animateScale(
  mesh: THREE.Mesh,
  targetScale: number,
  duration: number = 200,
): Promise<void> {
  return new Promise((resolve) => {
    const startScale = mesh.scale.x;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentScale = startScale + (targetScale - startScale) * eased;

      mesh.scale.setScalar(currentScale);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };

    animate();
  });
}
