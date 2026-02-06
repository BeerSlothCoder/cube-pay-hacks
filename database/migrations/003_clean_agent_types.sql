-- Migration: Clean Agent Types - Remove Legacy Confusion
-- Date: 2026-02-06
-- Description: Replace repurposed legacy agent types with clean new types
--
-- Changes:
--   - Remove old constraint with mixed type formats
--   - Add new constraint with clean snake_case types
--   - Delete all existing agents (fresh start)
--
-- New Clean Types:
--   - artm_terminal       (was: home_security / "Virtual Terminal")
--   - pos_terminal        (was: payment_terminal / "Payment Terminal")
--   - my_payment_terminal (was: content_creator / "Content Creator")

-- ============================================
-- STEP 1: Delete all existing agents
-- ============================================
-- This ensures no old type values remain in the database
-- WARNING: This will delete all deployed agents!

DELETE FROM deployed_objects;

-- ============================================
-- STEP 2: Drop old constraint
-- ============================================
-- Remove constraint with old type values

ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_agent_type;
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS deployed_objects_agent_type_check;

-- ============================================
-- STEP 3: Add new clean constraint
-- ============================================
-- Only allow clean snake_case agent types

ALTER TABLE deployed_objects ADD CONSTRAINT valid_agent_type CHECK (
  agent_type IS NULL OR agent_type IN (
    -- Payment & Transaction Agents
    'artm_terminal',           -- Virtual ATM (ARTM)
    'pos_terminal',            -- Payment Terminal - POS
    'my_payment_terminal',     -- My Payment Terminal (Personal)
    
    -- Other Agent Types (if applicable)
    'intelligent_assistant',
    'local_services',
    'escrow_manager',
    'nft_marketplace',
    'decentralized_storage',
    'crypto_wallet',
    'defi_aggregator',
    'prediction_market',
    'dao_governance'
  )
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after migration to verify success:

-- 1. Check constraint exists
-- SELECT constraint_name, check_clause 
-- FROM information_schema.check_constraints 
-- WHERE constraint_name = 'valid_agent_type';

-- 2. Verify no old agents remain
-- SELECT COUNT(*) FROM deployed_objects;
-- (Should return 0)

-- 3. Test constraint with valid type
-- INSERT INTO deployed_objects (agent_name, agent_type, positioning_mode, latitude, longitude)
-- VALUES ('Test POS', 'pos_terminal', 'gps', 50.0, 14.0);

-- 4. Test constraint rejects invalid type (should fail)
-- INSERT INTO deployed_objects (agent_name, agent_type, positioning_mode, latitude, longitude)
-- VALUES ('Test Invalid', 'payment_terminal', 'gps', 50.0, 14.0);

-- ============================================
-- ROLLBACK (if needed)
-- ============================================
-- If something goes wrong, roll back to old constraint:
--
-- ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_agent_type;
-- ALTER TABLE deployed_objects ADD CONSTRAINT valid_agent_type CHECK (
--   agent_type IS NULL OR agent_type IN (
--     'home_security',
--     'payment_terminal',
--     'content_creator'
--   )
-- );

-- ============================================
-- NOTES
-- ============================================
-- Frontend Changes Required:
--   - Updated: apps/deploy-cube/src/components/DeployObject.tsx (✅ DONE)
--   - Updated: apps/cube-viewer/src/utils/agentTypeMapping.ts (✅ DONE)
--   - Updated: apps/cube-viewer/src/hooks/useNearbyCubes.ts (✅ DONE)
--   - Updated: apps/cube-viewer/src/components/AgentOverlay.tsx (✅ DONE)
--
-- Backward Compatibility:
--   - normalizeAgentType() handles legacy types automatically
--   - Old database values will be converted on-the-fly in frontend
--   - After migration, only new types will be stored
