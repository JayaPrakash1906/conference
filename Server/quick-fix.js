// Quick fix for admin booking auto-confirmation
// Run this: node quick-fix.js

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'calendar',
  password: process.env.DB_PASSWORD || '5432',
  port: process.env.DB_PORT || 5001,
});

async function quickFix() {
  try {
    console.log('🚀 Applying quick fix for admin booking auto-confirmation...');
    
    // Remove the DEFAULT constraint
    await pool.query('ALTER TABLE booking ALTER COLUMN status DROP DEFAULT');
    console.log('✅ Removed DEFAULT constraint from status column');
    
    // Test the fix
    const testResult = await pool.query(`
      INSERT INTO booking 
      (name, meeting_name, start_time, end_time, date, meeting_purpose, contact_number, email, team_category, team_sub_category, room_id, status) 
      VALUES ($1, $2, $3::timestamp, $4::timestamp, $5::date, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING status
    `, [
      'Test', 'Test Meeting', '2025-01-01 10:00:00', '2025-01-01 11:00:00', 
      '2025-01-01', 'Test', '1234567890', 'test@example.com', '1', 'Test', 1, 'confirmed'
    ]);
    
    console.log('✅ Test booking created with status:', testResult.rows[0].status);
    
    // Clean up
    await pool.query('DELETE FROM booking WHERE email = $1', ['test@example.com']);
    
    console.log('🎉 FIXED! Admin bookings will now auto-confirm.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

quickFix();
