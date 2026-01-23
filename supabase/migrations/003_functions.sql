-- =============================================
-- DATABASE FUNCTIONS & TRIGGERS
-- Event Marketplace & Ticketing System
-- =============================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- =============================================
-- 1. INCREMENT TICKETS SOLD FUNCTION
-- =============================================
-- Called by Stripe webhook after successful payment
-- to update the quantity_sold on ticket_types

CREATE OR REPLACE FUNCTION increment_tickets_sold(
    p_ticket_type_id UUID,
    p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE ticket_types
    SET quantity_sold = quantity_sold + p_quantity
    WHERE id = p_ticket_type_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_tickets_sold(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_tickets_sold(UUID, INTEGER) TO service_role;


-- =============================================
-- 2. AUTO-CREATE PROFILE ON USER SIGNUP
-- =============================================
-- Creates a profile record when a new user signs up via OAuth or email

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();


-- =============================================
-- 3. HELPER FUNCTION TO CHECK ADMIN
-- =============================================
-- SECURITY DEFINER makes this run as the DB owner, bypassing RLS
-- This is critical to avoid infinite recursion when policies check roles

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;


-- =============================================
-- 4. DECREMENT TICKETS (FOR REFUNDS)
-- =============================================

CREATE OR REPLACE FUNCTION decrement_tickets_sold(
    p_ticket_type_id UUID,
    p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE ticket_types
    SET quantity_sold = GREATEST(0, quantity_sold - p_quantity)
    WHERE id = p_ticket_type_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION decrement_tickets_sold(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_tickets_sold(UUID, INTEGER) TO service_role;


-- =============================================
-- VERIFICATION
-- =============================================
-- Run this to verify functions exist:
-- SELECT proname FROM pg_proc WHERE proname IN ('increment_tickets_sold', 'decrement_tickets_sold', 'handle_new_user');
