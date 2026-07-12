'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import CopyButton from '@/components/CopyButton'
import { useHistory } from '@/components/HistoryProvider'

function getStats(text) {
  if (!text) return null
  const characters = text.length
  const charactersNoSpace = text.replace(/\s/g, '').length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const sentences = text.split(/[.!?]+\s*/).filter(s => s.trim()).length
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length
  const lines = text.split('\n').filter(l => l.trim()).length
  const spaces = (text.match(/\s/g) || []).length
  const letters = (text.match(/[a-zA-Z]/g) || []).length
  const digits = (text.match(/[0-9]/g) || []).length
  const punctuation = (text.match(/[^\w\s]/g) || []).length
  const readingTime = Math.max(1, Math.ceil(words / 200))
  const speakingTime = Math.max(1, Math.ceil(words / 150))

  const charFreq = {}
  for (const c of text.toLowerCase()) {
    if (c.match(/[a-z]/)) charFreq[c] = (charFreq[c] || 0) + 1
  }

  const wordFreq = {}
  const wordList = text.toLowerCase().match(/[a-z']+/g) || []
  for (const w of wordList) {
    if (w.length > 2) wordFreq[w] = (wordFreq[w] || 0) + 1
  }

  const syllables = wordList.reduce((sum, w) => {
    const m = w.match(/[aeiouy]+/gi)
    return sum + (m ? m.length : 1)
  }, 0)

  const fleschKincaid = words > 0 && sentences > 0
    ? Math.round((0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59) * 10) / 10
    : 0

  const avgWordLength = words > 0
    ? Math.round((wordList.reduce((s, w) => s + w.length, 0) / words) * 10) / 10
    : 0

  const avgSentenceLength = sentences > 0 ? Math.round(words / sentences) : 0

  return {
    characters, charactersNoSpace, words, sentences, paragraphs, lines,
    spaces, letters, digits, punctuation, readingTime, speakingTime,
    charFreq, wordFreq, fleschKincaid, avgWordLength, avgSentenceLength
  }
}

function BarChart({ data, maxItems = 10 }) {
  const items = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxItems)
  const max = items.length > 0 ? items[0][1] : 1

  return (
    <div className="space-y-1">
      {items.map(([key, val]) => (
        <div key={key} className="flex items-center gap-2 text-[11px]">
          <span className="w-6 text-right font-mono text-text-secondary shrink-0">{key}</span>
          <div className="flex-1 bg-surface rounded h-3 overflow-hidden">
            <div className="h-full bg-primary/60 rounded" style={{ width: `${(val / max) * 100}%` }} />
          </div>
          <span className="w-8 text-right font-mono text-text-secondary shrink-0">{val}</span>
        </div>
      ))}
    </div>
  )
}

export default function StatsPage() {
  const { addEntry } = useHistory()
  const [text, setText] = useState('')
  const [view, setView] = useState('stats')
  const [history, setHistory] = useState([])

  const stats = useMemo(() => getStats(text), [text])

  const analyze = useCallback(() => {
    if (!text.trim()) return
    addEntry('Text Statistics')
    setHistory(h => [{
      preview: text.slice(0, 60) + (text.length > 60 ? '...' : ''),
      words: stats.words,
      chars: stats.characters,
      time: new Date().toLocaleTimeString()
    }, ...h].slice(0, 20))
  }, [text, stats, addEntry])

  const getReadabilityLabel = (score) => {
    if (score <= 5) return { label: 'Easy', color: 'text-cat-success' }
    if (score <= 8) return { label: 'Standard', color: 'text-text' }
    if (score <= 12) return { label: 'Difficult', color: 'text-yellow-500' }
    return { label: 'Very Difficult', color: 'text-cat-text' }
  }

  const readability = stats ? getReadabilityLabel(stats.fleschKincaid) : null

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text mb-2">Text Statistics</h1>
        <p className="text-text-secondary">Analyze word, character, sentence count and more</p>
      </motion.div>

      <div className="bg-surface rounded-2xl border border-border p-4 mb-6">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste or type text to analyze..."
          className="w-full h-44 bg-transparent text-text resize-none outline-none text-sm leading-relaxed placeholder:text-text-tertiary" />
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-text-tertiary">
            {stats ? `${stats.words} words · ${stats.characters} chars · ${stats.sentences} sentences` : 'Start typing to see stats'}
          </div>
          <button onClick={analyze} disabled={!text.trim()}
            className="px-3 py-1 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-all cursor-pointer">Save</button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['stats', 'frequency', 'readability'].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer capitalize ${
              view === v ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
            }`}>{v}</button>
        ))}
      </div>

      {stats && view === 'stats' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: 'Characters', value: stats.characters },
            { label: 'Characters (no space)', value: stats.charactersNoSpace },
            { label: 'Words', value: stats.words },
            { label: 'Sentences', value: stats.sentences },
            { label: 'Paragraphs', value: stats.paragraphs },
            { label: 'Lines', value: stats.lines },
            { label: 'Spaces', value: stats.spaces },
            { label: 'Letters', value: stats.letters },
            { label: 'Digits', value: stats.digits },
            { label: 'Punctuation', value: stats.punctuation },
            { label: 'Reading Time', value: `${stats.readingTime} min` },
            { label: 'Speaking Time', value: `${stats.speakingTime} min` },
          ].map(item => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-surface rounded-xl border border-border p-4">
              <div className="text-2xl font-bold text-text mb-1 font-heading">
                {item.value !== undefined ? item.value : <span className="text-text-tertiary">—</span>}
              </div>
              <div className="text-xs text-text-secondary">{item.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {stats && view === 'frequency' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Letter Frequency</span>
              <BarChart data={stats.charFreq} maxItems={12} />
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Word Frequency (3+ letters)</span>
              <BarChart data={stats.wordFreq} maxItems={12} />
            </div>
          </GlassCard>
        </div>
      )}

      {stats && view === 'readability' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard>
            <div className="p-4 text-center">
              <div className="text-[10px] text-text-tertiary mb-1">Flesch-Kincaid Grade</div>
              <div className="text-3xl font-bold text-text font-heading">{stats.fleschKincaid}</div>
              <div className={`text-xs font-medium mt-1 ${readability.color}`}>{readability.label}</div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-4 text-center">
              <div className="text-[10px] text-text-tertiary mb-1">Avg Word Length</div>
              <div className="text-3xl font-bold text-text font-heading">{stats.avgWordLength}</div>
              <div className="text-xs text-text-secondary mt-1">characters</div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-4 text-center">
              <div className="text-[10px] text-text-tertiary mb-1">Avg Sentence Length</div>
              <div className="text-3xl font-bold text-text font-heading">{stats.avgSentenceLength}</div>
              <div className="text-xs text-text-secondary mt-1">words per sentence</div>
            </div>
          </GlassCard>
        </div>
      )}

      {history.length > 0 && (
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Recent Analyses ({history.length})</span>
            <div className="space-y-1 max-h-48 overflow-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-text-secondary truncate flex-1 mr-3">{h.preview}</span>
                  <span className="font-mono text-text shrink-0">{h.words}w</span>
                  <span className="font-mono text-text-secondary shrink-0 ml-2">{h.chars}c</span>
                  <span className="text-text-tertiary shrink-0 ml-2">{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
