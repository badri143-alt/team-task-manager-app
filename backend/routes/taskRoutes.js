const express = require("express");

const router = express.Router();

const Task = require("../models/Task");

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");



// =========================================
// CREATE TASK
// Admin only
// =========================================

router.post("/", authMiddleware, adminOnly, async (req, res) => {

    try {

        const {
            title,
            description,
            dueDate,
            priority,
            assignedTo,
            projectId,
        } = req.body;

        if (
            !title ||
            !description ||
            !dueDate ||
            !priority ||
            !assignedTo ||
            !projectId
        ) {

            return res.status(400).json({
                message: "All fields are required",
            });

        }

        const task = await Task.create({

            title,
            description,
            dueDate,

            priority: priority.toLowerCase(),

            assignedTo,

            project: projectId,

            createdBy: req.user.id,

        });

        res.status(201).json({
            message: "Task created successfully",
            task,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error",
        });

    }

});



// =========================================
// GET ALL TASKS
// =========================================

router.get("/", authMiddleware, async (req, res) => {

    try {

        let tasks;

        // Admin sees all tasks

        if (req.user.role === "Admin") {

            tasks = await Task.find()

                .populate("project", "title")

                .populate("assignedTo", "name email")

                .populate("createdBy", "name");

        }

        // Member sees only assigned tasks

        else {

            tasks = await Task.find({
                assignedTo: req.user.id,
            })

                .populate("project", "title")

                .populate("assignedTo", "name email")

                .populate("createdBy", "name");

        }

        res.status(200).json(tasks);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error",
        });

    }

});



// =========================================
// GET MY TASKS
// =========================================

router.get("/me", authMiddleware, async (req, res) => {

    try {

        const tasks = await Task.find({
            assignedTo: req.user.id,
        })

            .populate("project", "title")

            .populate("assignedTo", "name email")

            .populate("createdBy", "name");

        res.status(200).json(tasks);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error",
        });

    }

});



// =========================================
// UPDATE TASK STATUS
// Admin + Assigned Member
// =========================================
router.put("/:id", authMiddleware, async (req, res) => {

    try {

        console.log("TASK UPDATE ID:", req.params.id);

        const { status } = req.body;

        const task = await Task.findById(req.params.id);

        if (!task) {

            return res.status(404).json({
                message: "Task not found",
            });

        }

        const isAdmin =
            req.user.role === "Admin" ||
            req.user.role === "admin";

        const isAssigned =
            task.assignedTo.toString() === req.user.id;

        if (!isAdmin && !isAssigned) {

            return res.status(403).json({
                message: "Access denied",
            });

        }

        task.status = status;

        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate("assignedTo", "name email")
            .populate("project", "title");

        res.status(200).json({
            message: "Task updated successfully",
            task: updatedTask,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error",
        });

    }

});


// =========================================
// DELETE TASK
// Admin only
// =========================================

router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {

    try {

        const task = await Task.findById(req.params.id);

        if (!task) {

            return res.status(404).json({
                message: "Task not found",
            });

        }

        await Task.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Task deleted successfully",
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error",
        });

    }

});



// =========================================
// DASHBOARD STATS
// =========================================

router.get("/dashboard/stats", authMiddleware, async (req, res) => {

    try {

        let filter = {};

        // Members see only own stats

        if (req.user.role !== "Admin") {

            filter.assignedTo = req.user.id;

        }

        const totalTasks = await Task.countDocuments(filter);

        const todoTasks = await Task.countDocuments({
            ...filter,
            status: "todo",
        });

        const inProgressTasks = await Task.countDocuments({
            ...filter,
            status: "in_progress",
        });

        const doneTasks = await Task.countDocuments({
            ...filter,
            status: "done",
        });

        const overdueTasks = await Task.countDocuments({
            ...filter,
            dueDate: { $lt: new Date() },
            status: { $ne: "done" },
        });

        res.status(200).json({

            totalTasks,

            tasksByStatus: {
                todoTasks,
                inProgressTasks,
                doneTasks,
            },

            overdueTasks,

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error",
        });

    }

});



module.exports = router;