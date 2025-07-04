// alertSimulator.js
import fs from 'fs';
import cron from 'node-cron';
import { faker } from '@faker-js/faker';


const DATA_FILE_CSV = 'operator_data.csv';
const DATA_FILE_JSON = 'operator_data.json';
const HIT_FILE_JSON = 'hit_events.json';

const operatorIds = ['OP001', 'OP002', 'OP003', 'OP004'];
const machineIds = ['MH01', 'MH02', 'MH03', 'MH04'];

let latestAlert = '';

function generateEntry(operatorId, machineId) {
  const timestamp = new Date().toISOString();
  const fuelUsed = faker.datatype.float({ min: 5, max: 20, precision: 0.01 });
  const loadCycles = faker.datatype.number({ min: 10, max: 100 });
  const envConditions = ['normal', 'terrain', 'rainy', 'dusty'];
  const environment = envConditions[Math.floor(Math.random() * envConditions.length)];
  const proximity = faker.datatype.float({ min: 0, max: 5, precision: 0.01 });
  const safetyViolations = faker.datatype.number({ min: 0, max: 5 });
  const idleTime = faker.datatype.number({ min: 0, max: 30 });
  const safetyBelt = Math.random() > 0.2 ? 'Yes' : 'No';

  return {
    timestamp,
    operatorId,
    machineId,
    fuelUsed,
    loadCycles,
    environment,
    proximity,
    safetyViolations,
    idleTime,
    safetyBelt
  };
}

function toCsvRow(entry) {
  return [
    entry.timestamp,
    entry.operatorId,
    entry.machineId,
    entry.fuelUsed,
    entry.loadCycles,
    entry.environment,
    entry.proximity,
    entry.safetyViolations,
    entry.idleTime,
    entry.safetyBelt
  ].join(',');
}

function writeCsvHeader() {
  const header = "timestamp,operatorId,machineId,fuelUsed,loadCycles,environment,proximity,safetyViolations,idleTime,safetyBelt\n";
  if (!fs.existsSync(DATA_FILE_CSV)) {
    fs.writeFileSync(DATA_FILE_CSV, header);
  }
}

function initializeFiles() {
  writeCsvHeader();
  const initialData = [];
  for (let i = 0; i < operatorIds.length; i++) {
    const entry = generateEntry(operatorIds[i], machineIds[i]);
    fs.appendFileSync(DATA_FILE_CSV, toCsvRow(entry) + '\n');
    initialData.push(entry);
  }
  fs.writeFileSync(DATA_FILE_JSON, JSON.stringify(initialData, null, 2));
}

function startAlertSimulator() {
  initializeFiles();

  cron.schedule('* * * * *', () => {
    let jsonData = [];
    if (fs.existsSync(DATA_FILE_JSON)) {
      const content = fs.readFileSync(DATA_FILE_JSON);
      jsonData = JSON.parse(content);
    }

    for (let i = 0; i < operatorIds.length; i++) {
      const newEntry = generateEntry(operatorIds[i], machineIds[i]);
      fs.appendFileSync(DATA_FILE_CSV, toCsvRow(newEntry) + '\n');
      jsonData.push(newEntry);

      // Alert logic
      if (newEntry.safetyBelt === 'No') {
        latestAlert = `⚠ Seatbelt not worn by ${newEntry.operatorId}`;
      }
      if (newEntry.proximity >= 3 && newEntry.proximity < 4) {
        latestAlert = `⚠ Obstacle near ${newEntry.operatorId}. Proximity: ${newEntry.proximity}`;
      }
      if (newEntry.proximity === 5) {
        latestAlert = `🚨 HIT happened! Operator: ${newEntry.operatorId}, Proximity: 5`;
        const hitLog = {
          operatorId: newEntry.operatorId,
          machineId: newEntry.machineId,
          timestamp: newEntry.timestamp,
          hitDamagePercent: faker.datatype.float({ min: 1, max: 100, precision: 0.01 })
        };
        let hitData = [];
        if (fs.existsSync(HIT_FILE_JSON)) {
          hitData = JSON.parse(fs.readFileSync(HIT_FILE_JSON));
        }
        hitData.push(hitLog);
        fs.writeFileSync(HIT_FILE_JSON, JSON.stringify(hitData, null, 2));
      }
    }

    fs.writeFileSync(DATA_FILE_JSON, JSON.stringify(jsonData, null, 2));
  });
}

// This makes latestAlert accessible to your routes
function getLatestAlert() {
  return latestAlert;
}

export { startAlertSimulator, getLatestAlert };
