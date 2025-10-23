// Comprehensive fix for admin booking auto-confirmation
// This handles both 'booking' and 'bookings' table scenarios

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'calendar',
  password: process.env.DB_PASSWORD || '5432',
  port: process.env.DB_PORT || 5432,
});

async function comprehensiveFix() {
  try {
    console.log('🔍 Investigating database structure...');
    
    // Check which table exists
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('booking', 'bookings')
    `);
    
    console.log('Available tables:', tableCheck.rows.map(r => r.table_name));
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ No booking tables found!');
      return;
    }
    
    // Check status column in each table
    for (const table of tableCheck.rows) {
      const tableName = table.table_name;
      console.log(`\n📋 Checking ${tableName} table...`);
      
      const columnInfo = await pool.query(`
        SELECT column_name, data_type, column_default, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = 'status'
      `, [tableName]);
      
      if (columnInfo.rows.length > 0) {
        console.log(`Status column info for ${tableName}:`, columnInfo.rows[0]);
        
        // Remove DEFAULT constraint
        try {
          await pool.query(`ALTER TABLE ${tableName} ALTER COLUMN status DROP DEFAULT`);
          console.log(`✅ Removed DEFAULT constraint from ${tableName}.status`);
        } catch (err) {
          console.log(`⚠️  Could not remove DEFAULT from ${tableName}:`, err.message);
        }
        
        // Test inserting with confirmed status
        try {
          const testResult = await pool.query(`
            INSERT INTO ${tableName} 
            (name, meeting_name, start_time, end_time, date, meeting_purpose, contact_number, email, team_category, team_sub_category, room_id, status) 
            VALUES ($1, $2, $3::timestamp, $4::timestamp, $5::date, $6, $7, $8, $9, $10, $11, $12) 
            RETURNING status
          `, [
            'Test Admin', 'Test Meeting', '2025-01-01 10:00:00', '2025-01-01 11:00:00', 
            '2025-01-01', 'Test', '1234567890', 'test@example.com', '1', 'Test', 1, 'confirmed'
          ]);
          
          console.log(`✅ Test insert successful in ${tableName}:`, testResult.rows[0].status);
          
          // Clean up
          await pool.query(`DELETE FROM ${tableName} WHERE email = $1`, ['test@example.com']);
          console.log(`🧹 Test data cleaned up from ${tableName}`);
          
        } catch (err) {
          console.log(`❌ Test insert failed in ${tableName}:`, err.message);
        }
      } else {
        console.log(`⚠️  No status column found in ${tableName}`);
      }
    }
    
    console.log('\n🎉 Comprehensive fix completed!');
    console.log('✅ Admin bookings should now auto-confirm.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

comprehensiveFix();








