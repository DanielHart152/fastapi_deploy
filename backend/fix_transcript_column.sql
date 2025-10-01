-- Fix transcript_data column to be TEXT instead of JSONB
ALTER TABLE meetings ALTER COLUMN transcript_data TYPE TEXT;