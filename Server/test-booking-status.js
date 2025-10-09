const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'calendar',
  password: process.env.DB_PASSWORD || '5432',
  port: process.env.DB_PORT || 5001,
});

async function testBookingStatus() {
  try {
    console.log('Testing booking status functionality...');
    
    // First, let's check the current table structure
    console.log('\n1. Checking table structure:');
    const structureResult = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'booking' AND column_name = 'status'
    `);
    console.log('Status column info:', structureResult.rows[0]);
    
    // Remove the DEFAULT constraint if it exists
    console.log('\n2. Removing DEFAULT constraint from status column...');
    try {
      await pool.query('ALTER TABLE booking ALTER COLUMN status DROP DEFAULT');
      console.log('DEFAULT constraint removed successfully');
    } catch (err) {
      console.log('Error removing DEFAULT constraint (might not exist):', err.message);
    }
    
    // Test inserting a booking with confirmed status
    console.log('\n3. Testing insert with confirmed status...');
    const testBooking = await pool.query(`
      INSERT INTO booking 
      (name, meeting_name, start_time, end_time, date, meeting_purpose, contact_number, email, team_category, team_sub_category, nirmaan_text, room_id, status) 
      VALUES ($1, $2, $3::timestamp, $4::timestamp, $5::date, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *
    `, [
      'Test User',
      'Test Meeting',
      '2025-01-01 10:00:00',
      '2025-01-01 11:00:00',
      '2025-01-01',
      'Test purpose',
      '1234567890',
      'test@example.com',
      '1',
      'Test Team',
      '',
      1,
      'confirmed'
    ]);
    
    console.log('Test booking created:', testBooking.rows[0]);
    
    // Clean up the test booking
    await pool.query('DELETE FROM booking WHERE email = $1', ['test@example.com']);
    console.log('Test booking cleaned up');
    
    console.log('\n✅ Status column fix completed successfully!');
    
  } catch (error) {
    console.error('Error testing booking status:', error);
  } finally {
    await pool.end();
  }
}

testBookingStatus();
