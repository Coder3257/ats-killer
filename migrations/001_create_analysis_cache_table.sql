-- Create analysis_cache table for caching Gemini resume analysis results
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS analysis_cache (
  hash TEXT PRIMARY KEY,  -- SHA-256 hash of resume + JD
  result_json JSONB NOT NULL,  -- Cached analysis result
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL  -- When cached
);

-- Optional: Create an index on created_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_analysis_cache_created_at ON analysis_cache(created_at);

-- Optional: Add a comment to explain the table
COMMENT ON TABLE analysis_cache IS 'Cached Gemini analysis results to avoid redundant API calls';
COMMENT ON COLUMN analysis_cache.hash IS 'SHA-256 hash of concatenated resume and job description';
COMMENT ON COLUMN analysis_cache.result_json IS 'The full analysis result JSON from Gemini';
COMMENT ON COLUMN analysis_cache.created_at IS 'Timestamp when this result was cached';