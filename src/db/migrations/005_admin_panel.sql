-- Page views (lightweight first-party analytics)
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path TEXT NOT NULL,
  page_type TEXT NOT NULL,  -- 'home', 'school_profile', 'school_listing', 'nursery_listing', 'compare', 'map', 'search', 'other'
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  referrer TEXT,
  utm_source TEXT, utm_medium TEXT, utm_campaign TEXT,
  ip_address TEXT, user_agent TEXT, device_type TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_page_views_created ON page_views(created_at);
CREATE INDEX idx_page_views_page_type_created ON page_views(page_type, created_at DESC);
CREATE INDEX idx_page_views_school ON page_views(school_id);

-- Admin audit log
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id TEXT NOT NULL,
  action TEXT NOT NULL,       -- 'update_school', 'update_enquiry_status', 'approve_claim', etc.
  target_type TEXT NOT NULL,  -- 'school', 'enquiry', 'claim', 'user'
  target_id TEXT NOT NULL,
  changes JSONB,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_audit_log_created ON admin_audit_log(created_at DESC);

-- Additional indexes for admin queries
ALTER TABLE search_logs ADD COLUMN IF NOT EXISTS structured_intent JSONB;
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_school_claims_status ON school_claims(status);
CREATE INDEX IF NOT EXISTS idx_schools_is_verified ON schools(is_verified);
CREATE INDEX IF NOT EXISTS idx_schools_is_featured ON schools(is_featured);
