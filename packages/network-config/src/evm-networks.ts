import type { NetworkConfig } from "@cubepay/types";

/**
 * EVM Network Configurations
 */

export const ETHEREUM_SEPOLIA: NetworkConfig = {
  id: "ethereum-sepolia",
  name: "sepolia",
  displayName: "Ethereum Sepolia",
  type: "evm",
  environment: "testnet",
  chainId: 11155111,
  rpcUrls: [
    "https://sepolia.infura.io/v3/",
    "https://eth-sepolia.public.blastapi.io",
    "https://rpc.sepolia.org",
  ],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
  nativeCurrency: {
    name: "Sepolia ETH",
    symbol: "ETH",
    decimals: 18,
  },
  iconUrl: "/icons/ethereum.svg",
  isEnabled: true,
  isTestnet: true,
  priority: 1,
};

export const ARBITRUM_SEPOLIA: NetworkConfig = {
  id: "arbitrum-sepolia",
  name: "arbitrum-sepolia",
  displayName: "Arbitrum Sepolia",
  type: "evm",
  environment: "testnet",
  chainId: 421614,
  rpcUrls: [
    "https://sepolia-rollup.arbitrum.io/rpc",
    "https://arbitrum-sepolia.blockpi.network/v1/rpc/public",
  ],
  blockExplorerUrls: ["https://sepolia.arbiscan.io"],
  nativeCurrency: {
    name: "Arbitrum ETH",
    symbol: "ETH",
    decimals: 18,
  },
  iconUrl: "/icons/arbitrum.svg",
  isEnabled: true,
  isTestnet: true,
  priority: 2,
};

export const BASE_SEPOLIA: NetworkConfig = {
  id: "base-sepolia",
  name: "base-sepolia",
  displayName: "Base Sepolia",
  type: "evm",
  environment: "testnet",
  chainId: 84532,
  rpcUrls: [
    "https://sepolia.base.org",
    "https://base-sepolia.blockpi.network/v1/rpc/public",
  ],
  blockExplorerUrls: ["https://sepolia.basescan.org"],
  nativeCurrency: {
    name: "Base ETH",
    symbol: "ETH",
    decimals: 18,
  },
  iconUrl: "/icons/base.svg",
  isEnabled: true,
  isTestnet: true,
  priority: 3,
};

export const OPTIMISM_SEPOLIA: NetworkConfig = {
  id: "optimism-sepolia",
  name: "optimism-sepolia",
  displayName: "Optimism Sepolia",
  type: "evm",
  environment: "testnet",
  chainId: 11155420,
  rpcUrls: [
    "https://sepolia.optimism.io",
    "https://optimism-sepolia.blockpi.network/v1/rpc/public",
  ],
  blockExplorerUrls: ["https://sepolia-optimism.etherscan.io"],
  nativeCurrency: {
    name: "Optimism ETH",
    symbol: "ETH",
    decimals: 18,
  },
  iconUrl: "/icons/optimism.svg",
  isEnabled: true,
  isTestnet: true,
  priority: 4,
};

export const AVALANCHE_FUJI: NetworkConfig = {
  id: "avalanche-fuji",
  name: "avalanche-fuji",
  displayName: "Avalanche Fuji",
  type: "evm",
  environment: "testnet",
  chainId: 43113,
  rpcUrls: [
    "https://api.avax-test.network/ext/bc/C/rpc",
    "https://avalanche-fuji-c-chain.publicnode.com",
  ],
  blockExplorerUrls: ["https://testnet.snowtrace.io"],
  nativeCurrency: {
    name: "AVAX",
    symbol: "AVAX",
    decimals: 18,
  },
  iconUrl: "/icons/avalanche.svg",
  isEnabled: true,
  isTestnet: true,
  priority: 5,
};

export const POLYGON_AMOY: NetworkConfig = {
  id: "polygon-amoy",
  name: "polygon-amoy",
  displayName: "Polygon Amoy",
  type: "evm",
  environment: "testnet",
  chainId: 80002,
  rpcUrls: [
    "https://rpc-amoy.polygon.technology",
    "https://polygon-amoy.blockpi.network/v1/rpc/public",
  ],
  blockExplorerUrls: ["https://amoy.polygonscan.com"],
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  iconUrl: "/icons/polygon.svg",
  isEnabled: true,
  isTestnet: true,
  priority: 6,
};

export const EVM_NETWORKS: NetworkConfig[] = [
  ETHEREUM_SEPOLIA,
  ARBITRUM_SEPOLIA,
  BASE_SEPOLIA,
  OPTIMISM_SEPOLIA,
  AVALANCHE_FUJI,
  POLYGON_AMOY,
];
