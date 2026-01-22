-- ============================================
-- SEARCH INDEXES AND OPTIMIZATIONS
-- Migration: 006_search_indexes.sql
-- ============================================

-- Full-text search configuration for events
-- Create a generated column for full-text search
ALTER TABLE events ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(venue_name, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(city, '')), 'D')
    ) STORED;

-- Index for full-text search
CREATE INDEX IF NOT EXISTS idx_events_search_vector ON events USING gin(search_vector);

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_events_published_date ON events(status, start_date) 
    WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_events_category_date ON events(category, start_date)
    WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_events_city ON events(city)
    WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_events_country ON events(country)
    WHERE status = 'published';

-- Index for location-based searches (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_events_city_lower ON events(lower(city))
    WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_events_country_lower ON events(lower(country))
    WHERE status = 'published';

-- Function for full-text search with ranking
CREATE OR REPLACE FUNCTION search_events(search_query text)
RETURNS TABLE (
    id uuid,
    title text,
    slug text,
    description text,
    banner_url text,
    category text,
    city text,
    country text,
    start_date timestamptz,
    status text,
    rank real
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.title,
        e.slug,
        e.description,
        e.banner_url,
        e.category,
        e.city,
        e.country,
        e.start_date,
        e.status,
        ts_rank(e.search_vector, plainto_tsquery('english', search_query)) as rank
    FROM events e
    WHERE 
        e.status = 'published'
        AND e.search_vector @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_events(text) TO authenticated, anon;
