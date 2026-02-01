import type { NetworkConfig } from "@cubepay/types";

/**
 * Hedera Network Configurations
 */

export const HEDERA_TESTNET: NetworkConfig = {
  id: "hedera-testnet",
  name: "hedera-testnet",
  displayName: "Hedera Testnet",
  type: "hedera",
  environment: "testnet",
  rpcUrls: [
    "https://testnet.hashio.io/api",
    "https://pool.arkhia.io/hedera/testnet/json-rpc/v1",
  ],
  blockExplorerUrls: ["https://hashscan.io/testnet"],
  nativeCurrency: {
    name: "HBAR",
    symbol: "HBAR",
    decimals: 8,
  },
  accountId: "0.0.0",
  iconUrl: "/icons/hedera.svg",
  isEnabled: true,
  isTestnet: true,
  priority: 8,
};

export const HEDERA_MAINNET: NetworkConfig = {
  id: "hedera-mainnet",
  name: "hedera-mainnet",
  displayName: "Hedera Mainnet",
  type: "hedera",
  environment: "mainnet",
  rpcUrls: [
    "https://mainnet.hashio.io/api",
    "https://pool.arkhia.io/hedera/mainnet/json-rpc/v1",
  ],
  blockExplorerUrls: ["https://hashscan.io/mainnet"],
  nativeCurrency: {
    name: "HBAR",
    symbol: "HBAR",
    decimals: 8,
  },
  accountId: "0.0.0",
  iconUrl: "/icons/hedera.svg",
  isEnabled: false, // Disabled by default for testing
  isTestnet: false,
  priority: 101,
};

export const HEDERA_NETWORKS: NetworkConfig[] = [
  HEDERA_TESTNET,
  HEDERA_MAINNET,
];
