/**
 * CryptoWithdrawalModal Component
 * Real 4-step blockchain withdrawal flow using MetaMask + ethers.js
 * Step 1: Balance Display → Step 2: Amount Input → Step 3: Confirmation → Step 4: Processing/Success
 */

import React, { useState } from "react";
import { ethers } from "ethers";
import type { DeployedObject } from "@cubepay/types";
import { X, Loader2, Copy, Check, ExternalLink } from "lucide-react";
import Z_INDEX from "../config/zIndexConfig";

// ERC-20 ABI for transfer
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

// USDC contract addresses by chain ID
const USDC_CONTRACTS: Record<number, string> = {
  1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  421614: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  11155420: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
  43113: "0x5425890298aed601595a70AB815c96711a31Bc65",
  296: "0x0000000000000000000000000000000000000000",
  137: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  10: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
};

// Block explorer URLs by chain ID
const BLOCK_EXPLORERS: Record<number, string> = {
  1: "https://etherscan.io",
  11155111: "https://sepolia.etherscan.io",
  421614: "https://sepolia.arbiscan.io",
  84532: "https://sepolia.basescan.org",
  11155420: "https://sepolia-optimism.etherscan.io",
  43113: "https://testnet.snowtrace.io",
  296: "https://hashscan.io/testnet",
  137: "https://polygonscan.com",
  42161: "https://arbiscan.io",
  8453: "https://basescan.org",
  10: "https://optimistic.etherscan.io",
};

interface CryptoWithdrawalModalProps {
  agent: DeployedObject;
  walletAddress: string;
  walletBalance: string;
  walletNetwork: string;
  chainId: number;
  ethBalance: string;
  recipientAddress: string;
  onBack: () => void;
  onClose: () => void;
}

type WithdrawalStep =
  | "balance_display"
  | "amount_input"
  | "confirmation"
  | "processing";

export const CryptoWithdrawalModal: React.FC<CryptoWithdrawalModalProps> = ({
  agent: _agent,
  walletAddress,
  walletBalance,
  walletNetwork,
  chainId,
  ethBalance,
  recipientAddress,
  onBack,
  onClose,
}) => {
  const [step, setStep] = useState<WithdrawalStep>("balance_display");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<"USDC" | "ETH">("USDC");
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [processingMessage, setProcessingMessage] = useState("");
  const [processingStage, setProcessingStage] = useState(0);
  const [txSuccess, setTxSuccess] = useState(false);
  const [cashDispensing, setCashDispensing] = useState(false);

  const usdcAvailable = USDC_CONTRACTS[chainId] && USDC_CONTRACTS[chainId] !== "0x0000000000000000000000000000000000000000";
  const currentBalance = token === "USDC" ? parseFloat(walletBalance) : parseFloat(ethBalance);
  const parsedAmount = parseFloat(amount) || 0;
  const eurAmount = token === "USDC" ? parsedAmount * 0.92 : parsedAmount * 0.92; // Mocked EUR rate
  const explorerUrl = BLOCK_EXPLORERS[chainId] || "https://etherscan.io";
  const isOverBalance = parsedAmount > currentBalance;

  // Quick-select amounts
  const quickAmounts =
    token === "USDC"
      ? [10, 20, 50, 100]
      : [0.01, 0.05, 0.1, 0.5];

  // Copy TX hash
  const handleCopyTxHash = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Execute real blockchain transaction
  const handleConfirmSend = async () => {
    setStep("processing");
    setError("");
    setProcessingStage(1);
    setProcessingMessage("Waiting for MetaMask signature...");

    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("MetaMask not available");
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      let tx: ethers.TransactionResponse;

      if (token === "USDC" && usdcAvailable) {
        // ERC-20 USDC transfer
        const usdcAddress = USDC_CONTRACTS[chainId];
        const contract = new ethers.Contract(usdcAddress, ERC20_ABI, signer);
        const decimals = await contract.decimals();
        const amountWei = ethers.parseUnits(amount, decimals);

        setProcessingMessage("Sending USDC transaction...");
        tx = await contract.transfer(recipientAddress, amountWei);
      } else {
        // Native ETH transfer
        const amountWei = ethers.parseEther(amount);

        setProcessingMessage("Sending ETH transaction...");
        tx = await signer.sendTransaction({
          to: recipientAddress,
          value: amountWei,
        });
      }

      setTxHash(tx.hash);
      setProcessingStage(2);
      setProcessingMessage("Waiting for on-chain confirmation...");

      // Wait for 1 confirmation
      await tx.wait(1);

      setProcessingStage(3);
      setProcessingMessage("Transaction confirmed! Dispensing cash...");
      setCashDispensing(true);

      // Simulate cash dispensing animation (3 seconds)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setCashDispensing(false);
      setTxSuccess(true);
      setProcessingMessage("Complete!");
    } catch (err: any) {
      console.error("Transaction error:", err);

      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        setError("Transaction rejected by user");
      } else if (
        err.message?.includes("insufficient funds") ||
        err.message?.includes("exceeds balance")
      ) {
        setError("Insufficient funds for transaction + gas");
      } else {
        setError(err.message || "Transaction failed");
      }
    }
  };

  // --- STEP 1: Balance Display ---
  if (step === "balance_display") {
    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.CRYPTO_WITHDRAWAL_MODAL }}
      >
        <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              💶 Cash Withdrawal
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 mb-4">
            <p className="text-sm text-gray-600 mb-1">USDC Balance</p>
            <p className="text-3xl font-bold text-blue-600">
              {parseFloat(walletBalance).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })}{" "}
              USDC
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ≈ €
              {(parseFloat(walletBalance) * 0.92).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">ETH Balance</p>
            <p className="text-xl font-bold text-gray-800">
              {parseFloat(ethBalance).toLocaleString(undefined, {
                minimumFractionDigits: 4,
                maximumFractionDigits: 8,
              })}{" "}
              ETH
            </p>
          </div>

          {/* Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Connected Address:</span>
                <span className="font-mono text-gray-800">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Network:</span>
                <span className="font-mono text-gray-800">{walletNetwork}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Recipient:</span>
                <span className="font-mono text-gray-800 truncate ml-2">
                  {recipientAddress
                    ? `${recipientAddress.slice(0, 8)}...${recipientAddress.slice(-4)}`
                    : "Not set"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep("amount_input")}
            disabled={currentBalance === 0 && parseFloat(ethBalance) === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg mb-2"
          >
            Continue to Withdrawal
          </button>
          <button
            onClick={onBack}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // --- STEP 2: Amount Input ---
  if (step === "amount_input") {
    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.CRYPTO_WITHDRAWAL_MODAL }}
      >
        <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Enter Amount</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Token selector */}
          <div className="flex gap-2 mb-4">
            {usdcAvailable && (
              <button
                onClick={() => {
                  setToken("USDC");
                  setAmount("");
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                  token === "USDC"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                USDC
              </button>
            )}
            <button
              onClick={() => {
                setToken("ETH");
                setAmount("");
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                token === "ETH"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              ETH
            </button>
          </div>

          {/* Balance display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-600">
              Available: <span className="font-bold text-blue-600">
                {currentBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: token === "USDC" ? 6 : 8,
                })} {token}
              </span>
            </p>
          </div>

          {/* Amount input */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || parseFloat(val) >= 0) {
                    setAmount(val);
                  }
                }}
                placeholder="0.00"
                step="any"
                min="0"
                max={currentBalance}
                className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 text-lg font-mono ${
                  isOverBalance
                    ? "border-red-400 focus:ring-red-300 bg-red-50"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              <button
                onClick={() => setAmount(currentBalance.toString())}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-3 px-4 rounded-lg text-sm"
              >
                MAX
              </button>
            </div>
            {isOverBalance && (
              <p className="text-red-500 text-xs mt-1 font-semibold">
                ⚠️ Amount exceeds available balance
              </p>
            )}
            {parsedAmount > 0 && (
              <p className="text-gray-500 text-xs mt-1">
                ≈ €{eurAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
              </p>
            )}
          </div>

          {/* Quick-select chips */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {quickAmounts.map((qa) => (
              <button
                key={qa}
                onClick={() => setAmount(qa.toString())}
                disabled={qa > currentBalance}
                className={`py-2 px-4 rounded-full text-sm font-semibold transition-all ${
                  qa > currentBalance
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700"
                }`}
              >
                {token === "USDC" ? `$${qa}` : `${qa} ETH`}
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep("confirmation")}
            disabled={!amount || parsedAmount <= 0 || isOverBalance}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg mb-2"
          >
            Continue
          </button>
          <button
            onClick={() => setStep("balance_display")}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // --- STEP 3: Confirmation ---
  if (step === "confirmation") {
    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.CRYPTO_WITHDRAWAL_MODAL }}
      >
        <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Confirm Transaction
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Warning Banner */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-bold text-sm text-center">
              ⚠️ This is a real blockchain transaction
            </p>
            <p className="text-yellow-700 text-xs text-center mt-1">
              Funds will be sent on-chain and cannot be reversed
            </p>
          </div>

          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-lg p-5 mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Amount</span>
              <span className="font-bold text-gray-800 text-lg">
                {parsedAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: token === "USDC" ? 6 : 8,
                })}{" "}
                {token}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">EUR Equivalent</span>
              <span className="font-semibold text-gray-700">
                ≈ €{eurAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">From</span>
                <span className="font-mono text-gray-800 text-xs">
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">To</span>
                <span className="font-mono text-gray-800 text-xs">
                  {recipientAddress
                    ? `${recipientAddress.slice(0, 8)}...${recipientAddress.slice(-4)}`
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Network</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {walletNetwork}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Token</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {token}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirmSend}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg mb-2 text-lg"
          >
            ✅ Confirm & Send
          </button>
          <button
            onClick={() => setStep("amount_input")}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // --- STEP 4: Processing → Success ---
  if (step === "processing") {
    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.CRYPTO_WITHDRAWAL_MODAL }}
      >
        <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
          {/* Error state */}
          {error ? (
            <div className="text-center">
              <div className="text-5xl mb-4">❌</div>
              <h2 className="text-xl font-bold text-red-600 mb-4">
                Transaction Failed
              </h2>
              <p className="text-gray-600 text-sm mb-6">{error}</p>
              <button
                onClick={() => {
                  setError("");
                  setStep("confirmation");
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mb-2"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg"
              >
                Close
              </button>
            </div>
          ) : txSuccess ? (
            /* Success + Receipt */
            <div>
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Transaction Complete!
                </h2>
                <p className="text-gray-600 text-sm">
                  Withdrawal processed successfully
                </p>
              </div>

              {/* Receipt */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 font-mono text-xs">
                <div className="text-center border-b pb-2 mb-3">
                  <p className="font-bold text-sm">
                    {token} WITHDRAWAL RECEIPT
                  </p>
                  <p className="text-gray-500">{walletNetwork}</p>
                </div>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>AMOUNT:</span>
                    <span className="font-bold">
                      {parsedAmount} {token}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>EUR (≈):</span>
                    <span>€{eurAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FROM:</span>
                    <span>
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>TO:</span>
                    <span>
                      {recipientAddress.slice(0, 6)}...
                      {recipientAddress.slice(-4)}
                    </span>
                  </div>
                  <div className="border-t pt-2 text-gray-500">
                    <div>{new Date().toLocaleDateString()}</div>
                    <div>{new Date().toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>

              {/* TX Hash */}
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-xs text-gray-600 font-semibold mb-1">
                  Transaction Hash
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-xs bg-white p-2 rounded border border-gray-200 truncate">
                    {txHash}
                  </code>
                  <button
                    onClick={handleCopyTxHash}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Copy"
                  >
                    {copied ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <Copy size={16} className="text-gray-400" />
                    )}
                  </button>
                  <a
                    href={`${explorerUrl}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="View on Explorer"
                  >
                    <ExternalLink size={16} className="text-blue-500" />
                  </a>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg"
              >
                Done
              </button>
            </div>
          ) : (
            /* Processing animation */
            <div className="text-center">
              {cashDispensing ? (
                <>
                  <div className="text-6xl mb-4 animate-bounce">💶</div>
                  <h2 className="text-xl font-bold text-green-600 mb-4">
                    Dispensing Cash...
                  </h2>
                </>
              ) : (
                <>
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Processing
                  </h2>
                </>
              )}
              <p className="text-gray-600 mb-6">{processingMessage}</p>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-3 w-3 rounded-full transition-all ${
                      i <= processingStage
                        ? "bg-blue-600 scale-110"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p
                  className={
                    processingStage >= 1
                      ? "text-blue-600 font-semibold"
                      : "text-gray-400"
                  }
                >
                  1. MetaMask signature
                </p>
                <p
                  className={
                    processingStage >= 2
                      ? "text-blue-600 font-semibold"
                      : "text-gray-400"
                  }
                >
                  2. On-chain confirmation
                </p>
                <p
                  className={
                    processingStage >= 3
                      ? "text-green-600 font-semibold"
                      : "text-gray-400"
                  }
                >
                  3. Cash dispensing
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default CryptoWithdrawalModal;
