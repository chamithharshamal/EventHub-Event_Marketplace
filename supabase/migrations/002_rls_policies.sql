-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- Event Marketplace & Ticketing System
-- =============================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- =============================================
-- 1. ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS check_ins ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. PROFILES POLICIES
-- =============================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =============================================
-- 3. EVENTS POLICIES
-- =============================================

-- Anyone can view published events
DROP POLICY IF EXISTS "Anyone can view published events" ON events;
CREATE POLICY "Anyone can view published events"
    ON events FOR SELECT
    USING (status = 'published');

-- Organizers can view their own events (any status)
DROP POLICY IF EXISTS "Organizers can view own events" ON events;
CREATE POLICY "Organizers can view own events"
    ON events FOR SELECT
    USING (auth.uid() = organizer_id);

-- Organizers can create events
DROP POLICY IF EXISTS "Organizers can create events" ON events;
CREATE POLICY "Organizers can create events"
    ON events FOR INSERT
    WITH CHECK (auth.uid() = organizer_id);

-- Organizers can update their own events
DROP POLICY IF EXISTS "Organizers can update own events" ON events;
CREATE POLICY "Organizers can update own events"
    ON events FOR UPDATE
    USING (auth.uid() = organizer_id);

-- Organizers can delete their own events
DROP POLICY IF EXISTS "Organizers can delete own events" ON events;
CREATE POLICY "Organizers can delete own events"
    ON events FOR DELETE
    USING (auth.uid() = organizer_id);

-- =============================================
-- 4. TICKET_TYPES POLICIES
-- =============================================

-- Anyone can view ticket types for published events
DROP POLICY IF EXISTS "Anyone can view ticket types" ON ticket_types;
CREATE POLICY "Anyone can view ticket types"
    ON ticket_types FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = ticket_types.event_id 
            AND (events.status = 'published' OR events.organizer_id = auth.uid())
        )
    );

-- Organizers can manage ticket types for their events
DROP POLICY IF EXISTS "Organizers can manage ticket types" ON ticket_types;
CREATE POLICY "Organizers can manage ticket types"
    ON ticket_types FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = ticket_types.event_id 
            AND events.organizer_id = auth.uid()
        )
    );

-- =============================================
-- 5. ORDERS POLICIES
-- =============================================

-- Users can view their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

-- Organizers can view orders for their events
DROP POLICY IF EXISTS "Organizers can view event orders" ON orders;
CREATE POLICY "Organizers can view event orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = orders.event_id 
            AND events.organizer_id = auth.uid()
        )
    );

-- Users can create orders (for checkout)
DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Service role can update orders (for webhooks)
DROP POLICY IF EXISTS "Service can update orders" ON orders;
CREATE POLICY "Service can update orders"
    ON orders FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- =============================================
-- 6. ORDER_ITEMS POLICIES
-- =============================================

-- Users can view their own order items
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Organizers can view order items for their events
DROP POLICY IF EXISTS "Organizers can view event order items" ON order_items;
CREATE POLICY "Organizers can view event order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            JOIN events ON events.id = orders.event_id
            WHERE orders.id = order_items.order_id 
            AND events.organizer_id = auth.uid()
        )
    );

-- Service role can insert order items
DROP POLICY IF EXISTS "Service can insert order items" ON order_items;
CREATE POLICY "Service can insert order items"
    ON order_items FOR INSERT
    WITH CHECK (true);

-- =============================================
-- 7. TICKETS POLICIES
-- =============================================

-- Users can view their own tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON tickets;
CREATE POLICY "Users can view own tickets"
    ON tickets FOR SELECT
    USING (auth.uid() = user_id);

-- Organizers can view tickets for their events
DROP POLICY IF EXISTS "Organizers can view event tickets" ON tickets;
CREATE POLICY "Organizers can view event tickets"
    ON tickets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = tickets.event_id 
            AND events.organizer_id = auth.uid()
        )
    );

-- Organizers can update tickets (for check-in)
DROP POLICY IF EXISTS "Organizers can update tickets" ON tickets;
CREATE POLICY "Organizers can update tickets"
    ON tickets FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = tickets.event_id 
            AND events.organizer_id = auth.uid()
        )
    );

-- Service role can create tickets (from webhooks)
DROP POLICY IF EXISTS "Service can create tickets" ON tickets;
CREATE POLICY "Service can create tickets"
    ON tickets FOR INSERT
    WITH CHECK (true);

-- =============================================
-- 8. CHECK_INS POLICIES
-- =============================================

-- Organizers can view check-ins for their events
DROP POLICY IF EXISTS "Organizers can view check-ins" ON check_ins;
CREATE POLICY "Organizers can view check-ins"
    ON check_ins FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = check_ins.event_id 
            AND events.organizer_id = auth.uid()
        )
    );

-- Organizers can create check-ins
DROP POLICY IF EXISTS "Organizers can create check-ins" ON check_ins;
CREATE POLICY "Organizers can create check-ins"
    ON check_ins FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = check_ins.event_id 
            AND events.organizer_id = auth.uid()
        )
    );

-- =============================================
-- 9. GRANT SERVICE ROLE BYPASS
-- =============================================
-- The service role key bypasses RLS by default
-- This is used for webhooks and server-side operations

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these to verify policies are in place:

-- SELECT tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
