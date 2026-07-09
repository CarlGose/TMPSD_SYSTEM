-- =====================================================
-- FIX: Add missing columns to drivers table
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Add address column if it doesn't exist
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS address TEXT;

-- Add operator columns if they don't exist
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS operator_first_name TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS operator_last_name TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS operator_middle_name TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS operator_address TEXT;

-- Add vehicle detail columns if they don't exist
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS permit_no TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS valid_until DATE;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS or_no TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS make TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS motor_no TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS chassis_no TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS body_no TEXT;

-- Add document columns if they don't exist
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS license_photo_url TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS or_cr_url TEXT;

-- Recreate the driver_stats view to include all columns
CREATE OR REPLACE VIEW driver_stats AS
SELECT 
    d.*,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    COUNT(r.id) AS total_ratings
FROM drivers d
LEFT JOIN ratings r ON d.id = r.driver_id
GROUP BY d.id;

-- =====================================================
-- IMPORTANT: Reload PostgREST schema cache
-- =====================================================
NOTIFY pgrst, 'reload schema';
