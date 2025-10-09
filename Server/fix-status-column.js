const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'calendar',
  password: process.env.DB_PASSWORD || '5432',
  port: process.env.DB_PORT || 5001,
});

async function fixStatusColumn() {
  try {
    console.log('🔧 Fixing booking status column...');
    
    // Check current column definition
    console.log('\n📋 Current status column definition:');
    const currentDef = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'booking' AND column_name = 'status'
    `);
    console.log(currentDef.rows[0]);
    
    // Remove DEFAULT constraint
    console.log('\n🗑️  Removing DEFAULT constraint...');
    await pool.query('ALTER TABLE booking ALTER COLUMN status DROP DEFAULT');
    console.log('✅ DEFAULT constraint removed successfully');
    
    // Verify the change
    console.log('\n📋 New status column definition:');
    const newDef = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'booking' AND column_name = 'status'
    `);
    console.log(newDef.rows[0]);
    
    console.log('\n🎉 Status column fix completed! Admin bookings should now be auto-confirmed.');
    
  } catch (error) {
    console.error('❌ Error fixing status column:', error.message);
  } finally {
    await pool.end();
  }
}

fixStatusColumn();
