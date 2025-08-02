-- Migration: Add Discount and Donation Schema
-- Created: 2025-01-20
-- Description: Adds comprehensive discount and donation system to ShopPakistan

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DISCOUNT SYSTEM TABLES
-- =====================================================

-- Discount codes table
CREATE TABLE IF NOT EXISTS discount_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value DECIMAL(10,2) NOT NULL,
    min_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_discount DECIMAL(10,2),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discount usage tracking
CREATE TABLE IF NOT EXISTS discount_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discount_code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DONATION SYSTEM TABLES
-- =====================================================

-- Charity organizations table
CREATE TABLE IF NOT EXISTS charities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    target_amount DECIMAL(12,2),
    raised_amount DECIMAL(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    verification_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    charity_id UUID REFERENCES charities(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    anonymous BOOLEAN DEFAULT false,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donation impact tracking
CREATE TABLE IF NOT EXISTS donation_impact (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    charity_id UUID REFERENCES charities(id) ON DELETE CASCADE,
    impact_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    people_helped INTEGER,
    projects_completed INTEGER,
    amount_required DECIMAL(10,2),
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- UPDATE EXISTING ORDERS TABLE
-- =====================================================

-- Add new columns to existing orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code_id UUID REFERENCES discount_codes(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS donation_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS final_amount DECIMAL(10,2) DEFAULT 0;

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample discount codes
INSERT INTO discount_codes (code, type, value, min_amount, description, usage_limit, valid_until) VALUES
('WELCOME10', 'percentage', 10.00, 1000.00, '10% off for new customers', 1000, '2024-12-31 23:59:59'),
('FREESHIP', 'fixed', 500.00, 2000.00, 'Rs. 500 off on orders above Rs. 2000', 500, '2024-11-30 23:59:59'),
('PAKISTAN20', 'percentage', 20.00, 5000.00, '20% off on orders above Rs. 5000', 200, '2024-12-15 23:59:59'),
('FLASH50', 'fixed', 1000.00, 3000.00, 'Rs. 1000 off flash sale', 100, '2024-10-31 23:59:59'),
('NEWUSER', 'percentage', 15.00, 500.00, '15% off for new users', 1000, '2024-12-31 23:59:59'),
('LOYALTY25', 'percentage', 25.00, 10000.00, '25% off for loyal customers', 50, '2024-12-31 23:59:59')
ON CONFLICT (code) DO NOTHING;

-- Insert sample charities
INSERT INTO charities (name, description, category, logo_url, website_url, contact_email, contact_phone, address, city, province, target_amount, raised_amount, verification_status) VALUES
('Edhi Foundation', 'Providing emergency medical services and social welfare across Pakistan', 'Healthcare', 'https://edhi.org/logo.png', 'https://edhi.org', 'info@edhi.org', '+92-21-111-111-111', 'Mithadar, Karachi', 'Karachi', 'Sindh', 500000.00, 125000.00, 'verified'),
('Shaukat Khanum Memorial', 'Cancer treatment and research center providing free treatment', 'Healthcare', 'https://shaukatkhanum.org.pk/logo.png', 'https://shaukatkhanum.org.pk', 'info@shaukatkhanum.org.pk', '+92-42-3590-0000', 'Johar Town, Lahore', 'Lahore', 'Punjab', 1000000.00, 750000.00, 'verified'),
('Saylani Welfare Trust', 'Food distribution and social services for underprivileged', 'Social Welfare', 'https://saylaniwelfare.org/logo.png', 'https://saylaniwelfare.org', 'info@saylaniwelfare.org', '+92-21-111-111-222', 'Gulshan-e-Iqbal, Karachi', 'Karachi', 'Sindh', 300000.00, 180000.00, 'verified'),
('TCF Foundation', 'Quality education for underprivileged children', 'Education', 'https://tcf.org.pk/logo.png', 'https://tcf.org.pk', 'info@tcf.org.pk', '+92-21-111-111-333', 'Clifton, Karachi', 'Karachi', 'Sindh', 800000.00, 450000.00, 'verified'),
('WaterAid Pakistan', 'Clean water and sanitation projects', 'Environment', 'https://wateraid.org/pk/logo.png', 'https://wateraid.org/pk', 'info@wateraid.org.pk', '+92-51-111-111-444', 'F-7, Islamabad', 'Islamabad', 'Federal', 400000.00, 220000.00, 'verified'),
('Shelter Homes', 'Housing for homeless families and emergency shelters', 'Housing', 'https://shelterhomes.pk/logo.png', 'https://shelterhomes.pk', 'info@shelterhomes.pk', '+92-51-111-111-555', 'G-8, Islamabad', 'Islamabad', 'Federal', 600000.00, 320000.00, 'verified')
ON CONFLICT DO NOTHING;

-- Insert sample donation impact
INSERT INTO donation_impact (charity_id, impact_type, description, people_helped, projects_completed, amount_required) VALUES
((SELECT id FROM charities WHERE name = 'Edhi Foundation'), 'Emergency Services', 'Provided emergency medical services to 500+ patients', 500, 10, 50000.00),
((SELECT id FROM charities WHERE name = 'Shaukat Khanum Memorial'), 'Cancer Treatment', 'Free cancer treatment for 100+ patients', 100, 5, 200000.00),
((SELECT id FROM charities WHERE name = 'Saylani Welfare Trust'), 'Food Distribution', 'Distributed 10,000+ meals to flood-affected families', 10000, 15, 150000.00),
((SELECT id FROM charities WHERE name = 'TCF Foundation'), 'Education', 'Provided quality education to 500+ children', 500, 8, 300000.00),
((SELECT id FROM charities WHERE name = 'WaterAid Pakistan'), 'Water Projects', 'Built 20 water wells serving 2000+ people', 2000, 20, 100000.00),
((SELECT id FROM charities WHERE name = 'Shelter Homes'), 'Housing', 'Provided emergency shelter to 100+ families', 100, 12, 250000.00)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update discount usage count
CREATE OR REPLACE FUNCTION update_discount_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE discount_codes 
    SET usage_count = usage_count + 1
    WHERE id = NEW.discount_code_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for discount usage tracking
DROP TRIGGER IF EXISTS discount_usage_trigger ON discount_usage;
CREATE TRIGGER discount_usage_trigger
    AFTER INSERT ON discount_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_discount_usage();

-- Function to update charity raised amount
CREATE OR REPLACE FUNCTION update_charity_raised()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE charities 
    SET raised_amount = raised_amount + NEW.amount
    WHERE id = NEW.charity_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for donation tracking
DROP TRIGGER IF EXISTS donation_raised_trigger ON donations;
CREATE TRIGGER donation_raised_trigger
    AFTER INSERT ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_charity_raised();

-- Function to calculate final order amount
CREATE OR REPLACE FUNCTION calculate_final_amount()
RETURNS TRIGGER AS $$
BEGIN
    NEW.final_amount = NEW.total_amount - COALESCE(NEW.discount_amount, 0) + COALESCE(NEW.donation_amount, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for final amount calculation
DROP TRIGGER IF EXISTS order_final_amount_trigger ON orders;
CREATE TRIGGER order_final_amount_trigger
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION calculate_final_amount();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_impact ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Discount codes are viewable by everyone" ON discount_codes;
DROP POLICY IF EXISTS "Discount codes are insertable by authenticated users" ON discount_codes;
DROP POLICY IF EXISTS "Users can view their own discount usage" ON discount_usage;
DROP POLICY IF EXISTS "Users can insert their own discount usage" ON discount_usage;
DROP POLICY IF EXISTS "Charities are viewable by everyone" ON charities;
DROP POLICY IF EXISTS "Charities are manageable by admins" ON charities;
DROP POLICY IF EXISTS "Users can view their own donations" ON donations;
DROP POLICY IF EXISTS "Users can insert their own donations" ON donations;
DROP POLICY IF EXISTS "Donation impact is viewable by everyone" ON donation_impact;

-- Discount codes policies (readable by all, manageable by admins)
CREATE POLICY "Discount codes are viewable by everyone" ON discount_codes
    FOR SELECT USING (is_active = true);

CREATE POLICY "Discount codes are insertable by authenticated users" ON discount_codes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Discount usage policies
CREATE POLICY "Users can view their own discount usage" ON discount_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own discount usage" ON discount_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Charities policies (readable by all, manageable by admins)
CREATE POLICY "Charities are viewable by everyone" ON charities
    FOR SELECT USING (is_active = true);

CREATE POLICY "Charities are manageable by admins" ON charities
    FOR ALL USING (auth.role() = 'service_role');

-- Donations policies
CREATE POLICY "Users can view their own donations" ON donations
    FOR SELECT USING (auth.uid() = user_id OR anonymous = true);

CREATE POLICY "Users can insert their own donations" ON donations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Donation impact policies (readable by all)
CREATE POLICY "Donation impact is viewable by everyone" ON donation_impact
    FOR SELECT USING (true);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Discount codes indexes
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_discount_codes_valid_until ON discount_codes(valid_until);

-- Discount usage indexes
CREATE INDEX IF NOT EXISTS idx_discount_usage_user_id ON discount_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_order_id ON discount_usage(order_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_code_id ON discount_usage(discount_code_id);

-- Charities indexes
CREATE INDEX IF NOT EXISTS idx_charities_category ON charities(category);
CREATE INDEX IF NOT EXISTS idx_charities_active ON charities(is_active);
CREATE INDEX IF NOT EXISTS idx_charities_verification ON charities(verification_status);

-- Donations indexes
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_charity_id ON donations(charity_id);
CREATE INDEX IF NOT EXISTS idx_donations_order_id ON donations(order_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);

-- Donation impact indexes
CREATE INDEX IF NOT EXISTS idx_donation_impact_charity_id ON donation_impact(charity_id);
CREATE INDEX IF NOT EXISTS idx_donation_impact_type ON donation_impact(impact_type);

-- Orders indexes for new columns
CREATE INDEX IF NOT EXISTS idx_orders_discount_code_id ON orders(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_orders_final_amount ON orders(final_amount);

-- =====================================================
-- VIEWS FOR EASY QUERYING
-- =====================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS active_discount_codes;
DROP VIEW IF EXISTS charity_stats;
DROP VIEW IF EXISTS donation_impact_summary;

-- View for active discount codes
CREATE VIEW active_discount_codes AS
SELECT 
    code,
    type,
    value,
    min_amount,
    description,
    usage_limit,
    usage_count,
    valid_until,
    CASE 
        WHEN usage_limit IS NOT NULL AND usage_count >= usage_limit THEN false
        WHEN valid_until IS NOT NULL AND valid_until < NOW() THEN false
        ELSE is_active
    END as is_available
FROM discount_codes
WHERE is_active = true;

-- View for charity statistics
CREATE VIEW charity_stats AS
SELECT 
    c.id,
    c.name,
    c.category,
    c.target_amount,
    c.raised_amount,
    ROUND((c.raised_amount / c.target_amount) * 100, 2) as progress_percentage,
    COUNT(d.id) as total_donations,
    COUNT(DISTINCT d.user_id) as unique_donors
FROM charities c
LEFT JOIN donations d ON c.id = d.charity_id AND d.status = 'completed'
WHERE c.is_active = true
GROUP BY c.id, c.name, c.category, c.target_amount, c.raised_amount;

-- View for donation impact summary
CREATE VIEW donation_impact_summary AS
SELECT 
    c.name as charity_name,
    c.category,
    SUM(d.amount) as total_raised,
    COUNT(d.id) as donation_count,
    COUNT(DISTINCT d.user_id) as unique_donors,
    di.impact_type,
    di.description as impact_description,
    di.people_helped,
    di.projects_completed
FROM charities c
LEFT JOIN donations d ON c.id = d.charity_id AND d.status = 'completed'
LEFT JOIN donation_impact di ON c.id = di.charity_id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.category, di.impact_type, di.description, di.people_helped, di.projects_completed;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure to apply discount code
CREATE OR REPLACE FUNCTION apply_discount_code(
    p_code VARCHAR(50),
    p_user_id UUID,
    p_order_amount DECIMAL(10,2)
)
RETURNS TABLE(
    success BOOLEAN,
    discount_amount DECIMAL(10,2),
    message TEXT
) AS $$
DECLARE
    v_discount discount_codes%ROWTYPE;
    v_discount_amount DECIMAL(10,2);
BEGIN
    -- Get discount code details
    SELECT * INTO v_discount 
    FROM discount_codes 
    WHERE code = p_code 
    AND is_active = true
    AND (valid_until IS NULL OR valid_until > NOW())
    AND (usage_limit IS NULL OR usage_count < usage_limit);
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0::DECIMAL, 'Invalid or expired discount code'::TEXT;
        RETURN;
    END IF;
    
    -- Check minimum amount
    IF p_order_amount < v_discount.min_amount THEN
        RETURN QUERY SELECT false, 0::DECIMAL, 
            format('Minimum order amount required: Rs. %s', v_discount.min_amount)::TEXT;
        RETURN;
    END IF;
    
    -- Calculate discount amount
    IF v_discount.type = 'percentage' THEN
        v_discount_amount = (p_order_amount * v_discount.value) / 100;
    ELSE
        v_discount_amount = v_discount.value;
    END IF;
    
    -- Apply maximum discount limit if set
    IF v_discount.max_discount IS NOT NULL AND v_discount_amount > v_discount.max_discount THEN
        v_discount_amount = v_discount.max_discount;
    END IF;
    
    RETURN QUERY SELECT true, v_discount_amount, 'Discount applied successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Procedure to process donation
CREATE OR REPLACE FUNCTION process_donation(
    p_charity_id UUID,
    p_user_id UUID,
    p_amount DECIMAL(10,2),
    p_order_id UUID DEFAULT NULL,
    p_anonymous BOOLEAN DEFAULT false,
    p_message TEXT DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    donation_id UUID,
    message TEXT
) AS $$
DECLARE
    v_donation_id UUID;
BEGIN
    -- Check if charity exists and is active
    IF NOT EXISTS (SELECT 1 FROM charities WHERE id = p_charity_id AND is_active = true) THEN
        RETURN QUERY SELECT false, NULL::UUID, 'Invalid charity'::TEXT;
        RETURN;
    END IF;
    
    -- Insert donation
    INSERT INTO donations (charity_id, user_id, order_id, amount, anonymous, message, status)
    VALUES (p_charity_id, p_user_id, p_order_id, p_amount, p_anonymous, p_message, 'completed')
    RETURNING id INTO v_donation_id;
    
    RETURN QUERY SELECT true, v_donation_id, 'Donation processed successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE discount_codes IS 'Stores discount codes and their rules';
COMMENT ON TABLE discount_usage IS 'Tracks usage of discount codes by users';
COMMENT ON TABLE charities IS 'Stores information about charity organizations';
COMMENT ON TABLE donations IS 'Tracks donations made by users';
COMMENT ON TABLE donation_impact IS 'Tracks the impact of donations on communities';

COMMENT ON COLUMN discount_codes.type IS 'Type of discount: percentage or fixed amount';
COMMENT ON COLUMN discount_codes.value IS 'Discount value (percentage or fixed amount)';
COMMENT ON COLUMN discount_codes.min_amount IS 'Minimum order amount required for discount';
COMMENT ON COLUMN discount_codes.max_discount IS 'Maximum discount amount allowed';

COMMENT ON COLUMN charities.verification_status IS 'Status of charity verification: pending, verified, rejected';
COMMENT ON COLUMN charities.target_amount IS 'Fundraising target amount';
COMMENT ON COLUMN charities.raised_amount IS 'Total amount raised so far';

COMMENT ON COLUMN donations.anonymous IS 'Whether the donation is anonymous';
COMMENT ON COLUMN donations.status IS 'Status of donation: pending, completed, failed';

-- =====================================================
-- MIGRATION COMPLETE
-- ===================================================== 