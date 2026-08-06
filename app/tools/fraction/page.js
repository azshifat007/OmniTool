'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import CopyButton from '@/components/CopyButton'
import { useHistory } from '@/components/HistoryProvider'

function gcd(a, b) { return b ? gcd(b, a % b) : a }
function lcm(a, b) { return Math.abs(a * b) / gcd(a, b) }

function toFraction(decimal, maxDen = 1000) {
  if (!decimal && decimal !== 0) return null
  if (Number.isInteger(decimal)) return { num: decimal, den: 1, mixed: `${decimal}`, decimal: decimal, percentage: (decimal * 100).toFixed(2) + '%' }
  const sign = decimal < 0 ? -1 : 1
  const absDec = Math.abs(decimal)
  let bestNum = 1, bestDen = 1, bestDiff = Math.abs(absDec - 1)
  for (let den = 1; den <= maxDen; den++) {
    const num = Math.round(absDec * den)
    const diff = Math.abs(absDec - num / den)
    if (diff < bestDiff) { bestDiff = diff; bestNum = num; bestDen = den }
  }
  const g = gcd(bestNum, bestDen)
  const num = (bestNum / g) * sign
  const den = bestDen / g
  let mixed = ''
  if (Math.abs(num) >= den) {
    const whole = Math.floor(Math.abs(num) / den) * Math.sign(num)
    const rem = Math.abs(num) % den
    mixed = rem === 0 ? `${whole}` : `${whole} ${rem}/${den}`
  }
  return { num, den, mixed: mixed || `${num}/${den}`, decimal: (num / den).toFixed(6), percentage: ((num / den) * 100).toFixed(2) + '%' }
}

function parseFraction(str) {
  str = str.trim()
  const mixedMatch = str.match(/^(-?\d+)\s+(\d+)\/(\d+)$/)
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1])
    const num = parseInt(mixedMatch[2])
    const den = parseInt(mixedMatch[3])
    if (den === 0) return null
    const sign = whole < 0 ? -1 : 1
    return sign * (Math.abs(whole) * den + num) / den
  }
  const fracMatch = str.match(/^(-?\d+)\/(\d+)$/)
  if (fracMatch) {
    const num = parseInt(fracMatch[1])
    const den = parseInt(fracMatch[2])
    if (den === 0) return null
    return num / den
  }
  return parseFloat(str)
}

function simplifyFraction(num, den) {
  if (den === 0) return { num, den }
  const g = gcd(Math.abs(num), Math.abs(den))
  return { num: num / g, den: den / g }
}

const COMMON_FRACTIONS = [
  { frac: '1/2', dec: 0.5, pct: '50%' },
  { frac: '1/3', dec: 0.333, pct: '33.3%' },
  { frac: '2/3', dec: 0.667, pct: '66.7%' },
  { frac: '1/4', dec: 0.25, pct: '25%' },
  { frac: '3/4', dec: 0.75, pct: '75%' },
  { frac: '1/5', dec: 0.2, pct: '20%' },
  { frac: '2/5', dec: 0.4, pct: '40%' },
  { frac: '3/5', dec: 0.6, pct: '60%' },
  { frac: '4/5', dec: 0.8, pct: '80%' },
  { frac: '1/8', dec: 0.125, pct: '12.5%' },
  { frac: '3/8', dec: 0.375, pct: '37.5%' },
  { frac: '5/8', dec: 0.625, pct: '62.5%' },
  { frac: '7/8', dec: 0.875, pct: '87.5%' },
  { frac: '1/10', dec: 0.1, pct: '10%' },
  { frac: '1/16', dec: 0.0625, pct: '6.25%' },
]

export default function FractionPage() {
  const { addEntry } = useHistory()
  const [mode, setMode] = useState('dec-to-frac')
  const [decimal, setDecimal] = useState('0.75')
  const [maxDen, setMaxDen] = useState(1000)
  const [result, setResult] = useState(null)
  const [fracInput, setFracInput] = useState('3/4')
  const [fracResult, setFracResult] = useState(null)
  const [opA, setOpA] = useState('1/2')
  const [opB, setOpB] = useState('1/3')
  const [operator, setOperator] = useState('+')
  const [opResult, setOpResult] = useState(null)
  const [history, setHistory] = useState([])

  const convertDecToFrac = useCallback(() => {
    addEntry('Fraction Converter')
    const d = parseFloat(decimal)
    if (isNaN(d)) { setResult(null); return }
    const res = toFraction(d, maxDen)
    setResult(res)
    setHistory(h => [{ input: decimal, output: res.mixed || `${res.num}/${res.den}`, mode: 'Dec→Frac', time: new Date().toLocaleTimeString() }, ...h].slice(0, 20))
  }, [decimal, maxDen, addEntry])

  const convertFracToDec = useCallback(() => {
    addEntry('Fraction Converter')
    const val = parseFraction(fracInput)
    if (val === null || isNaN(val)) { setFracResult(null); return }
    const frac = toFraction(val, 10000)
    setFracResult({ decimal: val, fraction: frac })
    setHistory(h => [{ input: fracInput, output: val.toFixed(6), mode: 'Frac→Dec', time: new Date().toLocaleTimeString() }, ...h].slice(0, 20))
  }, [fracInput, addEntry])

  const calculateOp = useCallback(() => {
    addEntry('Fraction Converter')
    const a = parseFraction(opA)
    const b = parseFraction(opB)
    if (a === null || b === null || isNaN(a) || isNaN(b)) { setOpResult(null); return }
    let res
    switch (operator) {
      case '+': res = a + b; break
      case '-': res = a - b; break
      case '×': res = a * b; break
      case '÷': res = b !== 0 ? a / b : null; break
      default: res = a + b
    }
    if (res === null || isNaN(res)) { setOpResult(null); return }
    const frac = toFraction(res, 10000)
    const aFrac = toFraction(a, 10000)
    const bFrac = toFraction(b, 10000)
    setOpResult({ result: res, fraction: frac, expression: `${aFrac.mixed || `${aFrac.num}/${aFrac.den}`} ${operator} ${bFrac.mixed || `${bFrac.num}/${bFrac.den}`}` })
    setHistory(h => [{ input: `${opA} ${operator} ${opB}`, output: frac.mixed || `${frac.num}/${frac.den}`, mode: 'Arithmetic', time: new Date().toLocaleTimeString() }, ...h].slice(0, 20))
  }, [opA, opB, operator, addEntry])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">½</span>
        <h1 className="font-heading text-2xl font-bold text-text">Fraction Converter</h1>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { id: 'dec-to-frac', label: 'Decimal → Fraction' },
          { id: 'frac-to-dec', label: 'Fraction → Decimal' },
          { id: 'arithmetic', label: 'Arithmetic' },
        ].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              mode === m.id ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
            }`}>{m.label}</button>
        ))}
      </div>

      {mode === 'dec-to-frac' && (
        <GlassCard>
          <div className="p-4 max-w-lg mx-auto space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Decimal</label>
              <input type="number" step="any" value={decimal} onChange={e => setDecimal(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Max Denominator: {maxDen}</label>
              <input type="range" min={10} max={10000} step={10} value={maxDen} onChange={e => setMaxDen(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer" />
            </div>
            <button onClick={convertDecToFrac} className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Convert</button>
            {result && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center pt-4 space-y-2">
                <div className="text-4xl font-bold font-heading text-text font-mono">
                  <span className="text-2xl">{result.num}</span>
                  <span className="text-text-tertiary">/</span>
                  <span className="text-2xl">{result.den}</span>
                </div>
                {result.mixed && result.mixed !== `${result.num}/${result.den}` && (
                  <div className="text-lg text-text-secondary">= {result.mixed}</div>
                )}
                <div className="flex justify-center items-center gap-3 text-sm">
                  <span className="text-text-secondary">= {result.decimal}</span>
                  <span className="text-text-secondary">= {result.percentage}</span>
                </div>
                <div className="flex justify-center"><CopyButton text={`${result.num}/${result.den}`} className="text-xs" /></div>
              </motion.div>
            )}
          </div>
        </GlassCard>
      )}

      {mode === 'frac-to-dec' && (
        <GlassCard>
          <div className="p-4 max-w-lg mx-auto space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Fraction (e.g. 3/4 or 2 1/4)</label>
              <input value={fracInput} onChange={e => setFracInput(e.target.value)}
                placeholder="3/4 or 2 1/4"
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <button onClick={convertFracToDec} className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Convert</button>
            {fracResult && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center pt-4 space-y-2">
                <div className="text-4xl font-bold font-heading text-text font-mono">{fracResult.decimal.toFixed(6)}</div>
                <div className="text-lg text-text-secondary">= {fracResult.fraction.mixed || `${fracResult.fraction.num}/${fracResult.fraction.den}`}</div>
                <div className="text-sm text-text-secondary">= {fracResult.fraction.percentage}</div>
                <div className="flex justify-center"><CopyButton text={fracResult.decimal.toFixed(6)} className="text-xs" /></div>
              </motion.div>
            )}
          </div>
        </GlassCard>
      )}

      {mode === 'arithmetic' && (
        <GlassCard>
          <div className="p-4 max-w-lg mx-auto space-y-4">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">First Fraction</label>
                <input value={opA} onChange={e => setOpA(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Op</label>
                <div className="flex gap-1">
                  {['+', '-', '×', '÷'].map(op => (
                    <button key={op} onClick={() => setOperator(op)}
                      className={`w-8 h-8 text-sm font-medium rounded transition-all cursor-pointer ${operator === op ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border'}`}>
                      {op}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Second Fraction</label>
                <input value={opB} onChange={e => setOpB(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
            <button onClick={calculateOp} className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Calculate</button>
            {opResult && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center pt-4 space-y-2">
                <div className="text-sm text-text-secondary">{opResult.expression} =</div>
                <div className="text-4xl font-bold font-heading text-text font-mono">
                  <span className="text-2xl">{opResult.fraction.num}</span>
                  <span className="text-text-tertiary">/</span>
                  <span className="text-2xl">{opResult.fraction.den}</span>
                </div>
                {opResult.fraction.mixed && opResult.fraction.mixed !== `${opResult.fraction.num}/${opResult.fraction.den}` && (
                  <div className="text-lg text-text-secondary">= {opResult.fraction.mixed}</div>
                )}
                <div className="text-sm text-text-secondary">= {opResult.result.toFixed(6)} = {opResult.fraction.percentage}</div>
                <div className="flex justify-center"><CopyButton text={`${opResult.fraction.num}/${opResult.fraction.den}`} className="text-xs" /></div>
              </motion.div>
            )}
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <div className="p-4">
          <span className="text-xs text-text-tertiary mb-3 block">Common Fractions Reference</span>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {COMMON_FRACTIONS.map(f => (
              <div key={f.frac} className="bg-surface rounded-lg p-2 border border-border text-center">
                <div className="text-sm font-mono font-bold text-text">{f.frac}</div>
                <div className="text-[10px] text-text-secondary">= {f.dec}</div>
                <div className="text-[10px] text-text-tertiary">= {f.pct}</div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {history.length > 0 && (
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-2 block">History ({history.length})</span>
            <div className="space-y-1 max-h-40 overflow-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-text-secondary">{h.mode}</span>
                  <span className="font-mono text-text">{h.input}</span>
                  <span className="font-mono font-semibold text-text">= {h.output}</span>
                  <span className="text-text-tertiary">{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}
    </motion.div>
  )
}
