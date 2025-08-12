const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'calendar',
  password: process.env.DB_PASSWORD || '5432',
  port: process.env.DB_PORT || 5001,
});

async function addNirmaanColumn() {
  try {
    console.log('Adding nirmaan_text column to booking table...');
    
    // Check if column already exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'booking' AND column_name = 'nirmaan_text'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('nirmaan_text column already exists in booking table.');
      return;
    }
    
    // Add the column
    await pool.query(`
      ALTER TABLE booking 
      ADD COLUMN nirmaan_text TEXT
    `);
    
    console.log('nirmaan_text column added successfully to booking table!');
  } catch (error) {
    console.error('Error adding nirmaan_text column:', error);
  } finally {
    await pool.end();
  }
}

addNirmaanColumn(); 