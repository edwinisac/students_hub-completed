// Phase 4: greedy, dynamic programming, and backtracking planners.
export function greedyPlan(tasks, budget) {
  let remaining = Number(budget) || 0;
  const chosen = [];
  for (const task of [...tasks].sort((a,b) => b.priority - a.priority)) {
    if (task.minutes <= remaining) { chosen.push(task); remaining -= task.minutes; }
  }
  return { chosen, usedMinutes: (Number(budget)||0) - remaining, remainingMinutes: remaining };
}

// 0/1 knapsack: maximize total priority within the minute budget.
export function optimalPlan(tasks, budget) {
  const cap = Math.max(0, Math.min(600, Number(budget) || 0));
  const dp = Array.from({length: tasks.length + 1}, () => Array(cap + 1).fill(0));
  for (let i=1; i<=tasks.length; i++) {
    const t = tasks[i-1];
    for (let w=0; w<=cap; w++) {
      dp[i][w] = t.minutes <= w
        ? Math.max(dp[i-1][w], dp[i-1][w-t.minutes] + t.priority)
        : dp[i-1][w];
    }
  }
  let w = cap; const chosen = [];
  for (let i=tasks.length; i>0; i--) {
    if (dp[i][w] !== dp[i-1][w]) { chosen.push(tasks[i-1]); w -= tasks[i-1].minutes; }
  }
  chosen.reverse();
  const usedMinutes = chosen.reduce((sum,t)=>sum+t.minutes,0);
  return { chosen, score: chosen.reduce((sum,t)=>sum+t.priority,0), usedMinutes, remainingMinutes: cap-usedMinutes };
}

// Backtracking: assign each task to a time slot without exceeding slot capacity.
export function buildTimetable(tasks, slots) {
  const assigned = [];
  const remaining = slots.map(s => ({...s, remaining: s.capacity}));
  function search(index) {
    if (index === tasks.length) return true;
    const task = tasks[index];
    for (const slot of remaining) {
      if (slot.remaining >= task.minutes) {
        slot.remaining -= task.minutes;
        assigned.push({ task: task.title, slot: slot.label, minutes: task.minutes });
        if (search(index + 1)) return true;
        assigned.pop();
        slot.remaining += task.minutes;
      }
    }
    return false;
  }
  const success = search(0);
  return { success, timetable: success ? assigned : [], message: success ? "All tasks fit without slot conflicts." : "No conflict-free placement exists for all tasks." };
}
