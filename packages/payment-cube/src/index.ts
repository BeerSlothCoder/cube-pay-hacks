// Geometry
export {
  CubeGeometry,
  createPaymentCubeGeometry,
  CUBE_FACE_CONFIGS,
} from "./CubeGeometry";
export type { CubeFaceConfig } from "./CubeGeometry";

// Material
export {
  CubeMaterial,
  createPaymentCubeMaterial,
  createMultiFaceMaterials,
  DEFAULT_CUBE_MATERIAL_CONFIG,
} from "./CubeMaterial";
export type { CubeMaterialConfig } from "./CubeMaterial";

// Animations
export {
  CubeAnimations,
  applyRotationAnimation,
  animateScale,
  DEFAULT_ANIMATION_CONFIG,
} from "./CubeAnimations";
export type { AnimationConfig } from "./CubeAnimations";

// AR Camera
export { ARCamera, createARCamera, DEFAULT_AR_CAMERA_CONFIG } from "./ARCamera";
export type { ARCameraConfig } from "./ARCamera";

// Positioning
export {
  gpsTo3DPosition,
  screenTo3DPosition,
  calculateGPSDistance,
  calculate3DDistance,
  positionToScreenCoordinates,
} from "./positioning";
export type { GPSCoordinates, ScreenCoordinates } from "./positioning";

// Raycasting
export { CubeRaycaster, detectCubeTap, detectCubeClick } from "./raycasting";
export type { RaycastResult } from "./raycasting";
