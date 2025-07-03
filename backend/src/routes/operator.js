import { generateToken } from "../middleware/auth.js";
import express from "express";
import Operator from "../models/Operator.js";
import calculateScore from "../../utils/calculateScore.js";

const router = express.Router();
// POST /api/operators/login
// Body: { email, password }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const operator = await Operator.findOne({ email });
    if (!operator) return res.status(404).json({ error: "Operator not found" });
    // Plain text password check for testing only
    const isMatch = password === operator.password;
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
    const token = generateToken(operator);
    res.json({ token, operator: { _id: operator._id, name: operator.name, operatorId: operator.operatorId, email: operator.email, score: operator.score } });
  } catch (err) {
    console.error("/login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/operators/register
// Body: { operatorId, name, email, password, ...other fields }
router.post("/register", async (req, res) => {
  try {
    const { operatorId, name, email, password, score, fuelEfficiency, safetyViolations, tasksCompleted, trainingCompleted } = req.body;
    if (!operatorId || !name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const exists = await Operator.findOne({ $or: [{ email }, { operatorId }] });
    if (exists) return res.status(409).json({ error: "Operator already exists" });
    const operator = new Operator({ operatorId, name, email, password, score, fuelEfficiency, safetyViolations, tasksCompleted, trainingCompleted });
    await operator.save();
    const token = generateToken(operator);
    res.status(201).json({ token, operator: { _id: operator._id, name: operator.name, operatorId: operator.operatorId, email: operator.email } });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});


// GET all operators
// GET all operators (hide password)
router.get("/", async (_req, res) => {
  try {
    const operators = await Operator.find({}, "-password");
    res.json(operators);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch operators" });
  }
});

// POST a new operator
// POST a new operator (hide password in response)
router.post("/", async (req, res) => {
  try {
    const operator = new Operator(req.body);
    await operator.save();
    const opObj = operator.toObject();
    delete opObj.password;
    res.status(201).json(opObj);
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
