/**
 * ARTMDisplayModal Component
 * Main interface for Virtual Terminal (ARTM) agents
 * Multi-screen state machine: main_menu → wallet_permission → wallet_connecting → wallet_balance
 * Real MetaMask integration for balance reading via ethers.js
 */

import React, { useState, useCallback } from "react";
import { ethers } from "ethers";
import type { DeployedObject } from "@cubepay/types";
import Z_INDEX from "../config/zIndexConfig";
import CryptoWithdrawalModal from "./CryptoWithdrawalModal";

// ERC-20 ABI (balanceOf + decimals + transfer)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

// USDC contract addresses by chain ID
const USDC_CONTRACTS: Record<number, string> = {
  1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Ethereum Mainnet
  11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia
  421614: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // Arbitrum Sepolia
  84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia
  11155420: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7", // OP Sepolia
  43113: "0x5425890298aed601595a70AB815c96711a31Bc65", // Avalanche Fuji
  296: "0x0000000000000000000000000000000000000000", // Hedera Testnet (placeholder)
  137: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // Polygon
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base
  10: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // Optimism
};

// Network names by chain ID
const NETWORK_NAMES: Record<number, string> = {
  1: "Ethereum Mainnet",
  11155111: "Sepolia Testnet",
  421614: "Arbitrum Sepolia",
  84532: "Base Sepolia",
  11155420: "OP Sepolia",
  43113: "Avalanche Fuji",
  296: "Hedera Testnet",
  137: "Polygon",
  42161: "Arbitrum",
  8453: "Base",
  10: "Optimism",
};

type ARTMScreen =
  | "main_menu"
  | "wallet_permission"
  | "wallet_connecting"
  | "wallet_balance";

interface ARTMDisplayModalProps {
  agent: DeployedObject;
  onCardClick: () => void;
  onWalletClick: () => void;
  onClose: () => void;
}

export const ARTMDisplayModal: React.FC<ARTMDisplayModalProps> = ({
  agent,
  onCardClick,
  onWalletClick: _onWalletClick,
  onClose,
}) => {
  const [screen, setScreen] = useState<ARTMScreen>("main_menu");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<string>("0");
  const [walletNetwork, setWalletNetwork] = useState<string>("");
  const [chainId, setChainId] = useState<number>(0);
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [connectError, setConnectError] = useState<string>("");
  const [showCryptoWithdrawal, setShowCryptoWithdrawal] = useState(false);

  // Get supported banks from agent config
  const supportedBanks =
    (agent as any).bank_integrations?.join(", ") || "Revolut";

  // Get recipient address from agent
  const recipientAddress =
    (agent as any).agent_wallet_address ||
    (agent as any).payment_recipient_address ||
    (agent as any).deployer_wallet_address ||
    (agent as any).deployer_address ||
    agent.payment_config?.payment_address ||
    agent.revenue_share?.agent_wallet ||
    "";

  // Handle MetaMask wallet balance read
  const handleWalletBalance = useCallback(async () => {
    setScreen("wallet_connecting");
    setConnectError("");

    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("MetaMask is not installed");
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);

      // Request account access (triggers MetaMask popup)
      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned from MetaMask");
      }

      const address = accounts[0];
      setWalletAddress(address);

      // Get network info
      const network = await provider.getNetwork();
      const cId = Number(network.chainId);
      setChainId(cId);
      setWalletNetwork(NETWORK_NAMES[cId] || `Chain ${cId}`);

      // Read ETH balance
      const ethBal = await provider.getBalance(address);
      setEthBalance(ethers.formatEther(ethBal));

      // Read USDC balance if contract exists for this chain
      const usdcAddress = USDC_CONTRACTS[cId];
      if (
        usdcAddress &&
        usdcAddress !== "0x0000000000000000000000000000000000000000"
      ) {
        const contract = new ethers.Contract(usdcAddress, ERC20_ABI, provider);
        const decimals = await contract.decimals();
        const balance = await contract.balanceOf(address);
        setWalletBalance(ethers.formatUnits(balance, decimals));
      } else {
        setWalletBalance("0");
      }

      setScreen("wallet_balance");
    } catch (err: any) {
      console.error("Wallet connect error:", err);
      if (err.code === 4001) {
        setConnectError("Connection rejected by user");
      } else {
        setConnectError(err.message || "Failed to connect wallet");
      }
      // Stay on connecting screen to show error with retry
    }
  }, []);

  // Show CryptoWithdrawalModal
  if (showCryptoWithdrawal) {
    return (
      <CryptoWithdrawalModal
        agent={agent}
        walletAddress={walletAddress}
        walletBalance={walletBalance}
        walletNetwork={walletNetwork}
        chainId={chainId}
        ethBalance={ethBalance}
        recipientAddress={recipientAddress}
        onBack={() => {
          setShowCryptoWithdrawal(false);
          setScreen("wallet_balance");
        }}
        onClose={onClose}
      />
    );
  }

  // --- SCREEN: main_menu ---
  if (screen === "main_menu") {
    return (
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.ARTM_DISPLAY_MODAL }}
      >
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500 rounded-lg p-8 w-96 shadow-2xl">
          {/* Header - Terminal Style */}
          <div className="text-center mb-8">
            <div className="text-cyan-400 text-sm tracking-widest font-mono mb-2">
              ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌
            </div>
            <h1 className="text-3xl font-bold text-cyan-300 font-mono tracking-wide">
              WELCOME
            </h1>
            <div className="text-cyan-400 text-sm tracking-widest font-mono mt-2">
              ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌
            </div>
            <p className="text-cyan-300/60 text-xs mt-4 font-mono">
              VIRTUAL TERMINAL v2.0
            </p>
          </div>

          {/* Description */}
          <p className="text-center text-slate-300 text-sm mb-8">
            Select an option:
          </p>

          {/* Button Options — 4 buttons */}
          <div className="space-y-4 mb-8">
            <button
              onClick={onCardClick}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg text-lg"
            >
              TAP ON CARD 🏦
            </button>
            <button
              onClick={() => setScreen("wallet_permission")}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg text-lg"
            >
              BALANCE OF MY WALLET 💰
            </button>
            <button
              disabled
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-gray-400 font-bold py-4 px-6 rounded-lg shadow-lg text-lg cursor-not-allowed opacity-60"
            >
              REVOLUT BALANCE 🏧 (Coming Soon)
            </button>
            <button
              disabled
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-gray-400 font-bold py-4 px-6 rounded-lg shadow-lg text-lg cursor-not-allowed opacity-60"
            >
              CARD — MARTIN EGGER 💳 (Coming Soon)
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full text-slate-400 hover:text-slate-200 py-2 text-sm transition-colors"
          >
            Cancel (ESC)
          </button>

          {/* Footer - Supported Banks */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center font-mono">
              Supported: {supportedBanks}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- SCREEN: wallet_permission ---
  if (screen === "wallet_permission") {
    return (
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.ARTM_DISPLAY_MODAL }}
      >
        <div className="bg-gradient-to-b from-purple-900 to-slate-950 border-2 border-purple-400 rounded-lg p-8 w-96 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🦊</div>
            <h2 className="text-xl font-bold text-purple-200">
              Allow MetaMask to share your wallet balance with{" "}
              <span className="text-purple-300">
                {agent.agent_name || "this terminal"}
              </span>
              ?
            </h2>
          </div>

          <div className="space-y-3 mb-8">
            {[
              { icon: "👁️", text: "View your USDC balance" },
              { icon: "🔒", text: "Read-only access — no spending" },
              { icon: "🌐", text: "Current connected network" },
              { icon: "⏳", text: "Session-only — no persistent access" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-purple-800/30 rounded-lg px-4 py-3"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-purple-200 text-sm">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleWalletBalance}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg text-lg"
            >
              Yes, Allow ✅
            </button>
            <button
              onClick={() => setScreen("main_menu")}
              className="w-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-bold py-3 px-6 rounded-lg transition-all text-sm"
            >
              No
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- SCREEN: wallet_connecting ---
  if (screen === "wallet_connecting") {
    return (
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.ARTM_DISPLAY_MODAL }}
      >
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500 rounded-lg p-8 w-96 shadow-2xl">
          <div className="text-center">
            {connectError ? (
              <>
                <div className="text-5xl mb-4">❌</div>
                <h2 className="text-xl font-bold text-red-400 mb-4">
                  Connection Failed
                </h2>
                <p className="text-slate-400 text-sm mb-6">{connectError}</p>
                <div className="space-y-3">
                  <button
                    onClick={handleWalletBalance}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => {
                      setConnectError("");
                      setScreen("main_menu");
                    }}
                    className="w-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-bold py-3 px-6 rounded-lg transition-all text-sm"
                  >
                    Back to Menu
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4 animate-bounce">🦊</div>
                <h2 className="text-xl font-bold text-cyan-300 mb-4">
                  Connecting to MetaMask...
                </h2>
                <p className="text-slate-400 text-sm mb-4">
                  Please approve the connection in your MetaMask wallet
                </p>
                <div className="flex justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"
                      style={{ animationDelay: `${i * 200}ms` }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- SCREEN: wallet_balance ---
  if (screen === "wallet_balance") {
    return (
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.ARTM_DISPLAY_MODAL }}
      >
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500 rounded-lg p-8 w-96 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">💰</div>
            <h2 className="text-xl font-bold text-cyan-300">Wallet Balance</h2>
            <p className="text-slate-400 text-xs mt-1 font-mono">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
            <p className="text-cyan-400/60 text-xs font-mono mt-1">
              {walletNetwork}
            </p>
          </div>

          {/* Balance Cards */}
          <div className="space-y-3 mb-6">
            <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/30 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 text-xs uppercase font-semibold mb-1">
                USDC Balance
              </p>
              <p className="text-3xl font-bold text-white">
                {parseFloat(walletBalance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}{" "}
                <span className="text-blue-300 text-lg">USDC</span>
              </p>
              <p className="text-blue-400/60 text-xs mt-1">
                ≈ €
                {(parseFloat(walletBalance) * 0.92).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 border border-slate-600/30 rounded-lg p-4">
              <p className="text-slate-400 text-xs uppercase font-semibold mb-1">
                ETH Balance
              </p>
              <p className="text-xl font-bold text-white">
                {parseFloat(ethBalance).toLocaleString(undefined, {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 8,
                })}{" "}
                <span className="text-slate-400 text-sm">ETH</span>
              </p>
            </div>
          </div>

          {/* Recipient info */}
          {recipientAddress && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 mb-6">
              <p className="text-slate-500 text-xs mb-1">Terminal Recipient</p>
              <p className="text-slate-300 text-xs font-mono truncate">
                {recipientAddress}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setShowCryptoWithdrawal(true)}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg text-lg"
            >
              💶 Cash with Wallet
            </button>
            <button
              onClick={() => setScreen("main_menu")}
              className="w-full bg-transparent border border-slate-600 hover:border-slate-400 text-slate-400 hover:text-slate-200 font-medium py-3 px-6 rounded-lg transition-all text-sm"
            >
              ← Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ARTMDisplayModal;
