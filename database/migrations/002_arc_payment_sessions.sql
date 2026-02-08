-- Migration: Add Arc Blockchain & Gateway Integration Fields
-- Date: 2026-02-08
-- Status: Phase 1 Foundation
-- Description: Extends payment_sessions table with complete Arc Blockchain ecosystem fields
--              for settlement tracking, liquidity monitoring, attestation management, and 
--              cross-chain transfer orchestration

BEGIN TRANSACTION;

-- ============================================================================
-- 1. Arc Gateway Fields for payment_sessions Table
-- ============================================================================

ALTER TABLE payment_sessions ADD COLUMN (
  -- Arc Transfer Identification
  arc_enabled BOOLEAN DEFAULT FALSE COMMENT 'Whether transfer was executed via Arc Gateway',
  arc_transfer_id UUID COMMENT 'Unique Circle transfer identifier for tracking',
  
  -- Chain Information
  arc_source_chain INTEGER COMMENT 'Network ID where user initiates transfer from',
  arc_destination_chain INTEGER COMMENT 'Network ID where funds are received',
  
  -- Fee Tracking
  arc_fee_percentage DECIMAL(5, 3) DEFAULT 0.1 COMMENT 'Gateway fee percentage applied',
  arc_fee_amount DECIMAL(20, 8) COMMENT 'Exact fee amount charged in USDC',
  
  -- Settlement Metrics
  arc_settlement_time_ms INTEGER COMMENT 'Milliseconds from initiation to complete settlement',
  
  -- Status & Error Handling
  arc_status VARCHAR(50) COMMENT 'Transfer status: pending|processing|completed|failed',
  arc_error_message TEXT COMMENT 'Error description if arc_status is failed',
  arc_confirmed_at TIMESTAMP COMMENT 'Timestamp when Circle confirmed settlement',
  
  -- Terminal Type Routing (for analytics and flow control)
  terminal_type VARCHAR(50) COMMENT 'Originating terminal: pos|ar_viewer|artm'
);

-- ============================================================================
-- 2. Arc Blockchain Settlement Layer Fields
-- ============================================================================

ALTER TABLE payment_sessions ADD COLUMN (
  -- Arc Blockchain Settlement Authority
  arc_blockchain_tx_id VARCHAR(255) COMMENT 'Arc settlement transaction ID on Arc Blockchain',
  arc_settlement_epoch INTEGER COMMENT 'Settlement batch epoch on Arc Blockchain',
  arc_settlement_finality_time_ms INTEGER COMMENT 'Time to reach settlement finality on Arc',
  
  -- Burn & Mint Proofs
  arc_burn_proof_hash VARCHAR(255) COMMENT 'Hash of burn event on source chain',
  arc_mint_proof_hash VARCHAR(255) COMMENT 'Hash of mint event on destination chain',
  
  -- Confirmation & Attestation
  arc_confirmation_depth INTEGER COMMENT 'Number of block confirmations on Arc Blockchain',
  arc_attestation_list JSONB COMMENT 'Array of Circle attester signatures and metadata',
  arc_attestation_count INTEGER COMMENT 'Number of attesters that verified this transfer (typically 3-5)',
  
  -- CCTP Mechanics
  arc_cctp_burn_tx_hash VARCHAR(255) COMMENT 'CCTP source chain burn transaction hash',
  arc_cctp_mint_tx_hash VARCHAR(255) COMMENT 'CCTP destination chain mint transaction hash',
  arc_cctp_attestation_hash VARCHAR(255) COMMENT 'CCTP attestation hash from Circle',
  
  -- Arc Liquidity Management
  arc_liquidity_pool_source VARCHAR(255) COMMENT 'Arc liquidity pool address on source chain',
  arc_liquidity_pool_dest VARCHAR(255) COMMENT 'Arc liquidity pool address on destination chain',
  arc_liquidity_reserved_amount DECIMAL(20, 8) COMMENT 'Amount reserved from Arc pool',
  
  -- Monitoring & Tracking
  arc_blockchain_subscribed BOOLEAN DEFAULT TRUE COMMENT 'Subscribed to Arc settlement events',
  arc_blockchain_confirmed_at TIMESTAMP COMMENT 'When Arc Blockchain finalized settlement',
  arc_last_status_check_at TIMESTAMP COMMENT 'Last time we queried Arc settlement status'
);

-- Comment on extended table
COMMENT ON TABLE payment_sessions IS 
  'Tracks all payments including Arc Gateway CCTP transfers and Arc Blockchain settlements. Schema extended Feb 8, 2026 with full Arc ecosystem support.';

-- ============================================================================
-- 3. Performance Indexes for Arc Queries
-- ============================================================================

-- Index 1: Find all Arc-enabled payments
CREATE INDEX idx_payment_sessions_arc_enabled 
  ON payment_sessions(arc_enabled) 
  WHERE arc_enabled = true 
  COMMENT 'Optimizes Arc payment reporting queries';

-- Index 2: Look up payments by Circle transfer ID
CREATE INDEX idx_payment_sessions_arc_transfer_id 
  ON payment_sessions(arc_transfer_id) 
  WHERE arc_transfer_id IS NOT NULL 
  COMMENT 'Enables rapid Circle transfer lookup';

-- Index 3: Arc Blockchain transaction lookup
CREATE INDEX idx_payment_sessions_arc_blockchain_tx_id
  ON payment_sessions(arc_blockchain_tx_id)
  WHERE arc_blockchain_tx_id IS NOT NULL
  COMMENT 'Enables Arc settlement transaction lookup';

-- Index 4: Terminal type analytics
CREATE INDEX idx_payment_sessions_terminal_type 
  ON payment_sessions(terminal_type) 
  WHERE terminal_type IS NOT NULL 
  COMMENT 'Supports terminal-based analytics and metrics';

-- Index 5: Arc status for pending/failed transfers
CREATE INDEX idx_payment_sessions_arc_status 
  ON payment_sessions(arc_status) 
  WHERE arc_status IN ('pending', 'processing', 'failed') 
  COMMENT 'Identifies transfers needing attention';

-- Index 6: Composite index for Arc chain pair analysis
CREATE INDEX idx_payment_sessions_arc_chain_pair 
  ON payment_sessions(arc_source_chain, arc_destination_chain, arc_status) 
  WHERE arc_enabled = true 
  COMMENT 'Optimizes cross-chain flow analysis';

-- Index 7: Arc settlement epoch tracking (for batch analysis)
CREATE INDEX idx_payment_sessions_arc_settlement_epoch
  ON payment_sessions(arc_settlement_epoch, arc_blockchain_confirmed_at)
  WHERE arc_settlement_epoch IS NOT NULL
  COMMENT 'Enables settlement batch analysis and debugging';

-- Index 8: Arc attestation tracking (for verification)
CREATE INDEX idx_payment_sessions_arc_attestation_count
  ON payment_sessions(arc_attestation_count, arc_status)
  WHERE arc_attestation_count > 0
  COMMENT 'Tracks attestation completeness for settlements';

-- ============================================================================
-- 4. Agent Arc Preferences Table Extension
-- ============================================================================

ALTER TABLE agents ADD COLUMN (
  -- Arc Routing Preferences
  arc_preferred_chain INTEGER COMMENT 'Preferred destination chain ID for incoming payments',
  arc_accepted_source_chains JSONB COMMENT 'JSON array of chain IDs agent accepts payments from',
  
  -- Arc Limits & Controls
  arc_max_cross_chain_daily_usdc DECIMAL(20, 8) COMMENT 'Daily limit for cross-chain receive volume',
  arc_require_settlement_confirmation BOOLEAN DEFAULT FALSE COMMENT 'Require manual confirmation for large transfers',
  
  -- Arc Liquidity Preferences
  arc_preferred_liquidity_pool VARCHAR(255) COMMENT 'Preferred Arc liquidity pool for receiving payments',
  arc_emergency_withdrawal_chain INTEGER COMMENT 'Emergency fallback chain for withdrawals'
);

-- ============================================================================
-- 5. Arc Blockchain Status Tracking Table (New)
-- ============================================================================

CREATE TABLE IF NOT EXISTS arc_blockchain_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Settlement Information
  settlement_epoch INTEGER NOT NULL,
  settlement_status VARCHAR(50) NOT NULL, -- pending|finalizing|finalized|failed
  settlement_timestamp TIMESTAMP NOT NULL,
  
  -- Arc Blockchain Data
  arc_block_height INTEGER,
  arc_confirmation_count INTEGER,
  arc_transaction_count INTEGER,
  
  -- Liquidity Information
  total_settled_usdc DECIMAL(20, 8),
  total_fees_collected DECIMAL(20, 8),
  
  -- Monitoring
  monitored BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_arc_blockchain_status_epoch ON arc_blockchain_status(settlement_epoch);
CREATE INDEX idx_arc_blockchain_status_status ON arc_blockchain_status(settlement_status);

-- ============================================================================
-- 6. Documentation Comments
-- ============================================================================

COMMENT ON COLUMN payment_sessions.arc_blockchain_tx_id IS 
  'Links to specific Arc Blockchain settlement transaction for auditability and debugging';

COMMENT ON COLUMN payment_sessions.arc_settlement_epoch IS 
  'Groups payments in settlement batches for analytics and batch verification';

COMMENT ON COLUMN payment_sessions.arc_attestation_list IS 
  'JSON structure: [{"attester": "address", "signature": "hex", "timestamp": "ISO8601"}, ...]';

COMMENT ON COLUMN payment_sessions.arc_confirmation_depth IS 
  'Number of Arc Blockchain confirmations; settlement is final after 6+ confirmations';

-- ============================================================================
-- Rollback Instructions (if needed):
-- ============================================================================
-- BEGIN TRANSACTION;
-- DROP TABLE IF EXISTS arc_blockchain_status;
-- DROP INDEX IF EXISTS idx_arc_blockchain_status_status;
-- DROP INDEX IF EXISTS idx_arc_blockchain_status_epoch;
-- DROP INDEX idx_payment_sessions_arc_attestation_count;
-- DROP INDEX idx_payment_sessions_arc_settlement_epoch;
-- DROP INDEX idx_payment_sessions_arc_chain_pair;
-- DROP INDEX idx_payment_sessions_arc_status;
-- DROP INDEX idx_payment_sessions_terminal_type;
-- DROP INDEX idx_payment_sessions_arc_blockchain_tx_id;
-- DROP INDEX idx_payment_sessions_arc_transfer_id;
-- DROP INDEX idx_payment_sessions_arc_enabled;
-- ALTER TABLE agents DROP COLUMN arc_emergency_withdrawal_chain;
-- ALTER TABLE agents DROP COLUMN arc_preferred_liquidity_pool;
-- ALTER TABLE agents DROP COLUMN arc_require_settlement_confirmation;
-- ALTER TABLE agents DROP COLUMN arc_max_cross_chain_daily_usdc;
-- ALTER TABLE agents DROP COLUMN arc_accepted_source_chains;
-- ALTER TABLE agents DROP COLUMN arc_preferred_chain;
-- ALTER TABLE payment_sessions DROP COLUMN arc_last_status_check_at;
-- ALTER TABLE payment_sessions DROP COLUMN arc_blockchain_confirmed_at;
-- ALTER TABLE payment_sessions DROP COLUMN arc_blockchain_subscribed;
-- ALTER TABLE payment_sessions DROP COLUMN arc_liquidity_reserved_amount;
-- ALTER TABLE payment_sessions DROP COLUMN arc_liquidity_pool_dest;
-- ALTER TABLE payment_sessions DROP COLUMN arc_liquidity_pool_source;
-- ALTER TABLE payment_sessions DROP COLUMN arc_cctp_attestation_hash;
-- ALTER TABLE payment_sessions DROP COLUMN arc_cctp_mint_tx_hash;
-- ALTER TABLE payment_sessions DROP COLUMN arc_cctp_burn_tx_hash;
-- ALTER TABLE payment_sessions DROP COLUMN arc_attestation_count;
-- ALTER TABLE payment_sessions DROP COLUMN arc_attestation_list;
-- ALTER TABLE payment_sessions DROP COLUMN arc_confirmation_depth;
-- ALTER TABLE payment_sessions DROP COLUMN arc_mint_proof_hash;
-- ALTER TABLE payment_sessions DROP COLUMN arc_burn_proof_hash;
-- ALTER TABLE payment_sessions DROP COLUMN arc_settlement_finality_time_ms;
-- ALTER TABLE payment_sessions DROP COLUMN arc_settlement_epoch;
-- ALTER TABLE payment_sessions DROP COLUMN arc_blockchain_tx_id;
-- ALTER TABLE payment_sessions DROP COLUMN terminal_type;
-- ALTER TABLE payment_sessions DROP COLUMN arc_confirmed_at;
-- ALTER TABLE payment_sessions DROP COLUMN arc_error_message;
-- ALTER TABLE payment_sessions DROP COLUMN arc_status;
-- ALTER TABLE payment_sessions DROP COLUMN arc_settlement_time_ms;
-- ALTER TABLE payment_sessions DROP COLUMN arc_fee_amount;
-- ALTER TABLE payment_sessions DROP COLUMN arc_fee_percentage;
-- ALTER TABLE payment_sessions DROP COLUMN arc_destination_chain;
-- ALTER TABLE payment_sessions DROP COLUMN arc_source_chain;
-- ALTER TABLE payment_sessions DROP COLUMN arc_transfer_id;
-- ALTER TABLE payment_sessions DROP COLUMN arc_enabled;
-- COMMIT;
