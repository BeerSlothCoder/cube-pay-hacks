import React, { useState } from "react";
import { Zap, Info, Check } from "lucide-react";
import { EVM_NETWORKS } from "@cubepay/network-config";

interface ARCGatewayConfigProps {
  enabled: boolean;
  feePercentage: number;
  supportedChains: number[];
  onEnabledChange: (enabled: boolean) => void;
  onFeeChange: (fee: number) => void;
  onChainsChange: (chains: number[]) => void;
}

export const ARCGatewayConfig: React.FC<ARCGatewayConfigProps> = ({
  enabled,
  feePercentage,
  supportedChains,
  onEnabledChange,
  onFeeChange,
  onChainsChange,
}) => {
  const [showChainSelector, setShowChainSelector] = useState(false);

  // Get all available EVM networks
  const allNetworks = Object.values(EVM_NETWORKS).filter((n) => n.isEnabled);

  const toggleChain = (chainId: number) => {
    if (supportedChains.includes(chainId)) {
      onChainsChange(supportedChains.filter((id) => id !== chainId));
    } else {
      onChainsChange([...supportedChains, chainId]);
    }
  };

  const selectAllChains = () => {
    onChainsChange(allNetworks.map((n) => n.chainId));
  };

  const clearAllChains = () => {
    onChainsChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${enabled ? "bg-blue-500/20" : "bg-gray-700"}`}
          >
            <Zap
              className={`w-5 h-5 ${enabled ? "text-blue-400" : "text-gray-500"}`}
            />
          </div>
          <div>
            <h3 className="text-cream font-semibold">Circle Arc Gateway</h3>
            <p className="text-sm text-gray-400">
              Enable cross-chain payments via Arc
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onEnabledChange(!enabled)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            enabled ? "bg-blue-600" : "bg-gray-600"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Arc Info */}
      {enabled && (
        <>
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-blue-400 mb-2">
                  What is Circle Arc Gateway?
                </p>
                <p className="mb-2">
                  Arc is Circle's cross-chain liquidity solution that enables
                  users to pay with USDC from any supported chain, even if your
                  agent only accepts payments on one specific chain.
                </p>
                <p>
                  <strong>Example:</strong> User has USDC on Base, your agent
                  accepts on Ethereum - Arc handles the bridge automatically
                  with a small fee.
                </p>
              </div>
            </div>
          </div>

          {/* Gateway Fee */}
          <div>
            <label className="block text-sm font-medium text-cream mb-2">
              Gateway Fee (%)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                value={feePercentage}
                onChange={(e) => onFeeChange(parseFloat(e.target.value))}
                min="0"
                max="2"
                step="0.01"
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-cream text-center font-mono">
                {feePercentage.toFixed(2)}%
              </div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>Free (0%)</span>
              <span>Recommended: 0.1%</span>
              <span>Max (2%)</span>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              This fee covers the cost of cross-chain bridging. Circle
              recommends 0.1%.
            </p>
          </div>

          {/* Supported Chains */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-cream">
                Supported Chains ({supportedChains.length} selected)
              </label>
              <button
                type="button"
                onClick={() => setShowChainSelector(!showChainSelector)}
                className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-cream hover:bg-gray-700"
              >
                {showChainSelector ? "Hide Chains" : "Select Chains"}
              </button>
            </div>

            {supportedChains.length === 0 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 text-sm">
                ⚠️ Select at least one chain to enable Arc Gateway
              </div>
            )}

            {/* Selected Chains Preview */}
            {supportedChains.length > 0 && !showChainSelector && (
              <div className="flex flex-wrap gap-2">
                {supportedChains.map((chainId) => {
                  const network = allNetworks.find(
                    (n) => n.chainId === chainId,
                  );
                  return network ? (
                    <div
                      key={chainId}
                      className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/40 rounded-lg text-sm text-blue-300 flex items-center gap-2"
                    >
                      {network.iconUrl && (
                        <img
                          src={network.iconUrl}
                          alt={network.displayName}
                          className="w-4 h-4"
                        />
                      )}
                      {network.displayName}
                    </div>
                  ) : null;
                })}
              </div>
            )}

            {/* Chain Selector */}
            {showChainSelector && (
              <div className="space-y-3">
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllChains}
                    className="px-3 py-1.5 bg-green-600/20 border border-green-600/40 rounded text-xs text-green-400 hover:bg-green-600/30"
                  >
                    Select All ({allNetworks.length})
                  </button>
                  <button
                    type="button"
                    onClick={clearAllChains}
                    className="px-3 py-1.5 bg-red-600/20 border border-red-600/40 rounded text-xs text-red-400 hover:bg-red-600/30"
                  >
                    Clear All
                  </button>
                </div>

                {/* Chain Grid */}
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 bg-gray-900 rounded-lg border border-gray-700">
                  {allNetworks.map((network) => {
                    const isSelected = supportedChains.includes(
                      network.chainId,
                    );
                    return (
                      <button
                        key={network.chainId}
                        type="button"
                        onClick={() => toggleChain(network.chainId)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? "border-blue-500 bg-blue-500/20"
                            : "border-gray-700 bg-gray-800 hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {network.iconUrl && (
                              <img
                                src={network.iconUrl}
                                alt={network.displayName}
                                className="w-5 h-5"
                              />
                            )}
                            <span
                              className={`text-sm font-semibold ${
                                isSelected ? "text-blue-300" : "text-gray-300"
                              }`}
                            >
                              {network.displayName}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <div
                          className={`text-xs ${isSelected ? "text-blue-400" : "text-gray-500"}`}
                        >
                          Chain ID: {network.chainId}
                        </div>
                        {network.isTestnet && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                            Testnet
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Fee Calculation Example */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h4 className="text-sm font-semibold text-cream mb-3">
              Fee Calculation Example
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Amount:</span>
                <span className="text-cream">$100.00 USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Arc Gateway Fee ({feePercentage}%):
                </span>
                <span className="text-yellow-400">
                  ${((100 * feePercentage) / 100).toFixed(2)} USDC
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-700">
                <span className="text-gray-400 font-semibold">
                  You Receive:
                </span>
                <span className="text-green-400 font-semibold">
                  ${(100 - (100 * feePercentage) / 100).toFixed(2)} USDC
                </span>
              </div>
            </div>
          </div>

          {/* Arc Benefits */}
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <h4 className="text-sm font-semibold text-green-400 mb-2">
              Benefits of Arc Gateway
            </h4>
            <ul className="space-y-1 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>
                  Accept payments from 12+ chains with a single wallet address
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>
                  Automatic cross-chain bridging - no manual transfers needed
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>
                  Lower fees than traditional bridges (typically 0.1-0.5%)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Faster settlement times compared to native bridges</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>
                  Unified USDC balance view across all supported chains
                </span>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
