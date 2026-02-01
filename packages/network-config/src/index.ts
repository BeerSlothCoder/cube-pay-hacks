/**
 * @cubepay/network-config
 * Multi-chain network configurations
 */

import type { NetworkConfig } from "@cubepay/types";
import { EVM_NETWORKS } from "./evm-networks";
import { SOLANA_NETWORKS } from "./solana-networks";
import { HEDERA_NETWORKS } from "./hedera-networks";

// Export individual network configs
export * from "./evm-networks";
export * from "./solana-networks";
export * from "./hedera-networks";
export * from "./tokens";

// All networks combined
export const ALL_NETWORKS: NetworkConfig[] = [
  ...EVM_NETWORKS,
  ...SOLANA_NETWORKS,
  ...HEDERA_NETWORKS,
];

// Enabled networks only (testnets by default)
export const ENABLED_NETWORKS = ALL_NETWORKS.filter((n) => n.isEnabled);

// Network lookup utilities
export function getNetworkById(id: string): NetworkConfig | undefined {
  return ALL_NETWORKS.find((n) => n.id === id);
}

export function getNetworkByChainId(
  chainId: number,
): NetworkConfig | undefined {
  return ALL_NETWORKS.find((n) => n.chainId === chainId);
}

export function getNetworksByType(
  type: "evm" | "solana" | "hedera",
): NetworkConfig[] {
  return ALL_NETWORKS.filter((n) => n.type === type);
}

export function getTestnetNetworks(): NetworkConfig[] {
  return ALL_NETWORKS.filter((n) => n.isTestnet);
}

export function getMainnetNetworks(): NetworkConfig[] {
  return ALL_NETWORKS.filter((n) => !n.isTestnet);
}

// Default network for initial connection
export const DEFAULT_NETWORK = ENABLED_NETWORKS[0]; // Ethereum Sepolia
