-- =====================================================
-- FIX: Add license_validity column to drivers table
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Add license_validity column if it doesn't exist
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS license_validity DATE;

-- Recreate the driver_stats view so it picks up the new column
CREATE OR REPLACE VIEW driver_stats AS
SELECT 
    d.*,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    COUNT(r.id) AS total_ratings
FROM drivers d
LEFT JOIN ratings r ON d.id = r.driver_id
GROUP BY d.id;

-- Reload PostgREST schema cache so the API recognizes the new column
NOTIFY pgrst, 'reload schema';
