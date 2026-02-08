-- Migration: Add Arc Gateway Integration Fields
-- Date: 2026-02-08
-- Status: Phase 1 Foundation
-- Description: Extends payment_sessions table with Circle Arc/CCTP metadata fields
--              for cross-chain transfer tracking, fee calculation, and terminal routing

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

-- Comment on entire table extension
COMMENT ON COLUMN payment_sessions.arc_enabled IS 'Core flag: identifies Arc Gateway payments in reporting';
COMMENT ON COLUMN payment_sessions.arc_transfer_id IS 'Links to Circle API transfer records';
COMMENT ON COLUMN payment_sessions.terminal_type IS 'Enables analytics by terminal type';

-- ============================================================================
-- 2. Performance Indexes for Arc Queries
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

-- Index 3: Terminal type analytics
CREATE INDEX idx_payment_sessions_terminal_type 
  ON payment_sessions(terminal_type) 
  WHERE terminal_type IS NOT NULL 
  COMMENT 'Supports terminal-based analytics and metrics';

-- Index 4: Arc status for pending/failed transfers
CREATE INDEX idx_payment_sessions_arc_status 
  ON payment_sessions(arc_status) 
  WHERE arc_status IN ('pending', 'processing', 'failed') 
  COMMENT 'Identifies transfers needing attention';

-- Index 5: Composite index for Arc chain pair analysis
CREATE INDEX idx_payment_sessions_arc_chain_pair 
  ON payment_sessions(arc_source_chain, arc_destination_chain, arc_status) 
  WHERE arc_enabled = true 
  COMMENT 'Optimizes cross-chain flow analysis';

-- ============================================================================
-- 3. Agent Arc Preferences Table Extension
-- ============================================================================

ALTER TABLE agents ADD COLUMN (
  -- Arc Routing Preferences
  arc_preferred_chain INTEGER COMMENT 'Preferred destination chain ID for incoming payments',
  arc_accepted_source_chains JSONB COMMENT 'JSON array of chain IDs agent accepts payments from',
  
  -- Arc Limits & Controls
  arc_max_cross_chain_daily_usdc DECIMAL(20, 8) COMMENT 'Daily limit for cross-chain receive volume',
  arc_require_settlement_confirmation BOOLEAN DEFAULT FALSE COMMENT 'Require manual confirmation for large transfers'
);

-- ============================================================================
-- 4. Documentation Comments
-- ============================================================================

COMMENT ON TABLE payment_sessions IS 
  'Tracks all payments including Arc Gateway CCTP transfers. Schema extended Feb 8, 2026.';

-- ============================================================================
-- 5. Migration Metadata (for tracking)
-- ============================================================================

-- Record migration execution (optional - if you track migrations in DB)
-- INSERT INTO schema_migrations (version, name, executed_at) 
-- VALUES ('002', 'arc_payment_sessions', NOW());

COMMIT;

-- ============================================================================
-- Rollback Instructions (if needed):
-- ============================================================================
-- BEGIN TRANSACTION;
-- DROP INDEX idx_payment_sessions_arc_chain_pair;
-- DROP INDEX idx_payment_sessions_arc_status;
-- DROP INDEX idx_payment_sessions_terminal_type;
-- DROP INDEX idx_payment_sessions_arc_transfer_id;
-- DROP INDEX idx_payment_sessions_arc_enabled;
-- ALTER TABLE agents DROP COLUMN arc_require_settlement_confirmation;
-- ALTER TABLE agents DROP COLUMN arc_max_cross_chain_daily_usdc;
-- ALTER TABLE agents DROP COLUMN arc_accepted_source_chains;
-- ALTER TABLE agents DROP COLUMN arc_preferred_chain;
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
