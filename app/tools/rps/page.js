'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import { useHistory } from '@/components/HistoryProvider'

const CHOICES_3 = [
  { label: 'Rock', icon: '🪨', beats: 'Scissors' },
  { label: 'Paper', icon: '📄', beats: 'Rock' },
  { label: 'Scissors', icon: '✂️', beats: 'Paper' },
]

const CHOICES_5 = [
  { label: 'Rock', icon: '🪨', beats: ['Scissors', 'Lizard'] },
  { label: 'Paper', icon: '📄', beats: ['Rock', 'Spock'] },
  { label: 'Scissors', icon: '✂️', beats: ['Paper', 'Lizard'] },
  { label: 'Lizard', icon: '🦎', beats: ['Paper', 'Spock'] },
  { label: 'Spock', icon: '🖖', beats: ['Rock', 'Scissors'] },
]

function getResult(player, computer) {
  if (player.label === computer.label) return 'draw'
  if (player.beats.includes(computer.label)) return 'win'
  return 'lose'
}

function getSmartChoice(choices, history) {
  if (history.length < 3) return choices[Math.floor(Math.random() * choices.length)]
  const freq = {}
  for (const h of history.slice(-10)) {
    freq[h.player] = (freq[h.player] || 0) + 1
  }
  const mostFrequent = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
  const counter = choices.find(c => mostFrequent === c.beats?.[0] || mostFrequent === c.beats?.find?.(b => c.beats.includes(b)))
  if (counter) return counter
  return choices[Math.floor(Math.random() * choices.length)]
}

export default function RpsPage() {
  const { addEntry } = useHistory()
  const [variant, setVariant] = useState('rps')
  const [bestOf, setBestOf] = useState(0)
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 })
  const [playerChoice, setPlayerChoice] = useState(null)
  const [computerChoice, setComputerChoice] = useState(null)
  const [result, setResult] = useState('')
  const [history, setHistory] = useState([])
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [difficulty, setDifficulty] = useState('random')
  const [seriesScore, setSeriesScore] = useState({ wins: 0, losses: 0 })
  const [seriesOver, setSeriesOver] = useState(false)

  const choices = variant === 'rps' ? CHOICES_3 : CHOICES_5
  const seriesLimit = bestOf > 0 ? Math.ceil(bestOf / 2) : 0

  useEffect(() => {
    if (bestOf > 0 && !seriesOver) {
      if (seriesScore.wins >= seriesLimit) { setSeriesOver(true); setResult('series-win') }
      if (seriesScore.losses >= seriesLimit) { setSeriesOver(true); setResult('series-lose') }
    }
  }, [seriesScore, bestOf, seriesLimit, seriesOver])

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, 'r': 0, 'p': 1, 's': 2 }
      if (e.key in keyMap && keyMap[e.key] < choices.length && !seriesOver) {
        play(choices[keyMap[e.key]])
      }
      if (e.key === ' ' && seriesOver) { e.preventDefault(); resetSeries() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const play = useCallback((choice) => {
    if (seriesOver) return
    addEntry('Rock Paper Scissors')
    let comp
    if (difficulty === 'smart') {
      comp = getSmartChoice(choices, history)
    } else if (difficulty === 'hard') {
      const winIdx = choices.findIndex(c => c.beats?.includes(choice.label))
      comp = winIdx >= 0 ? choices[choices.indexOf(choice)] : choices[Math.floor(Math.random() * choices.length)]
      if (Math.random() > 0.3) {
        const counterChoice = choices.find(c => choice.beats?.includes(c.label))
        if (counterChoice) comp = counterChoice
      } else {
        comp = choices[Math.floor(Math.random() * choices.length)]
      }
    } else {
      comp = choices[Math.floor(Math.random() * choices.length)]
    }

    setPlayerChoice(choice)
    setComputerChoice(comp)
    const r = getResult(choice, comp)
    setResult(r)
    setScore(s => ({ ...s, [r === 'win' ? 'wins' : r === 'lose' ? 'losses' : 'draws']: s[r === 'win' ? 'wins' : r === 'lose' ? 'losses' : 'draws'] + 1 }))
    setHistory(h => [{ player: choice.label, computer: comp.label, result: r }, ...h].slice(0, 30))

    if (r === 'win') {
      setStreak(s => { const next = s + 1; setBestStreak(b => Math.max(b, next)); return next })
      if (bestOf > 0) setSeriesScore(s => ({ ...s, wins: s.wins + 1 }))
    } else if (r === 'lose') {
      setStreak(0)
      if (bestOf > 0) setSeriesScore(s => ({ ...s, losses: s.losses + 1 }))
    } else {
      setStreak(0)
    }
  }, [choices, difficulty, history, bestOf, seriesOver, addEntry])

  const resetSeries = () => {
    setSeriesScore({ wins: 0, losses: 0 })
    setSeriesOver(false)
    setPlayerChoice(null)
    setComputerChoice(null)
    setResult('')
    setScore({ wins: 0, losses: 0, draws: 0 })
    setStreak(0)
    setHistory([])
  }

  const totalGames = score.wins + score.losses + score.draws
  const winRate = totalGames > 0 ? Math.round((score.wins / totalGames) * 100) : 0

  const playerFreq = {}
  const computerFreq = {}
  for (const h of history) {
    playerFreq[h.player] = (playerFreq[h.player] || 0) + 1
    computerFreq[h.computer] = (computerFreq[h.computer] || 0) + 1
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">🪨</span>
        <h1 className="font-heading text-2xl font-bold text-text">Rock Paper Scissors</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-1 bg-surface rounded-lg p-0.5 border border-border">
              <button onClick={() => setVariant('rps')} className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${variant === 'rps' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text'}`}>RPS</button>
              <button onClick={() => setVariant('rpsls')} className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${variant === 'rpsls' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text'}`}>RPSLS</button>
            </div>
            <div className="flex gap-1 bg-surface rounded-lg p-0.5 border border-border">
              {[0, 3, 5, 7].map(n => (
                <button key={n} onClick={() => { setBestOf(n); resetSeries() }}
                  className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer ${bestOf === n ? 'bg-primary text-white' : 'text-text-secondary hover:text-text'}`}>
                  {n === 0 ? 'Free' : `Best of ${n}`}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-surface rounded-lg p-0.5 border border-border">
              {['random', 'smart', 'hard'].map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer capitalize ${difficulty === d ? 'bg-primary text-white' : 'text-text-secondary hover:text-text'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {bestOf > 0 && (
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="text-cat-success font-semibold">{seriesScore.wins}</span>
              <span className="text-text-tertiary">—</span>
              <span className="text-cat-text font-semibold">{seriesScore.losses}</span>
              {seriesOver && (
                <span className={`text-xs font-semibold ${result === 'series-win' ? 'text-cat-success' : 'text-cat-text'}`}>
                  {result === 'series-win' ? 'Series Won!' : 'Series Lost!'}
                </span>
              )}
            </div>
          )}

          <div className="flex justify-center gap-3">
            {choices.map((c, i) => (
              <button key={c.label} onClick={() => play(c)} disabled={seriesOver}
                className="flex flex-col items-center gap-1 px-5 py-3 rounded-xl bg-surface border border-border hover:border-primary transition-all cursor-pointer disabled:opacity-40">
                <span className="text-3xl">{c.icon}</span>
                <span className="text-xs font-medium text-text">{c.label}</span>
                <span className="text-[9px] text-text-tertiary">{i + 1}</span>
              </button>
            ))}
          </div>

          {playerChoice && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-1">{playerChoice.icon}</div>
                  <div className="text-xs text-text-tertiary">You</div>
                </div>
                <span className="text-2xl text-text-tertiary">VS</span>
                <div className="text-center">
                  <motion.div initial={{ rotate: 0 }} animate={{ rotate: [0, 360] }} transition={{ duration: 0.3 }}
                    className="text-4xl mb-1">{computerChoice.icon}</motion.div>
                  <div className="text-xs text-text-tertiary">Computer</div>
                </div>
              </div>
              <div className={`text-lg font-bold font-heading ${result === 'win' ? 'text-cat-success' : result === 'lose' ? 'text-cat-text' : 'text-text-secondary'}`}>
                {result === 'win' ? 'You Win!' : result === 'lose' ? 'You Lose!' : 'Draw!'}
              </div>
            </motion.div>
          )}

          {seriesOver && (
            <button onClick={resetSeries}
              className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
              Play Again (Space)
            </button>
          )}
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <GlassCard>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-text font-heading">{totalGames}</div>
            <div className="text-[10px] text-text-tertiary">Games</div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-cat-success font-heading">{winRate}%</div>
            <div className="text-[10px] text-text-tertiary">Win Rate</div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4 text-center">
            <div className={`text-2xl font-bold font-heading ${streak > 0 ? 'text-cat-success' : 'text-text'}`}>{streak}</div>
            <div className="text-[10px] text-text-tertiary">Streak</div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-text font-heading">{bestStreak}</div>
            <div className="text-[10px] text-text-tertiary">Best Streak</div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Score</span>
            </div>
            <div className="flex gap-3 text-sm">
              <span className="text-cat-success">W: {score.wins}</span>
              <span className="text-cat-text">L: {score.losses}</span>
              <span className="text-text-tertiary">D: {score.draws}</span>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-2 block">Your Move Frequency</span>
            <div className="flex gap-2">
              {choices.map(c => (
                <div key={c.label} className="text-center">
                  <span className="text-lg">{c.icon}</span>
                  <div className="text-[10px] text-text-secondary">{playerFreq[c.label] || 0}×</div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {history.length > 0 && (
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-2 block">Move History ({history.length})</span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-auto">
              {history.map((h, i) => (
                <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded border ${
                  h.result === 'win' ? 'bg-cat-success/10 border-cat-success/20 text-cat-success' :
                  h.result === 'lose' ? 'bg-cat-text/10 border-cat-text/20 text-cat-text' :
                  'bg-surface border-border text-text-secondary'
                }`}>
                  {h.player} vs {h.computer}
                </span>
              ))}
            </div>
          </div>
        </GlassCard>
      )}
    </motion.div>
  )
}
