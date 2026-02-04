/**
 * ar_qr_codes Migration File
 * 
 * This migration creates the ar_qr_codes table for tracking
 * QR codes generated for blockchain payments in AR space.
 * 
 * Status: Already defined in schema.sql - run this if needed separately
 */

-- Create ar_qr_codes table
CREATE TABLE IF NOT EXISTS ar_qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Transaction and Payment Info
    transaction_id TEXT NOT NULL UNIQUE,
    qr_code_data TEXT NOT NULL,
    
    -- 3D Positioning in AR Space
    position_x REAL DEFAULT 0,
    position_y REAL DEFAULT 0,
    position_z REAL DEFAULT -2,
    rotation_x REAL DEFAULT 0,
    rotation_y REAL DEFAULT 0,
    rotation_z REAL DEFAULT 0,
    scale REAL DEFAULT 1.5,
    
    -- Geographic Location (Optional)
    latitude REAL,
    longitude REAL,
    altitude REAL,
    
    -- QR Code Status and Lifecycle
    status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'active', 'scanned', 'expired', 'paid')),
    
    -- Agent Relationship
    agent_id UUID REFERENCES deployed_objects(id) ON DELETE CASCADE,
    
    -- Payment Details
    amount INTEGER,
    recipient_address TEXT,
    contract_address TEXT,
    
    -- Network Information
    chain_id TEXT,
    network_name TEXT,
    protocol TEXT CHECK (protocol IN ('ethereum', 'solana', 'hedera', 'bitcoin', 'other')),
    token_address TEXT,
    token_symbol TEXT,
    decimals INTEGER DEFAULT 18,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expiration_time TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '5 minutes'),
    scanned_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    CONSTRAINT valid_expiration CHECK (expiration_time > created_at)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_status 
    ON ar_qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_agent_id 
    ON ar_qr_codes(agent_id);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_expiration 
    ON ar_qr_codes(expiration_time);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_location 
    ON ar_qr_codes(latitude, longitude) WHERE latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_transaction 
    ON ar_qr_codes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_protocol 
    ON ar_qr_codes(protocol);

-- Enable Row Level Security
ALTER TABLE ar_qr_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY IF NOT EXISTS "Allow read access to active QR codes" 
    ON ar_qr_codes FOR SELECT 
    USING (status IN ('active', 'generated'));

CREATE POLICY IF NOT EXISTS "Allow creating QR codes" 
    ON ar_qr_codes FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow updating QR codes" 
    ON ar_qr_codes FOR UPDATE USING (true);

-- Trigger for updated_at
CREATE TRIGGER IF NOT EXISTS update_ar_qr_codes_updated_at 
    BEFORE UPDATE ON ar_qr_codes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to cleanup expired QR codes
CREATE OR REPLACE FUNCTION cleanup_expired_qr_codes()
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE ar_qr_codes 
    SET status = 'expired', updated_at = NOW()
    WHERE status IN ('generated', 'active') 
    AND expiration_time < NOW();
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$ LANGUAGE 'plpgsql';

-- Scheduled job comment (requires pg_cron extension if available)
-- SELECT cron.schedule('cleanup-expired-qr-codes', '*/5 * * * *', 'SELECT cleanup_expired_qr_codes()');
