import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Operator from "../src/models/Operator.js";
import Task from "../src/models/Task.js";
import Incident from "../src/models/Incident.js";

dotenv.config();

const mongoUri = process.env.MONGO_URI;

async function seed() {
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Operators
  const operators = JSON.parse(fs.readFileSync(path.resolve("./seed/operators.json")));
  await Operator.deleteMany({});
  await Operator.insertMany(operators);

  // Tasks
  const tasks = JSON.parse(fs.readFileSync(path.resolve("./seed/tasks.json")));
  await Task.deleteMany({});
  await Task.insertMany(tasks);

  // Incidents (need to resolve operatorId by name)
  const incidentsRaw = JSON.parse(fs.readFileSync(path.resolve("./seed/incidents.json")));
  await Incident.deleteMany({});
  for (const inc of incidentsRaw) {
    const op = await Operator.findOne({ name: inc.operatorName });
    if (op) {
      await Incident.create({
        operatorId: op._id,
        type: inc.type,
        timestamp: inc.timestamp,
        description: inc.description
      });
    }
  }

  console.log("Database seeded!");
  mongoose.disconnect();
}

seed();
