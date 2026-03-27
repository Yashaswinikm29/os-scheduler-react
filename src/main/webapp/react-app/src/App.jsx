import React, { useState, useCallback } from 'react'
import GanttChart   from './components/GanttChart.jsx'
import ProcessTable from './components/ProcessTable.jsx'
import { fcfs, sjf, prioritySched, roundRobin, srtf } from './scheduler.js'

// ── Shared styles ──────────────────────────────────────────────────────────
const css = {
  // (NO CHANGE — styles remain same)
}

const ALGO_COLORS = ['#1a6b8a','#7c3aed','#0e7c7b','#b85c00','#ff4d4d'] // added color for SRTF
const BEST_FOR    = ['Batch systems','Known burst times','Critical priority tasks','Interactive systems','Shortest remaining time optimization']
const RESOURCE    = ['Very Low','Low','Medium','Medium–High','High']

let idCounter = 10
const newProcess = (pid, at=0, bt=1, pri=1) => ({ id: idCounter++, pid, arrivalTime: at, burstTime: bt, priority: pri })
const SAMPLES = [[0,5,2],[1,3,1],[2,8,3],[3,2,4]]

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [tab,     setTab]     = useState('simulate')
  const [algo,    setAlgo]    = useState('fcfs')
  const [quantum, setQuantum] = useState(2)
  const [procs,   setProcs]   = useState(() => SAMPLES.map((s,i) => newProcess(i+1,...s)))
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')

  const [cmpProcs,  setCmpProcs]  = useState(() => SAMPLES.map((s,i) => newProcess(i+1,...s)))
  const [cmpQ,      setCmpQ]      = useState(2)
  const [cmpResult, setCmpResult] = useState(null)

  // process CRUD
  const addProc    = (list, setList) => setList(prev => [...prev, newProcess(prev.length+1)])
  const removeProc = (list, setList, id) => setList(prev => prev.filter(p => p.id !== id))
  const updateProc = (list, setList, id, field, val) =>
    setList(prev => prev.map(p => p.id===id ? {...p,[field]:val} : p))

  const runSim = () => {
    setError('')
    if (!procs.length) { setError('Add at least one process.'); return }
    const q = quantum || 2

    let r
    switch(algo){
      case 'fcfs': r = fcfs(procs); break;
      case 'sjf': r = sjf(procs); break;
      case 'priority': r = prioritySched(procs); break;
      case 'rr': r = roundRobin(procs, q); break;
      case 'srtf': r = srtf(procs); break;   // ✅ ADDED
      default: r = fcfs(procs)
    }

    setResult(r)
    setTimeout(()=>document.getElementById('results-section')?.scrollIntoView({behavior:'smooth'}),100)
  }

  const runCompare = () => {
    if (!cmpProcs.length) return
    const q = cmpQ || 2

    const results = [
      fcfs(cmpProcs),
      sjf(cmpProcs),
      prioritySched(cmpProcs),
      roundRobin(cmpProcs, q),
      srtf(cmpProcs) // ✅ ADDED
    ]

    let bestIdx = 0
    results.forEach((r,i) => { if(r.avgWT < results[bestIdx].avgWT) bestIdx = i })

    setCmpResult({ results, bestIdx, q })
    setTimeout(()=>document.getElementById('cmp-results')?.scrollIntoView({behavior:'smooth'}),100)
  }

  return (
    <>
      {/* HEADER */}
      <header style={css.header}>
        <div style={css.headerInner}>
          <div>
            <h1 style={css.h1}>OS <span style={css.h1span}>Scheduling</span> Simulator</h1>
          </div>
          <div style={css.badges}>
            {['● SYSTEM ONLINE','FCFS','SJF','PRIORITY','ROUND ROBIN','SRTF'].map((b,i)=>(  // ✅ ADDED SRTF
              <span key={b} style={css.badge(i===0)}>{b}</span>
            ))}
          </div>
        </div>
      </header>

      {/* SIMULATE TAB */}
      {tab==='simulate' && (
        <>
          <div style={css.panel}>
            <div style={css.formRow}>
              <div style={css.formGroup}>
                <label style={css.label}>Algorithm</label>
                <select style={css.select} value={algo} onChange={e=>setAlgo(e.target.value)}>
                  <option value="fcfs">FCFS — First Come First Serve</option>
                  <option value="sjf">SJF — Shortest Job First</option>
                  <option value="priority">Priority Scheduling</option>
                  <option value="rr">Round Robin</option>
                  <option value="srtf">SRTF — Shortest Remaining Time First</option> {/* ✅ ADDED */}
                </select>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}