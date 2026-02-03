import { ethers } from "ethers";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type { WalletType, PaymentExecutionResult } from "./types";

/**
 * USDC Token Addresses by Network
 */
export const USDC_ADDRESSES: Record<string, string> = {
  // Ethereum Sepolia
  "11155111": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  // Base Sepolia
  "84532": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  // Arbitrum Sepolia
  "421614": "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  // Optimism Sepolia
  "11155420": "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
  // Polygon Amoy
  "80002": "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
  // Avalanche Fuji
  "43113": "0x5425890298aed601595a70AB815c96711a31Bc65",
  // BNB Testnet
  "97": "0x64544969ed7EBf5f083679233325356EbE738930",
};

/**
 * Solana USDC Token Addresses
 */
export const SOLANA_USDC_ADDRESSES = {
  devnet: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
  mainnet: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
};

/**
 * Execute USDC payment on EVM chains (Ethereum, Base, Arbitrum, etc.)
 */
export async function executeEVMUSDCPayment(
  provider: any,
  fromAddress: string,
  toAddress: string,
  amount: string,
  chainId: string,
): Promise<PaymentExecutionResult> {
  const usdcAddress = USDC_ADDRESSES[chainId];

  if (!usdcAddress) {
    throw new Error(`USDC not supported on chain ${chainId}`);
  }

  // ERC-20 USDC contract ABI (transfer function)
  const usdcABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address owner) view returns (uint256)",
  ];

  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const usdcContract = new ethers.Contract(usdcAddress, usdcABI, signer);

    // USDC has 6 decimals
    const decimals = 6;
    const amountInSmallestUnit = ethers.parseUnits(amount, decimals);

    // Check balance
    const balance = await usdcContract.balanceOf(fromAddress);
    if (balance < amountInSmallestUnit) {
      throw new Error("Insufficient USDC balance");
    }

    // Execute transfer
    const tx = await usdcContract.transfer(toAddress, amountInSmallestUnit);
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: "confirmed",
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
      status: "failed",
    };
  }
}

/**
 * Execute USDC payment on Solana
 */
export async function executeSolanaUSDCPayment(
  provider: any,
  fromAddress: string,
  toAddress: string,
  amount: string,
  network: "devnet" | "mainnet" = "devnet",
): Promise<PaymentExecutionResult> {
  const usdcMint = SOLANA_USDC_ADDRESSES[network];

  try {
    const connection = new Connection(
      network === "devnet"
        ? "https://api.devnet.solana.com"
        : "https://api.mainnet-beta.solana.com",
    );

    const fromPubkey = new PublicKey(fromAddress);
    const toPubkey = new PublicKey(toAddress);
    const mintPubkey = new PublicKey(usdcMint);

    // USDC has 6 decimals on Solana
    const decimals = 6;
    const amountInSmallestUnit = BigInt(
      parseFloat(amount) * Math.pow(10, decimals),
    );

    // Get associated token accounts
    const fromTokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      fromPubkey,
    );
    const toTokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      toPubkey,
    );

    // Create transfer instruction
    const transaction = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        fromPubkey,
        amountInSmallestUnit,
        [],
        TOKEN_PROGRAM_ID,
      ),
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    // Sign and send transaction using wallet provider
    const signedTransaction = await provider.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    );

    // Confirm transaction
    await connection.confirmTransaction(signature, "confirmed");

    return {
      success: true,
      transactionHash: signature,
      status: "confirmed",
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
      status: "failed",
    };
  }
}

/**
 * Execute USDH payment on Hedera (placeholder)
 */
export async function executeHederaUSDHPayment(
  provider: any,
  fromAddress: string,
  toAddress: string,
  amount: string,
): Promise<PaymentExecutionResult> {
  // TODO: Implement Hedera HTS token transfer
  // Hedera uses Token ID 0.0.7218375 for USDH

  throw new Error(
    "Hedera USDH payment implementation pending - requires Hedera SDK integration",
  );

  /*
  Example implementation:
  
  const { AccountId, TokenId, TransferTransaction } = require('@hashgraph/sdk');
  
  const tokenId = TokenId.fromString('0.0.7218375');
  const senderId = AccountId.fromString(fromAddress);
  const receiverId = AccountId.fromString(toAddress);
  
  // USDH has 6 decimals
  const amountInTinybar = parseFloat(amount) * 1_000_000;
  
  const transaction = new TransferTransaction()
    .addTokenTransfer(tokenId, senderId, -amountInTinybar)
    .addTokenTransfer(tokenId, receiverId, amountInTinybar);
  
  const signedTx = await transaction.sign(privateKey);
  const receipt = await signedTx.execute(client);
  
  return {
    success: true,
    transactionHash: receipt.transactionId.toString(),
    status: 'confirmed'
  };
  */
}

/**
 * Get payment method based on wallet type and chain
 */
export function getPaymentMethod(
  walletType: WalletType,
  chainId: string | null,
): "evm-usdc" | "solana-usdc" | "hedera-usdh" | "unknown" {
  if (walletType === "phantom") {
    return "solana-usdc";
  }

  if (walletType === "hashpack") {
    return "hedera-usdh";
  }

  if (walletType === "metamask" || walletType === "circle") {
    if (chainId && USDC_ADDRESSES[chainId]) {
      return "evm-usdc";
    }
  }

  return "unknown";
}
