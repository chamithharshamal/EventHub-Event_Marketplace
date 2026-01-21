-- =============================================
-- FIX: RLS POLICY INFINITE RECURSION
-- Event Marketplace & Ticketing System
-- =============================================
-- The profiles policy was causing infinite recursion.
-- This script fixes it by simplifying the policy.
-- Run this in Supabase SQL Editor.

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Recreate with simpler policies (no subqueries that reference profiles)
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Allow service role to manage profiles (for triggers)
CREATE POLICY "Service role can manage profiles"
    ON profiles FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
