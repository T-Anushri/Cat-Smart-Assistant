

import express from "express";

import Task from "../models/Task.js";
import Operator from "../models/Operator.js";
import Equipment from "../models/Equipment.js";
import matchTasks from "../../utils/matchTasks.js";

const router = express.Router();

// Create a POST route /assign-tasks that takes a list of tasks
// and assigns each one to the best operator based on:
// - Highest score
// - Fewest safety violations
// - TrainingStatus = "Up to date"
// - Complexity of task matching operator score level
// Update the task's assignedTo field with operator _id
router.post("/assign-tasks", async (req, res) => {
  try {
    const { tasks } = req.body; // Expecting an array of task objects (with at least _id, complexityScore, etc)
    if (!Array.isArray(tasks) || !tasks.length) {
      return res.status(400).json({ error: "No tasks provided" });
    }

    // Fetch all operators (availability logic handled in matchTasks)
    const operators = await Operator.find({});
    if (!operators.length) {
      return res.status(404).json({ error: "No operators found" });
    }

    // Use matchTasks utility for fair assignment (operator only)
    const assignments = matchTasks(tasks, operators);
    const updatedTasks = [];
    for (const assign of assignments) {
      const updated = await Task.findByIdAndUpdate(
        assign.taskId,
        { assignedTo: assign.operatorId },
        { new: true }
      );
      if (updated) updatedTasks.push(updated);
    }

    res.json({ updatedTasks });
  } catch (err) {
    res.status(500).json({ error: "Failed to assign tasks" });
  }
});

// GET all tasks
router.get("/", async (_req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// POST a new task
router.post("/", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: "Failed to create task" });
  }
});

// POST endpoint to auto-assign a task to the best-suited operator
router.post("/auto-assign", async (req, res) => {
  try {
    const { title, complexityScore, priority, status, estimatedTime } = req.body;
    // Find best-suited operator: highest score, lowest safetyViolations, and not already assigned to a task with status 'in-progress'
    const availableOperators = await Operator.find({ trainingCompleted: true });
    if (!availableOperators.length) return res.status(404).json({ error: "No available operators" });
    // Example: sort by score descending, safetyViolations ascending
    availableOperators.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.safetyViolations - b.safetyViolations;
    });
    const bestOperator = availableOperators[0];
    const task = new Task({
      title,
      complexityScore,
      priority,
      assignedTo: bestOperator._id,
      status,
      estimatedTime
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: "Failed to auto-assign task" });
  }
});


// ...existing code...

// Unassign a task (set assignedTo to null)
router.patch("/:id/unassign", async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, { assignedTo: null }, { new: true });
    if (!updated) return res.status(404).json({ error: "Task not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to unassign task" });
  }
});

export default router;
