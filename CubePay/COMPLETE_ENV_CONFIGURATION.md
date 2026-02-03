# Complete Environment Configuration - AgentSphere

This document contains all environment variables, secrets, and configuration values found in the AgentSphere repository. Use this for setting up your new monorepo from scratch.

## 🚨 SECURITY WARNING
These are real production/development secrets. Handle with care and rotate keys before production use.

---

## 1. MAIN APPLICATION ENVIRONMENT (.env)

```env
# ===========================================
# SUPABASE DATABASE CONFIGURATION
# ===========================================
VITE_SUPABASE_URL=https://ncjbwzibnqrbrvicdmec.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzMzMDAsImV4cCI6MjA3NzA0OTMwMH0.OBxPLTZYpm6J59HFcn6VvXHlDt3r_HXMQEFCYKNR110
VITE_SUPABASE_SERVICE_ROLE_KEY=sb_secret_s3sWA4HPYMpD-_I-GEzsIw_g92UJm9S
VITE_SUPABASE_ANON_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzMzMDAsImV4cCI6MjA3NzA0OTMwMH0.OBxPLTZYpm6J59HFcn6VvXHlDt3r_HXMQEFCYKNR110
VITE_SUPABASE_SERVICE_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3MzMwMCwiZXhwIjoyMDc3MDQ5MzAwfQ.5LiZQFdXgyMnM_HDVW5ZLTGuhF_9xOAbXEJ6yeJ_yTk

# ===========================================
# THIRDWEB BLOCKCHAIN CONFIGURATION
# ===========================================
VITE_THIRDWEB_CLIENT_ID=299516306b51bd6356fd8995ed628950
VITE_THIRDWEB_SECRET_KEY=X2Td-JQsUBzfE7f-go2OjauaMsfN3ygzPzBvpz4eHn00ip5mMZQbWaf7UO4yvELtiNpcNQZknD30aoPh656qyA

# ===========================================
# ASSEMBLY AI CONFIGURATION
# ===========================================
ASSEMBLY_AI_API_KEY=b482b41e8e87465bbed26a492de2d63d

# ===========================================
# REVOLUT PAYMENT INTEGRATION
# ===========================================
REVOLUT_CLIENT_ID=96ca6a20-254d-46e7-aad1-46132e087901
REVOLUT_MERCHANT_API_SECRET=sk_ZXzrNQBu3jAgK310spMgznoZxqclcsIP7BdZmUXo-UYMAfAfbX_ANT0mZokp12st
REVOLUT_MERCHANT_API_PUBLIC=pk_HdaK7P8tRmWac57H9deKv1BgnzvrTATOUsUvCjfbtdLr8AVy
REVOLUT_ENVIRONMENT=sandbox
REVOLUT_API_KEY=sk_ZXzrNQBu3jAgK310spMgznoZxqclcsIP7BdZmUXo-UYMAfAfbX_ANT0mZokp12st
REVOLUT_ACCESS_TOKEN=sand_vfUxRQdLU8kVlztOYCLYNcXrBh0wXoKqGj0C7uIVxCc
REVOLUT_API_BASE_URL=https://sandbox-merchant.revolut.co

# ===========================================
# HEDERA TESTNET CONFIGURATION
# ===========================================
VITE_TREASURY_ACCOUNT_ID=0.0.7145005
VITE_TREASURY_PRIVATE_KEY=3030020100300706052b8104000a04220420d52cb0af6dfb5427be7a610c3d84122c960be00459d5c101ce9a41fa63b681c7

# USDh Stablecoin Token ID (already deployed on Hedera Testnet)
VITE_USDH_TOKEN_ID=0.0.7218375

# ERC-8004 Identity Contract (deploy once, then add ID here)
VITE_ERC8004_CONTRACT_ID=

# Agent Configuration
VITE_AGENT_INITIAL_HBAR=10
VITE_AGENT_INITIAL_USDH=100

# Hedera Network
VITE_HEDERA_NETWORK=testnet

# ===========================================
# A2A COMMUNICATION & MCP SERVERS
# ===========================================
VITE_A2A_BASE_URL=http://localhost:3001
VITE_NEXUS_API_URL=https://nexus.thirdweb.com/api

# ===========================================
# X402 PAYMENT GATEWAY (External APIs)
# ===========================================
VITE_TIMETABLE_API_URL=https://api.example.com/timetables
VITE_HOTEL_API_URL=https://api.example.com/hotels/availability
```

---

## 2. AR VIEWER ENVIRONMENT CONFIGURATION

```env
# ===========================================
# AR VIEWER COMPLETE CONFIGURATION
# ===========================================

# Revolut Configuration (Frontend-safe values only)
VITE_REVOLUT_CLIENT_ID=96ca6a20-254d-46e7-aad1-46132e087901
VITE_REVOLUT_MERCHANT_API_PUBLIC=pk_HdaK7P8tRmWac57H9deKv1BgnzvrTATOUsUvCjfbtdLr8AVy
VITE_REVOLUT_ENVIRONMENT=sandbox

# Backend Integration
VITE_AGENTSPHERE_API_URL=http://localhost:5174
# For production/mobile testing, use:
# VITE_AGENTSPHERE_API_URL=https://8323ecb51478.ngrok-free.app

# Currency & Regional Settings
VITE_PRIMARY_CURRENCY=USD
VITE_FALLBACK_CURRENCY=EUR
VITE_SUPPORTED_REGIONS=EU,UK,US

# AR Viewer Specific Settings
VITE_AR_VIEWER_URL=http://localhost:5173

# Webhook Endpoints (for status updates)
VITE_WEBHOOK_ENDPOINT=https://8323ecb51478.ngrok-free.app/api/revolut/webhook
```

---

## 3. HEDERA ERC-8004 CONTRACTS ENVIRONMENT

```env
# ===========================================
# HEDERA ERC-8004 IDENTITY CONTRACTS
# ===========================================
HEDERA_RPC_URL=https://testnet.hashio.io/api
HEDERA_PRIVATE_KEY=0xd52cb0af6dfb5427be7a610c3d84122c960be00459d5c101ce9a41fa63b681c7
```

---

## 4. TRAVEL AGENT TEMPLATE CONFIGURATION

```env
# ===========================================
# TRAVEL AGENT 2 (MCP-ENABLED) CONFIGURATION
# ===========================================

# Agent Identity (Hedera Testnet)
AGENT_ACCOUNT_ID=0.0.7301930
AGENT_PRIVATE_KEY=0xd52cb0af6dfb5427be7a610c3d84122c960be00459d5c101ce9a41fa63b681c7

# USDH Stablecoin Token
USDH_TOKEN_ID=0.0.7218375

# Flightradar24 MCP Integration
MCP_FLIGHTRADAR_ENABLED=true
MCP_FLIGHTRADAR_ENDPOINT=https://nexus.thirdweb.com/routes/dck8b9de

# Server Configuration
AGENT_PORT=4001

# A2A Communication (Sub-agents for multi-agent coordination)
A2A_BUS_AGENT_URL=http://localhost:4002/.well-known/agent-card.json
A2A_TRAIN_AGENT_URL=http://localhost:4003/.well-known/agent-card.json
A2A_HOTEL_AGENT_URL=http://localhost:4004/.well-known/agent-card.json

# Hedera Network
HEDERA_NETWORK=testnet
```

---

## 5. TEMPLATE ENVIRONMENT FILES

### Main Application Template (.env.example)

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_THIRDWEB_CLIENT_ID=299516306b51bd6356fd8995ed628950
VITE_THIRDWEB_SECRET_KEY=your_thirdweb_secret_key_here
```

### Hedera Configuration Template (.env.hedera.example)

```env
# Hedera Testnet Credentials
# Get these from: https://portal.hedera.com/

# Treasury Account (used to create agents and deploy contracts)
VITE_TREASURY_ACCOUNT_ID=0.0.xxxxxxx
VITE_TREASURY_PRIVATE_KEY=302e020100300506032b657004220420...

# USDh Stablecoin Token ID (already deployed on Hedera Testnet)
# https://hashscan.io/testnet/token/0.0.7218375
VITE_USDH_TOKEN_ID=0.0.7218375

# ERC-8004 Identity Contract (deploy once using tools/erc-8004-contracts, then add ID here)
# Deploy with: cd tools/erc-8004-contracts && npx hardhat run scripts/deploy.js --network hedera_testnet
VITE_ERC8004_CONTRACT_ID=

# Agent Configuration
VITE_AGENT_INITIAL_HBAR=10
VITE_AGENT_INITIAL_USDH=100

# Hedera Network
VITE_HEDERA_NETWORK=testnet

# A2A Communication (agent-to-agent messaging)
# This should point to your agent microservices backend
VITE_A2A_BASE_URL=http://localhost:3001

# MCP Servers (Model Context Protocol)
# Thirdweb Nexus for blockchain data queries
VITE_NEXUS_API_URL=https://nexus.thirdweb.com/api

# x402 Payment Gateway (external data services)
# Timetable API (x402-protected)
VITE_TIMETABLE_API_URL=https://api.example.com/timetables

# Hotel Booking API (x402-protected)
VITE_HOTEL_API_URL=https://api.example.com/hotels/availability

# Flight API (x402-protected)
VITE_FLIGHT_API_URL=https://api.example.com/flights

# Restaurant API
VITE_RESTAURANT_API_URL=https://api.example.com/restaurants

# IMPORTANT NOTES:
# 1. Copy this file to .env and fill in real values
# 2. NEVER commit .env to git
# 3. In production, encrypt hedera_private_key in database
# 4. Use environment variables or secrets manager for sensitive data
# 5. Treasury account needs sufficient HBAR (~100) and USDh (~10,000) for agent deployments
```

---

## 6. REVOLUT CONFIGURATION (JSON)

```json
{
  "sandbox": {
    "clientId": "96ca6a20-254d-46e7-aad1-46132e087901",
    "environment": "sandbox",
    "baseUrl": "https://sandbox-merchant.revolut.com/api/1.0",
    "certificates": {
      "privateKeyPath": "./private.key",
      "csrPath": "./revolut.csr",
      "status": "uploaded_to_portal"
    },
    "setup": {
      "date": "2025-09-26",
      "status": "client_id_obtained"
    }
  },
  "endpoints": {
    "orders": "/orders",
    "webhooks": "/webhooks",
    "payments": "/payments"
  }
}
```

---

## 7. NETWORK CONFIGURATION CONSTANTS

### Supported Blockchain Networks

```typescript
// EVM Networks (from multiChainNetworks.ts)
const NETWORK_CONFIGS = {
  ETHEREUM_SEPOLIA: {
    chainId: 11155111,
    rpcUrl: "https://sepolia.infura.io/v3/",
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
  },
  ARBITRUM_SEPOLIA: {
    chainId: 421614,
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    usdcAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"
  },
  BASE_SEPOLIA: {
    chainId: 84532,
    rpcUrl: "https://sepolia.base.org",
    usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
  },
  OP_SEPOLIA: {
    chainId: 11155420,
    rpcUrl: "https://sepolia.optimism.io",
    usdcAddress: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7"
  },
  AVALANCHE_FUJI: {
    chainId: 43113,
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    usdcAddress: "0x5425890298aed601595a70AB815c96711a31Bc65"
  },
  POLYGON_AMOY: {
    chainId: 80002,
    rpcUrl: "https://rpc-amoy.polygon.technology",
    usdcAddress: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"
  },
  HEDERA_TESTNET: {
    chainId: 296,
    rpcUrl: "https://testnet.hashio.io/api",
    usdcAddress: "0.0.7218375" // USDh token ID
  },
  SOLANA_DEVNET: {
    chainId: "devnet",
    rpcUrl: "https://api.devnet.solana.com",
    usdcMint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
  }
};
```

### Custom Stablecoins (Hedera)

```typescript
const HEDERA_STABLECOINS = [
  "USDh",     // Primary stablecoin
  "USDΔ",     // Delta variant
  "USDaix",   // AIX variant
  "USDΔ+",    // Delta plus
  "USDaix+",  // AIX plus
  "USDar",    // AR variant
  "USDair"    // Air variant
];
```

---

## 8. DEVELOPMENT CONFIGURATION

### Vite Development Server

```typescript
// vite.config.ts - Development server configuration
const DEV_CONFIG = {
  server: {
    port: 5174,
    strictPort: true,
    allowedHosts: [
      "6529c4b46a03.ngrok-free.app",
      "8323ecb51478.ngrok-free.app",
      "8ac2a20e77ca.ngrok-free.app",
      "e07b521b8735.ngrok-free.app"
    ],
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://6529c4b46a03.ngrok-free.app",
        "https://8323ecb51478.ngrok-free.app",
        "https://8ac2a20e77ca.ngrok-free.app",
        "https://e07b521b8735.ngrok-free.app"
      ],
      credentials: true
    }
  }
};
```

### NGROK Tunnel URLs (Development)

```bash
# Current ngrok tunnels for cross-codespace communication
AGENTSPHERE_BACKEND_URL=https://8323ecb51478.ngrok-free.app
AR_VIEWER_TUNNEL_URL=https://6529c4b46a03.ngrok-free.app
BACKUP_TUNNEL_1=https://8ac2a20e77ca.ngrok-free.app
BACKUP_TUNNEL_2=https://e07b521b8735.ngrok-free.app
```

---

## 9. PRODUCTION AGENT INSTANCES

### Deployed Production Agents (Hedera Testnet)

```yaml
Travel_Agent_Coordinator:
  name: "My Hedera Travel Agent 1"
  hedera_account: "0.0.7301232"
  did: "did:hedera:testnet:0.0.7301232"
  fee: "625 USDH"
  identity_nft_tx: "0x04beefb4e8d16246e7bef4892d318fdaf75efdefc417771720a9d23766a8ed58"
  verification_url: "https://hashscan.io/testnet/account/0.0.7301232"

Bus_Agent:
  name: "Hedera AI Bus 2"
  hedera_account: "0.0.7299550"
  did: "did:hedera:testnet:0.0.7299550"
  fee: "1000 USDH"
  identity_nft_tx: "0x13ef328ce59d2be1c69388a8ec2fe02f53ad0d4a01557c7a54b7204b5ef0fd70"
  verification_url: "https://hashscan.io/testnet/account/0.0.7299550"

Train_Agent:
  name: "Hedera Train 1"
  hedera_account: "0.0.7300963"
  did: "did:hedera:testnet:0.0.7300963"
  fee: "1500 USDH"
  identity_nft_tx: "0xe698be655a81032a36dfb37198cfafc311cb7a10452d3c988ab42cbce5eb3f93"
  verification_url: "https://hashscan.io/testnet/account/0.0.7300963"

Hotel_Agent:
  name: "Hedera Hotel Agent 1"
  hedera_account: "0.0.7300950"
  did: "did:hedera:testnet:0.0.7300950"
  fee: "1200 USDH"
  identity_nft_tx: "0x6cc9f647253353c7b10fb11c24e55714ff8ebfc5890742f8886808bed7b5173f"
  verification_url: "https://hashscan.io/testnet/account/0.0.7300950"

Identity_Registry_Contract: "0x91465109a685abc19ecc94474c0f24bb05045d37"
Hedera_Contract_ID: "0.0.7299955"
```

---

## 10. API ENDPOINTS & WEBHOOK URLS

### Backend API Endpoints

```yaml
Health_Check: "GET /api/health"
Revolut_Bank_QR: "POST /api/revolut/create-bank-order"
Revolut_Virtual_Card: "POST /api/revolut/process-virtual-card-payment"
Revolut_Webhook: "POST /api/revolut/webhook"
Agent_List: "GET /api/agents"
Create_Agent: "POST /api/agents"
Update_Agent: "PUT /api/agents/:id"
Delete_Agent: "DELETE /api/agents/:id"
Payment_Session_Status: "GET /api/payment-sessions/:id"
```

### Webhook Configuration

```yaml
Revolut_Webhook_URL: "https://8323ecb51478.ngrok-free.app/api/revolut/webhook"
Payment_Status_Callback: "https://8323ecb51478.ngrok-free.app/api/payment-callback"
Agent_Status_Updates: "https://8323ecb51478.ngrok-free.app/api/agent-status"
```

---

## 11. SECURITY NOTES

### 🔐 Private Keys & Secrets

**CRITICAL - These are real private keys and should be rotated before production:**

1. **Hedera Private Key:** `3030020100300706052b8104000a04220420d52cb0af6dfb5427be7a610c3d84122c960be00459d5c101ce9a41fa63b681c7`
2. **ERC-8004 Contract Key:** `0xd52cb0af6dfb5427be7a610c3d84122c960be00459d5c101ce9a41fa63b681c7`
3. **Revolut API Secret:** `sk_ZXzrNQBu3jAgK310spMgznoZxqclcsIP7BdZmUXo-UYMAfAfbX_ANT0mZokp12st`
4. **ThirdWeb Secret:** `X2Td-JQsUBzfE7f-go2OjauaMsfN3ygzPzBvpz4eHn00ip5mMZQbWaf7UO4yvELtiNpcNQZknD30aoPh656qyA`

### 🛡️ Security Best Practices

1. **Never commit .env files to git**
2. **Use environment variables or AWS Secrets Manager in production**
3. **Rotate all API keys before going live**
4. **Encrypt sensitive data in database**
5. **Use HTTPS in production**
6. **Implement proper CORS policies**
7. **Add rate limiting to API endpoints**

---

## 12. USAGE INSTRUCTIONS

### For New Monorepo Setup:

1. **Copy relevant sections** to your new .env files
2. **Update Supabase credentials** to point to your new database
3. **Generate new Hedera accounts** for production
4. **Set up new Revolut merchant account** for live payments
5. **Update all webhook URLs** to your production domains
6. **Configure proper CORS policies** for your domains
7. **Set up monitoring and logging** for all services

### Environment File Structure for Monorepo:

```
apps/
├── deployment-app/.env
├── ar-viewer-app/.env
├── api-server/.env
└── admin-dashboard/.env
packages/
└── shared-config/.env.example
```

This comprehensive environment configuration should provide everything needed to recreate the AgentSphere system with all its payment integrations, blockchain connections, and API configurations.