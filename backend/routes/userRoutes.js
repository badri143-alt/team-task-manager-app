const express = require("express");

const router = express.Router();

const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {

    try {

        const users = await User.find().select("-password");

        res.status(200).json(users);

    } catch (error) {

        res.status(500).json({
            message: "Server Error",
        });

    }

});

module.exports = router;