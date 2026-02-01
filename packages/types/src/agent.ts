/**
 * Agent and Deployment Object Types
 * Based on deployed_objects table schema
 */

export type AgentType =
  | "ai_avatar"
  | "ar_portal"
  | "nft_display"
  | "interactive_billboard"
  | "virtual_assistant"
  | "game_character"
  | "tour_guide"
  | "product_showcase"
  | "event_host"
  | "custom";

export type DeploymentStatus =
  | "draft"
  | "pending"
  | "active"
  | "paused"
  | "archived"
  | "error";

export interface GeoLocation {
  lat: number;
  lng: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
}

export interface Agent3DModel {
  url: string;
  format: "glb" | "gltf" | "fbx" | "obj";
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  animations?: string[];
}

export interface AgentBehavior {
  greeting?: string;
  idle_animation?: string;
  interaction_triggers?: string[];
  conversation_starters?: string[];
  personality_traits?: string[];
  knowledge_base?: string[];
}

export interface AgentPersona {
  name: string;
  description?: string;
  avatar_url?: string;
  voice_id?: string;
  language?: string;
  tone?: "professional" | "friendly" | "casual" | "formal" | "humorous";
}

export interface DeployedObject {
  id: string;
  created_at: string;
  updated_at: string;

  // Agent Identity
  agent_name: string;
  agent_type: AgentType;
  agent_description?: string;
  agent_persona?: AgentPersona;
  agent_behavior?: AgentBehavior;

  // 3D Asset
  model_3d?: Agent3DModel;

  // Location & Positioning
  location: GeoLocation;
  radius_meters?: number;
  placement_type?: "ground" | "floating" | "wall" | "table" | "custom";

  // Deployment Control
  status: DeploymentStatus;
  deployed_by: string;
  deployment_network?: string;
  deployment_tx_hash?: string;

  // Payment Configuration
  payment_config?: PaymentConfig;
  revenue_share?: RevenueShare;

  // Analytics
  total_views?: number;
  total_interactions?: number;
  total_revenue?: number;

  // Metadata
  tags?: string[];
  custom_metadata?: Record<string, any>;
}

export interface PaymentConfig {
  enabled: boolean;
  accepted_networks: string[];
  default_amount?: number;
  currency?: string;
  payment_address?: string;
  qr_enabled?: boolean;
  cube_enabled?: boolean;
}

export interface RevenueShare {
  creator_percentage: number;
  platform_percentage: number;
  agent_wallet?: string;
  creator_wallet?: string;
}
