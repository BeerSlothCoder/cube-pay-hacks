import React, { useState, useEffect } from "react";
import { usePaymentStore } from "../stores/paymentStore";
import {
  X,
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";
import QRCode from "qrcode";

// Inject ARTM animation styles
const ARTM_STYLES = `
  @keyframes ledPulse {
    0%, 100% { opacity: 1; filter: brightness(1) drop-shadow(0 0 8px rgba(0, 212, 255, 0.8)); }
    50% { opacity: 0.7; filter: brightness(0.8) drop-shadow(0 0 4px rgba(0, 212, 255, 0.4)); }
  }
  
  @keyframes scanlines {
    0% { transform: translateY(0); }
    100% { transform: translateY(10px); }
  }
  
  .artm-led-indicator {
    animation: ledPulse 2s ease-in-out infinite;
  }
  
  .artm-scanline {
    animation: scanlines 8s linear infinite;
  }
`;

// Inject styles into head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = ARTM_STYLES;
  document.head.appendChild(styleSheet);
}
import {
  WalletConnector,
  createGatewayClient,
  createENSClient,
} from "@cubepay/wallet-connector";
import {
  executeEVMUSDCPayment,
  executeSolanaUSDCPayment,
} from "@cubepay/wallet-connector";
import type {
  PaymentExecutionResult,
  UnifiedBalance,
  ENSAgentProfile,
} from "@cubepay/wallet-connector";
import { arcPaymentService } from "../services/arcPaymentService";
import { arcQRService } from "../services/arcQRService";
import type { ArcPaymentSession } from "../services/arcPaymentService";
import {
  createPaymentSession,
  updatePaymentSession,
} from "../utils/paymentSessions";
import { ensPaymentService } from "../services/ensPaymentService";
import { ENSPaymentDisplay } from "./ENSPaymentDisplay";
import type { ENSPaymentConfig } from "../services/ensPaymentService";
import { isVirtualTerminal } from "../utils/agentTypeMapping";
import ARTMDisplayModal from "./ARTMDisplayModal";
import CardWithdrawalModal from "./CardWithdrawalModal";
import CryptoWithdrawalModal from "./CryptoWithdrawalModal";

export const PaymentModal: React.FC = () => {
  const { selectedPaymentFace, selectedAgent, closePaymentModal } =
    usePaymentStore();
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [walletConnector] = useState(() => new WalletConnector());
  const [gatewayClient] = useState(() => createGatewayClient());
  const [ensClient] = useState(() => createENSClient());
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [recipientENSProfile, setRecipientENSProfile] =
    useState<ENSAgentProfile | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("10");
  const [selectedChain, setSelectedChain] = useState<number>(11155111); // Ethereum Sepolia
  const [destinationChain, setDestinationChain] = useState<number>(84532); // Base Sepolia
  const [useCrossChain, setUseCrossChain] = useState(false);
  const [unifiedBalance, setUnifiedBalance] = useState<UnifiedBalance | null>(
    null,
  );
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "connecting" | "processing" | "success" | "error"
  >("idle");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recipientInput, setRecipientInput] = useState<string>("");
  const [isResolvingENS, setIsResolvingENS] = useState(false);

  // ARTM Modal State
  const [artmStep, setArtmStep] = useState<"display" | "card" | "crypto">(
    "display",
  );

  // ENS Payment State
  const [ensPaymentConfig, setENSPaymentConfig] =
    useState<ENSPaymentConfig | null>(null);
  const [ensNetwork] = useState<"mainnet" | "sepolia">("sepolia");
  const [showENSAdvanced, setShowENSAdvanced] = useState(false);

  // Arc Blockchain Settlement State
  const [arcSession, setArcSession] = useState<ArcPaymentSession | null>(null);
  const [arcSettlementStatus, setArcSettlementStatus] = useState<
    "idle" | "monitoring" | "confirmed" | "failed"
  >("idle");
  const [arcConfirmationDepth, setArcConfirmationDepth] = useState<number>(0);
  const [arcExplorerUrl, setArcExplorerUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPaymentFace === "crypto_qr" && selectedAgent) {
      // Generate QR code for agent's wallet address
      const agentWallet =
        selectedAgent.agent_wallet ||
        "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
      QRCode.toDataURL(
        `ethereum:${agentWallet}@${selectedChain}?value=${paymentAmount}`,
      )
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("QR Code generation error:", err));
    }
  }, [selectedPaymentFace, selectedAgent, selectedChain, paymentAmount]);

  // Fetch ENS profile when recipient input changes to .eth
  useEffect(() => {
    const fetchENSProfile = async () => {
      if (recipientInput.endsWith(".eth")) {
        setIsResolvingENS(true);
        try {
          const profile = await ensClient.getAgentProfile(recipientInput);
          setRecipientENSProfile(profile);

          // Auto-fill payment preferences if available
          if (profile?.paymentPreferences) {
            const { preferredChain, minPayment, maxPayment } =
              profile.paymentPreferences;

            // Set preferred chain if available
            if (preferredChain) {
              const chainId = chains.find(
                (c) => c.symbol.toLowerCase() === preferredChain.toLowerCase(),
              )?.id;
              if (chainId) {
                setDestinationChain(chainId);
              }
            }

            // Warn if payment amount is outside agent's range
            const amount = parseFloat(paymentAmount);
            if (minPayment && amount < parseFloat(minPayment)) {
              setErrorMessage(
                `Agent ${recipientInput} requires minimum $${minPayment} USDC`,
              );
            } else if (maxPayment && amount > parseFloat(maxPayment)) {
              setErrorMessage(
                `Agent ${recipientInput} accepts maximum $${maxPayment} USDC`,
              );
            } else {
              setErrorMessage(null);
            }
          }
        } catch (error) {
          console.error("Failed to fetch ENS profile:", error);
          setRecipientENSProfile(null);
        } finally {
          setIsResolvingENS(false);
        }
      } else {
        setRecipientENSProfile(null);
      }
    };

    const debounce = setTimeout(fetchENSProfile, 500);
    return () => clearTimeout(debounce);
  }, [recipientInput, paymentAmount]);

  // ENS Payment Resolution Effect
  useEffect(() => {
    const resolveENSPayment = async () => {
      if (
        selectedPaymentFace === "ens_payment" &&
        recipientInput.endsWith(".eth")
      ) {
        setIsResolvingENS(true);
        try {
          const config = await ensPaymentService.resolveENSPayment(
            recipientInput,
            ensNetwork,
          );
          if (config) {
            setENSPaymentConfig(config);

            // Auto-select recommended chain if available
            const recommendedChain =
              ensPaymentService.getRecommendedChain(config);
            if (recommendedChain) {
              setSelectedChain(recommendedChain.chainId);
            }
          } else {
            setENSPaymentConfig(null);
          }
        } catch (error) {
          console.error("Failed to resolve ENS payment config:", error);
          setENSPaymentConfig(null);
        } finally {
          setIsResolvingENS(false);
        }
      }
    };

    const debounce = setTimeout(resolveENSPayment, 500);
    return () => clearTimeout(debounce);
  }, [recipientInput, selectedPaymentFace, ensNetwork]);

  // Connect wallet
  const handleConnectWallet = async (
    walletType: "metamask" | "phantom" | "hashpack",
  ) => {
    setPaymentStatus("connecting");
    setErrorMessage(null);

    try {
      const state = await walletConnector.connect(walletType);
      setIsWalletConnected(true);
      setWalletAddress(state.address);
      setEnsName(state.ensName || null);
      setPaymentStatus("idle");

      // Load unified balance
      loadUnifiedBalance(state.address!);
    } catch (error) {
      setPaymentStatus("error");
      setErrorMessage((error as Error).message);
    }
  };

  // Load unified balance across all chains
  const loadUnifiedBalance = async (address: string) => {
    setIsLoadingBalance(true);
    try {
      const balance = await gatewayClient.getUnifiedBalance(address);
      setUnifiedBalance(balance);
    } catch (error) {
      console.error("Failed to load unified balance:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Execute payment
  const handlePayment = async () => {
    if (!isWalletConnected || !selectedAgent || !walletAddress) {
      setErrorMessage("Please connect your wallet first");
      return;
    }

    setPaymentStatus("processing");
    setErrorMessage(null);

    try {
      let result: PaymentExecutionResult;
      let recipientAddress = selectedAgent.agent_wallet!;

      // If ENS payment, use resolved address
      if (selectedPaymentFace === "ens_payment" && ensPaymentConfig) {
        recipientAddress = ensPaymentConfig.resolvedAddress;
      }

      // Determine payment method based on selected chain
      if (selectedChain === 5042002) {
        // Arc Testnet Settlement
        console.log(
          "🔵 Arc Settlement detected - initiating Arc blockchain transfer",
        );

        try {
          // Initiate Arc payment session
          const arcPaymentRequest = {
            recipientAddress,
            agentId: selectedAgent.id,
            amount: paymentAmount,
            sourceChainId: useCrossChain ? selectedChain : destinationChain,
            destinationChainId: 5042002, // Arc Testnet
            terminalType: (selectedAgent.agent_type || "ar_viewer") as
              | "pos"
              | "ar_viewer"
              | "artm",
            metadata: {
              description: `Payment to ${selectedAgent.agent_name}`,
              orderId: selectedAgent.id,
            },
          };

          const session =
            await arcPaymentService.initiatePayment(arcPaymentRequest);
          setArcSession(session);
          setArcSettlementStatus("monitoring");

          // Set Arc explorer URL
          setArcExplorerUrl("https://testnet.arcscan.app");

          // For Arc testnet demo, simulate successful transfer
          // In production, wallet would sign the transaction via QR scan
          result = {
            success: true,
            transactionHash: session.paymentRequestId,
            status: "confirmed",
          };

          // Subscribe to Arc settlement updates via WebSocket
          const wsSubscription =
            arcPaymentService.arcClient?.subscribeToSettlementUpdates(
              [session.circleTransferId || ""],
              (message) => {
                console.log("🔵 Arc Settlement Update:", message);
                if (message.type === "blockchain:confirmation") {
                  setArcConfirmationDepth(message.data?.confirmationDepth || 0);
                  if (message.data?.confirmationDepth >= 6) {
                    setArcSettlementStatus("confirmed");
                    console.log(
                      "✅ Arc Settlement Confirmed (",
                      message.data.confirmationDepth,
                      " blocks)",
                    );
                  } else {
                    setArcSettlementStatus("monitoring");
                  }
                }
              },
            );
        } catch (arcError) {
          console.error("Arc payment failed:", arcError);
          setPaymentStatus("error");
          setErrorMessage(
            `Arc settlement failed: ${(arcError as Error).message}`,
          );
          return;
        }
      } else if (selectedChain === 900) {
        // Solana
        result = await executeSolanaUSDCPayment(
          recipientAddress,
          parseFloat(paymentAmount),
          (window as any).phantom?.solana,
          "devnet",
        );
      } else if (selectedChain === 295) {
        // Hedera
        setErrorMessage("Hedera payments coming soon");
        setPaymentStatus("idle");
        return;
      } else {
        // EVM chains
        result = await executeEVMUSDCPayment(
          selectedChain,
          recipientAddress,
          parseFloat(paymentAmount),
          (window as any).ethereum,
        );
      }

      if (result.success) {
        setPaymentStatus("success");
        setTransactionHash(result.transactionHash);

        // Create payment session in database
        const sessionId = await createPaymentSession({
          agent_id: selectedAgent.id,
          payer_wallet: walletAddress,
          recipient_wallet: recipientAddress,
          amount: parseFloat(paymentAmount),
          token: "USDC",
          chain_id: selectedChain,
          transaction_hash: result.transactionHash,
          status: result.status === "confirmed" ? "confirmed" : "pending",
          payment_face: selectedPaymentFace,
          metadata: {
            ensName:
              selectedPaymentFace === "ens_payment"
                ? recipientInput
                : undefined,
          },
        });

        // Update with block number if available
        if (sessionId && result.blockNumber) {
          await updatePaymentSession(sessionId, {
            block_number: result.blockNumber,
          });
        }
      } else {
        setPaymentStatus("error");
        setErrorMessage(result.error || "Payment failed");

        // Log failed payment
        await createPaymentSession({
          agent_id: selectedAgent.id,
          payer_wallet: walletAddress,
          recipient_wallet: recipientAddress,
          amount: parseFloat(paymentAmount),
          token: "USDC",
          chain_id: selectedChain,
          transaction_hash: result.transactionHash || "failed",
          status: "failed",
          payment_face: selectedPaymentFace,
          error_message: result.error,
        });
      }
    } catch (error) {
      setPaymentStatus("error");
      setErrorMessage((error as Error).message);
    }
  };

  if (!selectedPaymentFace || !selectedAgent) return null;

  // ARTM Detection & Routing
  if (isVirtualTerminal(selectedAgent.agent_type)) {
    console.log("🏧 ARTM agent detected - showing ARTMDisplayModal");

    if (artmStep === "display") {
      return (
        <ARTMDisplayModal
          agent={selectedAgent}
          onCardClick={() => setArtmStep("card")}
          onWalletClick={() => setArtmStep("crypto")}
          onClose={closePaymentModal}
        />
      );
    }

    if (artmStep === "card") {
      return (
        <CardWithdrawalModal
          agent={selectedAgent}
          onClose={closePaymentModal}
        />
      );
    }

    // Crypto withdrawal is now handled internally by ARTMDisplayModal
    // (wallet_balance screen → CryptoWithdrawalModal with full props)
    if (artmStep === "crypto") {
      // Redirect back to ARTM display which manages crypto flow
      setArtmStep("display");
      return null;
    }
  }

  // Standard Payment Modal for non-ARTM agents
  const faceConfigs = {
    crypto_qr: {
      title: "Crypto QR Payment",
      color: "#00D4FF",
      description: "Scan this QR code with your crypto wallet",
    },
    virtual_card: {
      title: "Virtual Card Payment",
      color: "#7C3AED",
      description: "Use your virtual card to complete the payment",
    },
    on_off_ramp: {
      title: "On/Off Ramp",
      color: "#3B82F6",
      description: "Convert between fiat and crypto",
    },
    ens_payment: {
      title: "ENS Payment",
      color: "#F59E0B",
      description: "Pay using your ENS domain",
    },
    sound_pay: {
      title: "Sound Pay",
      color: "#64748B",
      description: "Pay using sound waves",
    },
    voice_pay: {
      title: "Voice Pay",
      color: "#64748B",
      description: "Pay using voice commands",
    },
  };

  const config = faceConfigs[selectedPaymentFace];

  // Chain configurations (including Arc testnet settlement hub)
  const chains = [
    { id: 11155111, name: "Ethereum Sepolia", symbol: "ETH" },
    { id: 84532, name: "Base Sepolia", symbol: "ETH" },
    { id: 421614, name: "Arbitrum Sepolia", symbol: "ETH" },
    { id: 11155420, name: "Optimism Sepolia", symbol: "ETH" },
    { id: 80002, name: "Polygon Amoy", symbol: "MATIC" },
    { id: 43113, name: "Avalanche Fuji", symbol: "AVAX" },
    { id: 97, name: "BNB Testnet", symbol: "BNB" },
    { id: 900, name: "Solana Devnet", symbol: "SOL" },
    {
      id: 5042002,
      name: "Arc Testnet (Settlement Hub)",
      symbol: "USDC",
      isArcSettlement: true,
    },
  ];

  // Render wallet connection section
  const renderWalletConnection = () => (
    <div className="space-y-4">
      {!isWalletConnected ? (
        <>
          <p className="text-cubepay-text-secondary text-sm mb-4">
            Connect your wallet to continue
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleConnectWallet("metamask")}
              disabled={paymentStatus === "connecting"}
              className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              <Wallet size={20} />
              MetaMask
            </button>
            <button
              onClick={() => handleConnectWallet("phantom")}
              disabled={paymentStatus === "connecting"}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              <Wallet size={20} />
              Phantom
            </button>
          </div>
          {paymentStatus === "connecting" && (
            <div className="flex items-center justify-center gap-2 text-cubepay-text-secondary">
              <Loader2 className="animate-spin" size={16} />
              <span>Connecting wallet...</span>
            </div>
          )}
        </>
      ) : (
        <div className="bg-green-900 bg-opacity-30 border border-green-600 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <CheckCircle size={20} />
            <span className="font-semibold">Wallet Connected</span>
          </div>
          {ensName && (
            <p className="text-green-400 text-sm mb-1 font-semibold">
              {ensName}
            </p>
          )}
          <p className="text-cubepay-text-secondary text-sm font-mono">
            {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </p>

          {/* Unified Balance Display */}
          {unifiedBalance && (
            <div className="mt-3 pt-3 border-t border-green-600/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-cubepay-text-secondary">
                  Total USDC
                </span>
                {isLoadingBalance && (
                  <Loader2 className="animate-spin" size={12} />
                )}
              </div>
              <p className="text-lg font-bold text-green-400">
                ${unifiedBalance.totalUSDC}
              </p>
              <p className="text-xs text-cubepay-text-secondary mt-1">
                Across {unifiedBalance.availableChains.length} chains via Arc 🌉
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render payment form
  const renderPaymentForm = () => (
    <div className="space-y-4">
      {/* Cross-Chain Toggle */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-blue-400" />
            <span className="text-sm font-semibold text-blue-400">
              Arc Cross-Chain Payment
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useCrossChain}
              onChange={(e) => setUseCrossChain(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <p className="text-xs text-cubepay-text-secondary">
          Pay from any chain to any chain using Circle Gateway
        </p>
      </div>

      {/* Recipient Address/ENS Input */}
      <div>
        <label className="block text-sm text-cubepay-text-secondary mb-2">
          Recipient Address or ENS
        </label>
        <input
          type="text"
          value={recipientInput || selectedAgent?.agent_wallet || ""}
          onChange={(e) => setRecipientInput(e.target.value)}
          placeholder="0x... or name.eth"
          className="w-full bg-cubepay-card text-cubepay-text px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        {recipientInput.endsWith(".eth") && (
          <p className="text-blue-400 text-xs mt-1 flex items-center gap-1">
            {isResolvingENS ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Resolving ENS profile...
              </>
            ) : recipientENSProfile ? (
              <>
                <CheckCircle size={12} />
                ENS profile loaded ✓
              </>
            ) : (
              "🏷️ ENS domain will be resolved automatically"
            )}
          </p>
        )}

        {/* ENS Profile Card */}
        {recipientENSProfile && (
          <div className="mt-3 bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
            <div className="flex items-start gap-3">
              {recipientENSProfile.avatar && (
                <img
                  src={recipientENSProfile.avatar}
                  alt={recipientENSProfile.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-blue-400">
                  {recipientENSProfile.name}
                </h4>
                {recipientENSProfile.description && (
                  <p className="text-xs text-cubepay-text-secondary mt-1">
                    {recipientENSProfile.description}
                  </p>
                )}
                {recipientENSProfile.paymentPreferences && (
                  <div className="mt-2 space-y-1">
                    {recipientENSProfile.paymentPreferences.preferredChain && (
                      <p className="text-xs text-green-400">
                        ⛓️ Prefers:{" "}
                        {recipientENSProfile.paymentPreferences.preferredChain}
                      </p>
                    )}
                    {(recipientENSProfile.paymentPreferences.minPayment ||
                      recipientENSProfile.paymentPreferences.maxPayment) && (
                      <p className="text-xs text-cubepay-text-secondary">
                        💰 Range: $
                        {recipientENSProfile.paymentPreferences.minPayment ||
                          "0"}{" "}
                        - $
                        {recipientENSProfile.paymentPreferences.maxPayment ||
                          "∞"}{" "}
                        USDC
                      </p>
                    )}
                  </div>
                )}
                {recipientENSProfile.rating && (
                  <p className="text-xs text-yellow-400 mt-1">
                    ⭐ {recipientENSProfile.rating}/5
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Source Chain Selector (only show if cross-chain) */}
      {useCrossChain && (
        <div>
          <label className="block text-sm text-cubepay-text-secondary mb-2">
            Source Network (Your Chain)
          </label>
          <select
            value={selectedChain}
            onChange={(e) => setSelectedChain(Number(e.target.value))}
            className="w-full bg-cubepay-card text-cubepay-text px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            {chains.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name} ({chain.symbol})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Destination Chain Selector */}
      <div>
        <label className="block text-sm text-cubepay-text-secondary mb-2">
          {useCrossChain ? "Destination Network (Agent's Chain)" : "Network"}
        </label>
        <select
          value={useCrossChain ? destinationChain : selectedChain}
          onChange={(e) =>
            useCrossChain
              ? setDestinationChain(Number(e.target.value))
              : setSelectedChain(Number(e.target.value))
          }
          className="w-full bg-cubepay-card text-cubepay-text px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        >
          {chains.map((chain) => (
            <option key={chain.id} value={chain.id}>
              {chain.name} ({chain.symbol})
            </option>
          ))}
        </select>
        {useCrossChain && selectedChain !== destinationChain && (
          <p className="text-blue-400 text-xs mt-1 flex items-center gap-1">
            <Zap size={12} />
            Arc Gateway will route automatically
          </p>
        )}
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm text-cubepay-text-secondary mb-2">
          Amount (USDC)
        </label>
        <input
          type="number"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          min="0.01"
          step="0.01"
          className="w-full bg-cubepay-card text-cubepay-text px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={!isWalletConnected || paymentStatus === "processing"}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {paymentStatus === "processing" ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Processing Payment...
          </>
        ) : (
          `Pay ${paymentAmount} USDC`
        )}
      </button>
    </div>
  );

  // Render transaction status
  const renderTransactionStatus = () => {
    if (paymentStatus === "success" && transactionHash) {
      return (
        <div className="bg-green-900 bg-opacity-30 border border-green-600 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-400 mb-3">
            <CheckCircle size={24} />
            <span className="font-semibold text-lg">Payment Successful!</span>
          </div>
          <p className="text-cubepay-text-secondary text-sm mb-2">
            Transaction Hash:
          </p>
          <p className="text-cubepay-text text-xs font-mono break-all bg-cubepay-card p-2 rounded">
            {transactionHash}
          </p>

          {/* Arc Blockchain Settlement Status */}
          {selectedChain === 5042002 && arcSession && (
            <div className="mt-4 pt-4 border-t border-green-600/30">
              <div className="space-y-2">
                <h4 className="text-blue-400 font-semibold text-sm">
                  🔵 Arc Blockchain Settlement
                </h4>
                <div className="bg-blue-900/20 rounded p-2 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-cubepay-text-secondary">Status:</span>
                    <span
                      className={
                        arcSettlementStatus === "confirmed"
                          ? "text-green-400 font-semibold"
                          : "text-yellow-400 font-semibold"
                      }
                    >
                      {arcSettlementStatus === "confirmed"
                        ? "✅ Confirmed"
                        : "⏳ Monitoring"}
                    </span>
                  </div>
                  {arcConfirmationDepth > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-cubepay-text-secondary">
                        Confirmations:
                      </span>
                      <span className="text-blue-400 font-mono">
                        {arcConfirmationDepth}/6
                      </span>
                    </div>
                  )}
                  {arcSession.circleTransferId && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-cubepay-text-secondary">
                        Transfer ID:
                      </span>
                      <span className="text-blue-300 font-mono text-right truncate">
                        {arcSession.circleTransferId.slice(0, 20)}...
                      </span>
                    </div>
                  )}
                </div>

                {/* Arc Explorer Links */}
                {arcExplorerUrl && (
                  <div className="flex gap-2 mt-3">
                    <a
                      href={arcExplorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs flex-1 text-center py-2 border border-blue-500/30 rounded hover:bg-blue-500/10 transition"
                    >
                      🔗 Arc Explorer
                    </a>
                    {arcSession.circleTransferId && (
                      <a
                        href={`${arcExplorerUrl}/tx/${arcSession.circleTransferId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs flex-1 text-center py-2 border border-blue-500/30 rounded hover:bg-blue-500/10 transition"
                      >
                        📋 Settlement Details
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Standard EVM Explorer Link */}
          {selectedChain !== 5042002 && (
            <a
              href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm mt-3 inline-block"
            >
              View on Explorer →
            </a>
          )}
        </div>
      );
    }

    if (paymentStatus === "error" && errorMessage) {
      return (
        <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertCircle size={24} />
            <span className="font-semibold text-lg">Payment Failed</span>
          </div>
          <p className="text-cubepay-text-secondary text-sm">{errorMessage}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
      style={{ zIndex: 30 }}
    >
      <style>{ARTM_STYLES}</style>
      <div
        className={
          selectedPaymentFace === "crypto_qr" ||
          selectedPaymentFace === "ens_payment"
            ? "bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500 rounded-lg p-8 max-w-md w-full mx-4 relative shadow-2xl"
            : "bg-cubepay-bg rounded-2xl p-6 max-w-md w-full mx-4 relative"
        }
      >
        {/* Close button */}
        <button
          onClick={closePaymentModal}
          className={
            selectedPaymentFace === "crypto_qr" ||
            selectedPaymentFace === "ens_payment"
              ? "absolute top-4 right-4 text-cyan-400 hover:text-cyan-300 transition-colors"
              : "absolute top-4 right-4 text-cubepay-text-secondary hover:text-cubepay-text"
          }
        >
          <X size={24} />
        </button>

        {/* ARTM LED Indicator */}
        {(selectedPaymentFace === "crypto_qr" ||
          selectedPaymentFace === "ens_payment") && (
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="artm-led-indicator w-3 h-3 rounded-full bg-cyan-400"></div>
            <div className="w-3 h-3 rounded-full bg-slate-600"></div>
          </div>
        )}

        {/* Header */}
        <div
          className={
            selectedPaymentFace === "crypto_qr" ||
            selectedPaymentFace === "ens_payment"
              ? "mb-6 text-center"
              : "mb-6"
          }
        >
          <h2
            className={
              selectedPaymentFace === "crypto_qr" ||
              selectedPaymentFace === "ens_payment"
                ? "text-2xl font-bold text-cyan-300 mb-2 font-mono tracking-wider"
                : "text-2xl font-bold text-cubepay-text mb-2"
            }
          >
            {config.title}
          </h2>
          <p
            className={
              selectedPaymentFace === "crypto_qr" ||
              selectedPaymentFace === "ens_payment"
                ? "text-cyan-300/60 text-sm font-mono"
                : "text-cubepay-text-secondary"
            }
          >
            {config.description}
          </p>
          <p
            className={
              selectedPaymentFace === "crypto_qr" ||
              selectedPaymentFace === "ens_payment"
                ? "text-xs text-cyan-400/50 mt-1 font-mono"
                : "text-sm text-cubepay-text-secondary mt-1"
            }
          >
            Agent: {selectedAgent.agent_name}
          </p>
        </div>

        {/* Content based on payment face */}
        {selectedPaymentFace === "crypto_qr" && (
          <div className="space-y-6">
            {renderWalletConnection()}

            {isWalletConnected && (
              <>
                {renderPaymentForm()}
                {renderTransactionStatus()}
              </>
            )}

            <div className="border-t border-cyan-500/30 pt-4">
              <p className="text-cyan-400 text-sm text-center mb-4 font-mono text-xs tracking-widest">
                ░ SCAN QR CODE ░
              </p>
              {qrCodeUrl && (
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <img
                      src={qrCodeUrl}
                      alt="Payment QR Code"
                      className="w-48 h-48 border-4 border-cyan-500 rounded-sm shadow-lg shadow-cyan-500/50 artm-scanline"
                    />
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none rounded-sm"></div>
                  </div>
                  <p className="text-xs text-cyan-400/70 text-center font-mono break-all tracked-wide">
                    {selectedAgent.agent_wallet?.slice(0, 20)}...
                  </p>
                  <div className="text-center text-xs text-cyan-400/50 font-mono">
                    <p>Amount: {paymentAmount} USDC</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={closePaymentModal}
              className="w-full mt-6 bg-transparent border-2 border-red-500/70 hover:border-red-400 hover:bg-red-500/10 text-red-400 hover:text-red-300 py-2 rounded-lg font-mono text-sm transition-all duration-200"
            >
              ✕ Cancel Payment
            </button>
          </div>
        )}

        {selectedPaymentFace === "virtual_card" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-600 to-purple-900 rounded-xl p-6 text-white">
              <p className="text-sm opacity-75 mb-4">Virtual Card</p>
              <p className="text-xl font-mono mb-4">**** **** **** 4242</p>
              <div className="flex justify-between">
                <div>
                  <p className="text-xs opacity-75">Valid Thru</p>
                  <p className="font-mono">12/26</p>
                </div>
                <div>
                  <p className="text-xs opacity-75">CVV</p>
                  <p className="font-mono">***</p>
                </div>
              </div>
            </div>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold">
              Pay with Virtual Card
            </button>
          </div>
        )}

        {selectedPaymentFace === "on_off_ramp" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">
                Buy Crypto
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">
                Sell Crypto
              </button>
            </div>
            <div className="bg-cubepay-card p-4 rounded-lg">
              <p className="text-cubepay-text-secondary text-sm mb-2">
                Convert
              </p>
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  placeholder="Amount"
                  className="bg-transparent text-cubepay-text text-2xl w-full outline-none"
                />
                <select className="bg-cubepay-card text-cubepay-text border border-cubepay-text-secondary rounded px-2 py-1">
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {selectedPaymentFace === "ens_payment" && (
          <div className="space-y-4">
            {renderWalletConnection()}

            {isWalletConnected && (
              <>
                {/* ENS Domain Info Display */}
                {ensPaymentConfig && (
                  <div className="bg-slate-800/50 border border-cyan-500/50 rounded-lg p-4 mb-2">
                    <div className="text-center">
                      <p className="text-cyan-400/70 text-xs font-mono mb-1">
                        ENS Domain
                      </p>
                      <p className="text-cyan-300 font-mono text-lg font-bold truncate">
                        {recipientInput}
                      </p>
                      <p className="text-cyan-400/60 text-xs font-mono mt-2 break-all">
                        {ensPaymentConfig.resolvedAddress.slice(0, 6)}...
                        {ensPaymentConfig.resolvedAddress.slice(-4)}
                      </p>
                    </div>
                  </div>
                )}

                {/* ENS Domain Input */}
                <div>
                  <label className="block text-sm text-cyan-300 mb-2 font-mono text-xs tracking-widest">
                    ▌ ENS DOMAIN
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={recipientInput}
                      onChange={(e) =>
                        setRecipientInput(
                          e.target.value.toLowerCase().endsWith(".eth")
                            ? e.target.value
                            : e.target.value,
                        )
                      }
                      placeholder="cube-pay.eth"
                      className="w-full bg-slate-800 border border-cyan-500/50 text-cyan-300 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm focus:border-cyan-400"
                    />
                    {isResolvingENS && (
                      <div className="absolute right-3 top-3">
                        <Loader2
                          className="animate-spin text-cyan-400"
                          size={20}
                        />
                      </div>
                    )}
                  </div>
                  {!recipientInput.endsWith(".eth") && recipientInput && (
                    <p className="text-xs text-red-400 mt-1 font-mono">
                      ⚠️ INVALID .eth DOMAIN
                    </p>
                  )}
                </div>

                {/* ENS Payment Config Display */}
                {ensPaymentConfig && (
                  <>
                    <ENSPaymentDisplay
                      config={ensPaymentConfig}
                      amount={parseFloat(paymentAmount) || undefined}
                      showValidation={true}
                      compact={false}
                    />

                    {/* Advanced Options Toggle */}
                    <button
                      onClick={() => setShowENSAdvanced(!showENSAdvanced)}
                      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm transition-colors w-full justify-center font-mono text-xs"
                    >
                      {showENSAdvanced ? (
                        <>
                          <EyeOff size={16} />
                          HIDE DETAILS
                        </>
                      ) : (
                        <>
                          <Eye size={16} />
                          SHOW DETAILS
                        </>
                      )}
                    </button>

                    {/* Advanced Options */}
                    {showENSAdvanced && (
                      <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-3 space-y-2">
                        {ensPaymentConfig.preferredChain && (
                          <div className="text-xs space-y-1">
                            <p className="text-cyan-300 font-mono">
                              PREFERRED:
                            </p>
                            <p className="text-cyan-200 font-semibold font-mono">
                              {ensPaymentConfig.preferredChain}
                            </p>
                          </div>
                        )}
                        {ensPaymentConfig.preferredToken && (
                          <div className="text-xs space-y-1">
                            <p className="text-cyan-300 font-mono">TOKEN:</p>
                            <p className="text-cyan-200 font-semibold font-mono">
                              {ensPaymentConfig.preferredToken}
                            </p>
                          </div>
                        )}
                        <a
                          href={`https://app.ens.domains/${recipientInput}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 text-xs block mt-2 font-mono"
                        >
                          OPEN IN ENS →
                        </a>
                      </div>
                    )}

                    {/* Payment Form */}
                    <div className="space-y-3 border-t border-cyan-500/30 pt-4">
                      {/* Amount */}
                      <div>
                        <label className="block text-xs text-cyan-300 mb-2 font-mono tracking-widest">
                          ▌ AMOUNT (USDC)
                        </label>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          min="0.01"
                          step="0.01"
                          className="w-full bg-slate-800 border border-cyan-500/50 text-cyan-300 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm focus:border-cyan-400"
                        />
                      </div>

                      {/* Chain Selection */}
                      <div>
                        <label className="block text-xs text-cyan-300 mb-2 font-mono tracking-widest">
                          ▌ NETWORK
                        </label>
                        <select
                          value={selectedChain}
                          onChange={(e) =>
                            setSelectedChain(Number(e.target.value))
                          }
                          className="w-full bg-slate-800 border border-cyan-500/50 text-cyan-300 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm focus:border-cyan-400"
                        >
                          {[
                            {
                              id: 11155111,
                              name: "Ethereum Sepolia",
                              symbol: "ETH",
                            },
                            {
                              id: 84532,
                              name: "Base Sepolia",
                              symbol: "ETH",
                            },
                            {
                              id: 421614,
                              name: "Arbitrum Sepolia",
                              symbol: "ETH",
                            },
                            {
                              id: 80002,
                              name: "Polygon Amoy",
                              symbol: "MATIC",
                            },
                            {
                              id: 5042002,
                              name: "Arc Testnet (Settlement)",
                              symbol: "USDC",
                            },
                          ].map((chain) => (
                            <option key={chain.id} value={chain.id}>
                              {chain.name} ({chain.symbol})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Pay Button */}
                      <button
                        onClick={handlePayment}
                        disabled={
                          !isWalletConnected ||
                          paymentStatus === "processing" ||
                          !recipientInput.endsWith(".eth") ||
                          !ensPaymentConfig
                        }
                        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 border border-cyan-500/50 hover:border-cyan-400"
                      >
                        {paymentStatus === "processing" ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            PROCESSING...
                          </>
                        ) : (
                          `PAY ${paymentAmount} USDC`
                        )}
                      </button>
                    </div>

                    {/* Cancel Payment Button */}
                    <button
                      onClick={closePaymentModal}
                      className="w-full mt-4 bg-transparent border-2 border-red-500/70 hover:border-red-400 hover:bg-red-500/10 text-red-400 hover:text-red-300 py-2 rounded-lg font-mono text-sm transition-all duration-200"
                    >
                      ✕ CANCEL PAYMENT
                    </button>
                  </>
                )}

                {/* Resolution in progress */}
                {isResolvingENS && (
                  <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-sm">
                    <Loader2 className="animate-spin" size={20} />
                    <span>RESOLVING {recipientInput}...</span>
                  </div>
                )}

                {/* Resolution error */}
                {recipientInput.endsWith(".eth") &&
                  !ensPaymentConfig &&
                  !isResolvingENS && (
                    <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-400 mb-1">
                        <AlertCircle size={16} />
                        <span className="text-sm font-semibold font-mono">
                          DOMAIN NOT FOUND
                        </span>
                      </div>
                      <p className="text-xs text-red-300/70 font-mono">
                        Unable to resolve {recipientInput} on {ensNetwork}
                      </p>
                    </div>
                  )}

                {/* Transaction Status */}
                {renderTransactionStatus()}
              </>
            )}
          </div>
        )}

        {(selectedPaymentFace === "sound_pay" ||
          selectedPaymentFace === "voice_pay") && (
          <div className="text-center py-8">
            <p className="text-cubepay-text-secondary text-lg">
              Coming soon...
            </p>
            <p className="text-cubepay-text-secondary text-sm mt-2">
              This payment method is under development
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
