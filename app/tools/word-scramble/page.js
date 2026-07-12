'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import CopyButton from '@/components/CopyButton'
import { useHistory } from '@/components/HistoryProvider'

const CATEGORIES = {
  Programming: [
    'PYTHON', 'JAVASCRIPT', 'DEVELOPER', 'ALGORITHM', 'FUNCTION',
    'VARIABLE', 'DATABASE', 'NETWORK', 'BROWSER', 'SERVER',
    'COMPONENT', 'MODULE', 'FRAMEWORK', 'LIBRARY', 'COMPILER',
    'TERMINAL', 'VARIABLE', 'BOOLEAN', 'INTEGER', 'LOOP',
    'RECURSION', 'OBJECT', 'CLASS', 'ARRAY', 'STRING',
  ],
  Animals: [
    'ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'CHEETAH',
    'LEOPARD', 'RABBIT', 'TIGER', 'SNAKE', 'WALRUS',
    'GORILLA', 'BUFFALO', 'FALCON', 'IGUANA', 'JAGUAR',
    'LOBSTER', 'MONKEY', 'OSTRICH', 'PANTHER', 'WOLVERINE',
  ],
  Countries: [
    'BRAZIL', 'JAPAN', 'CANADA', 'GERMANY', 'AUSTRALIA',
    'MEXICO', 'FRANCE', 'NORWAY', 'SWEDEN', 'FINLAND',
    'PORTUGAL', 'ICELAND', 'IRELAND', 'BELGIUM', 'AUSTRIA',
    'SWITZERLAND', 'NETHERLANDS', 'SINGAPORE', 'MALAYSIA', 'VIETNAM',
  ],
  Science: [
    'MOLECULE', 'ELECTRON', 'NEUTRON', 'QUANTUM', 'PHOTON',
    'GRAVITY', 'ENERGY', 'NUCLEUS', 'PROTON', 'ISOTOPE',
    'SPECTRUM', 'VOLTMETER', 'THERMOMETER', 'CENTRIFUGE', 'CHROMOSOME',
    'HYPOTHESIS', 'EXPERIMENT', 'ELECTROLYSIS', 'CATALYSIS', 'ENZYME',
  ],
  Food: [
    'SPAGHETTI', 'AVOCADO', 'BROCCOLI', 'PANCAKE', 'BURRITO',
    'CINNAMON', 'MUSHROOM', 'BLUEBERRY', 'CHOCOLATE', 'DUMPLING',
    'HAMBURGER', 'LASAGNA', 'PRETZEL', 'RISOTTO', 'TIRAMISU',
    'WALNUT', 'CHICKPEA', 'EGGPLANT', 'JALAPENO', 'SAFFRON',
  ],
}

const ALL_WORDS = Object.values(CATEGORIES).flat()

const HINT_COST = { firstLetter: 1, lastLetter: 1, length: 0 }

function scrambleWord(word) {
  const arr = word.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

export default function WordScramblePage() {
  const { addEntry } = useHistory()
  const [category, setCategory] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [word, setWord] = useState('')
  const [scrambled, setScrambled] = useState('')
  const [guess, setGuess] = useState('')
  const [result, setResult] = useState('')
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [timerMode, setTimerMode] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [timerActive, setTimerActive] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [hintedFirst, setHintedFirst] = useState(false)
  const [hintedLast, setHintedLast] = useState(false)
  const [hintedLength, setHintedLength] = useState(false)

  const filteredWords = ALL_WORDS.filter(w => {
    if (category !== 'All' && !CATEGORIES[category]?.includes(w)) return false
    if (difficulty === 'Easy' && w.length > 5) return false
    if (difficulty === 'Medium' && (w.length <= 5 || w.length > 8)) return false
    if (difficulty === 'Hard' && w.length <= 8) return false
    return true
  })

  const newWord = useCallback(() => {
    const pool = filteredWords.length > 0 ? filteredWords : ALL_WORDS
    const w = pool[Math.floor(Math.random() * pool.length)]
    setWord(w)
    setScrambled(scrambleWord(w))
    setGuess('')
    setResult('')
    setHintsUsed(0)
    setHintedFirst(false)
    setHintedLast(false)
    setHintedLength(false)
  }, [category, difficulty])

  useEffect(() => { newWord() }, [newWord])

  useEffect(() => {
    if (!timerActive || !timerMode) return
    if (timeLeft <= 0) {
      setTimerActive(false)
      return
    }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [timerActive, timeLeft, timerMode])

  const check = useCallback(() => {
    addEntry('Word Scramble')
    setTotal(t => t + 1)
    if (guess.trim().toUpperCase() === word) {
      setResult('correct')
      setScore(s => s + 1)
      setStreak(s => {
        const next = s + 1
        setBestStreak(b => Math.max(b, next))
        return next
      })
    } else {
      setResult('wrong')
      setStreak(0)
    }
  }, [guess, word, addEntry])

  const revealHint = (type) => {
    if (type === 'first' && !hintedFirst) { setHintedFirst(true); setHintsUsed(h => h + HINT_COST.firstLetter) }
    if (type === 'last' && !hintedLast) { setHintedLast(true); setHintsUsed(h => h + HINT_COST.lastLetter) }
    if (type === 'length' && !hintedLength) { setHintedLength(true); setHintsUsed(h => h + HINT_COST.length) }
  }

  const startTimer = () => {
    setTimerMode(true)
    setTimeLeft(30)
    setTimerActive(true)
    setScore(0)
    setTotal(0)
    setStreak(0)
    setBestStreak(0)
    newWord()
  }

  const scoreText = `Word Scramble\nScore: ${score}/${total}\nStreak: ${streak} (Best: ${bestStreak})\nCategory: ${category}\nDifficulty: ${difficulty}`

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">🔤</span>
        <h1 className="font-heading text-2xl font-bold text-text">Word Scramble</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-tertiary mb-1.5 block">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-surface text-text text-sm rounded-lg border border-border px-3 py-1.5 outline-none focus:border-primary/50">
                <option value="All">All</option>
                {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1.5 block">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                className="w-full bg-surface text-text text-sm rounded-lg border border-border px-3 py-1.5 outline-none focus:border-primary/50">
                <option value="All">All</option>
                <option value="Easy">Easy (3-5)</option>
                <option value="Medium">Medium (6-8)</option>
                <option value="Hard">Hard (9+)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-text-tertiary">Score: <span className="text-text font-semibold">{score}/{total}</span></span>
              <span className="text-text-tertiary">Streak: <span className="text-cat-success font-semibold">{streak}</span></span>
              <span className="text-text-tertiary">Best: <span className="text-text font-semibold">{bestStreak}</span></span>
            </div>
            <div className="flex gap-2">
              {!timerMode ? (
                <button onClick={startTimer} className="px-3 py-1 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 transition-all cursor-pointer">Timed</button>
              ) : (
                <span className={`px-3 py-1 text-xs font-medium rounded-lg ${timeLeft <= 5 ? 'bg-cat-text text-white' : 'bg-primary text-white'}`}>{timeLeft}s</span>
              )}
              <CopyButton text={scoreText} />
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-mono font-bold text-text tracking-widest py-4">{scrambled}</div>
            <p className="text-sm text-text-secondary mb-2">
              {hintsUsed > 0 && <span className="text-cat-text text-xs mr-2">(-{hintsUsed} pts)</span>}
              Unscramble the word
            </p>
            <div className="flex justify-center gap-2 mb-3">
              <button onClick={() => revealHint('first')} disabled={hintedFirst}
                className="px-2 py-0.5 text-[10px] font-medium rounded bg-surface text-text-secondary border border-border hover:border-primary/40 disabled:opacity-40 transition-all cursor-pointer">
                {hintedFirst ? `1st: ${word[0]}` : '1st letter'}
              </button>
              <button onClick={() => revealHint('last')} disabled={hintedLast}
                className="px-2 py-0.5 text-[10px] font-medium rounded bg-surface text-text-secondary border border-border hover:border-primary/40 disabled:opacity-40 transition-all cursor-pointer">
                {hintedLast ? `Last: ${word[word.length - 1]}` : 'Last letter'}
              </button>
              <button onClick={() => revealHint('length')} disabled={hintedLength}
                className="px-2 py-0.5 text-[10px] font-medium rounded bg-surface text-text-secondary border border-border hover:border-primary/40 disabled:opacity-40 transition-all cursor-pointer">
                {hintedLength ? `Len: ${word.length}` : 'Length'}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <input value={guess} onChange={e => setGuess(e.target.value.toUpperCase())}
              onKeyDown={e => {
                if (e.key === 'Enter' && guess && !result) check()
                if (e.key === 'Tab') { e.preventDefault(); newWord() }
              }}
              className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors text-center uppercase"
              placeholder="Your answer" />
            {!result ? (
              <button onClick={check} disabled={!guess.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-all cursor-pointer">Guess</button>
            ) : (
              <button onClick={newWord}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Next</button>
            )}
          </div>

          {result === 'correct' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm font-medium">
              <span className="text-cat-success">Correct! 🎉</span>
              {hintsUsed > 0 && <span className="text-text-secondary ml-2">({word.length - hintsUsed} pts)</span>}
            </motion.div>
          )}
          {result === 'wrong' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-text-secondary font-medium">
              Wrong! The word was <span className="font-mono text-text">{word}</span>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  )
}
