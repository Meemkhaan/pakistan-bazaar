# 🗄️ Discount & Donation Database Setup Guide

## 📋 Overview

This guide explains how to set up the comprehensive discount and donation system database schema for ShopPakistan. The system includes:

- **Discount Codes**: Flexible discount system with usage tracking
- **Charity Organizations**: Verified charity management
- **Donations**: User donation tracking with impact measurement
- **Order Integration**: Seamless integration with existing orders

## 🚀 Quick Setup

### Option 1: Supabase Migration (Recommended)

1. **Navigate to your Supabase project**
   ```
   https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]
   ```

2. **Go to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Create a new query

3. **Run the migration**
   - Copy the contents of `supabase/migrations/20250120000000_add_discount_donation_schema.sql`
   - Paste into the SQL editor
   - Click "Run" to execute

### Option 2: Manual Setup

1. **Run the complete schema**
   ```sql
   -- Copy and run the contents of CREATE_DISCOUNT_DONATION_SCHEMA.sql
   ```

## 📊 Database Schema Overview

### 🎫 Discount System

#### `discount_codes` Table
```sql
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
```

**Key Features:**
- **Flexible Types**: Percentage or fixed amount discounts
- **Usage Limits**: Set maximum usage per code
- **Time Limits**: Valid from/until dates
- **Minimum Orders**: Minimum purchase requirements
- **Maximum Discounts**: Cap on discount amounts

#### `discount_usage` Table
```sql
CREATE TABLE discount_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discount_code_id UUID REFERENCES discount_codes(id),
    user_id UUID REFERENCES auth.users(id),
    order_id UUID REFERENCES orders(id),
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ❤️ Donation System

#### `charities` Table
```sql
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
```

**Key Features:**
- **Verification System**: Pending, verified, rejected status
- **Fundraising Goals**: Target and raised amounts
- **Contact Information**: Complete charity details
- **Geographic Data**: City and province tracking

#### `donations` Table
```sql
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    charity_id UUID REFERENCES charities(id),
    order_id UUID REFERENCES orders(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    anonymous BOOLEAN DEFAULT false,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `donation_impact` Table
```sql
CREATE TABLE donation_impact (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    charity_id UUID REFERENCES charities(id),
    impact_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    people_helped INTEGER,
    projects_completed INTEGER,
    amount_required DECIMAL(10,2),
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 📦 Order Integration

#### Updated `orders` Table
```sql
-- New columns added to existing orders table
ALTER TABLE orders ADD COLUMN discount_code_id UUID REFERENCES discount_codes(id);
ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN donation_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN final_amount DECIMAL(10,2) DEFAULT 0;
```

## 🔧 Advanced Features

### 🎯 Stored Procedures

#### Apply Discount Code
```sql
SELECT * FROM apply_discount_code('WELCOME10', 'user-uuid', 5000.00);
```

#### Process Donation
```sql
SELECT * FROM process_donation('charity-uuid', 'user-uuid', 1000.00);
```

### 📊 Database Views

#### Active Discount Codes
```sql
SELECT * FROM active_discount_codes;
```

#### Charity Statistics
```sql
SELECT * FROM charity_stats;
```

#### Donation Impact Summary
```sql
SELECT * FROM donation_impact_summary;
```

### 🔒 Security Features

#### Row Level Security (RLS)
- **Discount Codes**: Readable by all, manageable by admins
- **Donations**: Users can only see their own donations
- **Charities**: Readable by all, manageable by admins
- **Impact Data**: Readable by all

#### Policies
```sql
-- Example: Users can view their own donations
CREATE POLICY "Users can view their own donations" ON donations
    FOR SELECT USING (auth.uid() = user_id OR anonymous = true);
```

## 📈 Sample Data

### Discount Codes
```sql
INSERT INTO discount_codes (code, type, value, min_amount, description) VALUES
('WELCOME10', 'percentage', 10.00, 1000.00, '10% off for new customers'),
('FREESHIP', 'fixed', 500.00, 2000.00, 'Rs. 500 off on orders above Rs. 2000'),
('PAKISTAN20', 'percentage', 20.00, 5000.00, '20% off on orders above Rs. 5000');
```

### Charities
```sql
INSERT INTO charities (name, description, category, target_amount) VALUES
('Edhi Foundation', 'Emergency medical services', 'Healthcare', 500000.00),
('Shaukat Khanum Memorial', 'Cancer treatment', 'Healthcare', 1000000.00),
('Saylani Welfare Trust', 'Food distribution', 'Social Welfare', 300000.00);
```

## 🛠️ Integration with Frontend

### TypeScript Types
Import the types from `src/integrations/supabase/discount-donation-types.ts`:

```typescript
import { 
  DiscountCode, 
  Charity, 
  Donation, 
  ActiveDiscountCode,
  CharityStats 
} from '@/integrations/supabase/discount-donation-types';
```

### Supabase Client Usage
```typescript
import { supabase } from '@/integrations/supabase/client';

// Get active discount codes
const { data: codes } = await supabase
  .from('active_discount_codes')
  .select('*');

// Get charity statistics
const { data: stats } = await supabase
  .from('charity_stats')
  .select('*');

// Apply discount code
const { data: result } = await supabase
  .rpc('apply_discount_code', {
    p_code: 'WELCOME10',
    p_user_id: user.id,
    p_order_amount: 5000
  });
```

## 🔍 Monitoring & Analytics

### Key Metrics to Track

1. **Discount Performance**
   - Usage count per code
   - Total savings generated
   - Conversion rates

2. **Donation Impact**
   - Total amount raised
   - Number of donors
   - Charity progress

3. **Order Integration**
   - Orders with discounts
   - Orders with donations
   - Average order value

### Useful Queries

#### Top Performing Discount Codes
```sql
SELECT 
    code,
    usage_count,
    (usage_count * value) as total_savings
FROM discount_codes 
WHERE is_active = true
ORDER BY usage_count DESC;
```

#### Charity Fundraising Progress
```sql
SELECT 
    name,
    raised_amount,
    target_amount,
    (raised_amount / target_amount * 100) as progress_percentage
FROM charities 
WHERE is_active = true
ORDER BY progress_percentage DESC;
```

## 🚨 Troubleshooting

### Common Issues

1. **Migration Fails**
   - Check if UUID extension is enabled
   - Ensure you have proper permissions
   - Verify table names don't conflict

2. **RLS Policies Not Working**
   - Check if RLS is enabled on tables
   - Verify user authentication
   - Test policies with different user roles

3. **Triggers Not Firing**
   - Check trigger function syntax
   - Verify trigger is attached to correct table
   - Test with manual inserts

### Debug Queries

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('discount_codes', 'charities', 'donations');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('discount_codes', 'charities', 'donations');

-- Check triggers
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## 📚 Next Steps

1. **Test the Schema**
   - Run sample queries
   - Test discount application
   - Verify donation processing

2. **Update Frontend**
   - Import new TypeScript types
   - Update components to use new schema
   - Test all functionality

3. **Monitor Performance**
   - Check query performance
   - Monitor database size
   - Track usage patterns

4. **Backup Strategy**
   - Set up regular backups
   - Test restore procedures
   - Document recovery steps

## 🎉 Success Checklist

- [ ] Database migration completed successfully
- [ ] Sample data inserted
- [ ] RLS policies working correctly
- [ ] Stored procedures tested
- [ ] Frontend integration complete
- [ ] Performance monitoring set up
- [ ] Backup strategy implemented

---

**🎯 Your discount and donation system is now ready for production!**

For support, refer to the Supabase documentation or create an issue in the project repository. 