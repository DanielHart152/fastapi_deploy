-- Add columns for pre-recorded meeting processing
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS file_path VARCHAR(255);
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS backend_meeting_id VARCHAR(255);
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS transcript_data TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS hierarchical_data JSONB;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS speakers_data JSONB;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS ai_summary JSONB;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS topics_data JSONB;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS processing_info JSONB;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS meeting_type VARCHAR(50) DEFAULT 'public';
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS access_level VARCHAR(50) DEFAULT 'public';

-- Create meeting logs table for tracking processing
CREATE TABLE IF NOT EXISTS meeting_logs (
    id SERIAL PRIMARY KEY,
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    log_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_mode ON meetings(mode);
CREATE INDEX IF NOT EXISTS idx_meeting_logs_meeting_id ON meeting_logs(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_logs_created_at ON meeting_logs(created_at);