import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import predictRoute from "../routes/predict.js";

dotenv.config();

const app = express();

const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000 // 10 seconds
})
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => console.error("MongoDB connection error:", err));
console.log('If you do not see "MongoDB connected" or an error within 10 seconds, the connection is hanging.');

app.get("/api/health", (_req, res) => {
  res.json({ status: "Backend is running!" });
});


import taskRoutes from "./routes/task.js";
import operatorRoutes from "./routes/operator.js";
import incidentRoutes from "./routes/incident.js";
import fs from 'fs';
import chatRoutes from "../routes/chat.js";

app.get('/api/alert', (_req, res) => {
  try {
    const alert = JSON.parse(fs.readFileSync('latestAlert.json', 'utf-8'));
    res.json(alert);
  } catch {
    res.json({ message: '' });
  }
});



// In-memory emergency alert store (for demo)
const emergencyAlerts = [];

app.post('/api/emergency-alert', async (req, res) => {
  try {
    const { operatorId } = req.body;
    if (!operatorId) return res.status(400).json({ error: 'operatorId required' });
    const alert = {
      operatorId,
      timestamp: new Date().toISOString(),
    };
    emergencyAlerts.push(alert);
    console.log(`[EMERGENCY ALERT] Operator ID: ${operatorId} has triggered an emergency!`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send emergency alert' });
  }
});

// Manager API to fetch all emergency alerts
app.get('/api/emergency-alerts', (_req, res) => {
  res.json({ alerts: emergencyAlerts });
});

app.use("/api/tasks", taskRoutes);
app.use("/api/operators", operatorRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api", predictRoute);
app.use("/api", chatRoutes);

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
