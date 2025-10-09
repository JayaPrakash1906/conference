const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'calendar',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 5432,
});

async function checkRooms() {
  const client = await pool.connect();
  try {
    console.log('=== Available Rooms ===');
    
    // Check available rooms
    const rooms = await client.query('SELECT id, name, location, capacity FROM rooms ORDER BY id');
    
    if (rooms.rows.length === 0) {
      console.log('No rooms found in database');
      console.log('\\nCreating sample rooms...');
      
      // Create sample rooms
      await client.query(\
        INSERT INTO rooms (name, location, floor, capacity, equipment, description) 
        VALUES 
        ('Conference Room 101', 'Building A', '1st Floor', 20, 'Projector, Whiteboard', 'Main conference room'),
        ('Meeting Room 1', 'Building A', '2nd Floor', 8, 'TV Screen', 'Small meeting room'),
        ('Conference Room 102', 'Building B', '1st Floor', 15, 'Projector, Video Conference', 'Secondary conference room')
      \);
      
      console.log(' Sample rooms created');
      
      // Get the created rooms
      const newRooms = await client.query('SELECT id, name, location, capacity FROM rooms ORDER BY id');
      console.log('\\nAvailable rooms:');
      newRooms.rows.forEach(room => {
        console.log(\ID: \ - \ (\) - Capacity: \\);
      });
    } else {
      console.log('Available rooms:');
      rooms.rows.forEach(room => {
        console.log(\ID: \ - \ (\) - Capacity: \\);
      });
    }
    
    // Check categories
    console.log('\\n=== Available Categories ===');
    const categories = await client.query('SELECT id, name FROM categories ORDER BY id');
    
    if (categories.rows.length === 0) {
      console.log('No categories found. Creating sample categories...');
      await client.query(\
        INSERT INTO categories (name) 
        VALUES ('CFI Teams'), ('Nirmaan Teams'), ('Global Engagement'), ('GDC')
      \);
      
      const newCategories = await client.query('SELECT id, name FROM categories ORDER BY id');
      console.log('Available categories:');
      newCategories.rows.forEach(cat => {
        console.log(\ID: \ - \\);
      });
    } else {
      console.log('Available categories:');
      categories.rows.forEach(cat => {
        console.log(\ID: \ - \\);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkRooms();
