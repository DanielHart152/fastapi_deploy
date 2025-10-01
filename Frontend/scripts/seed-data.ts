import { query } from './db'

export interface SeedOrganization {
  name: string
  description: string
  industry: string
  size: string
  location: string
  website: string
}

export interface SeedUser {
  email: string
  fullName: string
  jobTitle: string
  company: string
  department?: string
  phone?: string
}

export interface SeedMeeting {
  title: string
  description: string
  date: string
  time: string
  duration: number
  mode: 'video' | 'audio' | 'hybrid'
  status: 'scheduled' | 'completed' | 'in_progress' | 'cancelled'
}

export async function seedOrganizationData() {
  try {
    // Create tables if they don't exist
    await createTables()
    
    // Sample data
    const organizations: SeedOrganization[] = [
      { name: 'TechCorp Solutions', description: 'Leading software development company specializing in AI and cloud solutions', industry: 'Technology', size: 'Large', location: 'San Francisco, CA', website: 'https://techcorp.com' },
      { name: 'Global Finance Inc', description: 'International financial services provider with focus on digital banking', industry: 'Finance', size: 'Enterprise', location: 'New York, NY', website: 'https://globalfinance.com' },
      { name: 'HealthCare Plus', description: 'Innovative healthcare solutions using telemedicine and AI diagnostics', industry: 'Healthcare', size: 'Medium', location: 'Boston, MA', website: 'https://healthcareplus.com' },
      { name: 'EduTech Innovations', description: 'Educational technology platform for remote learning and skill development', industry: 'Education', size: 'Medium', location: 'Austin, TX', website: 'https://edutech.com' },
      { name: 'Green Energy Co', description: 'Renewable energy solutions including solar and wind power systems', industry: 'Energy', size: 'Large', location: 'Seattle, WA', website: 'https://greenenergy.com' },
      { name: 'Retail Masters', description: 'E-commerce and retail solutions with omnichannel experience', industry: 'Retail', size: 'Large', location: 'Los Angeles, CA', website: 'https://retailmasters.com' },
      { name: 'Manufacturing Pro', description: 'Advanced manufacturing solutions with IoT and automation', industry: 'Manufacturing', size: 'Enterprise', location: 'Detroit, MI', website: 'https://manufacturingpro.com' },
      { name: 'Creative Studios', description: 'Digital marketing and design agency specializing in brand experiences', industry: 'Marketing', size: 'Small', location: 'Portland, OR', website: 'https://creativestudios.com' },
      { name: 'Legal Associates', description: 'Corporate legal services with expertise in tech and startup law', industry: 'Legal', size: 'Medium', location: 'Washington, DC', website: 'https://legalassociates.com' },
      { name: 'Consulting Group', description: 'Business strategy consulting for digital transformation', industry: 'Consulting', size: 'Large', location: 'Chicago, IL', website: 'https://consultinggroup.com' },
      { name: 'DataTech Analytics', description: 'Big data analytics and business intelligence solutions', industry: 'Technology', size: 'Medium', location: 'Denver, CO', website: 'https://datatech.com' },
      { name: 'BioMed Research', description: 'Biotechnology research and pharmaceutical development', industry: 'Healthcare', size: 'Large', location: 'San Diego, CA', website: 'https://biomed.com' }
    ]

    const users: SeedUser[] = [
      { email: 'john.doe@techcorp.com', fullName: 'John Doe', jobTitle: 'CEO', company: 'TechCorp Solutions', department: 'Executive', phone: '+1-555-0101' },
      { email: 'jane.smith@globalfinance.com', fullName: 'Jane Smith', jobTitle: 'CTO', company: 'Global Finance Inc', department: 'Technology', phone: '+1-555-0102' },
      { email: 'mike.johnson@healthcare.com', fullName: 'Mike Johnson', jobTitle: 'VP Engineering', company: 'HealthCare Plus', department: 'Engineering', phone: '+1-555-0103' },
      { email: 'sarah.wilson@edutech.com', fullName: 'Sarah Wilson', jobTitle: 'Product Manager', company: 'EduTech Innovations', department: 'Product', phone: '+1-555-0104' },
      { email: 'david.brown@greenenergy.com', fullName: 'David Brown', jobTitle: 'Director of Operations', company: 'Green Energy Co', department: 'Operations', phone: '+1-555-0105' },
      { email: 'lisa.davis@retail.com', fullName: 'Lisa Davis', jobTitle: 'Marketing Manager', company: 'Retail Masters', department: 'Marketing', phone: '+1-555-0106' },
      { email: 'robert.miller@manufacturing.com', fullName: 'Robert Miller', jobTitle: 'Operations Manager', company: 'Manufacturing Pro', department: 'Operations', phone: '+1-555-0107' },
      { email: 'emily.garcia@creative.com', fullName: 'Emily Garcia', jobTitle: 'Creative Director', company: 'Creative Studios', department: 'Design', phone: '+1-555-0108' },
      { email: 'james.martinez@legal.com', fullName: 'James Martinez', jobTitle: 'Senior Partner', company: 'Legal Associates', department: 'Legal', phone: '+1-555-0109' },
      { email: 'maria.rodriguez@consulting.com', fullName: 'Maria Rodriguez', jobTitle: 'Principal Consultant', company: 'Consulting Group', department: 'Consulting', phone: '+1-555-0110' },
      { email: 'alex.thompson@techcorp.com', fullName: 'Alex Thompson', jobTitle: 'Senior Developer', company: 'TechCorp Solutions', department: 'Engineering', phone: '+1-555-0111' },
      { email: 'jennifer.lee@globalfinance.com', fullName: 'Jennifer Lee', jobTitle: 'Financial Analyst', company: 'Global Finance Inc', department: 'Finance', phone: '+1-555-0112' },
      { email: 'chris.anderson@healthcare.com', fullName: 'Chris Anderson', jobTitle: 'Data Scientist', company: 'HealthCare Plus', department: 'Data', phone: '+1-555-0113' },
      { email: 'amanda.taylor@edutech.com', fullName: 'Amanda Taylor', jobTitle: 'UX Designer', company: 'EduTech Innovations', department: 'Design', phone: '+1-555-0114' },
      { email: 'kevin.white@greenenergy.com', fullName: 'Kevin White', jobTitle: 'Project Manager', company: 'Green Energy Co', department: 'Project Management', phone: '+1-555-0115' }
    ]

    // Insert users first
    const userIds: string[] = []
    for (const user of users) {
      const result = await query(`
        INSERT INTO users (email, password_hash, full_name, job_title, company, phone_number, role, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          job_title = EXCLUDED.job_title,
          company = EXCLUDED.company,
          phone_number = EXCLUDED.phone_number
        RETURNING id
      `, [user.email, '$2b$10$dummy.hash.for.demo', user.fullName, user.jobTitle, user.company, user.phone, 'user', 'active'])
      userIds.push(result.rows[0].id)
    }

    // Insert organizations
    const orgIds: string[] = []
    for (let i = 0; i < organizations.length; i++) {
      const org = organizations[i]
      const adminId = userIds[i % userIds.length]
      const result = await query(`
        INSERT INTO organizations (name, description, industry, size, location, website, admin_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [org.name, org.description, org.industry, org.size, org.location, org.website, adminId])
      orgIds.push(result.rows[0].id)
    }

    // Insert organization members with roles
    const roles = ['admin', 'manager', 'member']
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Legal', 'Design', 'Product', 'Support', 'Data', 'Executive']
    const positions = ['Senior', 'Junior', 'Lead', 'Principal', 'Associate', 'Director', 'Manager', 'Specialist', 'Coordinator', 'Analyst']

    for (let i = 0; i < orgIds.length; i++) {
      const orgId = orgIds[i]
      
      // Add admin (organization creator)
      await query(`
        INSERT INTO organization_members (org_id, user_id, role, department, position)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (org_id, user_id) DO NOTHING
      `, [orgId, userIds[i % userIds.length], 'admin', departments[i % departments.length], 'Director'])

      // Add 3-5 additional members per organization
      const memberCount = 3 + Math.floor(Math.random() * 3)
      for (let j = 1; j <= memberCount; j++) {
        const userIndex = (i * memberCount + j) % userIds.length
        if (userIndex !== i % userIds.length) { // Don't add admin again
          await query(`
            INSERT INTO organization_members (org_id, user_id, role, department, position)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (org_id, user_id) DO NOTHING
          `, [orgId, userIds[userIndex], roles[j % roles.length], departments[j % departments.length], positions[j % positions.length]])
        }
      }
    }

    // Insert meetings
    const meetingTypes = ['Team Standup', 'Project Review', 'Client Meeting', 'Board Meeting', 'Training Session', 'Strategy Planning', 'Performance Review', 'Product Demo', 'Sales Call', 'All Hands', 'Sprint Planning', 'Retrospective']
    const statuses: Array<'scheduled' | 'completed' | 'in_progress' | 'cancelled'> = ['scheduled', 'completed', 'in_progress', 'cancelled']
    const modes: Array<'video' | 'audio' | 'hybrid'> = ['video', 'audio', 'hybrid']

    for (let i = 0; i < 60; i++) {
      const orgId = orgIds[i % orgIds.length]
      const createdBy = userIds[i % userIds.length]
      const meetingDate = new Date()
      meetingDate.setDate(meetingDate.getDate() + Math.floor(Math.random() * 60) - 30) // Random date within ±30 days
      
      const participantCount = 2 + Math.floor(Math.random() * 4) // 2-5 participants
      const participants = []
      for (let p = 0; p < participantCount; p++) {
        const userIndex = (i + p) % userIds.length
        participants.push({
          userId: userIds[userIndex],
          name: users[userIndex].fullName,
          role: p === 0 ? 'host' : 'participant'
        })
      }

      await query(`
        INSERT INTO meetings (title, description, org_id, meeting_date, meeting_time, duration, mode, status, created_by, participants)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        `${meetingTypes[i % meetingTypes.length]} #${i + 1}`,
        `Important ${meetingTypes[i % meetingTypes.length].toLowerCase()} to discuss current projects, objectives, and strategic initiatives`,
        orgId,
        meetingDate.toISOString().split('T')[0],
        `${9 + (i % 8)}:${(i % 4) * 15}:00`, // Meeting times between 9:00 AM and 4:45 PM
        30 + (i % 4) * 15, // Duration: 30, 45, 60, or 75 minutes
        modes[i % modes.length],
        statuses[i % statuses.length],
        createdBy,
        JSON.stringify(participants)
      ])
    }

    return {
      success: true,
      message: `Successfully seeded database with ${organizations.length} organizations, ${users.length} users, and 60 meetings`
    }

  } catch (error) {
    console.error('Error seeding organization data:', error)
    return {
      success: false,
      message: `Failed to seed data: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

async function createTables() {
  // Create organizations table
  await query(`
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
  await query(`
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

  // Update meetings table to include org_id if not exists
  await query(`
    ALTER TABLE meetings 
    ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id)
  `)
}