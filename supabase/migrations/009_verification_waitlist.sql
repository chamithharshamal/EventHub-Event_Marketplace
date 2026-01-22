-- ============================================
-- ORGANIZER VERIFICATION & WAITLIST
-- Migration: 009_verification_waitlist.sql
-- ============================================

-- ========== ORGANIZER VERIFICATION ==========

-- Add verification columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Index for verified organizers
CREATE INDEX IF NOT EXISTS idx_profiles_verified 
    ON profiles(is_verified) 
    WHERE is_verified = true;

-- ========== WAITLIST ==========

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    position INTEGER NOT NULL,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'converted', 'expired')),
    notified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique user per event waitlist
    UNIQUE(event_id, user_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_waitlist_event ON waitlist(event_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_user ON waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_position ON waitlist(event_id, position);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status) WHERE status = 'waiting';

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own waitlist entries
CREATE POLICY "Users can view own waitlist entries"
    ON waitlist FOR SELECT
    USING (auth.uid() = user_id);

-- Event organizers can view their event waitlists
CREATE POLICY "Organizers can view event waitlists"
    ON waitlist FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = waitlist.event_id 
            AND events.organizer_id = auth.uid()
        )
    );

-- Users can join waitlist
CREATE POLICY "Users can join waitlist"
    ON waitlist FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can remove themselves from waitlist
CREATE POLICY "Users can leave waitlist"
    ON waitlist FOR DELETE
    USING (auth.uid() = user_id);

-- Function to get next waitlist position
CREATE OR REPLACE FUNCTION get_next_waitlist_position(p_event_id UUID)
RETURNS INTEGER AS $$
DECLARE
    max_position INTEGER;
BEGIN
    SELECT COALESCE(MAX(position), 0) + 1 INTO max_position
    FROM waitlist
    WHERE event_id = p_event_id;
    
    RETURN max_position;
END;
$$ LANGUAGE plpgsql;

-- Function to check if event is sold out
CREATE OR REPLACE FUNCTION is_event_sold_out(p_event_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    total_capacity INTEGER;
    tickets_sold INTEGER;
BEGIN
    -- Get total capacity from ticket types
    SELECT COALESCE(SUM(quantity), 0) INTO total_capacity
    FROM ticket_types
    WHERE event_id = p_event_id;
    
    -- Get tickets sold
    SELECT COUNT(*) INTO tickets_sold
    FROM tickets
    WHERE event_id = p_event_id
    AND status IN ('valid', 'used');
    
    RETURN tickets_sold >= total_capacity;
END;
$$ LANGUAGE plpgsql;
