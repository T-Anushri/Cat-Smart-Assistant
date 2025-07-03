// Frontend copy of calculateScore for operator creation
// Frontend copy of calculateScore for operator creation (no time fields)
export default function calculateScore({ fuelEfficiency, safetyViolations }) {
  // For new operators, timeScore is always 100 (no time data yet)
  const timeScore = 100;
  const safetyScore = Math.max(0, 100 - (safetyViolations * 10));
  const score = (
    (fuelEfficiency * 0.4) +
    (timeScore * 0.3) +
    (safetyScore * 0.3)
  );
  return Math.round(score);
}
