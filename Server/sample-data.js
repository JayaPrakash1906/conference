const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'calendar',
  password: process.env.DB_PASSWORD || '5432',
  port: process.env.DB_PORT || 5001,
});

async function addSampleData() {
  try {
    console.log('Adding sample data...');
    
    // Add sample categories
    const categories = [
      'Nirmaan',
      'CFI',
      'IIT Madras Alumni Association',
      'Global Engagement'
    ];
    
    for (const categoryName of categories) {
      await pool.query(
        'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [categoryName]
      );
    }
    
    // Get category IDs
    const categoryResult = await pool.query('SELECT id, name FROM categories');
    const categoriesMap = {};
    categoryResult.rows.forEach(row => {
      categoriesMap[row.name] = row.id;
    });
    
    // Add sample teams
    const teams = [
      { name: 'Machintell_corp', category: 'Nirmaan' },
      { name: 'Tech Team', category: 'CFI' },
      { name: 'Alumni Relations', category: 'IIT Madras Alumni Association' },
      { name: 'International Affairs', category: 'Global Engagement' }
    ];
    
    for (const team of teams) {
      const categoryId = categoriesMap[team.category];
      if (categoryId) {
        await pool.query(
          'INSERT INTO teams (name, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [team.name, categoryId]
        );
      }
    }
    
    console.log('Sample data added successfully!');
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await pool.end();
  }
}

addSampleData(); 