const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'calendar',
  password: process.env.DB_PASSWORD || '5432',
  port: process.env.DB_PORT || 5001,
});

async function testAdminBooking() {
  try {
    console.log('🧪 Testing admin booking with confirmed status...');
    
    // Test inserting a booking with confirmed status
    const testBooking = await pool.query(`
      INSERT INTO booking 
      (name, meeting_name, start_time, end_time, date, meeting_purpose, contact_number, email, team_category, team_sub_category, nirmaan_text, room_id, status) 
      VALUES ($1, $2, $3::timestamp, $4::timestamp, $5::date, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *
    `, [
      'Test Admin User',
      'Admin Test Meeting',
      '2025-01-01 10:00:00',
      '2025-01-01 11:00:00',
      '2025-01-01',
      'Testing admin booking functionality',
      '1234567890',
      'admin-test@example.com',
      '1',
      'Test Team',
      '',
      1,
      'confirmed'
    ]);
    
    console.log('✅ Test booking created with status:', testBooking.rows[0].status);
    
    if (testBooking.rows[0].status === 'confirmed') {
      console.log('🎉 SUCCESS: Admin booking is now auto-confirmed!');
    } else {
      console.log('❌ FAILED: Booking status is still:', testBooking.rows[0].status);
    }
    
    // Clean up the test booking
    await pool.query('DELETE FROM booking WHERE email = $1', ['admin-test@example.com']);
    console.log('🧹 Test booking cleaned up');
    
  } catch (error) {
    console.error('❌ Error testing admin booking:', error.message);
  } finally {
    await pool.end();
  }
}

testAdminBooking();
