const { initDatabase } = require('./init-db')
const { seedOrganizations } = require('./seed-organizations')

async function setupDatabase() {
  console.log('🚀 Starting database setup...')
  
  try {
    // First initialize the database tables
    console.log('📋 Initializing database tables...')
    await initDatabase()
    
    // Then seed with organization data
    console.log('🌱 Seeding organization data...')
    await seedOrganizations()
    
    console.log('✅ Database setup completed successfully!')
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase()
}

module.exports = { setupDatabase }