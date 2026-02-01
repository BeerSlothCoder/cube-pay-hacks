import type { NetworkTokens, TokenConfig } from "@cubepay/types";

/**
 * Token Configurations for Each Network
 */

// Solana Tokens
export const SOLANA_DEVNET_TOKENS: TokenConfig[] = [
  {
    address: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    isNative: true,
    iconUrl: "/icons/solana.svg",
  },
  {
    address: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // Devnet USDC
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    isStablecoin: true,
    iconUrl: "/icons/usdc.svg",
  },
];

// Hedera Tokens
export const HEDERA_TESTNET_TOKENS: TokenConfig[] = [
  {
    address: "0.0.0",
    symbol: "HBAR",
    name: "Hedera",
    decimals: 8,
    isNative: true,
    iconUrl: "/icons/hedera.svg",
  },
  {
    address: "0.0.1234567", // USDH testnet token
    symbol: "USDH",
    name: "Hedera USD",
    decimals: 6,
    isStablecoin: true,
    iconUrl: "/icons/usdh.svg",
  },
];

// EVM Testnets - all support native ETH/MATIC/AVAX
export const EVM_TESTNET_TOKENS: TokenConfig[] = [
  {
    address: "native",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    isNative: true,
    iconUrl: "/icons/ethereum.svg",
  },
  {
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia USDC
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    isStablecoin: true,
    iconUrl: "/icons/usdc.svg",
  },
];

export const NETWORK_TOKENS: NetworkTokens[] = [
  {
    networkId: "ethereum-sepolia",
    tokens: EVM_TESTNET_TOKENS,
  },
  {
    networkId: "arbitrum-sepolia",
    tokens: EVM_TESTNET_TOKENS,
  },
  {
    networkId: "base-sepolia",
    tokens: EVM_TESTNET_TOKENS,
  },
  {
    networkId: "optimism-sepolia",
    tokens: EVM_TESTNET_TOKENS,
  },
  {
    networkId: "avalanche-fuji",
    tokens: [
      {
        address: "native",
        symbol: "AVAX",
        name: "Avalanche",
        decimals: 18,
        isNative: true,
        iconUrl: "/icons/avalanche.svg",
      },
      ...EVM_TESTNET_TOKENS.filter((t) => !t.isNative),
    ],
  },
  {
    networkId: "polygon-amoy",
    tokens: [
      {
        address: "native",
        symbol: "MATIC",
        name: "Polygon",
        decimals: 18,
        isNative: true,
        iconUrl: "/icons/polygon.svg",
      },
      ...EVM_TESTNET_TOKENS.filter((t) => !t.isNative),
    ],
  },
  {
    networkId: "solana-devnet",
    tokens: SOLANA_DEVNET_TOKENS,
  },
  {
    networkId: "hedera-testnet",
    tokens: HEDERA_TESTNET_TOKENS,
  },
];

export function getTokensForNetwork(networkId: string): TokenConfig[] {
  const networkTokens = NETWORK_TOKENS.find((nt) => nt.networkId === networkId);
  return networkTokens?.tokens || [];
}

export function getTokenBySymbol(
  networkId: string,
  symbol: string,
): TokenConfig | undefined {
  const tokens = getTokensForNetwork(networkId);
  return tokens.find((t) => t.symbol === symbol);
}
