'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import CopyButton from '@/components/CopyButton'
import { useHistory } from '@/components/HistoryProvider'

const PASSAGES = {
  short: [
    'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.',
    'Programming is the art of telling a computer what to do. Practice makes perfect.',
    'In a world of technology, creativity is the most valuable skill you can have.',
    'The best way to predict the future is to create it. Start with a single line of code.',
    'Simplicity is the ultimate sophistication. Write code that is easy to read.',
  ],
  medium: [
    'The quick brown fox jumps over the lazy dog near the riverbank. A strong breeze carried the scent of wildflowers across the meadow as birds sang their evening songs. The old oak tree stood tall, its branches swaying gently in the wind, providing shelter for countless creatures that called this place home.',
    'Programming is both an art and a science. It requires creativity to solve problems and precision to implement solutions. The best developers combine technical skill with an understanding of human needs, creating software that makes life easier and more enjoyable for everyone.',
    'Technology continues to reshape our world at an unprecedented pace. From artificial intelligence to quantum computing, innovations are transforming how we work, learn, and connect with one another. Embracing these changes while maintaining our humanity is the challenge of our generation.',
    'The greatest achievements in history began as simple ideas. A curious mind asked a question, explored possibilities, and persisted through failure. Every breakthrough started with someone who dared to think differently and refused to accept that something could not be done.',
    'Clean code is not just about making things work. It is about writing software that other developers can understand, maintain, and extend. Good code tells a story, each function a chapter, each variable a word chosen with care and purpose.',
  ],
  long: [
    'In the beginning, there was nothing but darkness and silence. Then came the first spark of creation, a tiny point of light that would grow to illuminate the entire universe. Stars were born and died, galaxies spun their cosmic dances, and on one small planet orbiting an ordinary star, life found a way to begin its remarkable journey. From single-celled organisms to the complex web of biodiversity we see today, evolution has been writing its masterpiece for billions of years. And now, we humans stand as both the products and the shapers of this grand story, with the power to continue or disrupt the narrative that began so long ago.',
    'The art of programming is the art of organizing complexity. Every line of code we write is a decision, a choice among infinite possibilities. The master programmer sees patterns where others see chaos, finds elegance where others see only function. They know that code is read far more often than it is written, and they craft each function like a poem, each variable name like a carefully chosen word. The best software is invisible, seamlessly woven into the fabric of daily life, solving problems before users even realize they exist. This is the true craft: not merely making computers obey, but making them serve.',
    'Throughout human history, communication has been the bridge that connects minds across time and space. From cave paintings to printed books, from telegraphs to instant messages, each innovation has brought us closer to the dream of perfect understanding. The internet represents perhaps the most significant leap in this journey, a global network that carries the collective knowledge of our species at the speed of light. Yet for all its power, technology remains a tool, and its value depends entirely on how we choose to use it. The challenge of our age is not building faster networks or smarter algorithms, but using them to foster genuine connection, understanding, and progress for all people.',
  ],
}

const ALL_PASSAGES = [...PASSAGES.short, ...PASSAGES.medium, ...PASSAGES.long]

export default function TypingSpeedPage() {
  const { addEntry } = useHistory()
  const [passage, setPassage] = useState(PASSAGES.short[0])
  const [input, setInput] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [results, setResults] = useState(null)
  const [active, setActive] = useState(false)
  const [mode, setMode] = useState('finish')
  const [timeLimit, setTimeLimit] = useState(60)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [history, setHistory] = useState([])
  const [bestWpm, setBestWpm] = useState(0)
  const [customText, setCustomText] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [errorChars, setErrorChars] = useState({})
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('typing-speed-best')
      if (saved) setBestWpm(parseInt(saved))
      const hist = localStorage.getItem('typing-speed-history')
      if (hist) setHistory(JSON.parse(hist))
    } catch {}
  }, [])

  const saveBest = (wpm) => {
    if (wpm > bestWpm) {
      setBestWpm(wpm)
      try { localStorage.setItem('typing-speed-best', wpm.toString()) } catch {}
    }
  }

  const saveHistory = (entry) => {
    const updated = [entry, ...history].slice(0, 20)
    setHistory(updated)
    try { localStorage.setItem('typing-speed-history', JSON.stringify(updated)) } catch {}
  }

  const start = useCallback((text) => {
    setPassage(text)
    setInput('')
    setStartTime(null)
    setResults(null)
    setActive(true)
    setTimeElapsed(0)
    setErrorChars({})
    clearInterval(timerRef.current)
    setTimeout(() => inputRef.current?.focus(), 100)
    addEntry('Typing Speed Test')
  }, [addEntry])

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  const finishTest = useCallback((finalInput, elapsed) => {
    clearInterval(timerRef.current)
    const words = finalInput.split(/\s+/).filter(Boolean).length
    const minutes = elapsed / 60
    const wpm = minutes > 0 ? Math.round(words / minutes) : 0
    const chars = passage.split('')
    const typed = finalInput.split('')
    const errors = {}
    let correct = 0
    chars.forEach((c, i) => {
      if (typed[i] === c) {
        correct++
      } else {
        errors[c] = (errors[c] || 0) + 1
      }
    })
    const accuracy = Math.round((correct / chars.length) * 100)
    const result = { wpm, accuracy, time: Math.round(elapsed), correct, total: chars.length, mode, timestamp: new Date().toLocaleTimeString() }
    setResults(result)
    setActive(false)
    setErrorChars(errors)
    saveBest(wpm)
    saveHistory(result)
  }, [passage, mode, bestWpm])

  const handleChange = (e) => {
    const val = e.target.value
    if (!startTime && val.length === 1) {
      setStartTime(performance.now())
      if (mode === 'timed') {
        timerRef.current = setInterval(() => {
          setTimeElapsed(t => {
            if (t >= timeLimit) {
              clearInterval(timerRef.current)
              return t
            }
            return t + 1
          })
        }, 1000)
      }
    }
    setInput(val)

    if (mode === 'finish' && val.length === passage.length) {
      const elapsed = (performance.now() - startTime) / 1000
      finishTest(val, elapsed)
    }
  }

  useEffect(() => {
    if (mode === 'timed' && timeElapsed >= timeLimit && active) {
      finishTest(input, timeLimit)
    }
  }, [timeElapsed, timeLimit, mode, active])

  useEffect(() => {
    if (!startTime || mode !== 'timed') return
    const elapsed = Math.min((performance.now() - startTime) / 1000, timeLimit)
    setTimeElapsed(Math.floor(elapsed))
  }, [startTime, mode, timeLimit])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && active) {
        clearInterval(timerRef.current)
        setActive(false)
        setInput('')
        setStartTime(null)
        setTimeElapsed(0)
      }
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        const pool = ALL_PASSAGES
        start(pool[Math.floor(Math.random() * pool.length)])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const topErrors = Object.entries(errorChars).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const currentChar = input.length < passage.length ? passage[input.length] : ''
  const progressPct = mode === 'timed'
    ? (startTime ? (timeElapsed / timeLimit) * 100 : 0)
    : (passage.length > 0 ? (input.length / passage.length) * 100 : 0)

  const historyText = history.map(h => `${h.timestamp} | ${h.wpm} WPM | ${h.accuracy}% | ${h.time}s`).join('\n')

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">⌨</span>
        <h1 className="font-heading text-2xl font-bold text-text">Typing Speed Test</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1 bg-surface rounded-lg p-0.5 border border-border">
              <button onClick={() => setMode('finish')} className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${mode === 'finish' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text'}`}>Finish Text</button>
              <button onClick={() => setMode('timed')} className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${mode === 'timed' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text'}`}>Timed</button>
              <button onClick={() => setShowCustom(!showCustom)} className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${showCustom ? 'bg-primary text-white' : 'text-text-secondary hover:text-text'}`}>Custom</button>
            </div>
            {mode === 'timed' && (
              <div className="flex gap-1 bg-surface rounded-lg p-0.5 border border-border">
                {[30, 60, 120].map(t => (
                  <button key={t} onClick={() => setTimeLimit(t)} disabled={active}
                    className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer ${timeLimit === t ? 'bg-primary text-white' : 'text-text-secondary hover:text-text'} disabled:opacity-50`}>{t}s</button>
                ))}
              </div>
            )}
          </div>

          {showCustom && (
            <div>
              <textarea value={customText} onChange={e => setCustomText(e.target.value)}
                placeholder="Paste or type your own text here..."
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors"
                rows={3} />
              <button onClick={() => { if (customText.trim()) { start(customText.trim()); setShowCustom(false) } }} disabled={!customText.trim() || active}
                className="mt-2 px-3 py-1 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-all cursor-pointer">Use This Text</button>
            </div>
          )}

          {!showCustom && (
            <>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PASSAGES).map(([diff, texts]) => (
                  <div key={diff} className="flex items-center gap-1">
                    <span className="text-[10px] text-text-tertiary capitalize mr-1">{diff}:</span>
                    {texts.map((p, i) => (
                      <button key={i} onClick={() => start(p)} disabled={active}
                        className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all cursor-pointer ${
                          passage === p && !results ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                        } disabled:opacity-50`}>{i + 1}</button>
                    ))}
                  </div>
                ))}
                <button onClick={() => { const pool = ALL_PASSAGES; start(pool[Math.floor(Math.random() * pool.length)]) }} disabled={active}
                  className="px-3 py-1 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:text-text disabled:opacity-50 cursor-pointer">Random</button>
              </div>
            </>
          )}

          <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="bg-surface rounded-xl p-4 border border-border leading-relaxed text-sm font-mono">
            {passage.split('').map((c, i) => {
              const typed = input[i]
              let color = 'text-text-secondary'
              if (typed != null) color = typed === c ? 'text-green-500' : 'text-cat-text'
              if (i === input.length) color = 'text-text bg-primary/10 rounded'
              return <span key={i} className={color}>{c}</span>
            })}
          </div>

          <textarea ref={inputRef} value={input} onChange={handleChange} disabled={!active || results}
            placeholder={active ? 'Start typing...' : 'Click a passage to begin'}
            className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
            rows={3} />

          {input.length > 0 && (
            <div className="flex items-center justify-between text-[10px] text-text-secondary font-mono">
              <span>{input.length} / {passage.length} characters</span>
              {mode === 'timed' && active && <span>{timeElapsed}s / {timeLimit}s</span>}
            </div>
          )}

          {results && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface rounded-lg p-3 border border-border text-center">
                  <div className="text-[10px] text-text-tertiary">Speed</div>
                  <div className="text-2xl font-mono font-bold text-text">{results.wpm}</div>
                  <div className="text-[10px] text-text-secondary">WPM</div>
                </div>
                <div className="bg-surface rounded-lg p-3 border border-border text-center">
                  <div className="text-[10px] text-text-tertiary">Accuracy</div>
                  <div className="text-2xl font-mono font-bold text-text">{results.accuracy}%</div>
                  <div className="text-[10px] text-text-secondary">{results.correct}/{results.total}</div>
                </div>
                <div className="bg-surface rounded-lg p-3 border border-border text-center">
                  <div className="text-[10px] text-text-tertiary">Time</div>
                  <div className="text-2xl font-mono font-bold text-text">{results.time}s</div>
                  <div className="text-[10px] text-text-secondary">elapsed</div>
                </div>
              </div>

              {topErrors.length > 0 && (
                <div className="bg-surface rounded-lg p-3 border border-border">
                  <div className="text-[10px] text-text-tertiary mb-2">Most Missed Characters</div>
                  <div className="flex gap-3">
                    {topErrors.map(([char, count]) => (
                      <div key={char} className="text-center">
                        <div className="w-8 h-8 rounded bg-cat-text/10 flex items-center justify-center font-mono text-sm text-cat-text">{char}</div>
                        <div className="text-[10px] text-text-secondary mt-1">×{count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bestWpm > 0 && (
                <div className="flex items-center justify-between bg-surface rounded-lg p-3 border border-border">
                  <span className="text-xs text-text-tertiary">Personal Best</span>
                  <span className="text-sm font-mono font-bold text-cat-success">{bestWpm} WPM</span>
                </div>
              )}
            </div>
          )}
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
                  <span className="text-text-secondary">{h.timestamp}</span>
                  <span className="font-mono font-semibold text-text">{h.wpm} WPM</span>
                  <span className="font-mono text-text">{h.accuracy}%</span>
                  <span className="text-text-secondary">{h.time}s</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}
    </motion.div>
  )
}
