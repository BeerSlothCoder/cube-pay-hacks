# ARC / CCIP → CCTP / Gateway Conversation Summary

Date: 2026-02-08

This file captures the structured summary of our Arc/CCTP/Gateway vs Chainlink CCIP discussion and the repo investigation that followed.

---

## 1) Chronological Review

- **Phase 1 (Document intake):** Reviewed the existing Arc/CCTP/Gateway integration write-up and its proposed `payment_sessions.arc_*` metadata fields.
- **Phase 2 (User requirements/questions):** Addressed 10 multi-part asks covering MetaMask compatibility, Arc vs CCIP comparison, USDC address verification, whether CCTP and/or Gateway is needed, unified balance + instant transfers, a plan to replace CCIP, proving Arc usage via `payment_sessions`, mapping to POS/MyTerminal/ARTM flows, and clarifying responsibilities between this repo and Agentsphere.
- **Phase 3 (Repo investigation):** Searched the workspace for actual CCIP usage, USDC mappings, and any existing Arc/CCTP client code referenced by the doc.
- **Phase 4 (Findings + guidance):** Confirmed CCIP is currently wired into QR generation + service layers; verified testnet USDC address matches for overlapping networks; noted Arc/CCTP client code referenced in docs was not found in this workspace; noted `arc_*` metadata exists in docs but not confirmed in a DB migration here.
- **Phase 5 (Immediate next steps):** Next intended step was updating the Arc doc with findings; this conversation summary was requested before edits.

---

## 2) Intent Mapping (Explicit Requests)

1. MetaMask compatibility with the intended flow.
2. CCIP vs Arc (CCTP/Gateway) comparison.
3. Verify Arc USDC addresses vs CCIP lanes/config.
4. Whether both CCTP and Gateway are required; what else is needed.
5. Unified balance feasibility.
6. Instant cross-chain transfer feasibility.
7. Create a branch to remove CCIP and integrate CCTP/Gateway instead.
8. Prove Arc usage by writing `arc_*` metadata into `payment_sessions`.
9. Map integration into: POS, MyTerminal, ARTM (virtual ATMs).
10. Clarify what work happens “here” vs “Agentsphere backend”.

---

## 3) Technical Inventory

- **Circle CCTP:** Cross-chain USDC burn/mint + attestation.
- **Circle Gateway:** Higher-level orchestration/product layer for chain abstraction (simplifies UX + routing).
- **Chainlink CCIP:** Current cross-chain rail in this codebase (routers, lanes, fee estimation, message IDs).
- **Wallet UX:** MetaMask (EIP-1193) + EIP-681 URIs used for QR-driven transaction initiation.

---

## 4) Code Archaeology (Key Files Identified)

### In ar-agent-viewer-web-man-US

- `src/components/ARC_BLOCKCHAIN_INTEGRATION_SUMMARY.md`

  - Documentation describing Arc/CCTP/Gateway concepts, addresses, and proposed `payment_sessions.arc_*` metadata.

- `src/config/ccip-config-consolidated.json`

  - Consolidated CCIP chain configuration including USDC addresses for multiple testnets.

- `src/config/ccip-config.json`

  - Similar baseline CCIP configuration.

- `src/services/ccipConfigService.js`

  - CCIP fee estimation and transaction building; includes Router ABI (e.g., `ccipSend`, `getFee`).

- `src/services/dynamicQRService.js`

  - Generates MetaMask-compatible EIP-681 QR payloads for CCIP router calls.

- `src/services/paymentSessionService.js`
  - Frontend calls to Agentsphere backend payment session APIs (fetch/complete/cancel) and supports mock mode.

### In agentsphere-full-web-man-US

- `src/services/crossChainPaymentService.ts`

  - Higher-level cross-chain payment service; CCIP-oriented; execution appears partially mocked/TODO.

- `src/services/multiChainWalletService.ts`
  - Uses cross-chain service for agent payments; part of the payment tracking flow.

---

## 5) Findings (What’s Real vs Documented)

- **MetaMask compatibility:** The current cross-chain UX is already MetaMask-friendly via EIP-681 QR generation and EVM contract calls.
- **CCIP is “real” in this workspace:** Config + router ABI + QR generation are integrated and central to cross-chain payments.
- **Arc/CCTP/Gateway code is not confirmed here:** The doc references files like `packages/wallet-connector/src/circleGateway.ts` and UI config components, but those were not found during the workspace scan (suggesting the doc may be aspirational or from a different repo/workspace).
- **USDC address verification (testnets):** For overlapping testnets (Sepolia/Base Sepolia/Arbitrum Sepolia/OP Sepolia/Avalanche Fuji), the USDC addresses in `ccip-config-consolidated.json` matched those listed in the Arc doc.
- **Polygon difference:** Observed a mismatch driven by **testnet vs mainnet** (e.g., Amoy vs Polygon mainnet USDC address).
- **`payment_sessions.arc_*` schema:** Fields are described in documentation, but an actual DB migration adding these fields was not located in this workspace.

---

## 6) Progress Assessment

### Completed

- Located CCIP integration hotspots (config, fee estimation, QR generation, service layers).
- Verified testnet USDC addresses match between CCIP config and Arc doc for overlapping networks.
- Identified the missing pieces for “proof of Arc usage” (schema + backend writes).

### Pending

- Update the Arc documentation with verified findings.
- Locate/create the DB migration for `payment_sessions.arc_*` fields.
- Implement backend writes/updates (Agentsphere side) to populate `arc_*` metadata.
- Implement actual Circle Gateway / CCTP integration in code (if intended to replace CCIP).

---

## 7) Next Action Candidates

- **Documentation-only next step:** Incorporate verified address comparisons and “what exists vs what’s planned” into the Arc integration doc.
- **Implementation next step:** Add `payment_sessions.arc_*` fields via SQL migration and update the backend session lifecycle to persist Arc/CCTP/Gateway metadata.
- **Migration next step:** Create a dedicated branch and systematically replace CCIP rails (QR generation + fee estimation + execution logic) with Gateway/CCTP equivalents.
