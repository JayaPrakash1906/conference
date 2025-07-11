const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();
const path = require('path');
const roomRoutes = require('./routes/roomRoutes');
const userRoutes = require('./routes/routes');
const { sendRegistrationCredentials } = require('./utils/emailService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'calendar',
  password: process.env.DB_PASSWORD || '5432',
  port: process.env.DB_PORT || 5001,
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: "Server is running!" });
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });      
    }

    // Check if user exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );

    // Send credentials via email
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await sendRegistrationCredentials(email, newUser.rows[0].id, password);
        console.log('Registration email sent successfully');
      } else {
        console.warn('Email credentials not configured. Skipping email notification.');
      }
    } catch (emailError) {
      console.error('Failed to send registration email:', emailError);
      // Continue with registration response as email is non-critical
    }

    res.status(201).json({
      message: "User registered successfully. Please check your email for login credentials.",
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error("Error registering user:", error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ message: "Email already exists" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});

// Routes
app.use('/api', roomRoutes);
app.use('/api', userRoutes);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Handle 404 routes
app.use((req, res) => {
  console.log('404 for route:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- POST /api/register');
  console.log('- POST /api/login');
  console.log('- POST /api/forgot-password');
  console.log('- POST /api/reset-password');
  console.log('- GET /api/test');
  
  // Log email configuration status
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('Email service configured and ready');
  } else {
    console.warn('Email service not configured. Set EMAIL_USER and EMAIL_PASS in .env file to enable email notifications');
  }
}); 