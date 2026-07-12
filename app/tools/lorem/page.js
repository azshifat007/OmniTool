'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import CopyButton from '@/components/CopyButton'
import { useHistory } from '@/components/HistoryProvider'

const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea',
  'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit',
  'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur',
  'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt',
  'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est',
  'laborum', 'perspiciatis', 'unde', 'omnis', 'iste', 'natus', 'error',
  'voluptatem', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem',
  'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore', 'veritatis',
  'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'explicabo', 'nemo',
  'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit', 'fugit',
  'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi', 'nesciunt',
  'neque', 'porro', 'quisquam', 'nihil', 'impedit', 'quo', 'minus',
  'maxime', 'placeat', 'facere', 'possimus', 'omnis', 'assumenda', 'repudiandae',
  'repellat', 'alias', 'accusamus', 'harum', 'rerum', 'facilis', 'expedita',
  'distinctio', 'nam', 'libero', 'tempore', 'cum', 'soluta', 'nobis',
  'eligendi', 'optio', 'cumque', 'nihil', 'obcaecati', 'cupiditate', 'provident',
  'similique', 'mollitia', 'animi', 'dignissimos', 'dignissimos', 'ducimus',
  'praesentium', 'voluptatum', 'deleniti', 'atque', 'corrupti', 'quos',
  'quas', 'molestias', 'excepturi', 'sint', 'obcaecati', 'cupiditate',
]

function capitalize(w) {
  return w.charAt(0).toUpperCase() + w.slice(1)
}

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateParagraph(wordCount, startWithLorem, randomize, rng) {
  const words = []
  for (let i = 0; i < wordCount; i++) {
    if (startWithLorem && i < 2) {
      words.push(WORDS[i])
    } else {
      const idx = randomize ? Math.floor((rng ? rng() : Math.random()) * WORDS.length) : i % WORDS.length
      words.push(WORDS[idx])
    }
  }
  if (words.length > 0) words[0] = capitalize(words[0])
  return words.join(' ') + '.'
}

function generateOutput(count, unit, wordsPerParagraph, startWithLorem, includeHtml, includeH1, includeH2, includeLists, seed) {
  const rng = seed ? seededRandom(seed) : null
  const parts = []

  if (unit === 'characters') {
    const text = generateParagraph(200, startWithLorem, true, rng)
    const truncated = text.slice(0, count)
    return includeHtml ? `<p>${truncated}</p>` : truncated
  }

  if (unit === 'words') {
    const words = []
    for (let i = 0; i < count; i++) {
      const idx = rng ? Math.floor(rng() * WORDS.length) : Math.floor(Math.random() * WORDS.length)
      words.push(i === 0 && startWithLorem ? capitalize(WORDS[0]) : WORDS[idx])
    }
    const text = words.join(' ') + '.'
    return includeHtml ? `<p>${text}</p>` : text
  }

  if (unit === 'sentences') {
    const sentences = []
    for (let i = 0; i < count; i++) {
      const wc = 8 + Math.floor((rng ? rng() : Math.random()) * 15)
      sentences.push(generateParagraph(wc, i === 0 && startWithLorem, true, rng).replace(/\.$/, ''))
    }
    const text = sentences.join('. ') + '.'
    return includeHtml ? `<p>${text}</p>` : text
  }

  for (let i = 0; i < count; i++) {
    if (includeH1 && i === 0) {
      const title = generateParagraph(4, false, true, rng).replace(/\.$/, '')
      parts.push(includeHtml ? `<h1>${title}</h1>` : title.toUpperCase())
    }
    if (includeH2 && i > 0 && i % 3 === 0) {
      const heading = generateParagraph(3, false, true, rng).replace(/\.$/, '')
      parts.push(includeHtml ? `<h2>${heading}</h2>` : heading.toUpperCase())
    }
    const wc = wordsPerParagraph || (20 + Math.floor((rng ? rng() : Math.random()) * 30))
    const para = generateParagraph(wc, i === 0 && startWithLorem, true, rng)
    if (includeHtml) {
      parts.push(`<p>${para}</p>`)
    } else {
      parts.push(para)
    }
    if (includeLists && i > 0 && i % 4 === 0) {
      const listItems = []
      for (let j = 0; j < 3; j++) {
        const li = generateParagraph(3, false, true, rng).replace(/\.$/, '')
        listItems.push(includeHtml ? `<li>${li}</li>` : `• ${li}`)
      }
      if (includeHtml) {
        parts.push(`<ul>\n${listItems.join('\n')}\n</ul>`)
      } else {
        parts.push(listItems.join('\n'))
      }
    }
  }
  return parts.join(includeHtml ? '\n' : '\n\n')
}

export default function LoremPage() {
  const { addEntry } = useHistory()
  const [unit, setUnit] = useState('paragraphs')
  const [count, setCount] = useState(3)
  const [wordsPerParagraph, setWordsPerParagraph] = useState(0)
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [includeHtml, setIncludeHtml] = useState(false)
  const [includeH1, setIncludeH1] = useState(false)
  const [includeH2, setIncludeH2] = useState(false)
  const [includeLists, setIncludeLists] = useState(false)
  const [seed, setSeed] = useState('')
  const [output, setOutput] = useState('')

  const unitLimits = { paragraphs: [1, 50], sentences: [1, 100], words: [1, 5000], characters: [1, 50000] }
  const unitDefaults = { paragraphs: 3, sentences: 5, words: 200, characters: 1000 }

  const handleUnitChange = (u) => {
    setUnit(u)
    setCount(unitDefaults[u])
  }

  const handleGenerate = useCallback(() => {
    const seedVal = seed ? parseInt(seed) : null
    const text = generateOutput(count, unit, wordsPerParagraph || null, startWithLorem, includeHtml, includeH1, includeH2, includeLists, seedVal)
    setOutput(text)
    addEntry('Lorem Ipsum Generator')
  }, [count, unit, wordsPerParagraph, startWithLorem, includeHtml, includeH1, includeH2, includeLists, seed, addEntry])

  const wordCount = output ? output.split(/\s+/).filter(Boolean).length : 0
  const charCount = output.length

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">¶</span>
        <h1 className="font-heading text-2xl font-bold text-text">Lorem Ipsum Generator</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {['paragraphs', 'sentences', 'words', 'characters'].map(u => (
              <button key={u} onClick={() => handleUnitChange(u)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer capitalize ${
                  unit === u ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                }`}>{u}</button>
            ))}
          </div>

          <div>
            <label className="text-xs text-text-tertiary mb-1.5 block capitalize">{unit}: {count}</label>
            <input type="range" min={unitLimits[unit][0]} max={unitLimits[unit][1]} value={count}
              onChange={e => setCount(parseInt(e.target.value))}
              className="w-full accent-primary cursor-pointer" />
          </div>

          {unit === 'paragraphs' && (
            <div>
              <label className="text-xs text-text-tertiary mb-1.5 block">Words per paragraph: {wordsPerParagraph || 'Random (20-50)'}</label>
              <input type="range" min={0} max={200} value={wordsPerParagraph}
                onChange={e => setWordsPerParagraph(parseInt(e.target.value))}
                className="w-full accent-primary cursor-pointer" />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input type="checkbox" checked={startWithLorem} onChange={e => setStartWithLorem(e.target.checked)}
                className="accent-primary rounded" />
              Start with "Lorem ipsum..."
            </label>
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input type="checkbox" checked={includeHtml} onChange={e => setIncludeHtml(e.target.checked)}
                className="accent-primary rounded" />
              HTML tags
            </label>
            {includeHtml && (
              <>
                <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
                  <input type="checkbox" checked={includeH1} onChange={e => setIncludeH1(e.target.checked)}
                    className="accent-primary rounded" />
                  &lt;h1&gt;
                </label>
                <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
                  <input type="checkbox" checked={includeH2} onChange={e => setIncludeH2(e.target.checked)}
                    className="accent-primary rounded" />
                  &lt;h2&gt;
                </label>
                <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
                  <input type="checkbox" checked={includeLists} onChange={e => setIncludeLists(e.target.checked)}
                    className="accent-primary rounded" />
                  &lt;ul&gt;
                </label>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-text-tertiary">Seed (optional)</label>
            <input type="number" value={seed} onChange={e => setSeed(e.target.value)}
              placeholder="Random"
              className="w-28 bg-surface rounded-lg px-3 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          </div>

          <button onClick={handleGenerate} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
            Generate
          </button>
        </div>
      </GlassCard>

      {output && (
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-tertiary">Generated</span>
                <span className="text-[10px] text-text-secondary">{wordCount} words · {charCount} chars</span>
              </div>
              <CopyButton text={output} />
            </div>
            <pre className="bg-surface rounded-lg px-4 py-3 text-sm text-text leading-relaxed border border-border/50 overflow-auto max-h-80 whitespace-pre-wrap font-sans">
              <code>{output}</code>
            </pre>
          </div>
        </GlassCard>
      )}
    </motion.div>
  )
}
