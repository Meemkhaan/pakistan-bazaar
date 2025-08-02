-- Fix donations table - Drop and recreate with proper schema
-- Run this in Supabase SQL Editor

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.donations CASCADE;

-- Create donations table with proper schema
CREATE TABLE public.donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    description TEXT,
    condition TEXT NOT NULL,
    category TEXT NOT NULL,
    estimated_value INTEGER DEFAULT 0,
    quantity INTEGER DEFAULT 1,
    donor_name TEXT NOT NULL,
    donor_email TEXT NOT NULL,
    donor_phone TEXT NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_city TEXT NOT NULL,
    preferred_pickup_date DATE,
    additional_notes TEXT,
    image_urls TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'picked_up', 'completed')),
    admin_notes TEXT,
    pickup_date DATE,
    pickup_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX idx_donations_status ON public.donations(status);
CREATE INDEX idx_donations_category ON public.donations(category);
CREATE INDEX idx_donations_created_at ON public.donations(created_at);

-- Enable Row Level Security
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own donations" ON public.donations;
DROP POLICY IF EXISTS "Users can insert their own donations" ON public.donations;
DROP POLICY IF EXISTS "Users can update their own pending donations" ON public.donations;
DROP POLICY IF EXISTS "Admins can view all donations" ON public.donations;
DROP POLICY IF EXISTS "Admins can update all donations" ON public.donations;
DROP POLICY IF EXISTS "Admins can delete donations" ON public.donations;

-- RLS Policies for donations table

-- Allow users to view their own donations
CREATE POLICY "Users can view their own donations" ON public.donations
    FOR SELECT USING (auth.uid() = donor_id);

-- Allow users to insert their own donations
CREATE POLICY "Users can insert their own donations" ON public.donations
    FOR INSERT WITH CHECK (auth.uid() = donor_id);

-- Allow users to update their own donations (only if status is pending)
CREATE POLICY "Users can update their own pending donations" ON public.donations
    FOR UPDATE USING (auth.uid() = donor_id AND status = 'pending');

-- Allow service role to view all donations (for admin access)
CREATE POLICY "Service role can view all donations" ON public.donations
    FOR SELECT USING (auth.role() = 'service_role');

-- Allow service role to update all donations
CREATE POLICY "Service role can update all donations" ON public.donations
    FOR UPDATE USING (auth.role() = 'service_role');

-- Allow service role to delete donations
CREATE POLICY "Service role can delete donations" ON public.donations
    FOR DELETE USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_donations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_donations_updated_at ON public.donations;
CREATE TRIGGER update_donations_updated_at
    BEFORE UPDATE ON public.donations
    FOR EACH ROW
    EXECUTE FUNCTION update_donations_updated_at();

-- Create a view for donation statistics
CREATE OR REPLACE VIEW donation_stats AS
SELECT 
    COUNT(*) as total_donations,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_donations,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_donations,
    COUNT(*) FILTER (WHERE status = 'picked_up') as picked_up_donations,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_donations,
    SUM(estimated_value) as total_estimated_value,
    AVG(estimated_value) as avg_estimated_value
FROM public.donations;

-- Grant necessary permissions
GRANT ALL ON public.donations TO authenticated;
GRANT ALL ON public.donation_stats TO authenticated;

-- Verify the table was created properly
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'donations' 
ORDER BY ordinal_position; 