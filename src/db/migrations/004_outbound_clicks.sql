-- 004_outbound_clicks.sql
-- Outbound click tracking for school attribution analytics

CREATE TABLE IF NOT EXISTS outbound_clicks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id     UUID REFERENCES schools(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  click_type    TEXT NOT NULL,  -- 'website', 'phone', 'whatsapp', 'email', 'maps'
  destination   TEXT NOT NULL,  -- full URL or phone number clicked
  source_page   TEXT,           -- e.g. 'school-profile', 'compare', 'search'
  search_query  TEXT,           -- what the parent searched before clicking
  session_id    TEXT,           -- optional session tracking
  ip_address    TEXT,           -- raw IP for unique visitor counting
  user_agent    TEXT,           -- for bot filtering
  utm_source    TEXT,
  utm_medium    TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Index for per-school analytics queries
CREATE INDEX IF NOT EXISTS idx_outbound_clicks_school ON outbound_clicks(school_id);

-- Index for time-range queries
CREATE INDEX IF NOT EXISTS idx_outbound_clicks_created ON outbound_clicks(created_at);

-- Composite index for the stats endpoint (school + type + time range)
CREATE INDEX IF NOT EXISTS idx_outbound_clicks_school_type_created
  ON outbound_clicks(school_id, click_type, created_at DESC);
