/**
 * AR (Augmented Reality) Types
 * 3D positioning and AR QR codes
 */

export interface ARPosition {
  x: number;
  y: number;
  z: number;
}

export interface ARRotation {
  x: number;
  y: number;
  z: number;
}

export interface ARScale {
  x: number;
  y: number;
  z: number;
}

export interface ARTransform {
  position: ARPosition;
  rotation: ARRotation;
  scale: ARScale;
}

export type ARQRCodeStatus = "active" | "expired" | "used" | "archived";

export interface ARQRCode {
  id: string;
  created_at: string;
  updated_at: string;

  // QR Data
  qr_data: string;
  qr_type: "payment" | "link" | "agent_info" | "custom";

  // 3D Positioning (relative to agent)
  position_x: number;
  position_y: number;
  position_z: number;
  rotation_x?: number;
  rotation_y?: number;
  rotation_z?: number;
  scale?: number;

  // Association
  agent_id?: string;

  // Payment Data
  network?: string;
  token_address?: string;
  recipient_address?: string;
  amount?: number;

  // Lifecycle
  status: ARQRCodeStatus;
  expires_at?: string;
  scan_count?: number;
  max_scans?: number;

  // Appearance
  color?: string;
  opacity?: number;
  floating_animation?: boolean;
  glow_effect?: boolean;

  // Metadata
  metadata?: Record<string, any>;
}

export interface ARMarker {
  id: string;
  type: "agent" | "qr" | "portal" | "waypoint";
  transform: ARTransform;
  visible: boolean;
  distance?: number;
  metadata?: Record<string, any>;
}

export interface ARSession {
  id: string;
  started_at: string;
  user_location: {
    lat: number;
    lng: number;
    altitude?: number;
  };
  device_heading?: number;
  nearby_agents: string[];
  active_markers: ARMarker[];
}
