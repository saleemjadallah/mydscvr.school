-- Migration 001: Add columns needed by the data pipeline
-- Run against Railway PostgreSQL

-- School description (for SEO, embeddings, and AI context)
ALTER TABLE schools ADD COLUMN IF NOT EXISTS description TEXT;

-- Provenance: where the school record was discovered
ALTER TABLE schools ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Google Maps direct link
ALTER TABLE schools ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Fee discovery source
ALTER TABLE schools ADD COLUMN IF NOT EXISTS fee_source_url TEXT;

-- Current fee breakdown by grade (JSONB array of {grade_group, annual_fee})
ALTER TABLE schools ADD COLUMN IF NOT EXISTS fee_structure JSONB;
