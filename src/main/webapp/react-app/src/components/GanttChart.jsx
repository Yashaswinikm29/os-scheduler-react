import React from 'react'

const styles = {
  wrapper:  { overflowX: 'auto', paddingBottom: 4 },
  outer:    { display: 'inline-flex', flexDirection: 'column', minWidth: '100%' },
  blocks:   {
    display: 'flex', alignItems: 'stretch',
    border: '1.5px solid #8bbcd4', borderRadius: 4,
    overflow: 'hidden', minHeight: 52
  },
  block:    (i) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.8rem', fontWeight: 600,
    color: '#1a3a4a', borderRight: '1.5px solid #8bbcd4',
    background: i % 2 === 0 ? '#c8e8d8' : '#a8d8bc',
    cursor: 'default', position: 'relative'
  }),
  ticksRow: { position: 'relative', height: 28 },
  tick:     (left) => ({
    position: 'absolute', left,
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.7rem', color: '#5a8aa0'
  }),
  tickLine: {
    display: 'block', width: 1, height: 5,
    background: '#5a8aa0', marginBottom: 2
  }
}

export default function GanttChart({ ganttChart }) {
  if (!ganttChart || !ganttChart.length) return null

  const firstStart = ganttChart[0].start
  const lastEnd    = ganttChart[ganttChart.length - 1].end
  const totalTime  = lastEnd - firstStart
  const scale      = Math.max(40, Math.min(80, 600 / totalTime))

  const timePoints = []
  ganttChart.forEach(s => { if (!timePoints.includes(s.start)) timePoints.push(s.start) })
  if (!timePoints.includes(lastEnd)) timePoints.push(lastEnd)

  return (
    <div style={styles.wrapper}>
      <div style={{ ...styles.outer, minWidth: totalTime * scale + 4 }}>

        {/* Colored blocks */}
        <div style={styles.blocks}>
          {ganttChart.map((slot, i) => {
            const w = (slot.end - slot.start) * scale
            return (
              <div
                key={i}
                style={{ ...styles.block(i), minWidth: w, width: w }}
                title={`P${slot.pid}: ${slot.start} → ${slot.end} (duration: ${slot.end - slot.start})`}
              >
                P{slot.pid}
              </div>
            )
          })}
        </div>

        {/* Time ticks */}
        <div style={styles.ticksRow}>
          {timePoints.map((tp, i) => (
            <div key={i} style={styles.tick((tp - firstStart) * scale)}>
              <span style={styles.tickLine} />
              {tp}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
