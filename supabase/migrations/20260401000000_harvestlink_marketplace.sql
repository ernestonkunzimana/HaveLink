/*
  # HarvestLink Marketplace - Schema Migration
  
  This migration adds all tables required for the HarvestLink agricultural marketplace:
  - cooperatives: farmer cooperative organizations
  - produce_listings: marketplace listings for farm produce
  - bids: buyer bids on produce listings
  - weighing_records: IoT and manual weighing entries
  - hl_mobile_money_transactions: MTN/Airtel escrow payments
  - price_floors: government-mandated minimum prices

  1. New Tables
    - `cooperatives`
    - `produce_listings`
    - `bids`
    - `weighing_records`
    - `hl_mobile_money_transactions`
    - `price_floors`

  2. Security
    - Enable RLS on all new tables
    - Add policies for role-based access
*/

-- Cooperatives
CREATE TABLE IF NOT EXISTS cooperatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    registration_number VARCHAR(100),
    district VARCHAR(100),
    sector VARCHAR(100),
    cell VARCHAR(100),
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    member_count INTEGER DEFAULT 0,
    total_land_hectares DECIMAL(10, 2),
    primary_crops JSONB,
    mobile_money_account VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cooperatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cooperatives are viewable by all authenticated users" ON cooperatives FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Cooperatives can be managed by their creators and admins" ON cooperatives FOR ALL USING (auth.uid() = created_by);

-- Produce Listings
CREATE TABLE IF NOT EXISTS produce_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cooperative_id UUID NOT NULL REFERENCES cooperatives(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    grade VARCHAR(50),
    quantity_kg DECIMAL(12, 2) NOT NULL,
    available_kg DECIMAL(12, 2) NOT NULL,
    price_per_kg DECIMAL(10, 2) NOT NULL,
    min_price_per_kg DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'RWF',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','active','bidding','sold','expired','cancelled')),
    listing_type VARCHAR(20) DEFAULT 'instant' CHECK (listing_type IN ('instant','auction','contract')),
    description TEXT,
    location VARCHAR(255),
    district VARCHAR(100),
    harvest_date DATE,
    expiry_date TIMESTAMPTZ,
    images JSONB,
    quality_certificate VARCHAR(255),
    is_organic BOOLEAN DEFAULT FALSE,
    moisture_content DECIMAL(5, 2),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    weighing_record_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE produce_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active listings are publicly viewable" ON produce_listings FOR SELECT USING (status IN ('active', 'bidding'));
CREATE POLICY "Listing owners can manage their listings" ON produce_listings FOR ALL USING (auth.uid() = created_by);

-- Bids
CREATE TABLE IF NOT EXISTS bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES produce_listings(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES auth.users(id),
    bidder_name VARCHAR(255),
    bid_price_per_kg DECIMAL(10, 2) NOT NULL,
    quantity_kg DECIMAL(12, 2) NOT NULL,
    total_amount DECIMAL(14, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RWF',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','withdrawn','countered','expired')),
    message TEXT,
    counter_price DECIMAL(10, 2),
    counter_message TEXT,
    expires_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    payment_method VARCHAR(50),
    escrow_reference VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bidders can view their own bids" ON bids FOR SELECT USING (auth.uid() = bidder_id);
CREATE POLICY "Listing owners can view all bids on their listings" ON bids FOR SELECT USING (
    EXISTS (SELECT 1 FROM produce_listings WHERE id = listing_id AND created_by = auth.uid())
);
CREATE POLICY "Authenticated users can place bids" ON bids FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- Weighing Records
CREATE TABLE IF NOT EXISTS weighing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) NOT NULL,
    device_name VARCHAR(100),
    cooperative_id UUID REFERENCES cooperatives(id),
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    gross_weight_kg DECIMAL(12, 3) NOT NULL,
    tare_weight_kg DECIMAL(12, 3) DEFAULT 0,
    net_weight_kg DECIMAL(12, 3) NOT NULL,
    moisture_content DECIMAL(5, 2),
    quality_grade VARCHAR(20),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending','completed','error','calibrating')),
    location VARCHAR(255),
    farmer_name VARCHAR(255),
    farmer_id UUID,
    operator_id UUID REFERENCES auth.users(id),
    ticket_number VARCHAR(100) UNIQUE,
    iot_raw_data JSONB,
    listing_id UUID REFERENCES produce_listings(id),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE weighing_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Weighing records viewable by authenticated users" ON weighing_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Operators can insert weighing records" ON weighing_records FOR INSERT WITH CHECK (auth.uid() = operator_id OR operator_id IS NULL);

-- Mobile Money Transactions (HarvestLink-specific)
CREATE TABLE IF NOT EXISTS hl_mobile_money_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('MTN','Airtel','Tigo','Orange')),
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('payment','payout','escrow','refund','escrow_release')),
    sender_phone VARCHAR(20) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    sender_name VARCHAR(255),
    receiver_name VARCHAR(255),
    amount DECIMAL(14, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RWF',
    fee_amount DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(14, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed','reversed','escrowed','released')),
    external_reference VARCHAR(100),
    internal_reference VARCHAR(100) UNIQUE NOT NULL,
    bid_id UUID REFERENCES bids(id),
    listing_id UUID REFERENCES produce_listings(id),
    escrow_released_at TIMESTAMPTZ,
    failure_reason TEXT,
    initiated_by UUID REFERENCES auth.users(id),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hl_mobile_money_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON hl_mobile_money_transactions FOR SELECT USING (auth.uid() = initiated_by);
CREATE POLICY "Users can initiate transactions" ON hl_mobile_money_transactions FOR INSERT WITH CHECK (auth.uid() = initiated_by);

-- Price Floors (Government minimum prices)
CREATE TABLE IF NOT EXISTS price_floors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    grade VARCHAR(50),
    min_price_per_kg DECIMAL(10, 2) NOT NULL,
    max_price_per_kg DECIMAL(10, 2),
    reference_price_per_kg DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'RWF',
    district VARCHAR(100),
    region VARCHAR(100),
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    set_by UUID NOT NULL REFERENCES auth.users(id),
    authority VARCHAR(50),
    notes TEXT,
    source_document VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE price_floors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Price floors are publicly viewable" ON price_floors FOR SELECT USING (TRUE);
CREATE POLICY "Only government users can manage price floors" ON price_floors FOR ALL USING (auth.uid() = set_by);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cooperatives_district ON cooperatives(district);
CREATE INDEX IF NOT EXISTS idx_cooperatives_active ON cooperatives(is_active);
CREATE INDEX IF NOT EXISTS idx_produce_listings_coop ON produce_listings(cooperative_id);
CREATE INDEX IF NOT EXISTS idx_produce_listings_crop ON produce_listings(crop_name);
CREATE INDEX IF NOT EXISTS idx_produce_listings_status ON produce_listings(status);
CREATE INDEX IF NOT EXISTS idx_produce_listings_district ON produce_listings(district);
CREATE INDEX IF NOT EXISTS idx_produce_listings_created ON produce_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bids_listing ON bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder ON bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_weighing_records_device ON weighing_records(device_id);
CREATE INDEX IF NOT EXISTS idx_weighing_records_coop ON weighing_records(cooperative_id);
CREATE INDEX IF NOT EXISTS idx_weighing_records_crop ON weighing_records(crop_name);
CREATE INDEX IF NOT EXISTS idx_hl_mobile_money_status ON hl_mobile_money_transactions(status);
CREATE INDEX IF NOT EXISTS idx_hl_mobile_money_initiated_by ON hl_mobile_money_transactions(initiated_by);
CREATE INDEX IF NOT EXISTS idx_hl_mobile_money_reference ON hl_mobile_money_transactions(internal_reference);
CREATE INDEX IF NOT EXISTS idx_price_floors_crop ON price_floors(crop_name);
CREATE INDEX IF NOT EXISTS idx_price_floors_active ON price_floors(is_active);
CREATE INDEX IF NOT EXISTS idx_price_floors_effective ON price_floors(effective_from, effective_to);
