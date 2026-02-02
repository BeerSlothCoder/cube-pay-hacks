import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  DeployedObject,
  ARQRCode,
  NearbyAgentQuery,
  AgentFilters,
  QRCodeFilters,
} from "@cubepay/types";

/**
 * CubePay Database Client
 *
 * Provides typed access to Supabase database for:
 * - Agent CRUD operations
 * - QR code management
 * - Geospatial queries
 * - Real-time subscriptions
 */
export class CubePayDatabase {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // =====================================================
  // AGENT OPERATIONS
  // =====================================================

  /**
   * Get a single agent by ID
   */
  async getAgent(id: string): Promise<DeployedObject | null> {
    const { data, error } = await this.supabase
      .from("deployed_objects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching agent:", error);
      return null;
    }

    return data as DeployedObject;
  }

  /**
   * Get all agents with optional filtering
   */
  async getAllAgents(filters?: AgentFilters): Promise<DeployedObject[]> {
    let query = this.supabase.from("deployed_objects").select("*");

    // Apply filters
    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    }
    if (filters?.agent_type) {
      query = query.eq("agent_type", filters.agent_type);
    }
    if (filters?.user_id) {
      query = query.eq("user_id", filters.user_id);
    }
    if (filters?.network) {
      query = query.eq("network", filters.network);
    }
    if (filters?.chain_id) {
      query = query.eq("chain_id", filters.chain_id);
    }

    // Sorting
    if (filters?.orderBy) {
      query = query.order(filters.orderBy, {
        ascending: filters.ascending ?? false,
      });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Pagination
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 50) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching agents:", error);
      return [];
    }

    return data as DeployedObject[];
  }

  /**
   * Get nearby agents using geospatial query
   * Uses Haversine formula for distance calculation
   */
  async getNearbyAgents(query: NearbyAgentQuery): Promise<DeployedObject[]> {
    const { latitude, longitude, radius_km = 1, limit = 50 } = query;

    // Calculate bounding box for initial filter (optimization)
    const latDelta = radius_km / 111.32; // 1 degree latitude ≈ 111.32 km
    const lonDelta =
      radius_km / (111.32 * Math.cos((latitude * Math.PI) / 180));

    let dbQuery = this.supabase
      .from("deployed_objects")
      .select("*")
      .gte("latitude", latitude - latDelta)
      .lte("latitude", latitude + latDelta)
      .gte("longitude", longitude - lonDelta)
      .lte("longitude", longitude + lonDelta)
      .eq("is_active", true)
      .limit(limit);

    const { data, error } = await dbQuery;

    if (error) {
      console.error("Error fetching nearby agents:", error);
      return [];
    }

    // Calculate exact distances and filter by radius
    const agentsWithDistance = (data as DeployedObject[])
      .map((agent) => ({
        ...agent,
        distance: this.calculateDistance(
          latitude,
          longitude,
          agent.latitude,
          agent.longitude,
        ),
      }))
      .filter((agent) => agent.distance <= radius_km)
      .sort((a, b) => a.distance - b.distance);

    return agentsWithDistance as DeployedObject[];
  }

  /**
   * Create a new agent
   */
  async createAgent(
    agent: Partial<DeployedObject>,
  ): Promise<DeployedObject | null> {
    const { data, error } = await this.supabase
      .from("deployed_objects")
      .insert(agent)
      .select()
      .single();

    if (error) {
      console.error("Error creating agent:", error);
      return null;
    }

    return data as DeployedObject;
  }

  /**
   * Update an existing agent
   */
  async updateAgent(
    id: string,
    updates: Partial<DeployedObject>,
  ): Promise<DeployedObject | null> {
    const { data, error } = await this.supabase
      .from("deployed_objects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating agent:", error);
      return null;
    }

    return data as DeployedObject;
  }

  /**
   * Delete an agent (soft delete by setting is_active = false)
   */
  async deleteAgent(id: string, hardDelete = false): Promise<boolean> {
    if (hardDelete) {
      const { error } = await this.supabase
        .from("deployed_objects")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting agent:", error);
        return false;
      }
    } else {
      const { error } = await this.supabase
        .from("deployed_objects")
        .update({ is_active: false })
        .eq("id", id);

      if (error) {
        console.error("Error deactivating agent:", error);
        return false;
      }
    }

    return true;
  }

  // =====================================================
  // QR CODE OPERATIONS
  // =====================================================

  /**
   * Get a QR code by transaction ID
   */
  async getQRCode(transactionId: string): Promise<ARQRCode | null> {
    const { data, error } = await this.supabase
      .from("ar_qr_codes")
      .select("*")
      .eq("transaction_id", transactionId)
      .single();

    if (error) {
      console.error("Error fetching QR code:", error);
      return null;
    }

    return data as ARQRCode;
  }

  /**
   * Get all QR codes with optional filtering
   */
  async getQRCodes(filters?: QRCodeFilters): Promise<ARQRCode[]> {
    let query = this.supabase.from("ar_qr_codes").select("*");

    // Apply filters
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.agent_id) {
      query = query.eq("agent_id", filters.agent_id);
    }
    if (filters?.protocol) {
      query = query.eq("protocol", filters.protocol);
    }
    if (filters?.only_active) {
      query = query.in("status", ["generated", "active"]);
    }

    // Sorting
    query = query.order("created_at", { ascending: false });

    // Pagination
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching QR codes:", error);
      return [];
    }

    return data as ARQRCode[];
  }

  /**
   * Create a new QR code
   */
  async createQRCode(qrCode: Partial<ARQRCode>): Promise<ARQRCode | null> {
    const { data, error } = await this.supabase
      .from("ar_qr_codes")
      .insert(qrCode)
      .select()
      .single();

    if (error) {
      console.error("Error creating QR code:", error);
      return null;
    }

    return data as ARQRCode;
  }

  /**
   * Update QR code status
   */
  async updateQRCodeStatus(
    transactionId: string,
    status: "generated" | "active" | "scanned" | "expired" | "paid",
    metadata?: Record<string, any>,
  ): Promise<ARQRCode | null> {
    const updates: any = { status };

    if (status === "scanned") {
      updates.scanned_at = new Date().toISOString();
    } else if (status === "paid") {
      updates.paid_at = new Date().toISOString();
    }

    if (metadata) {
      updates.metadata = metadata;
    }

    const { data, error } = await this.supabase
      .from("ar_qr_codes")
      .update(updates)
      .eq("transaction_id", transactionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating QR code:", error);
      return null;
    }

    return data as ARQRCode;
  }

  /**
   * Clean up expired QR codes
   */
  async cleanupExpiredQRCodes(): Promise<number> {
    const { data, error } = await this.supabase.rpc("cleanup_expired_qr_codes");

    if (error) {
      console.error("Error cleaning up QR codes:", error);
      return 0;
    }

    return data as number;
  }

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================================

  /**
   * Subscribe to QR code updates for a specific agent
   */
  subscribeToQRCodes(agentId: string, callback: (qrCode: ARQRCode) => void) {
    return this.supabase
      .channel(`qr_codes_${agentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ar_qr_codes",
          filter: `agent_id=eq.${agentId}`,
        },
        (payload) => {
          callback(payload.new as ARQRCode);
        },
      )
      .subscribe();
  }

  /**
   * Subscribe to agent updates
   */
  subscribeToAgent(agentId: string, callback: (agent: DeployedObject) => void) {
    return this.supabase
      .channel(`agent_${agentId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "deployed_objects",
          filter: `id=eq.${agentId}`,
        },
        (payload) => {
          callback(payload.new as DeployedObject);
        },
      )
      .subscribe();
  }

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channel: any) {
    await this.supabase.removeChannel(channel);
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get the underlying Supabase client for advanced queries
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Deploy a new agent with screen position
   */
  async deployAgent(data: {
    agent_name: string;
    latitude: number;
    longitude: number;
    screen_position: { x: number; y: number; z_index: number };
    payment_enabled: boolean;
  }) {
    const { data: result, error } = await this.supabase
      .from('deployed_objects')
      .insert({
        agent_name: data.agent_name,
        latitude: data.latitude,
        longitude: data.longitude,
        screen_position: data.screen_position,
        payment_enabled: data.payment_enabled,
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  }
}

export function createCubePayDatabase(
  supabaseUrl: string,
  supabaseKey: string,
): CubePayDatabase {
  return new CubePayDatabase(supabaseUrl, supabaseKey);
}
