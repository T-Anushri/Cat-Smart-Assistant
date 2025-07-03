
import mongoose from "mongoose";

const operatorSchema = new mongoose.Schema({
  operatorId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  score: { type: Number, required: true },
  fuelEfficiency: { type: Number, required: true },
  safetyViolations: { type: Number, required: true },
  tasksCompleted: { type: Number, required: true },
  trainingCompleted: { type: Boolean, required: true }
});

const Operator = mongoose.model("Operator", operatorSchema);

export default Operator;
