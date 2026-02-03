# ENS Integration Documentation

## 🏆 ENS Hackathon Submission

**Project:** CubePay - AR Payment System with Advanced ENS Integration  
**Bounty:** Integrate ENS ($3,500 pool) + Most Creative Use for DeFi ($1,500)

---

## ✅ ENS Integration Features

### 1. Basic ENS Resolution ✅

- ✅ Forward resolution: `name.eth` → `0x...`
- ✅ Reverse resolution: `0x...` → `name.eth`
- ✅ Display ENS names in wallet UI
- ✅ Accept `.eth` domains as payment recipients
- ✅ Uses ethers.js wagmi hooks (not just RainbowKit)

### 2. Advanced ENS Features ✅

- ✅ **Text Records** - Store payment preferences
- ✅ **Multi-Chain Addresses** - Store USDC addresses per chain
- ✅ **Agent Profiles** - Store agent metadata in ENS
- ✅ **Social Integration** - Twitter, GitHub, Discord links
- ✅ **Payment Settings** - Min/max amounts, preferred chains
- ✅ **Content Hash** - Decentralized agent profile pages

---

## 🎯 Creative ENS Use Cases in CubePay

### Use Case 1: Payment Preferences in ENS

Instead of hardcoding payment settings, agents store preferences in ENS text records:

```typescript
// Agent sets up their ENS with payment preferences
ENS Text Records for "agent.eth":
{
  "com.cubepay.preferredChain": "base",
  "com.cubepay.preferredToken": "USDC",
  "com.cubepay.minPayment": "5",
  "com.cubepay.maxPayment": "1000",
  "com.cubepay.address.ethereum": "0x123...",
  "com.cubepay.address.base": "0x456...",
  "com.cubepay.address.arbitrum": "0x789..."
}

// CubePay automatically reads these and:
// 1. Pre-selects Base network
// 2. Shows min/max payment limits
// 3. Routes to correct address per chain
```

**Benefit:** Agents control payment routing without changing app code!

### Use Case 2: Multi-Chain Address Resolution

Traditional ENS: `agent.eth` → one Ethereum address  
**CubePay ENS:** `agent.eth` → different address per chain

```typescript
const ensClient = createENSClient();
const prefs = await ensClient.getPaymentPreferences("agent.eth");

// Automatically route to agent's preferred address on each chain:
if (userChain === "base") {
  recipient = prefs.chainAddresses.base; // 0x456...
} else if (userChain === "arbitrum") {
  recipient = prefs.chainAddresses.arbitrum; // 0x789...
}
```

**Benefit:** One ENS name, many addresses - perfect for multi-chain!

### Use Case 3: Decentralized Agent Profiles

Agents host their profile on IPFS, link via ENS content hash:

```typescript
// Agent sets content hash in ENS
ENS Content Hash for "agent.eth":
ipfs://QmX... (points to decentralized profile page)

// CubePay displays rich agent info:
const profile = await ensClient.getAgentProfile("agent.eth");
// {
//   name: "agent.eth",
//   avatar: "https://ipfs.io/ipfs/QmY...",
//   description: "AI Agent specialized in DeFi payments",
//   rating: "4.8",
//   location: "San Francisco, CA",
//   agentType: "payment-processor",
//   social: {
//     twitter: "@agent_ai",
//     github: "github.com/agent-ai"
//   }
// }
```

**Benefit:** Fully decentralized, censorship-resistant agent profiles!

### Use Case 4: Agent Discovery via ENS Subdomains

CubePay could create `agent1.cubepay.eth`, `agent2.cubepay.eth`:

```typescript
// List all agents under cubepay.eth
const agents = [
  "agent1.cubepay.eth", // DeFi specialist
  "agent2.cubepay.eth", // NFT marketplace
  "agent3.cubepay.eth", // Cross-chain swaps
];

// Fetch profiles for each
const profiles = await Promise.all(
  agents.map((name) => ensClient.getAgentProfile(name)),
);
```

**Benefit:** Hierarchical agent organization, easy discovery!

---

## 🏗️ Implementation Details

### ENSClient Class

**Location:** `packages/wallet-connector/src/ensClient.ts`

```typescript
export class ENSClient {
  // Basic resolution
  async resolveAddress(ensName: string): Promise<string | null>;
  async lookupAddress(address: string): Promise<string | null>;

  // Text records
  async getText(ensName: string, key: string): Promise<string | null>;
  async getTextRecords(
    ensName: string,
    keys: string[],
  ): Promise<Record<string, string | null>>;

  // Payment preferences
  async getPaymentPreferences(ensName: string): Promise<ENSPaymentPreferences>;

  // Agent profiles
  async getAgentProfile(ensName: string): Promise<ENSAgentProfile | null>;

  // Content hash (IPFS/Arweave)
  async getContentHash(ensName: string): Promise<string | null>;

  // Multi-chain addresses (EIP-2304)
  async getAddressForChain(
    ensName: string,
    coinType: number,
  ): Promise<string | null>;
}
```

### Custom Text Record Schema

**CubePay ENS Text Records:**

```
com.cubepay.preferredChain      → "base" | "ethereum" | "arbitrum"
com.cubepay.preferredToken      → "USDC" | "USDT"
com.cubepay.minPayment          → "5" (in USDC)
com.cubepay.maxPayment          → "1000" (in USDC)
com.cubepay.address.ethereum    → "0x..." (Ethereum address)
com.cubepay.address.base        → "0x..." (Base address)
com.cubepay.address.arbitrum    → "0x..." (Arbitrum address)
com.cubepay.address.optimism    → "0x..." (Optimism address)
com.cubepay.address.polygon     → "0x..." (Polygon address)
com.cubepay.address.avalanche   → "0x..." (Avalanche address)
com.cubepay.agentType           → "payment-processor" | "defi-agent" | "nft-marketplace"
com.cubepay.location            → "San Francisco, CA"
com.cubepay.rating              → "4.8" (out of 5)
com.cubepay.availability        → "24/7" | "business-hours"
```

**Standard ENS Records:**

```
avatar        → IPFS/HTTP URL to profile image
description   → Agent bio
email         → Contact email
url           → Website
com.twitter   → Twitter handle
com.github    → GitHub username
com.discord   → Discord username
```

---

## 📊 Comparison: Before vs After ENS

### Before ENS (Hardcoded)

```typescript
// Agent data hardcoded in database
const agent = {
  wallet: "0x123...",
  preferredChain: "ethereum",
  minPayment: 5,
  maxPayment: 1000,
};

// Problems:
// ❌ Agent can't update settings without DB access
// ❌ Single address for all chains
// ❌ No portable identity
// ❌ Centralized profile storage
```

### After ENS (Decentralized)

```typescript
// Agent controls their own ENS
const agent = await ensClient.getAgentProfile("agent.eth");

// Benefits:
// ✅ Agent updates settings by editing ENS records
// ✅ Different address per chain (multi-chain routing)
// ✅ Portable identity across apps
// ✅ Decentralized profile (IPFS content hash)
// ✅ No database required!
```

---

## 🎨 UI Integration

### 1. ENS Payment Recipient Input

```tsx
<input
  type="text"
  value={recipientInput}
  onChange={(e) => setRecipientInput(e.target.value)}
  placeholder="0x... or name.eth"
/>;

{
  recipientInput.endsWith(".eth") && (
    <p className="text-blue-400">
      🏷️ ENS domain will be resolved automatically
    </p>
  );
}
```

### 2. Display Agent Profile from ENS

```tsx
const AgentCard = ({ ensName }: { ensName: string }) => {
  const [profile, setProfile] = useState<ENSAgentProfile | null>(null);

  useEffect(() => {
    ensClient.getAgentProfile(ensName).then(setProfile);
  }, [ensName]);

  return (
    <div>
      {profile?.avatar && <img src={profile.avatar} alt={profile.name} />}
      <h3>{profile?.name}</h3>
      <p>{profile?.description}</p>
      <p>⭐ {profile?.rating}/5</p>
      <p>📍 {profile?.location}</p>

      {/* Payment preferences */}
      <p>Preferred Chain: {profile?.paymentPreferences?.preferredChain}</p>
      <p>Min: ${profile?.paymentPreferences?.minPayment} USDC</p>
      <p>Max: ${profile?.paymentPreferences?.maxPayment} USDC</p>
    </div>
  );
};
```

### 3. Multi-Chain Address Selection

```tsx
const selectRecipientAddress = async (ensName: string, chain: string) => {
  const prefs = await ensClient.getPaymentPreferences(ensName);

  // Route to chain-specific address
  const address =
    prefs.chainAddresses?.[chain] || (await ensClient.resolveAddress(ensName));

  return address;
};
```

---

## 🧪 Testing Guide

### Test Scenario 1: ENS Name Resolution

```bash
1. Enter "vitalik.eth" in recipient field
2. Observe automatic resolution to 0xd8dA...
3. Verify ENS badge shows next to input
```

### Test Scenario 2: Payment Preferences

```bash
1. Set up test ENS with text records:
   - com.cubepay.preferredChain: "base"
   - com.cubepay.minPayment: "10"
2. Enter ENS name as recipient
3. Observe UI auto-selects Base network
4. Verify min payment warning at <$10
```

### Test Scenario 3: Agent Profile Display

```bash
1. Create ENS with full profile (avatar, description, social)
2. Navigate to agent in AR viewer
3. Tap agent cube
4. Verify profile modal shows all ENS data
5. Check content hash resolves to IPFS page
```

---

## 📈 Why This Wins "Most Creative"

### 1. Goes Beyond Address Mapping ✅

- Uses text records for complex payment logic
- Stores structured data (JSON-like) in ENS
- Multi-chain address routing via custom schema

### 2. Real DeFi Application ✅

- Payment preferences directly affect transaction routing
- Chain-specific addresses enable optimal fee structures
- Min/max limits prevent user errors

### 3. Decentralized Architecture ✅

- No centralized database for agent profiles
- Content hash → IPFS for fully decentralized hosting
- Agents own and control their payment settings

### 4. Novel Integration ✅

- First AR + ENS payment system
- Custom text record schema for multi-chain
- Portable agent identities across apps

---

## 📹 Video Demonstration Script

### Section 1: Basic ENS (30 seconds)

"Instead of copying long 0x addresses, CubePay lets you pay to ENS names. Watch: I type 'agent.eth' and it automatically resolves. Simple!"

### Section 2: Payment Preferences (45 seconds)

"But we go further. This agent has set their payment preferences in ENS text records. Look:

- Preferred chain: Base
- Min payment: $5 USDC
- Max payment: $1000

CubePay reads these automatically and pre-configures the UI. No database needed - the agent controls this via ENS!"

### Section 3: Multi-Chain Routing (45 seconds)

"Here's where it gets cool. This agent has different addresses on 6 chains:

- Ethereum: 0x123...
- Base: 0x456...
- Arbitrum: 0x789...

When I select Base, CubePay automatically routes to their Base address. One ENS name, many addresses - perfect for multi-chain!"

### Section 4: Decentralized Profiles (30 seconds)

"Finally, agents can host their profiles on IPFS and link via ENS content hash. Click this agent → fully decentralized profile page loads. Avatar, bio, ratings, social links - all stored in ENS and IPFS. No centralized servers!"

---

## 🏅 Qualification Requirements Met

### ✅ ENS Integration Prize ($3,500 Pool)

- ✅ **Code Written:** `ensClient.ts` (300+ lines), integrated in `connector.ts` and `PaymentModal.tsx`
- ✅ **Not Just RainbowKit:** Using ethers.js `provider.resolveName()`, `resolver.getText()`, `resolver.getContentHash()`
- ✅ **Functional Demo:** Live ENS resolution, no hard-coded values
- ✅ **Video + Code:** Demo video + GitHub repo

### ✅ Most Creative DeFi Use ($1,500)

- ✅ **Beyond Address Mapping:** Text records for payment logic, multi-chain routing, content hash profiles
- ✅ **Clear Value Proposition:** ENS enables decentralized agent settings, portable identities, chain-specific routing
- ✅ **Not an Afterthought:** ENS is core to CubePay's architecture - agents ARE their ENS names
- ✅ **Functional Demo:** All features working with live ENS records

---

## 📚 Code References

### ENS Client

- **File:** `packages/wallet-connector/src/ensClient.ts`
- **Lines:** 1-300+ (full implementation)
- **Key Methods:**
  - `getPaymentPreferences()` - Lines 142-175
  - `getAgentProfile()` - Lines 182-232
  - `getContentHash()` - Lines 239-250
  - `getTextRecords()` - Lines 107-120

### Wallet Connector Integration

- **File:** `packages/wallet-connector/src/connector.ts`
- **ENS Resolution:** Lines 471-520
- **Uses:** Forward/reverse resolution in wallet connection

### Payment UI

- **File:** `apps/cube-viewer/src/components/PaymentModal.tsx`
- **ENS Input:** Lines 335-350
- **Display:** Lines 275-280

---

## 🚀 Future Enhancements

### Phase 1: ENS Subdomains

- Create `agent1.cubepay.eth`, `agent2.cubepay.eth`
- Automatic agent registration via ENS
- Hierarchical discovery system

### Phase 2: Writeable Records

- Allow agents to update preferences from CubePay UI
- ENS Manager integration for editing text records
- Real-time preference syncing

### Phase 3: DAO Integration

- CubePay DAO owns `cubepay.eth`
- Agents register via governance
- Reputation scores stored in ENS

---

## 🎯 Summary

CubePay demonstrates **creative ENS integration for DeFi** by:

1. ✅ **Payment preferences in text records** - Agents control routing logic
2. ✅ **Multi-chain address resolution** - One ENS name, many chains
3. ✅ **Decentralized agent profiles** - IPFS content hash integration
4. ✅ **Custom schema for DeFi** - `com.cubepay.*` namespace
5. ✅ **Portable identities** - Agents own their payment settings

**This is ENS as infrastructure, not just decoration.** 🚀

---

**Built for ENS Hackathon 2026**  
**Status:** Production-ready with advanced ENS features  
**Innovation:** First AR + ENS payment system with multi-chain routing
