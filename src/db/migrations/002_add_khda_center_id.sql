-- Migration 002: persist KHDA center ID for stable detail URL reconstruction

ALTER TABLE schools ADD COLUMN IF NOT EXISTS khda_center_id TEXT;

UPDATE schools
SET
  khda_school_id = COALESCE(khda_school_id, substring(khda_inspection_url from 'Id=([0-9]+)')),
  khda_center_id = COALESCE(khda_center_id, substring(khda_inspection_url from 'CenterID=([0-9]+)'))
WHERE khda_inspection_url LIKE '%School-Details%';
