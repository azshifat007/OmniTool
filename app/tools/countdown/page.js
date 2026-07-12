'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'

function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (type === 'beep') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.value = 0.3
      osc.start()
      osc.stop(ctx.currentTime + 0.4)
    } else if (type === 'chime') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(523, ctx.currentTime)
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.15)
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.3)
      gain.gain.value = 0.3
      osc.start()
      osc.stop(ctx.currentTime + 0.6)
    } else if (type === 'alarm') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'square'
      gain.gain.value = 0.2
      for (let i = 0; i < 6; i++) {
        osc.frequency.setValueAtTime(800, ctx.currentTime + i * 0.15)
        osc.frequency.setValueAtTime(600, ctx.currentTime + i * 0.15 + 0.075)
      }
      osc.start()
      osc.stop(ctx.currentTime + 1)
    } else if (type === 'bell') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = 1200
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1)
      osc.start()
      osc.stop(ctx.currentTime + 1)
    }
  } catch {}
}

function sendNotification(label) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(label || 'Timer Complete', { body: 'Your countdown has finished!', icon: '/favicon.ico' })
    }
  } catch {}
}

function pad(n) { return n.toString().padStart(2, '0') }

const PRESETS = [
  { label: '30s', seconds: 30 },
  { label: '1m', seconds: 60 },
  { label: '2m', seconds: 120 },
  { label: '5m', seconds: 300 },
  { label: '10m', seconds: 600 },
]

export default function CountdownPage() {
  const [total, setTotal] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const [label, setLabel] = useState('')
  const [sound, setSound] = useState('beep')
  const [notify, setNotify] = useState(false)
  const [intervalMode, setIntervalMode] = useState(false)
  const [rounds, setRounds] = useState(1)
  const [currentRound, setCurrentRound] = useState(0)
  const [breakTime, setBreakTime] = useState(0)
  const [onBreak, setOnBreak] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  useEffect(() => {
    if (notify && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [notify])

  const startCountdown = useCallback((secs, isBreak) => {
    setRemaining(secs)
    setRunning(true)
    setOnBreak(isBreak)
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          playSound(sound)
          if (notify) sendNotification(label || 'Timer Complete')

          if (!isBreak && intervalMode && currentRound < rounds - 1) {
            setCurrentRound(r => r + 1)
            setOnBreak(true)
            setTimeout(() => startCountdown(breakTime, true), 500)
            return 0
          }

          setRunning(false)
          setFinished(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [sound, notify, label, intervalMode, currentRound, rounds, breakTime])

  const start = useCallback(() => {
    if (remaining <= 0) return
    setFinished(false)
    setCurrentRound(0)
    startCountdown(remaining, false)
  }, [remaining, startCountdown])

  const pause = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setRunning(false)
    setOnBreak(false)
    setFinished(false)
    setCurrentRound(0)
    setRemaining(total)
  }, [total])

  const setPreset = (seconds) => {
    setTotal(seconds)
    setRemaining(seconds)
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setRunning(false)
    setFinished(false)
  }

  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  const s = remaining % 60
  const progress = total > 0 ? (remaining / total) * 100 : 0

  const scoreText = label
    ? `${label}: ${pad(h)}:${pad(m)}:${pad(s)} remaining`
    : `Timer: ${pad(h)}:${pad(m)}:${pad(s)} remaining`

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">⏳</span>
        <h1 className="font-heading text-2xl font-bold text-text">Countdown Timer</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4">
          <div>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Timer label (optional)"
              disabled={running}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors text-center disabled:opacity-40" />
          </div>

          <div className="flex justify-center">
            <div className={`text-6xl sm:text-7xl font-bold font-mono tracking-widest text-text tabular-nums ${onBreak ? 'text-cat-success' : ''}`}>
              {pad(h)}:{pad(m)}:{pad(s)}
            </div>
          </div>

          {onBreak && <div className="text-center text-sm text-cat-success font-medium">Break Time</div>}
          {intervalMode && rounds > 1 && (
            <div className="text-center text-xs text-text-secondary">
              Round {currentRound + 1} / {rounds}
            </div>
          )}

          {total > 0 && (
            <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ease-linear ${onBreak ? 'bg-cat-success' : 'bg-primary'}`}
                style={{ width: `${progress}%` }} />
            </div>
          )}

          {finished && (
            <div className="text-center text-sm text-cat-success font-medium">
              {label ? `${label} is done!` : 'Time\'s up!'}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            {PRESETS.map(p => (
              <button key={p.seconds} onClick={() => setPreset(p.seconds)} disabled={running}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            <div>
              <label className="text-xs text-text-tertiary block text-center">Hours</label>
              <input type="number" min={0} max={99} value={Math.floor(total / 3600)}
                onChange={e => { const v = (parseInt(e.target.value) || 0) * 3600 + (total % 3600); setTotal(v); setRemaining(v) }}
                disabled={running}
                className="w-full bg-surface text-text text-center rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-primary/50 disabled:opacity-40" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary block text-center">Minutes</label>
              <input type="number" min={0} max={59} value={Math.floor((total % 3600) / 60)}
                onChange={e => { const v = Math.floor(total / 3600) * 3600 + ((parseInt(e.target.value) || 0) * 60) + (total % 60); setTotal(v); setRemaining(v) }}
                disabled={running}
                className="w-full bg-surface text-text text-center rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-primary/50 disabled:opacity-40" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary block text-center">Seconds</label>
              <input type="number" min={0} max={59} value={total % 60}
                onChange={e => { const v = Math.floor(total / 60) * 60 + (parseInt(e.target.value) || 0); setTotal(v); setRemaining(v) }}
                disabled={running}
                className="w-full bg-surface text-text text-center rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-primary/50 disabled:opacity-40" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-4">
              <label className="text-xs text-text-tertiary">Sound:</label>
              {['beep', 'chime', 'alarm', 'bell'].map(s => (
                <button key={s} onClick={() => { setSound(s); playSound(s) }}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded capitalize transition-all cursor-pointer ${sound === s ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border'}`}>
                  {s}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)}
                className="accent-primary rounded" />
              Browser notification
            </label>
          </div>

          <div className="space-y-3 border-t border-border pt-3">
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input type="checkbox" checked={intervalMode} onChange={e => { setIntervalMode(e.target.checked); if (!e.target.checked) { setCurrentRound(0); setOnBreak(false) } }}
                className="accent-primary rounded" />
              Interval mode
            </label>
            {intervalMode && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-tertiary block mb-1">Rounds</label>
                  <input type="number" min={1} max={20} value={rounds}
                    onChange={e => setRounds(parseInt(e.target.value) || 1)}
                    disabled={running}
                    className="w-full bg-surface text-text text-center rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-primary/50 disabled:opacity-40" />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary block mb-1">Break (sec)</label>
                  <input type="number" min={0} max={300} value={breakTime}
                    onChange={e => setBreakTime(parseInt(e.target.value) || 0)}
                    disabled={running}
                    className="w-full bg-surface text-text text-center rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-primary/50 disabled:opacity-40" />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-2">
            {!running ? (
              <button onClick={start} disabled={remaining <= 0}
                className="px-5 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                Start
              </button>
            ) : (
              <button onClick={pause}
                className="px-5 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 transition-all cursor-pointer">
                Pause
              </button>
            )}
            <button onClick={reset} disabled={total === 0}
              className="px-5 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
              Reset
            </button>
          </div>

          <div className="text-[10px] text-text-tertiary text-center">Space = start/pause · Esc = reset</div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
