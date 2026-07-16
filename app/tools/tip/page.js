'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import CopyButton from '@/components/CopyButton'
import { useHistory } from '@/components/HistoryProvider'

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
]

const TIP_PRESETS = [10, 15, 18, 20, 25]

const SERVICE_RATINGS = [
  { label: 'Poor', tip: 10, emoji: '😞' },
  { label: 'Okay', tip: 15, emoji: '😐' },
  { label: 'Good', tip: 18, emoji: '🙂' },
  { label: 'Great', tip: 20, emoji: '😊' },
  { label: 'Excellent', tip: 25, emoji: '🤩' },
]

const TIP_GUIDE = [
  { service: 'Restaurant', range: '15-20%', note: 'Standard in US, not expected in Japan' },
  { service: 'Barber/Salon', range: '15-20%', note: 'More for complex styles' },
  { service: 'Delivery', range: '10-15%', note: 'Higher for large orders or bad weather' },
  { service: 'Ride Share', range: '10-15%', note: 'Optional but appreciated' },
  { service: 'Hotel Housekeeping', range: '$2-5/night', note: 'Leave daily or at checkout' },
  { service: 'Valet Parking', range: '$2-5', note: 'When car is returned' },
]

export default function TipPage() {
  const { addEntry } = useHistory()
  const [bill, setBill] = useState('')
  const [tipPct, setTipPct] = useState(15)
  const [people, setPeople] = useState(1)
  const [roundUp, setRoundUp] = useState(false)
  const [currency, setCurrency] = useState('USD')
  const [serviceRating, setServiceRating] = useState(null)
  const [showGuide, setShowGuide] = useState(false)
  const [history, setHistory] = useState([])

  const cur = CURRENCIES.find(c => c.code === currency)

  const handleServiceRating = (rating) => {
    setServiceRating(rating)
    setTipPct(rating.tip)
  }

  const result = useMemo(() => {
    const b = parseFloat(bill)
    if (isNaN(b) || b <= 0) return null
    const rawTip = b * (tipPct / 100)
    const tip = roundUp ? Math.ceil(rawTip) : rawTip
    const total = b + tip
    const perPerson = total / people
    const tipPerPerson = tip / people
    return { bill: b, tip, total, perPerson, tipPerPerson, tipPct, people, roundUp }
  }, [bill, tipPct, people, roundUp])

  const handleBillChange = useCallback(e => {
    setBill(e.target.value)
    if (e.target.value.trim()) addEntry('Tip Calculator')
  }, [addEntry])

  const saveToHistory = () => {
    if (!result) return
    setHistory(h => [{
      bill: result.bill, tip: result.tip, total: result.total,
      pct: tipPct, people, time: new Date().toLocaleTimeString()
    }, ...h].slice(0, 15))
  }

  const receiptText = result
    ? `${cur.symbol}${result.bill.toFixed(2)} + ${result.tipPct}% tip${result.roundUp ? ' (rounded)' : ''} = ${cur.symbol}${result.total.toFixed(2)}\n${people > 1 ? `Split ${people} ways: ${cur.symbol}${result.perPerson.toFixed(2)} each` : ''}`
    : ''

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">$</span>
        <h1 className="font-heading text-2xl font-bold text-text">Tip Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-5">
            <div className="flex gap-2">
              {CURRENCIES.map(c => (
                <button key={c.code} onClick={() => setCurrency(c.code)}
                  className={`px-2 py-1 text-[10px] font-medium rounded transition-all cursor-pointer ${
                    currency === c.code ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                  }`}>{c.symbol} {c.code}</button>
              ))}
            </div>

            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Bill Amount ({cur.symbol})</label>
              <input type="number" value={bill} onChange={handleBillChange} placeholder="0.00" min="0" step="0.01"
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-text-tertiary">Tip: {tipPct}%</label>
                <span className="text-xs font-mono text-text-secondary">{tipPct}%</span>
              </div>
              <div className="flex gap-1.5 mb-2">
                {TIP_PRESETS.map(p => (
                  <button key={p} onClick={() => { setTipPct(p); setServiceRating(null) }}
                    className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      tipPct === p && !serviceRating ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                    }`}>{p}%</button>
                ))}
              </div>
              <input type="range" min="0" max="50" value={tipPct} onChange={e => { setTipPct(Number(e.target.value)); setServiceRating(null) }}
                className="w-full accent-primary cursor-pointer" />
              <div className="flex justify-between text-[10px] text-text-tertiary mt-0.5">
                <span>0%</span><span>50%</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Service Quality</label>
              <div className="flex gap-1.5">
                {SERVICE_RATINGS.map(r => (
                  <button key={r.label} onClick={() => handleServiceRating(r)}
                    className={`flex-1 px-2 py-1.5 text-[10px] font-medium rounded-lg transition-all cursor-pointer text-center ${
                      serviceRating?.label === r.label ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                    }`}>
                    <div className="text-sm">{r.emoji}</div>
                    <div>{r.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-text-tertiary">Number of People</label>
                <span className="text-xs font-mono text-text-secondary">{people}</span>
              </div>
              <input type="range" min="1" max="20" value={people} onChange={e => setPeople(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer" />
              <div className="flex justify-between text-[10px] text-text-tertiary mt-0.5">
                <span>1</span><span>20</span>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-text cursor-pointer">
              <input type="checkbox" checked={roundUp} onChange={e => setRoundUp(e.target.checked)}
                className="accent-primary cursor-pointer" />
              Round up tip
            </label>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-tertiary">Tip Breakdown</span>
              {result && <CopyButton text={receiptText} />}
            </div>

            {!result ? (
              <div className="text-sm text-text-tertiary">Enter a bill amount to see breakdown</div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Tip Total', value: `${cur.symbol}${result.tip.toFixed(2)}` },
                    { label: 'Total Bill', value: `${cur.symbol}${result.total.toFixed(2)}` },
                    { label: 'Per Person', value: `${cur.symbol}${result.perPerson.toFixed(2)}` },
                    { label: 'Tip / Person', value: `${cur.symbol}${result.tipPerPerson.toFixed(2)}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                      <div className="text-xs text-text-tertiary">{label}</div>
                      <div className="text-lg font-bold font-mono text-text">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-surface rounded-lg px-3 py-3 border border-border/50 space-y-1">
                  <div className="text-xs text-text-tertiary">Summary</div>
                  <div className="text-xs font-mono text-text">
                    {cur.symbol}{result.bill.toFixed(2)} + {result.tipPct}% tip{result.roundUp ? ' (rounded)' : ''} = {cur.symbol}{result.total.toFixed(2)}
                  </div>
                  <div className="text-xs font-mono text-text">
                    Split {result.people} way{result.people > 1 ? 's' : ''}: {cur.symbol}{result.perPerson.toFixed(2)} each
                  </div>
                </div>

                <button onClick={saveToHistory} className="w-full px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:text-text transition-all cursor-pointer">
                  Save to History
                </button>
              </>
            )}
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-tertiary">Tipping Guide</span>
            <button onClick={() => setShowGuide(!showGuide)} className="text-[10px] text-text-tertiary hover:text-text cursor-pointer">
              {showGuide ? 'Hide' : 'Show'}
            </button>
          </div>
          {showGuide && (
            <div className="space-y-2">
              {TIP_GUIDE.map(g => (
                <div key={g.service} className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-text font-medium">{g.service}</span>
                  <span className="text-text-secondary">{g.range}</span>
                  <span className="text-text-tertiary text-right flex-1 ml-3">{g.note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      {history.length > 0 && (
        <GlassCard className="mt-4">
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-2 block">History ({history.length})</span>
            <div className="space-y-1 max-h-48 overflow-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-text-secondary">{h.time}</span>
                  <span className="font-mono text-text">{cur.symbol}{h.bill.toFixed(2)}</span>
                  <span className="text-text-secondary">{h.pct}%</span>
                  <span className="font-mono font-semibold text-text">{cur.symbol}{h.total.toFixed(2)}</span>
                  {h.people > 1 && <span className="text-text-tertiary">÷{h.people}</span>}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}
    </motion.div>
  )
}
