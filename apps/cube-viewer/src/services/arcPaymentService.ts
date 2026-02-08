/**
 * Arc Payment Service
 *
 * Orchestrates Arc Blockchain transfers for all terminal types (POS, AR Viewer, ARTM).
 * Manages the complete payment flow from request to settlement confirmation.
 *
 * Features:
 * - Fee estimation with real-time liquidity checks
 * - QR code generation for EIP-681 URI format
 * - Real-time settlement monitoring via WebSocket
 * - Attestation verification (3-5 Circle attesters required)
 * - Payment reconciliation and reporting
 *
 * Settlement Flow:
 * 1. User initiates transfer → arcPaymentService.initiatePayment()
 * 2. Service generates EIP-681 QR via arcQRService
 * 3. User scans QR → MetaMask opens with pre-filled transfer
 * 4. Wallet signs transaction → broadcast to source chain
 * 5. Arc monitors burn event on source chain
 * 6. Arc Blockchain reserves liquidity + updates settlement epoch
 * 7. Destination chain mints USDC
 * 8. Arc verifies mint → settlement final with 6+ confirmations
 * 9. WebSocket notifies client of completion
 * 10. Payment recorded in database
 */

import { v4 as uuidv4 } from "uuid";
import { arcQRService, type ArcPaymentRequest, type ArcQRData } from "./arcQRService";
import {
  CircleGatewayClient,
  createArcGatewayClient,
  type ArcTransferRequest,
  type ArcSettlementStatus,
  type ArcTransferResponse,
  type ArcFeeQuote,
  type ArcWebSocketMessage,
} from "../packages/wallet-connector/src/circleGateway";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ArcPaymentRequest {
  recipientAddress: string;
  agentId: string;
  amount: string; // In USDC
  sourceChainId: number;
  destinationChainId: number;
  terminalType: "pos" | "ar_viewer" | "artm";
  senderAddress?: string; // Optional - provided after QR scan
  metadata?: {
    orderId?: string;
    description?: string;
    customData?: Record<string, any>;
  };
}

export interface ArcPaymentSession {
  sessionId: string;
  paymentRequestId: string;
  circleTransferId?: string;
  status: "qr_generated" | "initiated" | "processing" | "completed" | "failed";
  request: ArcPaymentRequest;
  qrData?: ArcQRData;
  circleTransferResponse?: ArcTransferResponse;
  settlementStatus?: ArcSettlementStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  errors: Array<{
    timestamp: string;
    message: string;
    code?: string;
  }>;
}

export interface ArcPaymentMetrics {
  totalPayments: number;
  totalVolume: string;
  totalFees: string;
  averageSettlementTime: number;
  successRate: number;
  arcBlockchainAttestation: {
    successRate: number;
    averageCollectionTime: number;
  };
}

// ============================================================================
// Arc Payment Service
// ============================================================================

class ArcPaymentService {
  private arcClient: CircleGatewayClient;
  private activeSessions: Map<string, ArcPaymentSession> = new Map();
  private sessionTimeout = 300000; // 5 minutes
  private wsSubscriptions: Map<string, ArcPaymentSession> = new Map();
  private paymentInstances: number = 0;

  constructor() {
    // Initialize Arc Gateway client with environment config
    this.arcClient = createArcGatewayClient();

    // Clean up expired sessions periodically
    setInterval(() => this.cleanupExpiredSessions(), 60000); // Every minute
  }

  /**
   * Initiate Arc payment and generate QR code
   *
   * Flow:
   * 1. Validate payment request
   * 2. Check Arc liquidity for source→destination pair
   * 3. Generate EIP-681 QR code via arcQRService
   * 4. Create payment session for tracking
   * 5. Return QR data and session ID
   */
  async initiatePayment(request: ArcPaymentRequest): Promise<ArcPaymentSession> {
    this.paymentInstances++;
    console.log(`[Arc Payment Service] Initiating payment #${this.paymentInstances}`);

    const sessionId = uuidv4();
    const paymentRequestId = uuidv4();

    try {
      // Validate request
      this.validatePaymentRequest(request);

      // Check Arc liquidity
      const feeQuote = await this.arcClient.getArcFeeQuote(
        request.sourceChainId,
        request.destinationChainId,
        request.amount
      );

      if (!feeQuote.liquidity.available) {
        throw new Error(
          `Insufficient Arc liquidity for transfer. Need ${request.amount} USDC, available ${feeQuote.liquidity.amountAvailable}`
        );
      }

      // Generate QR code via Arc QR Service
      const qrData = await arcQRService.generateArcPaymentQR({
        ...request,
        metadata: {
          ...request.metadata,
          sessionId,
          paymentRequestId,
        },
      });

      // Create payment session
      const session: ArcPaymentSession = {
        sessionId,
        paymentRequestId,
        status: "qr_generated",
        request,
        qrData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.sessionTimeout).toISOString(),
        errors: [],
      };

      // Cache session
      this.activeSessions.set(sessionId, session);

      console.log(`[Arc Payment Service] Payment QR generated: ${sessionId}`);
      return session;
    } catch (error) {
      console.error(
        `[Arc Payment Service] Payment initiation failed: ${(error as Error).message}`
      );
      throw error;
    }
  }

  /**
   * Process signed transaction and initiate Arc transfer
   *
   * Called after wallet signs the transaction from QR code
   * Communicates with Circle Arc Gateway to initiate settlement
   */
  async processSignedTransaction(
    sessionId: string,
    senderAddress: string,
    transactionHash?: string
  ): Promise<ArcPaymentSession> {
    console.log(`[Arc Payment Service] Processing signed transaction: ${sessionId}`);

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Payment session not found: ${sessionId}`);
    }

    try {
      // Update session with sender info
      session.request.senderAddress = senderAddress;
      session.status = "initiated";
      session.updatedAt = new Date().toISOString();

      // Create Arc transfer request
      const transferRequest: ArcTransferRequest = {
        idempotencyKey: uuidv4(),
        sourceChainId: session.request.sourceChainId,
        destinationChainId: session.request.destinationChainId,
        senderAddress,
        recipientAddress: session.request.recipientAddress,
        amount: session.request.amount,
        settlementRequired: true,
        attestationRequired: true,
      };

      // Initiate transfer with Circle Arc Gateway
      const transferResponse = await this.arcClient.initiateTransfer(transferRequest);
      session.circleTransferId = transferResponse.transferId;
      session.circleTransferResponse = transferResponse;
      session.status = "processing";

      console.log(
        `[Arc Payment Service] Transfer initiated: ${transferResponse.transferId}`
      );

      // Subscribe to settlement updates via WebSocket
      this.subscribeToSettlementUpdates(session);

      // Update session
      this.activeSessions.set(sessionId, session);
      return session;
    } catch (error) {
      session.errors.push({
        timestamp: new Date().toISOString(),
        message: (error as Error).message,
        code: "TRANSFER_INITIATION_FAILED",
      });
      session.status = "failed";
      this.activeSessions.set(sessionId, session);
      throw error;
    }
  }

  /**
   * Check Arc settlement status for a payment
   *
   * Returns current status including:
   * - CCTP burn/mint confirmations
   * - Arc Blockchain transaction ID
   * - Attestation collection progress (3-5 required)
   * - Overall finality status
   */
  async checkSettlementStatus(sessionId: string): Promise<ArcPaymentSession> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Payment session not found: ${sessionId}`);
    }

    if (!session.circleTransferId) {
      throw new Error(`Transfer not initiated for session: ${sessionId}`);
    }

    try {
      const settlementStatus = await this.arcClient.checkSettlementStatus(
        session.circleTransferId
      );

      session.settlementStatus = settlementStatus;
      session.status = this.mapSettlementStatusToSessionStatus(settlementStatus.status);
      session.updatedAt = new Date().toISOString();

      this.activeSessions.set(sessionId, session);
      return session;
    } catch (error) {
      console.error(`[Arc Payment Service] Status check failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Subscribe to real-time Arc settlement updates via WebSocket
   *
   * Receives notifications when:
   * - CCTP burn transaction is confirmed
   * - Arc Blockchain accepts transfer for settlement
   * - Destination chain mint transaction completes
   * - Attestation signatures are collected (3-5 required)
   * - Settlement reaches finality
   */
  private subscribeToSettlementUpdates(session: ArcPaymentSession): void {
    if (!session.circleTransferId) return;

    this.wsSubscriptions.set(session.sessionId, session);

    const onMessage = (message: ArcWebSocketMessage) => {
      const currentSession = this.activeSessions.get(session.sessionId);
      if (!currentSession) return;

      if (message.type === "settlement:status") {
        console.log(
          `[Arc Payment Service] Settlement status update: ${message.data.status}`
        );

        currentSession.status = this.mapWebSocketStatusToSessionStatus(
          message.data.status
        );
      } else if (message.type === "blockchain:confirmation") {
        console.log(
          `[Arc Payment Service] Blockchain confirmation: depth=${message.data.confirmationDepth}, tx=${message.data.arcBlockchainTxId}`
        );

        if (currentSession.settlementStatus) {
          currentSession.settlementStatus.confirmationDepth =
            message.data.confirmationDepth || 0;
          currentSession.settlementStatus.arcBlockchainTxId =
            message.data.arcBlockchainTxId;
        }

        // Check if settlement is final (6+ confirmations)
        if (
          message.data.confirmationDepth &&
          message.data.confirmationDepth >= 6
        ) {
          currentSession.status = "completed";
        }
      } else if (message.type === "error") {
        console.error(
          `[Arc Payment Service] Settlement error: ${message.data.message}`
        );
        currentSession.status = "failed";
        currentSession.errors.push({
          timestamp: new Date().toISOString(),
          message: message.data.message || "Unknown error",
          code: "SETTLEMENT_ERROR",
        });
      }

      currentSession.updatedAt = new Date().toISOString();
      this.activeSessions.set(session.sessionId, currentSession);
    };

    const onError = (error: Error) => {
      console.error(`[Arc Payment Service] WebSocket error: ${error.message}`);
      const currentSession = this.activeSessions.get(session.sessionId);
      if (currentSession) {
        currentSession.errors.push({
          timestamp: new Date().toISOString(),
          message: error.message,
          code: "WEBSOCKET_ERROR",
        });
        this.activeSessions.set(session.sessionId, currentSession);
      }
    };

    this.arcClient.subscribeToSettlementUpdates(
      [session.circleTransferId],
      onMessage,
      onError
    );
  }

  /**
   * Poll settlement status (alternative to WebSocket)
   *
   * Useful for clients without WebSocket support
   * Polls Arc Gateway every 500ms for up to 60 seconds
   */
  async pollSettlementCompletion(sessionId: string): Promise<ArcPaymentSession> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.circleTransferId) {
      throw new Error(`Invalid payment session: ${sessionId}`);
    }

    try {
      const finalStatus = await this.arcClient.pollTransferStatus(
        session.circleTransferId,
        120, // Max 60 seconds (120 * 500ms)
        500
      );

      session.settlementStatus = finalStatus;
      session.status =
        finalStatus.status === "completed"
          ? "completed"
          : finalStatus.status === "failed"
            ? "failed"
            : "processing";
      session.updatedAt = new Date().toISOString();

      this.activeSessions.set(sessionId, session);
      return session;
    } catch (error) {
      console.error(
        `[Arc Payment Service] Poll completion failed: ${(error as Error).message}`
      );
      throw error;
    }
  }

  /**
   * Verify Arc Blockchain attestations
   *
   * Circle requires 3-5 attesters to sign off on CCTP transfers
   * This verifies that requisite number of attesters have approved
   */
  async verifyAttestations(sessionId: string): Promise<{
    verified: boolean;
    collected: number;
    required: number;
    percentage: number;
  }> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.circleTransferId) {
      throw new Error(`Invalid payment session: ${sessionId}`);
    }

    try {
      const attestations = await this.arcClient.verifyAttestations(
        session.circleTransferId
      );

      return {
        verified: attestations.verified,
        collected: attestations.count,
        required: attestations.required,
        percentage: (attestations.count / attestations.required) * 100,
      };
    } catch (error) {
      console.error(
        `[Arc Payment Service] Attestation verification failed: ${(error as Error).message}`
      );
      throw error;
    }
  }

  /**
   * Get active payment session
   */
  async getPaymentSession(sessionId: string): Promise<ArcPaymentSession> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Payment session not found: ${sessionId}`);
    }

    return session;
  }

  /**
   * Get fee estimate for Arc transfer
   */
  async getFeeEstimate(
    sourceChainId: number,
    destinationChainId: number,
    amount: string
  ): Promise<ArcFeeQuote> {
    return this.arcClient.getArcFeeQuote(sourceChainId, destinationChainId, amount);
  }

  /**
   * Cancel payment session
   */
  async cancelPayment(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Payment session not found: ${sessionId}`);
    }

    // Unsubscribe from WebSocket if subscribed
    if (session.circleTransferId) {
      this.arcClient.unsubscribeFromSettlementUpdates(session.circleTransferId);
    }

    // Remove from active sessions and subscriptions
    this.activeSessions.delete(sessionId);
    this.wsSubscriptions.delete(sessionId);

    console.log(`[Arc Payment Service] Payment cancelled: ${sessionId}`);
  }

  /**
   * Generate payment metrics and reporting
   */
  async getPaymentMetrics(
    filter?: { terminalType?: string; status?: string }
  ): Promise<ArcPaymentMetrics> {
    const sessions = Array.from(this.activeSessions.values());

    const filtered = sessions.filter((s) => {
      if (filter?.terminalType && s.request.terminalType !== filter.terminalType)
        return false;
      if (filter?.status && s.status !== filter.status) return false;
      return true;
    });

    const totalPayments = filtered.length;
    const completedPayments = filtered.filter((s) => s.status === "completed").length;
    const successRate =
      totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0;

    const totalVolume = filtered
      .reduce((sum, s) => sum + parseFloat(s.request.amount), 0)
      .toFixed(2);

    const totalFees = filtered
      .reduce(
        (sum, s) =>
          sum +
          (s.circleTransferResponse?.fee
            ? parseFloat(s.circleTransferResponse.fee)
            : 0),
        0
      )
      .toFixed(2);

    const settlementTimes = filtered
      .filter((s) => s.settlementStatus !== undefined)
      .map((s) => s.circleTransferResponse?.estimatedSettlementTime || 0);

    const averageSettlementTime =
      settlementTimes.length > 0
        ? settlementTimes.reduce((a, b) => a + b, 0) / settlementTimes.length
        : 0;

    // Attestation metrics
    const attestationData = filtered
      .filter((s) => s.settlementStatus?.arcAttestationStatus)
      .map((s) => s.settlementStatus!.arcAttestationStatus);

    const attestationSuccessRate =
      attestationData.length > 0
        ? (attestationData.filter(
            (a) => a.collected >= a.required
          ).length /
            attestationData.length) *
          100
        : 0;

    return {
      totalPayments,
      totalVolume,
      totalFees,
      averageSettlementTime: Math.round(averageSettlementTime),
      successRate: Math.round(successRate * 100) / 100,
      arcBlockchainAttestation: {
        successRate: Math.round(attestationSuccessRate * 100) / 100,
        averageCollectionTime: 3000, // Placeholder - would aggregate from actual data
      },
    };
  }

  /**
   * Cleanup expired sessions (called periodically)
   */
  private cleanupExpiredSessions(): void {
    const now = new Date().getTime();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.activeSessions) {
      if (new Date(session.expiresAt).getTime() < now) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      this.activeSessions.delete(sessionId);
      this.wsSubscriptions.delete(sessionId);
      console.log(`[Arc Payment Service] Expired session cleaned up: ${sessionId}`);
    }
  }

  /**
   * Validate payment request
   */
  private validatePaymentRequest(request: ArcPaymentRequest): void {
    if (!/^0x[a-fA-F0-9]{40}$/.test(request.recipientAddress)) {
      throw new Error("Invalid recipient address format");
    }

    const amount = parseFloat(request.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Amount must be a positive number");
    }

    if (request.sourceChainId === request.destinationChainId) {
      throw new Error("Source and destination chains must be different");
    }

    const validTerminalTypes = ["pos", "ar_viewer", "artm"];
    if (!validTerminalTypes.includes(request.terminalType)) {
      throw new Error(`Invalid terminal type: ${request.terminalType}`);
    }
  }

  /**
   * Map Circle settlement status to session status
   */
  private mapSettlementStatusToSessionStatus(
    status: "pending" | "processing" | "completed" | "failed"
  ): "qr_generated" | "initiated" | "processing" | "completed" | "failed" {
    switch (status) {
      case "completed":
        return "completed";
      case "failed":
        return "failed";
      default:
        return "processing";
    }
  }

  /**
   * Map WebSocket status message to session status
   */
  private mapWebSocketStatusToSessionStatus(
    status: string | undefined
  ): "qr_generated" | "initiated" | "processing" | "completed" | "failed" {
    if (!status) return "processing";
    if (status.includes("completed")) return "completed";
    if (status.includes("failed") || status.includes("error")) return "failed";
    return "processing";
  }

  /**
   * Disconnect and cleanup on shutdown
   */
  shutdown(): void {
    this.arcClient.disconnect();
    this.activeSessions.clear();
    this.wsSubscriptions.clear();
    console.log("[Arc Payment Service] Shutdown complete");
  }
}

// Export singleton instance
export const arcPaymentService = new ArcPaymentService();

export default ArcPaymentService;
