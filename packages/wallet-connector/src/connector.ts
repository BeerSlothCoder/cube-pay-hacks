import EventEmitter from "eventemitter3";
import { createThirdwebClient, defineChain } from "thirdweb";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { ConnectButton, useActiveAccount, useConnect } from "thirdweb/react";
import { ethers } from "ethers";
import { createGatewayClient, CircleGatewayClient } from "./circleGateway";
import type {
  WalletType,
  WalletState,
  WalletConnectionOptions,
  WalletEvents,
  ChainAbstractionConfig,
  ChainAbstractedPayment,
  TransactionStatus,
  ArcUnifiedBalance,
  PaymentFace,
} from "./types";
import type { NetworkConfig } from "@cubepay/network-config";

/**
 * CubePay Wallet Connector
 *
 * Multi-chain wallet connection with Arc chain abstraction
 * Supports: Circle Wallets, MetaMask, Phantom, HashPack
 */
export class WalletConnector extends EventEmitter<WalletEvents> {
  private state: WalletState = {
    type: null,
    connected: false,
    address: null,
    chainId: null,
    balance: null,
    ensName: null,
  };

  private chainAbstraction: ChainAbstractionConfig;
  private providers: Map<WalletType, any> = new Map();
  private thirdwebClient: any;
  private gatewayClient: CircleGatewayClient;

  constructor(chainAbstractionConfig?: Partial<ChainAbstractionConfig>) {
    super();

    // Initialize ThirdWeb client
    this.thirdwebClient = createThirdwebClient({
      clientId: process.env.VITE_THIRDWEB_CLIENT_ID || "",
    });

    // Initialize Circle Gateway client for Arc chain abstraction
    this.gatewayClient = createGatewayClient();

    // Default Arc-focused configuration
    this.chainAbstraction = {
      arc: {
        gatewayEnabled: true,
        bridgeKitEnabled: true,
        instantTransfers: true,
        unifiedBalance: true,
      },
      ens: {
        enabled: true,
        resolveNames: true,
        reverseResolve: true,
        supportedChains: ["ethereum", "arbitrum", "base", "optimism"],
      },
      chainlink: {
        enabled: false, // Keep for future Chainlink hackathon
        lanes: [],
      },
      lifi: {
        enabled: true, // Fallback routing
      },
      ...chainAbstractionConfig,
    };
  }

  // =====================================================
  // WALLET CONNECTION
  // =====================================================

  /**
   * Connect to a wallet
   */
  async connect(
    walletType: WalletType,
    options?: WalletConnectionOptions,
  ): Promise<WalletState> {
    try {
      switch (walletType) {
        case "circle":
          return await this.connectCircleWallet(options);
        case "metamask":
          return await this.connectMetaMask(options);
        case "phantom":
          return await this.connectPhantom(options);
        case "hashpack":
          return await this.connectHashPack(options);
        default:
          throw new Error(`Unsupported wallet type: ${walletType}`);
      }
    } catch (error) {
      this.emit("error", error as Error);
      throw error;
    }
  }

  /**
   * Disconnect current wallet
   */
  async disconnect(): Promise<void> {
    if (!this.state.connected) return;

    // Cleanup wallet-specific connections
    if (this.state.type && this.providers.has(this.state.type)) {
      // Wallet-specific disconnect logic
    }

    this.state = {
      type: null,
      connected: false,
      address: null,
      chainId: null,
      balance: null,
      ensName: null,
    };

    this.emit("disconnect");
  }

  /**
   * Get current wallet state
   */
  getState(): WalletState {
    return { ...this.state };
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.state.connected;
  }

  // =====================================================
  // CIRCLE WALLET (PRIMARY - ARC FOCUSED)
  // =====================================================

  private async connectCircleWallet(
    options?: WalletConnectionOptions,
  ): Promise<WalletState> {
    // TODO: Integrate Circle W3S SDK
    // Circle Wallets provide unified addressing across EVM + Solana

    throw new Error(
      "Circle Wallet integration pending - requires Circle API keys",
    );

    // Example implementation:
    /*
    const w3s = await initializeCircleWallet({
      appId: process.env.CIRCLE_APP_ID,
      walletType: 'passkey' // or 'mpc'
    });
    
    const wallet = await w3s.createWallet();
    
    this.state = {
      type: 'circle',
      connected: true,
      address: wallet.address,
      chainId: 'arc-testnet',
      balance: await this.getArcUnifiedBalance(wallet.address),
      ensName: await this.resolveENS(wallet.address)
    };
    
    this.providers.set('circle', w3s);
    this.emit('connect', this.state);
    return this.state;
    */
  }

  // =====================================================
  // METAMASK (EVM CHAINS)
  // =====================================================

  private async connectMetaMask(
    options?: WalletConnectionOptions,
  ): Promise<WalletState> {
    try {
      // Create MetaMask wallet using ThirdWeb SDK
      const wallet = createWallet("io.metamask");

      // Connect to the wallet
      const account = await wallet.connect({
        client: this.thirdwebClient,
      });

      const address = account.address;
      // TODO: Fix ThirdWeb Account API types
      // const chainId = (await account.getChainId()).toString();
      const chainId = "1"; // Ethereum mainnet

      this.state = {
        type: "metamask",
        connected: true,
        address,
        chainId,
        balance: await this.getBalance(address, "evm"),
        ensName: await this.resolveAddressToENS(address),
      };

      this.providers.set("metamask", wallet);
      this.emit("connect", this.state);
      return this.state;
    } catch (error) {
      throw new Error(
        `MetaMask connection failed: ${(error as Error).message}`,
      );
    }
  }

  // =====================================================
  // PHANTOM (SOLANA)
  // =====================================================

  private async connectPhantom(
    options?: WalletConnectionOptions,
  ): Promise<WalletState> {
    try {
      // Create Phantom wallet using ThirdWeb SDK
      const wallet = createWallet("app.phantom");

      // Connect to the wallet
      const account = await wallet.connect({
        client: this.thirdwebClient,
      });

      const address = account.address;

      this.state = {
        type: "phantom",
        connected: true,
        address,
        chainId: "solana-devnet",
        balance: await this.getBalance(address, "solana"),
        ensName: null, // Solana doesn't use ENS
      };

      this.providers.set("phantom", wallet);
      this.emit("connect", this.state);
      return this.state;
    } catch (error) {
      throw new Error(`Phantom connection failed: ${(error as Error).message}`);
    }
  }

  // =====================================================
  // HASHPACK (HEDERA)
  // =====================================================

  private async connectHashPack(
    options?: WalletConnectionOptions,
  ): Promise<WalletState> {
    try {
      // Create HashPack wallet using ThirdWeb SDK
      // TODO: Fix ThirdWeb WalletId type for HashPack
      const wallet = createWallet("com.hashpack" as any);

      // Connect to the wallet
      const account = await wallet.connect({
        client: this.thirdwebClient,
      });

      const address = account.address;

      this.state = {
        type: "hashpack",
        connected: true,
        address,
        chainId: "hedera-testnet",
        balance: await this.getBalance(address, "hedera"),
        ensName: null,
      };

      this.providers.set("hashpack", wallet);
      this.emit("connect", this.state);
      return this.state;
    } catch (error) {
      throw new Error(
        `HashPack connection failed: ${(error as Error).message}`,
      );
    }
  }

  // =====================================================
  // ARC CHAIN ABSTRACTION
  // =====================================================

  /**
   * Execute chain-abstracted payment using Arc
   * User pays from ANY chain, agent receives on ANY chain
   */
  async executeChainAbstractedPayment(
    payment: ChainAbstractedPayment,
  ): Promise<TransactionStatus> {
    if (!this.state.connected) {
      throw new Error("Wallet not connected");
    }

    // Face 1: Crypto QR Payment with Arc
    if (payment.paymentFace === "crypto-qr" && payment.useArcGateway) {
      return await this.executeArcPayment(payment);
    }

    // Face 6: ENS Payment
    if (payment.paymentFace === "ens-payment" && payment.destinationENS) {
      return await this.executeENSPayment(payment);
    }

    // Fallback to direct transfer
    return await this.executeDirectPayment(payment);
  }

  /**
   * Execute payment through Arc Gateway (instant <500ms)
   * Uses Circle Gateway for cross-chain USDC transfers
   */
  private async executeArcPayment(
    payment: ChainAbstractedPayment,
  ): Promise<TransactionStatus> {
    if (!this.chainAbstraction.arc.gatewayEnabled) {
      throw new Error("Arc Gateway not enabled");
    }

    if (!this.state.connected || !this.state.chainId) {
      throw new Error("Wallet not connected");
    }

    try {
      // Get current provider
      const provider = this.providers.get(this.state.type!);
      if (!provider) {
        throw new Error("Provider not available");
      }

      // Parse chain IDs
      const sourceChainId = parseInt(this.state.chainId);
      const destinationChainId = parseInt(payment.destinationChain);

      console.log(
        `🌉 Arc Gateway: Initiating transfer from chain ${sourceChainId} → ${destinationChainId}`,
      );

      // Execute cross-chain transfer via Circle Gateway
      const result = await this.gatewayClient.executeCrossChainTransfer(
        {
          sourceChainId,
          destinationChainId,
          amount: payment.sourceAmount,
          destinationAddress: payment.destinationAddress,
          sourceAddress: this.state.address!,
        },
        (window as any).ethereum || provider,
      );

      return {
        hash: result.sourceTransactionHash || "",
        status: result.status === "completed" ? "confirmed" : "pending",
        confirmations: result.status === "completed" ? 1 : 0,
        blockNumber: 0,
      };
    } catch (error) {
      console.error("Arc payment failed:", error);
      throw error;
    }
  }

  /**
   * Execute payment to ENS name
   * @param payment - Payment with ENS destination
   * @returns Transaction status
   */
  private async executeENSPayment(
    payment: ChainAbstractedPayment,
  ): Promise<TransactionStatus> {
    if (!this.chainAbstraction.ens.enabled) {
      throw new Error("ENS integration not enabled");
    }

    // Resolve ENS to address
    const resolvedAddress = await this.resolveENSToAddress(
      payment.destinationENS!,
    );

    if (!resolvedAddress) {
      throw new Error(`Could not resolve ENS name: ${payment.destinationENS}`);
    }

    console.log(
      `Executing payment to ${payment.destinationENS} (${resolvedAddress})`,
    );

    // Execute payment to resolved address
    return await this.executeDirectPayment({
      ...payment,
      destinationAddress: resolvedAddress,
    });
  }

  /**
   * Execute direct payment (non-abstracted)
   */
  private async executeDirectPayment(
    payment: ChainAbstractedPayment,
  ): Promise<TransactionStatus> {
    // Wallet-specific transfer logic
    throw new Error("Direct payment implementation pending");
  }

  // =====================================================
  // ARC UNIFIED BALANCE
  // =====================================================

  /**
   * Get Arc unified USDC balance across all chains
   * Uses Circle Gateway to aggregate balances from multiple chains
   */
  async getArcUnifiedBalance(address: string): Promise<ArcUnifiedBalance> {
    if (!this.chainAbstraction.arc.unifiedBalance) {
      throw new Error("Arc unified balance not enabled");
    }

    try {
      const balance = await this.gatewayClient.getUnifiedBalance(address);

      // Convert numeric chain IDs to string format for compatibility
      const balancesByChain: Record<string, string> = {};
      for (const [chainId, amount] of Object.entries(balance.balancesByChain)) {
        balancesByChain[chainId] = amount;
      }

      return {
        totalUSDC: balance.totalUSDC,
        balancesByChain,
        availableForInstantTransfer: parseFloat(balance.totalUSDC) > 0,
      };
    } catch (error) {
      console.error("Failed to fetch unified balance:", error);
      throw error;
    }
  }

  // =====================================================
  // ENS RESOLUTION
  // =====================================================

  /**
   * Resolve ENS name to address
   * @param ensName - ENS domain (e.g., "vitalik.eth")
   * @returns Ethereum address or null if not found
   */
  private async resolveENSToAddress(ensName: string): Promise<string | null> {
    if (!this.chainAbstraction.ens.enabled) return null;

    try {
      // Use Ethereum mainnet for ENS resolution
      const provider = new ethers.JsonRpcProvider(
        "https://ethereum.publicnode.com",
      );

      // Resolve ENS name to address
      const address = await provider.resolveName(ensName);

      if (address) {
        console.log(`ENS resolved: ${ensName} → ${address}`);
      }

      return address;
    } catch (error) {
      console.error(`ENS resolution failed for ${ensName}:`, error);
      return null;
    }
  }

  /**
   * Resolve address to ENS name (reverse lookup)
   * @param address - Ethereum address (e.g., "0x123...")
   * @returns ENS name or null if not found
   */
  private async resolveAddressToENS(address: string): Promise<string | null> {
    if (
      !this.chainAbstraction.ens.enabled ||
      !this.chainAbstraction.ens.reverseResolve
    ) {
      return null;
    }

    try {
      // Use Ethereum mainnet for ENS reverse resolution
      const provider = new ethers.JsonRpcProvider(
        "https://ethereum.publicnode.com",
      );

      // Resolve address to ENS name
      const ensName = await provider.lookupAddress(address);

      if (ensName) {
        console.log(`ENS reverse resolved: ${address} → ${ensName}`);
      }

      return ensName;
    } catch (error) {
      console.error(`ENS reverse resolution failed for ${address}:`, error);
      return null;
    }
  }

  // =====================================================
  // BALANCE QUERIES
  // =====================================================

  private async getBalance(
    address: string,
    network: "evm" | "solana" | "hedera",
  ): Promise<string> {
    // TODO: Implement balance queries per network
    return "0";
  }

  // =====================================================
  // NETWORK SWITCHING
  // =====================================================

  async switchNetwork(network: NetworkConfig): Promise<void> {
    if (!this.state.connected) {
      throw new Error("Wallet not connected");
    }

    if (this.state.type === "metamask") {
      await this.switchMetaMaskNetwork(network);
    } else if (this.state.type === "circle") {
      // Circle Wallets handle network abstraction automatically
      console.log("Circle Wallets handle network switching automatically");
    } else {
      throw new Error(`Network switching not supported for ${this.state.type}`);
    }
  }

  private async switchMetaMaskNetwork(network: NetworkConfig): Promise<void> {
    const provider = this.providers.get("metamask");
    if (!provider) throw new Error("MetaMask not connected");
    if (!network.chainId) throw new Error("Network chain ID is required");

    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${network.chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // Chain not added, try to add it
      if (error.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${network.chainId.toString(16)}`,
              chainName: network.name,
              nativeCurrency: network.nativeCurrency,
              rpcUrls: network.rpcUrls,
              blockExplorerUrls: network.blockExplorerUrls || [],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }
}

// Export factory function
export function createWalletConnector(
  config?: Partial<ChainAbstractionConfig>,
): WalletConnector {
  return new WalletConnector(config);
}
