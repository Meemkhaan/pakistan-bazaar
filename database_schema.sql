-- =====================================================
-- PAKISTAN BAZAAR - DATABASE BACKUP SCHEMA
-- =====================================================
-- Created: 2025-01-20
-- Description: Clean database schema backup without sample data
-- Live Demo: https://shop-pakistan.vercel.app/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER MANAGEMENT TABLES
-- =====================================================

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- PRODUCT CATALOG TABLES
-- =====================================================

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES public.categories(id),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- SHOPPING CART TABLES
-- =====================================================

-- Create cart items table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- =====================================================
-- ORDER MANAGEMENT TABLES
-- =====================================================

-- Create order status enum
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  phone TEXT NOT NULL,
  payment_method TEXT DEFAULT 'cash_on_delivery',
  notes TEXT,
  discount_code_id UUID,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  donation_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- DISCOUNT SYSTEM TABLES
-- =====================================================

-- Discount codes table
CREATE TABLE discount_codes (
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
CREATE TABLE discount_usage (
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
CREATE TABLE charities (
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
CREATE TABLE donations (
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
CREATE TABLE donation_impact (
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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_impact ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for categories (public read)
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

-- Create policies for products (public read, seller manage)
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);
CREATE POLICY "Sellers can manage their products" ON public.products
  FOR ALL USING (auth.uid() = seller_id);

-- Create policies for cart items
CREATE POLICY "Users can manage their cart" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Create policies for orders
CREATE POLICY "Users can view their orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for order items
CREATE POLICY "Users can view their order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

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
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Create function to handle user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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
CREATE TRIGGER order_final_amount_trigger
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION calculate_final_amount();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Discount codes indexes
CREATE INDEX idx_discount_codes_code ON discount_codes(code);
CREATE INDEX idx_discount_codes_active ON discount_codes(is_active);
CREATE INDEX idx_discount_codes_valid_until ON discount_codes(valid_until);

-- Discount usage indexes
CREATE INDEX idx_discount_usage_user_id ON discount_usage(user_id);
CREATE INDEX idx_discount_usage_order_id ON discount_usage(order_id);
CREATE INDEX idx_discount_usage_code_id ON discount_usage(discount_code_id);

-- Charities indexes
CREATE INDEX idx_charities_category ON charities(category);
CREATE INDEX idx_charities_active ON charities(is_active);
CREATE INDEX idx_charities_verification ON charities(verification_status);

-- Donations indexes
CREATE INDEX idx_donations_user_id ON donations(user_id);
CREATE INDEX idx_donations_charity_id ON donations(charity_id);
CREATE INDEX idx_donations_order_id ON donations(order_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_created_at ON donations(created_at);

-- Donation impact indexes
CREATE INDEX idx_donation_impact_charity_id ON donation_impact(charity_id);
CREATE INDEX idx_donation_impact_type ON donation_impact(impact_type);

-- Orders indexes for new columns
CREATE INDEX idx_orders_discount_code_id ON orders(discount_code_id);
CREATE INDEX idx_orders_final_amount ON orders(final_amount);

-- =====================================================
-- VIEWS FOR EASY QUERYING
-- =====================================================

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
-- BACKUP SCHEMA COMPLETE
-- =====================================================
-- This file contains the clean database schema backup for Pakistan Bazaar
-- Live Demo: https://shop-pakistan.vercel.app/
-- Features: User management, product catalog, shopping cart, orders, discounts, donations
-- No sample data included - this is a pure structure backup 