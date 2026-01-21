-- =============================================
-- ADMIN APPROVAL SYSTEM
-- Event Marketplace & Ticketing System
-- =============================================
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. ADD ROLE TO PROFILES
-- =============================================
-- Add role column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- First, update any NULL or empty roles to 'user'
UPDATE profiles SET role = 'user' WHERE role IS NULL OR role = '';

-- Drop existing constraint if any
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Create role type constraint
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'organizer', 'admin'));

-- =============================================
-- 2. ADD REJECTION REASON TO EVENTS
-- =============================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'rejection_reason') THEN
        ALTER TABLE events ADD COLUMN rejection_reason TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'reviewed_by') THEN
        ALTER TABLE events ADD COLUMN reviewed_by UUID REFERENCES profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'reviewed_at') THEN
        ALTER TABLE events ADD COLUMN reviewed_at TIMESTAMPTZ;
    END IF;
END $$;

-- Update event status constraint to include new statuses
ALTER TABLE events 
DROP CONSTRAINT IF EXISTS events_status_check;

ALTER TABLE events 
ADD CONSTRAINT events_status_check 
CHECK (status IN ('draft', 'pending_approval', 'published', 'rejected', 'cancelled'));


-- =============================================
-- 3. ADMIN RLS POLICIES
-- =============================================

-- Allow admins to view all events
DROP POLICY IF EXISTS "Admins can view all events" ON events;
CREATE POLICY "Admins can view all events"
    ON events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to update any event (for approval/rejection)
DROP POLICY IF EXISTS "Admins can update any event" ON events;
CREATE POLICY "Admins can update any event"
    ON events FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );


-- =============================================
-- 4. HELPER FUNCTION TO CHECK ADMIN
-- =============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;


-- =============================================
-- VERIFICATION
-- =============================================
-- To make a user an admin, run:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
