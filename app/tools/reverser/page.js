'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import CopyButton from '@/components/CopyButton'
import { useHistory } from '@/components/HistoryProvider'

function invertCase(s) {
  return s.replace(/[a-zA-Z]/g, c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())
}

function reverseUnicode(str) {
  const seg = new Intl.Segmenter('en', { granularity: 'grapheme' })
  return [...seg.segment(str)].map(s => s.segment).reverse().join('')
}

function reverseSentences(str) {
  return str.split(/(?<=[.!?])\s+/).reverse().join(' ')
}

function reverseParagraphs(str) {
  return str.split(/\n\s*\n/).reverse().join('\n\n')
}

function charFrequency(str) {
  const freq = {}
  for (const c of str) {
    if (c === ' ') continue
    freq[c] = (freq[c] || 0) + 1
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 12)
}

function mirrorString(str) {
  return `${str}|${reverseUnicode(str)}`
}

function palindromeScore(str) {
  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '')
  const rev = reverseUnicode(clean)
  if (clean === rev) return { isPalindrome: true, distance: 0 }
  let diff = 0
  for (let i = 0; i < Math.floor(clean.length / 2); i++) {
    if (clean[i] !== clean[clean.length - 1 - i]) diff++
  }
  return { isPalindrome: false, distance: diff }
}

export default function ReverserPage() {
  const { addEntry } = useHistory()
  const [input, setInput] = useState('')
  const [delimiter, setDelimiter] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault()
        if (input.trim()) addEntry('Text Reverser')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [input, addEntry])

  const reversed = reverseUnicode(input)
  const reverseWords = input.split(/\s+/).reverse().join(' ')
  const reverseSent = reverseSentences(input)
  const reversePara = reverseParagraphs(input)
  const uppercase = input.toUpperCase()
  const lowercase = input.toLowerCase()
  const invertCased = invertCase(input)
  const mirrored = mirrorString(input)
  const palScore = palindromeScore(input)
  const freq = charFrequency(input)

  const transforms = [
    { id: 'reversed', label: 'Reversed', value: reversed },
    { id: 'reverseWords', label: 'Reverse Words', value: reverseWords },
    { id: 'reverseSentences', label: 'Reverse Sentences', value: reverseSent },
    { id: 'reverseParagraphs', label: 'Reverse Paragraphs', value: reversePara },
    { id: 'uppercase', label: 'UPPERCASE', value: uppercase },
    { id: 'lowercase', label: 'lowercase', value: lowercase },
    { id: 'invertCase', label: 'Invert Case', value: invertCased },
    { id: 'mirror', label: 'Mirror', value: mirrored },
  ]

  let delimiterTransforms = []
  if (delimiter && input.trim()) {
    const segments = input.split(delimiter)
    delimiterTransforms = [
      { id: 'revSegments', label: `Reverse Segments (${segments.length})`, value: segments.reverse().join(delimiter) },
      { id: 'revWithinSegments', label: 'Reverse Within Segments', value: segments.map(s => reverseUnicode(s)).join(delimiter) },
    ]
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">↔️</span>
        <h1 className="font-heading text-2xl font-bold text-text">Text Reverser</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-1.5 block">Input text</label>
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); if (e.target.value.trim()) addEntry('Text Reverser') }}
            placeholder="Type or paste text here..."
            className="w-full h-36 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-text-tertiary"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-text-tertiary">{input.length} characters · {input.trim() ? input.trim().split(/\s+/).length : 0} words</div>
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-[10px] text-text-tertiary hover:text-text transition-colors cursor-pointer">
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </button>
          </div>
        </div>
      </GlassCard>

      {showAdvanced && input.trim() && (
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-2 block">Custom Delimiter (for segment operations)</label>
            <input value={delimiter} onChange={e => setDelimiter(e.target.value)}
              placeholder="e.g. , or | or ;"
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          </div>
        </GlassCard>
      )}

      {input.trim() && (
        <div className="space-y-3 mt-5">
          {transforms.map(t => (
            <GlassCard key={t.id}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-text-tertiary">{t.label}</span>
                  <CopyButton text={t.value} />
                </div>
                <div className="text-sm font-mono text-text break-all bg-surface rounded-lg px-3 py-2 border border-border/50">
                  {t.value || <span className="text-text-tertiary">—</span>}
                </div>
              </div>
            </GlassCard>
          ))}

          {delimiterTransforms.map(t => (
            <GlassCard key={t.id}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-text-tertiary">{t.label}</span>
                  <CopyButton text={t.value} />
                </div>
                <div className="text-sm font-mono text-text break-all bg-surface rounded-lg px-3 py-2 border border-border/50">
                  {t.value}
                </div>
              </div>
            </GlassCard>
          ))}

          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">Palindrome Check</span>
                <span className={`text-xs font-semibold ${palScore.isPalindrome ? 'text-cat-success' : 'text-text-secondary'}`}>
                  {palScore.isPalindrome ? 'Yes!' : `No (${palScore.distance} chars off)`}
                </span>
              </div>
              {freq.length > 0 && (
                <>
                  <span className="text-[10px] text-text-tertiary mb-2 block">Character Frequency</span>
                  <div className="flex flex-wrap gap-2">
                    {freq.map(([char, count]) => (
                      <div key={char} className="flex flex-col items-center">
                        <span className="w-8 h-8 flex items-center justify-center rounded bg-surface border border-border font-mono text-sm text-text">{char}</span>
                        <span className="text-[9px] text-text-secondary mt-0.5">{count}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </motion.div>
  )
}
