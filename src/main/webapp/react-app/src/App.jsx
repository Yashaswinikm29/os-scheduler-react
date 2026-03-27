import React, { useState } from 'react'
import GanttChart   from './components/GanttChart.jsx'
import ProcessTable from './components/ProcessTable.jsx'
import { fcfs, sjf, prioritySched, roundRobin, srtf } from './scheduler.js'

// ── Constants ─────────────────────────────────────────
const ALGO_COLORS = ['#1a6b8a','#7c3aed','#0e7c7b','#b85c00','#e11d48']
const BEST_FOR    = ['Batch systems','Known burst times','Critical priority tasks','Interactive systems','Shortest remaining jobs']
const RESOURCE    = ['Very Low','Low','Medium','Medium–High','High']

let idCounter = 10
const newProcess = (pid, at=0, bt=1, pri=1) => ({
  id: idCounter++, pid, arrivalTime: at, burstTime: bt, priority: pri
})

const SAMPLES = [[0,5,2],[1,3,1],[2,8,3],[3,2,4]]

export default function App() {
  const [algo, setAlgo] = useState('fcfs')
  const [quantum, setQuantum] = useState(2)
  const [procs, setProcs] = useState(() =>
    SAMPLES.map((s,i) => newProcess(i+1,...s))
  )
  const [result, setResult] = useState(null)

  // CRUD
  const addProc = () => setProcs(prev => [...prev, newProcess(prev.length+1)])
  const updateProc = (id, field, val) =>
    setProcs(prev => prev.map(p => p.id===id ? {...p,[field]:val} : p))
  const removeProc = (id) =>
    setProcs(prev => prev.filter(p => p.id!==id))

  // RUN
  const runSim = () => {
    let r = null
    const q = quantum || 2

    switch (algo) {
      case 'fcfs': r = fcfs(procs); break
      case 'sjf': r = sjf(procs); break
      case 'priority': r = prioritySched(procs); break
      case 'rr': r = roundRobin(procs, q); break
      case 'srtf': r = srtf(procs); break
      default: break
    }

    setResult(r)
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>OS Scheduling Simulator</h1>

      {/* Algorithm */}
      <select value={algo} onChange={e=>setAlgo(e.target.value)}>
        <option value="fcfs">FCFS</option>
        <option value="sjf">SJF</option>
        <option value="priority">Priority</option>
        <option value="rr">Round Robin</option>
        <option value="srtf">SRTF</option>
      </select>

      {/* Quantum */}
      {algo==='rr' && (
        <input
          type="number"
          value={quantum}
          onChange={e=>setQuantum(+e.target.value)}
        />
      )}

      <br/><br/>

      {/* Table */}
      <ProcessTable
        processes={procs}
        showPriority={algo==='priority'}
        onUpdate={updateProc}
        onRemove={removeProc}
      />

      <button onClick={addProc}>Add Process</button>
      <button onClick={runSim}>Run</button>

      {/* RESULT */}
      {result && (
        <>
          <h2>{result.algorithm}</h2>

          <p>Avg WT: {result.avgWT.toFixed(2)}</p>
          <p>Avg TAT: {result.avgTAT.toFixed(2)}</p>

          <GanttChart ganttChart={result.ganttChart} />

          <table border="1">
            <thead>
              <tr>
                <th>PID</th>
                <th>AT</th>
                <th>BT</th>
                <th>PR</th>
                <th>CT</th>
                <th>TAT</th>
                <th>WT</th>
              </tr>
            </thead>
            <tbody>
              {result.processes.map(p=>(
                <tr key={p.pid}>
                  <td>{p.pid}</td>
                  <td>{p.arrivalTime}</td>
                  <td>{p.burstTime}</td>
                  <td>{p.priority}</td>
                  <td>{p.completionTime}</td>
                  <td>{p.turnaroundTime}</td>
                  <td>{p.waitingTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}