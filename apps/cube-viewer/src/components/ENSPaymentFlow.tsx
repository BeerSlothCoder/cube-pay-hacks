import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { ensPaymentService } from '../services/ensPaymentService';
import { ENSPaymentStatus } from './ENSPaymentStatus';
import type { PaymentStatusType } from './ENSPaymentStatus';

export interface ENSPaymentFlowProps {
  onPaymentComplete?: (txHash: string) => void;
  onPaymentError?: (error: string) => void;
  onClose?: () => void;
}

type FlowStep = 'domain' | 'review' | 'details' | 'confirmation' | 'result';

interface FlowState {
  step: FlowStep;
  domain: string;
  resolvedAddress: string | null;
  avatar?: string;
  amount: string;
  selectedChain: number;
  useCrossChain: boolean;
  destinationChain: number;
  paymentStatus: PaymentStatusType;
  transactionHash: string | null;
  error: string | null;
}

const SUPPORTED_CHAINS = [
  { id: 11155111, name: 'Ethereum Sepolia', symbol: 'ETH' },
  { id: 84532, name: 'Base Sepolia', symbol: 'BASE' },
  { id: 421614, name: 'Arbitrum Sepolia', symbol: 'ARB' },
];

export const ENSPaymentFlow: React.FC<ENSPaymentFlowProps> = ({
  onPaymentComplete,
  onPaymentError,
  onClose,
}) => {
  const [state, setState] = useState<FlowState>({
    step: 'domain',
    domain: '',
    resolvedAddress: null,
    amount: '10',
    selectedChain: 11155111,
    useCrossChain: false,
    destinationChain: 84532,
    paymentStatus: 'idle',
    transactionHash: null,
    error: null,
  });

  const [isResolving, setIsResolving] = useState(false);

  // Resolve ENS domain with debounce
  useEffect(() => {
    if (!state.domain.endsWith('.eth') || state.step !== 'domain') return;

    const timer = setTimeout(async () => {
      setIsResolving(true);
      try {
        const config = await ensPaymentService.resolveENSPayment(
          state.domain,
          'sepolia'
        );
        setState((prev) => ({
          ...prev,
          resolvedAddress: config.resolvedAddress,
          avatar: config.avatarUrl,
          error: null,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to resolve ENS domain',
          resolvedAddress: null,
        }));
      } finally {
        setIsResolving(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [state.domain, state.step]);

  const goToStep = (step: FlowStep) => {
    setState((prev) => ({ ...prev, step, error: null }));
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...prev,
      domain: e.target.value,
      error: null,
    }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...prev,
      amount: e.target.value,
    }));
  };

  const canProceedToReview = () => {
    return state.domain.endsWith('.eth') && state.resolvedAddress && !isResolving;
  };

  const canProceedToDetails = () => {
    return canProceedToReview();
  };

  const canConfirmPayment = () => {
    const amount = parseFloat(state.amount);
    return !isNaN(amount) && amount > 0 && state.selectedChain > 0;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-cubepay-bg rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4 rounded-t-lg">
          <h2 className="text-white font-bold text-lg">ENS Payment</h2>
          <p className="text-amber-100 text-sm">
            Step {['domain', 'review', 'details', 'confirmation', 'result'].indexOf(state.step) + 1} of 5
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-1 px-4 pt-4">
          {(['domain', 'review', 'details', 'confirmation', 'result'] as const).map(
            (step) => (
              <div
                key={step}
                className={`flex-1 h-1 rounded-full transition-all ${
                  ['domain', 'review', 'details', 'confirmation', 'result'].indexOf(
                    step
                  ) <=
                  ['domain', 'review', 'details', 'confirmation', 'result'].indexOf(
                    state.step
                  )
                    ? 'bg-amber-500'
                    : 'bg-gray-700'
                }`}
              />
            )
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Step 1: Domain Entry */}
          {state.step === 'domain' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  ENS Domain
                </label>
                <input
                  type="text"
                  value={state.domain}
                  onChange={handleDomainChange}
                  placeholder="e.g., cube-pay.eth"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
                {isResolving && (
                  <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Resolving...
                  </p>
                )}
              </div>

              {state.error && (
                <ENSPaymentStatus
                  status="error"
                  domain={state.domain}
                  errorMessage={state.error}
                />
              )}

              {state.resolvedAddress && !isResolving && (
                <ENSPaymentStatus
                  status="resolved"
                  domain={state.domain}
                  resolvedAddress={state.resolvedAddress}
                />
              )}
            </div>
          )}

          {/* Step 2: Review Address */}
          {state.step === 'review' && state.resolvedAddress && (
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-2">ENS Domain</p>
                <p className="font-mono text-amber-400 font-bold text-lg">
                  {state.domain}
                </p>

                <p className="text-xs text-gray-400 mt-4 mb-2">Resolves To</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-gray-300 text-sm">
                    {state.resolvedAddress.slice(0, 6)}...
                    {state.resolvedAddress.slice(-4)}
                  </p>
                  <button
                    onClick={() => copyToClipboard(state.resolvedAddress!)}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {state.avatar && (
                <div className="flex justify-center">
                  <img
                    src={state.avatar}
                    alt="ENS Avatar"
                    className="w-24 h-24 rounded-full border-2 border-amber-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Payment Details */}
          {state.step === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Amount (USDC)
                </label>
                <input
                  type="number"
                  value={state.amount}
                  onChange={handleAmountChange}
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Pay From Chain
                </label>
                <select
                  value={state.selectedChain}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      selectedChain: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                >
                  {SUPPORTED_CHAINS.map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.name}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.useCrossChain}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      useCrossChain: e.target.checked,
                    }))
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-300">Cross-chain payment</span>
              </label>

              {state.useCrossChain && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Destination Chain
                  </label>
                  <select
                    value={state.destinationChain}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        destinationChain: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    {SUPPORTED_CHAINS.filter((c) => c.id !== state.selectedChain).map(
                      (chain) => (
                        <option key={chain.id} value={chain.id}>
                          {chain.name}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Confirmation */}
          {state.step === 'confirmation' && (
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">To</span>
                  <span className="font-mono text-sm">{state.domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount</span>
                  <span className="font-semibold">{state.amount} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">From Chain</span>
                  <span>
                    {SUPPORTED_CHAINS.find((c) => c.id === state.selectedChain)?.name}
                  </span>
                </div>
                {state.useCrossChain && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">To Chain</span>
                    <span>
                      {
                        SUPPORTED_CHAINS.find((c) => c.id === state.destinationChain)
                          ?.name
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Result */}
          {state.step === 'result' && (
            <div className="space-y-4">
              <ENSPaymentStatus
                status={state.error ? 'error' : 'success'}
                domain={state.domain}
                resolvedAddress={state.resolvedAddress || undefined}
                transactionHash={state.transactionHash || undefined}
                errorMessage={state.error || undefined}
                chainId={state.selectedChain}
              />
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-gray-700 p-4 flex gap-2 justify-between">
          {state.step !== 'domain' && (
            <button
              onClick={() => {
                const steps: FlowStep[] = [
                  'domain',
                  'review',
                  'details',
                  'confirmation',
                  'result',
                ];
                const currentIndex = steps.indexOf(state.step);
                if (currentIndex > 0) goToStep(steps[currentIndex - 1]);
              }}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}

          {state.step !== 'result' && (
            <button
              onClick={() => {
                if (state.step === 'domain' && canProceedToReview()) {
                  goToStep('review');
                } else if (state.step === 'review' && canProceedToDetails()) {
                  goToStep('details');
                } else if (state.step === 'details' && canConfirmPayment()) {
                  goToStep('confirmation');
                } else if (state.step === 'confirmation') {
                  goToStep('result');
                }
              }}
              disabled={
                (state.step === 'domain' && !canProceedToReview()) ||
                (state.step === 'details' && !canConfirmPayment())
              }
              className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {state.step === 'result' && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
