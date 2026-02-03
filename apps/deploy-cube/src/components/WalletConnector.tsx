import React, { useState } from "react";
import { Wallet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { createWalletConnector } from "@cubepay/wallet-connector";
import { EVM_NETWORKS } from "@cubepay/network-config";

interface WalletConnectorProps {
  onWalletConnect?: (address: string, chainId: number) => void;
  onWalletDisconnect?: () => void;
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({
  onWalletConnect,
  onWalletDisconnect,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connector = createWalletConnector();

  const getCurrentNetwork = () => {
    if (!chainId) return null;
    return EVM_NETWORKS.find((n) => n.chainId === chainId);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Connect with MetaMask
      const walletState = await connector.connect("metamask");

      if (walletState.address && walletState.chainId) {
        setWalletAddress(walletState.address);
        setChainId(walletState.chainId);
        setIsConnected(true);

        // Get USDC balance (mock for now)
        setBalance("5.000000");

        if (onWalletConnect) {
          onWalletConnect(walletState.address, walletState.chainId);
        }
      }
    } catch (err: any) {
      console.error("Wallet connection failed:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setChainId(null);
    setBalance("0");
    setIsConnected(false);
    setError(null);

    if (onWalletDisconnect) {
      onWalletDisconnect();
    }
  };

  const network = getCurrentNetwork();

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border-2 border-gray-700/50 mb-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg shadow-blue-500/50">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cream">
                Connect Wallet
              </h3>
              <p className="text-sm text-gray-400">
                Connect your wallet to deploy agents
              </p>
            </div>
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="group px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3 font-semibold text-lg"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Connect Wallet
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-gradient-to-r from-red-900/30 to-red-800/30 backdrop-blur-sm border-2 border-red-500/50 rounded-xl flex items-start gap-3 shadow-lg shadow-red-500/20">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 font-medium">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-900/30 via-green-900/20 to-blue-900/30 backdrop-blur-xl rounded-2xl p-8 border-2 border-emerald-500/40 mb-8 shadow-2xl shadow-emerald-500/20">
      {/* Wallet Address */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Connected Wallet</p>
            <p className="text-lg font-mono text-cream">
              {formatAddress(walletAddress!)}
            </p>
          </div>
        </div>

        <button
          onClick={handleDisconnect}
          className="px-6 py-3 bg-gray-800/80 backdrop-blur-sm text-gray-300 rounded-xl hover:bg-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-105 font-medium border border-gray-700/50"
        >
          Disconnect
        </button>
      </div>

      {/* Balance */}
      <div className="mb-6 p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 font-medium text-lg">
            USDC Balance:
          </span>
          <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
            {balance} USDC
          </span>
        </div>
      </div>

      {/* Network Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Network:</span>
          <div className="flex items-center gap-2">
            <span className="text-cream font-medium">
              {network?.name || "Unknown Network"}
            </span>
            {network && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                {network.name.includes("Sepolia") ? "Testnet" : "Mainnet"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">Chain ID:</span>
          <span className="text-cream font-mono">{chainId}</span>
        </div>

        {network && (
          <>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">
                Network supported ✓
              </span>
            </div>
            <div className="text-xs text-gray-500">
              RPC: {network.rpcUrls[0]}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
