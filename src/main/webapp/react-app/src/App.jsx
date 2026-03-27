import React, { useState } from 'react'
import GanttChart   from './components/GanttChart.jsx'
import ProcessTable from './components/ProcessTable.jsx'
import { fcfs, sjf, prioritySched, srtf } from './scheduler.js'

// ── Shared styles ──────────────────────────────────────────────────────────
const css = {
  header: {
    background: 'linear-gradient(135deg, #0f3c50 0%, #1a6b8a 50%, #0e7c7b 100%)',
    borderBottom: '3px solid #3db8e0', padding: 0
  },
  headerInner: {
    maxWidth: 1200, margin: '0 auto', padding: '20px 28px',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', flexWrap: 'wrap', gap: 12
  },
  h1: { fontFamily: "'IBM Plex Mono',monospace", fontSize: '1.35rem', fontWeight: 600, color: '#fff', letterSpacing: 1 },
  h1span: { color: '#7de8e8' },
  subtext: { fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  badges: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  badge: (active) => ({
    background: active ? 'rgba(125,232,232,0.2)' : 'rgba(255,255,255,0.1)',
    border: `1px solid ${active ? '#7de8e8' : 'rgba(255,255,255,0.2)'}`,
    color: active ? '#7de8e8' : 'rgba(255,255,255,0.85)',
    padding: '4px 12px', borderRadius: 20,
    fontSize: '0.7rem', fontFamily: "'IBM Plex Mono',monospace"
  }),
  tabs: {
    background: '#fff', borderBottom: '2px solid #a8cfe0',
    display: 'flex', padding: '0 28px', gap: 0, overflowX: 'auto'
  },
  tab: (active) => ({
    padding: '13px 22px', cursor: 'pointer',
    fontSize: '0.8rem', fontFamily: "'IBM Plex Mono',monospace",
    color: active ? '#1a6b8a' : '#5a8aa0',
    borderBottom: active ? '2px solid #1a6b8a' : '2px solid transparent',
    marginBottom: -2, letterSpacing: '0.5px', whiteSpace: 'nowrap',
    fontWeight: active ? 600 : 400, background: 'none', border: 'none',
    transition: 'all 0.2s'
  }),
  container: { maxWidth: 1200, margin: '0 auto', padding: '24px 20px' },
  panel: {
    background: '#fff', border: '1px solid #a8cfe0',
    borderRadius: 8, padding: 20, marginBottom: 18,
    boxShadow: '0 2px 8px rgba(26,107,138,0.08)'
  },
  panelTitle: {
    fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.72rem',
    fontWeight: 600, color: '#1a6b8a', letterSpacing: '1.5px',
    textTransform: 'uppercase', marginBottom: 16,
    paddingBottom: 10, borderBottom: '1px solid #d0e8f0',
    display: 'flex', alignItems: 'center', gap: 8
  },
  dot: { width: 6, height: 6, borderRadius: '50%', background: '#3db8e0', display: 'inline-block' },
  formRow: { display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: '0.68rem', color: '#5a8aa0', textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'IBM Plex Mono',monospace" },
  select: {
    background: '#f4fafc', border: '1px solid #a8cfe0', color: '#1a2e3a',
    padding: '8px 12px', borderRadius: 6, fontSize: '0.88rem',
    fontFamily: "'IBM Plex Mono',monospace", outline: 'none'
  },
  input: {
    background: '#f4fafc', border: '1px solid #a8cfe0', color: '#1a2e3a',
    padding: '8px 12px', borderRadius: 6, fontSize: '0.88rem',
    fontFamily: "'IBM Plex Mono',monospace", outline: 'none', width: 100
  },
  btnRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  btnAdd: {
    background: '#d0e8f0', color: '#1a6b8a', border: '1px solid #a8cfe0',
    padding: '9px 18px', borderRadius: 6, cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: 600, fontFamily: "'IBM Plex Sans',sans-serif"
  },
  btnRun: {
    background: 'linear-gradient(135deg,#1a6b8a 0%,#0e7c7b 100%)',
    color: '#fff', border: 'none', padding: '10px 26px',
    borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem',
    fontWeight: 600, fontFamily: "'IBM Plex Sans',sans-serif"
  },
  btnCompare: {
    background: 'linear-gradient(135deg,#0e7c7b 0%,#2490b5 100%)',
    color: '#fff', border: 'none', padding: '10px 26px',
    borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem',
    fontWeight: 600, fontFamily: "'IBM Plex Sans',sans-serif"
  },
  statsRow: { display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' },
  statCard: {
    flex: 1, minWidth: 130, background: '#fff',
    border: '1px solid #a8cfe0', borderRadius: 8,
    padding: 14, textAlign: 'center', borderTop: '3px solid #3db8e0'
  },
  statLabel: { fontSize: '0.62rem', color: '#5a8aa0', textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'IBM Plex Mono',monospace" },
  statValue: { fontSize: '1.4rem', fontWeight: 700, color: '#1a6b8a', marginTop: 4, fontFamily: "'IBM Plex Mono',monospace" },
  error: { color: '#c0392b', fontSize: '0.83rem', marginTop: 8, fontFamily: "'IBM Plex Mono',monospace" },
  recBox: {
    background: 'linear-gradient(135deg,rgba(14,124,123,0.06),rgba(36,144,181,0.04))',
    border: '1px solid rgba(14,124,123,0.3)', borderRadius: 8,
    padding: 18, marginBottom: 18
  },
  recLabel: { fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#0e7c7b', fontFamily: "'IBM Plex Mono',monospace", marginBottom: 6 },
  recAlgo:  { fontSize: '1.3rem', fontWeight: 700, color: '#1a6b8a', marginBottom: 5, fontFamily: "'IBM Plex Mono',monospace" },
  recReason:{ fontSize: '0.84rem', color: '#5a8aa0', lineHeight: 1.6 },
  compareGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 18 },
  algoCard: (best) => ({
    background: '#fff', border: `1px solid #a8cfe0`,
    borderLeft: `4px solid ${best ? '#0e7c7b' : '#a8cfe0'}`,
    borderRadius: 8, padding: 18, position: 'relative'
  }),
  bestBadge: {
    position: 'absolute', top: 12, right: 12,
    background: '#1aadac', color: '#fff',
    fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px',
    borderRadius: 20, textTransform: 'uppercase'
  },
  formulaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 14 },
  formulaCard: { background: '#fff', border: '1px solid #a8cfe0', borderRadius: 8, padding: 16 },
  fTitle: { fontSize: '0.68rem', textTransform: 'uppercase', color: '#1a6b8a', letterSpacing: 1, marginBottom: 10, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600 },
  fPill:  { background: '#d0e8f0', border: '1px solid #a8cfe0', borderRadius: 4, padding: '8px 12px', fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.82rem', color: '#b85c00', marginBottom: 8 },
  fDesc:  { fontSize: '0.78rem', color: '#5a8aa0', lineHeight: 1.6 },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 14, marginBottom: 18 },
}

// ── UPDATED: 4 algorithms — SRTF replaces Round Robin ─────────────────────
const ALGO_COLORS = ['#1a6b8a', '#7c3aed', '#0e7c7b', '#ff4d4d']
const BEST_FOR    = ['Batch systems', 'Known burst times', 'Critical priority tasks', 'Shortest remaining time optimization']
const RESOURCE    = ['Very Low', 'Low', 'Medium', 'High']

let idCounter = 10
const newProcess = (pid, at=0, bt=1, pri=1) => ({ id: idCounter++, pid, arrivalTime: at, burstTime: bt, priority: pri })
const SAMPLES = [[0,5,2],[1,3,1],[2,8,3],[3,2,4]]

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [tab,     setTab]     = useState('simulate')
  const [algo,    setAlgo]    = useState('fcfs')
  const [procs,   setProcs]   = useState(() => SAMPLES.map((s,i) => newProcess(i+1,...s)))
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')

  const [cmpProcs,  setCmpProcs]  = useState(() => SAMPLES.map((s,i) => newProcess(i+1,...s)))
  const [cmpResult, setCmpResult] = useState(null)

  // process CRUD
  const addProc    = (list, setList) => setList(prev => [...prev, newProcess(prev.length+1)])
  const removeProc = (list, setList, id) => setList(prev => prev.filter(p => p.id !== id))
  const updateProc = (list, setList, id, field, val) =>
    setList(prev => prev.map(p => p.id===id ? {...p,[field]:val} : p))

  const runSim = () => {
    setError('')
    if (!procs.length) { setError('Add at least one process.'); return }

    let r
    switch (algo) {
      case 'fcfs':     r = fcfs(procs);         break
      case 'sjf':      r = sjf(procs);          break
      case 'priority': r = prioritySched(procs); break
      case 'srtf':     r = srtf(procs);         break
      default:         r = fcfs(procs)
    }

    setResult(r)
    setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const runCompare = () => {
    if (!cmpProcs.length) return

    const results = [
      fcfs(cmpProcs),
      sjf(cmpProcs),
      prioritySched(cmpProcs),
      srtf(cmpProcs),
    ]

    let bestIdx = 0
    results.forEach((r, i) => { if (r.avgWT < results[bestIdx].avgWT) bestIdx = i })

    setCmpResult({ results, bestIdx })
    setTimeout(() => document.getElementById('cmp-results')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  return (
    <>
      {/* HEADER */}
      <header style={css.header}>
        <div style={css.headerInner}>
          <div>
            <h1 style={css.h1}>OS <span style={css.h1span}>Scheduling</span> Simulator</h1>
            <p style={css.subtext}>BNM Institute of Technology · DevOps (23CSE1663) · Srusti M &amp; Yashaswini K M</p>
          </div>
          <div style={css.badges}>
            {['● SYSTEM ONLINE', 'FCFS', 'SJF', 'PRIORITY', 'SRTF'].map((b, i) => (
              <span key={b} style={css.badge(i === 0)}>{b}</span>
            ))}
          </div>
        </div>
      </header>

      {/* TABS */}
      <div style={css.tabs}>
        {[['simulate','▸ Simulate'],['compare','▸ Compare All'],['formulas','▸ Formulas'],['guide','▸ Algorithm Guide']].map(([id,label]) => (
          <button key={id} style={css.tab(tab===id)} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      <div style={css.container}>

        {/* ════ TAB: SIMULATE ════ */}
        {tab==='simulate' && (
          <>
            <div style={css.panel}>
              <div style={css.panelTitle}><span style={css.dot}/> Configuration</div>
              <div style={css.formRow}>
                <div style={css.formGroup}>
                  <label style={css.label}>Algorithm</label>
                  <select style={css.select} value={algo} onChange={e => setAlgo(e.target.value)}>
                    <option value="fcfs">FCFS — First Come First Serve</option>
                    <option value="sjf">SJF — Shortest Job First</option>
                    <option value="priority">Priority Scheduling</option>
                    <option value="srtf">SRTF — Shortest Remaining Time First</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={css.panel}>
              <div style={css.btnRow}>
                <div style={css.panelTitle}><span style={css.dot}/> Process Input</div>
                <div style={{display:'flex',gap:8}}>
                  <button style={css.btnAdd} onClick={() => addProc(procs, setProcs)}>+ Add Process</button>
                  <button style={css.btnRun} onClick={runSim}>▶ Run Simulation</button>
                </div>
              </div>
              <ProcessTable
                processes={procs}
                showPriority={algo === 'priority'}
                onUpdate={(id,f,v) => updateProc(procs, setProcs, id, f, v)}
                onRemove={(id) => removeProc(procs, setProcs, id)}
              />
              {error && <div style={css.error}>{error}</div>}
            </div>

            {result && (
              <div id="results-section">
                <div style={css.statsRow}>
                  {[['Algorithm',result.algorithm],['Avg Waiting',result.avgWT.toFixed(2)+' ms'],['Avg Turnaround',result.avgTAT.toFixed(2)+' ms'],['Processes',result.processes.length]].map(([l,v]) => (
                    <div key={l} style={css.statCard}>
                      <div style={css.statLabel}>{l}</div>
                      <div style={{...css.statValue,fontSize:l==='Algorithm'?'0.9rem':'1.4rem'}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={css.panel}>
                  <div style={css.panelTitle}><span style={css.dot}/> Gantt Chart</div>
                  <GanttChart ganttChart={result.ganttChart}/>
                </div>
                <div style={css.panel}>
                  <div style={css.panelTitle}><span style={css.dot}/> Process Metrics</div>
                  <table>
                    <thead><tr><th>PID</th><th>Arrival</th><th>Burst</th><th>Priority</th><th>Completion</th><th>Turnaround</th><th>Waiting</th></tr></thead>
                    <tbody>
                      {result.processes.map(p => (
                        <tr key={p.pid}>
                          <td>P{p.pid}</td><td>{p.arrivalTime}</td><td>{p.burstTime}</td>
                          <td>{p.priority}</td><td>{p.completionTime}</td>
                          <td>{p.turnaroundTime}</td><td>{p.waitingTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ════ TAB: COMPARE ════ */}
        {tab==='compare' && (
          <>
            <div style={css.panel}>
              <div style={css.panelTitle}><span style={css.dot}/> Process Input for Comparison</div>
              <div style={{...css.formRow, marginBottom:14}}>
                <button style={{...css.btnCompare, marginTop:4}} onClick={runCompare}>Compare All 4 Algorithms</button>
              </div>
              <ProcessTable
                processes={cmpProcs} showPriority
                onUpdate={(id,f,v) => updateProc(cmpProcs, setCmpProcs, id, f, v)}
                onRemove={(id) => removeProc(cmpProcs, setCmpProcs, id)}
              />
              <button style={{...css.btnAdd, marginTop:12}} onClick={() => addProc(cmpProcs, setCmpProcs)}>+ Add Process</button>
            </div>

            {cmpResult && (
              <div id="cmp-results">
                <CompareResults {...cmpResult}/>
              </div>
            )}
          </>
        )}

        {/* ════ TAB: FORMULAS ════ */}
        {tab==='formulas' && <FormulasTab/>}

        {/* ════ TAB: GUIDE ════ */}
        {tab==='guide' && <GuideTab/>}

      </div>
    </>
  )
}

// ── Compare results subcomponent ──────────────────────────────────────────
function CompareResults({ results, bestIdx }) {
  const reasons = [
    'FCFS is straightforward but may cause high wait times if long processes arrive first.',
    'SJF gives the mathematically optimal average waiting time for non-preemptive scheduling.',
    'Priority scheduling ensures critical processes run first — ideal for real-time needs.',
    'SRTF is the preemptive version of SJF — minimizes average waiting time dynamically.',
  ]
  const maxWT  = Math.max(...results.map(r => r.avgWT))
  const maxTAT = Math.max(...results.map(r => r.avgTAT))

  return (
    <>
      <div style={css.recBox}>
        <div style={css.recLabel}>Best Algorithm for your input</div>
        <div style={css.recAlgo}>{results[bestIdx].algorithm} ★</div>
        <div style={css.recReason}>{reasons[bestIdx]} Average waiting time: {results[bestIdx].avgWT.toFixed(2)} ms.</div>
      </div>

      <div style={css.compareGrid}>
        {results.map((r, i) => (
          <div key={i} style={css.algoCard(i === bestIdx)}>
            {i === bestIdx && <div style={css.bestBadge}>Best</div>}
            <div style={{fontSize:'1rem',fontWeight:700,color:ALGO_COLORS[i],fontFamily:"'IBM Plex Mono',monospace",marginBottom:4}}>{r.algorithm}</div>
            <div style={{fontSize:'0.78rem',color:'#5a8aa0',fontFamily:"'IBM Plex Mono',monospace",marginBottom:12}}>
              AWT: {r.avgWT.toFixed(2)} ms &nbsp;|&nbsp; ATAT: {r.avgTAT.toFixed(2)} ms
            </div>
            <MiniGantt gantt={r.ganttChart}/>
          </div>
        ))}
      </div>

      <div style={css.panel}>
        <div style={css.panelTitle}><span style={css.dot}/> Average Waiting Time</div>
        {results.map((r,i) => <BarRow key={i} label={r.algorithm.split(' ')[0]} val={r.avgWT} max={maxWT} color={ALGO_COLORS[i]}/>)}
        <div style={{...css.panelTitle, marginTop:18}}><span style={css.dot}/> Average Turnaround Time</div>
        {results.map((r,i) => <BarRow key={i} label={r.algorithm.split(' ')[0]} val={r.avgTAT} max={maxTAT} color={ALGO_COLORS[i]}/>)}
      </div>

      <div style={css.panel}>
        <div style={css.panelTitle}><span style={css.dot}/> Full Comparison Table</div>
        <table>
          <thead><tr><th>Algorithm</th><th>Avg Waiting</th><th>Avg Turnaround</th><th>Best For</th><th>Resource Use</th></tr></thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} style={i === bestIdx ? {background:'rgba(14,124,123,0.05)'} : {}}>
                <td style={{color:ALGO_COLORS[i],fontWeight:600}}>{r.algorithm}{i===bestIdx?' ★':''}</td>
                <td>{r.avgWT.toFixed(2)} ms</td>
                <td>{r.avgTAT.toFixed(2)} ms</td>
                <td>{BEST_FOR[i]}</td>
                <td>{RESOURCE[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

const MINI_COLORS = ['#2490b5','#9b59b6','#1aadac','#e07800']
function MiniGantt({ gantt }) {
  const pidMap = {}; let ci = 0
  return (
    <div style={{display:'flex',gap:2,flexWrap:'wrap'}}>
      {gantt.map((s, i) => {
        if (!(s.pid in pidMap)) pidMap[s.pid] = MINI_COLORS[ci++ % MINI_COLORS.length]
        const w = Math.max(18, (s.end - s.start) * 10)
        return <div key={i} style={{height:16,borderRadius:2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.58rem',color:'#fff',fontWeight:600,minWidth:w,background:pidMap[s.pid],fontFamily:"'IBM Plex Mono',monospace"}}>P{s.pid}</div>
      })}
    </div>
  )
}

function BarRow({ label, val, max, color }) {
  const pct = max > 0 ? (val / max * 100).toFixed(1) : 0
  return (
    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:9}}>
      <div style={{width:90,fontSize:'0.74rem',color:'#5a8aa0',fontFamily:"'IBM Plex Mono',monospace",textAlign:'right',flexShrink:0}}>{label}</div>
      <div style={{flex:1,height:7,background:'#d0e8f0',borderRadius:4,overflow:'hidden'}}>
        <div style={{height:'100%',borderRadius:4,background:color,width:pct+'%',transition:'width 0.7s ease'}}/>
      </div>
      <div style={{width:55,fontSize:'0.74rem',fontFamily:"'IBM Plex Mono',monospace",color:'#1a2e3a'}}>{val.toFixed(2)}</div>
    </div>
  )
}

// ── Formulas Tab ──────────────────────────────────────────────────────────
function FormulasTab() {
  const formulas = [
    ['Turnaround Time (TAT)',    'TAT = Completion Time − Arrival Time',   'Total time from process arrival to completion. Includes both waiting and execution time.'],
    ['Waiting Time (WT)',        'WT = Turnaround Time − Burst Time',       'Time the process spends waiting in the ready queue before getting CPU.'],
    ['Average Waiting Time',    'AWT = Σ(Waiting Time) ÷ n',              'Sum of all waiting times divided by total number of processes. Lower is better.'],
    ['Average Turnaround Time', 'ATAT = Σ(Turnaround Time) ÷ n',          'Sum of all turnaround times divided by total processes. Lower is better.'],
    ['CPU Utilization',         'CPU% = (Busy Time ÷ Total Time) × 100',  'Percentage of time the CPU is actively executing processes.'],
    ['Throughput',              'Throughput = n ÷ Total Time',             'Number of processes completed per unit time. Higher = better.'],
    ['Response Time',           'RT = First CPU Time − Arrival Time',      'Time from arrival to first CPU access. Critical for interactive systems.'],
    ['SRTF Preemption',         'Preempt if new BT < current Remaining',   'SRTF preempts the running process when a shorter job arrives.'],
  ]
  return (
    <>
      <div style={css.panel}>
        <div style={css.panelTitle}><span style={css.dot}/> Key Formulas Reference</div>
        <div style={css.formulaGrid}>
          {formulas.map(([t,f,d]) => (
            <div key={t} style={css.formulaCard}>
              <div style={css.fTitle}>{t}</div>
              <div style={css.fPill}>{f}</div>
              <div style={css.fDesc}>{d}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={css.panel}>
        <div style={css.panelTitle}><span style={css.dot}/> Worked Example (FCFS)</div>
        <table>
          <thead><tr><th>PID</th><th>Arrival</th><th>Burst</th><th>Completion</th><th>TAT = CT − AT</th><th>WT = TAT − BT</th></tr></thead>
          <tbody>
            <tr><td>P1</td><td>0</td><td>5</td><td>5</td><td>5 − 0 = 5</td><td>5 − 5 = 0</td></tr>
            <tr><td>P2</td><td>1</td><td>3</td><td>8</td><td>8 − 1 = 7</td><td>7 − 3 = 4</td></tr>
            <tr><td>P3</td><td>2</td><td>8</td><td>16</td><td>16 − 2 = 14</td><td>14 − 8 = 6</td></tr>
            <tr style={{background:'#d0e8f0',fontWeight:600}}><td colSpan={4}>Average</td><td>ATAT = 26 ÷ 3 = 8.67</td><td>AWT = 10 ÷ 3 = 3.33</td></tr>
          </tbody>
        </table>
      </div>
    </>
  )
}

// ── Guide Tab ─────────────────────────────────────────────────────────────
function GuideTab() {
  const algos = [
    { name:'FCFS',     color:'#1a6b8a', type:'First Come First Serve · Non-Preemptive', desc:'Processes execute in arrival order. Simple queue — first in, first out.',                                   pros:['Simple to implement','No starvation'],             cons:['Convoy effect','High avg wait'],               best:'Batch jobs, print queues',              avoid:'Short processes behind long ones', cpu:'Very Low' },
    { name:'SJF',      color:'#7c3aed', type:'Shortest Job First · Non-Preemptive',     desc:'Shortest burst time runs first. Provably optimal average waiting time.',                                    pros:['Optimal AWT','High throughput'],                   cons:['Starvation risk','Needs burst time'],          best:'Batch systems with known burst times',  avoid:'Burst times unknown',             cpu:'Low'     },
    { name:'Priority', color:'#0e7c7b', type:'Priority Scheduling · Non-Preemptive',    desc:'Lower priority number = higher priority. Critical tasks run first.',                                        pros:['Critical tasks first','Flexible'],                 cons:['Starvation','Priority assignment'],            best:'Real-time systems, OS kernels',        avoid:'All processes equally important', cpu:'Medium'  },
    { name:'SRTF',     color:'#ff4d4d', type:'Shortest Remaining Time First · Preemptive', desc:'Preemptive version of SJF. Always runs the process with the least remaining burst time.',               pros:['Optimal AWT (preemptive)','Responsive'],           cons:['Context switch overhead','Needs burst time'],  best:'Time-sharing, interactive systems',    avoid:'Unknown burst times',             cpu:'High'    },
  ]
  const tag = (label, type) => {
    const colors = { green:['rgba(30,126,52,0.1)','#1e7e34','rgba(30,126,52,0.25)'], red:['rgba(192,57,43,0.1)','#c0392b','rgba(192,57,43,0.25)'], blue:['rgba(26,107,138,0.1)','#1a6b8a','rgba(26,107,138,0.25)'] }
    const [bg,cl,bo] = colors[type]
    return <span key={label} style={{display:'inline-block',padding:'2px 9px',borderRadius:20,fontSize:'0.65rem',fontWeight:600,margin:2,textTransform:'uppercase',background:bg,color:cl,border:`1px solid ${bo}`}}>{label}</span>
  }
  const whenToUse = [
    ['All processes arrive at same time',  'SJF',      '#7c3aed', 'Minimizes average waiting time'],
    ['Preemptive scheduling needed',       'SRTF',     '#ff4d4d', 'Always picks shortest remaining burst'],
    ['Critical tasks must run first',      'Priority', '#0e7c7b', 'High priority tasks run immediately'],
    ['Simple batch processing',            'FCFS',     '#1a6b8a', 'Easy to implement, zero overhead'],
    ['Minimize average waiting time',      'SJF/SRTF', '#7c3aed', 'Both proven optimal for their scheduling type'],
    ['Processes arrive at different times','SRTF',     '#ff4d4d', 'Dynamically picks shortest remaining job'],
    ['Least CPU overhead',                 'FCFS',     '#1a6b8a', 'No preemption, no extra context switching'],
  ]
  return (
    <>
      <div style={css.infoGrid}>
        {algos.map(a => (
          <div key={a.name} style={{...css.formulaCard, borderTop:`3px solid ${a.color}`}}>
            <div style={{fontSize:'0.95rem',fontWeight:700,color:a.color,fontFamily:"'IBM Plex Mono',monospace",marginBottom:3}}>{a.name}</div>
            <div style={{fontSize:'0.7rem',color:'#5a8aa0',fontFamily:"'IBM Plex Mono',monospace",marginBottom:10}}>{a.type}</div>
            <div style={{fontSize:'0.8rem',color:'#5a8aa0',lineHeight:1.6,marginBottom:10}}>{a.desc}</div>
            {a.pros.map(p => tag(p,'green'))}
            {a.cons.map(c => tag(c,'red'))}
            <div style={{marginTop:12,fontSize:'0.76rem',color:'#5a8aa0',lineHeight:1.8}}>
              <b style={{color:'#1a2e3a'}}>Best for:</b> {a.best}<br/>
              <b style={{color:'#1a2e3a'}}>Avoid when:</b> {a.avoid}<br/>
              <b style={{color:'#1a2e3a'}}>CPU overhead:</b> {a.cpu}
            </div>
          </div>
        ))}
      </div>
      <div style={css.panel}>
        <div style={css.panelTitle}><span style={css.dot}/> When to Use Which Algorithm</div>
        <table>
          <thead><tr><th>Situation</th><th>Best Algorithm</th><th>Reason</th></tr></thead>
          <tbody>
            {whenToUse.map(([sit,alg,col,reason]) => (
              <tr key={sit}>
                <td>{sit}</td>
                <td style={{color:col,fontWeight:600}}>{alg}</td>
                <td>{reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}