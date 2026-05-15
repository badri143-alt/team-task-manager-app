const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const router = express.Router();

const {
    signup,
    login
} = require("../controllers/authController");


// Signup
router.post("/signup", signup);

// Login
router.post("/login", login);

router.post("/forgot-password", async (req, res) => {

  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {

      return res.status(404).json({
        message: "User not found",
      });

    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;

    user.resetPasswordExpire =
      Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetUrl =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message =
      `Reset your password using this link:\n\n${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message,
    });

    res.status(200).json({
      message: "Reset link sent to email",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });

  }

});

router.post("/reset-password/:token", async (req, res) => {

  try {

    const user = await User.findOne({

      resetPasswordToken: req.params.token,

      resetPasswordExpire: {
        $gt: Date.now(),
      },

    });

    if (!user) {

      return res.status(400).json({
        message: "Invalid or expired token",
      });

    }

    const hashedPassword =
      await bcrypt.hash(req.body.password, 10);

    user.password = hashedPassword;

    user.resetPasswordToken = undefined;

    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });

  }

});

module.exports = router;