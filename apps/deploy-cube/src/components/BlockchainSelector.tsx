import React, { useState } from "react";
import { EVM_NETWORKS } from "@cubepay/network-config";
import type { NetworkConfig } from "@cubepay/types";
import { Network, Check, ChevronDown } from "lucide-react";

interface BlockchainSelectorProps {
  selectedChainId: number;
  onSelect: (network: NetworkConfig) => void;
}

export const BlockchainSelector: React.FC<BlockchainSelectorProps> = ({
  selectedChainId,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get all available networks
  const allNetworks = Object.values(EVM_NETWORKS).filter(
    (network) => network.isEnabled,
  );

  // Filter networks based on search
  const filteredNetworks = allNetworks.filter(
    (network) =>
      network.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      network.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Find selected network
  const selectedNetwork = allNetworks.find(
    (network) => network.chainId === selectedChainId,
  );

  const handleSelect = (network: NetworkConfig) => {
    onSelect(network);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-cream mb-2">
        Blockchain Network *
      </label>

      {/* Selected Network Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-left flex items-center justify-between hover:border-gray-600 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Network className="w-5 h-5 text-blue-400" />
          {selectedNetwork ? (
            <div>
              <div className="text-cream font-medium">
                {selectedNetwork.displayName}
              </div>
              <div className="text-sm text-gray-400">
                Chain ID: {selectedNetwork.chainId}
                {selectedNetwork.isTestnet && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                    Testnet
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span className="text-gray-400">Select a network...</span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-96 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-700">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search networks..."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-cream placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
              autoFocus
            />
          </div>

          {/* Network List */}
          <div className="overflow-y-auto max-h-80">
            {filteredNetworks.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                No networks found
              </div>
            ) : (
              filteredNetworks.map((network) => (
                <button
                  key={network.chainId}
                  type="button"
                  onClick={() => handleSelect(network)}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700 transition-colors ${
                    network.chainId === selectedChainId ? "bg-gray-700" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                      {network.iconUrl ? (
                        <img
                          src={network.iconUrl}
                          alt={network.displayName}
                          className="w-5 h-5"
                        />
                      ) : (
                        <Network className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-cream font-medium text-sm">
                        {network.displayName}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-2">
                        <span>Chain ID: {network.chainId}</span>
                        {network.isTestnet && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                            Testnet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {network.chainId === selectedChainId && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Network Stats */}
          <div className="p-3 bg-gray-900 border-t border-gray-700 text-xs text-gray-400">
            Showing {filteredNetworks.length} of {allNetworks.length} networks
          </div>
        </div>
      )}

      {/* Selected Network Details */}
      {selectedNetwork && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h4 className="text-sm font-semibold text-cream mb-3">
            Network Details
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Name:</span>
              <span className="text-cream">{selectedNetwork.displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Chain ID:</span>
              <span className="text-cream font-mono">
                {selectedNetwork.chainId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="text-cream uppercase">
                {selectedNetwork.type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Environment:</span>
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  selectedNetwork.isTestnet
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {selectedNetwork.environment}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Native Currency:</span>
              <span className="text-cream">
                {selectedNetwork.nativeCurrency.symbol}
              </span>
            </div>
            {selectedNetwork.blockExplorerUrls && (
              <div className="flex justify-between">
                <span className="text-gray-400">Explorer:</span>
                <a
                  href={selectedNetwork.blockExplorerUrls[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  View
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RPC URLs (for debugging) */}
      {selectedNetwork && selectedNetwork.rpcUrls && (
        <div className="mt-2 p-3 bg-gray-900 rounded border border-gray-800">
          <details className="text-xs">
            <summary className="text-gray-400 cursor-pointer hover:text-gray-300">
              RPC Endpoints ({selectedNetwork.rpcUrls.length})
            </summary>
            <div className="mt-2 space-y-1">
              {selectedNetwork.rpcUrls.map((url, idx) => (
                <div key={idx} className="text-gray-500 font-mono break-all">
                  {url}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};
