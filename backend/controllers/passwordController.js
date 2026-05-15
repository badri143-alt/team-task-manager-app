const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// ==========================================
// FORGOT PASSWORD
// ==========================================

exports.forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {

            return res.status(404).json({
                message: "User not found",
            });

        }

        // Generate token

        const resetToken = crypto.randomBytes(32).toString("hex");

        // Save token + expiry

        user.resetPasswordToken = resetToken;

        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

        await user.save();

        // Reset link

        const resetUrl =
            `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        // Email setup

        const transporter = nodemailer.createTransport({

            service: "gmail",

            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },

        });

        // Send mail

        await transporter.sendMail({

            from: process.env.EMAIL_USER,

            to: user.email,

            subject: "Password Reset",

            html: `
                <h2>Password Reset</h2>
                <p>Click below link to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
            `,

        });

        res.status(200).json({
            message: "Reset email sent successfully",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};


// ==========================================
// RESET PASSWORD
// ==========================================

exports.resetPassword = async (req, res) => {

    try {

        const { token } = req.params;

        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {

            return res.status(400).json({
                message: "Invalid or expired token",
            });

        }

        // Hash new password

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;

        user.resetPasswordToken = undefined;

        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            message: "Password reset successful",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};