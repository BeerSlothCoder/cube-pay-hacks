/**
 * Circle Arc Gateway Client
 *
 * Manages all interactions with Circle's Arc Gateway for cross-chain USDC transfers.
 *
 * Architecture:
 * - Arc Gateway (routing layer): Chain detection, fee estimation, request validation
 * - CCTP Protocol (mechanics): Burn/mint operations on source/destination chains
 * - Arc Blockchain (settlement): Deterministic settlement with Circle attestations
 *
 * API Reference:
 * - REST API: Settlement status, liquidity queries, fee estimation
 * - WebSocket API: Real-time settlement confirmations, status updates
 * - SDK: TypeScript/Python/Go libraries
 *
 * Circle Arc Documentation: https://docs.circle.com/arc
 */

import axios, { AxiosInstance } from "axios";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface CircleArcConfig {
  apiKey: string;
  appId: string;
  apiUrl: string; // e.g., https://api.circle.com for mainnet or https://api-sandbox.circle.com for testnet
  wsUrl?: string; // e.g., wss://api.circle.com for WebSocket connections
  environment: "testnet" | "mainnet";
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
}

export interface ArcTransferRequest {
  idempotencyKey: string; // UUID for idempotent transfers
  sourceChainId: number;
  destinationChainId: number;
  senderAddress: string; // Payer wallet address
  recipientAddress: string; // Receiver wallet address
  amount: string; // In USDC, e.g., "100.50"
  settlementRequired?: boolean; // Require Arc Blockchain settlement confirmation
  attestationRequired?: boolean; // Require Circle attestations
}

export interface ArcTransferResponse {
  transferId: string; // Circle's unique transfer ID
  status: "pending" | "processing" | "completed" | "failed";
  transactionHash?: string; // Source chain burn transaction
  amount: string;
  fee: string;
  estimatedSettlementTime: number; // milliseconds
  arcBlockchainTxId?: string; // Arc settlement transaction ID
  arcSettlementEpoch?: number; // Batch number on Arc Blockchain
  createdAt: string;
  updatedAt: string;
  cctpBurnTxHash?: string; // Source chain CCTP burn
  cctpMintTxHash?: string; // Destination chain CCTP mint
  attestations?: {
    requiredCount: number;
    collectedCount: number;
    signatures: Array<{
      attester: string;
      signature: string;
      timestamp: string;
    }>;
  };
}

export interface ArcFeeQuote {
  sourceChainId: number;
  destinationChainId: number;
  amount: string;
  feePercentage: string;
  feeAmount: string;
  totalAmount: string;
  estimatedSettlementMs: number;
  liquidity: {
    available: boolean;
    amountAvailable: string;
    estimatedFillTime: number; // milliseconds
  };
}

export interface ArcSettlementStatus {
  transferId: string;
  status: "pending" | "processing" | "completed" | "failed";
  confirmationDepth: number;
  confirmationRequired: number;
  arcBlockchainTxId?: string;
  arcConfirmationCount?: number;
  cctpBurnConfirmed: boolean;
  cctpMintConfirmed: boolean;
  arcAttestationStatus: {
    required: number;
    collected: number;
    percentage: number;
  };
  errorMessage?: string;
  lastStatusCheckAt: string;
}

export interface ArcLiquidityStatus {
  chainId: number;
  totalLiquidity: string; // Total USDC liquidity available
  availableLiquidity: string; // Available after pending transfers
  utilizationPercentage: number;
  estimatedFillTime: number; // milliseconds to fill request
  lastUpdateAt: string;
}

export interface ArcWebSocketMessage {
  type: "settlement:status" | "blockchain:confirmation" | "error";
  transferId?: string;
  data: {
    status?: string;
    confirmationDepth?: number;
    arcBlockchainTxId?: string;
    message?: string;
    timestamp: string;
  };
}

// ============================================================================
// Circle Arc Gateway Client
// ============================================================================

export class CircleGatewayClient {
  private config: CircleArcConfig;
  private httpClient: AxiosInstance;
  private wsConnection?: WebSocket;
  private wsSubscriptions: Set<string> = new Set(); // Subscribed transfer IDs

  constructor(config: CircleArcConfig) {
    this.config = {
      maxRetries: 3,
      retryDelayMs: 1000,
      timeoutMs: 30000,
      ...config,
    };

    // Initialize HTTP client with retry logic
    this.httpClient = axios.create({
      baseURL: this.config.apiUrl,
      timeout: this.config.timeoutMs,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
        "X-App-Id": this.config.appId,
      },
    });

    // Add retry interceptor
    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        if (!config || !config.__retryCount) {
          config.__retryCount = 0;
        }

        if (
          (error.response?.status === 429 || error.response?.status === 503) &&
          config.__retryCount < this.config.maxRetries!
        ) {
          config.__retryCount++;
          await new Promise((resolve) =>
            setTimeout(
              resolve,
              this.config.retryDelayMs! * Math.pow(2, config.__retryCount - 1),
            ),
          );
          return this.httpClient(config);
        }

        return Promise.reject(error);
      },
    );

    console.log(
      `[Circle Arc Gateway Client] Initialized for ${this.config.environment} environment`,
    );
  }

  /**
   * Initiate Arc transfer (CCTP + Arc Blockchain settlement)
   */
  async initiateTransfer(
    request: ArcTransferRequest,
  ): Promise<ArcTransferResponse> {
    try {
      this.validateTransferRequest(request);

      const feeQuote = await this.getArcFeeQuote(
        request.sourceChainId,
        request.destinationChainId,
        request.amount,
      );

      if (!feeQuote.liquidity.available) {
        throw new Error(
          `Insufficient Arc liquidity: need ${request.amount} USDC, available ${feeQuote.liquidity.amountAvailable}`,
        );
      }

      const response = await this.httpClient.post("/v1/transfers/create", {
        idempotencyKey: request.idempotencyKey,
        sourceChainId: request.sourceChainId,
        destinationChainId: request.destinationChainId,
        senderAddress: request.senderAddress,
        recipientAddress: request.recipientAddress,
        amount: request.amount,
        settlementRequired: request.settlementRequired !== false,
        attestationRequired: request.attestationRequired !== false,
      });

      return this.normalizeTransferResponse(response.data);
    } catch (error) {
      console.error("[Arc Gateway] Transfer initiation failed:", error);
      throw error;
    }
  }

  /**
   * Get fee quote from Arc Gateway
   */
  async getArcFeeQuote(
    sourceChainId: number,
    destinationChainId: number,
    amount: string,
  ): Promise<ArcFeeQuote> {
    try {
      const response = await this.httpClient.get("/v1/quotes/fee", {
        params: {
          sourceChainId,
          destinationChainId,
          amount,
        },
      });

      return response.data;
    } catch (error) {
      console.error("[Arc Gateway] Fee quote request failed:", error);
      throw error;
    }
  }

  /**
   * Check Arc Blockchain settlement status
   */
  async checkSettlementStatus(
    transferId: string,
  ): Promise<ArcSettlementStatus> {
    try {
      const response = await this.httpClient.get(
        `/v1/transfers/${transferId}/settlement`,
      );

      const data = response.data;

      return {
        transferId: data.id,
        status: data.status,
        confirmationDepth: data.confirmationDepth || 0,
        confirmationRequired: data.confirmationRequired || 6,
        arcBlockchainTxId: data.arcBlockchainTxId,
        arcConfirmationCount: data.arcConfirmationCount,
        cctpBurnConfirmed: data.cctpBurnConfirmed,
        cctpMintConfirmed: data.cctpMintConfirmed,
        arcAttestationStatus: {
          required: data.arcAttesters?.required || 0,
          collected: data.arcAttesters?.collected || 0,
          percentage: data.arcAttesters
            ? (data.arcAttesters.collected / data.arcAttesters.required) * 100
            : 0,
        },
        errorMessage: data.errorMessage,
        lastStatusCheckAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[Arc Gateway] Settlement status check failed:", error);
      throw error;
    }
  }

  /**
   * Get liquidity status for a specific chain
   */
  async getArcLiquidity(chainId: number): Promise<ArcLiquidityStatus> {
    try {
      const response = await this.httpClient.get(`/v1/liquidity/${chainId}`);

      return response.data;
    } catch (error) {
      console.error("[Arc Gateway] Liquidity check failed:", error);
      throw error;
    }
  }

  /**
   * Get all Arc Blockchain liquidity pools
   */
  async getAllArcLiquidity(): Promise<ArcLiquidityStatus[]> {
    try {
      const response = await this.httpClient.get("/v1/liquidity/all");

      return response.data.chains || [];
    } catch (error) {
      console.error("[Arc Gateway] All liquidity check failed:", error);
      throw error;
    }
  }

  /**
   * Subscribe to Arc Blockchain settlement updates via WebSocket
   */
  subscribeToSettlementUpdates(
    transferIds: string[],
    onMessage: (message: ArcWebSocketMessage) => void,
    onError?: (error: Error) => void,
  ): void {
    if (!this.config.wsUrl) {
      console.warn("[Arc Gateway] WebSocket not configured");
      return;
    }

    try {
      if (this.wsConnection) {
        this.wsConnection.close();
      }

      this.wsConnection = new WebSocket(this.config.wsUrl);

      this.wsConnection.onopen = () => {
        console.log("[Arc Gateway] WebSocket connected");

        transferIds.forEach((id) => {
          this.wsConnection!.send(
            JSON.stringify({
              action: "subscribe",
              transferId: id,
            }),
          );
          this.wsSubscriptions.add(id);
        });
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const message: ArcWebSocketMessage = JSON.parse(event.data);
          onMessage(message);
        } catch (error) {
          console.error(
            "[Arc Gateway] Failed to parse WebSocket message:",
            error,
          );
        }
      };

      this.wsConnection.onerror = (event) => {
        console.error("[Arc Gateway] WebSocket error:", event);
        if (onError) {
          onError(new Error("WebSocket connection error"));
        }
      };

      this.wsConnection.onclose = () => {
        console.log("[Arc Gateway] WebSocket disconnected");
      };
    } catch (error) {
      console.error("[Arc Gateway] WebSocket subscription failed:", error);
      if (onError) {
        onError(error as Error);
      }
    }
  }

  /**
   * Unsubscribe from Arc settlement updates
   */
  unsubscribeFromSettlementUpdates(transferId: string): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(
        JSON.stringify({
          action: "unsubscribe",
          transferId,
        }),
      );
      this.wsSubscriptions.delete(transferId);
    }
  }

  /**
   * Verify Arc Blockchain attestations
   */
  async verifyAttestations(
    transferId: string,
  ): Promise<{ verified: boolean; count: number; required: number }> {
    try {
      const response = await this.httpClient.get(
        `/v1/transfers/${transferId}/attestations`,
      );

      return {
        verified: response.data.collected >= response.data.required,
        count: response.data.collected,
        required: response.data.required,
      };
    } catch (error) {
      console.error("[Arc Gateway] Attestation verification failed:", error);
      throw error;
    }
  }

  /**
   * Poll transfer status (alternative to WebSocket)
   */
  async pollTransferStatus(
    transferId: string,
    maxAttempts: number = 120,
    intervalMs: number = 500,
  ): Promise<ArcSettlementStatus> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const status = await this.checkSettlementStatus(transferId);

      if (status.status === "completed" || status.status === "failed") {
        return status;
      }

      attempts++;
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }

    throw new Error(
      `Transfer ${transferId} did not complete after ${maxAttempts * intervalMs}ms`,
    );
  }

  /**
   * Validate transfer request before sending to Arc Gateway
   */
  private validateTransferRequest(request: ArcTransferRequest): void {
    if (!/^0x[a-fA-F0-9]{40}$/.test(request.senderAddress)) {
      throw new Error("Invalid sender address");
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(request.recipientAddress)) {
      throw new Error("Invalid recipient address");
    }

    const amount = parseFloat(request.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount");
    }

    if (!request.idempotencyKey) {
      throw new Error("Idempotency key required");
    }

    if (request.sourceChainId === request.destinationChainId) {
      throw new Error("Source and destination chains must be different");
    }
  }

  /**
   * Normalize Arc Gateway API response to standard format
   */
  private normalizeTransferResponse(data: any): ArcTransferResponse {
    return {
      transferId: data.id,
      status: data.status,
      amount: data.amount,
      fee: data.fee || "0",
      estimatedSettlementTime: data.estimatedSettlementTime || 5000,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      ...(data.transactionHash && { transactionHash: data.transactionHash }),
      ...(data.arcBlockchainTxId && {
        arcBlockchainTxId: data.arcBlockchainTxId,
      }),
      ...(data.arcSettlementEpoch && {
        arcSettlementEpoch: data.arcSettlementEpoch,
      }),
      ...(data.cctpBurnTxHash && { cctpBurnTxHash: data.cctpBurnTxHash }),
      ...(data.cctpMintTxHash && { cctpMintTxHash: data.cctpMintTxHash }),
      ...(data.attestations && { attestations: data.attestations }),
    };
  }

  /**
   * Disconnect WebSocket and cleanup
   */
  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = undefined;
    }
    this.wsSubscriptions.clear();
  }
}

/**
 * Factory function to create Circle Arc Gateway Client with config from environment
 */
export function createArcGatewayClient(
  override?: Partial<CircleArcConfig>,
): CircleGatewayClient {
  const config: CircleArcConfig = {
    apiKey: process.env.VITE_CIRCLE_API_KEY || "",
    appId: process.env.VITE_CIRCLE_APP_ID || "",
    apiUrl:
      process.env.VITE_ARC_GATEWAY_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://api.circle.com/arc"
        : "https://api-sandbox.circle.com/arc"),
    wsUrl:
      process.env.VITE_ARC_WEBSOCKET_URL ||
      (process.env.NODE_ENV === "production"
        ? "wss://api.circle.com/arc/ws"
        : "wss://api-sandbox.circle.com/arc/ws"),
    environment: (process.env.VITE_ARC_ENVIRONMENT || "testnet") as
      | "testnet"
      | "mainnet",
    ...override,
  };

  return new CircleGatewayClient(config);
}

export default CircleGatewayClient;
