-- mydscvr.ai — Full PostgreSQL Schema
-- Run this against your Railway PostgreSQL database

-- Enable extensions
-- Note: pgvector (CREATE EXTENSION vector) is NOT available on Railway PostgreSQL.
-- Embeddings are stored as FLOAT8[] and cosine similarity is computed in application code.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SCHOOLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS schools (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                  TEXT UNIQUE NOT NULL,
  name                  TEXT NOT NULL,
  type                  TEXT NOT NULL,

  -- Location
  address               TEXT,
  area                  TEXT,
  city                  TEXT DEFAULT 'Dubai',
  latitude              DECIMAL(10, 8),
  longitude             DECIMAL(11, 8),
  google_place_id       TEXT,

  -- Identity
  curriculum            TEXT[],
  phases                TEXT[],
  gender                TEXT DEFAULT 'mixed',
  religion              TEXT DEFAULT 'non-denominational',
  languages             TEXT[],

  -- KHDA Data
  khda_rating           TEXT,
  khda_rating_year      INTEGER,
  khda_school_id        TEXT,
  khda_center_id        TEXT,
  khda_inspection_url   TEXT,
  khda_report_path      TEXT,
  founded_year          INTEGER,
  wellbeing_rating      TEXT,
  inclusion_rating      TEXT,
  principal_name        TEXT,
  dsib_quality_indicators JSONB,

  -- Fees (AED per year)
  fee_min               INTEGER,
  fee_max               INTEGER,
  fee_currency          TEXT DEFAULT 'AED',
  fee_structure         JSONB,
  fee_source_url        TEXT,
  fee_last_updated      TIMESTAMP,

  -- Capacity
  total_students        INTEGER,
  capacity              INTEGER,

  -- Description
  description           TEXT,

  -- Contact
  website               TEXT,
  phone                 TEXT,
  email                 TEXT,
  whatsapp              TEXT,
  admission_email       TEXT,

  -- Google Data
  google_rating         DECIMAL(2,1),
  google_review_count   INTEGER,
  google_photos         JSONB,
  google_maps_url       TEXT,

  -- Features / Tags
  has_sen_support       BOOLEAN DEFAULT false,
  has_transport         BOOLEAN DEFAULT false,
  has_boarding          BOOLEAN DEFAULT false,
  has_after_school      BOOLEAN DEFAULT false,
  has_sports_facilities BOOLEAN DEFAULT false,
  has_swimming_pool     BOOLEAN DEFAULT false,
  has_arts_program      BOOLEAN DEFAULT false,
  is_accredited         BOOLEAN DEFAULT false,

  -- AI-generated content
  ai_summary            TEXT,
  ai_strengths          TEXT[],
  ai_considerations     TEXT[],

  -- Provenance
  source_url            TEXT,

  -- SEO
  meta_title            TEXT,
  meta_description      TEXT,

  -- Status
  is_active             BOOLEAN DEFAULT true,
  is_claimed            BOOLEAN DEFAULT false,
  is_featured           BOOLEAN DEFAULT false,
  is_verified           BOOLEAN DEFAULT false,

  -- Timestamps
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW(),
  last_scraped_at       TIMESTAMP
);

-- ============================================
-- EMBEDDINGS TABLE (for semantic search)
-- ============================================
-- Uses FLOAT8[] instead of pgvector's vector(1536) because Railway PG lacks pgvector.
-- Cosine similarity is computed in application code (src/lib/vectors.ts).
-- If migrating to pgvector-capable host (Supabase, Neon), change to vector(1536)
-- and use the <=> operator in SQL instead.
CREATE TABLE IF NOT EXISTS school_embeddings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id   UUID REFERENCES schools(id) ON DELETE CASCADE,
  embedding   FLOAT8[],
  content     TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- KHDA REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS khda_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id       UUID REFERENCES schools(id) ON DELETE CASCADE,
  year            INTEGER NOT NULL,
  rating          TEXT NOT NULL,
  report_url      TEXT,
  report_path     TEXT,
  raw_text        TEXT,
  ai_summary      TEXT,
  key_findings    JSONB,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- FEE HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS fee_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id   UUID REFERENCES schools(id) ON DELETE CASCADE,
  year        INTEGER NOT NULL,
  grade       TEXT,
  fee_aed     INTEGER NOT NULL,
  source      TEXT,
  scraped_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id     UUID REFERENCES schools(id) ON DELETE CASCADE,
  source        TEXT NOT NULL,
  rating        INTEGER,
  text          TEXT,
  author        TEXT,
  author_type   TEXT,
  language      TEXT DEFAULT 'en',
  is_verified   BOOLEAN DEFAULT false,
  sentiment     TEXT,
  ai_summary    TEXT,
  helpful_count INTEGER DEFAULT 0,
  published_at  TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ENQUIRIES TABLE (Lead Gen)
-- ============================================
CREATE TABLE IF NOT EXISTS enquiries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id       UUID REFERENCES schools(id),

  parent_name     TEXT NOT NULL,
  parent_email    TEXT NOT NULL,
  parent_phone    TEXT,
  parent_whatsapp TEXT,
  nationality     TEXT,
  current_area    TEXT,

  child_name      TEXT,
  child_dob       DATE,
  child_grade     TEXT,
  child_year      INTEGER,

  message         TEXT,
  preferred_start TEXT,
  siblings        BOOLEAN DEFAULT false,

  source          TEXT,
  search_query    TEXT,
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,

  status          TEXT DEFAULT 'new',
  sent_to_school_at TIMESTAMP,
  responded_at    TIMESTAMP,

  is_billed       BOOLEAN DEFAULT false,
  billed_at       TIMESTAMP,
  billed_amount   DECIMAL(10,2),

  created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- USERS TABLE (Parents)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id        TEXT UNIQUE NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  name            TEXT,
  phone           TEXT,
  nationality     TEXT,
  current_area    TEXT,
  children_count  INTEGER,
  plan            TEXT DEFAULT 'free',

  preferred_curricula    TEXT[],
  preferred_areas        TEXT[],
  budget_min             INTEGER,
  budget_max             INTEGER,

  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SAVED SCHOOLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saved_schools (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  school_id   UUID REFERENCES schools(id) ON DELETE CASCADE,
  notes       TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, school_id)
);

-- ============================================
-- SEARCH LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS search_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id),
  session_id    TEXT,
  query         TEXT NOT NULL,
  query_type    TEXT,
  filters       JSONB,
  results_count INTEGER,
  clicked_ids   UUID[],
  enquired_ids  UUID[],
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SCHOOL CLAIMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS school_claims (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id     UUID REFERENCES schools(id),
  contact_name  TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  role          TEXT,
  verified_at   TIMESTAMP,
  status        TEXT DEFAULT 'pending',
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SPONSORED PLACEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sponsorships (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id     UUID REFERENCES schools(id),
  type          TEXT NOT NULL,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  monthly_fee   DECIMAL(10,2),
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PIPELINE V2 RUNS
-- ============================================
CREATE TABLE IF NOT EXISTS pipeline_v2_runs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'running',
  context     JSONB,
  metrics     JSONB,
  error_text  TEXT,
  started_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at    TIMESTAMP
);

-- ============================================
-- PIPELINE V2 SNAPSHOTS
-- ============================================
CREATE TABLE IF NOT EXISTS pipeline_v2_snapshots (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  snapshot_type TEXT NOT NULL,
  source_name   TEXT NOT NULL,
  is_valid      BOOLEAN NOT NULL DEFAULT false,
  record_count  INTEGER NOT NULL DEFAULT 0,
  payload       JSONB NOT NULL,
  metrics       JSONB,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- PIPELINE V2 DLQ
-- ============================================
CREATE TABLE IF NOT EXISTS pipeline_v2_dlq (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name      TEXT NOT NULL,
  school_id     UUID,
  payload       JSONB,
  error_text    TEXT,
  attempts      INTEGER NOT NULL DEFAULT 1,
  next_retry_at TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved_at   TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- PIPELINE V2 SCHOOL STATE
-- ============================================
CREATE TABLE IF NOT EXISTS pipeline_v2_school_state (
  school_id            UUID PRIMARY KEY REFERENCES schools(id) ON DELETE CASCADE,
  core_source          TEXT,
  core_confidence      NUMERIC(4,3),
  fee_source           TEXT,
  fee_confidence       NUMERIC(4,3),
  last_core_synced_at  TIMESTAMP,
  last_fee_synced_at   TIMESTAMP,
  last_detail_synced_at TIMESTAMP,
  meta                 JSONB,
  updated_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- ENQUIRY USER LINKING
-- ============================================
-- Links enquiries to authenticated users
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- ============================================
-- USER NOTIFICATION PREFERENCES
-- ============================================
CREATE TABLE IF NOT EXISTS user_notification_prefs (
  user_id                     UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  enquiry_no_response_days    INTEGER DEFAULT 7,
  email_enquiry_updates       BOOLEAN DEFAULT true,
  email_school_news           BOOLEAN DEFAULT false,
  email_weekly_digest         BOOLEAN DEFAULT false,
  created_at                  TIMESTAMP DEFAULT NOW(),
  updated_at                  TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ENQUIRY NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS enquiry_notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_id      UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,  -- 'no_response_reminder'
  message         TEXT,
  sent_at         TIMESTAMP,
  read_at         TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_schools_area ON schools(area);
CREATE INDEX IF NOT EXISTS idx_schools_khda_rating ON schools(khda_rating);
CREATE INDEX IF NOT EXISTS idx_schools_type ON schools(type);
CREATE INDEX IF NOT EXISTS idx_schools_fee ON schools(fee_min, fee_max);
CREATE INDEX IF NOT EXISTS idx_schools_slug ON schools(slug);
CREATE INDEX IF NOT EXISTS idx_enquiries_school ON enquiries(school_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_reviews_school ON reviews(school_id);
CREATE INDEX IF NOT EXISTS idx_saved_schools_user ON saved_schools(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_created ON search_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_schools_last_scraped ON schools(last_scraped_at);
CREATE INDEX IF NOT EXISTS idx_schools_is_active ON schools(is_active);
CREATE INDEX IF NOT EXISTS idx_enquiries_user ON enquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_parent_email ON enquiries(parent_email);
CREATE INDEX IF NOT EXISTS idx_enquiry_notifications_user ON enquiry_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_notifications_enquiry ON enquiry_notifications(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_reviews_sentiment ON reviews(sentiment);
CREATE INDEX IF NOT EXISTS idx_pipeline_v2_runs_job_started ON pipeline_v2_runs(job_name, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_pipeline_v2_snapshots_type_created ON pipeline_v2_snapshots(snapshot_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pipeline_v2_dlq_job_next ON pipeline_v2_dlq(job_name, next_retry_at) WHERE resolved_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_fee_history_unique ON fee_history (school_id, year, grade, source);

-- ============================================
-- OUTBOUND CLICKS TABLE (Attribution tracking)
-- ============================================
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

CREATE INDEX IF NOT EXISTS idx_outbound_clicks_school ON outbound_clicks(school_id);
CREATE INDEX IF NOT EXISTS idx_outbound_clicks_created ON outbound_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_outbound_clicks_school_type_created
  ON outbound_clicks(school_id, click_type, created_at DESC);
