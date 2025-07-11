const express = require('express');
const router = express.Router();
const admin_roomController = require('../controller/admin_roomController');
const user_browseroomController = require('../controller/user_browseroomController');
const userController = require('../controller/userController');
const authController = require('../controller/authController');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { sendRegistrationCredentials } = require('../utils/emailService');
const adminAuth = require('../middleware/adminAuth');
const categoryController = require('../controller/categoryController');
const teamController = require('../controller/teamController');


// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'calendar',
  password: process.env.DB_PASSWORD || '5432',
  port: process.env.DB_PORT || 5001,
});

// Admin Room Routes
router.post('/create', admin_roomController.CreateRoom);
router.get('/get', admin_roomController.FetchRoom);
router.put('/update/:id', admin_roomController.UpdateRoom);
router.delete('/delete/:id', admin_roomController.DeleteRoom);

// User Browse Room Routes
router.post('/create_browseroom', user_browseroomController.CreateBrowse);
router.get('/get_browseroom', user_browseroomController.FetchBrowse);
router.put('/update_browseroom/:id', user_browseroomController.UpdateBrowse);
router.delete('/delete_browseroom/:id', user_browseroomController.DeleteBrowse);

// Test connection
router.get('/test', userController.testConnection);

// Auth routes
router.post('/register', async (req, res) => {
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

router.post('/login', userController.login);

// User management routes
router.get('/users', userController.getAllUsers);
router.delete('/users/:id', userController.deleteUser);

router.get('/', categoryController.getAllCategories);
router.post('/category', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

router.get('/category/:categoryId', teamController.getTeamsByCategory);
router.post('/team', teamController.createTeam);
router.put('/team/:id', teamController.updateTeam);
router.delete('/team/:id', teamController.deleteTeam);

module.exports = router;
