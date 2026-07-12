'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import CopyButton from '@/components/CopyButton'
import { useHistory } from '@/components/HistoryProvider'

export default function AveragePage() {
  const { addEntry } = useHistory()
  const [input, setInput] = useState('23, 45, 67, 12, 89, 34, 55')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])

  const calculate = useCallback(() => {
    setError('')
    const nums = input.split(/[,\s]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
    if (nums.length < 2) { setError('Enter at least 2 numbers separated by commas.'); setResult(null); return }

    const sorted = [...nums].sort((a, b) => a - b)
    const sum = nums.reduce((a, b) => a + b, 0)
    const mean = sum / nums.length
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]

    const freq = {}
    for (const n of nums) freq[n] = (freq[n] || 0) + 1
    const maxFreq = Math.max(...Object.values(freq))
    const mode = Object.entries(freq).filter(([, c]) => c === maxFreq).map(([k]) => parseFloat(k))

    const min = sorted[0]
    const max = sorted[sorted.length - 1]
    const range = max - min

    const variance = nums.reduce((s, n) => s + Math.pow(n - mean, 2), 0) / nums.length
    const stdDev = Math.sqrt(variance)
    const populationVariance = variance
    const sampleVariance = nums.length > 1 ? nums.reduce((s, n) => s + Math.pow(n - mean, 2), 0) / (nums.length - 1) : 0
    const sampleStdDev = Math.sqrt(sampleVariance)

    const q1 = sorted[Math.floor(sorted.length * 0.25)]
    const q3 = sorted[Math.floor(sorted.length * 0.75)]
    const iqr = q3 - q1
    const mad = nums.reduce((s, n) => s + Math.abs(n - mean), 0) / nums.length

    const maxVal = Math.max(...Object.values(freq))
    const freqBars = Object.entries(freq)
      .sort((a, b) => a[0] - b[0])
      .map(([val, count]) => ({ val: parseFloat(val), count, pct: Math.round((count / nums.length) * 100) }))

    const res = {
      count: nums.length, sum, mean, median, mode, min, max, range,
      populationVariance, sampleVariance, populationStd: stdDev, sampleStd: sampleStdDev,
      q1, q3, iqr, mad, sorted: sorted.join(', '), freqBars, maxFreq: maxVal
    }
    setResult(res)
    addEntry('Average Calculator')
    setHistory(h => [{ count: nums.length, mean: mean.toFixed(2), input: input.slice(0, 40), time: new Date().toLocaleTimeString() }, ...h].slice(0, 15))
  }, [input, addEntry])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">Σ</span>
        <h1 className="font-heading text-2xl font-bold text-text">Average Calculator</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4 max-w-lg mx-auto">
          <div>
            <label className="text-xs text-text-tertiary mb-2 block">Numbers (comma or space separated)</label>
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={3}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
          </div>
          <button onClick={calculate} className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Calculate</button>

          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
              {[
                { label: 'Count', value: result.count },
                { label: 'Sum', value: result.sum.toLocaleString() },
                { label: 'Mean (Average)', value: result.mean.toFixed(4) },
                { label: 'Median', value: result.median.toFixed(4) },
                { label: 'Mode', value: result.mode.length === result.count ? 'No mode' : result.mode.join(', ') },
                { label: 'Min', value: result.min },
                { label: 'Max', value: result.max },
                { label: 'Range', value: result.range },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                  <span className="text-text-tertiary">{r.label}</span>
                  <span className="font-mono font-semibold text-text">{r.value}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </GlassCard>

      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}

      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Spread</span>
              <div className="space-y-1.5">
                {[
                  { label: 'Population Std Dev', value: result.populationStd.toFixed(4) },
                  { label: 'Sample Std Dev', value: result.sampleStd.toFixed(4) },
                  { label: 'Population Variance', value: result.populationVariance.toFixed(4) },
                  { label: 'Sample Variance', value: result.sampleVariance.toFixed(4) },
                  { label: 'Mean Absolute Deviation', value: result.mad.toFixed(4) },
                  { label: 'Q1 (25th percentile)', value: result.q1 },
                  { label: 'Q3 (75th percentile)', value: result.q3 },
                  { label: 'IQR', value: result.iqr },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between py-1 px-3 rounded-lg bg-surface border border-border/50 text-xs">
                    <span className="text-text-tertiary">{r.label}</span>
                    <span className="font-mono font-semibold text-text">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Value Distribution</span>
              <div className="space-y-1 max-h-64 overflow-auto">
                {result.freqBars.map(({ val, count, pct }) => (
                  <div key={val} className="flex items-center gap-2 text-[11px]">
                    <span className="w-12 text-right font-mono text-text-secondary shrink-0">{val}</span>
                    <div className="flex-1 bg-surface rounded h-4 overflow-hidden">
                      <div className="h-full bg-primary/60 rounded" style={{ width: `${(count / result.maxFreq) * 100}%` }} />
                    </div>
                    <span className="w-12 text-right font-mono text-text-secondary shrink-0">{count}× ({pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {result && (
        <details className="mt-3 text-xs text-text-tertiary">
          <summary className="cursor-pointer hover:text-text">Sorted Data</summary>
          <div className="mt-1 font-mono text-text-secondary bg-surface rounded-lg px-3 py-2 border border-border">{result.sorted}</div>
        </details>
      )}

      {history.length > 0 && (
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">History ({history.length})</span>
            <div className="space-y-1 max-h-48 overflow-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-text-secondary truncate flex-1 mr-3">{h.input}</span>
                  <span className="font-mono text-text shrink-0">n={h.count}</span>
                  <span className="font-mono font-semibold text-text shrink-0 ml-2">μ={h.mean}</span>
                  <span className="text-text-tertiary shrink-0 ml-2">{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}
    </motion.div>
  )
}
