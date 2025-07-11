const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'calendar',
  password: process.env.DB_PASSWORD || '5432',
  port: process.env.DB_PORT || 5001,
});

async function testDatabase() {
  try {
    console.log('Testing database...');
    
    // Check if teams table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'teams'
      );
    `);
    
    console.log('Teams table exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Check teams data
      const teamsData = await pool.query('SELECT * FROM teams');
      console.log('Teams data:', teamsData.rows);
      
      // Check categories data
      const categoriesData = await pool.query('SELECT * FROM categories');
      console.log('Categories data:', categoriesData.rows);
      
      // Check booking data
      const bookingData = await pool.query('SELECT id, team_category, team_sub_category FROM booking LIMIT 5');
      console.log('Sample booking data:', bookingData.rows);
    }
    
  } catch (error) {
    console.error('Error testing database:', error);
  } finally {
    await pool.end();
  }
}

testDatabase(); 