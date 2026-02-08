/**
 * Arc Blockchain QR Payment Service
 *
 * Generates Arc Blockchain-compatible QR codes for USDC transfers across 12 supported chains.
 * Implements EIP-681 URI encoding with Arc Gateway routing and MetaMask integration.
 *
 * Architecture:
 * - Arc Gateway (UX layer): Chain detection, fee estimation
 * - CCTP Protocol (mechanics): Burn/mint operations
 * - Arc Blockchain (settlement): Deterministic settlement with attestations
 *
 * Reference: https://eips.ethereum.org/EIPS/eip-681
 */

import { arcUSdcContracts } from "../config/arc-usdc-contracts.json";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ArcChainConfig {
  chainId: number;
  network: string;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  usdc: {
    address: string;
    decimals: number;
  };
  environment: "testnet" | "mainnet";
}

export interface ArcPaymentRequest {
  recipientAddress: string;
  amount: string; // In USDC (e.g., "100.50")
  sourceChainId: number;
  destinationChainId: number;
  agentId: string;
  terminalType: "pos" | "ar_viewer" | "artm";
  metadata?: {
    description?: string;
    referenceId?: string;
    customData?: Record<string, any>;
  };
}

export interface ArcQRData {
  qrText: string; // EIP-681 URI for QR encoding
  deepLink: string; // MetaMask mobile deep link
  walletConnect: string; // WalletConnect v2 URI
  metadata: {
    requestId: string;
    createdAt: string;
    expiresAt: string;
    sourceChain: string;
    destinationChain: string;
    estimatedFee: string;
    settlementTime: string;
  };
}

export interface ArcFeeEstimate {
  baseFee: string; // Gateway fee in USDC
  percentageFee: string; // Percentage (typically 0.1%)
  totalFee: string; // Total fee in USDC
  totalAmount: string; // Amount + fee
  estimatedSettlementMs: number; // Expected settlement time in milliseconds
}

export interface ArcChainPair {
  source: string;
  destination: string;
  supported: boolean;
  routeType: "direct" | "arc_liquidity_pool";
  estimatedTime: number; // milliseconds
}

// ============================================================================
// Main Arc QR Service
// ============================================================================

class ArcQRService {
  private supportedChains: Map<number, ArcChainConfig> = new Map();
  private requestCache: Map<string, { data: ArcQRData; timestamp: number }> =
    new Map();
  private cacheTimeout = 600000; // 10 minutes
  private feePercentage = parseFloat(
    process.env.VITE_ARC_GATEWAY_FEE_PERCENTAGE || "0.1"
  );
  private settlementTimeMs = parseInt(
    process.env.VITE_ARC_SETTLEMENT_TIME_MS || "5000"
  ); // 5 seconds default

  constructor() {
    this.initializeSupportedChains();
  }

  /**
   * Initialize mapping of supported Arc chains from config
   */
  private initializeSupportedChains(): void {
    // Testnet chains
    const testnetChains = arcUSdcContracts.testnet || [];
    testnetChains.forEach((chain) => {
      this.supportedChains.set(chain.chainId, {
        chainId: chain.chainId,
        network: chain.network,
        name: chain.name,
        rpcUrl: chain.rpcUrl,
        explorerUrl: chain.explorerUrl,
        usdc: {
          address: chain.usdc.address,
          decimals: chain.usdc.decimals,
        },
        environment: "testnet",
      });
    });

    // Mainnet chains
    const mainnetChains = arcUSdcContracts.mainnet || [];
    mainnetChains.forEach((chain) => {
      this.supportedChains.set(chain.chainId, {
        chainId: chain.chainId,
        network: chain.network,
        name: chain.name,
        rpcUrl: chain.rpcUrl,
        explorerUrl: chain.explorerUrl,
        usdc: {
          address: chain.usdc.address,
          decimals: chain.usdc.decimals,
        },
        environment: "mainnet",
      });
    });

    console.log(
      `[Arc QR Service] Initialized with ${this.supportedChains.size} supported chains`
    );
  }

  /**
   * Generate Arc Blockchain EIP-681 QR payment request
   *
   * EIP-681 Format: ethereum:<chainId>:<recipientAddress>?value=<amount>&data=<calldata>
   * Arc Extension: Arc Blockchain settlement proof in query parameters
   *
   * Reference:
   * - https://eips.ethereum.org/EIPS/eip-681 (EIP-681: Ethereum URI Scheme)
   * - https://docs.circle.com/arc/transfer-flow (Arc settlement flow)
   */
  async generateArcPaymentQR(request: ArcPaymentRequest): Promise<ArcQRData> {
    // Validate request
    this.validatePaymentRequest(request);

    // Check cache
    const requestId = this.generateRequestId(request);
    const cached = this.requestCache.get(requestId);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Get chain configurations
    const sourceChain = this.supportedChains.get(request.sourceChainId);
    const destChain = this.supportedChains.get(request.destinationChainId);

    if (!sourceChain || !destChain) {
      throw new Error(`Unsupported chain pair: ${request.sourceChainId} → ${request.destinationChainId}`);
    }

    // Calculate fees
    const feeEstimate = this.estimateArcFee(request.amount);

    // Generate Arc Gateway address (would be Circle's actual gateway address in production)
    const arcGatewayAddress = process.env.VITE_ARC_GATEWAY_ADDRESS ||
      "0x1234567890123456789012345678901234567890";

    // Build EIP-681 URI with Arc Blockchain parameters
    const eip681Uri = this.buildEIP681URI(
      sourceChain,
      arcGatewayAddress,
      request,
      feeEstimate
    );

    // Generate Arc-specific deep links
    const deepLink = this.generateMetaMaskDeepLink(eip681Uri);
    const walletConnectUri = this.generateWalletConnectURI(request, feeEstimate);

    // Create Arc QR data with settlement metadata
    const qrData: ArcQRData = {
      qrText: eip681Uri,
      deepLink,
      walletConnect: walletConnectUri,
      metadata: {
        requestId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 minutes
        sourceChain: sourceChain.name,
        destinationChain: destChain.name,
        estimatedFee: feeEstimate.totalFee,
        settlementTime: this.formatSettlementTime(feeEstimate.estimatedSettlementMs),
      },
    };

    // Cache result
    this.requestCache.set(requestId, { data: qrData, timestamp: Date.now() });

    return qrData;
  }

  /**
   * Build EIP-681 URI with Arc Blockchain settlement parameters
   *
   * Structure:
   * ethereum:<chainId>:<arcGateway>?function=transferWithArc&to=<recipient>&amount=<amount>&destinationChain=<chainId>&fee=<fee>&...
   */
  private buildEIP681URI(
    sourceChain: ArcChainConfig,
    arcGatewayAddress: string,
    request: ArcPaymentRequest,
    feeEstimate: ArcFeeEstimate
  ): string {
    const destChain = this.supportedChains.get(request.destinationChainId)!;

    // Convert amount to smallest unit (USDC has 6 decimals)
    const amountInSmallestUnit = (
      parseFloat(request.amount) * Math.pow(10, sourceChain.usdc.decimals)
    ).toString();

    const feeInSmallestUnit = (
      parseFloat(feeEstimate.totalFee) * Math.pow(10, sourceChain.usdc.decimals)
    ).toString();

    // Build query parameters with Arc Blockchain settlement info
    const params = new URLSearchParams({
      // EIP-681 standard parameters
      function: "transfer",
      address: sourceChain.usdc.address,
      uint256: amountInSmallestUnit,
      to: request.recipientAddress,

      // Arc Gateway routing
      arcGateway: arcGatewayAddress,
      arcSourceChain: request.sourceChainId.toString(),
      arcDestinationChain: request.destinationChainId.toString(),
      arcFeePercentage: this.feePercentage.toString(),
      arcFeeAmount: feeInSmallestUnit,

      // Arc Blockchain settlement
      arcSettlementRequired: "true",
      arcAttestation: "true", // Require Circle attesters
      arcConfirmationDepth: "6", // 6+ confirmations on Arc

      // Terminal & tracking
      terminalType: request.terminalType,
      agentId: request.agentId,
      timestamp: Date.now().toString(),

      // Optional metadata (URL-encoded)
      ...(request.metadata && {
        description: encodeURIComponent(request.metadata.description || ""),
        referenceId: request.metadata.referenceId || "",
      }),
    });

    // EIP-681 format: ethereum:<chainId>:<address>?function=<function>&<params>
    return `ethereum:${sourceChain.chainId}:${arcGatewayAddress}?${params.toString()}`;
  }

  /**
   * Generate MetaMask deep link for mobile wallets
   *
   * MetaMask deep link format: metamask://dapp?url=<encodedUri>
   */
  private generateMetaMaskDeepLink(eip681Uri: string): string {
    // For mobile MetaMask, we encode the EIP-681 URI
    const encodedUri = encodeURIComponent(eip681Uri);
    return `metamask://dapp?url=${encodedUri}`;
  }

  /**
   * Generate WalletConnect v2 URI for broader wallet support
   */
  private generateWalletConnectURI(
    request: ArcPaymentRequest,
    feeEstimate: ArcFeeEstimate
  ): string {
    // WalletConnect v2 support for transfers
    // This would integrate with WalletConnect v2 SDK in production
    const payload = {
      protocol: "wc",
      version: 2,
      method: "eth_sendTransaction",
      chainId: request.sourceChainId,
      transaction: {
        to: process.env.VITE_ARC_GATEWAY_ADDRESS,
        from: "", // Wallet fills this in
        value: "0",
        data: this.encodeTransferCalldata(request, feeEstimate),
      },
      arc: {
        destinationChain: request.destinationChainId,
        recipient: request.recipientAddress,
        amount: request.amount,
        fee: feeEstimate.totalFee,
        settlementRequired: true,
      },
    };

    return JSON.stringify(payload);
  }

  /**
   * Encode Arc transfer transaction calldata
   * This would call the Arc Gateway's transfer function
   */
  private encodeTransferCalldata(
    _request: ArcPaymentRequest,
    _feeEstimate: ArcFeeEstimate
  ): string {
    // In production, this would use ethers.js or web3.js to encode
    // the actual function call based on Arc Gateway ABI
    // For now, return placeholder
    return "0x"; // Placeholder - actual encoding would happen here
  }

  /**
   * Estimate fees for Arc transfer
   *
   * Fee calculation:
   * baseFee = amount * (feePercentage / 100)
   * totalFee = baseFee (rounded up)
   * totalAmount = amount + totalFee
   */
  private estimateArcFee(amount: string): ArcFeeEstimate {
    const amountNum = parseFloat(amount);
    const baseFee = (amountNum * this.feePercentage) / 100;
    const totalFee = Math.ceil(baseFee * 100) / 100; // Round up to 2 decimals
    const totalAmount = amountNum + totalFee;

    return {
      baseFee: baseFee.toFixed(8),
      percentageFee: this.feePercentage.toFixed(1),
      totalFee: totalFee.toFixed(8),
      totalAmount: totalAmount.toFixed(8),
      estimatedSettlementMs: this.settlementTimeMs,
    };
  }

  /**
   * Estimate settlement time for Arc chain pair
   */
  async estimateSettlementTime(
    sourceChainId: number,
    destinationChainId: number
  ): Promise<number> {
    // Arc Blockchain settlement time varies by network congestion
    // Typically: 5-30 seconds depending on chains
    const baseTime = this.settlementTimeMs;
    const congestionFactor = 1.0; // Would be fetched from Arc monitoring

    return Math.ceil(baseTime * congestionFactor);
  }

  /**
   * Validate payment request before processing
   */
  private validatePaymentRequest(request: ArcPaymentRequest): void {
    // Validate amount
    const amount = parseFloat(request.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount: must be a positive number");
    }

    if (amount > 1000000) {
      throw new Error("Amount exceeds Arc maximum transfer limit (1M USDC)");
    }

    // Validate recipient address
    if (!/^0x[a-fA-F0-9]{40}$/.test(request.recipientAddress)) {
      throw new Error("Invalid recipient address: must be valid Ethereum address");
    }

    // Validate chains
    if (!this.supportedChains.has(request.sourceChainId)) {
      throw new Error(`Unsupported source chain: ${request.sourceChainId}`);
    }

    if (!this.supportedChains.has(request.destinationChainId)) {
      throw new Error(`Unsupported destination chain: ${request.destinationChainId}`);
    }

    // Validate chain pair (no same-chain transfers)
    if (request.sourceChainId === request.destinationChainId) {
      throw new Error(
        "Source and destination chains must be different for Arc transfers"
      );
    }

    // Validate terminal type
    const validTerminalTypes = ["pos", "ar_viewer", "artm"];
    if (!validTerminalTypes.includes(request.terminalType)) {
      throw new Error(`Invalid terminal type: ${request.terminalType}`);
    }
  }

  /**
   * Generate unique request ID for caching and tracking
   */
  private generateRequestId(request: ArcPaymentRequest): string {
    return `arc-${request.agentId}-${request.sourceChainId}-${request.destinationChainId}-${Date.now()}`;
  }

  /**
   * Format settlement time for display
   */
  private formatSettlementTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.round(seconds / 60);
    return `${minutes}m`;
  }

  /**
   * Get all supported chains for Arc Gateway
   */
  getSupportedChains(): ArcChainConfig[] {
    return Array.from(this.supportedChains.values());
  }

  /**
   * Get supported chains by environment
   */
  getSupportedChainsByEnvironment(
    environment: "testnet" | "mainnet"
  ): ArcChainConfig[] {
    return Array.from(this.supportedChains.values()).filter(
      (chain) => chain.environment === environment
    );
  }

  /**
   * Check if a chain pair is supported for Arc transfers
   */
  isChainPairSupported(
    sourceChainId: number,
    destinationChainId: number
  ): ArcChainPair {
    const sourceChain = this.supportedChains.get(sourceChainId);
    const destChain = this.supportedChains.get(destinationChainId);

    const supported =
      !!sourceChain &&
      !!destChain &&
      sourceChainId !== destinationChainId &&
      sourceChain.environment === destChain.environment; // Same environment for now

    return {
      source: sourceChain?.name || "Unknown",
      destination: destChain?.name || "Unknown",
      supported,
      routeType: supported ? "arc_liquidity_pool" : "direct",
      estimatedTime: supported ? this.settlementTimeMs : -1,
    };
  }

  /**
   * Clear cache for testing purposes
   */
  clearCache(): void {
    this.requestCache.clear();
  }
}

// Export singleton instance
export const arcQRService = new ArcQRService();

export default arcQRService;
