'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import CopyButton from '@/components/CopyButton'
import { useHistory } from '@/components/HistoryProvider'

function getCpsRating(cps) {
  if (cps >= 14) return { label: 'Legendary', color: 'text-purple-400' }
  if (cps >= 12) return { label: 'Pro', color: 'text-cat-success' }
  if (cps >= 10) return { label: 'Fast', color: 'text-blue-400' }
  if (cps >= 8) return { label: 'Good', color: 'text-yellow-400' }
  if (cps >= 5) return { label: 'Average', color: 'text-text-secondary' }
  return { label: 'Slow', color: 'text-cat-text' }
}

export default function ClickSpeedPage() {
  const { addEntry } = useHistory()
  const [count, setCount] = useState(0)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [duration, setDuration] = useState(5)
  const [history, setHistory] = useState([])
  const [bestCps, setBestCps] = useState(0)
  const [clickTimes, setClickTimes] = useState([])
  const [positions, setPositions] = useState([])
  const buttonRef = useRef(null)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('click-speed-best')
      if (saved) setBestCps(parseFloat(saved))
    } catch {}
  }, [])

  const saveBest = (cps) => {
    if (cps > bestCps) {
      setBestCps(cps)
      try { localStorage.setItem('click-speed-best', cps.toString()) } catch {}
    }
  }

  const start = useCallback(() => {
    setCount(0)
    setRunning(true)
    setResult(null)
    setClickTimes([])
    setPositions([])
    startTimeRef.current = Date.now()
    addEntry('Click Speed Test')
    const end = Date.now() + duration * 1000
    timerRef.current = setInterval(() => {
      if (Date.now() >= end) {
        clearInterval(timerRef.current)
        setRunning(false)
      }
    }, 50)
  }, [duration, addEntry])

  const handleClick = (e) => {
    if (!running) { start(); return }
    setCount(c => c + 1)
    setClickTimes(t => [...t, Date.now() - startTimeRef.current])
    if (e && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setPositions(p => [...p, { x, y }])
    }
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        handleClick()
      }
      if (e.key === 'Escape' && running) stopEarly()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const stopEarly = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setRunning(false)
  }

  useEffect(() => {
    if (!running && count > 0 && !result) {
      const elapsed = clickTimes.length > 1 ? (clickTimes[clickTimes.length - 1] / 1000) : duration
      const cps = (count / elapsed).toFixed(1)
      const rating = getCpsRating(parseFloat(cps))
      const newResult = { clicks: count, cps, elapsed: elapsed.toFixed(1), rating }
      setResult(newResult)
      setHistory(h => [{ ...newResult, time: new Date().toLocaleTimeString() }, ...h].slice(0, 20))
      saveBest(parseFloat(cps))
    }
  }, [running, count])

  const intervals = clickTimes.length > 1
    ? clickTimes.slice(1).map((t, i) => t - clickTimes[i])
    : []
  const avgInterval = intervals.length > 0 ? (intervals.reduce((a, b) => a + b, 0) / intervals.length / 1000).toFixed(2) : '-'
  const maxInterval = intervals.length > 0 ? (Math.max(...intervals) / 1000).toFixed(2) : '-'
  const minInterval = intervals.length > 0 ? (Math.min(...intervals) / 1000).toFixed(2) : '-'

  const historyText = history.map(h => `${h.time} | ${h.clicks} clicks | ${h.cps} CPS | ${h.rating.label}`).join('\n')

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">◎</span>
        <h1 className="font-heading text-2xl font-bold text-text">Click Speed Test</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-6 flex flex-col items-center gap-6">
            {!running && !result && (
              <div className="flex gap-2">
                {[5, 10, 15, 30].map(t => (
                  <button key={t} onClick={() => setDuration(t)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${duration === t ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'}`}>{t}s</button>
                ))}
              </div>
            )}

            <button ref={buttonRef} onClick={handleClick} disabled={running && result}
              className="w-48 h-48 rounded-full text-4xl font-bold bg-primary text-white hover:bg-primary-dark active:scale-95 transition-all shadow-lg cursor-pointer select-none relative overflow-hidden">
              {positions.map((p, i) => (
                <span key={i} className="absolute w-2 h-2 rounded-full bg-white/30 pointer-events-none"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }} />
              ))}
              {running ? count : result ? 'Again' : 'Start'}
            </button>

            {running && (
              <button onClick={stopEarly} className="text-xs text-cat-text hover:underline cursor-pointer">Stop early (Esc)</button>
            )}

            {running && (
              <div className="text-6xl font-mono font-bold text-text">{count}</div>
            )}

            {!running && !result && (
              <div className="text-[10px] text-text-tertiary">Press Space to click</div>
            )}
          </div>
        </GlassCard>

        <div className="space-y-4">
          {result && (
            <GlassCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-tertiary">Results</span>
                  <span className={`text-xs font-semibold ${result.rating.color}`}>{result.rating.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface rounded-lg p-4 border border-border text-center">
                    <div className="text-[10px] text-text-tertiary mb-1">Clicks</div>
                    <div className="text-3xl font-mono font-bold text-text">{result.clicks}</div>
                  </div>
                  <div className="bg-surface rounded-lg p-4 border border-border text-center">
                    <div className="text-[10px] text-text-tertiary mb-1">CPS</div>
                    <div className="text-3xl font-mono font-bold text-text">{result.cps}</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-surface rounded p-2 border border-border">
                    <div className="text-[10px] text-text-tertiary">Avg Gap</div>
                    <div className="text-sm font-mono font-semibold text-text">{avgInterval}s</div>
                  </div>
                  <div className="bg-surface rounded p-2 border border-border">
                    <div className="text-[10px] text-text-tertiary">Min Gap</div>
                    <div className="text-sm font-mono font-semibold text-text">{minInterval}s</div>
                  </div>
                  <div className="bg-surface rounded p-2 border border-border">
                    <div className="text-[10px] text-text-tertiary">Max Gap</div>
                    <div className="text-sm font-mono font-semibold text-text">{maxInterval}s</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {bestCps > 0 && (
            <GlassCard>
              <div className="p-4 flex items-center justify-between">
                <span className="text-xs text-text-tertiary">Personal Best</span>
                <span className="text-lg font-mono font-bold text-cat-success">{bestCps} CPS</span>
              </div>
            </GlassCard>
          )}

          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">Rating</span>
                {result && <span className={`text-xs font-semibold ${result.rating.color}`}>You: {result.rating.label}</span>}
              </div>
              <div className="space-y-1 text-[11px] text-text-secondary leading-relaxed">
                <div className={result && parseFloat(result.cps) < 5 ? 'text-text font-semibold' : ''}>• Below 5 CPS: Slow</div>
                <div className={result && parseFloat(result.cps) >= 5 && parseFloat(result.cps) < 8 ? 'text-text font-semibold' : ''}>• 5-8 CPS: Average</div>
                <div className={result && parseFloat(result.cps) >= 8 && parseFloat(result.cps) < 10 ? 'text-text font-semibold' : ''}>• 8-10 CPS: Good</div>
                <div className={result && parseFloat(result.cps) >= 10 && parseFloat(result.cps) < 12 ? 'text-text font-semibold' : ''}>• 10-12 CPS: Fast</div>
                <div className={result && parseFloat(result.cps) >= 12 && parseFloat(result.cps) < 14 ? 'text-text font-semibold' : ''}>• 12-14 CPS: Pro</div>
                <div className={result && parseFloat(result.cps) >= 14 ? 'text-text font-semibold' : ''}>• 14+ CPS: Legendary</div>
              </div>
            </div>
          </GlassCard>

          {history.length > 0 && (
            <GlassCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-tertiary">History ({history.length})</span>
                  <CopyButton text={historyText} />
                </div>
                <div className="space-y-1 max-h-48 overflow-auto">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0">
                      <span className="text-text-secondary">{h.time}</span>
                      <span className="font-mono text-text">{h.clicks} clicks</span>
                      <span className="font-mono font-semibold text-text">{h.cps} CPS</span>
                      <span className={h.rating.color}>{h.rating.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  )
}
