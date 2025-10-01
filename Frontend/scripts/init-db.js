const { Pool } = require('pg')

async function initDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        company VARCHAR(255),
        organization VARCHAR(255),
        phone_number VARCHAR(50),
        job_title VARCHAR(255),
        address TEXT,
        voice_print_id VARCHAR(255),
        voice_print_status VARCHAR(50) DEFAULT 'not_configured',
        voice_print_data JSONB,
        avatar_url TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Create organizations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        industry VARCHAR(100),
        size VARCHAR(50),
        location VARCHAR(255),
        website VARCHAR(255),
        admin_id UUID REFERENCES users(id),
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Create organization members table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS organization_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        department VARCHAR(100),
        position VARCHAR(100),
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(org_id, user_id)
      )
    `)

    // Create meetings table with org_id
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        org_id UUID REFERENCES organizations(id),
        meeting_date DATE,
        meeting_time TIME,
        duration INTEGER,
        mode VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'scheduled',
        participants JSONB DEFAULT '[]',
        settings JSONB DEFAULT '{}',
        created_by UUID REFERENCES users(id),
        backend_meeting_id VARCHAR(255),
        transcript_data JSONB,
        topics_data JSONB,
        speakers_data JSONB,
        ai_summary TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
    console.log('Database tables created successfully (users, organizations, organization_members, meetings)')
  } catch (error) {
    console.error('Database initialization failed:', error)
  } finally {
    await pool.end()
  }
}

// Export function for use in other scripts
module.exports = { initDatabase }

// Run if called directly
if (require.main === module) {
  initDatabase()
}