# @cubepay/database-client

Typed Supabase client wrapper for CubePay database operations.

## Features

- ✅ **Type-safe queries** using `@cubepay/types`
- 🗺️ **Geospatial queries** for nearby agents
- 🔄 **Real-time subscriptions** for agents and QR codes
- 📦 **CRUD operations** for agents and QR codes
- 🧹 **Automatic cleanup** of expired QR codes

## Installation

```bash
npm install @cubepay/database-client
```

## Usage

### Initialize Client

```typescript
import { createCubePayDatabase } from "@cubepay/database-client";

const db = createCubePayDatabase(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!,
);
```

### Agent Operations

```typescript
// Get agent by ID
const agent = await db.getAgent("uuid-here");

// Get all agents with filters
const agents = await db.getAllAgents({
  is_active: true,
  agent_type: "travel",
  limit: 20,
});

// Get nearby agents (geospatial query)
const nearby = await db.getNearbyAgents({
  latitude: 40.7128,
  longitude: -74.006,
  radius_km: 5,
  limit: 10,
});

// Create agent
const newAgent = await db.createAgent({
  user_id: "user123",
  name: "Travel Agent",
  latitude: 40.7128,
  longitude: -74.006,
  agent_type: "travel",
});

// Update agent
const updated = await db.updateAgent("uuid-here", {
  name: "Updated Name",
});

// Delete agent (soft delete)
await db.deleteAgent("uuid-here");

// Hard delete
await db.deleteAgent("uuid-here", true);
```

### QR Code Operations

```typescript
// Get QR code by transaction ID
const qr = await db.getQRCode("tx-123");

// Get QR codes with filters
const qrCodes = await db.getQRCodes({
  agent_id: "uuid-here",
  status: "active",
  limit: 50,
});

// Create QR code
const newQR = await db.createQRCode({
  transaction_id: "tx-123",
  qr_code_data: "solana:...",
  agent_id: "uuid-here",
  amount: 1000000,
  protocol: "solana",
});

// Update QR code status
await db.updateQRCodeStatus("tx-123", "scanned");
await db.updateQRCodeStatus("tx-456", "paid");

// Clean up expired QR codes
const cleaned = await db.cleanupExpiredQRCodes();
console.log(`Cleaned ${cleaned} expired QR codes`);
```

### Real-time Subscriptions

```typescript
// Subscribe to QR code updates
const channel = db.subscribeToQRCodes("agent-uuid", (qrCode) => {
  console.log("QR code updated:", qrCode);
  if (qrCode.status === "paid") {
    console.log("Payment received!");
  }
});

// Subscribe to agent updates
const agentChannel = db.subscribeToAgent("agent-uuid", (agent) => {
  console.log("Agent updated:", agent);
});

// Cleanup on unmount
await db.unsubscribe(channel);
```

## API Reference

### `CubePayDatabase`

#### Agent Methods

- `getAgent(id: string)` - Get single agent
- `getAllAgents(filters?: AgentFilters)` - Get all agents with filtering
- `getNearbyAgents(query: NearbyAgentQuery)` - Geospatial query
- `createAgent(agent: Partial<DeployedObject>)` - Create new agent
- `updateAgent(id: string, updates: Partial<DeployedObject>)` - Update agent
- `deleteAgent(id: string, hardDelete?: boolean)` - Delete agent

#### QR Code Methods

- `getQRCode(transactionId: string)` - Get single QR code
- `getQRCodes(filters?: QRCodeFilters)` - Get all QR codes with filtering
- `createQRCode(qrCode: Partial<ARQRCode>)` - Create new QR code
- `updateQRCodeStatus(transactionId, status, metadata?)` - Update QR status
- `cleanupExpiredQRCodes()` - Remove expired QR codes

#### Subscription Methods

- `subscribeToQRCodes(agentId, callback)` - Real-time QR updates
- `subscribeToAgent(agentId, callback)` - Real-time agent updates
- `unsubscribe(channel)` - Clean up subscription

#### Utility Methods

- `getClient()` - Access underlying Supabase client for advanced queries

## Types

All types are re-exported from `@cubepay/types`:

```typescript
import type {
  DeployedObject,
  ARQRCode,
  NearbyAgentQuery,
  AgentFilters,
  QRCodeFilters,
} from "@cubepay/database-client";
```

## License

MIT
