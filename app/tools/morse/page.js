'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import CopyButton from '@/components/CopyButton'
import { useHistory } from '@/components/HistoryProvider'

const MORSE_MAP = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
}

const REVERSE_MAP = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
)

const VALID_CHARS = new Set(Object.keys(MORSE_MAP))

function playMorseAudio(morse, wpm = 20) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const dotDuration = 1.2 / wpm
  const dashDuration = dotDuration * 3
  const symbolGap = dotDuration
  const letterGap = dotDuration * 3
  const wordGap = dotDuration * 7

  let time = ctx.currentTime
  const freq = 600

  for (let i = 0; i < morse.length; i++) {
    const ch = morse[i]
    if (ch === '.') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      gain.gain.value = 0.3
      osc.start(time)
      osc.stop(time + dotDuration)
      time += dotDuration + symbolGap
    } else if (ch === '-') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      gain.gain.value = 0.3
      osc.start(time)
      osc.stop(time + dashDuration)
      time += dashDuration + symbolGap
    } else if (ch === ' ') {
      time += letterGap - symbolGap
    } else if (ch === '/') {
      time += wordGap - letterGap
    }
  }
}

function playSOS(wpm = 20) {
  playMorseAudio('... --- ...', wpm)
}

export default function MorsePage() {
  const { addEntry } = useHistory()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('encode')
  const [warnings, setWarnings] = useState([])
  const [wpm, setWpm] = useState(20)
  const [expanded, setExpanded] = useState(false)
  const [history, setHistory] = useState([])

  const encode = useCallback(text => {
    const upper = text.toUpperCase()
    const warns = []
    const words = upper.split(/\s+/)
    const encodedWords = words.map(word => {
      if (!word) return ''
      const chars = []
      for (const ch of word) {
        if (VALID_CHARS.has(ch)) {
          chars.push(MORSE_MAP[ch])
        } else {
          warns.push(`"${ch}"`)
        }
      }
      return chars.join(' ')
    }).filter(Boolean)
    return { result: encodedWords.join(' / '), warnings: warns }
  }, [])

  const decode = useCallback(morse => {
    const warns = []
    const words = morse.trim().split(/\s*\/\s*/)
    const decodedWords = words.map(word => {
      const letters = word.trim().split(/\s+/)
      return letters.map(seq => {
        if (!seq) return ''
        if (REVERSE_MAP[seq]) return REVERSE_MAP[seq]
        warns.push(`"${seq}"`)
        return seq
      }).join('')
    })
    return { result: decodedWords.join(' '), warnings: warns }
  }, [])

  useEffect(() => {
    if (!input.trim()) { setOutput(''); setWarnings([]); return }
    const { result, warnings } = mode === 'encode' ? encode(input) : decode(input)
    setOutput(result)
    setWarnings(warnings)
  }, [input, mode, encode, decode])

  const handleConvert = useCallback(() => {
    if (!input.trim()) return
    addEntry('Morse Code Converter')
    setHistory(h => [{ input: input.slice(0, 30), output: output.slice(0, 30), mode }, ...h].slice(0, 15))
  }, [input, output, mode, addEntry])

  const playAudio = () => {
    if (mode === 'encode' && output) playMorseAudio(output, wpm)
  }

  const refRows = Object.entries(MORSE_MAP).filter(([k]) => /[A-Z0-9]/.test(k))
  const extraRows = Object.entries(MORSE_MAP).filter(([k]) => !/[A-Z0-9]/.test(k))

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">-.--</span>
        <h1 className="font-heading text-2xl font-bold text-text">Morse Code Converter</h1>
      </div>

      <div className="mb-4">
        <GlassCard>
          <div className="p-3 flex items-center gap-3">
            {['encode', 'decode'].map(m => (
              <button key={m} onClick={() => { setMode(m); setOutput(''); setWarnings([]) }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  mode === m ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                }`}>{m === 'encode' ? 'Encode (Text → Morse)' : 'Decode (Morse → Text)'}</button>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">
              {mode === 'encode' ? 'Text Input' : 'Morse Code Input'}
            </label>
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={8}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder={mode === 'encode' ? 'Enter text to convert to Morse code...' : 'Enter Morse code (spaces between letters, / between words)...'} />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">
                {mode === 'encode' ? 'Morse Code Output' : 'Decoded Text'}
              </span>
              <div className="flex items-center gap-2">
                {output && <CopyButton text={output} />}
              </div>
            </div>
            <textarea value={output} readOnly rows={8}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none"
              placeholder="Output will appear here..." />
            {mode === 'encode' && output && (
              <div className="flex items-center gap-3 mt-3">
                <button onClick={playAudio}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
                  ▶ Play Audio
                </button>
                <button onClick={playSOS}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:text-text transition-all cursor-pointer">
                  SOS
                </button>
                <div className="flex items-center gap-1.5 ml-auto">
                  <label className="text-[10px] text-text-tertiary">WPM:</label>
                  <input type="number" min={5} max={40} value={wpm} onChange={e => setWpm(parseInt(e.target.value) || 20)}
                    className="w-12 bg-surface text-text text-center text-xs rounded border border-border px-1 py-0.5 outline-none focus:border-primary/50" />
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {warnings.length > 0 && (
        <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">
          Warning: Skipped invalid character{warnings.length > 1 ? 's' : ''}: {warnings.join(', ')}
        </div>
      )}

      <GlassCard className="mt-5">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-tertiary">Morse Code Reference</span>
            <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-text-tertiary hover:text-text cursor-pointer">
              {expanded ? 'Show Basic' : 'Show All'}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
            {refRows.map(([char, morse]) => (
              <div key={char} className="flex items-center gap-2 bg-surface rounded px-2 py-1 border border-border/50">
                <span className="text-sm font-bold text-text w-4 text-center">{char}</span>
                <span className="text-xs font-mono text-text-secondary">{morse}</span>
              </div>
            ))}
            {expanded && extraRows.map(([char, morse]) => (
              <div key={char} className="flex items-center gap-2 bg-surface rounded px-2 py-1 border border-border/50">
                <span className="text-sm font-bold text-text w-4 text-center">{char}</span>
                <span className="text-xs font-mono text-text-secondary">{morse}</span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {history.length > 0 && (
        <GlassCard className="mt-4">
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-2 block">Recent Conversions</span>
            <div className="space-y-1 max-h-40 overflow-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0">
                  <span className="text-text-secondary truncate flex-1 mr-2">{h.input}</span>
                  <span className="text-[10px] text-text-tertiary px-1">{h.mode}</span>
                  <span className="font-mono text-text truncate flex-1 ml-2 text-right">{h.output}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}
    </motion.div>
  )
}
