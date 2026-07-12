'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import CopyButton from '@/components/CopyButton'
import { useHistory } from '@/components/HistoryProvider'

function textToHex(str) {
  return Array.from(str).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')
}

function hexToText(hex) {
  const cleaned = hex.replace(/\s+/g, '')
  if (!/^[0-9a-fA-F]*$/.test(cleaned) || cleaned.length === 0) return null
  let out = ''
  for (let i = 0; i < cleaned.length; i += 2) {
    out += String.fromCharCode(parseInt(cleaned.slice(i, i + 2), 16))
  }
  return out
}

function hexToDecimal(hex) {
  const cleaned = hex.replace(/\s+/g, '')
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) return null
  return parseInt(cleaned, 16)
}

function hexToBinary(hex) {
  const dec = hexToDecimal(hex)
  if (dec === null) return null
  return dec.toString(2)
}

function hexToOctal(hex) {
  const dec = hexToDecimal(hex)
  if (dec === null) return null
  return dec.toString(8)
}

function textToByteArray(str, lang) {
  const bytes = Array.from(str).map(c => c.charCodeAt(0))
  switch (lang) {
    case 'js': return `[${bytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}]`
    case 'python': return `[${bytes.join(', ')}]`
    case 'c': return `{${bytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}}`
    case 'rust': return `vec![${bytes.map(b => b).join(', ')}]`
    default: return bytes.join(' ')
  }
}

function parseHexString(hex) {
  const cleaned = hex.replace(/\s+/g, '')
  if (!/^[0-9a-fA-F]*$/.test(cleaned) || cleaned.length === 0) return null
  return cleaned
}

function formatHexDump(hex, bytesPerLine = 16) {
  const cleaned = hex.replace(/\s+/g, '')
  if (!cleaned) return ''
  const lines = []
  for (let i = 0; i < cleaned.length; i += bytesPerLine * 2) {
    const chunk = cleaned.slice(i, i + bytesPerLine * 2)
    const hexPart = chunk.match(/.{1,2}/g).join(' ')
    const asciiPart = chunk.match(/.{1,2}/g)
      .map(h => {
        const code = parseInt(h, 16)
        return code >= 32 && code <= 126 ? String.fromCharCode(code) : '.'
      }).join('')
    lines.push(`${(i / 2).toString(16).padStart(8, '0')}  ${hexPart.padEnd(bytesPerLine * 3)}  |${asciiPart}|`)
  }
  return lines.join('\n')
}

function isHexColor(hex) {
  return /^[0-9a-fA-F]{6}$/.test(hex.replace(/\s+/g, ''))
}

export default function HexConverterPage() {
  const { addEntry } = useHistory()
  const [input, setInput] = useState('Hello, World!')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('encode')
  const [error, setError] = useState('')
  const [tab, setTab] = useState('text')
  const [byteLang, setByteLang] = useState('js')
  const [autoConvert, setAutoConvert] = useState(true)

  const convert = useCallback(() => {
    setError('')
    addEntry('Hex Converter')
    if (tab === 'text') {
      if (mode === 'encode') {
        setOutput(textToHex(input))
      } else {
        const result = hexToText(input)
        if (result === null) { setError('Invalid hex input.'); setOutput(''); return }
        setOutput(result)
      }
    } else if (tab === 'number') {
      const dec = hexToDecimal(input)
      if (dec === null) { setError('Invalid hex number.'); setOutput(''); return }
      setOutput(dec.toString())
    } else if (tab === 'color') {
      const cleaned = input.replace('#', '').replace(/\s+/g, '')
      if (!isHexColor(cleaned)) { setError('Enter a valid 6-digit hex color.'); setOutput(''); return }
      const r = parseInt(cleaned.slice(0, 2), 16)
      const g = parseInt(cleaned.slice(2, 4), 16)
      const b = parseInt(cleaned.slice(4, 6), 16)
      setOutput(`RGB: ${r}, ${g}, ${b}\nHSL: ${rgbToHsl(r, g, b)}\nCSS: rgb(${r}, ${g}, ${b})`)
    }
  }, [input, mode, tab, addEntry])

  useEffect(() => {
    if (autoConvert && input.trim()) convert()
  }, [input, autoConvert, convert])

  const hexClean = input.replace('#', '').replace(/\s+/g, '')
  const decimal = hexToDecimal(hexClean)
  const binary = hexToBinary(hexClean)
  const octal = hexToOctal(hexClean)
  const byteArr = mode === 'encode' && tab === 'text' ? textToByteArray(input, byteLang) : ''
  const hexDump = tab === 'text' && mode === 'encode' ? formatHexDump(textToHex(input)) : ''
  const colorValid = tab === 'color' && isHexColor(hexClean)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">0x</span>
        <h1 className="font-heading text-2xl font-bold text-text">Hex Converter</h1>
      </div>

      <div className="flex gap-2 mb-4">
        {['text', 'number', 'color'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer capitalize ${
              tab === t ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
            }`}>{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">
                {tab === 'text' ? (mode === 'encode' ? 'Text' : 'Hex') : tab === 'number' ? 'Hex Number' : 'Hex Color (#RRGGBB)'}
              </label>
              <textarea value={input} onChange={e => setInput(e.target.value)} rows={tab === 'color' ? 1 : 4}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
            </div>

            {tab === 'text' && (
              <div className="flex gap-2">
                <button onClick={() => setMode('encode')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${mode === 'encode' ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}>Text → Hex</button>
                <button onClick={() => setMode('decode')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${mode === 'decode' ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}>Hex → Text</button>
              </div>
            )}

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
                <input type="checkbox" checked={autoConvert} onChange={e => setAutoConvert(e.target.checked)}
                  className="accent-primary rounded" />
                Auto-convert
              </label>
              {!autoConvert && (
                <button onClick={convert} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Convert</button>
              )}
            </div>

            {error && <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}

            {colorValid && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg border border-border" style={{ backgroundColor: `#${hexClean}` }} />
                <div className="text-xs text-text-secondary">
                  #{hexClean.toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Output</span>
              {output && <CopyButton text={output} className="text-xs" />}
            </div>
            <pre className="bg-surface rounded-xl p-4 text-sm font-mono text-text leading-relaxed border border-border/50 min-h-[120px] break-all whitespace-pre-wrap">{output || <span className="text-text-tertiary">Convert to see output...</span>}</pre>
          </div>
        </GlassCard>
      </div>

      {decimal !== null && (
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Multi-Base Conversion</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Decimal', value: decimal.toString(), copy: decimal.toString() },
                { label: 'Hexadecimal', value: '0x' + decimal.toString(16).toUpperCase(), copy: decimal.toString(16).toUpperCase() },
                { label: 'Binary', value: '0b' + (binary || '0'), copy: binary || '0' },
                { label: 'Octal', value: '0o' + (octal || '0'), copy: octal || '0' },
              ].map(b => (
                <div key={b.label} className="bg-surface rounded-lg p-3 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] text-text-tertiary">{b.label}</div>
                    <CopyButton text={b.copy} />
                  </div>
                  <div className="text-sm font-mono text-text break-all">{b.value}</div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {tab === 'text' && mode === 'encode' && input.trim() && (
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Byte Array</span>
              <div className="flex gap-1.5">
                {['js', 'python', 'c', 'rust'].map(lang => (
                  <button key={lang} onClick={() => setByteLang(lang)}
                    className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all cursor-pointer capitalize ${
                      byteLang === lang ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border'
                    }`}>{lang}</button>
                ))}
              </div>
            </div>
            <div className="bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border/50 break-all">
              {byteArr}
            </div>
          </div>
        </GlassCard>
      )}

      {hexDump && (
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Hex Dump</span>
              <CopyButton text={hexDump} />
            </div>
            <pre className="bg-surface rounded-lg px-3 py-2 text-[11px] font-mono text-text border border-border/50 overflow-auto max-h-48">{hexDump}</pre>
          </div>
        </GlassCard>
      )}
    </motion.div>
  )
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  if (max === min) { h = s = 0 } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`
}
