/**
 * CardWithdrawalModal Component
 * 6-step Revolut USD card withdrawal flow
 * Displays mock balance and withdrawal options
 */

import React, { useState } from "react";
import type { DeployedObject } from "@cubepay/types";
import { X, Loader2 } from "lucide-react";
import Z_INDEX from "../config/zIndexConfig";

interface CardWithdrawalModalProps {
  agent: DeployedObject;
  onClose: () => void;
}

type WithdrawalStep =
  | "insert_card"
  | "enter_pin"
  | "select_amount"
  | "confirm"
  | "processing"
  | "complete";

export const CardWithdrawalModal: React.FC<CardWithdrawalModalProps> = ({
  agent,
  onClose,
}) => {
  const [step, setStep] = useState<WithdrawalStep>("insert_card");
  const [amount, setAmount] = useState("");
  const [processingStep, setProcessingStep] = useState(1);

  // Get mock balance from agent config (USD)
  const displayConfig = agent.terminal_display_config as any;
  const mockBalance =
    displayConfig?.mock_balance_usd ||
    displayConfig?.mock_balance_eur ||
    2450.67;
  const fee = agent.interaction_fee_amount || 2.0;

  // Handle quick amount selection
  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  // Handle withdrawal confirmation
  const handleConfirm = () => {
    const parsedAmount = parseFloat(amount) || 0;
    if (parsedAmount > 0 && parsedAmount <= mockBalance) {
      setStep("processing");
      setProcessingStep(1);

      // Simulate 3-step processing (1 second per step)
      const timer1 = setTimeout(() => setProcessingStep(2), 1000);
      const timer2 = setTimeout(() => setProcessingStep(3), 2000);
      const timer3 = setTimeout(() => setStep("complete"), 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  };

  // Step 1: Insert Card
  if (step === "insert_card") {
    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.CARD_WITHDRAWAL_MODAL }}
      >
        <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Card Withdrawal
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <p className="text-gray-600 text-lg">Please insert your card</p>
            <p className="text-gray-500 text-sm mt-2">
              (Click below to continue)
            </p>
          </div>

          <button
            onClick={() => setStep("enter_pin")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mt-6"
          >
            Card Inserted
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Enter PIN
  if (step === "enter_pin") {
    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.CARD_WITHDRAWAL_MODAL }}
      >
        <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Enter PIN</h2>

          <div className="mb-6">
            <div className="text-center text-4xl tracking-widest text-gray-800 bg-gray-100 p-4 rounded-lg font-mono">
              ●●●●
            </div>
          </div>

          <p className="text-center text-gray-600 mb-6">
            PIN verified successfully
          </p>

          <button
            onClick={() => setStep("select_amount")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Select Amount
  if (step === "select_amount") {
    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.CARD_WITHDRAWAL_MODAL }}
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Revolut USD Account</p>
            <p className="text-3xl font-bold text-blue-600">
              ${mockBalance.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Available</p>
          </div>

          {/* Custom Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Amount
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
            {[20, 50, 100, 200].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => handleQuickAmount(quickAmount)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-3 rounded-lg text-sm"
              >
                ${quickAmount}
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep("confirm")}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Confirm
  if (step === "confirm") {
    const parsedAmount = parseFloat(amount) || 0;
    const total = parsedAmount + fee;

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.CARD_WITHDRAWAL_MODAL }}
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
              <span className="text-gray-600">Withdrawal Amount</span>
              <span className="font-bold text-gray-800">
                ${parsedAmount.toFixed(2)}
              </span>
            </div>
            <div className="border-t pt-4 flex justify-between">
              <span className="text-gray-600">Transaction Fee</span>
              <span className="font-bold text-gray-800">${fee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-4 flex justify-between bg-blue-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
              <span className="font-bold text-gray-800">Total</span>
              <span className="font-bold text-blue-600 text-lg">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg mb-2"
          >
            Withdraw Cash
          </button>
          <button
            onClick={() => setStep("select_amount")}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Step 5: Processing
  if (step === "processing") {
    const processingMessages = [
      "Processing transaction...",
      "Verifying funds...",
      "Dispensing cash...",
    ];

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.CARD_WITHDRAWAL_MODAL }}
      >
        <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Processing
            </h2>
            <p className="text-gray-600">
              {processingMessages[processingStep - 1]}
            </p>
            <div className="mt-6 flex justify-center gap-1">
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

  // Step 6: Complete
  if (step === "complete") {
    const parsedAmount = parseFloat(amount) || 0;

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: Z_INDEX.CARD_WITHDRAWAL_MODAL }}
      >
        <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Cash Dispensed
            </h2>
            <p className="text-gray-600">Transaction completed</p>
          </div>

          {/* Receipt */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 font-mono text-xs">
            <div className="text-center border-b pb-2 mb-2">
              <p className="font-bold">REVOLUT ATM RECEIPT</p>
            </div>
            <div className="space-y-1 text-gray-700">
              <div className="flex justify-between">
                <span>WITHDRAWAL:</span>
                <span>${parsedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>FEE:</span>
                <span>${fee.toFixed(2)}</span>
              </div>
              <div className="border-t pt-1 flex justify-between font-bold">
                <span>TOTAL:</span>
                <span>${(parsedAmount + fee).toFixed(2)}</span>
              </div>
              <div className="text-gray-500 mt-2">
                <div>{new Date().toLocaleDateString()}</div>
                <div>{new Date().toLocaleTimeString()}</div>
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

export default CardWithdrawalModal;
