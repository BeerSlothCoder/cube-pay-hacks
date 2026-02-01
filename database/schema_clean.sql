-- =====================================================
-- CUBEPAY COMPLETE DATABASE SCHEMA
-- =====================================================
-- Run this in Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/okzjeufiaeznfyomfenk/sql
-- =====================================================

-- =====================================================
-- TABLE 1: deployed_objects (Main Agent Data)
-- =====================================================
CREATE TABLE IF NOT EXISTS deployed_objects (
    -- Core Identity
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name TEXT,
    description TEXT,
    agent_type TEXT,
    object_type TEXT,
    
    -- Location Data (Required for AR)
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    altitude DOUBLE PRECISION DEFAULT 0.0,
    location_type TEXT DEFAULT 'Street',
    
    -- RTK Enhanced GPS
    preciselatitude DOUBLE PRECISION,
    preciselongitude DOUBLE PRECISION,
    precisealtitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION DEFAULT 10.0,
    correctionapplied BOOLEAN DEFAULT false,
    rtk_enhanced BOOLEAN DEFAULT false,
    rtk_provider TEXT DEFAULT 'GeoNet',
    
    -- AR Configuration
    range_meters INTEGER DEFAULT 25,
    visibility_range INTEGER DEFAULT 25,
    interaction_range INTEGER DEFAULT 15,
    trailing_agent BOOLEAN DEFAULT false,
    ar_notifications BOOLEAN DEFAULT true,
    
    -- 3D Model Configuration
    model_url TEXT,
    model_type TEXT,
    scale_x DOUBLE PRECISION DEFAULT 1.0,
    scale_y DOUBLE PRECISION DEFAULT 1.0,
    scale_z DOUBLE PRECISION DEFAULT 1.0,
    rotation_x DOUBLE PRECISION DEFAULT 0.0,
    rotation_y DOUBLE PRECISION DEFAULT 0.0,
    rotation_z DOUBLE PRECISION DEFAULT 0.0,
    
    -- Payment Configuration (Fixed Fees)
    interaction_fee DECIMAL(10,6) DEFAULT 1.0,
    interaction_fee_usdfc DECIMAL(10,6) DEFAULT 10.0,
    fee_type TEXT DEFAULT 'fixed' CHECK (fee_type IN ('fixed', 'dynamic')),
    currency_type VARCHAR(10) DEFAULT 'USDC',
    token VARCHAR(10) DEFAULT 'USDC',
    token_symbol VARCHAR(10) DEFAULT 'USDC',
    token_address TEXT,
    
    -- Payment Methods (6-Faced Cube System)
    payment_methods JSONB DEFAULT '{}'::jsonb,
    payment_config JSONB DEFAULT '{}'::jsonb,
    
    -- Blockchain Network Configuration
    network TEXT DEFAULT 'ethereum-sepolia',
    chain_id INTEGER DEFAULT 11155111,
    deployment_network JSONB DEFAULT '{}'::jsonb,
    network_config JSONB DEFAULT '{}'::jsonb,
    cross_chain_config JSONB DEFAULT '{}'::jsonb,
    supported_networks JSONB DEFAULT '[]'::jsonb,
    
    -- Wallet Configuration
    owner_wallet TEXT,
    deployer_wallet_address TEXT,
    payment_recipient_address TEXT,
    agent_wallet_address TEXT,
    agent_wallet_type TEXT DEFAULT 'evm_wallet',
    
    -- Blockchain Deployment Tracking
    contract_address TEXT,
    deployment_tx TEXT,
    deployment_block INTEGER,
    gas_used INTEGER,
    
    -- Interaction Capabilities
    chat_enabled BOOLEAN DEFAULT true,
    voice_enabled BOOLEAN DEFAULT false,
    defi_enabled BOOLEAN DEFAULT false,
    text_chat BOOLEAN DEFAULT true,
    voice_chat BOOLEAN DEFAULT false,
    video_chat BOOLEAN DEFAULT false,
    interaction_types TEXT[],
    interaction_methods JSONB,
    
    -- MCP (Model Context Protocol) Integration
    mcp_services JSONB DEFAULT '[]'::jsonb,
    mcp_integrations TEXT[],
    
    -- Hedera AI Agent Kit
    hedera_account_id TEXT,
    hedera_private_key TEXT,
    identity_nft_id TEXT,
    a2a_endpoint TEXT,
    x402_enabled BOOLEAN DEFAULT false,
    
    -- Additional Configuration
    eliza_config JSONB,
    chainlink_config JSONB,
    tokenization_config JSONB,
    
    -- Features and Status
    features TEXT[],
    staking_rewards BOOLEAN DEFAULT false,
    yield_generation BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 2: ar_qr_codes (AR Floating QR Codes)
-- =====================================================
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

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- deployed_objects indexes
CREATE INDEX IF NOT EXISTS idx_deployed_objects_location 
    ON deployed_objects (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_deployed_objects_user_id 
    ON deployed_objects (user_id);
CREATE INDEX IF NOT EXISTS idx_deployed_objects_active 
    ON deployed_objects (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_deployed_objects_agent_type 
    ON deployed_objects (agent_type);
CREATE INDEX IF NOT EXISTS idx_deployed_objects_chain_id 
    ON deployed_objects (chain_id);
CREATE INDEX IF NOT EXISTS idx_deployed_objects_created_at 
    ON deployed_objects (created_at);

-- JSONB indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_deployed_objects_deployment_network 
    ON deployed_objects USING GIN (deployment_network);
CREATE INDEX IF NOT EXISTS idx_deployed_objects_payment_methods 
    ON deployed_objects USING GIN (payment_methods);
CREATE INDEX IF NOT EXISTS idx_deployed_objects_mcp_services 
    ON deployed_objects USING GIN (mcp_services) WHERE mcp_services IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deployed_objects_supported_networks 
    ON deployed_objects USING GIN (supported_networks);

-- ar_qr_codes indexes
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

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE deployed_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_qr_codes ENABLE ROW LEVEL SECURITY;

-- deployed_objects policies
CREATE POLICY "Anyone can read deployed objects" 
    ON deployed_objects FOR SELECT TO public USING (true);

CREATE POLICY "Users can insert objects" 
    ON deployed_objects FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Users can update their own objects" 
    ON deployed_objects FOR UPDATE TO public 
    USING (true) WITH CHECK (true);

CREATE POLICY "Users can delete their own objects" 
    ON deployed_objects FOR DELETE TO public USING (true);

-- ar_qr_codes policies
CREATE POLICY "Allow read access to active QR codes" 
    ON ar_qr_codes FOR SELECT 
    USING (status IN ('active', 'generated'));

CREATE POLICY "Allow creating QR codes" 
    ON ar_qr_codes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow updating QR codes" 
    ON ar_qr_codes FOR UPDATE USING (true);

-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_deployed_objects_updated_at 
    BEFORE UPDATE ON deployed_objects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ar_qr_codes_updated_at 
    BEFORE UPDATE ON ar_qr_codes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired QR codes
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

-- Function to get agents by network
CREATE OR REPLACE FUNCTION get_agents_by_network(target_chain_id INTEGER)
RETURNS TABLE(
    id UUID,
    name TEXT,
    description TEXT,
    location JSONB,
    agent_type TEXT,
    primary_network JSONB,
    network_deployment JSONB,
    interaction_fee_usdfc DECIMAL,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        do.id,
        do.name,
        do.description,
        jsonb_build_object(
            'latitude', do.latitude,
            'longitude', do.longitude,
            'altitude', do.altitude
        ),
        do.agent_type,
        do.deployment_network->'primary',
        CASE
            WHEN (do.deployment_network->'primary'->>'chainId')::INTEGER = target_chain_id
            THEN do.deployment_network->'primary'
            ELSE (
                SELECT nd
                FROM jsonb_array_elements(do.deployment_network->'additional') AS nd
                WHERE (nd->>'chainId')::INTEGER = target_chain_id
                LIMIT 1
            )
        END,
        do.interaction_fee_usdfc,
        do.created_at
    FROM deployed_objects do
    WHERE
        do.supported_networks @> jsonb_build_array(target_chain_id::TEXT) OR
        (do.deployment_network->'primary'->>'chainId')::INTEGER = target_chain_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE COMMENTS
-- =====================================================
COMMENT ON TABLE deployed_objects IS 'Stores deployed AR agents with location, configuration, and interaction capabilities';
COMMENT ON TABLE ar_qr_codes IS 'Stores QR codes as 3D AR objects for blockchain payments';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'CubePay database setup completed successfully!' AS status,
       'Tables: deployed_objects, ar_qr_codes' AS tables_created,
       'Ready for agent deployment and AR payments' AS next_step;
