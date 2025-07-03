import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

app.get("/api/health", (_req, res) => {
  res.json({ status: "Backend is running!" });
});


import taskRoutes from "./routes/task.js";
import operatorRoutes from "./routes/operator.js";
import incidentRoutes from "./routes/incident.js";

app.use("/api/tasks", taskRoutes);
app.use("/api/operators", operatorRoutes);
app.use("/api/incidents", incidentRoutes);

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
