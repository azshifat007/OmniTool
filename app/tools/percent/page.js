'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function PercentPage() {
  const { addEntry } = useHistory();
  const [mode, setMode] = useState('xy');
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [result, setResult] = useState(null);
  const [fromVal, setFromVal] = useState('');
  const [toVal, setToVal] = useState('');
  const [changeResult, setChangeResult] = useState(null);

  const calculate = useCallback(() => {
    const a = parseFloat(x);
    const b = parseFloat(y);
    if (isNaN(a) || isNaN(b) || b === 0) { setResult(null); return; }

    let res, formula;
    switch (mode) {
      case 'xy':
        res = (a / b) * 100;
        formula = `${a} / ${b} × 100 = ${res.toFixed(2)}%`;
        break;
      case 'xp':
        res = (a / 100) * b;
        formula = `${a}% of ${b} = (${a} / 100) × ${b} = ${res.toFixed(2)}`;
        break;
      case 'py':
        res = (b / a) * 100;
        formula = `${a}% of what = ${b} → ${b} / (${a} / 100) = ${res.toFixed(2)}`;
        break;
    }
    setResult({ value: res, formula, mode });
    addEntry('Percentage Calculator');
  }, [x, y, mode, addEntry]);

  const calcChange = useCallback(() => {
    const f = parseFloat(fromVal);
    const t = parseFloat(toVal);
    if (isNaN(f) || isNaN(t) || f === 0) { setChangeResult(null); return; }
    const diff = t - f;
    const pct = (diff / f) * 100;
    setChangeResult({ diff, pct, from: f, to: t });
  }, [fromVal, toVal]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">💯</span>
        <h1 className="font-heading text-2xl font-bold text-text">Percentage Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Calculation Type</label>
              <div className="space-y-2">
                {[
                  { value: 'xy', label: 'X is what % of Y?' },
                  { value: 'xp', label: 'What is X% of Y?' },
                  { value: 'py', label: 'X% of what is Y?' },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-xs text-text cursor-pointer">
                    <input type="radio" name="mode" value={opt.value} checked={mode === opt.value}
                      onChange={(e) => setMode(e.target.value)}
                      className="accent-primary cursor-pointer" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-text-tertiary mb-1 block">X</label>
                <input type="number" value={x} onChange={(e) => setX(e.target.value)} placeholder="0"
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-text-tertiary mb-1 block">Y</label>
                <input type="number" value={y} onChange={(e) => setY(e.target.value)} placeholder="0"
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>

            <button onClick={calculate}
              className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
              Calculate
            </button>

            {result && (
              <div className="bg-surface rounded-lg px-3 py-3 border border-border/50 space-y-1">
                <div className="text-2xl font-bold text-text">{result.mode === 'xy' ? `${result.value.toFixed(2)}%` : result.value.toFixed(2)}</div>
                <div className="text-xs font-mono text-text-tertiary">{result.formula}</div>
                <CopyButton text={String(result.mode === 'xy' ? `${result.value.toFixed(2)}%` : result.value.toFixed(2))} />
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4 space-y-4">
            <span className="text-xs text-text-tertiary block">Percentage Increase / Decrease</span>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-text-tertiary mb-1 block">From</label>
                <input type="number" value={fromVal} onChange={(e) => setFromVal(e.target.value)} placeholder="0"
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-text-tertiary mb-1 block">To</label>
                <input type="number" value={toVal} onChange={(e) => setToVal(e.target.value)} placeholder="0"
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>

            <button onClick={calcChange}
              className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
              Calculate Change
            </button>

            {changeResult && (
              <div className="bg-surface rounded-lg px-3 py-3 border border-border/50 space-y-1">
                <div className={`text-2xl font-bold ${changeResult.pct >= 0 ? 'text-cat-success' : 'text-cat-text'}`}>
                  {changeResult.pct >= 0 ? '+' : ''}{changeResult.pct.toFixed(2)}%
                </div>
                <div className="text-xs text-text-tertiary">
                  Change: {changeResult.diff >= 0 ? '+' : ''}{changeResult.diff.toFixed(2)}
                </div>
                <div className="text-xs font-mono text-text-tertiary">
                  (({changeResult.to} - {changeResult.from}) / {changeResult.from}) × 100 = {changeResult.pct.toFixed(2)}%
                </div>
                <CopyButton text={`${changeResult.pct >= 0 ? '+' : ''}${changeResult.pct.toFixed(2)}%`} />
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
