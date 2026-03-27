// ─────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────

// Deep copy + initialize
function dc(input) {
  return input.map(p => ({
    pid: p.pid,
    arrivalTime: p.arrivalTime,
    burstTime: p.burstTime,
    priority: p.priority ?? 0,
    remainingTime: p.burstTime,
    completionTime: 0,
    turnaroundTime: 0,
    waitingTime: 0
  }))
}

// Calculate metrics
function cm(p) {
  p.turnaroundTime = p.completionTime - p.arrivalTime
  p.waitingTime = p.turnaroundTime - p.burstTime
}

// Compress Gantt Chart (VERY IMPORTANT)
function compressGantt(gantt) {
  if (gantt.length === 0) return []

  const result = [gantt[0]]

  for (let i = 1; i < gantt.length; i++) {
    const prev = result[result.length - 1]
    const curr = gantt[i]

    if (prev.pid === curr.pid && prev.end === curr.start) {
      prev.end = curr.end
    } else {
      result.push({ ...curr })
    }
  }

  return result
}

// Build final result
function buildResult(name, ps, gantt) {
  const n = ps.length

  const totalWT = ps.reduce((sum, p) => sum + p.waitingTime, 0)
  const totalTAT = ps.reduce((sum, p) => sum + p.turnaroundTime, 0)

  // Sort output nicely
  ps.sort((a, b) => a.pid - b.pid)

  return {
    algorithm: name,
    processes: ps,
    ganttChart: gantt,
    avgWT: n ? totalWT / n : 0,
    avgTAT: n ? totalTAT / n : 0
  }
}

// ─────────────────────────────────────────────
// FCFS
// ─────────────────────────────────────────────
export function fcfs(input) {
  const ps = dc(input).sort((a, b) => a.arrivalTime - b.arrivalTime)
  let t = 0
  const g = []

  ps.forEach(p => {
    if (t < p.arrivalTime) t = p.arrivalTime

    const start = t
    t += p.burstTime

    p.completionTime = t
    cm(p)

    g.push({ pid: p.pid, start, end: t })
  })

  return buildResult('FCFS', ps, g)
}

// ─────────────────────────────────────────────
// SJF (Non-preemptive)
// ─────────────────────────────────────────────
export function sjf(input) {
  const ps = dc(input)
  let t = 0, completed = 0
  const n = ps.length
  const g = []

  while (completed < n) {
    const ready = ps.filter(p => p.arrivalTime <= t && p.completionTime === 0)

    if (ready.length === 0) {
      g.push({ pid: 'Idle', start: t, end: t + 1 })
      t++
      continue
    }

    ready.sort((a, b) => a.burstTime - b.burstTime)
    const p = ready[0]

    const start = t
    t += p.burstTime

    p.completionTime = t
    cm(p)

    g.push({ pid: p.pid, start, end: t })
    completed++
  }

  return buildResult('SJF', ps, compressGantt(g))
}

// ─────────────────────────────────────────────
// PRIORITY (Non-preemptive)
// ─────────────────────────────────────────────
export function prioritySched(input) {
  const ps = dc(input)
  let t = 0, completed = 0
  const n = ps.length
  const g = []

  while (completed < n) {
    const ready = ps.filter(p => p.arrivalTime <= t && p.completionTime === 0)

    if (ready.length === 0) {
      g.push({ pid: 'Idle', start: t, end: t + 1 })
      t++
      continue
    }

    // Lower number = higher priority
    ready.sort((a, b) => a.priority - b.priority)
    const p = ready[0]

    const start = t
    t += p.burstTime

    p.completionTime = t
    cm(p)

    g.push({ pid: p.pid, start, end: t })
    completed++
  }

  return buildResult('Priority', ps, compressGantt(g))
}

// ─────────────────────────────────────────────
// ROUND ROBIN
// ─────────────────────────────────────────────
export function roundRobin(input, quantum = 2) {
  const ps = dc(input).sort((a, b) => a.arrivalTime - b.arrivalTime)
  const queue = []
  const g = []

  let t = 0, i = 0

  while (queue.length > 0 || i < ps.length) {

    while (i < ps.length && ps[i].arrivalTime <= t) {
      queue.push(ps[i])
      i++
    }

    if (queue.length === 0) {
      g.push({ pid: 'Idle', start: t, end: t + 1 })
      t++
      continue
    }

    const p = queue.shift()
    const start = t
    const exec = Math.min(quantum, p.remainingTime)

    t += exec
    p.remainingTime -= exec

    g.push({ pid: p.pid, start, end: t })

    while (i < ps.length && ps[i].arrivalTime <= t) {
      queue.push(ps[i])
      i++
    }

    if (p.remainingTime > 0) {
      queue.push(p)
    } else {
      p.completionTime = t
      cm(p)
    }
  }

  return buildResult('Round Robin', ps, compressGantt(g))
}

// ─────────────────────────────────────────────
// SRTF (Preemptive)
// ─────────────────────────────────────────────
export function srtf(input) {
  const ps = dc(input)
  const g = []

  let t = 0, completed = 0
  const n = ps.length

  while (completed < n) {
    const ready = ps.filter(p => p.arrivalTime <= t && p.remainingTime > 0)

    if (ready.length === 0) {
      g.push({ pid: 'Idle', start: t, end: t + 1 })
      t++
      continue
    }

    ready.sort((a, b) => {
      if (a.remainingTime === b.remainingTime) {
        return a.arrivalTime - b.arrivalTime
      }
      return a.remainingTime - b.remainingTime
    })

    const p = ready[0]

    const start = t
    t++
    p.remainingTime--

    g.push({ pid: p.pid, start, end: t })

    if (p.remainingTime === 0) {
      p.completionTime = t
      cm(p)
      completed++
    }
  }

  return buildResult('SRTF (Preemptive)', ps, compressGantt(g))
}