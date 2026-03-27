// Deep copy processes with computed fields reset
function dc(ps) {
  return ps.map(p => ({ ...p, remainingTime: p.burstTime, completionTime: 0, turnaroundTime: 0, waitingTime: 0 }))
}
function cm(p) {
  p.turnaroundTime = p.completionTime - p.arrivalTime
  p.waitingTime    = p.turnaroundTime - p.burstTime
}
function mk(algorithm, processes, ganttChart) {
  const avgWT  = processes.reduce((s, p) => s + p.waitingTime, 0)  / processes.length
  const avgTAT = processes.reduce((s, p) => s + p.turnaroundTime, 0) / processes.length
  return { algorithm, processes, ganttChart, avgWT, avgTAT }
}

export function fcfs(input) {
  const ps = dc(input).sort((a, b) => a.arrivalTime - b.arrivalTime)
  const g = []; let t = 0
  ps.forEach(p => {
    if (t < p.arrivalTime) t = p.arrivalTime
    g.push({ pid: p.pid, start: t, end: t + p.burstTime })
    t += p.burstTime; p.completionTime = t; cm(p)
  })
  return mk('FCFS', ps, g)
}

export function sjf(input) {
  const ps = dc(input), rem = [...ps], g = []; let t = 0, done = 0
  while (done < ps.length) {
    const ready = rem.filter(p => p.arrivalTime <= t)
    if (!ready.length) { t++; continue }
    ready.sort((a, b) => a.burstTime - b.burstTime)
    const p = ready[0]; rem.splice(rem.indexOf(p), 1)
    g.push({ pid: p.pid, start: t, end: t + p.burstTime })
    t += p.burstTime; p.completionTime = t; cm(p); done++
  }
  return mk('SJF', ps, g)
}

export function prioritySched(input) {
  const ps = dc(input), rem = [...ps], g = []; let t = 0, done = 0
  while (done < ps.length) {
    const ready = rem.filter(p => p.arrivalTime <= t)
    if (!ready.length) { t++; continue }
    ready.sort((a, b) => a.priority - b.priority)
    const p = ready[0]; rem.splice(rem.indexOf(p), 1)
    g.push({ pid: p.pid, start: t, end: t + p.burstTime })
    t += p.burstTime; p.completionTime = t; cm(p); done++
  }
  return mk('Priority', ps, g)
}

export function roundRobin(input, quantum) {
  const ps = dc(input).sort((a, b) => a.arrivalTime - b.arrivalTime)
  const queue = [], g = []; let t = 0, idx = 0
  while (idx < ps.length && ps[idx].arrivalTime <= t) queue.push(ps[idx++])
  while (queue.length) {
    const p = queue.shift()
    const ex = Math.min(quantum, p.remainingTime)
    g.push({ pid: p.pid, start: t, end: t + ex })
    t += ex; p.remainingTime -= ex
    while (idx < ps.length && ps[idx].arrivalTime <= t) queue.push(ps[idx++])
    if (p.remainingTime > 0) queue.push(p)
    else { p.completionTime = t; cm(p) }
  }
  return mk(`Round Robin (Q=${quantum})`, ps, g)
}

export function srtf(input) {
  const ps = dc(input)
  const n = ps.length
  let t = 0, completed = 0
  const g = []
  let lastPid = -1, segStart = 0

  while (completed < n) {
    const ready = ps.filter(p => p.arrivalTime <= t && p.remainingTime > 0)
    if (!ready.length) { t++; continue }
    ready.sort((a, b) => a.remainingTime - b.remainingTime)
    const p = ready[0]

    if (p.pid !== lastPid) {
      if (lastPid !== -1) g.push({ pid: lastPid, start: segStart, end: t })
      segStart = t; lastPid = p.pid
    }

    p.remainingTime--; t++
    if (p.remainingTime === 0) {
      p.completionTime = t; cm(p); completed++
      g.push({ pid: p.pid, start: segStart, end: t })
      lastPid = -1
    }
  }
  return mk('SRTF', ps, g)
}