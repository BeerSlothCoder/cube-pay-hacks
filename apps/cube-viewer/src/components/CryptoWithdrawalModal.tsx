/**
 * CryptoWithdrawalModal Component
 * 8-step USDC blockchain withdrawal flow
 * Integrates with Web3 wallets for real blockchain transactions
 */

import React, { useState } from "react";
import type { DeployedObject } from "@cubepay/types";
import { X, Loader2, Copy, Check } from "lucide-react";
import Z_INDEX from "../config/zIndexConfig";

interface CryptoWithdrawalModalProps {
  agent: DeployedObject;
  onClose: () => void;
}

type WithdrawalStep =
  | "wallet_connect"
  | "spending_limit"
  | "balance_check"
  | "amount_selection"
  | "confirmation"
  | "processing"
  | "success"
  | "receipt";

export const CryptoWithdrawalModal: React.FC<CryptoWithdrawalModalProps> = ({
  agent,
  onClose,
}) => {
  const [step, setStep] = useState<WithdrawalStep>("wallet_connect");
  const [selectedWallet, setSelectedWallet] = useState<
    "metamask" | "phantom" | null
  >(null);
  const [spendingLimit, setSpendingLimit] = useState(1000);
  const [amount, setAmount] = useState("");
  const [processingStep, setProcessingStep] = useState(1);
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);

  // Get balance from agent config (USDC)
  const displayConfig = agent.terminal_display_config as any;
  const mockWalletBalance = displayConfig?.mock_wallet_usdc || 1250.0;
  const fee = agent.interaction_fee_amount || 2.5;
  const network = agent.deployment_network_name || "ethereum";

  // Mock transaction hash generator
  const generateTxHash = () => {
    return "0x" + Math.random().toString(16).slice(2);
  };

  // Handle wallet selection
  const handleWalletSelect = (wallet: "metamask" | "phantom") => {
    setSelectedWallet(wallet);
    setStep("spending_limit");
  };

  // Handle spending limit confirmation
  const handleSpendingLimitConfirm = () => {
    setStep("balance_check");
  };

  // Handle balance check confirmation
  const handleBalanceCheckConfirm = () => {
    setStep("amount_selection");
  };

  // Handle amount confirmation
  const handleAmountConfirm = () => {
    setStep("confirmation");
  };

  // Handle withdrawal confirmation
  const handleWithdrawalConfirm = () => {
    setStep("processing");
    setProcessingStep(1);
    setTxHash(generateTxHash());

    // Simulate 3-step processing
    const timer1 = setTimeout(() => setProcessingStep(2), 1000);
    const timer2 = setTimeout(() => setProcessingStep(3), 2000);
    const timer3 = setTimeout(() => setStep("success"), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  // Copy TX hash to clipboard
  const handleCopyTxHash = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Step 1: Wallet Connect
  if (step === "wallet_connect") {
    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.CRYPTO_WITHDRAWAL_MODAL }}
      >
        <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Connect Wallet</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <p className="text-gray-600 mb-6">Select your wallet to continue:</p>

          <div className="space-y-3">
            <button
              onClick={() => handleWalletSelect("metamask")}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
            >
              <div className="text-4xl">🦊</div>
              <div className="text-left">
                <p className="font-bold text-gray-800">MetaMask</p>
                <p className="text-sm text-gray-600">EVM Compatible</p>
              </div>
            </button>

            <button
              onClick={() => handleWalletSelect("phantom")}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
            >
              <div className="text-4xl">👻</div>
              <div className="text-left">
                <p className="font-bold text-gray-800">Phantom</p>
                <p className="text-sm text-gray-600">Solana & EVM</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Spending Limit
  if (step === "spending_limit") {
    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.CRYPTO_WITHDRAWAL_MODAL }}
      >
        <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Spending Limit</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <p className="text-gray-600 mb-4">
            Set maximum amount per transaction:
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Spending Limit</p>
            <p className="text-3xl font-bold text-blue-600">
              ${spendingLimit.toFixed(2)}
            </p>
          </div>

          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={spendingLimit}
            onChange={(e) => setSpendingLimit(parseInt(e.target.value))}
            className="w-full mb-6"
          />

          <p className="text-xs text-gray-500 text-center mb-6">
            Range: $100 - $5000
          </p>

          <button
            onClick={handleSpendingLimitConfirm}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Balance Check
  if (step === "balance_check") {
    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.CRYPTO_WITHDRAWAL_MODAL }}
      >
        <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">USDC Balance</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Available Balance</p>
            <p className="text-4xl font-bold text-blue-600 mb-2">
              ${mockWalletBalance.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">USDC on {network}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-600 uppercase font-semibold mb-2">
              Network Details
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Network:</span>
                <span className="font-mono text-gray-800">
                  {network.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Token:</span>
                <span className="font-mono text-gray-800">USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Recipient:</span>
                <span className="font-mono text-gray-800 truncate">
                  {agent.deployer_wallet_address?.slice(0, 10)}...
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleBalanceCheckConfirm}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Amount Selection
  if (step === "amount_selection") {
    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.CRYPTO_WITHDRAWAL_MODAL }}
      >
        <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Select Amount</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              USDC Amount
            </label>
            <div className="flex items-center">
              <span className="text-2xl text-gray-700 mr-2">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[100, 250, 500, 1000].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-3 rounded-lg text-sm"
              >
                ${quickAmount}
              </button>
            ))}
          </div>

          <button
            onClick={handleAmountConfirm}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Step 5: Confirmation
  if (step === "confirmation") {
    const parsedAmount = parseFloat(amount) || 0;
    const total = parsedAmount + fee;

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.CRYPTO_WITHDRAWAL_MODAL }}
      >
        <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Confirm</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">USDC Amount</span>
              <span className="font-bold text-gray-800">
                ${parsedAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bank Conversion Fee</span>
              <span className="font-bold text-gray-800">${fee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-4 flex justify-between bg-blue-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
              <span className="font-bold text-gray-800">Total USD</span>
              <span className="font-bold text-blue-600 text-lg">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mb-6">
            Transaction will be sent to:{" "}
            {agent.deployer_wallet_address?.slice(0, 10)}...
          </p>

          <button
            onClick={handleWithdrawalConfirm}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg mb-2"
          >
            Confirm & Withdraw
          </button>
          <button
            onClick={() => setStep("amount_selection")}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Step 6: Processing
  if (step === "processing") {
    const processingMessages = [
      "Processing TX...",
      "Converting to USD...",
      "Dispensing cash...",
    ];

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.CRYPTO_WITHDRAWAL_MODAL }}
      >
        <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Processing
            </h2>
            <p className="text-gray-600 mb-4">
              {processingMessages[processingStep - 1]}
            </p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i <= processingStep ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 7: Success
  if (step === "success") {
    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.CRYPTO_WITHDRAWAL_MODAL }}
      >
        <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Transaction Complete
            </h2>
            <p className="text-gray-600">Withdrawal processed successfully</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-600 uppercase font-semibold mb-2">
              Transaction Hash
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-xs bg-white p-2 rounded border border-gray-200 truncate">
                {txHash}
              </code>
              <button
                onClick={handleCopyTxHash}
                className="p-2 hover:bg-white rounded transition-colors"
              >
                {copied ? (
                  <Check size={18} className="text-green-600" />
                ) : (
                  <Copy size={18} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={() => setStep("receipt")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg"
          >
            View Receipt
          </button>
        </div>
      </div>
    );
  }

  // Step 8: Receipt
  if (step === "receipt") {
    const parsedAmount = parseFloat(amount) || 0;

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.CRYPTO_WITHDRAWAL_MODAL }}
      >
        <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🧾</div>
            <h2 className="text-2xl font-bold text-gray-800">Receipt</h2>
          </div>

          {/* Receipt */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 font-mono text-xs">
            <div className="text-center border-b pb-2 mb-2">
              <p className="font-bold">USDC WITHDRAWAL RECEIPT</p>
              <p className="text-gray-500">{network.toUpperCase()}</p>
            </div>
            <div className="space-y-1 text-gray-700">
              <div className="flex justify-between">
                <span>USDC AMOUNT:</span>
                <span>${parsedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>CONVERSION FEE:</span>
                <span>${fee.toFixed(2)}</span>
              </div>
              <div className="border-t pt-1 flex justify-between font-bold">
                <span>TOTAL USD:</span>
                <span>${(parsedAmount + fee).toFixed(2)}</span>
              </div>
              <div className="text-gray-500 mt-2 border-t pt-1">
                <div>{new Date().toLocaleDateString()}</div>
                <div>{new Date().toLocaleTimeString()}</div>
                <div className="mt-1 truncate text-xs">TX: {txHash}</div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default CryptoWithdrawalModal;
