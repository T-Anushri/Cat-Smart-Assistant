/**
 * Calculate operator score after task completion.
 * @param {number} fuelEfficiency - Operator's fuel efficiency (0-100)
 * @param {number} estimatedTime - Estimated time for the task
 * @param {number} actualTime - Actual time taken to complete the task
 * @param {number} safetyViolations - Number of safety violations
 * @returns {number} Score out of 100
 */
export default function calculateScore({ fuelEfficiency, estimatedTime, actualTime, safetyViolations }) {
  // Normalize time performance: 100 if on/below estimate, less if over
  let timeScore = 100;
  if (actualTime > estimatedTime && estimatedTime > 0) {
    timeScore = Math.max(0, 100 - ((actualTime - estimatedTime) / estimatedTime) * 100);
  }

  // Safety: each violation reduces score (e.g., 10 points per violation, capped at 100)
  let safetyScore = Math.max(0, 100 - (safetyViolations * 10));

  // Weighted sum
  const score = (
    (fuelEfficiency * 0.4) +
    (timeScore * 0.3) +
    (safetyScore * 0.3)
  );

  return Math.round(score);
}
