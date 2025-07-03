import mongoose from "mongoose";
import Operator from "../src/models/Operator.js";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function printOperators() {
  await mongoose.connect(MONGO_URI);
  const operators = await Operator.find();
  for (const op of operators) {
    console.log(`Name: ${op.name}, Email: ${op.email}, OperatorId: ${op.operatorId}`);
  }
  await mongoose.disconnect();
}

import bcrypt from "bcryptjs";
bcrypt.compare('OP1001', '$2a$10$/dRV0JAdURi4OGgxbn28z.Agdv06F41af1FAcem.QLvX9DH2BH0p.', (err, res) => {
  console.log(res); // should print true if it matches
});

printOperators().catch(console.error);
