// Specific fix for calendar database auto-confirmation
// Run this: node fix-calendar-db.js

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'calendar',  // Using calendar database
  password: process.env.DB_PASSWORD || '5432',
  port: process.env.DB_PORT || 5432,
});

async function fixCalendarDatabase() {
  try {
    console.log('🗃️  Fixing calendar database for auto-confirmation...');
    
    // Check current table structure
    console.log('\n📋 Checking booking table structure:');
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'booking' AND column_name = 'status'
    `);
    
    if (tableInfo.rows.length === 0) {
      console.log('❌ No booking table found! Checking for bookings table...');
      const tableInfo2 = await pool.query(`
        SELECT column_name, data_type, column_default, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'status'
      `);
      
      if (tableInfo2.rows.length === 0) {
        console.log('❌ No booking/bookings table found!');
        return;
      } else {
        console.log('Found bookings table:', tableInfo2.rows[0]);
      }
    } else {
      console.log('Found booking table:', tableInfo.rows[0]);
    }
    
    // Remove DEFAULT constraint from booking table
    console.log('\n🗑️  Removing DEFAULT constraint from booking table...');
    try {
      await pool.query('ALTER TABLE booking ALTER COLUMN status DROP DEFAULT');
      console.log('✅ Removed DEFAULT constraint from booking.status');
    } catch (err) {
      console.log('⚠️  Could not remove DEFAULT from booking:', err.message);
      
      // Try bookings table
      try {
        await pool.query('ALTER TABLE bookings ALTER COLUMN status DROP DEFAULT');
        console.log('✅ Removed DEFAULT constraint from bookings.status');
      } catch (err2) {
        console.log('⚠️  Could not remove DEFAULT from bookings either:', err2.message);
      }
    }
    
    // Test the fix with booking table
    console.log('\n🧪 Testing fix with booking table...');
    try {
      const testResult = await pool.query(`
        INSERT INTO booking 
        (name, meeting_name, start_time, end_time, date, meeting_purpose, contact_number, email, team_category, team_sub_category, room_id, status) 
        VALUES ($1, $2, $3::timestamp, $4::timestamp, $5::date, $6, $7, $8, $9, $10, $11, $12) 
        RETURNING status
      `, [
        'Test Admin', 'Test Meeting', '2025-01-01 10:00:00', '2025-01-01 11:00:00', 
        '2025-01-01', 'Test', '1234567890', 'test@example.com', '1', 'Test', 1, 'confirmed'
      ]);
      
      console.log('✅ Test booking created with status:', testResult.rows[0].status);
      
      if (testResult.rows[0].status === 'confirmed') {
        console.log('🎉 SUCCESS! Auto-confirmation is now working!');
      } else {
        console.log('❌ Still not working. Status is:', testResult.rows[0].status);
      }
      
      // Clean up
      await pool.query('DELETE FROM booking WHERE email = $1', ['test@example.com']);
      console.log('🧹 Test data cleaned up');
      
    } catch (err) {
      console.log('❌ Test failed:', err.message);
    }
    
    console.log('\n✅ Calendar database fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing calendar database:', error.message);
  } finally {
    await pool.end();
  }
}

fixCalendarDatabase();








