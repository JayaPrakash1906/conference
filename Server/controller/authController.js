const User = require('../model/userModel');
const bcrypt = require('bcrypt');

// Registration controller
const register = async (req, res) => {
    try {
        // Get user input
        const { name, email, password, role } = req.body;

        // Validate user input
        if (!name || !email || !password || !role) {
            return res.status(400).json({ 
                success: false,
                message: "All fields are required" 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid email format" 
            });
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ 
                success: false,
                message: "Email already registered" 
            });
        }

        // Create new user
        const newUser = await User.create({
            name,
            email,
            password,
            role
        });

        // Return success response with user data
        return res.status(201).json({
            success: true,
            message: "Registration successful!",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        
        // Return appropriate error response
        return res.status(500).json({
            success: false,
            message: "Registration failed. Please try again.",
            error: error.message
        });
    }
};

module.exports = {
    register
}; 