-- Phase 2 Schema Update for CubePay
-- Adds screen positioning and payment session tracking

-- Add screen_position column to deployed_objects
ALTER TABLE deployed_objects 
ADD COLUMN IF NOT EXISTS screen_position JSONB DEFAULT '{"x": 50, "y": 50, "z_index": 1}'::jsonb;

COMMENT ON COLUMN deployed_objects.screen_position IS 'Screen position using percentage coordinates (0-100 for x,y) and z_index for layering';

-- Create payment_sessions table
CREATE TABLE IF NOT EXISTS payment_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES deployed_objects(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL UNIQUE,
    payment_face TEXT NOT NULL CHECK (payment_face IN ('crypto_qr', 'virtual_card', 'sound_pay', 'voice_pay', 'on_off_ramp', 'ens_payment')),
    amount DECIMAL(20, 8) NOT NULL,
    currency TEXT NOT NULL,
    source_chain TEXT,
    destination_chain TEXT,
    wallet_address TEXT,
    transaction_hash TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    arc_gateway_used BOOLEAN DEFAULT false,
    arc_transfer_time_ms INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create indexes for payment_sessions
CREATE INDEX IF NOT EXISTS idx_payment_sessions_agent_id ON payment_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_session_id ON payment_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON payment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_created_at ON payment_sessions(created_at DESC);

-- Create index for screen_position queries
CREATE INDEX IF NOT EXISTS idx_deployed_objects_screen_position ON deployed_objects USING GIN (screen_position);

-- Create analytics view for payment performance
CREATE OR REPLACE VIEW payment_analytics AS
SELECT 
    payment_face,
    COUNT(*) as total_payments,
    COUNT(*) FILTER (WHERE status = 'completed') as successful_payments,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_payments,
    AVG(arc_transfer_time_ms) FILTER (WHERE arc_gateway_used = true AND status = 'completed') as avg_arc_transfer_time_ms,
    SUM(amount) FILTER (WHERE status = 'completed') as total_volume,
    currency
FROM payment_sessions
GROUP BY payment_face, currency;

-- Function to get agents visible in camera view (using screen_position)
CREATE OR REPLACE FUNCTION get_agents_in_camera_view(
    center_x DECIMAL DEFAULT 50,
    center_y DECIMAL DEFAULT 50,
    view_width DECIMAL DEFAULT 100,
    view_height DECIMAL DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    agent_name TEXT,
    screen_x DECIMAL,
    screen_y DECIMAL,
    z_index INTEGER,
    model_url TEXT,
    payment_enabled BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        do.id,
        do.agent_name,
        (do.screen_position->>'x')::DECIMAL as screen_x,
        (do.screen_position->>'y')::DECIMAL as screen_y,
        (do.screen_position->>'z_index')::INTEGER as z_index,
        do.model_url,
        do.payment_enabled
    FROM deployed_objects do
    WHERE 
        (do.screen_position->>'x')::DECIMAL BETWEEN (center_x - view_width/2) AND (center_x + view_width/2)
        AND (do.screen_position->>'y')::DECIMAL BETWEEN (center_y - view_height/2) AND (center_y + view_height/2)
        AND do.is_active = true
    ORDER BY (do.screen_position->>'z_index')::INTEGER DESC;
END;
$$ LANGUAGE plpgsql;

-- Update trigger for payment_sessions updated_at
CREATE OR REPLACE FUNCTION update_payment_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    IF NEW.status IN ('completed', 'failed', 'cancelled') AND OLD.status NOT IN ('completed', 'failed', 'cancelled') THEN
        NEW.completed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_sessions_updated_at
    BEFORE UPDATE ON payment_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_session_timestamp();

-- Grant permissions (adjust role name as needed)
GRANT SELECT, INSERT, UPDATE ON payment_sessions TO authenticated;
GRANT SELECT ON payment_analytics TO authenticated;
