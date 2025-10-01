-- Add backend_meeting_id column if it doesn't exist
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS backend_meeting_id VARCHAR(255);