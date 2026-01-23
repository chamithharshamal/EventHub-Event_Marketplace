-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- Event Marketplace & Ticketing System - Consolidated & Fixed
-- =============================================

-- =============================================
-- 1. ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE IF EXISTS public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.waitlists ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. TENANTS POLICIES
-- =============================================

-- Enable SELECT for authenticated users so they can find an existing tenant
DROP POLICY IF EXISTS "Allow authenticated SELECT on tenants" ON public.tenants;
CREATE POLICY "Allow authenticated SELECT on tenants"
    ON public.tenants FOR SELECT
    TO authenticated
    USING (true);

-- Enable INSERT for authenticated users so they can create their first tenant
DROP POLICY IF EXISTS "Allow authenticated INSERT on tenants" ON public.tenants;
CREATE POLICY "Allow authenticated INSERT on tenants"
    ON public.tenants FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Enable UPDATE for users to manage their own tenant
DROP POLICY IF EXISTS "Allow users to UPDATE their own tenant" ON public.tenants;
CREATE POLICY "Allow users to UPDATE their own tenant"
    ON public.tenants FOR UPDATE
    TO authenticated
    USING (
        id IN (
            SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- =============================================
-- 3. PROFILES POLICIES
-- =============================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on signup)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Public profiles are viewable (for organizers)
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
CREATE POLICY "Public profiles are viewable"
    ON public.profiles FOR SELECT
    USING (is_public = true);

-- =============================================
-- 4. EVENTS POLICIES
-- =============================================

-- Anyone can view published events
DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;
CREATE POLICY "Anyone can view published events"
    ON public.events FOR SELECT
    USING (status = 'published');

-- Organizers can view their own events (any status)
DROP POLICY IF EXISTS "Organizers can view own events" ON public.events;
CREATE POLICY "Organizers can view own events"
    ON public.events FOR SELECT
    USING (auth.uid() = organizer_id);

-- Organizers can create events
DROP POLICY IF EXISTS "Organizers can create events" ON public.events;
CREATE POLICY "Organizers can create events"
    ON public.events FOR INSERT
    WITH CHECK (auth.uid() = organizer_id);

-- Organizers can update their own events
DROP POLICY IF EXISTS "Organizers can update their own events" ON public.events;
CREATE POLICY "Organizers can update their own events"
    ON public.events FOR UPDATE
    USING (auth.uid() = organizer_id);

-- Organizers can delete their own events
DROP POLICY IF EXISTS "Organizers can delete own events" ON public.events;
CREATE POLICY "Organizers can delete own events"
    ON public.events FOR DELETE
    USING (auth.uid() = organizer_id);

-- ADMIN: Admins can view/update all events using the safe is_admin() function
DROP POLICY IF EXISTS "Admins can view all events" ON public.events;
CREATE POLICY "Admins can view all events"
    ON public.events FOR SELECT
    USING ( is_admin() );

DROP POLICY IF EXISTS "Admins can update any event" ON public.events;
CREATE POLICY "Admins can update any event"
    ON public.events FOR UPDATE
    USING ( is_admin() )
    WITH CHECK ( is_admin() );

-- =============================================
-- 5. TICKET_TYPES POLICIES
-- =============================================

-- Anyone can view ticket types for published events
DROP POLICY IF EXISTS "Anyone can view ticket types" ON public.ticket_types;
CREATE POLICY "Anyone can view ticket types"
    ON public.ticket_types FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = ticket_types.event_id 
            AND (events.status = 'published' OR events.organizer_id = auth.uid() OR is_admin())
        )
    );

-- Organizers can manage ticket types for their events
DROP POLICY IF EXISTS "Organizers can manage ticket types" ON public.ticket_types;
CREATE POLICY "Organizers can manage ticket types"
    ON public.ticket_types FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = ticket_types.event_id 
            AND events.organizer_id = auth.uid()
        )
    );

-- =============================================
-- 6. ORDERS POLICIES
-- =============================================

-- Users can view their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

-- Organizers can view orders for their events
DROP POLICY IF EXISTS "Organizers can view event orders" ON public.orders;
CREATE POLICY "Organizers can view event orders"
    ON public.orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = orders.event_id 
            AND events.organizer_id = auth.uid()
        )
    );

-- Users can create orders (for checkout)
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Service role can update orders (for webhooks)
DROP POLICY IF EXISTS "Service can update orders" ON public.orders;
CREATE POLICY "Service can update orders"
    ON public.orders FOR UPDATE
    USING (true);

-- =============================================
-- 7. TICKETS POLICIES
-- =============================================

-- Users can view their own tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON public.tickets;
CREATE POLICY "Users can view own tickets"
    ON public.tickets FOR SELECT
    USING (auth.uid() = user_id);

-- Organizers can view/update tickets for their events (for check-in)
DROP POLICY IF EXISTS "Organizers can manage event tickets" ON public.tickets;
CREATE POLICY "Organizers can manage event tickets"
    ON public.tickets FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = tickets.event_id 
            AND events.organizer_id = auth.uid()
        )
    );

-- =============================================
-- 8. FAVORITES & WAITLISTS
-- =============================================

-- Users can manage their own favorites
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;
CREATE POLICY "Users can manage own favorites"
    ON public.favorites FOR ALL
    USING (auth.uid() = user_id);

-- Users can manage their own waitlist entries
DROP POLICY IF EXISTS "Users can manage own waitlist entries" ON public.waitlists;
CREATE POLICY "Users can manage own waitlist entries"
    ON public.waitlists FOR ALL
    USING (auth.uid() = user_id);
