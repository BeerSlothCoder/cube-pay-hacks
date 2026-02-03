import React from "react";

export interface BlockchainOption {
  id: number;
  name: string;
  symbol: string;
  icon?: string;
  testnet: boolean;
  type: "evm" | "solana" | "hedera";
}

interface BlockchainSelectorProps {
  value: number;
  onChange: (chainId: number) => void;
  className?: string;
}

const BLOCKCHAIN_OPTIONS: BlockchainOption[] = [
  // EVM Chains
  {
    id: 11155111,
    name: "Ethereum Sepolia",
    symbol: "ETH",
    testnet: true,
    type: "evm",
  },
  {
    id: 84532,
    name: "Base Sepolia",
    symbol: "ETH",
    testnet: true,
    type: "evm",
  },
  {
    id: 421614,
    name: "Arbitrum Sepolia",
    symbol: "ETH",
    testnet: true,
    type: "evm",
  },
  {
    id: 11155420,
    name: "Optimism Sepolia",
    symbol: "ETH",
    testnet: true,
    type: "evm",
  },
  {
    id: 80002,
    name: "Polygon Amoy",
    symbol: "MATIC",
    testnet: true,
    type: "evm",
  },
  {
    id: 43113,
    name: "Avalanche Fuji",
    symbol: "AVAX",
    testnet: true,
    type: "evm",
  },
  { id: 97, name: "BNB Testnet", symbol: "BNB", testnet: true, type: "evm" },
  {
    id: 59141,
    name: "Linea Sepolia",
    symbol: "ETH",
    testnet: true,
    type: "evm",
  },
  {
    id: 534351,
    name: "Scroll Sepolia",
    symbol: "ETH",
    testnet: true,
    type: "evm",
  },

  // Non-EVM Chains
  {
    id: 900,
    name: "Solana Devnet",
    symbol: "SOL",
    testnet: true,
    type: "solana",
  },
  {
    id: 295,
    name: "Hedera Testnet",
    symbol: "HBAR",
    testnet: true,
    type: "hedera",
  },
];

export const BlockchainSelector: React.FC<BlockchainSelectorProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const selectedChain = BLOCKCHAIN_OPTIONS.find((chain) => chain.id === value);

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm text-gray-300 mb-2">Select Network</label>

      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 cursor-pointer appearance-none"
      >
        <optgroup label="EVM Chains">
          {BLOCKCHAIN_OPTIONS.filter((chain) => chain.type === "evm").map(
            (chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name} ({chain.symbol}) {chain.testnet ? "🧪" : ""}
              </option>
            ),
          )}
        </optgroup>

        <optgroup label="Other Chains">
          {BLOCKCHAIN_OPTIONS.filter((chain) => chain.type !== "evm").map(
            (chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name} ({chain.symbol}) {chain.testnet ? "🧪" : ""}
              </option>
            ),
          )}
        </optgroup>
      </select>

      {selectedChain && (
        <div className="mt-2 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                selectedChain.type === "evm"
                  ? "bg-blue-500"
                  : selectedChain.type === "solana"
                    ? "bg-purple-500"
                    : "bg-green-500"
              }`}
            ></span>
            {selectedChain.type.toUpperCase()} • Chain ID: {selectedChain.id}
          </span>
        </div>
      )}
    </div>
  );
};

export { BLOCKCHAIN_OPTIONS };
