const { Pool } = require('pg')

const pool = new Pool({
  connectionString: 'postgresql://postgres:password@localhost:5432/open_meeting'
})

async function addBackendMeetingIdColumn() {
  try {
    await pool.query('ALTER TABLE meetings ADD COLUMN IF NOT EXISTS backend_meeting_id VARCHAR(255)')
    console.log('✅ Added backend_meeting_id column')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await pool.end()
  }
}

addBackendMeetingIdColumn()