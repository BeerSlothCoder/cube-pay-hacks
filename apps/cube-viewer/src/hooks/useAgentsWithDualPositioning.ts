import { useState, useEffect, useCallback } from "react";
import { createCubePayDatabase } from "@cubepay/database-client";
import type { DeployedObject } from "@cubepay/types";
import { calculateDistance } from "./useGeolocation";

interface UseAgentsWithDualPositioningOptions {
  latitude?: number;
  longitude?: number;
  radius?: number; // in meters, default 1000 (for GPS agents)
  limit?: number;
  includeScreenPositioned?: boolean; // Include screen-positioned agents (default: true)
}

interface UseAgentsWithDualPositioningResult {
  agents: DeployedObject[];
  gpsAgents: DeployedObject[];
  screenAgents: DeployedObject[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Enhanced hook to fetch agents with support for dual positioning system
 * Handles both GPS-based (physical world) and screen-based (overlay) positioning
 *
 * @param options Configuration options
 * @returns Agents with dual positioning support + stats
 */
export function useAgentsWithDualPositioning({
  latitude = 34.0522,
  longitude = -118.2437,
  radius = 1000,
  limit = 50,
  includeScreenPositioned = true,
}: UseAgentsWithDualPositioningOptions): UseAgentsWithDualPositioningResult {
  const [agents, setAgents] = useState<DeployedObject[]>([]);
  const [gpsAgents, setGpsAgents] = useState<DeployedObject[]>([]);
  const [screenAgents, setScreenAgents] = useState<DeployedObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const db = createCubePayDatabase(
        import.meta.env.VITE_SUPABASE_URL || "",
        import.meta.env.VITE_SUPABASE_ANON_KEY || "",
      );

      // Fetch all active deployed objects (including both positioning modes)
      // In production, this would use optimized queries based on positioning_mode
      const allAgents = await db.deployedObjects.list({
        filters: { status: "active" },
        limit: 1000, // Fetch more to filter locally
      });

      if (!allAgents) {
        setAgents([]);
        setGpsAgents([]);
        setScreenAgents([]);
        setLoading(false);
        return;
      }

      console.log(`📊 Fetched ${allAgents.length} total agents from database`);

      // Separate agents by positioning mode
      const _gpsAgents: typeof allAgents = [];
      const _screenAgents: typeof allAgents = [];

      allAgents.forEach((agent) => {
        // Default to GPS mode if positioning_mode is not set
        const mode = agent.positioning_mode || "gps";

        if (mode === "screen") {
          _screenAgents.push(agent);
        } else {
          _gpsAgents.push(agent);
        }
      });

      // Filter GPS agents by distance and radius
      const filteredGpsAgents = _gpsAgents
        .filter((agent) => {
          // Must have GPS coordinates
          if (!agent.latitude || !agent.longitude) {
            console.warn(
              `⚠️ GPS agent "${agent.agent_name}" missing coordinates`,
            );
            return false;
          }

          // Calculate distance from user
          const distance = calculateDistance(
            latitude,
            longitude,
            agent.latitude,
            agent.longitude,
          );

          // Filter by radius
          if (distance > radius) {
            return false;
          }

          return true;
        })
        .map((agent) => ({
          ...agent,
          distance: calculateDistance(
            latitude,
            longitude,
            agent.latitude!,
            agent.longitude!,
          ),
        }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        .slice(0, limit);

      console.log(
        `✅ Filtered to ${filteredGpsAgents.length} GPS agents within ${radius}m`,
      );
      console.log(`📺 Found ${_screenAgents.length} screen-positioned agents`);

      // Combine agents based on settings
      let allFilteredAgents = filteredGpsAgents;

      if (includeScreenPositioned) {
        // Screen agents don't need distance filtering - just add all active ones
        allFilteredAgents = [...filteredGpsAgents, ..._screenAgents];
      }

      setGpsAgents(filteredGpsAgents);
      setScreenAgents(_screenAgents);
      setAgents(allFilteredAgents);

      console.log(`🎯 Total agents for rendering: ${allFilteredAgents.length}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ Error fetching agents:", errorMessage);
      setError(errorMessage);
      setAgents([]);
      setGpsAgents([]);
      setScreenAgents([]);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, radius, limit, includeScreenPositioned]);

  // Fetch agents on mount and when dependencies change
  useEffect(() => {
    fetchAgents();

    // Set up polling to refresh agents every 30 seconds
    const interval = setInterval(fetchAgents, 30000);

    return () => clearInterval(interval);
  }, [fetchAgents]);

  return {
    agents,
    gpsAgents,
    screenAgents,
    loading,
    error,
    refresh: fetchAgents,
  };
}

/**
 * Helper hook to subscribe to real-time agent updates using Supabase
 *
 * Listens for changes to deployed_objects table filtered by positioning_mode
 * This enables live updates when agents are added/moved in the streaming platform
 */
export function useRealtimeAgents(
  onAgentUpdate?: (agent: DeployedObject) => void,
) {
  useEffect(() => {
    // This would subscribe to Supabase real-time changes
    // Implementation depends on Supabase client setup in your database-client
    //
    // Example (pseudo-code):
    // const subscription = supabase
    //   .from('deployed_objects')
    //   .on('*', payload => {
    //     console.log('Agent update:', payload);
    //     onAgentUpdate?.(payload.new);
    //   })
    //   .subscribe();
    //
    // return () => subscription.unsubscribe();
  }, [onAgentUpdate]);
}
