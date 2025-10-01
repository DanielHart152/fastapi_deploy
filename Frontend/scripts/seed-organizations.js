const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

async function seedOrganizations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    // Create organizations table (extends existing structure)
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

    // Add org_id column to existing meetings table
    await pool.query(`
      ALTER TABLE meetings 
      ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id)
    `)

    // Sample organizations data
    const organizations = [
      { name: 'TechCorp Solutions', description: 'Leading software development company', industry: 'Technology', size: 'Large', location: 'San Francisco, CA', website: 'https://techcorp.com' },
      { name: 'Global Finance Inc', description: 'International financial services provider', industry: 'Finance', size: 'Enterprise', location: 'New York, NY', website: 'https://globalfinance.com' },
      { name: 'HealthCare Plus', description: 'Innovative healthcare solutions', industry: 'Healthcare', size: 'Medium', location: 'Boston, MA', website: 'https://healthcareplus.com' },
      { name: 'EduTech Innovations', description: 'Educational technology platform', industry: 'Education', size: 'Medium', location: 'Austin, TX', website: 'https://edutech.com' },
      { name: 'Green Energy Co', description: 'Renewable energy solutions', industry: 'Energy', size: 'Large', location: 'Seattle, WA', website: 'https://greenenergy.com' },
      { name: 'Retail Masters', description: 'E-commerce and retail solutions', industry: 'Retail', size: 'Large', location: 'Los Angeles, CA', website: 'https://retailmasters.com' },
      { name: 'Manufacturing Pro', description: 'Advanced manufacturing solutions', industry: 'Manufacturing', size: 'Enterprise', location: 'Detroit, MI', website: 'https://manufacturingpro.com' },
      { name: 'Creative Studios', description: 'Digital marketing and design agency', industry: 'Marketing', size: 'Small', location: 'Portland, OR', website: 'https://creativestudios.com' },
      { name: 'Legal Associates', description: 'Corporate legal services', industry: 'Legal', size: 'Medium', location: 'Washington, DC', website: 'https://legalassociates.com' },
      { name: 'Consulting Group', description: 'Business strategy consulting', industry: 'Consulting', size: 'Large', location: 'Chicago, IL', website: 'https://consultinggroup.com' }
    ]

    // Sample users data
    const users = [
      { email: 'john.doe@techcorp.com', full_name: 'John Doe', job_title: 'CEO', company: 'TechCorp Solutions' },
      { email: 'jane.smith@globalfinance.com', full_name: 'Jane Smith', job_title: 'CTO', company: 'Global Finance Inc' },
      { email: 'mike.johnson@healthcare.com', full_name: 'Mike Johnson', job_title: 'VP Engineering', company: 'HealthCare Plus' },
      { email: 'sarah.wilson@edutech.com', full_name: 'Sarah Wilson', job_title: 'Product Manager', company: 'EduTech Innovations' },
      { email: 'david.brown@greenenergy.com', full_name: 'David Brown', job_title: 'Director', company: 'Green Energy Co' },
      { email: 'lisa.davis@retail.com', full_name: 'Lisa Davis', job_title: 'Marketing Manager', company: 'Retail Masters' },
      { email: 'robert.miller@manufacturing.com', full_name: 'Robert Miller', job_title: 'Operations Manager', company: 'Manufacturing Pro' },
      { email: 'emily.garcia@creative.com', full_name: 'Emily Garcia', job_title: 'Creative Director', company: 'Creative Studios' },
      { email: 'james.martinez@legal.com', full_name: 'James Martinez', job_title: 'Senior Partner', company: 'Legal Associates' },
      { email: 'maria.rodriguez@consulting.com', full_name: 'Maria Rodriguez', job_title: 'Principal Consultant', company: 'Consulting Group' },
      { email: 'alex.thompson@techcorp.com', full_name: 'Alex Thompson', job_title: 'Senior Developer', company: 'TechCorp Solutions' },
      { email: 'jennifer.lee@globalfinance.com', full_name: 'Jennifer Lee', job_title: 'Financial Analyst', company: 'Global Finance Inc' },
      { email: 'chris.anderson@healthcare.com', full_name: 'Chris Anderson', job_title: 'Data Scientist', company: 'HealthCare Plus' },
      { email: 'amanda.taylor@edutech.com', full_name: 'Amanda Taylor', job_title: 'UX Designer', company: 'EduTech Innovations' },
      { email: 'kevin.white@greenenergy.com', full_name: 'Kevin White', job_title: 'Project Manager', company: 'Green Energy Co' }
    ]

    // Insert users with password "password123"
    const passwordHash = await bcrypt.hash('password123', 10)
    const userIds = []
    for (const user of users) {
      const result = await pool.query(`
        INSERT INTO users (email, password_hash, full_name, job_title, company, role, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          job_title = EXCLUDED.job_title,
          company = EXCLUDED.company
        RETURNING id
      `, [user.email, passwordHash, user.full_name, user.job_title, user.company, 'user', 'active'])
      userIds.push(result.rows[0].id)
    }

    // Insert organizations
    const orgIds = []
    for (let i = 0; i < organizations.length; i++) {
      const org = organizations[i]
      const adminId = userIds[i] // First user of each org is admin
      const result = await pool.query(`
        INSERT INTO organizations (name, description, industry, size, location, website, admin_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [org.name, org.description, org.industry, org.size, org.location, org.website, adminId])
      orgIds.push(result.rows[0].id)
    }

    // Insert organization members
    const roles = ['admin', 'manager', 'member']
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Legal', 'Design', 'Product', 'Support']
    const positions = ['Senior', 'Junior', 'Lead', 'Principal', 'Associate', 'Director', 'Manager', 'Specialist', 'Coordinator', 'Analyst']

    for (let i = 0; i < orgIds.length; i++) {
      const orgId = orgIds[i]
      
      // Add admin
      await pool.query(`
        INSERT INTO organization_members (org_id, user_id, role, department, position)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (org_id, user_id) DO NOTHING
      `, [orgId, userIds[i], 'admin', departments[i % departments.length], 'Director'])

      // Add additional members
      for (let j = 1; j <= 3; j++) {
        const userIndex = (i * 3 + j) % userIds.length
        if (userIndex !== i) { // Don't add admin again
          await pool.query(`
            INSERT INTO organization_members (org_id, user_id, role, department, position)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (org_id, user_id) DO NOTHING
          `, [orgId, userIds[userIndex], roles[j % roles.length], departments[j % departments.length], positions[j % positions.length]])
        }
      }
    }

    // Sample meetings data
    const meetingTypes = ['Team Standup', 'Project Review', 'Client Meeting', 'Board Meeting', 'Training Session', 'Strategy Planning', 'Performance Review', 'Product Demo', 'Sales Call', 'All Hands']
    const statuses = ['scheduled', 'completed', 'in_progress', 'cancelled']
    const modes = ['video', 'audio', 'hybrid']

    for (let i = 0; i < 50; i++) {
      const orgId = orgIds[i % orgIds.length]
      const createdBy = userIds[i % userIds.length]
      const meetingDate = new Date()
      meetingDate.setDate(meetingDate.getDate() + Math.floor(Math.random() * 30) - 15) // Random date within ±15 days
      
      await pool.query(`
        INSERT INTO meetings (title, description, org_id, meeting_date, meeting_time, duration, mode, status, created_by, participants)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        `${meetingTypes[i % meetingTypes.length]} #${i + 1}`,
        `Important ${meetingTypes[i % meetingTypes.length].toLowerCase()} to discuss current projects and objectives`,
        orgId,
        meetingDate.toISOString().split('T')[0],
        `${9 + (i % 8)}:00:00`, // Meeting times between 9 AM and 4 PM
        30 + (i % 4) * 15, // Duration: 30, 45, 60, or 75 minutes
        modes[i % modes.length],
        statuses[i % statuses.length],
        createdBy,
        JSON.stringify([
          { userId: createdBy, name: users[i % users.length].full_name, role: 'host' },
          { userId: userIds[(i + 1) % userIds.length], name: users[(i + 1) % users.length].full_name, role: 'participant' },
          { userId: userIds[(i + 2) % userIds.length], name: users[(i + 2) % users.length].full_name, role: 'participant' }
        ])
      ])
    }

    console.log('✅ Successfully seeded database with:')
    console.log(`   - ${organizations.length} organizations`)
    console.log(`   - ${users.length} users`)
    console.log(`   - ${orgIds.length * 4} organization memberships`)
    console.log(`   - 50 meetings`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await pool.end()
  }
}

// Run if called directly
if (require.main === module) {
  seedOrganizations()
}

module.exports = { seedOrganizations }