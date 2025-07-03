import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  complexityScore: { type: Number, required: true },
  priority: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Operator", required: false },
  status: { type: String, required: true },
  estimatedTime: { type: Number, required: true },
  actualTime: { type: Number }
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
