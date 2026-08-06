'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import CopyButton from '@/components/CopyButton'
import { useHistory } from '@/components/HistoryProvider'

export default function RandomPickerPage() {
  const { addEntry } = useHistory()
  const [input, setInput] = useState('')
  const [items, setItems] = useState([])
  const [picked, setPicked] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [count, setCount] = useState(1)
  const [results, setResults] = useState([])
  const [history, setHistory] = useState([])
  const [excludePicked, setExcludePicked] = useState(false)
  const [excludeList, setExcludeList] = useState([])
  const [weights, setWeights] = useState({})
  const [weightedMode, setWeightedMode] = useState(false)
  const [noRepeat, setNoRepeat] = useState(false)
  const intervalRef = useRef(null)

  const parseItems = useCallback(() => {
    const list = input.split('\n').map(s => s.trim()).filter(Boolean)
    setItems(list)
    setPicked(null)
    setResults([])
  }, [input])

  const pick = useCallback(() => {
    const available = excludePicked
      ? items.filter(i => !excludeList.includes(i))
      : items
    if (available.length === 0) return
    addEntry('Random Picker')
    setSpinning(true)
    let ticks = 0
    const maxTicks = 20 + Math.floor(Math.random() * 10)
    intervalRef.current = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * available.length)
      setPicked(available[randomIdx])
      ticks++
      if (ticks >= maxTicks) {
        clearInterval(intervalRef.current)
        setSpinning(false)
        const chosen = []
        const pool = [...available]
        for (let i = 0; i < Math.min(count, pool.length); i++) {
          let idx
          if (weightedMode && Object.keys(weights).length > 0) {
            const totalWeight = pool.reduce((s, item) => s + (weights[item] || 1), 0)
            let rand = Math.random() * totalWeight
            idx = 0
            for (let j = 0; j < pool.length; j++) {
              rand -= (weights[pool[j]] || 1)
              if (rand <= 0) { idx = j; break }
            }
          } else {
            idx = Math.floor(Math.random() * pool.length)
          }
          chosen.push(pool[idx])
          pool.splice(idx, 1)
        }
        setPicked(chosen[0])
        setResults(chosen)
        setHistory(h => [{ items: chosen, time: new Date().toLocaleTimeString() }, ...h].slice(0, 20))
        if (excludePicked && noRepeat) {
          setExcludeList(el => [...el, ...chosen])
        }
      }
    }, 60)
  }, [items, count, addEntry, excludePicked, excludeList, weightedMode, weights, noRepeat])

  const availableCount = excludePicked ? items.filter(i => !excludeList.includes(i)).length : items.length

  const weightText = items.map(i => `${i}: ${weights[i] || 1}`).join('\n')
  const historyText = history.map(h => `${h.time} | Picked: ${h.items.join(', ')}`).join('\n')

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">?</span>
        <h1 className="font-heading text-2xl font-bold text-text">Random Picker</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Enter items (one per line)</label>
              <textarea value={input} onChange={e => setInput(e.target.value)}
                placeholder="apple&#10;banana&#10;cherry&#10;durian"
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors min-h-[160px] resize-y" />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={parseItems}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 hover:text-text transition-all cursor-pointer">
                Parse ({items.length} items)
              </button>
              <div className="flex items-center gap-2 ml-auto">
                <label className="text-xs text-text-tertiary">Pick</label>
                <select value={count} onChange={e => setCount(parseInt(e.target.value))}
                  className="bg-surface rounded-lg px-2 py-1 text-xs text-text border border-border cursor-pointer">
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-xs text-text-tertiary">item{count > 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-3">
              <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
                <input type="checkbox" checked={excludePicked} onChange={e => setExcludePicked(e.target.checked)}
                  className="accent-primary rounded" />
                Exclude already picked
              </label>
              {excludePicked && (
                <label className="flex items-center gap-2 text-sm text-text cursor-pointer ml-4">
                  <input type="checkbox" checked={noRepeat} onChange={e => setNoRepeat(e.target.checked)}
                    className="accent-primary rounded" />
                  Don&apos;t re-pick across sessions ({excludeList.length} excluded)
                </label>
              )}
              <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
                <input type="checkbox" checked={weightedMode} onChange={e => setWeightedMode(e.target.checked)}
                  className="accent-primary rounded" />
                Weighted random
              </label>
            </div>

            {weightedMode && items.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-auto border-t border-border pt-3">
                <label className="text-[10px] text-text-tertiary block mb-1">Weights (higher = more likely)</label>
                {items.map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs">
                    <span className="text-text-secondary truncate flex-1">{item}</span>
                    <input type="number" min={1} max={100} value={weights[item] || 1}
                      onChange={e => setWeights(w => ({ ...w, [item]: parseInt(e.target.value) || 1 }))}
                      className="w-16 bg-surface text-text text-center rounded border border-border px-1 py-0.5 outline-none focus:border-primary/50" />
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-tertiary">{availableCount} items available</span>
              {excludePicked && excludeList.length > 0 && (
                <button onClick={() => setExcludeList([])} className="text-[10px] text-cat-text hover:underline cursor-pointer">Reset excluded</button>
              )}
            </div>

            <button onClick={pick} disabled={availableCount === 0 || spinning}
              className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 transition-all cursor-pointer">
              {spinning ? 'Picking...' : 'Pick Random'}
            </button>
          </div>
        </GlassCard>

        <div className="space-y-5">
          {items.length > 0 && (
            <GlassCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-tertiary">Items ({items.length})</span>
                  <CopyButton text={items.join('\n')} />
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto">
                  {items.map((item, i) => (
                    <span key={i}
                      className={`px-2 py-1 text-xs rounded-lg border transition-all ${
                        results.includes(item)
                          ? 'bg-primary/20 border-primary/40 text-primary font-semibold'
                          : excludeList.includes(item)
                            ? 'bg-surface border-border/50 text-text-tertiary line-through'
                            : 'bg-surface border-border/50 text-text-secondary'
                      }`}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

          {picked && !spinning && (
            <GlassCard>
              <div className="p-4 text-center">
                <span className="text-xs text-text-tertiary mb-2 block">
                  Picked {results.length > 1 ? `${results.length} items` : 'item'}
                </span>
                <div className="flex flex-wrap justify-center gap-3">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.1 }}
                        className="text-2xl font-bold font-heading text-primary">
                        {r}
                      </motion.div>
                      <CopyButton text={r} />
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

          {spinning && picked && (
            <GlassCard>
              <div className="p-4 text-center">
                <span className="text-xs text-text-tertiary mb-2 block">Picking...</span>
                <div className="text-2xl font-bold font-heading text-primary">{picked}</div>
              </div>
            </GlassCard>
          )}

          {weightedMode && items.length > 0 && (
            <GlassCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-tertiary">Weight Distribution</span>
                  <CopyButton text={weightText} />
                </div>
                <div className="space-y-1">
                  {items.map(item => {
                    const w = weights[item] || 1
                    const total = items.reduce((s, i) => s + (weights[i] || 1), 0)
                    const pct = Math.round((w / total) * 100)
                    return (
                      <div key={item} className="flex items-center gap-2 text-[11px]">
                        <span className="w-20 text-right text-text-secondary truncate shrink-0">{item}</span>
                        <div className="flex-1 bg-surface rounded h-3 overflow-hidden">
                          <div className="h-full bg-primary/60 rounded" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-10 text-right font-mono text-text-secondary shrink-0">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </GlassCard>
          )}

          {history.length > 0 && (
            <GlassCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-tertiary">History ({history.length})</span>
                  <CopyButton text={historyText} />
                </div>
                <div className="space-y-1 max-h-48 overflow-auto">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-text-secondary">{h.time}</span>
                      <span className="font-mono text-text truncate flex-1 mx-2">{h.items.join(', ')}</span>
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
