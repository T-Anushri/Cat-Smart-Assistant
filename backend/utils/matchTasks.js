// Assign each task to a unique operator, considering score and safety only (no category)
export default function matchTasks(tasks, operators) {
  // Copy arrays to avoid mutation
  const availableOperators = [...operators];
  const assignments = [];

  console.log('Available operators:', availableOperators);

  // Sort tasks by complexity descending so hardest tasks get best operators
  const sortedTasks = [...tasks].sort((a, b) => b.complexityScore - a.complexityScore);

  for (const task of sortedTasks) {
    // Use operator score only
    const eligible = availableOperators
      .map(op => {
        const catScore = op.score || 0;
        // Ensure name and _id are present (handle Mongoose docs)
        return {
          _id: op._id,
          name: op.name,
          safetyViolations: op.safetyViolations,
          catScore,
          ...op
        };
      })
      .filter(op => op.catScore >= (task.complexityScore * 25 || 0));
    console.log(`Task: ${task.title} - Eligible operators:`, eligible.map(e => e.name));
    if (eligible.length === 0) {
      console.log(`No eligible operator for task: ${task.title}`);
      continue;
    }

    // Sort by fewest safety violations, then highest score
    eligible.sort((a, b) => {
      if (a.safetyViolations !== b.safetyViolations) return a.safetyViolations - b.safetyViolations;
      return b.catScore - a.catScore;
    });

    const best = eligible[0];
    assignments.push({ taskId: task._id, operatorId: best._id });

    // Remove assigned operator from pool (one task per operator per batch)
    const idx = availableOperators.findIndex(op => op._id === best._id);
    if (idx !== -1) availableOperators.splice(idx, 1);
  }

  return assignments;
}
