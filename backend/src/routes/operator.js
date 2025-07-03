import express from "express";

import Operator from "../models/Operator.js";
import calculateScore from "../../utils/calculateScore.js";

const router = express.Router();

// GET all operators
router.get("/", async (_req, res) => {
  try {
    const operators = await Operator.find();
    res.json(operators);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch operators" });
  }
});

// POST a new operator
router.post("/", async (req, res) => {
  try {
    const operator = new Operator(req.body);
    await operator.save();
    res.status(201).json(operator);
  } catch (err) {
    res.status(400).json({ error: "Failed to create operator" });
  }
});

// PATCH to update operator score after a task
router.patch("/:id/score", async (req, res) => {
  try {
    const { fuelEfficiency, estimatedTime, actualTime, safetyViolations } = req.body;
    // Calculate new score
    const score = calculateScore({ fuelEfficiency, estimatedTime, actualTime, safetyViolations });
    const operator = await Operator.findByIdAndUpdate(
      req.params.id,
      { $set: { score, fuelEfficiency, safetyViolations } },
      { new: true }
    );
    if (!operator) return res.status(404).json({ error: "Operator not found" });
    res.json(operator);
  } catch (err) {
    res.status(400).json({ error: "Failed to update score" });
  }
});

export default router;
