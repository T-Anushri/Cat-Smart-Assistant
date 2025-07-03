import mongoose from "mongoose";
import Operator from "../src/models/Operator.js";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function updateOperators() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB:", MONGO_URI);
  const operators = await Operator.find();
  for (const op of operators) {
    // Set email and plain text password for testing
    op.email = `${op.operatorId.toLowerCase()}@example.com`;
    op.password = op.operatorId;
    await op.save();
    console.log(`Reset: ${op.name} (${op.email})`);
  }
  await mongoose.disconnect();
  console.log("All operators updated.");
}

updateOperators().catch(console.error);
