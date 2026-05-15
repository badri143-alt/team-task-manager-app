const Project = require("../models/Project");
const User = require("../models/User");


// CREATE PROJECT
exports.createProject = async (req, res) => {

    try {

        const { title, description } = req.body;

        const project = await Project.create({
            title,
            description,
            admin: req.user.id,
            members: [req.user.id]
        });

        res.status(201).json({
            message: "Project created successfully",
            project
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// GET USER PROJECTS
exports.getProjects = async (req, res) => {

    try {

        const projects = await Project.find({
            members: req.user.id
        })
        .populate("admin", "name email")
        .populate("members", "name email");

        res.status(200).json(projects);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// ADD MEMBER
exports.addMember = async (req, res) => {

    try {

        const { projectId, email } = req.body;

        // Find project
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Only admin can add members
        if (project.admin.toString() !== req.user.id) {

            return res.status(403).json({
                message: "Only admin can add members"
            });

        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        // Prevent duplicate members
        if (project.members.includes(user._id)) {

            return res.status(400).json({
                message: "User already member"
            });

        }

        // Add member
        project.members.push(user._id);

        await project.save();

        res.status(200).json({
            message: "Member added successfully",
            project
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};