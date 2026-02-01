/**
 * Payment and Transaction Types
 * Multi-chain payment infrastructure
 */

export type PaymentStatus =
  | "pending"
  | "processing"
  | "confirmed"
  | "failed"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "wallet" | "qr_code" | "cube_3d" | "nfc" | "card";

export type FeeType =
  | "fixed"
  | "percentage"
  | "dynamic"
  | "gas_plus_fixed"
  | "none";

export interface PaymentTransaction {
  id: string;
  created_at: string;
  updated_at: string;

  // Transaction Details
  amount: number;
  currency: string;
  fee_amount?: number;
  fee_type?: FeeType;
  total_amount: number;

  // Payment Method
  method: PaymentMethod;
  network: string;
  token_address?: string;

  // Blockchain Data
  tx_hash?: string;
  block_number?: number;
  confirmation_count?: number;

  // Parties
  from_address: string;
  to_address: string;
  agent_id?: string;

  // Status
  status: PaymentStatus;
  error_message?: string;

  // Metadata
  metadata?: Record<string, any>;
}

export interface CubePaymentFace {
  face_id: number;
  network: string;
  token: string;
  token_address?: string;
  display_name: string;
  icon_url?: string;
  qr_data: string;
  amount?: number;
}

export interface CubePaymentConfig {
  faces: CubePaymentFace[];
  rotation_speed?: number;
  auto_rotate?: boolean;
  highlight_on_hover?: boolean;
  default_amount?: number;
  recipient_address: string;
}

export interface QRCodePayment {
  id: string;
  network: string;
  token_address?: string;
  recipient_address: string;
  amount?: number;
  qr_data: string;
  expires_at?: string;
}

export interface NetworkFeeEstimate {
  network: string;
  gas_price?: string;
  gas_limit?: string;
  estimated_fee: number;
  estimated_fee_usd?: number;
  priority?: "low" | "medium" | "high";
}
