'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import CopyButton from '@/components/CopyButton'
import { useHistory } from '@/components/HistoryProvider'

const TIME_SIGNATURES = [
  { id: '4/4', label: '4/4', beats: 4 },
  { id: '3/4', label: '3/4', beats: 3 },
  { id: '6/8', label: '6/8', beats: 6 },
  { id: '5/4', label: '5/4', beats: 5 },
  { id: '7/8', label: '7/8', beats: 7 },
]

function getBpmLabel(bpm) {
  if (bpm < 40) return { label: 'Grave', color: 'text-blue-400' }
  if (bpm < 60) return { label: 'Largo', color: 'text-blue-300' }
  if (bpm < 76) return { label: 'Adagio', color: 'text-green-400' }
  if (bpm < 108) return { label: 'Andante', color: 'text-green-300' }
  if (bpm < 120) return { label: 'Moderato', color: 'text-yellow-400' }
  if (bpm < 156) return { label: 'Allegro', color: 'text-orange-400' }
  if (bpm < 176) return { label: 'Vivace', color: 'text-red-400' }
  return { label: 'Presto', color: 'text-red-500' }
}

export default function BpmTapPage() {
  const { addEntry } = useHistory()
  const [bpm, setBpm] = useState(null)
  const [taps, setTaps] = useState([])
  const [status, setStatus] = useState('idle')
  const [timeSig, setTimeSig] = useState('4/4')
  const [history, setHistory] = useState([])
  const [metronomeOn, setMetronomeOn] = useState(false)
  const times = useRef([])
  const timer = useRef(null)
  const metronomeTimer = useRef(null)
  const metronomeCtx = useRef(null)
  const beatCount = useRef(0)

  const handleTap = useCallback(() => {
    const now = Date.now()
    times.current = times.current.filter(t => now - t < 5000)
    times.current.push(now)
    setTaps([...times.current])

    if (times.current.length < 2) { setStatus('tap more'); return }

    const intervals = []
    for (let i = 1; i < times.current.length; i++) {
      intervals.push(times.current[i] - times.current[i - 1])
    }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const calculated = Math.round(60000 / avg)
    const clamped = Math.min(Math.max(calculated, 30), 300)
    setBpm(clamped)
    setStatus('tapping')
    addEntry('BPM Tapper')

    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setStatus('idle')
      setHistory(h => [{ bpm: clamped, time: new Date().toLocaleTimeString(), taps: times.current.length }, ...h].slice(0, 20))
    }, 2000)
  }, [addEntry])

  const handleReset = useCallback(() => {
    times.current = []
    setTaps([])
    setBpm(null)
    setStatus('idle')
    stopMetronome()
  }, [])

  const startMetronome = useCallback(() => {
    if (!bpm) return
    setMetronomeOn(true)
    beatCount.current = 0
    const interval = 60000 / bpm
    const playClick = () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        const beats = TIME_SIGNATURES.find(t => t.id === timeSig)?.beats || 4
        osc.frequency.value = beatCount.current % beats === 0 ? 1000 : 600
        gain.gain.value = 0.2
        osc.start()
        osc.stop(ctx.currentTime + 0.05)
      } catch {}
      beatCount.current++
    }
    playClick()
    metronomeTimer.current = setInterval(playClick, interval)
  }, [bpm, timeSig])

  const stopMetronome = useCallback(() => {
    setMetronomeOn(false)
    clearInterval(metronomeTimer.current)
    beatCount.current = 0
  }, [])

  useEffect(() => {
    return () => { clearTimeout(timer.current); clearInterval(metronomeTimer.current) }
  }, [])

  useEffect(() => {
    const handler = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'Space') { e.preventDefault(); handleTap() }
      if (e.key === 'Escape') handleReset()
      if (e.key === 'm' || e.key === 'M') metronomeOn ? stopMetronome() : startMetronome()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const tapsDisplay = taps.slice(-20)
  const intervals = []
  for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1])
  const stdDev = intervals.length > 1 ? Math.sqrt(intervals.reduce((s, v) => s + Math.pow(v - intervals.reduce((a, b) => a + b, 0) / intervals.length, 2), 0) / intervals.length) : 0
  const consistency = bpm ? Math.max(0, 100 - Math.round(stdDev / 10)) : 0
  const bpmInfo = bpm ? getBpmLabel(bpm) : null
  const beats = TIME_SIGNATURES.find(t => t.id === timeSig)?.beats || 4

  const historyText = history.map(h => `${h.time} | ${h.bpm} BPM | ${h.taps} taps`).join('\n')
  const fullText = bpm ? `${bpm} BPM (${bpmInfo?.label || ''}) · ${Math.round(60000 / bpm)} ms/beat · ${consistency}% consistent` : ''

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">♩</span>
        <h1 className="font-heading text-2xl font-bold text-text">BPM Tapper</h1>
      </div>

      <GlassCard>
        <div className="p-8 flex flex-col items-center gap-6">
          {metronomeOn && bpm && (
            <div className="flex gap-2">
              {Array.from({ length: beats }).map((_, i) => (
                <motion.div key={i}
                  animate={{ scale: beatCount.current % beats === i ? 1.3 : 1, backgroundColor: beatCount.current % beats === i ? 'rgb(59 130 246)' : 'rgb(229 231 235)' }}
                  className="w-3 h-3 rounded-full"
                  transition={{ duration: 0.1 }} />
              ))}
            </div>
          )}

          <button onClick={handleTap}
            className="w-48 h-48 rounded-full bg-primary/10 border-2 border-primary/30 text-primary text-6xl hover:bg-primary/20 hover:border-primary/50 active:scale-95 transition-all cursor-pointer select-none flex items-center justify-center">
            ♩
          </button>

          <div className="text-center">
            {bpm ? (
              <div className="space-y-1">
                <div className="text-6xl font-bold font-heading text-text tabular-nums">{bpm}</div>
                {bpmInfo && <div className={`text-sm font-medium ${bpmInfo.color}`}>{bpmInfo.label}</div>}
                <div className="text-xs text-text-tertiary font-mono">{Math.round(60000 / bpm)} ms / beat</div>
              </div>
            ) : (
              <div className="text-lg text-text-secondary">
                {status === 'idle' ? 'Tap the circle or press Space' : 'Keep tapping...'}
              </div>
            )}
            <div className="text-sm text-text-tertiary mt-1">BPM</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-text-tertiary">
              {taps.length} tap{taps.length !== 1 ? 's' : ''}
              {consistency > 0 && ` · ${consistency}% consistent`}
            </div>
            <CopyButton text={fullText} />
            {taps.length > 0 && (
              <button onClick={handleReset} className="text-xs px-3 py-1.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-text cursor-pointer transition-colors">
                Reset
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      <div className="flex flex-wrap gap-2 mt-4">
        {TIME_SIGNATURES.map(ts => (
          <button key={ts.id} onClick={() => setTimeSig(ts.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              timeSig === ts.id ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
            }`}>{ts.label}</button>
        ))}
        {bpm && (
          <button onClick={metronomeOn ? stopMetronome : startMetronome}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              metronomeOn ? 'bg-cat-success text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
            }`}>
            {metronomeOn ? '■ Stop Metronome' : '▶ Metronome'}
          </button>
        )}
      </div>

      <GlassCard className="mt-4">
        <div className="p-4">
          <div className="text-xs text-text-tertiary mb-2">Tap History (last 5 seconds)</div>
          <div className="flex items-end gap-1 h-16">
            {tapsDisplay.map((t, i) => {
              const h = i > 0 ? Math.min(100, ((t - tapsDisplay[tapsDisplay.length - 1]) * -1) / 50) : 0
              return <div key={i} className="flex-1 bg-primary/30 rounded-t" style={{ height: `${Math.max(h, 4)}%` }} />
            })}
            {taps.length === 0 && <div className="text-xs text-text-tertiary w-full text-center pt-6">No taps yet</div>}
          </div>
        </div>
      </GlassCard>

      {history.length > 0 && (
        <GlassCard className="mt-4">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Session History ({history.length})</span>
              <CopyButton text={historyText} />
            </div>
            <div className="space-y-1 max-h-40 overflow-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0">
                  <span className="text-text-secondary">{h.time}</span>
                  <span className="font-mono font-semibold text-text">{h.bpm} BPM</span>
                  <span className="text-text-secondary">{h.taps} taps</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}
    </motion.div>
  )
}
