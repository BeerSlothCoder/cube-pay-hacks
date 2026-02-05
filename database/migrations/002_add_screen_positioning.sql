-- =====================================================
-- MIGRATION: Add Dual Positioning System (Screen + GPS)
-- =====================================================
-- Description:
--   Adds support for screen-based positioning (percentage coordinates)
--   alongside existing GPS positioning. Enables agents to be placed either:
--   1. In physical world (GPS: latitude/longitude)
--   2. On screen overlay (percentage: 0-100% x/y)
-- =====================================================

-- =====================================================
-- STEP 1: Add new columns to deployed_objects
-- =====================================================

ALTER TABLE deployed_objects
ADD COLUMN IF NOT EXISTS screen_position_x DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS screen_position_y DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS positioning_mode TEXT DEFAULT 'gps' 
    CHECK (positioning_mode IN ('gps', 'screen'));

-- =====================================================
-- STEP 2: Create index for positioning_mode queries
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_deployed_objects_positioning_mode 
    ON deployed_objects (positioning_mode)
    WHERE positioning_mode = 'screen';

-- =====================================================
-- STEP 3: Create composite index for screen positions
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_deployed_objects_screen_position
    ON deployed_objects (screen_position_x, screen_position_y)
    WHERE positioning_mode = 'screen';

-- =====================================================
-- STEP 4: Add validation constraint for screen positions
-- =====================================================

ALTER TABLE deployed_objects
ADD CONSTRAINT screen_position_range_check 
    CHECK (
        (positioning_mode = 'gps') OR
        (positioning_mode = 'screen' AND 
         screen_position_x >= 0 AND screen_position_x <= 100 AND
         screen_position_y >= 0 AND screen_position_y <= 100)
    );

-- =====================================================
-- STEP 5: Add constraint to ensure positioning mode consistency
-- =====================================================

ALTER TABLE deployed_objects
ADD CONSTRAINT screen_positioning_consistency_check 
    CHECK (
        -- If screen mode, must have screen coordinates
        (positioning_mode = 'screen' AND screen_position_x IS NOT NULL AND screen_position_y IS NOT NULL) OR
        -- If GPS mode (or null/default), GPS coordinates must be present
        ((positioning_mode IS NULL OR positioning_mode = 'gps') AND latitude IS NOT NULL AND longitude IS NOT NULL)
    );

-- =====================================================
-- STEP 6: Add comment for documentation
-- =====================================================

COMMENT ON COLUMN deployed_objects.screen_position_x IS 'Horizontal position as percentage (0-100) when positioning_mode=screen. 0 = left edge, 100 = right edge';

COMMENT ON COLUMN deployed_objects.screen_position_y IS 'Vertical position as percentage (0-100) when positioning_mode=screen. 0 = top edge, 100 = bottom edge';

COMMENT ON COLUMN deployed_objects.positioning_mode IS 'Positioning mode: "gps" for physical world placement (latitude/longitude) or "screen" for on-screen placement (screen_position_x/y percentages)';

-- =====================================================
-- STEP 7: Create view for screen-positioned agents (convenience)
-- =====================================================

CREATE OR REPLACE VIEW screen_positioned_agents AS
SELECT
    id,
    user_id,
    name,
    agent_type,
    screen_position_x,
    screen_position_y,
    positioning_mode,
    is_active,
    created_at,
    updated_at
FROM deployed_objects
WHERE positioning_mode = 'screen' AND is_active = true
ORDER BY created_at DESC;

COMMENT ON VIEW screen_positioned_agents IS 'Convenience view showing only screen-positioned active agents';

-- =====================================================
-- STEP 8: Create view for GPS-positioned agents (convenience)
-- =====================================================

CREATE OR REPLACE VIEW gps_positioned_agents AS
SELECT
    id,
    user_id,
    name,
    agent_type,
    latitude,
    longitude,
    altitude,
    preciselatitude,
    preciselongitude,
    precisealtitude,
    positioning_mode,
    is_active,
    created_at,
    updated_at
FROM deployed_objects
WHERE (positioning_mode IS NULL OR positioning_mode = 'gps') AND is_active = true
ORDER BY created_at DESC;

COMMENT ON VIEW gps_positioned_agents IS 'Convenience view showing only GPS-positioned active agents';

-- =====================================================
-- STEP 9: Migration summary and verification
-- =====================================================

-- Verify columns were added
SELECT 
    'Migration: Add Dual Positioning System' AS migration_name,
    'COMPLETED' AS status,
    NOW() AS migration_time,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name='deployed_objects' AND column_name='screen_position_x') AS screen_position_x_exists,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name='deployed_objects' AND column_name='screen_position_y') AS screen_position_y_exists,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name='deployed_objects' AND column_name='positioning_mode') AS positioning_mode_exists;

-- =====================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =====================================================
-- To rollback this migration, run:
--   ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS screen_positioning_consistency_check;
--   ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS screen_position_range_check;
--   ALTER TABLE deployed_objects DROP COLUMN IF EXISTS positioning_mode;
--   ALTER TABLE deployed_objects DROP COLUMN IF EXISTS screen_position_y;
--   ALTER TABLE deployed_objects DROP COLUMN IF EXISTS screen_position_x;
--   DROP INDEX IF EXISTS idx_deployed_objects_screen_position;
--   DROP INDEX IF EXISTS idx_deployed_objects_positioning_mode;
--   DROP VIEW IF EXISTS screen_positioned_agents;
--   DROP VIEW IF EXISTS gps_positioned_agents;
-- =====================================================
