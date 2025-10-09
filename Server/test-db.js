const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'calendar',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 5432,
});

async function testDB() {
  try {
    const client = await pool.connect();
    console.log('Connected to database successfully');
    
    // Check current time
    const now = await client.query("SELECT NOW() AT TIME ZONE 'Asia/Kolkata' as current_time");
    console.log('Current time (IST):', now.rows[0].current_time);
    
    // Check table structure
    const tableInfo = await client.query(\
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'booking' 
      ORDER BY ordinal_position
    \);
    console.log('\\nBooking table structure:');
    tableInfo.rows.forEach(row => console.log(\  \: \\));
    
    // Check if reminder_sent column exists
    const reminderColumn = await client.query(\
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'booking' AND column_name = 'reminder_sent'
    \);
    console.log('\\nReminder_sent column exists:', reminderColumn.rows.length > 0);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDB();
