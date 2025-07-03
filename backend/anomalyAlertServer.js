// Simple Express server to simulate anomaly alerts for Smart Operator Assistant

// Use require for compatibility with Node.js without ESM
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());


// Anomaly messages
const anomalyAlerts = [
  'Warning: Fuel level critically low!',
  'Alert: Engine temperature exceeds safe limit!',
  'Caution: Hydraulic pressure abnormal!',
  'Safety: Please fasten your seatbelt!',
  'Weather alert: Rain expected at 3 PM',
];

let lastMessage = '';
let normalCounter = 0;

app.get('/api/alert', (req, res) => {
  // Simulate anomaly every 4th call, otherwise send empty (no alert)
  normalCounter++;
  if (normalCounter % 4 === 0) {
    // Pick a random anomaly
    const idx = Math.floor(Math.random() * anomalyAlerts.length);
    lastMessage = anomalyAlerts[idx];
    res.json({ message: lastMessage });
  } else {
    res.json({ message: '' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Anomaly alert server running on http://localhost:${PORT}`);
});
