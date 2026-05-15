const User = require("../models/User");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");



// ======================================
// SIGNUP
// ======================================

exports.signup = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        // Check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({
                message: "User already exists"
            });

        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({

            name,

            email,

            password: hashedPassword,

            // Default role
            role: "member"

        });

        // Generate token
        const token = jwt.sign(

            {
                id: user._id,
                role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }

        );

        res.status(201).json({

            message: "User registered successfully",

            token,

            user

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// ======================================
// LOGIN
// ======================================

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {

            return res.status(400).json({
                message: "Invalid credentials"
            });

        }

        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {

            return res.status(400).json({
                message: "Invalid credentials"
            });

        }

        // Generate JWT token
        const token = jwt.sign(

            {
                id: user._id,
                role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }

        );

        res.status(200).json({

            message: "Login successful",

            token,

            user

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};