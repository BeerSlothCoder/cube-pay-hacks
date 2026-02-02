# @cubepay/wallet-connector

Multi-chain wallet connection layer with Arc chain abstraction for CubePay.

## Features

- 🔗 **Multi-wallet support**: Circle, MetaMask, Phantom, HashPack
- ⚡ **Arc chain abstraction**: Pay from any chain to any chain
- 🏷️ **ENS integration**: Pay merchants via .eth names
- 💰 **USDC-focused**: Unified USDC balance across chains
- 🔄 **Real-time events**: Balance updates, chain changes, disconnections
- 📱 **Mobile-ready**: Touch-friendly, responsive design support

## 6-Faced Payment Cube

CubePay uses a 6-faced cube UI for payment methods:

### Face 1: Crypto QR Payment (Arc) 💳

Pay with USDC from **any chain** using Circle's Arc chain abstraction. No need to choose source or destination chain - Arc handles routing automatically.

**Status:** ✅ Enabled  
**Technology:** Circle Gateway + Bridge Kit  
**Speed:** <500ms instant transfers

### Face 2: Virtual Card Payment 💰

Revolut virtual card integration with USDC support.

**Status:** ✅ Enabled  
**Technology:** Revolut API + USDC

### Face 3: Sound Pay 🔊

Pay using sound waves.

**Status:** 🚧 Coming Soon

### Face 4: Voice Pay 🎤

Voice-activated payments.

**Status:** 🚧 Coming Soon

### Face 5: On/Off Ramp 🏦

Convert between USDC and fiat currencies for smooth onboarding.

**Status:** ✅ Enabled  
**Technology:** USDC ↔ Fiat bridges

### Face 6: ENS Payment 🏷️

Pay merchants using ENS names (e.g., `merchant.eth`) instead of addresses.

**Status:** ✅ Enabled  
**Technology:** ENS Protocol  
**Docs:** https://docs.ens.domains/learn/protocol/

## Installation

```bash
npm install @cubepay/wallet-connector
```

## Quick Start

### Initialize Wallet Connector

```typescript
import { createWalletConnector } from "@cubepay/wallet-connector";

const wallet = createWalletConnector({
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
    supportedChains: ["ethereum", "arbitrum", "base"],
  },
});
```

### Connect Wallet

```typescript
// Circle Wallet (recommended for Arc)
await wallet.connect("circle");

// MetaMask (EVM chains)
await wallet.connect("metamask");

// Phantom (Solana)
await wallet.connect("phantom");

// HashPack (Hedera)
await wallet.connect("hashpack");
```

### Chain-Abstracted Payment (Face 1)

```typescript
// User pays from ANY chain, agent receives on destination chain
const tx = await wallet.executeChainAbstractedPayment({
  // Source (optional - Arc abstracts this)
  sourceToken: "USDC",
  sourceAmount: "10.00",

  // Destination
  destinationChain: "ethereum-sepolia",
  destinationToken: "USDC",
  destinationAddress: "0x123...",

  // Arc magic
  useArcGateway: true,
  instantSettlement: true,

  // Payment face
  paymentFace: "crypto-qr",

  agentId: "agent-uuid-here",
});

console.log(`Payment confirmed: ${tx.hash}`);
```

### ENS Payment (Face 6)

```typescript
// Pay merchant using ENS name
const tx = await wallet.executeChainAbstractedPayment({
  sourceToken: "USDC",
  sourceAmount: "25.00",

  destinationChain: "ethereum-sepolia",
  destinationToken: "USDC",
  destinationAddress: "0x...", // Resolved automatically
  destinationENS: "merchant.eth", // Human-readable name

  useArcGateway: true,
  paymentFace: "ens-payment",

  merchantId: "merchant-123",
});
```

### Listen to Events

```typescript
// Connection events
wallet.on("connect", (state) => {
  console.log("Connected:", state.address);
  console.log("ENS name:", state.ensName);
});

wallet.on("disconnect", () => {
  console.log("Wallet disconnected");
});

// Account changes
wallet.on("accountChanged", (address) => {
  console.log("Account changed:", address);
});

// Chain changes
wallet.on("chainChanged", (chainId) => {
  console.log("Chain changed:", chainId);
});

// Errors
wallet.on("error", (error) => {
  console.error("Wallet error:", error);
});
```

### Check Arc Unified Balance

```typescript
const balance = await wallet.getArcUnifiedBalance(wallet.getState().address);

console.log("Total USDC:", balance.totalUSDC);
console.log("Balances by chain:", balance.balancesByChain);
// {
//   'ethereum-sepolia': '100.00',
//   'base-sepolia': '50.00',
//   'arbitrum-sepolia': '25.00'
// }
```

### Switch Networks

```typescript
import { getNetworkById } from "@cubepay/network-config";

const baseNetwork = getNetworkById("base-sepolia");
await wallet.switchNetwork(baseNetwork);
```

## Arc Chain Abstraction

Circle's Arc provides **true chain abstraction** - users don't need to worry about which chain they're paying from or to. The system automatically:

1. ✅ Maintains unified USDC balance across all chains
2. ✅ Routes payments through optimal path
3. ✅ Settles instantly (<500ms)
4. ✅ Handles all bridging automatically
5. ✅ Non-custodial (users always control funds)

### How It Works

```
User has: USDC on Base
Agent needs: USDC on Hedera

Traditional:
1. User opens bridge
2. Select source (Base) and destination (Hedera)
3. Approve bridge transaction
4. Wait 5-20 minutes
5. Agent receives USDC

With Arc:
1. User clicks "Pay"
2. Payment arrives instantly
✨ That's it!
```

## ENS Integration

Pay merchants using human-readable names instead of addresses:

```typescript
// Instead of: 0x1234567890abcdef...
// Use: merchant.eth

await wallet.executeChainAbstractedPayment({
  destinationENS: "merchant.eth",
  // ... other params
});
```

ENS names are resolved automatically and cached for future payments.

## Payment Faces

Access payment face configurations:

```typescript
import { PAYMENT_FACES } from "@cubepay/wallet-connector";

// Check if face is enabled
if (PAYMENT_FACES["crypto-qr"].enabled) {
  // Show crypto QR payment option
}

// Display coming soon faces
Object.values(PAYMENT_FACES)
  .filter((face) => face.comingSoon)
  .forEach((face) => {
    console.log(`${face.label}: Coming Soon`);
  });
```

## API Reference

### `WalletConnector`

#### Methods

- `connect(type, options?)` - Connect to wallet
- `disconnect()` - Disconnect current wallet
- `getState()` - Get current wallet state
- `isConnected()` - Check connection status
- `executeChainAbstractedPayment(payment)` - Execute Arc payment
- `getArcUnifiedBalance(address)` - Get unified USDC balance
- `switchNetwork(network)` - Switch to different network

#### Events

- `connect` - Wallet connected
- `disconnect` - Wallet disconnected
- `accountChanged` - Account switched
- `chainChanged` - Network switched
- `balanceChanged` - Balance updated
- `error` - Error occurred

## Supported Networks

### EVM Chains (with Arc + USDC)

- Ethereum Sepolia
- Arbitrum Sepolia
- Base Sepolia
- Optimism Sepolia
- Avalanche Fuji
- Polygon Amoy

### Solana

- Solana Devnet (USDC SPL)

### Hedera

- Hedera Testnet (USDh - custom stablecoin)

## Future: Chainlink CCIP

Chainlink Cross-Chain Interoperability Protocol integration is included but **disabled by default**. It will be enabled for future Chainlink hackathons:

```typescript
const wallet = createWalletConnector({
  chainlink: {
    enabled: true,
    lanes: ["ethereum-sepolia", "arbitrum-sepolia"],
  },
});
```

## Mobile Optimization

All wallet interactions are designed for mobile:

- ✅ Touch-friendly button sizes (44px minimum)
- ✅ Responsive layouts (320px-428px width)
- ✅ Full-screen camera for QR scanning
- ✅ Bottom-sheet UI for payment cube
- ✅ Haptic feedback support

## License

MIT
