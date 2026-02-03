export { WalletConnector, createWalletConnector } from "./connector";

export type {
  // Wallet Types
  WalletType,
  WalletState,
  WalletConnectionOptions,
  WalletEvents,

  // Payment Faces
  PaymentFace,
  PaymentFaceConfig,

  // Chain Abstraction
  ChainAbstractionConfig,
  ArcConfig,
  ENSConfig,
  ChainAbstractedPayment,

  // Transaction
  TransactionStatus,
  ArcUnifiedBalance,
  PaymentExecutionResult,
} from "./types";

export { PAYMENT_FACES } from "./types";

export {
  executeEVMUSDCPayment,
  executeSolanaUSDCPayment,
  executeHederaUSDHPayment,
  getPaymentMethod,
  USDC_ADDRESSES,
  SOLANA_USDC_ADDRESSES,
} from "./payments";
