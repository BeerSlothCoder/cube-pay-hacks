"use strict";
/**
 * Payment Method Types for 6-Faced Cube
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENT_FACES = void 0;
exports.PAYMENT_FACES = {
    "crypto-qr": {
        face: "crypto-qr",
        enabled: true,
        label: "Crypto QR Payment",
        description: "Pay with USDC from any chain using Arc abstraction",
        icon: "💳",
    },
    "virtual-card": {
        face: "virtual-card",
        enabled: true,
        label: "Virtual Card",
        description: "Revolut virtual card + USDC payments",
        icon: "💰",
    },
    "sound-pay": {
        face: "sound-pay",
        enabled: false,
        label: "Sound Pay",
        description: "Pay with sound waves",
        icon: "🔊",
        comingSoon: true,
    },
    "voice-pay": {
        face: "voice-pay",
        enabled: false,
        label: "Voice Pay",
        description: "Voice-activated payments",
        icon: "🎤",
        comingSoon: true,
    },
    "on-off-ramp": {
        face: "on-off-ramp",
        enabled: true,
        label: "On/Off Ramp",
        description: "Convert between USDC and fiat",
        icon: "🏦",
    },
    "ens-payment": {
        face: "ens-payment",
        enabled: true,
        label: "ENS Payment",
        description: "Pay merchants via ENS names",
        icon: "🏷️",
    },
};
