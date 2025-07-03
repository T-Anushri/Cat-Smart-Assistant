import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema({
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Operator", required: true },
  type: { type: String, required: true },
  timestamp: { type: Date, required: true },
  description: { type: String, required: true }
});

const Incident = mongoose.model("Incident", incidentSchema);

export default Incident;
