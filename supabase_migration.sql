-- =====================================================
-- Tricycle Driver Rating App - Supabase Migration
-- =====================================================

-- Create enum for driver type
CREATE TYPE driver_type AS ENUM ('operator', 'authorized_driver');

-- =====================================================
-- DRIVERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS drivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    plate_number TEXT NOT NULL,
    license TEXT NOT NULL,
    body_sticker TEXT NOT NULL,
    driver_type driver_type NOT NULL DEFAULT 'operator',
    tricycle_photo_url TEXT,
    or_cr_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RATINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    passenger_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster rating lookups by driver
CREATE INDEX idx_ratings_driver_id ON ratings(driver_id);
CREATE INDEX idx_ratings_created_at ON ratings(created_at DESC);

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_drivers_updated_at
    BEFORE UPDATE ON drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on drivers
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Drivers: anyone can read (for public rating page)
CREATE POLICY "Allow public read on drivers"
    ON drivers FOR SELECT
    TO anon, authenticated
    USING (true);

-- Drivers: only authenticated users can insert
CREATE POLICY "Allow authenticated insert on drivers"
    ON drivers FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Drivers: only authenticated users can update
CREATE POLICY "Allow authenticated update on drivers"
    ON drivers FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Drivers: only authenticated users can delete
CREATE POLICY "Allow authenticated delete on drivers"
    ON drivers FOR DELETE
    TO authenticated
    USING (true);

-- Enable RLS on ratings
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Ratings: anyone can read
CREATE POLICY "Allow public read on ratings"
    ON ratings FOR SELECT
    TO anon, authenticated
    USING (true);

-- Ratings: anyone can insert (passengers rate without auth)
CREATE POLICY "Allow public insert on ratings"
    ON ratings FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Ratings: only authenticated users can delete
CREATE POLICY "Allow authenticated delete on ratings"
    ON ratings FOR DELETE
    TO authenticated
    USING (true);

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create storage buckets (run these in the SQL editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tricycle-photos', 'tricycle-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for tricycle-photos
CREATE POLICY "Allow public read tricycle-photos"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'tricycle-photos');

CREATE POLICY "Allow authenticated upload tricycle-photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'tricycle-photos');

CREATE POLICY "Allow authenticated update tricycle-photos"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'tricycle-photos');

CREATE POLICY "Allow authenticated delete tricycle-photos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'tricycle-photos');

-- Storage policies for documents
CREATE POLICY "Allow public read documents"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated upload documents"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow authenticated update documents"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated delete documents"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'documents');

-- =====================================================
-- VIEW: Driver with average rating
-- =====================================================
CREATE OR REPLACE VIEW driver_stats AS
SELECT 
    d.*,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    COUNT(r.id) AS total_ratings
FROM drivers d
LEFT JOIN ratings r ON d.id = r.driver_id
GROUP BY d.id;

-- =====================================================
-- DEFAULT ADMIN USER
-- =====================================================
-- Creates admin@gmail.com with password: 123
-- Run this in Supabase SQL Editor (requires access to auth schema)

DO $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Only insert if user doesn't already exist
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@gmail.com') THEN
        new_user_id := gen_random_uuid();

        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role,
            aud,
            confirmation_token
        )
        VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            'admin@gmail.com',
            crypt('123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"role":"admin"}',
            false,
            'authenticated',
            'authenticated',
            ''
        );

        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            created_at,
            updated_at,
            last_sign_in_at
        )
        VALUES (
            new_user_id,
            new_user_id,
            jsonb_build_object('sub', new_user_id::text, 'email', 'admin@gmail.com'),
            'email',
            new_user_id::text,
            NOW(),
            NOW(),
            NOW()
        );

        RAISE NOTICE 'Admin user admin@gmail.com created successfully';
    ELSE
        RAISE NOTICE 'Admin user admin@gmail.com already exists';
    END IF;
END $$;

