-- Event Marketplace & Ticketing System
-- Supabase SQL Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TENANTS (Organizations)
-- ============================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    logo_url TEXT,
    stripe_account_id TEXT,
    subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- ============================================
-- PROFILES (Users)
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id),
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT DEFAULT 'attendee' CHECK (role IN ('admin', 'organizer', 'staff', 'attendee')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EVENTS
-- ============================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES profiles(id),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    category TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
    
    -- Location
    venue_name TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    is_online BOOLEAN DEFAULT false,
    stream_url TEXT,
    
    -- Timing
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    
    -- Media
    banner_url TEXT,
    gallery JSONB DEFAULT '[]',
    
    -- Settings
    max_capacity INTEGER,
    is_private BOOLEAN DEFAULT false,
    refund_policy TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, slug)
);

-- ============================================
-- TICKET TYPES
-- ============================================
CREATE TABLE ticket_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    quantity_total INTEGER NOT NULL,
    quantity_sold INTEGER DEFAULT 0,
    max_per_order INTEGER DEFAULT 10,
    sales_start TIMESTAMPTZ,
    sales_end TIMESTAMPTZ,
    is_transferable BOOLEAN DEFAULT true,
    perks JSONB DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    event_id UUID NOT NULL REFERENCES events(id),
    
    subtotal DECIMAL(10,2) NOT NULL,
    service_fee DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    stripe_payment_intent_id TEXT,
    stripe_checkout_session_id TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TICKETS
-- ============================================
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    event_id UUID NOT NULL REFERENCES events(id),
    ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
    order_id UUID NOT NULL REFERENCES orders(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    
    status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'cancelled', 'transferred')),
    
    -- QR Code
    qr_code_data TEXT NOT NULL,
    qr_signature TEXT NOT NULL,
    
    -- Attendee Info
    attendee_name TEXT,
    attendee_email TEXT,
    
    -- Check-in
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES profiles(id),
    
    -- Transfer
    original_owner_id UUID REFERENCES profiles(id),
    transferred_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHECK-INS (Audit Log)
-- ============================================
CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id),
    event_id UUID NOT NULL REFERENCES events(id),
    staff_id UUID REFERENCES profiles(id),
    
    status TEXT NOT NULL,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    device_info JSONB
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_profiles_tenant ON profiles(tenant_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_events_tenant ON events(tenant_id);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_ticket_types_event ON ticket_types(event_id);
CREATE INDEX idx_orders_tenant ON orders(tenant_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_event ON orders(event_id);
CREATE INDEX idx_tickets_tenant ON tickets(tenant_id);
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_order ON tickets(order_id);
CREATE INDEX idx_check_ins_ticket ON check_ins(ticket_id);
CREATE INDEX idx_check_ins_event ON check_ins(event_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Organizers can view tenant profiles"
    ON profiles FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'organizer')
        )
    );

-- Events Policies
CREATE POLICY "Published events are public"
    ON events FOR SELECT
    USING (status = 'published' AND is_private = false);

CREATE POLICY "Organizers can manage their events"
    ON events FOR ALL
    USING (organizer_id = auth.uid());

CREATE POLICY "Tenant members can view tenant events"
    ON events FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Ticket Types Policies
CREATE POLICY "Public events ticket types are visible"
    ON ticket_types FOR SELECT
    USING (
        event_id IN (
            SELECT id FROM events WHERE status = 'published' AND is_private = false
        )
    );

CREATE POLICY "Organizers can manage ticket types"
    ON ticket_types FOR ALL
    USING (
        event_id IN (
            SELECT id FROM events WHERE organizer_id = auth.uid()
        )
    );

-- Orders Policies
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create orders"
    ON orders FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Organizers can view event orders"
    ON orders FOR SELECT
    USING (
        event_id IN (
            SELECT id FROM events WHERE organizer_id = auth.uid()
        )
    );

-- Order Items Policies
CREATE POLICY "Users can view own order items"
    ON order_items FOR SELECT
    USING (
        order_id IN (
            SELECT id FROM orders WHERE user_id = auth.uid()
        )
    );

-- Tickets Policies
CREATE POLICY "Users can view own tickets"
    ON tickets FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Staff can validate tickets"
    ON tickets FOR UPDATE
    USING (
        event_id IN (
            SELECT e.id FROM events e
            JOIN profiles p ON p.tenant_id = e.tenant_id
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'organizer', 'staff')
        )
    );

CREATE POLICY "Organizers can view event tickets"
    ON tickets FOR SELECT
    USING (
        event_id IN (
            SELECT id FROM events WHERE organizer_id = auth.uid()
        )
    );

-- Check-ins Policies
CREATE POLICY "Staff can create check-ins"
    ON check_ins FOR INSERT
    WITH CHECK (
        event_id IN (
            SELECT e.id FROM events e
            JOIN profiles p ON p.tenant_id = e.tenant_id
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'organizer', 'staff')
        )
    );

CREATE POLICY "Organizers can view check-ins"
    ON check_ins FOR SELECT
    USING (
        event_id IN (
            SELECT id FROM events WHERE organizer_id = auth.uid()
        )
    );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment ticket sold count
CREATE OR REPLACE FUNCTION increment_ticket_sold()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ticket_types
    SET quantity_sold = quantity_sold + 1
    WHERE id = NEW.ticket_type_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on ticket creation
CREATE TRIGGER on_ticket_created
    AFTER INSERT ON tickets
    FOR EACH ROW EXECUTE FUNCTION increment_ticket_sold();
