# CubePay - AR-Native Payment System with Circle & ENS 💳

> **🏆 ETHGlobal Bangkok 2024 Hackathon**  
> **Bounties:**
> - **Circle:** Best Chain Abstracted USDC Apps Using Arc ($5,000)
> - **ENS:** Integrate ENS ($3,500 pool split)
> - **ENS:** Most Creative Use for DeFi ($1,500)

## 🎯 What is CubePay?

CubePay is the world's first **AR-native, chain-abstracted payment system** that combines:

- 🥽 **Augmented Reality** - Discover payment agents in 3D space (screen-based or GPS-based AR)
- 🌉 **Circle Gateway** - Pay from ANY chain to ANY chain using Arc as liquidity hub
- 🏷️ **ENS Integration** - Advanced payment preferences and multi-chain routing via ENS
- 💳 **USDC Focus** - Unified balance across 12 blockchain networks
- ⚡ **Instant Settlements** - Cross-chain transfers in <30 seconds via Arc

**Core Innovation:** Users see their total USDC across all chains and pay seamlessly regardless of source/destination chain. Circle Gateway routes everything through Arc automatically. Agent payment preferences are stored in ENS text records for decentralized configuration.

---

## ✅ Hackathon Features

### Circle Integration ✅
- ✅ **Arc** - L1 blockchain as liquidity hub for cross-chain routing
- ✅ **Circle Gateway** - Cross-chain transfer protocol implementation
- ✅ **USDC** - Primary payment token across 12 chains
- ✅ **Circle Wallets** - Framework integration (ThirdWeb SDK)

[**📄 Full Circle Documentation →**](./CIRCLE_INTEGRATION.md)

### ENS Integration ✅
- ✅ **Text Records** - Payment preferences stored in ENS (`com.cubepay.*` schema)
- ✅ **Multi-Chain Addresses** - Different USDC addresses per chain in ENS
- ✅ **Agent Profiles** - Decentralized profiles via IPFS content hash
- ✅ **Smart Routing** - Auto-select preferred chain from ENS records
- ✅ **Payment Validation** - Min/max limits from ENS text records

[**📄 Full ENS Documentation →**](./ENS_INTEGRATION.md)

---

## 🌟 Features

- **🤖 Agent Deployment** - Deploy AI agents to specific GPS locations with full payment configuration
- **📱 AR Viewing** - View and interact with agents in augmented reality using your phone camera
- **💰 Multi-Chain Payments** - Support for 8+ blockchain networks (Ethereum, Solana, Hedera, etc.)
- **🎲 3D Cube Payment Engine** - Revolutionary 6-faced payment interface in 3D space
- **📍 RTK GPS** - Centimeter-level positioning accuracy via Geodnet
- **🔗 Cross-Chain** - Chainlink CCIP integration for cross-chain transfers
- **🏦 Revolut Integration** - Bank QR codes and virtual card payments

## 🏗️ Monorepo Structure

```
cubepay-monorepo/
├── apps/
│   ├── deployment-app/    # Agent deployment interface (Port 3000)
│   ├── ar-viewer-app/     # AR viewing application (Port 3001)
│   └── api-server/        # Backend API services (Port 4000)
├── packages/
│   ├── ui/                # Shared UI components (shadcn/ui + Tailwind)
│   ├── wallet-connector/  # Multi-chain wallet management
│   ├── network-config/    # Blockchain network definitions
│   ├── payment-cube/      # 3D payment cube system
│   ├── agent-types/       # Agent type utilities
│   ├── database-client/   # Supabase client wrapper
│   └── types/             # Shared TypeScript types
└── tools/
    └── eslint-config/     # Shared linting configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase account
- ThirdWeb account

### Installation

```bash
# Clone the repository
git clone https://github.com/BeerSlothCoder/cube-pay-hacks.git
cd cube-pay-hacks

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Build all packages
npm run build

# Start development servers
npm run dev

# Or run individual apps:
npm run dev:deployment   # Deployment app only
npm run dev:ar-viewer    # AR viewer only
npm run dev:api          # API server only
```

### Database Setup

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the schema from `database/schema.sql`

## 🔧 Tech Stack

### Frontend

- **React 18** - Modern UI library
- **TypeScript 5** - Type-safe development
- **Vite 6** - Lightning-fast build tool
- **Tailwind CSS 4** - Utility-first styling
- **Three.js + R3F** - 3D graphics and AR

### Blockchain

- **ThirdWeb SDK** - Multi-chain wallet infrastructure
- **@solana/web3.js** - Solana integration
- **@hashgraph/sdk** - Hedera Hashgraph
- **Wagmi + Viem** - Modern EVM development

### State & Data

- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **Supabase** - PostgreSQL database with real-time

### Payments

- **Revolut Merchant API** - Bank payments
- **Chainlink CCIP** - Cross-chain messaging
- **Multi-chain QR codes** - Universal payment links

## 📦 Available Scripts

```bash
npm run dev          # Start all apps in dev mode
npm run build        # Build all apps and packages
npm run lint         # Lint all code
npm run test         # Run all tests
npm run clean        # Clean all build artifacts
npm run format       # Format code with Prettier
```

## 🌐 Supported Networks

### EVM Chains

- Ethereum Sepolia
- Arbitrum Sepolia
- Base Sepolia
- Optimism Sepolia
- Avalanche Fuji
- Polygon Amoy

### Non-EVM Chains

- Solana (Devnet/Testnet)
- Hedera Testnet

## 💳 Payment Methods (6-Faced Cube)

1. **Crypto QR** ✅ - Multi-chain QR code payments
2. **Bank QR** 🔜 - Revolut bank transfer QR
3. **Virtual Card** 🔜 - Apple Pay / Google Pay
4. **Voice Pay** 🔜 - Voice-activated payments
5. **Sound Pay** 🔜 - Audio-based payment triggers
6. **Onboard Crypto** 🔜 - Crypto education & onboarding

## 🤝 Contributing

This is a hackathon project. Contributions welcome!

## 📄 License

MIT

## 🔗 Links

- [Supabase Dashboard](https://supabase.com/dashboard/project/okzjeufiaeznfyomfenk)
- [ThirdWeb Dashboard](https://thirdweb.com/dashboard)
- [Hedera Portal](https://portal.hedera.com)

---

Built with ❤️ for the future of AR payments
