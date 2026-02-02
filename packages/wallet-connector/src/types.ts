/**
 * Payment Method Types for 6-Faced Cube
 */

export type PaymentFace =
  | "crypto-qr" // Face 1: Arc Chain Abstraction (USDC QR payments)
  | "virtual-card" // Face 2: Revolut + USDC integration
  | "sound-pay" // Face 3: Coming Soon
  | "voice-pay" // Face 4: Coming Soon
  | "on-off-ramp" // Face 5: USDC ↔ Fiat onboarding
  | "ens-payment"; // Face 6: ENS merchant payments

export interface PaymentFaceConfig {
  face: PaymentFace;
  enabled: boolean;
  icon?: string;
  label: string;
  description: string;
  comingSoon?: boolean;
}

export const PAYMENT_FACES: Record<PaymentFace, PaymentFaceConfig> = {
  "crypto-qr": {
    face: "crypto-qr",
    enabled: true,
    label: "Crypto QR Payment",
    description: "Pay with USDC from any chain using Arc abstraction",
    icon: "💳",
  },
  "virtual-card": {
    face: "virtual-card",
    enabled: true,
    label: "Virtual Card",
    description: "Revolut virtual card + USDC payments",
    icon: "💰",
  },
  "sound-pay": {
    face: "sound-pay",
    enabled: false,
    label: "Sound Pay",
    description: "Pay with sound waves",
    icon: "🔊",
    comingSoon: true,
  },
  "voice-pay": {
    face: "voice-pay",
    enabled: false,
    label: "Voice Pay",
    description: "Voice-activated payments",
    icon: "🎤",
    comingSoon: true,
  },
  "on-off-ramp": {
    face: "on-off-ramp",
    enabled: true,
    label: "On/Off Ramp",
    description: "Convert between USDC and fiat",
    icon: "🏦",
  },
  "ens-payment": {
    face: "ens-payment",
    enabled: true,
    label: "ENS Payment",
    description: "Pay merchants via ENS names",
    icon: "🏷️",
  },
};

/**
 * Wallet Connection Types
 */

export type WalletType =
  | "circle" // Circle Wallets (unified)
  | "metamask" // MetaMask (EVM)
  | "phantom" // Phantom (Solana)
  | "hashpack"; // HashPack (Hedera)

export interface WalletState {
  type: WalletType | null;
  connected: boolean;
  address: string | null;
  chainId: string | null;
  balance: string | null;
  ensName?: string | null;
}

export interface WalletConnectionOptions {
  autoConnect?: boolean;
  preferredWallet?: WalletType;
}

/**
 * Circle Arc Configuration
 */

export interface ArcConfig {
  gatewayEnabled: boolean;
  bridgeKitEnabled: boolean;
  instantTransfers: boolean;
  unifiedBalance: boolean;
}

/**
 * ENS Configuration
 */

export interface ENSConfig {
  enabled: boolean;
  resolveNames: boolean;
  reverseResolve: boolean;
  supportedChains: string[];
}

/**
 * Chain Abstraction Configuration
 */

export interface ChainAbstractionConfig {
  // Arc (Circle) - Primary
  arc: ArcConfig;

  // ENS - For merchant payments
  ens: ENSConfig;

  // Chainlink CCIP - Keep for future
  chainlink?: {
    enabled: boolean;
    lanes: string[];
  };

  // LI.FI - Fallback routing
  lifi?: {
    enabled: boolean;
    apiKey?: string;
  };
}

/**
 * Payment Transaction with Chain Abstraction
 */

export interface ChainAbstractedPayment {
  // User side (source)
  sourceChain?: string; // Optional - Arc abstracts this
  sourceToken: "USDC" | "USDh";
  sourceAmount: string;

  // Destination (agent/merchant)
  destinationChain: string;
  destinationToken: "USDC" | "USDh";
  destinationAddress: string;
  destinationENS?: string; // Optional ENS name

  // Arc routing
  useArcGateway: boolean;
  instantSettlement: boolean;

  // Payment face
  paymentFace: PaymentFace;

  // Metadata
  agentId?: string;
  merchantId?: string;
  description?: string;
}

/**
 * Wallet Connector Events
 */

export interface WalletEvents {
  connect: (wallet: WalletState) => void;
  disconnect: () => void;
  accountChanged: (address: string) => void;
  chainChanged: (chainId: string) => void;
  balanceChanged: (balance: string) => void;
  error: (error: Error) => void;
}

/**
 * Transaction Status
 */

export interface TransactionStatus {
  hash: string;
  status: "pending" | "confirmed" | "failed";
  confirmations: number;
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
}

/**
 * Arc Gateway Balance
 */

export interface ArcUnifiedBalance {
  totalUSDC: string;
  balancesByChain: Record<string, string>;
  availableForInstantTransfer: boolean;
}
