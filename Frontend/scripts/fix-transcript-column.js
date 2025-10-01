const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Hh4kWOGSX6eL@ep-rapid-base-ad1rw0e6-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function fixTranscriptColumn() {
  try {
    const sql = 'ALTER TABLE meetings ALTER COLUMN transcript_data TYPE TEXT;';
    
    const client = await pool.connect();
    await client.query(sql);
    client.release();
    
    console.log('Transcript column fixed successfully');
  } catch (error) {
    console.error('Fix failed:', error);
  } finally {
    await pool.end();
  }
}

fixTranscriptColumn();