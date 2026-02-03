"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.WalletConnector = void 0;
exports.createWalletConnector = createWalletConnector;
var eventemitter3_1 = require("eventemitter3");
var thirdweb_1 = require("thirdweb");
var wallets_1 = require("thirdweb/wallets");
var ethers_1 = require("ethers");
var circleGateway_1 = require("./circleGateway");
/**
 * CubePay Wallet Connector
 *
 * Multi-chain wallet connection with Arc chain abstraction
 * Supports: Circle Wallets, MetaMask, Phantom, HashPack
 */
var WalletConnector = /** @class */ (function (_super) {
    __extends(WalletConnector, _super);
    function WalletConnector(chainAbstractionConfig) {
        var _this = _super.call(this) || this;
        _this.state = {
            type: null,
            connected: false,
            address: null,
            chainId: null,
            balance: null,
            ensName: null,
        };
        _this.providers = new Map();
        // Initialize ThirdWeb client
        _this.thirdwebClient = (0, thirdweb_1.createThirdwebClient)({
            clientId: process.env.VITE_THIRDWEB_CLIENT_ID || "",
        });
        // Initialize Circle Gateway client for Arc chain abstraction
        _this.gatewayClient = (0, circleGateway_1.createGatewayClient)();
        // Default Arc-focused configuration
        _this.chainAbstraction = __assign({ arc: {
                gatewayEnabled: true,
                bridgeKitEnabled: true,
                instantTransfers: true,
                unifiedBalance: true,
            }, ens: {
                enabled: true,
                resolveNames: true,
                reverseResolve: true,
                supportedChains: ["ethereum", "arbitrum", "base", "optimism"],
            }, chainlink: {
                enabled: false, // Keep for future Chainlink hackathon
                lanes: [],
            }, lifi: {
                enabled: true, // Fallback routing
            } }, chainAbstractionConfig);
        return _this;
    }
    // =====================================================
    // WALLET CONNECTION
    // =====================================================
    /**
     * Connect to a wallet
     */
    WalletConnector.prototype.connect = function (walletType, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 11, , 12]);
                        _a = walletType;
                        switch (_a) {
                            case "circle": return [3 /*break*/, 1];
                            case "metamask": return [3 /*break*/, 3];
                            case "phantom": return [3 /*break*/, 5];
                            case "hashpack": return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 1: return [4 /*yield*/, this.connectCircleWallet(options)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.connectMetaMask(options)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.connectPhantom(options)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.connectHashPack(options)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: throw new Error("Unsupported wallet type: ".concat(walletType));
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        error_1 = _b.sent();
                        this.emit("error", error_1);
                        throw error_1;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Disconnect current wallet
     */
    WalletConnector.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.state.connected)
                    return [2 /*return*/];
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
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get current wallet state
     */
    WalletConnector.prototype.getState = function () {
        return __assign({}, this.state);
    };
    /**
     * Check if wallet is connected
     */
    WalletConnector.prototype.isConnected = function () {
        return this.state.connected;
    };
    // =====================================================
    // CIRCLE WALLET (PRIMARY - ARC FOCUSED)
    // =====================================================
    WalletConnector.prototype.connectCircleWallet = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Integrate Circle W3S SDK
                // Circle Wallets provide unified addressing across EVM + Solana
                throw new Error("Circle Wallet integration pending - requires Circle API keys");
            });
        });
    };
    // =====================================================
    // METAMASK (EVM CHAINS)
    // =====================================================
    WalletConnector.prototype.connectMetaMask = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, account, address, chainId, _a, error_2;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        wallet = (0, wallets_1.createWallet)("io.metamask");
                        return [4 /*yield*/, wallet.connect({
                                client: this.thirdwebClient,
                            })];
                    case 1:
                        account = _c.sent();
                        address = account.address;
                        return [4 /*yield*/, account.getChainId()];
                    case 2:
                        chainId = (_c.sent()).toString();
                        _a = this;
                        _b = {
                            type: "metamask",
                            connected: true,
                            address: address,
                            chainId: chainId
                        };
                        return [4 /*yield*/, this.getBalance(address, "evm")];
                    case 3:
                        _b.balance = _c.sent();
                        return [4 /*yield*/, this.resolveAddressToENS(address)];
                    case 4:
                        _a.state = (_b.ensName = _c.sent(),
                            _b);
                        this.providers.set("metamask", wallet);
                        this.emit("connect", this.state);
                        return [2 /*return*/, this.state];
                    case 5:
                        error_2 = _c.sent();
                        throw new Error("MetaMask connection failed: ".concat(error_2.message));
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // =====================================================
    // PHANTOM (SOLANA)
    // =====================================================
    WalletConnector.prototype.connectPhantom = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, account, address, _a, error_3;
            var _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        wallet = (0, wallets_1.createWallet)("app.phantom");
                        return [4 /*yield*/, wallet.connect({
                                client: this.thirdwebClient,
                            })];
                    case 1:
                        account = _c.sent();
                        address = account.address;
                        _a = this;
                        _b = {
                            type: "phantom",
                            connected: true,
                            address: address,
                            chainId: "solana-devnet"
                        };
                        return [4 /*yield*/, this.getBalance(address, "solana")];
                    case 2:
                        _a.state = (_b.balance = _c.sent(),
                            _b.ensName = null,
                            _b);
                        // Setup event listeners
                        provider.on("disconnect", function () {
                            _this.disconnect();
                        });
                        provider.on("accountChanged", function (publicKey) {
                            if (publicKey) {
                                _this.state.address = publicKey.toString();
                                _this.emit("accountChanged", _this.state.address);
                            }
                        });
                        this.providers.set("phantom", wallet);
                        this.emit("connect", this.state);
                        return [2 /*return*/, this.state];
                    case 3:
                        error_3 = _c.sent();
                        throw new Error("Phantom connection failed: ".concat(error_3.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // =====================================================
    // HASHPACK (HEDERA)
    // =====================================================
    WalletConnector.prototype.connectHashPack = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, account, address, _a, error_4;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        wallet = (0, wallets_1.createWallet)("com.hashpack");
                        return [4 /*yield*/, wallet.connect({
                                client: this.thirdwebClient,
                            })];
                    case 1:
                        account = _c.sent();
                        address = account.address;
                        _a = this;
                        _b = {
                            type: 'hashpack',
                            connected: true,
                            address: address,
                            chainId: 'hedera-testnet'
                        };
                        return [4 /*yield*/, this.getBalance(address, 'hedera')];
                    case 2:
                        _a.state = (_b.balance = _c.sent(),
                            _b.ensName = null,
                            _b);
                        this.providers.set('hashpack', wallet);
                        this.emit('connect', this.state);
                        return [2 /*return*/, this.state];
                    case 3:
                        error_4 = _c.sent();
                        throw new Error("HashPack connection failed: ".concat(error_4.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // =====================================================
    // ARC CHAIN ABSTRACTION
    // =====================================================
    /**
     * Execute chain-abstracted payment using Arc
     * User pays from ANY chain, agent receives on ANY chain
     */
    WalletConnector.prototype.executeChainAbstractedPayment = function (payment) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.state.connected) {
                            throw new Error("Wallet not connected");
                        }
                        if (!(payment.paymentFace === "crypto-qr" && payment.useArcGateway)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.executeArcPayment(payment)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        if (!(payment.paymentFace === "ens-payment" && payment.destinationENS)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.executeENSPayment(payment)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: return [4 /*yield*/, this.executeDirectPayment(payment)];
                    case 5: 
                    // Fallback to direct transfer
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Execute payment through Arc Gateway (instant <500ms)
     * Uses Circle Gateway for cross-chain USDC transfers
     */
    WalletConnector.prototype.executeArcPayment = function (payment) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, sourceChainId, destinationChainId, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.chainAbstraction.arc.gatewayEnabled) {
                            throw new Error("Arc Gateway not enabled");
                        }
                        if (!this.state.connected || !this.state.chainId) {
                            throw new Error("Wallet not connected");
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        provider = this.providers.get(this.state.type);
                        if (!provider) {
                            throw new Error("Provider not available");
                        }
                        sourceChainId = parseInt(this.state.chainId);
                        destinationChainId = parseInt(payment.destinationChain);
                        console.log("\uD83C\uDF09 Arc Gateway: Initiating transfer from chain ".concat(sourceChainId, " \u2192 ").concat(destinationChainId));
                        return [4 /*yield*/, this.gatewayClient.executeCrossChainTransfer({
                                sourceChainId: sourceChainId,
                                destinationChainId: destinationChainId,
                                amount: payment.sourceAmount,
                                destinationAddress: payment.destinationAddress,
                                sourceAddress: this.state.address,
                            }, window.ethereum || provider)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, {
                                hash: result.sourceTransactionHash || "",
                                status: result.status === "completed" ? "confirmed" : "pending",
                                confirmations: result.status === "completed" ? 1 : 0,
                                blockNumber: 0,
                            }];
                    case 3:
                        error_5 = _a.sent();
                        console.error("Arc payment failed:", error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute payment to ENS name
     * @param payment - Payment with ENS destination
     * @returns Transaction status
     */
    WalletConnector.prototype.executeENSPayment = function (payment) {
        return __awaiter(this, void 0, void 0, function () {
            var resolvedAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.chainAbstraction.ens.enabled) {
                            throw new Error("ENS integration not enabled");
                        }
                        return [4 /*yield*/, this.resolveENSToAddress(payment.destinationENS)];
                    case 1:
                        resolvedAddress = _a.sent();
                        if (!resolvedAddress) {
                            throw new Error("Could not resolve ENS name: ".concat(payment.destinationENS));
                        }
                        console.log("Executing payment to ".concat(payment.destinationENS, " (").concat(resolvedAddress, ")"));
                        return [4 /*yield*/, this.executeDirectPayment(__assign(__assign({}, payment), { destinationAddress: resolvedAddress }))];
                    case 2: 
                    // Execute payment to resolved address
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Execute direct payment (non-abstracted)
     */
    WalletConnector.prototype.executeDirectPayment = function (payment) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Wallet-specific transfer logic
                throw new Error("Direct payment implementation pending");
            });
        });
    };
    // =====================================================
    // ARC UNIFIED BALANCE
    // =====================================================
    /**
     * Get Arc unified USDC balance across all chains
     * Uses Circle Gateway to aggregate balances from multiple chains
     */
    WalletConnector.prototype.getArcUnifiedBalance = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var balance, balancesByChain, _i, _a, _b, chainId, amount, error_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.chainAbstraction.arc.unifiedBalance) {
                            throw new Error("Arc unified balance not enabled");
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.gatewayClient.getUnifiedBalance(address)];
                    case 2:
                        balance = _c.sent();
                        balancesByChain = {};
                        for (_i = 0, _a = Object.entries(balance.balancesByChain); _i < _a.length; _i++) {
                            _b = _a[_i], chainId = _b[0], amount = _b[1];
                            balancesByChain[chainId] = amount;
                        }
                        return [2 /*return*/, {
                                totalUSDC: balance.totalUSDC,
                                balancesByChain: balancesByChain,
                                availableForInstantTransfer: parseFloat(balance.totalUSDC) > 0,
                            }];
                    case 3:
                        error_6 = _c.sent();
                        console.error("Failed to fetch unified balance:", error_6);
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // =====================================================
    // ENS RESOLUTION
    // =====================================================
    /**
     * Resolve ENS name to address
     * @param ensName - ENS domain (e.g., "vitalik.eth")
     * @returns Ethereum address or null if not found
     */
    WalletConnector.prototype.resolveENSToAddress = function (ensName) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, address, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.chainAbstraction.ens.enabled)
                            return [2 /*return*/, null];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        provider = new ethers_1.ethers.JsonRpcProvider("https://ethereum.publicnode.com");
                        return [4 /*yield*/, provider.resolveName(ensName)];
                    case 2:
                        address = _a.sent();
                        if (address) {
                            console.log("ENS resolved: ".concat(ensName, " \u2192 ").concat(address));
                        }
                        return [2 /*return*/, address];
                    case 3:
                        error_7 = _a.sent();
                        console.error("ENS resolution failed for ".concat(ensName, ":"), error_7);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Resolve address to ENS name (reverse lookup)
     * @param address - Ethereum address (e.g., "0x123...")
     * @returns ENS name or null if not found
     */
    WalletConnector.prototype.resolveAddressToENS = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, ensName, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.chainAbstraction.ens.enabled ||
                            !this.chainAbstraction.ens.reverseResolve) {
                            return [2 /*return*/, null];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        provider = new ethers_1.ethers.JsonRpcProvider("https://ethereum.publicnode.com");
                        return [4 /*yield*/, provider.lookupAddress(address)];
                    case 2:
                        ensName = _a.sent();
                        if (ensName) {
                            console.log("ENS reverse resolved: ".concat(address, " \u2192 ").concat(ensName));
                        }
                        return [2 /*return*/, ensName];
                    case 3:
                        error_8 = _a.sent();
                        console.error("ENS reverse resolution failed for ".concat(address, ":"), error_8);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // =====================================================
    // BALANCE QUERIES
    // =====================================================
    WalletConnector.prototype.getBalance = function (address, network) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Implement balance queries per network
                return [2 /*return*/, "0"];
            });
        });
    };
    // =====================================================
    // NETWORK SWITCHING
    // =====================================================
    WalletConnector.prototype.switchNetwork = function (network) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.state.connected) {
                            throw new Error("Wallet not connected");
                        }
                        if (!(this.state.type === "metamask")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.switchMetaMaskNetwork(network)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        if (this.state.type === "circle") {
                            // Circle Wallets handle network abstraction automatically
                            console.log("Circle Wallets handle network switching automatically");
                        }
                        else {
                            throw new Error("Network switching not supported for ".concat(this.state.type));
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    WalletConnector.prototype.switchMetaMaskNetwork = function (network) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = this.providers.get("metamask");
                        if (!provider)
                            throw new Error("MetaMask not connected");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 7]);
                        return [4 /*yield*/, provider.request({
                                method: "wallet_switchEthereumChain",
                                params: [{ chainId: "0x".concat(network.chainId.toString(16)) }],
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 3:
                        error_9 = _a.sent();
                        if (!(error_9.code === 4902)) return [3 /*break*/, 5];
                        return [4 /*yield*/, provider.request({
                                method: "wallet_addEthereumChain",
                                params: [
                                    {
                                        chainId: "0x".concat(network.chainId.toString(16)),
                                        chainName: network.name,
                                        nativeCurrency: network.nativeCurrency,
                                        rpcUrls: [network.rpcUrl],
                                        blockExplorerUrls: [network.blockExplorer],
                                    },
                                ],
                            })];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5: throw error_9;
                    case 6: return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return WalletConnector;
}(eventemitter3_1.default));
exports.WalletConnector = WalletConnector;
// Export factory function
function createWalletConnector(config) {
    return new WalletConnector(config);
}
