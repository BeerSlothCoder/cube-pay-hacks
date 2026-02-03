import { useState, useEffect, useCallback } from "react";
import { createCubePayDatabase } from "@cubepay/database-client";
import type { DeployedObject } from "@cubepay/types";
import { calculateDistance } from "./useGeolocation";

interface UseNearbyCubesOptions {
  latitude: number;
  longitude: number;
  radius?: number; // in meters, default 1000
  limit?: number;
}

interface UseNearbyCubesResult {
  cubes: DeployedObject[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch nearby payment cubes based on GPS location
 * Filters cubes within specified radius and sorts by distance
 */
export function useNearbyCubes({
  latitude,
  longitude,
  radius = 1000,
  limit = 50,
}: UseNearbyCubesOptions): UseNearbyCubesResult {
  const [cubes, setCubes] = useState<DeployedObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNearbyCubes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const db = createCubePayDatabase(
        import.meta.env.VITE_SUPABASE_URL || "",
        import.meta.env.VITE_SUPABASE_ANON_KEY || "",
      );

      // Fetch all active deployed objects
      // In production, this would use PostGIS distance queries
      const allCubes = await db.deployedObjects.list({
        filters: { status: "active" },
        limit: 1000, // Fetch more to filter locally
      });

      if (!allCubes) {
        setCubes([]);
        setLoading(false);
        return;
      }

      // Filter cubes by distance
      const nearbyCubes = allCubes
        .filter((cube) => {
          if (!cube.latitude || !cube.longitude) return false;

          const distance = calculateDistance(
            latitude,
            longitude,
            cube.latitude,
            cube.longitude,
          );

          return distance <= radius;
        })
        .map((cube) => ({
          ...cube,
          distance: calculateDistance(
            latitude,
            longitude,
            cube.latitude!,
            cube.longitude!,
          ),
        }))
        .sort((a, b) => a.distance! - b.distance!)
        .slice(0, limit);

      setCubes(nearbyCubes);
    } catch (err) {
      setError((err as Error).message);
      console.error("Failed to fetch nearby cubes:", err);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, radius, limit]);

  useEffect(() => {
    fetchNearbyCubes();
  }, [fetchNearbyCubes]);

  return {
    cubes,
    loading,
    error,
    refresh: fetchNearbyCubes,
  };
}

/**
 * Calculate bearing (direction) from one point to another
 * Returns angle in degrees (0-360, where 0 is North)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  const bearing = ((θ * 180) / Math.PI + 360) % 360;

  return bearing;
}
