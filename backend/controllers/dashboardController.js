const Task = require("../models/Task");


// DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {

    try {

        // Total Tasks
        const totalTasks = await Task.countDocuments();

        // Tasks By Status
        const todoTasks = await Task.countDocuments({
            status: "To Do"
        });

        const inProgressTasks = await Task.countDocuments({
            status: "In Progress"
        });

        const doneTasks = await Task.countDocuments({
            status: "Done"
        });

        // Overdue Tasks
        const overdueTasks = await Task.countDocuments({
            dueDate: { $lt: new Date() },
            status: { $ne: "Done" }
        });

        // Tasks Per User
        const tasksPerUser = await Task.aggregate([
            {
                $group: {
                    _id: "$assignedTo",
                    totalTasks: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            totalTasks,
            tasksByStatus: {
                todoTasks,
                inProgressTasks,
                doneTasks
            },
            overdueTasks,
            tasksPerUser
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};