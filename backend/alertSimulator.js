import fs from 'fs';
import cron from 'node-cron';

const ALERT_FILE = 'latestAlert.json';
const alerts = [
  'Warning: Fuel level critically low!',
  'Alert: Engine temperature exceeds safe limit!',
  'Caution: Hydraulic pressure abnormal!',
  'Safety: Please fasten your seatbelt!',
  'Weather alert: Rain expected at 3 PM',
];

function writeAlert(message) {
  fs.writeFileSync(ALERT_FILE, JSON.stringify({ message }));
}

cron.schedule('*/5 * * * * *', () => { // every 5 seconds
  const idx = Math.floor(Math.random() * alerts.length);
  writeAlert(alerts[idx]);
  console.log('Wrote alert:', alerts[idx]);
});

console.log('Alert simulator running...');
