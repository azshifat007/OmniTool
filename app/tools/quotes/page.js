'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import CopyButton from '@/components/CopyButton'
import { useHistory } from '@/components/HistoryProvider'

const QUOTES = [
  { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay', category: 'Innovation' },
  { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman', category: 'Simplicity' },
  { text: 'Code is like humor. When you have to explain it, it\'s bad.', author: 'Cory House', category: 'Code' },
  { text: 'First solve the problem, then write the code.', author: 'John Johnson', category: 'Code' },
  { text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.', author: 'Martin Fowler', category: 'Code' },
  { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds', category: 'Code' },
  { text: 'Programs must be written for people to read, and only incidentally for machines to execute.', author: 'Harold Abelson', category: 'Code' },
  { text: 'The function of good software is to make the complex appear to be simple.', author: 'Grady Booch', category: 'Simplicity' },
  { text: 'Debugging is twice as hard as writing the code in the first place.', author: 'Brian Kernighan', category: 'Code' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein', category: 'Motivation' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', category: 'Motivation' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius', category: 'Motivation' },
  { text: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius', category: 'Stoicism' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle', category: 'Habits' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb', category: 'Motivation' },
  { text: 'Making your software do what it is supposed to do is not the challenge; making it easy to use is.', author: 'Jakob Nielsen', category: 'Simplicity' },
  { text: 'A language that doesn\'t affect the way you think about programming is not worth knowing.', author: 'Alan Perlis', category: 'Code' },
  { text: 'The most dangerous phrase in the language is: "We\'ve always done it this way."', author: 'Grace Hopper', category: 'Innovation' },
  { text: 'Measurement is the first step that leads to control and eventually improvement.', author: 'H. James Harrington', category: 'Improvement' },
  { text: 'If you can\'t explain it simply, you don\'t understand it well enough.', author: 'Albert Einstein', category: 'Simplicity' },
  { text: 'The only limit to our realization of tomorrow is our doubts of today.', author: 'Franklin D. Roosevelt', category: 'Motivation' },
  { text: 'Perfection is not attainable, but if we chase perfection we can catch excellence.', author: 'Vince Lombardi', category: 'Motivation' },
  { text: 'Your time is limited, don\'t waste it living someone else\'s life.', author: 'Steve Jobs', category: 'Motivation' },
  { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs', category: 'Motivation' },
  { text: 'The mind is everything. What you think you become.', author: 'Buddha', category: 'Stoicism' },
  { text: 'Strive not to be a success, but rather to be of value.', author: 'Albert Einstein', category: 'Motivation' },
  { text: 'Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference.', author: 'Robert Frost', category: 'Life' },
  { text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.', author: 'Nelson Mandela', category: 'Motivation' },
  { text: 'Tell me and I forget. Teach me and I remember. Involve me and I learn.', author: 'Benjamin Franklin', category: 'Learning' },
  { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs', category: 'Innovation' },
]

const CATEGORIES = ['All', ...new Set(QUOTES.map(q => q.category))]

export default function QuotesPage() {
  const { addEntry } = useHistory()
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('quote-favorites') || '[]') } catch { return [] }
  })
  const [showFavOnly, setShowFavOnly] = useState(false)
  const [history, setHistory] = useState([])
  const [dailyQuote] = useState(() => {
    const today = new Date().toDateString()
    const hash = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return QUOTES[hash % QUOTES.length]
  })

  const filtered = useMemo(() => {
    let list = QUOTES
    if (showFavOnly) {
      list = list.filter(q => favorites.includes(q.text))
    } else if (category !== 'All') {
      list = list.filter(q => q.category === category)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(qt => qt.text.toLowerCase().includes(q) || qt.author.toLowerCase().includes(q))
    }
    return list
  }, [category, search, showFavOnly, favorites])

  const [current, setCurrent] = useState(() => filtered[Math.floor(Math.random() * filtered.length)] || QUOTES[0])

  const next = useCallback(() => {
    const pool = filtered.length > 0 ? filtered : QUOTES
    let q
    do { q = pool[Math.floor(Math.random() * pool.length)] } while (q.text === current.text && pool.length > 1)
    setCurrent(q)
    setHistory(h => [{ ...q, time: new Date().toLocaleTimeString() }, ...h].slice(0, 20))
    addEntry('Quote Generator')
  }, [current, filtered, addEntry])

  const toggleFav = () => {
    const updated = favorites.includes(current.text)
      ? favorites.filter(t => t !== current.text)
      : [...favorites, current.text]
    setFavorites(updated)
    try { localStorage.setItem('quote-favorites', JSON.stringify(updated)) } catch {}
  }

  const quoteText = `"${current.text}" — ${current.author}`
  const historyText = history.map(h => `"${h.text}" — ${h.author}`).join('\n\n')

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">❝</span>
        <h1 className="font-heading text-2xl font-bold text-text">Quote Generator</h1>
      </div>

      <GlassCard>
        <div className="p-6 text-center space-y-5 max-w-lg mx-auto">
          <motion.div key={current.text} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="text-4xl text-primary/30 font-serif leading-none">&ldquo;</div>
            <p className="text-lg text-text leading-relaxed font-medium italic">&ldquo;{current.text}&rdquo;</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-sm text-text-secondary">— {current.author}</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-text-tertiary border border-border">{current.category}</span>
            </div>
          </motion.div>
          <div className="flex items-center justify-center gap-3">
            <button onClick={next} className="px-5 py-2 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Next Quote</button>
            <button onClick={toggleFav}
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                favorites.includes(current.text) ? 'bg-cat-text text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
              }`}>
              {favorites.includes(current.text) ? '★' : '☆'}
            </button>
            <CopyButton text={quoteText} />
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="p-4 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => { setCategory(cat); setShowFavOnly(false) }}
                className={`px-2 py-1 text-[10px] font-medium rounded-lg transition-all cursor-pointer ${
                  category === cat && !showFavOnly ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                }`}>{cat}</button>
            ))}
            <button onClick={() => setShowFavOnly(!showFavOnly)}
              className={`px-2 py-1 text-[10px] font-medium rounded-lg transition-all cursor-pointer ${
                showFavOnly ? 'bg-cat-text text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
              }`}>★ Favorites ({favorites.length})</button>
          </div>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search quotes or authors..."
            className="w-full bg-surface text-text rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-text-tertiary" />
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        <GlassCard>
          <div className="p-4 text-center">
            <div className="text-[10px] text-text-tertiary mb-1">Today&apos;s Quote</div>
            <p className="text-xs text-text italic leading-relaxed line-clamp-3">&ldquo;{dailyQuote.text}&rdquo;</p>
            <p className="text-[10px] text-text-secondary mt-1">— {dailyQuote.author}</p>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4 text-center">
            <div className="text-[10px] text-text-tertiary mb-1">Available Quotes</div>
            <div className="text-2xl font-bold text-text font-heading">{QUOTES.length}</div>
            <div className="text-[10px] text-text-secondary">{CATEGORIES.length - 1} categories</div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4 text-center">
            <div className="text-[10px] text-text-tertiary mb-1">Your Favorites</div>
            <div className="text-2xl font-bold text-text font-heading">{favorites.length}</div>
            <div className="text-[10px] text-text-secondary">saved quotes</div>
          </div>
        </GlassCard>
      </div>

      {history.length > 0 && (
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Recently Viewed ({history.length})</span>
              <CopyButton text={historyText} />
            </div>
            <div className="space-y-2 max-h-60 overflow-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-border/50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text truncate">&ldquo;{h.text}&rdquo;</p>
                    <p className="text-[10px] text-text-secondary">— {h.author}</p>
                  </div>
                  <span className="text-[10px] text-text-tertiary shrink-0">{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}
    </motion.div>
  )
}
