'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import CopyButton from '@/components/CopyButton'
import { useHistory } from '@/components/HistoryProvider'

const cases = [
  { id: 'upper', label: 'UPPERCASE', fn: s => s.toUpperCase() },
  { id: 'lower', label: 'lowercase', fn: s => s.toLowerCase() },
  { id: 'title', label: 'Title Case', fn: s => s.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase()) },
  { id: 'sentence', label: 'Sentence case', fn: s => s.replace(/(^\s*|[.!?]\s+)(\w)/g, (_, pre, c) => pre + c.toUpperCase()) },
  { id: 'camel', label: 'camelCase', fn: s => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()) },
  { id: 'snake', label: 'snake_case', fn: s => s.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') },
  { id: 'kebab', label: 'kebab-case', fn: s => s.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') },
  { id: 'pascal', label: 'PascalCase', fn: s => (s.match(/[a-zA-Z0-9]+/g) || []).map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('') },
  { id: 'dot', label: 'dot.case', fn: s => s.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '') },
  { id: 'constant', label: 'CONSTANT_CASE', fn: s => s.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') },
  { id: 'cobol', label: 'COBOL-CASE', fn: s => s.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') },
  { id: 'train', label: 'Train-Case', fn: s => (s.match(/[a-zA-Z0-9]+/g) || []).map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('-') },
  { id: 'flat', label: 'flatcase', fn: s => s.toLowerCase().replace(/[^a-z0-9]/g, '') },
  { id: 'reverse', label: 'Reverse', fn: s => [...s].reverse().join('') },
  { id: 'alternating', label: 'aLtErNaTiNg', fn: s => [...s].map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('') },
  { id: 'random', label: 'rAnDoM', fn: s => [...s].map(c => Math.random() < 0.5 ? c.toLowerCase() : c.toUpperCase()).join('') },
]

const customSeparators = [
  { id: 'space', label: 'Space', val: ' ' },
  { id: 'comma', label: 'Comma', val: ',' },
  { id: 'pipe', label: 'Pipe', val: '|' },
  { id: 'slash', label: 'Slash', val: '/' },
]

export default function CasePage() {
  const { addEntry } = useHistory()
  const [input, setInput] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [customSep, setCustomSep] = useState(' ')
  const [customCase, setCustomCase] = useState('')

  const getCustomCase = useCallback((text, sep) => {
    if (!text) return ''
    const words = text.match(/[a-zA-Z0-9]+/g) || []
    return words.map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(sep)
  }, [])

  const words = input.trim() ? input.trim().split(/\s+/).length : 0
  const uniqueWords = input.trim() ? new Set(input.trim().toLowerCase().split(/\s+/)).size : 0
  const lines = input ? input.split('\n').length : 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">Aa</span>
        <h1 className="font-heading text-2xl font-bold text-text">Case Converter</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-1.5 block">Input text</label>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            placeholder="Type or paste text here..."
            className="w-full h-32 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-text-tertiary" />
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-text-tertiary">{input.length} characters · {words} words · {uniqueWords} unique · {lines} lines</div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-[10px] text-text-secondary cursor-pointer">
                <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)}
                  className="accent-primary rounded" />
                Show all
              </label>
            </div>
          </div>
        </div>
      </GlassCard>

      {input.trim() && (
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-2 block">Custom Separator</label>
            <div className="flex items-center gap-2 mb-3">
              {customSeparators.map(s => (
                <button key={s.id} onClick={() => setCustomSep(s.val)}
                  className={`px-2 py-1 text-[10px] font-medium rounded transition-all cursor-pointer ${
                    customSep === s.val ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border'
                  }`}>{s.label}</button>
              ))}
              <input value={customSep} onChange={e => setCustomSep(e.target.value)}
                className="w-16 bg-surface text-text text-center text-xs rounded border border-border px-1 py-0.5 outline-none focus:border-primary/50" />
            </div>
            <div className="bg-surface rounded-lg px-3 py-2 border border-border/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-text-tertiary">Custom Case</span>
                <CopyButton text={getCustomCase(input, customSep)} />
              </div>
              <div className="text-sm font-mono text-text break-all">{getCustomCase(input, customSep)}</div>
            </div>
          </div>
        </GlassCard>
      )}

      {showAll && input.trim() ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {cases.map(c => (
            <GlassCard key={c.id}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-text-tertiary">{c.label}</span>
                  <CopyButton text={c.fn(input)} />
                </div>
                <div className="text-sm font-mono text-text break-all bg-surface rounded-lg px-3 py-2 border border-border/50">
                  {c.fn(input)}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : input.trim() ? (
        <GlassCard>
          <div className="p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {cases.map(c => (
                <button key={c.id}
                  className="px-2 py-1 text-[10px] font-medium rounded bg-surface text-text-secondary border border-border hover:text-text transition-all cursor-pointer">
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      ) : null}
    </motion.div>
  )
}
