import React, { useEffect, useState } from 'react';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ExternalLink 
} from 'lucide-react';

export type PaymentStatusType = 
  | 'resolving' 
  | 'resolved' 
  | 'validating' 
  | 'pending' 
  | 'processing' 
  | 'success' 
  | 'error';

interface ENSPaymentStatusProps {
  status: PaymentStatusType;
  domain?: string;
  resolvedAddress?: string;
  transactionHash?: string;
  errorMessage?: string;
  chainId?: number;
  showLink?: boolean;
}

const SEPOLIA_EXPLORER = 'https://sepolia.etherscan.io';
const MAINNET_EXPLORER = 'https://etherscan.io';

const getExplorerUrl = (chainId?: number, txHash?: string): string => {
  const explorer = chainId === 11155111 ? SEPOLIA_EXPLORER : MAINNET_EXPLORER;
  return txHash ? `${explorer}/tx/${txHash}` : explorer;
};

const statusConfig = {
  resolving: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    message: 'Resolving ENS domain...',
    showSpinner: true,
  },
  resolved: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    message: 'Domain resolved',
    showSpinner: false,
  },
  validating: {
    icon: Loader2,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    message: 'Validating payment constraints...',
    showSpinner: true,
  },
  pending: {
    icon: Clock,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    message: 'Waiting for wallet confirmation...',
    showSpinner: true,
  },
  processing: {
    icon: Loader2,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    message: 'Submitting transaction...',
    showSpinner: true,
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    message: 'Payment successful!',
    showSpinner: false,
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    message: 'Payment failed',
    showSpinner: false,
  },
};

export const ENSPaymentStatus: React.FC<ENSPaymentStatusProps> = ({
  status,
  domain,
  resolvedAddress,
  transactionHash,
  errorMessage,
  chainId = 11155111,
  showLink = true,
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  const [countdown, setCountdown] = useState(12); // blocks until confirmed

  // Auto-decrement countdown for pending/processing states
  useEffect(() => {
    if (status === 'pending' || status === 'processing') {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status]);

  return (
    <div className={`${config.bgColor} border-l-4 border-${config.color.split('-')[1]}-500 p-4 rounded-lg mb-4`}>
      <div className="flex items-start gap-3">
        <div className="pt-1">
          {config.showSpinner ? (
            <Icon className={`${config.color} animate-spin w-5 h-5`} />
          ) : (
            <Icon className={`${config.color} w-5 h-5`} />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className={`${config.color} font-semibold text-sm`}>
              {config.message}
            </p>
            {countdown > 0 && (status === 'pending' || status === 'processing') && (
              <span className="text-xs text-gray-500">({countdown}s)</span>
            )}
          </div>

          {/* Domain Display */}
          {domain && (
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {domain}
              </span>
            </p>
          )}

          {/* Resolved Address Display */}
          {resolvedAddress && status !== 'resolving' && (
            <p className="text-xs text-gray-600 mb-2">
              <span className="text-gray-500">Resolved to: </span>
              <span className="font-mono text-gray-800">
                {resolvedAddress.slice(0, 6)}...{resolvedAddress.slice(-4)}
              </span>
            </p>
          )}

          {/* Error Message */}
          {status === 'error' && errorMessage && (
            <p className="text-sm text-red-700 mb-2">
              {errorMessage}
            </p>
          )}

          {/* Transaction Hash with Link */}
          {status === 'success' && transactionHash && showLink && (
            <a
              href={getExplorerUrl(chainId, transactionHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 mt-2"
            >
              <span className="font-mono">
                {transactionHash.slice(0, 8)}...{transactionHash.slice(-6)}
              </span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Status Details */}
          <div className="text-xs text-gray-600 mt-2 space-y-1">
            {status === 'pending' && (
              <p>Confirm this transaction in your wallet</p>
            )}
            {status === 'processing' && (
              <p>Broadcasting to blockchain network...</p>
            )}
            {status === 'success' && (
              <p>Transaction confirmed on chain</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
