const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");


// CREATE TASK
exports.createTask = async (req, res) => {

    try {

        const {
            title,
            description,
            dueDate,
            priority,
            projectId,
            assignedTo
        } = req.body;

        // Check project exists
        const project = await Project.findById(projectId);

        if (!project) {

            return res.status(404).json({
                message: "Project not found"
            });

        }

        // Only project admin can create task
        if (project.admin.toString() !== req.user.id) {

            return res.status(403).json({
                message: "Only admin can create tasks"
            });

        }

        // Check assigned user exists
        const user = await User.findById(assignedTo);

        if (!user) {

            return res.status(404).json({
                message: "Assigned user not found"
            });

        }

        // Create task
        const task = await Task.create({
            title,
            description,
            dueDate,
            priority,
            project: projectId,
            assignedTo,
            createdBy: req.user.id
        });

        res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};




// GET TASKS
exports.getTasks = async (req, res) => {

    try {

        const tasks = await Task.find()
        .populate("assignedTo", "name email")
        .populate("project", "title")
        .populate("createdBy", "name");

        res.status(200).json(tasks);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};




// UPDATE TASK STATUS
exports.updateTaskStatus = async (req, res) => {

    try {

        const { status } = req.body;

        const task = await Task.findById(req.params.id);

        if (!task) {

            return res.status(404).json({
                message: "Task not found"
            });

        }

        // Only assigned user can update
        if (task.assignedTo.toString() !== req.user.id) {

            return res.status(403).json({
                message: "Only assigned user can update task"
            });

        }

        task.status = status;

        await task.save();

        res.status(200).json({
            message: "Task status updated",
            task
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};