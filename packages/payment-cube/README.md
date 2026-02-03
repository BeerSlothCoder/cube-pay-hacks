# @cube-pay/payment-cube

Three.js utilities for CubePay payment cubes with AR support.

## Features

- **CubeGeometry**: Standard 1x1x1 payment cube geometry
- **CubeMaterial**: Metallic blue material with emissive glow
- **CubeAnimations**: Rotation, hover, and click animations
- **ARCamera**: Camera with device orientation tracking for AR
- **Positioning**: GPS and screen coordinate conversion utilities
- **Raycasting**: Cube interaction detection for mouse and touch

## Installation

```bash
npm install @cube-pay/payment-cube
```

## Usage

### Basic Payment Cube

```typescript
import {
  createPaymentCubeGeometry,
  createPaymentCubeMaterial,
  CubeAnimations,
} from "@cube-pay/payment-cube";
import * as THREE from "three";

// Create geometry and material
const geometry = createPaymentCubeGeometry();
const material = createPaymentCubeMaterial();

// Create mesh
const cube = new THREE.Mesh(geometry, material);

// Add animations
const animations = new CubeAnimations(cube);

// In your render loop
function animate(delta: number) {
  animations.update(delta);
}
```

### Multi-Face Cube

```typescript
import {
  createMultiFaceMaterials,
  CUBE_FACE_CONFIGS,
} from "@cube-pay/payment-cube";

// Create materials for each payment method
const materials = createMultiFaceMaterials();
const cube = new THREE.Mesh(geometry, materials);

// Access face configurations
CUBE_FACE_CONFIGS.forEach((face) => {
  console.log(`Face ${face.index}: ${face.label} (${face.icon})`);
});
```

### AR Camera

```typescript
import { ARCamera } from "@cube-pay/payment-cube";

// Create AR camera with device orientation
const arCamera = new ARCamera(window.innerWidth / window.innerHeight, {
  enableDeviceOrientation: true,
});

// Request permission on iOS
await arCamera.requestOrientationPermission();

// Get the Three.js camera
const camera = arCamera.getCamera();
```

### Positioning

```typescript
import { gpsTo3DPosition, screenTo3DPosition } from "@cube-pay/payment-cube";

// Convert GPS to 3D position
const gpsPosition = gpsTo3DPosition(
  { latitude: 40.7128, longitude: -74.006, altitude: 10 },
  { latitude: 40.7128, longitude: -74.006, altitude: 0 }, // origin
  1, // scale
);

// Convert screen coordinates to 3D position
const screenPosition = screenTo3DPosition({ x: 0, y: 1, z: -5 });
```

### Raycasting

```typescript
import { CubeRaycaster } from "@cube-pay/payment-cube";

const raycaster = new CubeRaycaster(camera);

// On click event
canvas.addEventListener("click", (event) => {
  raycaster.updateMousePosition(event, canvas);
  const result = raycaster.castRay([cube]);

  if (result.intersected) {
    const paymentMethod = raycaster.getPaymentMethodFromFace(result.faceIndex);
    console.log("Clicked payment method:", paymentMethod);
  }
});
```

## API Reference

### CubeGeometry

- `createPaymentCubeGeometry()`: Create a 1x1x1 box geometry
- `CubeGeometry`: Class for managing cube geometry
- `CUBE_FACE_CONFIGS`: Configuration for all 6 payment faces

### CubeMaterial

- `createPaymentCubeMaterial(config?)`: Create metallic blue material
- `createMultiFaceMaterials()`: Create different colored materials for each face
- `CubeMaterial`: Class for managing cube materials

### CubeAnimations

- `CubeAnimations`: Handles rotation, hover, and click animations
- `applyRotationAnimation(mesh, speed)`: Apply continuous rotation
- `animateScale(mesh, targetScale, duration)`: Animate scale with easing

### ARCamera

- `ARCamera`: Camera with device orientation tracking
- `createARCamera(aspect?, config?)`: Factory function for AR camera
- `requestOrientationPermission()`: Request iOS permission

### Positioning

- `gpsTo3DPosition(gps, origin?, scale?)`: Convert GPS to 3D coordinates
- `screenTo3DPosition(screen)`: Convert screen coords to 3D position
- `calculateGPSDistance(coord1, coord2)`: Calculate distance in meters
- `calculate3DDistance(pos1, pos2)`: Calculate 3D distance

### Raycasting

- `CubeRaycaster`: Detect cube interactions
- `detectCubeTap(event, camera, cubes, element)`: Mobile tap detection
- `detectCubeClick(event, camera, cubes, element)`: Desktop click detection

## Payment Cube Faces

Each cube has 6 faces representing different payment methods:

| Face | Label        | Type          | Icon | Color   |
| ---- | ------------ | ------------- | ---- | ------- |
| 0    | Crypto QR    | qr-payment    | 📱   | Blue    |
| 1    | Sound Pay    | audio-payment | 🔊   | Teal    |
| 2    | Voice Pay    | voice-payment | 🎤   | Purple  |
| 3    | Virtual Card | card-payment  | 💳   | Orange  |
| 4    | ENS Payment  | ens-payment   | 🌐   | Cyan    |
| 5    | On-Ramp      | fiat-onramp   | 🏦   | Magenta |

## License

MIT
