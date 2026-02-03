"use strict";
/**
 * Advanced ENS Integration for CubePay
 *
 * Features:
 * - Text records for payment preferences
 * - Multiple addresses per chain stored in ENS
 * - Social profiles and metadata
 * - Content hash for decentralized agent profiles
 */
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
exports.ENSClient = exports.ENS_TEXT_RECORDS = void 0;
exports.createENSClient = createENSClient;
var ethers_1 = require("ethers");
/**
 * ENS Text Record Keys for CubePay
 */
exports.ENS_TEXT_RECORDS = {
    // Payment Preferences
    PREFERRED_CHAIN: "com.cubepay.preferredChain",
    PREFERRED_TOKEN: "com.cubepay.preferredToken",
    MIN_PAYMENT: "com.cubepay.minPayment",
    MAX_PAYMENT: "com.cubepay.maxPayment",
    // Multi-Chain Addresses
    ETHEREUM_ADDRESS: "com.cubepay.address.ethereum",
    BASE_ADDRESS: "com.cubepay.address.base",
    ARBITRUM_ADDRESS: "com.cubepay.address.arbitrum",
    OPTIMISM_ADDRESS: "com.cubepay.address.optimism",
    POLYGON_ADDRESS: "com.cubepay.address.polygon",
    AVALANCHE_ADDRESS: "com.cubepay.address.avalanche",
    // Social & Identity (Standard ENS records)
    AVATAR: "avatar",
    DESCRIPTION: "description",
    EMAIL: "email",
    URL: "url",
    TWITTER: "com.twitter",
    GITHUB: "com.github",
    DISCORD: "com.discord",
    // Agent-Specific
    AGENT_TYPE: "com.cubepay.agentType",
    AGENT_LOCATION: "com.cubepay.location",
    AGENT_RATING: "com.cubepay.rating",
    AGENT_AVAILABILITY: "com.cubepay.availability",
};
/**
 * Advanced ENS Client for CubePay
 */
var ENSClient = /** @class */ (function () {
    function ENSClient(providerUrl) {
        if (providerUrl === void 0) { providerUrl = "https://ethereum.publicnode.com"; }
        this.provider = new ethers_1.ethers.JsonRpcProvider(providerUrl);
    }
    /**
     * Resolve ENS name to Ethereum address
     */
    ENSClient.prototype.resolveAddress = function (ensName) {
        return __awaiter(this, void 0, void 0, function () {
            var address, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.provider.resolveName(ensName)];
                    case 1:
                        address = _a.sent();
                        return [2 /*return*/, address];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Failed to resolve ".concat(ensName, ":"), error_1);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reverse resolve address to ENS name
     */
    ENSClient.prototype.lookupAddress = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var ensName, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.provider.lookupAddress(address)];
                    case 1:
                        ensName = _a.sent();
                        return [2 /*return*/, ensName];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Failed to reverse resolve ".concat(address, ":"), error_2);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get ENS resolver for a name
     */
    ENSClient.prototype.getResolver = function (ensName) {
        return __awaiter(this, void 0, void 0, function () {
            var resolver, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.provider.getResolver(ensName)];
                    case 1:
                        resolver = _a.sent();
                        return [2 /*return*/, resolver];
                    case 2:
                        error_3 = _a.sent();
                        console.error("Failed to get resolver for ".concat(ensName, ":"), error_3);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Read text record from ENS
     */
    ENSClient.prototype.getText = function (ensName, key) {
        return __awaiter(this, void 0, void 0, function () {
            var resolver, value, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getResolver(ensName)];
                    case 1:
                        resolver = _a.sent();
                        if (!resolver)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, resolver.getText(key)];
                    case 2:
                        value = _a.sent();
                        return [2 /*return*/, value || null];
                    case 3:
                        error_4 = _a.sent();
                        console.error("Failed to read text record ".concat(key, " for ").concat(ensName, ":"), error_4);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Read multiple text records in parallel
     */
    ENSClient.prototype.getTextRecords = function (ensName, keys) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = {};
                        return [4 /*yield*/, Promise.all(keys.map(function (key) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _a = results;
                                            _b = key;
                                            return [4 /*yield*/, this.getText(ensName, key)];
                                        case 1:
                                            _a[_b] = _c.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Get payment preferences from ENS
     */
    ENSClient.prototype.getPaymentPreferences = function (ensName) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        keys = [
                            exports.ENS_TEXT_RECORDS.PREFERRED_CHAIN,
                            exports.ENS_TEXT_RECORDS.PREFERRED_TOKEN,
                            exports.ENS_TEXT_RECORDS.MIN_PAYMENT,
                            exports.ENS_TEXT_RECORDS.MAX_PAYMENT,
                            exports.ENS_TEXT_RECORDS.ETHEREUM_ADDRESS,
                            exports.ENS_TEXT_RECORDS.BASE_ADDRESS,
                            exports.ENS_TEXT_RECORDS.ARBITRUM_ADDRESS,
                            exports.ENS_TEXT_RECORDS.OPTIMISM_ADDRESS,
                            exports.ENS_TEXT_RECORDS.POLYGON_ADDRESS,
                            exports.ENS_TEXT_RECORDS.AVALANCHE_ADDRESS,
                        ];
                        return [4 /*yield*/, this.getTextRecords(ensName, keys)];
                    case 1:
                        records = _a.sent();
                        return [2 /*return*/, {
                                preferredChain: records[exports.ENS_TEXT_RECORDS.PREFERRED_CHAIN] || undefined,
                                preferredToken: records[exports.ENS_TEXT_RECORDS.PREFERRED_TOKEN] || undefined,
                                minPayment: records[exports.ENS_TEXT_RECORDS.MIN_PAYMENT] || undefined,
                                maxPayment: records[exports.ENS_TEXT_RECORDS.MAX_PAYMENT] || undefined,
                                chainAddresses: {
                                    ethereum: records[exports.ENS_TEXT_RECORDS.ETHEREUM_ADDRESS] || "",
                                    base: records[exports.ENS_TEXT_RECORDS.BASE_ADDRESS] || "",
                                    arbitrum: records[exports.ENS_TEXT_RECORDS.ARBITRUM_ADDRESS] || "",
                                    optimism: records[exports.ENS_TEXT_RECORDS.OPTIMISM_ADDRESS] || "",
                                    polygon: records[exports.ENS_TEXT_RECORDS.POLYGON_ADDRESS] || "",
                                    avalanche: records[exports.ENS_TEXT_RECORDS.AVALANCHE_ADDRESS] || "",
                                },
                            }];
                }
            });
        });
    };
    /**
     * Get complete agent profile from ENS
     */
    ENSClient.prototype.getAgentProfile = function (ensName) {
        return __awaiter(this, void 0, void 0, function () {
            var address, keys, records, paymentPreferences, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.resolveAddress(ensName)];
                    case 1:
                        address = _a.sent();
                        if (!address)
                            return [2 /*return*/, null];
                        keys = [
                            exports.ENS_TEXT_RECORDS.AVATAR,
                            exports.ENS_TEXT_RECORDS.DESCRIPTION,
                            exports.ENS_TEXT_RECORDS.URL,
                            exports.ENS_TEXT_RECORDS.TWITTER,
                            exports.ENS_TEXT_RECORDS.GITHUB,
                            exports.ENS_TEXT_RECORDS.DISCORD,
                            exports.ENS_TEXT_RECORDS.AGENT_TYPE,
                            exports.ENS_TEXT_RECORDS.AGENT_LOCATION,
                            exports.ENS_TEXT_RECORDS.AGENT_RATING,
                            exports.ENS_TEXT_RECORDS.AGENT_AVAILABILITY,
                        ];
                        return [4 /*yield*/, this.getTextRecords(ensName, keys)];
                    case 2:
                        records = _a.sent();
                        return [4 /*yield*/, this.getPaymentPreferences(ensName)];
                    case 3:
                        paymentPreferences = _a.sent();
                        return [2 /*return*/, {
                                name: ensName,
                                address: address,
                                avatar: records[exports.ENS_TEXT_RECORDS.AVATAR] || undefined,
                                description: records[exports.ENS_TEXT_RECORDS.DESCRIPTION] || undefined,
                                url: records[exports.ENS_TEXT_RECORDS.URL] || undefined,
                                social: {
                                    twitter: records[exports.ENS_TEXT_RECORDS.TWITTER] || undefined,
                                    github: records[exports.ENS_TEXT_RECORDS.GITHUB] || undefined,
                                    discord: records[exports.ENS_TEXT_RECORDS.DISCORD] || undefined,
                                },
                                agentType: records[exports.ENS_TEXT_RECORDS.AGENT_TYPE] || undefined,
                                location: records[exports.ENS_TEXT_RECORDS.AGENT_LOCATION] || undefined,
                                rating: records[exports.ENS_TEXT_RECORDS.AGENT_RATING] || undefined,
                                availability: records[exports.ENS_TEXT_RECORDS.AGENT_AVAILABILITY] || undefined,
                                paymentPreferences: paymentPreferences,
                            }];
                    case 4:
                        error_5 = _a.sent();
                        console.error("Failed to get agent profile for ".concat(ensName, ":"), error_5);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get content hash (for decentralized websites)
     */
    ENSClient.prototype.getContentHash = function (ensName) {
        return __awaiter(this, void 0, void 0, function () {
            var resolver, contentHash, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getResolver(ensName)];
                    case 1:
                        resolver = _a.sent();
                        if (!resolver)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, resolver.getContentHash()];
                    case 2:
                        contentHash = _a.sent();
                        return [2 /*return*/, contentHash || null];
                    case 3:
                        error_6 = _a.sent();
                        console.error("Failed to get content hash for ".concat(ensName, ":"), error_6);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get address for specific chain (EIP-2304)
     */
    ENSClient.prototype.getAddressForChain = function (ensName, coinType) {
        return __awaiter(this, void 0, void 0, function () {
            var resolver, address, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getResolver(ensName)];
                    case 1:
                        resolver = _a.sent();
                        if (!resolver)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, resolver.getAddress(coinType)];
                    case 2:
                        address = _a.sent();
                        return [2 /*return*/, address || null];
                    case 3:
                        error_7 = _a.sent();
                        console.error("Failed to get address for coinType ".concat(coinType, " on ").concat(ensName, ":"), error_7);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if ENS name has payment settings configured
     */
    ENSClient.prototype.hasPaymentSettings = function (ensName) {
        return __awaiter(this, void 0, void 0, function () {
            var prefs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPaymentPreferences(ensName)];
                    case 1:
                        prefs = _a.sent();
                        return [2 /*return*/, !!(prefs.preferredChain ||
                                prefs.preferredToken ||
                                Object.values(prefs.chainAddresses || {}).some(function (addr) { return addr; }))];
                }
            });
        });
    };
    return ENSClient;
}());
exports.ENSClient = ENSClient;
/**
 * Factory function
 */
function createENSClient(providerUrl) {
    return new ENSClient(providerUrl);
}
