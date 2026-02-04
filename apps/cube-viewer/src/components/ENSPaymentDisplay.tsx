import React from "react";
import { ExternalLink, AlertCircle, CheckCircle } from "lucide-react";
import type { ENSPaymentConfig } from "../services/ensPaymentService";

interface ENSPaymentDisplayProps {
  config: ENSPaymentConfig;
  isLoading?: boolean;
  amount?: number;
  showValidation?: boolean;
  compact?: boolean;
}

export const ENSPaymentDisplay: React.FC<ENSPaymentDisplayProps> = ({
  config,
  isLoading = false,
  amount,
  showValidation = true,
  compact = false,
}) => {
  // Validate payment amount
  let validationState: "valid" | "invalid" | "none" = "none";
  let validationMessage = "";

  if (showValidation && amount !== undefined) {
    if (config.minPayment && amount < config.minPayment) {
      validationState = "invalid";
      validationMessage = `Minimum: $${config.minPayment} USDC`;
    } else if (config.maxPayment && amount > config.maxPayment) {
      validationState = "invalid";
      validationMessage = `Maximum: $${config.maxPayment} USDC`;
    } else if (config.minPayment || config.maxPayment) {
      validationState = "valid";
      validationMessage = `Amount allowed`;
    }
  }

  if (compact) {
    // Compact display for payment forms
    return (
      <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="w-6 h-6 bg-amber-500/30 rounded animate-pulse" />
            ) : config.avatar ? (
              <img
                src={config.avatar}
                alt={config.domain}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-amber-500/30 rounded-full flex items-center justify-center text-xs font-bold text-amber-400">
                {config.domain[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-amber-400">
                {config.domain}
              </p>
              <p className="text-xs text-amber-300/60">
                {config.resolvedAddress.slice(0, 6)}...
                {config.resolvedAddress.slice(-4)}
              </p>
            </div>
          </div>
          <a
            href={`https://etherscan.io/address/${config.resolvedAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        </div>

        {validationState !== "none" && (
          <div
            className={`flex items-center gap-2 text-xs mt-2 ${validationState === "valid" ? "text-green-400" : "text-red-400"}`}
          >
            {validationState === "valid" ? (
              <CheckCircle size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            {validationMessage}
          </div>
        )}
      </div>
    );
  }

  // Full display for modals/cards
  return (
    <div className="bg-gradient-to-br from-amber-900/20 to-yellow-900/10 border border-amber-600/30 rounded-lg p-4 space-y-3">
      {/* Header with avatar */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {isLoading ? (
            <div className="w-12 h-12 bg-amber-500/30 rounded-full animate-pulse" />
          ) : config.avatar ? (
            <img
              src={config.avatar}
              alt={config.domain}
              className="w-12 h-12 rounded-full border border-amber-400/50"
            />
          ) : (
            <div className="w-12 h-12 bg-amber-500/30 rounded-full flex items-center justify-center text-lg font-bold text-amber-400">
              {config.domain[0].toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-amber-400 break-all">
              {config.domain}
            </h3>
            <p className="text-xs text-amber-300/60 font-mono">
              {config.resolvedAddress}
            </p>
            {config.description && (
              <p className="text-xs text-amber-300/70 mt-1 line-clamp-2">
                {config.description}
              </p>
            )}
          </div>
        </div>

        <a
          href={`https://etherscan.io/address/${config.resolvedAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:text-amber-300 transition-colors flex-shrink-0"
        >
          <ExternalLink size={18} />
        </a>
      </div>

      {/* Payment constraints */}
      {(config.minPayment || config.maxPayment) && (
        <div className="bg-amber-900/30 rounded p-2 text-xs space-y-1">
          {config.minPayment && (
            <div className="flex justify-between text-amber-300">
              <span>Min Payment:</span>
              <span className="font-semibold">${config.minPayment} USDC</span>
            </div>
          )}
          {config.maxPayment && (
            <div className="flex justify-between text-amber-300">
              <span>Max Payment:</span>
              <span className="font-semibold">${config.maxPayment} USDC</span>
            </div>
          )}
        </div>
      )}

      {/* Preferred chain */}
      {config.preferredChain && (
        <div className="bg-amber-900/30 rounded p-2 text-xs">
          <span className="text-amber-300">Preferred Chain: </span>
          <span className="font-semibold text-amber-200">
            {config.preferredChain}
          </span>
        </div>
      )}

      {/* Validation status */}
      {validationState !== "none" && (
        <div
          className={`flex items-center gap-2 text-sm rounded p-2 ${
            validationState === "valid"
              ? "bg-green-900/30 text-green-400"
              : "bg-red-900/30 text-red-400"
          }`}
        >
          {validationState === "valid" ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {validationMessage}
        </div>
      )}

      {/* Network indicator */}
      <div className="text-xs text-amber-300/60 flex items-center gap-1">
        <span>Network:</span>
        <span className="inline-block px-2 py-1 bg-amber-900/50 rounded capitalize">
          {config.network}
        </span>
      </div>
    </div>
  );
};
