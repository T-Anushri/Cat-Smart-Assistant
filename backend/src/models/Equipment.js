import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  condition: { type: String, enum: ["working", "broken"], default: "working" },
  in_use: { type: Boolean, default: false }
});

const Equipment = mongoose.model("Equipment", equipmentSchema);

export default Equipment;
