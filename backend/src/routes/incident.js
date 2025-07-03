import express from "express";
import Incident from "../models/Incident.js";

const router = express.Router();

// POST a new safety incident
router.post("/", async (req, res) => {
  try {
    const incident = new Incident(req.body);
    await incident.save();
    res.status(201).json(incident);
  } catch (err) {
    res.status(400).json({ error: "Failed to create incident" });
  }
});


// GET all incidents
router.get("/", async (req, res) => {
  try {
    const incidents = await Incident.find();
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

// GET all incidents for a specific operator
router.get("/operator/:operatorId", async (req, res) => {
  try {
    const incidents = await Incident.find({ operatorId: req.params.operatorId });
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

export default router;
