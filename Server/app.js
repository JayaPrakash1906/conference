const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();
const { sendRegistrationCredentials } = require('./utils/emailService');

const app = express();
const PORT = process.env.PORT || 5000;
const FALLBACK_PORT = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

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

// Function to start server with fallback port handling
const HOST = process.env.HOST || '0.0.0.0';
const startServer = (port) => {
  try {
    const server = app.listen(port, HOST, () => {
      console.log(`Server is running successfully on http://${HOST}:${port}`);
      
      // Log email configuration status
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log('Email service configured and ready');
      } else {
        console.warn('Email service not configured. Set EMAIL_USER and EMAIL_PASS in .env file to enable email notifications');
      }
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying fallback port ${FALLBACK_PORT}`);
        startServer(FALLBACK_PORT);
      } else {
        console.error('Server error:', error);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

// Routes
app.use('/api', routes);


// Start the server
startServer(PORT);




