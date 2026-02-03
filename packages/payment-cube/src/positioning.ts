import * as THREE from "three";

/**
 * GPS coordinates
 */
export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
}

/**
 * Screen coordinates (x, y, z in 3D space)
 */
export interface ScreenCoordinates {
  x: number;
  y: number;
  z: number;
}

/**
 * Convert GPS coordinates to 3D world position
 * Uses a simple mercator projection for visualization
 *
 * @param gps GPS coordinates
 * @param origin Reference GPS point (defaults to 0, 0)
 * @param scale Scale factor for distance (meters per unit)
 */
export function gpsTo3DPosition(
  gps: GPSCoordinates,
  origin: GPSCoordinates = { latitude: 0, longitude: 0, altitude: 0 },
  scale: number = 1,
): THREE.Vector3 {
  // Earth's radius in meters
  const EARTH_RADIUS = 6371000;

  // Convert latitude/longitude differences to meters
  const latDiff = gps.latitude - origin.latitude;
  const lonDiff = gps.longitude - origin.longitude;

  // Convert to radians
  const latRad = THREE.MathUtils.degToRad(origin.latitude);

  // Calculate x, z positions (longitude, latitude)
  const x = lonDiff * EARTH_RADIUS * Math.cos(latRad) * (Math.PI / 180) * scale;
  const z = -latDiff * EARTH_RADIUS * (Math.PI / 180) * scale; // Negative for correct orientation

  // Calculate y position (altitude)
  const y = ((gps.altitude || 0) - (origin.altitude || 0)) * scale;

  return new THREE.Vector3(x, y, z);
}

/**
 * Convert screen coordinates to 3D position
 * Screen coordinates are already in 3D space
 */
export function screenTo3DPosition(screen: ScreenCoordinates): THREE.Vector3 {
  return new THREE.Vector3(screen.x, screen.y, screen.z);
}

/**
 * Calculate distance between two GPS coordinates in meters
 * Uses the Haversine formula
 */
export function calculateGPSDistance(
  coord1: GPSCoordinates,
  coord2: GPSCoordinates,
): number {
  const EARTH_RADIUS = 6371000; // meters

  const lat1 = THREE.MathUtils.degToRad(coord1.latitude);
  const lat2 = THREE.MathUtils.degToRad(coord2.latitude);
  const deltaLat = THREE.MathUtils.degToRad(coord2.latitude - coord1.latitude);
  const deltaLon = THREE.MathUtils.degToRad(
    coord2.longitude - coord1.longitude,
  );

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS * c;
}

/**
 * Calculate distance between two 3D positions
 */
export function calculate3DDistance(
  pos1: THREE.Vector3,
  pos2: THREE.Vector3,
): number {
  return pos1.distanceTo(pos2);
}

/**
 * Convert 3D position back to screen coordinates
 */
export function positionToScreenCoordinates(
  position: THREE.Vector3,
): ScreenCoordinates {
  return {
    x: position.x,
    y: position.y,
    z: position.z,
  };
}
