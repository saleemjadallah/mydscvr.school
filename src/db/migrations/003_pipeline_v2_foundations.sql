-- Migration 003: Pipeline v2 reliability foundations

ALTER TABLE schools ADD COLUMN IF NOT EXISTS khda_center_id TEXT;

CREATE TABLE IF NOT EXISTS pipeline_v2_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  context JSONB,
  metrics JSONB,
  error_text TEXT,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pipeline_v2_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  snapshot_type TEXT NOT NULL,
  source_name TEXT NOT NULL,
  is_valid BOOLEAN NOT NULL DEFAULT false,
  record_count INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL,
  metrics JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pipeline_v2_dlq (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name TEXT NOT NULL,
  school_id UUID,
  payload JSONB,
  error_text TEXT,
  attempts INTEGER NOT NULL DEFAULT 1,
  next_retry_at TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pipeline_v2_school_state (
  school_id UUID PRIMARY KEY REFERENCES schools(id) ON DELETE CASCADE,
  core_source TEXT,
  core_confidence NUMERIC(4,3),
  fee_source TEXT,
  fee_confidence NUMERIC(4,3),
  last_core_synced_at TIMESTAMP,
  last_fee_synced_at TIMESTAMP,
  last_detail_synced_at TIMESTAMP,
  meta JSONB,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fee_history_unique
  ON fee_history (school_id, year, grade, source);
