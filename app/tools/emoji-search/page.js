'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import { useHistory } from '@/components/HistoryProvider'

const SKIN_TONES = ['', '🏻', '🏼', '🏽', '🏾', '⬛']

const CATEGORIES = {
  'Smileys': ['😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','😉','😍','🥰','😘','😋','😛','😜','🤗','🤔','😐','😑','😶','😒','🙄','😬','😮','😲','😳','🥺','😢','😭','😤','😠','🤬','😈','💀','💩','🤡','👻','👽','🤖'],
  'Gestures': ['👍','👎','👊','✊','👋','✋','✌','🤞','🤘','🤙','👆','👇','👈','👉','🙌','🤝','🙏','💪','🫶','🫰','🫡','🫢','🫣','🫤'],
  'Hearts': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','💕','💞','💓','💗','💖','💘','💝'],
  'Animals': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜'],
  'Food': ['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🥑','🥦','🥬','🌶️','🫑','🌽','🥕','🧄','🧅','🥔','🍠','🥐','🥖','🍞','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩'],
  'Objects': ['⌚','📱','💻','⌨️','🖥️','🖨️','🖱️','💾','💿','📀','📷','📹','🎥','📽️','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏰','📡','🔋','🔌','💡','🔦','🕯️','🧯','🛢️','💰','💳','📦','📫','📪','📬','📭','📮'],
  'Symbols': ['⭐','🌟','💫','✨','🔥','💥','❄️','🌈','☀️','🌤️','⛅','🌥️','☁️','🌧️','⛈️','🌩️','🌪️','🌫️','🌊','💧','💦','🫧','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','✅','❌','⚠️','🚫','💯','🔴','🟠','🟡','🟢','🔵','🟣'],
}

const ALL_EMOJIS = Object.entries(CATEGORIES).flatMap(([cat, emojis]) =>
  emojis.map(e => ({ emoji: e, category: cat }))
)

const SKIN_TONE_MAP = {
  '✋': ['✋','✋🏻','✋🏼','✋🏽','✋🏾','✋🏿'],
  '👋': ['👋','👋🏻','👋🏼','👋🏽','👋🏾','👋🏿'],
  '✌': ['✌','✌🏻','✌🏼','✌🏽','✌🏾','✌🏿'],
  '🤞': ['🤞','🤞🏻','🤞🏼','🤞🏽','🤞🏾','🤞🏿'],
  '🤘': ['🤘','🤘🏻','🤘🏼','🤘🏽','🤘🏾','🤘🏿'],
  '🤙': ['🤙','🤙🏻','🤙🏼','🤙🏽','🤙🏾','🤙🏿'],
  '👆': ['👆','👆🏻','👆🏼','👆🏽','👆🏾','👆🏿'],
  '👇': ['👇','👇🏻','👇🏼','👇🏽','👇🏾','👇🏿'],
  '👈': ['👈','👈🏻','👈🏼','👈🏽','👈🏾','👈🏿'],
  '👉': ['👉','👉🏻','👉🏼','👉🏽','👉🏾','👉🏿'],
  '🙌': ['🙌','🙌🏻','🙌🏼','🙌🏽','🙌🏾','🙌🏿'],
  '🙏': ['🙏','🙏🏻','🙏🏼','🙏🏽','🙏🏾','🙏🏿'],
  '💪': ['💪','💪🏻','💪🏼','💪🏽','💪🏾','💪🏿'],
  '👍': ['👍','👍🏻','👍🏼','👍🏽','👍🏾','👍🏿'],
  '👎': ['👎','👎🏻','👎🏼','👎🏽','👎🏾','👎🏿'],
  '👊': ['👊','👊🏻','👊🏼','👊🏽','👊🏾','👊🏿'],
  '✊': ['✊','✊🏻','✊🏼','✊🏽','✊🏾','✊🏿'],
  '🤝': ['🤝','🤝🏻','🤝🏼','🤝🏽','🤝🏾','🤝🏿'],
  '🫶': ['🫶','🫶🏻','🫶🏼','🫶🏽','🫶🏾','🫶🏿'],
  '🫰': ['🫰','🫰🏻','🫰🏼','🫰🏽','🫰🏾','🫰🏿'],
  '🫡': ['🫡','🫡🏻','🫡🏼','🫡🏽','🫡🏾','🫡🏿'],
  '🫢': ['🫢','🫢🏻','🫢🏼','🫢🏽','🫢🏾','🫢🏿'],
  '🫣': ['🫣','🫣🏻','🫣🏼','🫣🏽','🫣🏾','🫣🏿'],
}

export default function EmojiSearchPage() {
  const { addEntry } = useHistory()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [skinTone, setSkinTone] = useState(0)
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('emoji-favorites') || '[]') } catch { return [] }
  })
  const [showFavOnly, setShowFavOnly] = useState(false)
  const [copiedEmoji, setCopiedEmoji] = useState(null)
  const [recentEmojis, setRecentEmojis] = useState(() => {
    try { return JSON.parse(localStorage.getItem('emoji-recent') || '[]') } catch { return [] }
  })

  const filtered = useMemo(() => {
    let list = ALL_EMOJIS
    if (activeCategory === 'Favorites') {
      list = list.filter(e => favorites.includes(e.emoji))
    } else if (activeCategory !== 'All') {
      list = list.filter(e => e.category === activeCategory)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(e => e.emoji.includes(q) || e.category.toLowerCase().includes(q))
    }
    return list
  }, [query, activeCategory, favorites])

  const applySkinTone = (emoji) => {
    if (skinTone === 0) return emoji
    const variants = SKIN_TONE_MAP[emoji]
    if (variants) return variants[skinTone]
    return emoji
  }

  const copyEmoji = async (emoji) => {
    const display = applySkinTone(emoji)
    try {
      await navigator.clipboard.writeText(display)
      setCopiedEmoji(display)
      addEntry('Emoji Search')
      setTimeout(() => setCopiedEmoji(null), 1000)
      const updated = [display, ...recentEmojis.filter(e => e !== display)].slice(0, 15)
      setRecentEmojis(updated)
      try { localStorage.setItem('emoji-recent', JSON.stringify(updated)) } catch {}
    } catch {}
  }

  const toggleFav = (emoji) => {
    const updated = favorites.includes(emoji)
      ? favorites.filter(e => e !== emoji)
      : [...favorites, emoji]
    setFavorites(updated)
    try { localStorage.setItem('emoji-favorites', JSON.stringify(updated)) } catch {}
  }

  const categoryTabs = ['All', 'Favorites', ...Object.keys(CATEGORIES)]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">☺</span>
        <h1 className="font-heading text-2xl font-bold text-text">Emoji Search</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-3">
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search emojis by name or keyword..."
            className="w-full bg-surface text-text rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-text-tertiary" />

          <div className="flex flex-wrap gap-1.5">
            {categoryTabs.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-2 py-1 text-[10px] font-medium rounded-lg transition-all cursor-pointer capitalize ${
                  activeCategory === cat ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                }`}>
                {cat === 'Favorites' ? `★ (${favorites.length})` : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[10px] text-text-tertiary">Skin tone:</label>
            <div className="flex gap-1">
              {SKIN_TONES.map((tone, i) => (
                <button key={i} onClick={() => setSkinTone(i)}
                  className={`w-6 h-6 rounded text-sm flex items-center justify-center transition-all cursor-pointer ${
                    skinTone === i ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-surface'
                  }`}>
                  {i === 0 ? '👋' : `👋${tone}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {recentEmojis.length > 0 && (
        <div className="mt-4 mb-2">
          <span className="text-[10px] text-text-tertiary mb-2 block">Recent</span>
          <div className="flex gap-1 flex-wrap">
            {recentEmojis.map((emoji, i) => (
              <button key={i} onClick={() => copyEmoji(emoji)} title="Click to copy"
                className="w-8 h-8 flex items-center justify-center text-lg rounded-lg bg-surface border border-border hover:border-primary/40 transition-all cursor-pointer">
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 mb-2">
        <span className="text-xs text-text-tertiary">{filtered.length} emojis</span>
        {copiedEmoji && (
          <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-cat-success font-medium">
            Copied {copiedEmoji}
          </motion.span>
        )}
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1">
        {filtered.map(({ emoji, category }) => (
          <div key={emoji + category} className="relative group">
            <button onClick={() => copyEmoji(emoji)} title={category}
              className="w-full aspect-square flex items-center justify-center text-2xl rounded-xl bg-surface border border-border hover:border-primary/40 hover:bg-badge-bg transition-all cursor-pointer">
              {applySkinTone(emoji)}
            </button>
            <button onClick={(e) => { e.stopPropagation(); toggleFav(emoji) }}
              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer ${
                favorites.includes(emoji) ? 'opacity-100 bg-cat-text text-white' : 'bg-surface border border-border text-text-secondary'
              }`}>
              {favorites.includes(emoji) ? '★' : '☆'}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
