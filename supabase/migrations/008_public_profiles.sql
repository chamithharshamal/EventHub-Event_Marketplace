-- ============================================
-- PUBLIC PROFILES
-- Migration: 008_public_profiles.sql
-- ============================================

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;

-- Create unique index on username (allowing nulls)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username 
    ON profiles(username) 
    WHERE username IS NOT NULL;

-- Index for public profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_public 
    ON profiles(is_public) 
    WHERE is_public = true;

-- RLS Policy for viewing public profiles
-- Drop existing policies first if they conflict
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (
        is_public = true 
        OR auth.uid() = id
    );

-- Function to generate username slug from full_name
CREATE OR REPLACE FUNCTION generate_username_slug(name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert to lowercase and replace spaces with hyphens
    base_slug := lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
    
    -- If empty, use 'user'
    IF base_slug = '' OR base_slug IS NULL THEN
        base_slug := 'user';
    END IF;
    
    final_slug := base_slug;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;
