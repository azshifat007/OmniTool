'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function calc(principal, rate, years, compound, monthly) {
  const r = rate / 100 / compound;
  const n = compound * years;
  const fv = principal * Math.pow(1 + r, n);
  const totalContrib = monthly * 12 * years;
  const fvMonthly = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const total = fv + fvMonthly;
  const totalPaid = principal + totalContrib;
  return {
    futureValue: total,
    totalPrincipal: totalPaid,
    totalInterest: total - totalPaid,
    data: Array.from({ length: years + 1 }, (_, i) => ({
      year: i,
      value: principal * Math.pow(1 + rate / 100 / compound, compound * i) +
        monthly * ((Math.pow(1 + rate / 100 / compound, compound * i) - 1) / (rate / 100 / compound)) * (1 + rate / 100 / compound),
    })),
  };
}

export default function InvestmentPage() {
  const { addEntry } = useHistory();
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(10);
  const [compound, setCompound] = useState(12);
  const [monthly, setMonthly] = useState(500);

  const result = useMemo(() => {
    if (rate === 0) return null;
    return calc(principal, rate, years, compound, monthly);
  }, [principal, rate, years, compound, monthly]);

  const maxVal = result ? Math.max(...result.data.map((d) => d.value)) : 0;
  const h = 200;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">%</span>
        <h1 className="font-heading text-2xl font-bold text-text">Investment Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-text-tertiary mb-1 block">Principal ($)</label>
                <input type="number" value={principal} onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] text-text-tertiary mb-1 block">Monthly ($)</label>
                <input type="number" value={monthly} onChange={(e) => setMonthly(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] text-text-tertiary mb-1 block">Rate ({rate}%)</label>
                <input type="range" min={0.5} max={30} step={0.5} value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <label className="text-[10px] text-text-tertiary mb-1 block">Years ({years})</label>
                <input type="range" min={1} max={50} value={years} onChange={(e) => setYears(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-text-tertiary mb-1 block">Compound</label>
                <div className="flex gap-2">
                  {[1, 4, 12, 365].map((c) => (
                    <button key={c} onClick={() => setCompound(c)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${compound === c ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'}`}>
                      {c === 1 ? 'Yearly' : c === 4 ? 'Quarterly' : c === 12 ? 'Monthly' : 'Daily'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {result && (
          <div className="space-y-4">
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-3 block">Results</span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-surface rounded-lg p-3 border border-border text-center">
                    <div className="text-[9px] text-text-tertiary">Future Value</div>
                    <div className="text-lg font-mono font-bold text-text">${Math.round(result.futureValue).toLocaleString()}</div>
                  </div>
                  <div className="bg-surface rounded-lg p-3 border border-border text-center">
                    <div className="text-[9px] text-text-tertiary">Invested</div>
                    <div className="text-lg font-mono font-bold text-text">${Math.round(result.totalPrincipal).toLocaleString()}</div>
                  </div>
                  <div className="bg-surface rounded-lg p-3 border border-border text-center">
                    <div className="text-[9px] text-text-tertiary">Interest</div>
                    <div className="text-lg font-mono font-bold text-text" style={{ color: 'var(--cat-document)' }}>+${Math.round(result.totalInterest).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-3 block">Growth Chart</span>
                <svg viewBox={`0 0 ${result.data.length - 1} ${h}`} className="w-full" style={{ maxHeight: h }}>
                  <defs>
                    <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#grad)" d={`M0,${h - (result.data[0]?.value / maxVal) * h} ${result.data.map((d, i) => `L${i},${h - (d.value / maxVal) * h}`).join(' ')} L${result.data.length - 1},${h} L0,${h} Z`} />
                  <path fill="none" stroke="var(--primary)" strokeWidth="2" d={result.data.map((d, i) => `${i === 0 ? 'M' : 'L'}${i},${h - (d.value / maxVal) * h}`).join(' ')} />
                  {[0, 25, 50, 75, 100].map((pct) => (
                    <text key={pct} x="0" y={h - (pct / 100) * h + 3} fill="var(--text-tertiary)" fontSize="8">${Math.round(maxVal * pct / 100).toLocaleString()}</text>
                  ))}
                </svg>
                <div className="flex justify-between text-[9px] text-text-secondary mt-1">
                  {result.data.filter((_, i) => i % Math.max(1, Math.floor(result.data.length / 5)) === 0 || i === result.data.length - 1).map((d) => (
                    <span key={d.year}>Y{d.year}</span>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </motion.div>
  );
}
