const express = require("express");

const router = express.Router();

const Project = require("../models/Project");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");



// ==========================================
// CREATE PROJECT
// ==========================================

router.post("/", authMiddleware, async (req, res) => {

    try {

        const { title, description } = req.body;

        if (!title || !description) {

            return res.status(400).json({
                message: "Title and description are required",
            });

        }

        // Make current user Admin

        await User.findByIdAndUpdate(req.user.id, {
            role: "Admin",
        });

        // Create project

        const project = await Project.create({

            title,
            description,

            admin: req.user.id,

            members: [req.user.id],

        });

        // Populate data

        const populatedProject = await Project.findById(project._id)

            .populate("admin", "name email role")

            .populate("members", "name email role");

        res.status(201).json({
            message: "Project created successfully",
            project: populatedProject,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error",
        });

    }

});



// ==========================================
// GET ALL PROJECTS
// ==========================================

router.get("/", authMiddleware, async (req, res) => {

    try {

        const projects = await Project.find({
            members: req.user.id,
        })

        .populate("admin", "name email role")

        .populate("members", "name email role");

        res.status(200).json(projects);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error",
        });

    }

});



// ==========================================
// GET SINGLE PROJECT
// ==========================================

router.get("/:id", authMiddleware, async (req, res) => {

    try {

        const project = await Project.findById(req.params.id)

            .populate("admin", "name email role")

            .populate("members", "name email role");

        if (!project) {

            return res.status(404).json({
                message: "Project not found",
            });

        }

        res.status(200).json(project);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error",
        });

    }

});



// ==========================================
// ADD MEMBER
// ==========================================

router.post("/:id/members", authMiddleware, async (req, res) => {

    try {

        const { email } = req.body;

        const project = await Project.findById(req.params.id);

        if (!project) {

            return res.status(404).json({
                message: "Project not found",
            });

        }

        // Only Admin can add members

        if (project.admin.toString() !== req.user.id) {

            return res.status(403).json({
                message: "Only Admin can add members",
            });

        }

        const user = await User.findOne({ email });

        if (!user) {

            return res.status(404).json({
                message: "User not found",
            });

        }

        // Prevent duplicate member

        const alreadyMember = project.members.find(
            (member) => member.toString() === user._id.toString()
        );

        if (alreadyMember) {

            return res.status(400).json({
                message: "User already exists in project",
            });

        }

        project.members.push(user._id);

        await project.save();

        const updatedProject = await Project.findById(project._id)

            .populate("admin", "name email role")

            .populate("members", "name email role");

        res.status(200).json({
            message: "Member added successfully",
            project: updatedProject,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error",
        });

    }

});



// ==========================================
// REMOVE MEMBER
// ==========================================

router.delete("/:id/members/:memberId", authMiddleware, async (req, res) => {

    try {

        const project = await Project.findById(req.params.id);

        if (!project) {

            return res.status(404).json({
                message: "Project not found",
            });

        }

        // Only Admin can remove members

        if (project.admin.toString() !== req.user.id) {

            return res.status(403).json({
                message: "Only Admin can remove members",
            });

        }

        // Prevent removing Admin

        if (project.admin.toString() === req.params.memberId) {

            return res.status(400).json({
                message: "Admin cannot be removed",
            });

        }

        project.members = project.members.filter(

            (member) =>
                member.toString() !== req.params.memberId

        );

        await project.save();

        const updatedProject = await Project.findById(project._id)

            .populate("admin", "name email role")

            .populate("members", "name email role");

        res.status(200).json({
            message: "Member removed successfully",
            project: updatedProject,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error",
        });

    }

});



// ==========================================
// DELETE PROJECT
// ==========================================

router.delete("/:id", authMiddleware, async (req, res) => {

    try {

        const project = await Project.findById(req.params.id);

        if (!project) {

            return res.status(404).json({
                message: "Project not found",
            });

        }

        // Only Admin can delete

        if (project.admin.toString() !== req.user.id) {

            return res.status(403).json({
                message: "Only Admin can delete project",
            });

        }

        await Project.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Project deleted successfully",
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error",
        });

    }

});



module.exports = router;