'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import CopyButton from '@/components/CopyButton'
import { useHistory } from '@/components/HistoryProvider'

const sortModes = [
  { id: 'asc', label: 'A → Z' },
  { id: 'desc', label: 'Z → A' },
  { id: 'num-asc', label: '0 → 9' },
  { id: 'num-desc', label: '9 → 0' },
  { id: 'len-asc', label: 'Short → Long' },
  { id: 'len-desc', label: 'Long → Short' },
  { id: 'frequency', label: 'By Frequency' },
  { id: 'randomize', label: 'Randomize' },
  { id: 'reverse', label: 'Reverse' },
]

function sortLines(lines, mode, caseInsensitive) {
  const arr = [...lines]
  const compare = caseInsensitive ? (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }) : (a, b) => a.localeCompare(b)
  switch (mode) {
    case 'asc': return arr.sort(compare)
    case 'desc': return arr.sort((a, b) => compare(b, a))
    case 'num-asc': return arr.sort((a, b) => {
      const na = parseFloat(a.replace(/[^0-9.-]/g, '')), nb = parseFloat(b.replace(/[^0-9.-]/g, ''))
      if (!isNaN(na) && !isNaN(nb)) return na - nb
      return a.localeCompare(b)
    })
    case 'num-desc': return arr.sort((a, b) => {
      const na = parseFloat(a.replace(/[^0-9.-]/g, '')), nb = parseFloat(b.replace(/[^0-9.-]/g, ''))
      if (!isNaN(na) && !isNaN(nb)) return nb - na
      return b.localeCompare(a)
    })
    case 'len-asc': return arr.sort((a, b) => a.length - b.length || compare(a, b))
    case 'len-desc': return arr.sort((a, b) => b.length - a.length || compare(a, b))
    case 'frequency': {
      const freq = {}
      for (const l of arr) freq[l.trim()] = (freq[l.trim()] || 0) + 1
      return arr.sort((a, b) => freq[b.trim()] - freq[a.trim()] || compare(a, b))
    }
    case 'randomize': {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    }
    case 'reverse': return arr.reverse()
    default: return arr
  }
}

export default function SorterPage() {
  const { addEntry } = useHistory()
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('asc')
  const [removeDups, setRemoveDups] = useState(false)
  const [caseInsensitive, setCaseInsensitive] = useState(false)
  const [trimWhitespace, setTrimWhitespace] = useState(false)
  const [lineNumbers, setLineNumbers] = useState(false)
  const [delimiter, setDelimiter] = useState('\n')
  const [autoPreview, setAutoPreview] = useState(true)

  const lines = useMemo(() => {
    let parts = input.split(delimiter === '\\n' ? '\n' : delimiter === '\\t' ? '\t' : delimiter)
    if (trimWhitespace) parts = parts.map(l => l.trim())
    if (removeDups) parts = [...new Set(parts)]
    return parts.filter(l => l.length > 0)
  }, [input, delimiter, trimWhitespace, removeDups])

  const output = useMemo(() => {
    if (!input.trim()) return ''
    const sorted = sortLines(lines, mode, caseInsensitive)
    const result = sorted.map((l, i) => lineNumbers ? `${i + 1}. ${l}` : l).join(delimiter === '\\n' ? '\n' : delimiter === '\\t' ? '\t' : delimiter)
    return result
  }, [lines, mode, caseInsensitive, lineNumbers, delimiter, input])

  useEffect(() => {
    if (autoPreview && input.trim()) addEntry('Text Sorter')
  }, [output, autoPreview, addEntry])

  const handleSort = useCallback(() => {
    if (!autoPreview) addEntry('Text Sorter')
  }, [autoPreview, addEntry])

  const stats = useMemo(() => {
    if (!input.trim()) return null
    return {
      inputLines: (input.match(delimiter === '\\n' ? /\n/g : delimiter === '\\t' ? /\t/g : new RegExp(delimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length + 1,
      outputLines: output ? output.split(delimiter === '\\n' ? '\n' : delimiter === '\\t' ? '\t' : delimiter).length : 0,
      uniqueLines: lines.length,
      charCount: output.length,
    }
  }, [input, output, lines, delimiter])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">↕</span>
        <h1 className="font-heading text-2xl font-bold text-text">Text Sorter</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              placeholder="Paste text to sort (one item per line by default)..."
              className="w-full h-36 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-text-tertiary" />
          </div>

          <div className="flex flex-wrap gap-2">
            {sortModes.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  mode === m.id ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                }`}>{m.label}</button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input type="checkbox" checked={removeDups} onChange={e => setRemoveDups(e.target.checked)}
                className="accent-primary rounded" />
              Remove duplicates
            </label>
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input type="checkbox" checked={caseInsensitive} onChange={e => setCaseInsensitive(e.target.checked)}
                className="accent-primary rounded" />
              Case insensitive
            </label>
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input type="checkbox" checked={trimWhitespace} onChange={e => setTrimWhitespace(e.target.checked)}
                className="accent-primary rounded" />
              Trim whitespace
            </label>
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input type="checkbox" checked={lineNumbers} onChange={e => setLineNumbers(e.target.checked)}
                className="accent-primary rounded" />
              Line numbers
            </label>
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input type="checkbox" checked={autoPreview} onChange={e => setAutoPreview(e.target.checked)}
                className="accent-primary rounded" />
              Live preview
            </label>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-text-tertiary">Delimiter:</label>
            <div className="flex gap-1.5">
              {[['\\n', 'Newline'], ['\\t', 'Tab'], [',', 'Comma'], [';', 'Semicolon'], ['|', 'Pipe']].map(([val, label]) => (
                <button key={val} onClick={() => setDelimiter(val)}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all cursor-pointer ${
                    delimiter === val ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border'
                  }`}>{label}</button>
              ))}
            </div>
          </div>

          {!autoPreview && (
            <button onClick={handleSort} disabled={!input.trim()}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
              Sort
            </button>
          )}
        </div>
      </GlassCard>

      {output && (
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-tertiary">Sorted Output</span>
                {stats && (
                  <span className="text-[10px] text-text-secondary">
                    {stats.outputLines} lines · {stats.charCount} chars · {stats.uniqueLines} unique
                  </span>
                )}
              </div>
              <CopyButton text={output} />
            </div>
            <textarea value={output} readOnly
              className="w-full h-36 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none" />
          </div>
        </GlassCard>
      )}

      {stats && (
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Input Analysis</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Input Lines', value: stats.inputLines },
                { label: 'Output Lines', value: stats.outputLines },
                { label: 'Unique Lines', value: stats.uniqueLines },
                { label: 'Duplicates', value: stats.inputLines - stats.uniqueLines },
              ].map(s => (
                <div key={s.label} className="bg-surface rounded-lg p-3 border border-border text-center">
                  <div className="text-xl font-bold text-text font-heading">{s.value}</div>
                  <div className="text-[10px] text-text-tertiary">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}
    </motion.div>
  )
}
