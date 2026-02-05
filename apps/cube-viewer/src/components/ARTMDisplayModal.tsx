/**
 * ARTMDisplayModal Component
 * Main interface for Virtual Terminal (ARTM) agents
 * Displays two withdrawal options: Card (Revolut USD) and Wallet (USDC blockchain)
 */

import React from "react";
import type { DeployedObject } from "@cubepay/types";
import Z_INDEX from "../config/zIndexConfig";

interface ARTMDisplayModalProps {
  agent: DeployedObject;
  onCardClick: () => void;
  onWalletClick: () => void;
  onClose: () => void;
}

export const ARTMDisplayModal: React.FC<ARTMDisplayModalProps> = ({
  agent,
  onCardClick,
  onWalletClick,
  onClose,
}) => {
  // Get supported banks from agent config
  const supportedBanks = agent.bank_integrations?.join(", ") || "Revolut";

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
            VIRTUAL TERMINAL v1.0
          </p>
        </div>

        {/* Description */}
        <p className="text-center text-slate-300 text-sm mb-8">
          Select withdrawal method:
        </p>

        {/* Button Options */}
        <div className="space-y-4 mb-8">
          {/* Card Button */}
          <button
            onClick={onCardClick}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg text-lg"
          >
            TAP ON CARD 🏦
          </button>

          {/* Wallet Button */}
          <button
            onClick={onWalletClick}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg text-lg"
          >
            TAP ON WALLET 💰
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
};

export default ARTMDisplayModal;
