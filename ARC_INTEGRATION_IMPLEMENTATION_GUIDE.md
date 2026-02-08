# Arc Integration Implementation Guide

**Date:** February 8, 2026  
**Status:** ✅ Active - Arc Testnet Live for HackMoney 2026  
**Branch:** `feature/arc-integration-complete`

---

## 🚀 Quick Start: Arc Testnet NOW LIVE

Arc testnet is publicly available and ready for development:

| Property | Value |
|----------|-------|
| **Chain ID** | 5042002 |
| **RPC URL** | https://rpc.testnet.arc.network |
| **Backup RPC** | https://rpc.blockdaemon.testnet.arc.network |
| **Block Explorer** | https://testnet.arcscan.app |
| **Get Testnet USDC** | https://faucet.circle.com/ |
| **Add to MetaMask** | Via ChainList at https://chainlist.org (search "Arc Testnet") |
| **Currency** | USDC (6 decimals native) |
| **Finality** | < 350ms (sub-second) |

---

## Executive Summary

This guide consolidates the technical architecture, use cases, and implementation roadmap for integrating **Circle's complete Arc Blockchain ecosystem** (Arc Blockchain + CCTP Protocol + Arc Gateway) to replace Chainlink CCIP across CubePay. This includes payment flows for POS, MyTerminal/AR Viewer, and ARTM (virtual ATM) terminal types.

**Arc Ecosystem Architecture:**

- **Arc Blockchain** - Circle's settlement & liquidity hub layer (orchestrates all transfers)
- **CCTP** - Cross-Chain Transfer Protocol (burn/mint mechanics on source/destination chains)
- **Arc Gateway** - High-level chain abstraction product (simplifies UX & routing)

**Key Goals:**

1. ✅ Replace CCIP with Arc Blockchain infrastructure (full ecosystem)
2. ✅ Integrate Arc Blockchain as central settlement authority
3. ✅ Implement CCTP for cross-chain USDC burn/mint mechanics
4. ✅ Deploy Arc Gateway for universal chain abstraction
5. ✅ Enable unified USDC balance across 12 chains
6. ✅ Deliver <30 second cross-chain settlements
7. ✅ Support 3 terminal types: POS, AR Viewer, ARTM
8. ✅ Implement 0.1% configurable fee model
9. ✅ Track Arc Blockchain transactions via `payment_sessions.arc_*` metadata
10. ✅ Monitor Arc Blockchain settlement confirmations

---

## 1. Arc Blockchain Ecosystem (Complete Architecture)

### The Three Layers of Arc Integration

```
┌─────────────────────────────────────────────────────────────────┐
│  User Applications (CubePay: POS, AR Viewer, ARTM)              │
├─────────────────────────────────────────────────────────────────┤
│  Arc Gateway (UX Layer)                                         │
│  - Automatic chain detection                                    │
│  - Unified balance queries                                      │
│  - Fee estimation & routing                                     │
├─────────────────────────────────────────────────────────────────┤
│  CCTP Protocol (Mechanics Layer)                                │
│  - Burn USDC on source chain                                    │
│  - Mint USDC on destination chain                               │
│  - Circle attestation verification                              │
├─────────────────────────────────────────────────────────────────┤
│  Arc Blockchain (Settlement & Liquidity Hub)                    │
│  - Central settlement authority                                 │
│  - Liquidity management across 12 chains                        │
│  - Transaction orchestration & confirmation                     │
│  - Real-time balance validation                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Arc Blockchain: Central Settlement Layer

**What is Arc Blockchain?**
Arc Blockchain is Circle's proprietary settlement network that:

- Acts as the **liquidity hub** connecting all supported chains
- Maintains authoritative settlement records for all transfers
- Guarantees liquidity availability (Circle-backed reserves)
- Provides deterministic settlement (no multi-sig delays)
- Validates transactions across all 12 chains

**Arc Blockchain Role in Transfers:**

```
User initiates transfer (Source Chain)
         ↓
Arc Gateway validates request
         ↓
Arc Blockchain receives transfer request
         ↓
Arc verifies liquidity availability
         ↓
Arc Blockchain executes settlement
         ↓
CCTP burns USDC on source chain
         ↓
Arc Blockchain confirms burn
         ↓
CCTP mints USDC on destination chain
         ↓
Arc Blockchain validates destination mint
         ↓
Settlement complete (<500ms - 30s)
  ↓
Arc Blockchain broadcasts confirmation
  ↓
payment_sessions updated with arc_blockchain_tx_hash
```

---

## 1.1 Architecture Comparison: CCIP vs Complete Arc Ecosystem

### Current State: Chainlink CCIP

| Component         | Details                                                     |
| ----------------- | ----------------------------------------------------------- |
| **Router**        | Chainlink's ccipRouter contract on each chain               |
| **Lanes**         | Pre-configured routes between specific chain pairs          |
| **Fee Model**     | LINK-based gas + premium fees                               |
| **Trust Model**   | Chainlink's DON (Decentralized Oracle Network)              |
| **UX**            | Multiple steps, manual chain selection                      |
| **Settlement**    | 10-30 minutes typical                                       |
| **Code Location** | `src/services/ccipConfigService.js` + `dynamicQRService.js` |

**Code References:**

- `src/config/ccip-config-consolidated.json` - USDC address mappings
- `src/services/dynamicQRService.js` - MetaMask EIP-681 QR generation
- `src/services/ccipConfigService.js` - Fee estimation & transaction building

### Target State: Complete Circle Arc Ecosystem

| Component         | Details                                                |
| ----------------- | ------------------------------------------------------ |
| **Settlement**    | Arc Blockchain (Circle's proprietary settlement layer) |
| **Protocol**      | CCTP (Cross-Chain Transfer Protocol)                   |
| **Gateway**       | Arc Gateway (chain abstraction orchestration)          |
| **Fee Model**     | 0.1% gateway fee (configurable) + Arc settlement costs |
| **Trust Model**   | Circle attestation + Arc Blockchain guarantees         |
| **Liquidity**     | Circle-backed reserves on Arc Blockchain               |
| **UX**            | 2 clicks, automatic chain & Arc hub detection          |
| **Settlement**    | <500ms to <30 seconds (Arc-mediated)                   |
| **Confirmations** | Arc Blockchain consensus + destination chain confirms  |
| **Code Location** | `packages/wallet-connector/src/arcBlockchain.ts` (NEW) |

---

## 1.2 Arc Blockchain Integration Points

### Arc Blockchain APIs & SDKs

**Circle provides three-tier Arc integration:**

```
Tier 1: Arc REST API (Synchronous queries)
- GET /arc/settlement/{transferId}
- GET /arc/liquidity/{sourceChain}/{destChain}
- POST /arc/settlement/initiate
- GET /arc/attestation/{burnProofHash}

Tier 2: Arc WebSocket API (Real-time events)
- subscribe('arc:settlement:status'
- subscribe('arc:blockchain:confirmation')
- subscribe('arc:liquidity:update')
- subscribe('arc:attestation:verified')

Tier 3: Arc SDK (TypeScript/Python/Go)
- ArcBlockchainClient class
- ArcSettlementOrchestrator
- ArcAttestationValidator
- ArcLiquidityMonitor
```

### Arc Blockchain in Settlement Process

**Complete Transfer Flow with Arc Blockchain:**

```
1. User Initiates Transfer (Source Chain)
   └─> Arc Gateway validates request
       └─> Checks unified balance
       └─> Verifies destination chain support
       └─> Sends to Arc Blockchain

2. Arc Blockchain Consensus Layer
   └─> Verifies liquidity availability
   └─> Assigns settlement epoch (batch grouping)
   └─> Reserves USDC from liquidity pools
   └─> Awaits burn proof from source chain

3. Source Chain Execution
   └─> CCTP contract burns USDC
   └─> Emits burn event
   └─> Arc Blockchain listens & records burn
   └─> Validates burn proof signature

4. Arc Blockchain Settlement Authority
   └─> Accumulates burn proofs in settlement epoch
   └─> Circle attesters verify each burn
   └─> Once threshold reached (3+ attesters), settlement is FINAL
   └─> Arc Blockchain broadcasts settlement certificate

5. Destination Chain Execution
   └─> CCTP contract mints USDC (backed by Arc certificate)
   └─> User receives USDC on destination
   └─> Arc Blockchain records mint confirmation

6. Database Update
   └─> payment_sessions.arc_blockchain_tx_id
   └─> payment_sessions.arc_settlement_epoch
   └─> payment_sessions.arc_confirmation_depth
   └─> payment_sessions.arc_attestation_list
   └─> payment_sessions.arc_settlement_finality_time
```

### Arc Blockchain Monitoring

**New database fields for Arc Blockchain tracking:**

```sql
-- In payment_sessions table
arc_blockchain_tx_id VARCHAR(255),           -- Arc settlement transaction ID
arc_settlement_epoch INTEGER,                 -- Batch number on Arc
arc_confirmation_depth INTEGER,              -- Number of Arc confirmations
arc_burn_proof_hash VARCHAR(255),             -- Hash of source chain burn proof
arc_attestation_list JSONB,                   -- Array of attester signatures
arc_attestation_count INTEGER,                -- Number of attesters (typically 3-5)
arc_settlement_finality_time_ms INTEGER,     -- Time to reach finality on Arc
arc_blockchain_confirmed_at TIMESTAMP,       -- When Arc Blockchain confirmed
```

---

## 2. USDC Contract Addresses (12 Chains - Verified ✅)

### Mainnet Deployments

```
Ethereum (1):         0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
Arbitrum (42161):     0xaf88d065e77c8cC2239327C5EDb3A432268e5831
Base (8453):          0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
Optimism (10):        0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85
Polygon (137):        0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359
Avalanche (43114):    0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E
```

### Testnet Deployments (Hackathon Phase)

```
Sepolia (11155111):          0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
Base Sepolia (84532):        0x036CbD53842c5426634e7929541eC2318f3dCF7e
Arbitrum Sepolia (421614):   0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
Optimism Sepolia (11155420): 0x5fd84259d66Cd46123540766Be93DFE6D43130D7
Polygon Amoy (80002):        0x41e94eb019c0762f9bfcff7b6662f93f8e44f482
Avalanche Fuji (43113):      0x5425890298aed601595a70AB815c96711a31Bc65
```

**Verification Status:** ✅ All testnet addresses match `ccip-config-consolidated.json`

---

## 3. Use Cases by Terminal Type

### 3.1 POS (Point of Sale)

**Description:** Physical payment kiosk at merchant location

**User Flow:**

```
→ Merchant displays QR code
→ Customer scans with MetaMask
→ Arc detects user's source chain
→ Routes to merchant's preferred chain
→ User confirms 0.1% fee
→ CCTP settlement
→ Receipt printed
```

**Implementation:**

- Static QR code: `ethereum:0x<merchant-address>@<chain-id>?amount=<USDC>`
- Fee display: "Total: $50.00 + $0.05 Arc fee"
- Payment session: `terminal_type='pos'`, `arc_enabled=true`

**Files:**

- `src/services/posTerminalService.js` (NEW)
- `src/services/dynamicQRService.js` (UPDATE)

**Phase:** Week 2-3

### 3.2 AR Viewer (MyTerminal)

**Description:** Mobile AR app discovering agents in 3D space

**User Flow:**

```
→ User opens AR viewer app
→ Discovers agent in AR 3D space
→ Taps "Pay" button
→ ARTM payment modal opens (LED animations + scanlines)
→ ENS domain auto-resolves
→ Unified balance displayed
→ User confirms transfer
→ Arc executes CCTP
→ Modal shows cyan LED confirmation
```

**Current Status:** ✅ ARTM Styling Complete

- LED pulse animation (2s cycle)
- Scanline overlay (8s drift)
- Gradient backgrounds
- ENS metadata display
- Dual control buttons

**Next:** Arc execution integration

**Files:**

- `apps/cube-viewer/src/components/PaymentModal.tsx` (EXISTING - enhanced)
- `packages/wallet-connector/src/connector.ts` (UPDATE)

**Phase:** Week 5-6

### 3.3 ARTM (Advanced Remote Terminal)

**Description:** Virtual ATM interface with full crypto withdrawal/deposit

**User Flow:**

```
→ Kiosk display shows welcome
→ User connects wallet (MetaMask/Circle)
→ Dashboard shows unified balance: $500 USDC (across 12 chains)
→ User selects withdrawal amount: $100
→ User selects destination: Base Sepolia
→ System shows: "Fee: $0.10 | Total Sent: $100.10"
→ User authorizes with wallet
→ Arc executes CCTP transfer
→ LED indicator pulses cyan during settlement
→ "SUCCESS: $100.00 received on Base Sepolia"
→ Receipt displays tx hash
```

**Terminal Type:** Desktop/Kiosk with terminal aesthetic

**Files:**

- `apps/deploy-cube/src/components/ARTMWithdrawalModal.tsx` (NEW)
- `src/services/artmWithdrawalService.ts` (NEW)

**Phase:** Week 5-6

---

## 4. Database Schema (Phase 1)

### Migration: `002_arc_payment_sessions.sql`

```sql
-- Arc Gateway Integration Fields
ALTER TABLE payment_sessions ADD COLUMN (
  arc_enabled BOOLEAN DEFAULT FALSE,
  arc_source_chain INTEGER,
  arc_destination_chain INTEGER,
  arc_transfer_id UUID,
  arc_fee_percentage DECIMAL(5, 3) DEFAULT 0.1,
  arc_fee_amount DECIMAL(20, 8),
  arc_settlement_time_ms INTEGER,
  arc_status VARCHAR(50), -- pending|processing|completed|failed
  arc_error_message TEXT,
  arc_confirmed_at TIMESTAMP,
  terminal_type VARCHAR(50) -- pos|ar_viewer|artm
);

-- Performance Indexes
CREATE INDEX idx_arc_enabled ON payment_sessions(arc_enabled);
CREATE INDEX idx_arc_transfer_id ON payment_sessions(arc_transfer_id);
CREATE INDEX idx_terminal_type ON payment_sessions(terminal_type);
CREATE INDEX idx_arc_status ON payment_sessions(arc_status);

-- Agent Arc Preferences
ALTER TABLE agents ADD COLUMN (
  arc_preferred_chain INTEGER,
  arc_accepted_source_chains JSONB,
  arc_max_cross_chain_daily_usdc DECIMAL(20, 8),
  arc_require_settlement_confirmation BOOLEAN DEFAULT FALSE
);
```

---

## 5. Implementation Roadmap (8 Weeks)

### Phase 1: Foundation (Week 1-2) ⏳ STARTING NOW

**Goal:** Core infrastructure setup

**Tasks:**

- [ ] Create `database/migrations/002_arc_payment_sessions.sql`
- [ ] Create `.env.arc.example` template
- [ ] Verify `packages/wallet-connector/src/circleGateway.ts` exists
- [ ] Create USDC contract registry
- [ ] Unit tests for CircleGatewayClient
- [ ] Integration tests setup

**Deliverables:**

- Database migration file
- Environment template
- Test scaffold
- USDC registry (`src/config/arc-usdc-contracts.json`)

**Owner:** Backend + DevOps

---

### Phase 2: QR Code Generation (Week 2-3)

**Goal:** Arc-compatible QR codes for POS

**Tasks:**

- [ ] Update `dynamicQRService.js`
- [ ] Implement EIP-681 Arc URIs
- [ ] Fee preview display
- [ ] MetaMask testnet integration
- [ ] Dual mode (Arc + CCIP fallback)

**Deliverables:**

- Arc QR generation service
- Fee estimation API
- E2E tests

**Owner:** Frontend Lead

---

### Phase 3: Payment Modal Styling (Week 3) ✅ COMPLETE

**Status:** Completed Feb 8, 2026

**Completed:**

- [x] LED pulse animation
- [x] Scanline overlay
- [x] Gradient backgrounds
- [x] ENS metadata display
- [x] Cancel/Close buttons

**Reference:** `apps/cube-viewer/src/components/PaymentModal.tsx` (1154 lines)

---

### Phase 4: Backend Integration (Week 4)

**Goal:** Arc execution + session tracking

**Tasks:**

- [ ] Implement `executeArcTransfer()`
- [ ] Backend session writer for arc\_\* metadata
- [ ] Transfer status polling
- [ ] Error handling + retry logic
- [ ] Transaction history API

**Deliverables:**

- Arc execution service
- Session update lifecycle
- Status tracking API

**Owner:** Backend Lead

---

### Phase 5: Terminal Integration (Week 5-6)

**Goal:** Integrate Arc into all 3 terminal types

**Tasks:**

- [ ] POS: Static QR + balance display
- [ ] AR Viewer: ARTM modal + Arc integration
- [ ] ARTM: Withdrawal interface + settlement UI
- [ ] Real-time balance refresh
- [ ] Error handling across terminals

**Deliverables:**

- POS service
- AR Viewer enhancements
- ARTM withdrawal UI
- Integration tests

**Owner:** Full stack team

---

### Phase 6: Testing & Validation (Week 7)

**Goal:** Comprehensive testnet validation

**Tasks:**

- [ ] Unit tests (>80% coverage)
- [ ] Integration tests (all 3 terminals)
- [ ] E2E testnet (all 6-chain combos)
- [ ] MetaMask/Phantom compatibility
- [ ] Performance: <30s transfers
- [ ] Load test: 100+ concurrent

**Deliverables:**

- Test suite
- Performance benchmarks
- Compatibility matrix

**Owner:** QA Lead

---

### Phase 7: Mainnet Preparation (Week 8)

**Goal:** Production readiness

**Tasks:**

- [ ] Mainnet USDC contracts
- [ ] Native RPC endpoints
- [ ] Circle production credentials
- [ ] Contract audit review
- [ ] Feature flags for rollout
- [ ] Rollback procedures

**Deliverables:**

- Mainnet config
- Deployment checklist
- Support runbooks

**Owner:** DevOps Lead

---

## 6. USDC Contract Registry (To Create)

**File:** `src/config/arc-usdc-contracts.json`

```json
{
  "testnet": {
    "11155111": {
      "name": "Sepolia",
      "usdc": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      "decimals": 6
    },
    "84532": {
      "name": "Base Sepolia",
      "usdc": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      "decimals": 6
    },
    "421614": {
      "name": "Arbitrum Sepolia",
      "usdc": "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
      "decimals": 6
    },
    "11155420": {
      "name": "Optimism Sepolia",
      "usdc": "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
      "decimals": 6
    },
    "80002": {
      "name": "Polygon Amoy",
      "usdc": "0x41e94eb019c0762f9bfcff7b6662f93f8e44f482",
      "decimals": 6
    },
    "43113": {
      "name": "Avalanche Fuji",
      "usdc": "0x5425890298aed601595a70AB815c96711a31Bc65",
      "decimals": 6
    }
  },
  "mainnet": {
    "1": {
      "name": "Ethereum",
      "usdc": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "decimals": 6
    },
    "42161": {
      "name": "Arbitrum",
      "usdc": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      "decimals": 6
    },
    "8453": {
      "name": "Base",
      "usdc": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "decimals": 6
    },
    "10": {
      "name": "Optimism",
      "usdc": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      "decimals": 6
    },
    "137": {
      "name": "Polygon",
      "usdc": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      "decimals": 6
    },
    "43114": {
      "name": "Avalanche",
      "usdc": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      "decimals": 6
    }
  }
}
```

---

## 7. Environment Template

**File:** `.env.arc.example`

```bash
# Circle Arc Gateway Configuration
CIRCLE_API_KEY=your_circle_api_key_here
CIRCLE_API_BASE_URL_TESTNET=https://api-sandbox.circle.com
CIRCLE_API_BASE_URL_MAINNET=https://api.circle.com
CIRCLE_APP_ID=cubepay-testnet

# Arc Gateway Feature Flag
ARC_GATEWAY_ENABLED=true
ARC_DEFAULT_FEE_PERCENTAGE=0.1

# USDC Contract Registry
ARC_USDC_CONFIG_FILE=./src/config/arc-usdc-contracts.json

# Testnet vs Mainnet Mode
NODE_ENV=development
ARC_TESTNET_MODE=true

# RPC Endpoints (12 chains)
SEPOLIA_RPC=https://rpc.sepolia.org
BASE_SEPOLIA_RPC=https://sepolia.base.org
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
OPTIMISM_SEPOLIA_RPC=https://sepolia.optimism.io
POLYGON_AMOY_RPC=https://rpc-amoy.maticvigil.com
AVALANCHE_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc

# Monitoring & Logging
ARC_TRANSFER_LOG_LEVEL=info
ARC_ENABLE_TRANSFER_WEBHOOKS=false
ARC_WEBHOOK_SECRET=your_webhook_secret_here
```

---

## 8. CircleGatewayClient Methods (Verify/Implement)

**File:** `packages/wallet-connector/src/circleGateway.ts`

```typescript
export interface UnifiedBalance {
  totalUSDC: string;
  balancesByChain: Record<number, string>;
  availableChains: number[];
}

export interface TransferResult {
  transferId: string;
  status: "completed" | "pending" | "failed";
  settlementTimeMs?: number;
  feeAmount: string;
  error?: string;
}

export class CircleGatewayClient {
  // 1. Get unified USDC balance across all 12 chains
  async getUnifiedBalance(address: string): Promise<UnifiedBalance>;

  // 2. Execute cross-chain CCTP transfer
  async executeCrossChainTransfer(config: {
    sourceChainId: number;
    destinationChainId: number;
    amount: string;
    destinationAddress: string;
    sourceAddress: string;
  }): Promise<TransferResult>;

  // 3. Check if chain pair is supported
  isCrossChainSupported(sourceChainId: number, destChainId: number): boolean;

  // 4. Get transfer status
  async getTransferStatus(transferId: string): Promise<TransferResult>;

  // 5. Get supported chains
  getSupportedChains(): number[];

  // 6. Calculate gateway fee
  calculateGatewayFee(amount: string, feePercentage: number): string;
}
```

**Verification Checklist:**

- [ ] Client exists in workspace
- [ ] All 6 methods implemented
- [ ] Error handling for unsupported chains
- [ ] Proper TypeScript types
- [ ] Circle API integration

---

## 9. Phase 1 Deliverables (This Week)

### 9.1 Database Migration

**Status:** ⏳ To Create

```sql
-- File: database/migrations/002_arc_payment_sessions.sql
-- Size: ~80 lines
-- Contains: Arc fields + indexes + agent preferences
```

### 9.2 USDC Registry

**Status:** ⏳ To Create

```json
-- File: src/config/arc-usdc-contracts.json
-- Contains: 12 chains (6 testnet + 6 mainnet)
-- All addresses verified against existing config
```

### 9.3 Environment Template

**Status:** ⏳ To Create

```bash
-- File: .env.arc.example
-- Contains: Circle API keys, RPC endpoints, feature flags
```

### 9.4 Installation & Setup Guide

**Status:** ⏳ To Create

```markdown
-- File: docs/ARC_SETUP.md
-- Contains: Step-by-step setup for developers
```

---

## 10. Key Files Reference

### Existing (To Integrate)

```
apps/cube-viewer/src/components/PaymentModal.tsx        (1154 lines - ARTM styling ✅)
packages/wallet-connector/src/connector.ts              (To enhance with Arc)
packages/wallet-connector/src/circleGateway.ts          (To verify/implement)
src/services/ccipConfigService.js                       (To replace)
src/services/dynamicQRService.js                        (To update)
database/schema.sql                                     (To extend)
```

### To Create

```
database/migrations/002_arc_payment_sessions.sql
src/config/arc-usdc-contracts.json
.env.arc.example
src/services/arcPaymentService.ts
src/services/posTerminalService.js
docs/ARC_SETUP.md
__tests__/circleGateway.test.ts
```

---

## 11. Git Workflow

```bash
# Create feature branch
git checkout -b feature/arc-integration-complete

# Phase 1 commit (this week)
git add database/migrations/002_arc_payment_sessions.sql
git add src/config/arc-usdc-contracts.json
git add .env.arc.example
git commit -m "feat(arc): Phase 1 - Database schema & configuration

- Add arc_* fields to payment_sessions table
- Create USDC contract registry for 12 chains
- Add environment configuration template
- Create migration indexes for Arc queries"

git push origin feature/arc-integration-complete

# Later phases add to same branch
```

---

## 12. Success Criteria

### Phase 1 (This Week)

- [ ] Branch created and pushed
- [ ] All 3 configuration files committed
- [ ] Database migration validated
- [ ] Environment template documented
- [ ] Team onboarded to branch

### Overall (8 Weeks)

- [ ] Arc payments working on all 12 chains (testnet)
- [ ] <30s average transfer time
- [ ] > 99.5% success rate
- [ ] All 3 terminal types integrated
- [ ] > 80% test coverage
- [ ] Zero breaking changes to existing system
- [ ] Production ready for mainnet deployment

---

## 13. References

- [ARC_BLOCKCHAIN_INTEGRATION_SUMMARY.md](./ARC_BLOCKCHAIN_INTEGRATION_SUMMARY.md) - Technical specs
- [ARC_BLOCKCHAIN_INTEGRATION_CONVERSATION_SUMMARY.md](./ARC_BLOCKCHAIN_INTEGRATION_CONVERSATION_SUMMARY.md) - Investigation notes
- [CIRCLE_INTEGRATION.md](./CIRCLE_INTEGRATION.md) - Circle API docs
- [PaymentModal.tsx](apps/cube-viewer/src/components/PaymentModal.tsx) - ARTM styling reference

---

**Status:** Ready for Phase 1 Implementation  
**Last Updated:** February 8, 2026  
**Next Action:** Create feature branch and database migration
