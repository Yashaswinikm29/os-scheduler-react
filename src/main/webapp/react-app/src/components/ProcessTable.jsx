import React from 'react'

const s = {
  btn: {
    background: 'transparent', color: '#c0392b',
    border: '1px solid rgba(192,57,43,0.25)', padding: '4px 10px',
    borderRadius: 4, cursor: 'pointer', fontSize: '0.73rem',
    fontFamily: "'IBM Plex Sans', sans-serif"
  },
  input: {
    background: 'transparent', border: 'none', color: '#1a2e3a',
    width: 70, padding: '3px 4px', fontSize: '0.85rem',
    borderBottom: '1px solid #a8cfe0',
    fontFamily: "'IBM Plex Mono', monospace", outline: 'none'
  }
}

export default function ProcessTable({ processes, onUpdate, onRemove, showPriority }) {
  return (
    <table>
      <thead>
        <tr>
          <th>PID</th>
          <th>Arrival Time</th>
          <th>Burst Time</th>
          {showPriority && <th>Priority</th>}
          <th>Remove</th>
        </tr>
      </thead>
      <tbody>
        {processes.map(p => (
          <tr key={p.id}>
            <td>P{p.pid}</td>
            <td>
              <input
                style={s.input} type="number" min="0"
                value={p.arrivalTime}
                onChange={e => onUpdate(p.id, 'arrivalTime', +e.target.value)}
              />
            </td>
            <td>
              <input
                style={s.input} type="number" min="1"
                value={p.burstTime}
                onChange={e => onUpdate(p.id, 'burstTime', +e.target.value)}
              />
            </td>
            {showPriority && (
              <td>
                <input
                  style={s.input} type="number" min="1"
                  value={p.priority}
                  onChange={e => onUpdate(p.id, 'priority', +e.target.value)}
                />
              </td>
            )}
            <td>
              <button style={s.btn} onClick={() => onRemove(p.id)}>Remove</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
