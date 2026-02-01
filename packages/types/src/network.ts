/**
 * Blockchain Network Types
 * Multi-chain support for EVM, Solana, Hedera
 */

export type NetworkType = "evm" | "solana" | "hedera";

export type NetworkEnvironment = "mainnet" | "testnet" | "devnet";

export interface NetworkConfig {
  id: string;
  name: string;
  displayName: string;
  type: NetworkType;
  environment: NetworkEnvironment;

  // EVM-specific
  chainId?: number;
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };

  // Solana-specific
  commitment?: "processed" | "confirmed" | "finalized";

  // Hedera-specific
  accountId?: string;

  // Common
  iconUrl?: string;
  isEnabled: boolean;
  isTestnet: boolean;
  priority?: number;
}

export interface TokenConfig {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  iconUrl?: string;
  coingeckoId?: string;
  isNative?: boolean;
  isStablecoin?: boolean;
}

export interface NetworkTokens {
  networkId: string;
  tokens: TokenConfig[];
}

export interface WalletBalance {
  network: string;
  token: string;
  balance: string;
  balanceFormatted: string;
  balanceUsd?: number;
  lastUpdated: string;
}

export interface TransactionRequest {
  network: string;
  from: string;
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}
