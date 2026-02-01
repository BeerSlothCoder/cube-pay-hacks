import type { NetworkConfig } from "@cubepay/types";

/**
 * Solana Network Configurations
 */

export const SOLANA_DEVNET: NetworkConfig = {
  id: "solana-devnet",
  name: "solana-devnet",
  displayName: "Solana Devnet",
  type: "solana",
  environment: "devnet",
  rpcUrls: [
    "https://api.devnet.solana.com",
    "https://devnet.helius-rpc.com/?api-key=<API_KEY>",
  ],
  blockExplorerUrls: ["https://explorer.solana.com/?cluster=devnet"],
  nativeCurrency: {
    name: "SOL",
    symbol: "SOL",
    decimals: 9,
  },
  commitment: "confirmed",
  iconUrl: "/icons/solana.svg",
  isEnabled: true,
  isTestnet: true,
  priority: 7,
};

export const SOLANA_MAINNET: NetworkConfig = {
  id: "solana-mainnet",
  name: "solana-mainnet",
  displayName: "Solana Mainnet",
  type: "solana",
  environment: "mainnet",
  rpcUrls: [
    "https://api.mainnet-beta.solana.com",
    "https://solana-api.projectserum.com",
  ],
  blockExplorerUrls: ["https://explorer.solana.com"],
  nativeCurrency: {
    name: "SOL",
    symbol: "SOL",
    decimals: 9,
  },
  commitment: "confirmed",
  iconUrl: "/icons/solana.svg",
  isEnabled: false, // Disabled by default for testing
  isTestnet: false,
  priority: 100,
};

export const SOLANA_NETWORKS: NetworkConfig[] = [SOLANA_DEVNET, SOLANA_MAINNET];
