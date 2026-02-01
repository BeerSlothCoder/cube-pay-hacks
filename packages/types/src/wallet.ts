/**
 * Wallet Connection Types
 * Support for MetaMask, Phantom, WalletConnect, etc.
 */

export type WalletType =
  | "metamask"
  | "phantom"
  | "walletconnect"
  | "coinbase"
  | "trust"
  | "rainbow"
  | "hashpack"
  | "blade"
  | "custom";

export type WalletStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export interface WalletAccount {
  address: string;
  chainId?: number;
  network?: string;
  balance?: string;
  ensName?: string;
}

export interface WalletState {
  type?: WalletType;
  status: WalletStatus;
  account?: WalletAccount;
  accounts?: WalletAccount[];
  error?: string;
}

export interface WalletConnector {
  connect: () => Promise<WalletAccount>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (tx: any) => Promise<string>;
  isAvailable: () => boolean;
}

export interface MultiWalletState {
  evm?: WalletState;
  solana?: WalletState;
  hedera?: WalletState;
  activeWallet?: "evm" | "solana" | "hedera";
}
