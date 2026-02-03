import EventEmitter from "eventemitter3";
import { createThirdwebClient, defineChain } from "thirdweb";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { ConnectButton, useActiveAccount, useConnect } from "thirdweb/react";
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

  constructor(chainAbstractionConfig?: Partial<ChainAbstractionConfig>) {
    super();

    // Initialize ThirdWeb client
    this.thirdwebClient = createThirdwebClient({
      clientId: process.env.VITE_THIRDWEB_CLIENT_ID || "",
    });

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
      const chainId = (await account.getChainId()).toString();

      this.state = {
        type: "metamask",
        connected: true,
        address,
        chainId,
        balance: await this.getBalance(address, "evm"),
        ensName: await this.resolveENS(address),
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

      // Setup event listeners
      provider.on("disconnect", () => {
        this.disconnect();
      });

      provider.on("accountChanged", (publicKey: any) => {
        if (publicKey) {
          this.state.address = publicKey.toString();
          this.emit("accountChanged", this.state.address);

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
      const wallet = createWallet("com.hashpack");
      
      // Connect to the wallet
      const account = await wallet.connect({
        client: this.thirdwebClient,
      });

      const address = account.address;

      this.state = {
        type: 'hashpack',
        connected: true,
        address,
        chainId: 'hedera-testnet',
        balance: await this.getBalance(address, 'hedera'),
        ensName: null
      };
      
      this.providers.set('hashpack', wallet);
      this.emit('connect', this.state);
      return this.state;
    } catch (error) {
      throw new Error(`HashPack connection failed: ${(error as Error).message}`);
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
   */
  private async executeArcPayment(
    payment: ChainAbstractedPayment,
  ): Promise<TransactionStatus> {
    if (!this.chainAbstraction.arc.gatewayEnabled) {
      throw new Error("Arc Gateway not enabled");
    }

    // TODO: Integrate Circle Gateway + Bridge Kit
    throw new Error("Arc Gateway integration pending - requires Circle SDK");

    // Example flow:
    /*
    // 1. Check Arc unified balance
    const balance = await this.getArcUnifiedBalance(this.state.address!);
    
    // 2. If insufficient, deposit from source chain
    if (parseFloat(balance.totalUSDC) < parseFloat(payment.sourceAmount)) {
      await this.depositToArcGateway(payment.sourceChain!, payment.sourceAmount);
    }
    
    // 3. Instant transfer to destination (<500ms)
    const tx = await arcGateway.transfer({
      from: this.state.address!,
      to: payment.destinationAddress,
      amount: payment.sourceAmount,
      destinationChain: payment.destinationChain,
      token: 'USDC'
    });
    
    return {
      hash: tx.hash,
      status: 'confirmed',
      confirmations: 1,
      blockNumber: tx.blockNumber
    };
    */
  }

  /**
   * Execute payment to ENS name
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
   */
  async getArcUnifiedBalance(address: string): Promise<ArcUnifiedBalance> {
    // TODO: Query Circle Gateway for unified balance
    throw new Error("Arc unified balance query pending");

    /*
    const balance = await arcGateway.getUnifiedBalance(address);
    return {
      totalUSDC: balance.total,
      balancesByChain: balance.byChain,
      availableForInstantTransfer: balance.total > '0'
    };
    */
  }

  // =====================================================
  // ENS RESOLUTION
  // =====================================================

  /**
   * Resolve ENS name to address
   */
  private async resolveENSToAddress(ensName: string): Promise<string | null> {
    if (!this.chainAbstraction.ens.enabled) return null;

    try {
      // TODO: Use ENS SDK or ethers.js provider
      // const provider = new ethers.providers.JsonRpcProvider(ETHEREUM_RPC);
      // const address = await provider.resolveName(ensName);
      // return address;

      return null; // Placeholder
    } catch (error) {
      console.error("ENS resolution failed:", error);
      return null;
    }
  }

  /**
   * Resolve address to ENS name (reverse lookup)
   */
  private async resolveENS(address: string): Promise<string | null> {
    if (
      !this.chainAbstraction.ens.enabled ||
      !this.chainAbstraction.ens.reverseResolve
    ) {
      return null;
    }

    try {
      // TODO: ENS reverse lookup
      // const provider = new ethers.providers.JsonRpcProvider(ETHEREUM_RPC);
      // const ensName = await provider.lookupAddress(address);
      // return ensName;

      return null; // Placeholder
    } catch (error) {
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
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.blockExplorer],
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
