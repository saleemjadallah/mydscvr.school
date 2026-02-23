-- mydscvr.ai — Full PostgreSQL Schema
-- Run this against your Railway PostgreSQL database

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
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
  khda_inspection_url   TEXT,
  khda_report_path      TEXT,

  -- Fees (AED per year)
  fee_min               INTEGER,
  fee_max               INTEGER,
  fee_currency          TEXT DEFAULT 'AED',
  fee_last_updated      TIMESTAMP,

  -- Capacity
  total_students        INTEGER,
  capacity              INTEGER,

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
CREATE TABLE IF NOT EXISTS school_embeddings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id   UUID REFERENCES schools(id) ON DELETE CASCADE,
  embedding   vector(1536),
  content     TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_school_embeddings_vector
  ON school_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

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
