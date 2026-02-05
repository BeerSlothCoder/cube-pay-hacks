import React, { useState } from "react";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { EVM_NETWORKS } from "@cubepay/network-config";
import type { AgentType } from "@cubepay/types";
import { normalizeAgentType, getAgentTypeMetadata } from "../utils/agentTypeMapping";

const AGENT_TYPES: { value: AgentType; label: string; emoji: string }[] = [
  { value: "Virtual Terminal", label: "Virtual ATM", emoji: "🏧" },
  { value: "Payment Terminal", label: "Payment Terminal - POS", emoji: "💳" },
  { value: "Content Creator", label: "My Payment Terminal", emoji: "💰" },
];

const PAYMENT_METHODS = [
  {
    value: "direct",
    label: "Direct Payment",
    description: "Pay directly on one chain",
  },
  {
    value: "arc",
    label: "Arc Cross-Chain",
    description: "Pay from any chain via Circle Arc",
  },
  { value: "ens", label: "ENS Payment", description: "Pay using ENS domain" },
];

const TOKENS = [
  { symbol: "USDC", name: "USD Coin" },
  { symbol: "USDH", name: "USD Hedera" },
];

interface FilterPanelProps {
  onFilterChange?: (filters: AgentFilters) => void;
  onClose?: () => void;
}

export interface AgentFilters {
  agentTypes: AgentType[];
  blockchains: number[];
  tokens: string[];
  paymentMethods: string[];
  distanceKm: number;
  feeMin: number;
  feeMax: number;
  cubeEnabled?: boolean;
  paymentEnabled?: boolean;
  ensEnabled?: boolean;
  ensVerifiedOnly?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  onFilterChange,
  onClose,
}) => {
  const [filters, setFilters] = useState<AgentFilters>({
    agentTypes: [],
    blockchains: [],
    tokens: ["USDC"],
    paymentMethods: [],
    distanceKm: 5,
    feeMin: 0,
    feeMax: 100,
    cubeEnabled: true,
    paymentEnabled: true,
    ensEnabled: false,
    ensVerifiedOnly: false,
  });

  const [expandedSections, setExpandedSections] = useState({
    agentTypes: true,
    blockchains: false,
    tokens: false,
    payment: false,
    ens: false,
    distance: true,
    fees: false,
    advanced: false,
  });

  const allNetworks = Object.values(EVM_NETWORKS).filter((n) => n.isEnabled);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilters = (updates: Partial<AgentFilters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const toggleAgentType = (type: AgentType) => {
    const newTypes = filters.agentTypes.includes(type)
      ? filters.agentTypes.filter((t) => t !== type)
      : [...filters.agentTypes, type];
    updateFilters({ agentTypes: newTypes });
  };

  const toggleBlockchain = (chainId: number) => {
    const newChains = filters.blockchains.includes(chainId)
      ? filters.blockchains.filter((id) => id !== chainId)
      : [...filters.blockchains, chainId];
    updateFilters({ blockchains: newChains });
  };

  const toggleToken = (symbol: string) => {
    const newTokens = filters.tokens.includes(symbol)
      ? filters.tokens.filter((t) => t !== symbol)
      : [...filters.tokens, symbol];
    updateFilters({ tokens: newTokens });
  };

  const togglePaymentMethod = (method: string) => {
    const newMethods = filters.paymentMethods.includes(method)
      ? filters.paymentMethods.filter((m) => m !== method)
      : [...filters.paymentMethods, method];
    updateFilters({ paymentMethods: newMethods });
  };

  const clearAllFilters = () => {
    const clearedFilters: AgentFilters = {
      agentTypes: [],
      blockchains: [],
      tokens: ["USDC"],
      paymentMethods: [],
      distanceKm: 5,
      feeMin: 0,
      feeMax: 100,
      cubeEnabled: true,
      paymentEnabled: true,
      ensEnabled: false,
      ensVerifiedOnly: false,
    };
    setFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const getActiveFilterCount = () => {
    return (
      filters.agentTypes.length +
      filters.blockchains.length +
      (filters.tokens.length > 1 ? 1 : 0) +
      filters.paymentMethods.length
    );
  };

  const renderSectionHeader = (
    title: string,
    section: keyof typeof expandedSections,
    count?: number,
  ) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between py-3 px-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold text-cream">{title}</span>
        {count !== undefined && count > 0 && (
          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
            {count}
          </span>
        )}
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-cream">Filters</h2>
            {getActiveFilterCount() > 0 && (
              <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-800 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
        <button
          onClick={clearAllFilters}
          className="w-full px-3 py-2 bg-red-600/20 border border-red-600/40 rounded text-sm text-red-400 hover:bg-red-600/30 transition-colors"
        >
          Clear All Filters
        </button>
      </div>

      {/* Filter Sections */}
      <div className="p-4 space-y-4">
        {/* Agent Types */}
        <div>
          {renderSectionHeader(
            "Agent Types",
            "agentTypes",
            filters.agentTypes.length,
          )}
          {expandedSections.agentTypes && (
            <div className="mt-2 space-y-2">
              {AGENT_TYPES.map((type) => (
                <label
                  key={type.value}
                  className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.agentTypes.includes(type.value)}
                    onChange={() => toggleAgentType(type.value)}
                    className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xl">{type.emoji}</span>
                  <span className="text-sm text-gray-300">{type.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Blockchains */}
        <div>
          {renderSectionHeader(
            "Blockchains",
            "blockchains",
            filters.blockchains.length,
          )}
          {expandedSections.blockchains && (
            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
              {allNetworks.map((network) => (
                <label
                  key={network.chainId}
                  className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.blockchains.includes(network.chainId)}
                    onChange={() => toggleBlockchain(network.chainId)}
                    className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  {network.iconUrl && (
                    <img
                      src={network.iconUrl}
                      alt={network.displayName}
                      className="w-5 h-5"
                    />
                  )}
                  <div className="flex-1">
                    <div className="text-sm text-gray-300">
                      {network.displayName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Chain {network.chainId}
                    </div>
                  </div>
                  {network.isTestnet && (
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                      Test
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Tokens */}
        <div>
          {renderSectionHeader("Tokens", "tokens", filters.tokens.length)}
          {expandedSections.tokens && (
            <div className="mt-2 space-y-2">
              {TOKENS.map((token) => (
                <label
                  key={token.symbol}
                  className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.tokens.includes(token.symbol)}
                    onChange={() => toggleToken(token.symbol)}
                    className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-gray-300 font-semibold">
                      {token.symbol}
                    </div>
                    <div className="text-xs text-gray-500">{token.name}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div>
          {renderSectionHeader(
            "Payment Methods",
            "payment",
            filters.paymentMethods.length,
          )}
          {expandedSections.payment && (
            <div className="mt-2 space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className="flex items-start gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.paymentMethods.includes(method.value)}
                    onChange={() => togglePaymentMethod(method.value)}
                    className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500 mt-1"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-gray-300">{method.label}</div>
                    <div className="text-xs text-gray-500">
                      {method.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Distance Radius */}
        <div>
          {renderSectionHeader("Distance", "distance")}
          {expandedSections.distance && (
            <div className="mt-2 px-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Radius:</span>
                <span className="text-sm text-cream font-semibold">
                  {filters.distanceKm} km
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={filters.distanceKm}
                onChange={(e) =>
                  updateFilters({ distanceKm: parseFloat(e.target.value) })
                }
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>100m</span>
                <span>5km</span>
                <span>10km</span>
              </div>
            </div>
          )}
        </div>

        {/* Fee Range */}
        <div>
          {renderSectionHeader("Fee Range", "fees")}
          {expandedSections.fees && (
            <div className="mt-2 px-2 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Min Fee (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={filters.feeMax}
                    value={filters.feeMin}
                    onChange={(e) =>
                      updateFilters({ feeMin: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-cream text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Max Fee (%)
                  </label>
                  <input
                    type="number"
                    min={filters.feeMin}
                    max="100"
                    value={filters.feeMax}
                    onChange={(e) =>
                      updateFilters({
                        feeMax: parseFloat(e.target.value) || 100,
                      })
                    }
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-cream text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ENS Filters */}
        <div>
          {renderSectionHeader("ENS Payments", "ens")}
          {expandedSections.ens && (
            <div className="mt-2 space-y-3">
              <label className="flex items-center justify-between p-2 rounded hover:bg-gray-800 cursor-pointer transition-colors">
                <span className="text-sm text-gray-300">ENS Enabled</span>
                <input
                  type="checkbox"
                  checked={filters.ensEnabled || false}
                  onChange={(e) =>
                    updateFilters({ ensEnabled: e.target.checked })
                  }
                  className="w-4 h-4 text-amber-500 rounded focus:ring-2 focus:ring-amber-500"
                />
              </label>
              <label className="flex items-center justify-between p-2 rounded hover:bg-gray-800 cursor-pointer transition-colors">
                <span className="text-sm text-gray-300">Verified Only</span>
                <input
                  type="checkbox"
                  checked={filters.ensVerifiedOnly || false}
                  onChange={(e) =>
                    updateFilters({ ensVerifiedOnly: e.target.checked })
                  }
                  className="w-4 h-4 text-green-500 rounded focus:ring-2 focus:ring-green-500"
                  disabled={!filters.ensEnabled}
                />
              </label>
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        <div>
          {renderSectionHeader("Advanced", "advanced")}
          {expandedSections.advanced && (
            <div className="mt-2 space-y-3">
              <label className="flex items-center justify-between p-2 rounded hover:bg-gray-800 cursor-pointer transition-colors">
                <span className="text-sm text-gray-300">Cube Enabled</span>
                <input
                  type="checkbox"
                  checked={filters.cubeEnabled}
                  onChange={(e) =>
                    updateFilters({ cubeEnabled: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between p-2 rounded hover:bg-gray-800 cursor-pointer transition-colors">
                <span className="text-sm text-gray-300">Payment Enabled</span>
                <input
                  type="checkbox"
                  checked={filters.paymentEnabled}
                  onChange={(e) =>
                    updateFilters({ paymentEnabled: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Filter Summary */}
      <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-4">
        <div className="text-xs text-gray-400 text-center">
          {getActiveFilterCount()} active filter
          {getActiveFilterCount() !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
};
