"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOLANA_USDC_ADDRESSES = exports.USDC_ADDRESSES = void 0;
exports.executeEVMUSDCPayment = executeEVMUSDCPayment;
exports.executeSolanaUSDCPayment = executeSolanaUSDCPayment;
exports.executeHederaUSDHPayment = executeHederaUSDHPayment;
exports.getPaymentMethod = getPaymentMethod;
var ethers_1 = require("ethers");
var web3_js_1 = require("@solana/web3.js");
var spl_token_1 = require("@solana/spl-token");
/**
 * USDC Token Addresses by Network
 */
exports.USDC_ADDRESSES = {
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
exports.SOLANA_USDC_ADDRESSES = {
    devnet: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    mainnet: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
};
/**
 * Execute USDC payment on EVM chains (Ethereum, Base, Arbitrum, etc.)
 */
function executeEVMUSDCPayment(provider, fromAddress, toAddress, amount, chainId) {
    return __awaiter(this, void 0, void 0, function () {
        var usdcAddress, usdcABI, ethersProvider, signer, usdcContract, decimals, amountInSmallestUnit, balance, tx, receipt, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    usdcAddress = exports.USDC_ADDRESSES[chainId];
                    if (!usdcAddress) {
                        throw new Error("USDC not supported on chain ".concat(chainId));
                    }
                    usdcABI = [
                        "function transfer(address to, uint256 amount) returns (bool)",
                        "function decimals() view returns (uint8)",
                        "function balanceOf(address owner) view returns (uint256)",
                    ];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    ethersProvider = new ethers_1.ethers.BrowserProvider(provider);
                    return [4 /*yield*/, ethersProvider.getSigner()];
                case 2:
                    signer = _a.sent();
                    usdcContract = new ethers_1.ethers.Contract(usdcAddress, usdcABI, signer);
                    decimals = 6;
                    amountInSmallestUnit = ethers_1.ethers.parseUnits(amount, decimals);
                    return [4 /*yield*/, usdcContract.balanceOf(fromAddress)];
                case 3:
                    balance = _a.sent();
                    if (balance < amountInSmallestUnit) {
                        throw new Error("Insufficient USDC balance");
                    }
                    return [4 /*yield*/, usdcContract.transfer(toAddress, amountInSmallestUnit)];
                case 4:
                    tx = _a.sent();
                    return [4 /*yield*/, tx.wait()];
                case 5:
                    receipt = _a.sent();
                    return [2 /*return*/, {
                            success: true,
                            transactionHash: receipt.hash,
                            blockNumber: receipt.blockNumber,
                            status: "confirmed",
                        }];
                case 6:
                    error_1 = _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            error: error_1.message,
                            status: "failed",
                        }];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute USDC payment on Solana
 */
function executeSolanaUSDCPayment(provider_1, fromAddress_1, toAddress_1, amount_1) {
    return __awaiter(this, arguments, void 0, function (provider, fromAddress, toAddress, amount, network) {
        var usdcMint, connection, fromPubkey, toPubkey, mintPubkey, decimals, amountInSmallestUnit, fromTokenAccount, toTokenAccount, transaction, blockhash, signedTransaction, signature, error_2;
        if (network === void 0) { network = "devnet"; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    usdcMint = exports.SOLANA_USDC_ADDRESSES[network];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    connection = new web3_js_1.Connection(network === "devnet"
                        ? "https://api.devnet.solana.com"
                        : "https://api.mainnet-beta.solana.com");
                    fromPubkey = new web3_js_1.PublicKey(fromAddress);
                    toPubkey = new web3_js_1.PublicKey(toAddress);
                    mintPubkey = new web3_js_1.PublicKey(usdcMint);
                    decimals = 6;
                    amountInSmallestUnit = BigInt(parseFloat(amount) * Math.pow(10, decimals));
                    return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(mintPubkey, fromPubkey)];
                case 2:
                    fromTokenAccount = _a.sent();
                    return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(mintPubkey, toPubkey)];
                case 3:
                    toTokenAccount = _a.sent();
                    transaction = new web3_js_1.Transaction().add((0, spl_token_1.createTransferInstruction)(fromTokenAccount, toTokenAccount, fromPubkey, amountInSmallestUnit, [], spl_token_1.TOKEN_PROGRAM_ID));
                    return [4 /*yield*/, connection.getLatestBlockhash()];
                case 4:
                    blockhash = (_a.sent()).blockhash;
                    transaction.recentBlockhash = blockhash;
                    transaction.feePayer = fromPubkey;
                    return [4 /*yield*/, provider.signTransaction(transaction)];
                case 5:
                    signedTransaction = _a.sent();
                    return [4 /*yield*/, connection.sendRawTransaction(signedTransaction.serialize())];
                case 6:
                    signature = _a.sent();
                    // Confirm transaction
                    return [4 /*yield*/, connection.confirmTransaction(signature, "confirmed")];
                case 7:
                    // Confirm transaction
                    _a.sent();
                    return [2 /*return*/, {
                            success: true,
                            transactionHash: signature,
                            status: "confirmed",
                        }];
                case 8:
                    error_2 = _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            error: error_2.message,
                            status: "failed",
                        }];
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute USDH payment on Hedera (placeholder)
 */
function executeHederaUSDHPayment(provider, fromAddress, toAddress, amount) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // TODO: Implement Hedera HTS token transfer
            // Hedera uses Token ID 0.0.7218375 for USDH
            throw new Error("Hedera USDH payment implementation pending - requires Hedera SDK integration");
        });
    });
}
/**
 * Get payment method based on wallet type and chain
 */
function getPaymentMethod(walletType, chainId) {
    if (walletType === "phantom") {
        return "solana-usdc";
    }
    if (walletType === "hashpack") {
        return "hedera-usdh";
    }
    if (walletType === "metamask" || walletType === "circle") {
        if (chainId && exports.USDC_ADDRESSES[chainId]) {
            return "evm-usdc";
        }
    }
    return "unknown";
}
