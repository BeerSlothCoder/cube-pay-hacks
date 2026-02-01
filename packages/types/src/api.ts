/**
 * API Request/Response Types
 */

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface CreateAgentRequest {
  agent_name: string;
  agent_type: string;
  agent_description?: string;
  location: {
    lat: number;
    lng: number;
    altitude?: number;
  };
  model_3d?: {
    url: string;
    format: string;
    scale?: number;
  };
  payment_config?: {
    enabled: boolean;
    accepted_networks: string[];
    default_amount?: number;
  };
}

export interface UpdateAgentRequest {
  agent_name?: string;
  agent_description?: string;
  status?: string;
  payment_config?: any;
  location?: any;
}

export interface CreatePaymentRequest {
  agent_id?: string;
  amount: number;
  currency: string;
  network: string;
  token_address?: string;
  from_address: string;
  to_address: string;
  method: string;
}

export interface NearbyAgentsQuery {
  lat: number;
  lng: number;
  radius_km?: number;
  limit?: number;
  agent_type?: string;
}
