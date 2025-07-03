// Frontend copy of calculateScore for operator creation
export default function calculateScore({ fuelEfficiency, estimatedTime, actualTime, safetyViolations }) {
  let timeScore = 100;
  if (actualTime > estimatedTime && estimatedTime > 0) {
    timeScore = Math.max(0, 100 - ((actualTime - estimatedTime) / estimatedTime) * 100);
  }
  let safetyScore = Math.max(0, 100 - (safetyViolations * 10));
  const score = (
    (fuelEfficiency * 0.4) +
    (timeScore * 0.3) +
    (safetyScore * 0.3)
  );
  return Math.round(score);
}
