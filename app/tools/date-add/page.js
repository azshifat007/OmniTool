'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function DateAddPage() {
  const { addEntry } = useHistory();
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [amount, setAmount] = useState(7);
  const [unit, setUnit] = useState('days');
  const [mode, setMode] = useState('add');
  const [result, setResult] = useState(null);

  const handleCalc = useCallback(() => {
    if (!startDate) return;
    addEntry('Date Add/Subtract');
    const d = new Date(startDate);
    const sign = mode === 'add' ? 1 : -1;
    const units = {
      days: () => d.setDate(d.getDate() + sign * amount),
      weeks: () => d.setDate(d.getDate() + sign * amount * 7),
      months: () => d.setMonth(d.getMonth() + sign * amount),
      years: () => d.setFullYear(d.getFullYear() + sign * amount),
    };
    units[unit]();
    const end = d;
    const diffMs = end.getTime() - new Date(startDate).getTime();
    const diffDays = Math.round(Math.abs(diffMs) / 86400000);

    setResult({
      start: new Date(startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      end: end.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      iso: end.toISOString().split('T')[0],
      diffDays,
    });
  }, [startDate, amount, unit, mode, addEntry]);

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">⇆</span>
        <h1 className="font-heading text-2xl font-bold text-text">Date Add/Subtract</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            {['add', 'subtract'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  mode === m ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                }`}>
                {m === 'add' ? 'Add' : 'Subtract'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label>
              <span className="text-xs text-text-tertiary block mb-1">Start Date</span>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" />
            </label>
            <label>
              <span className="text-xs text-text-tertiary block mb-1">Amount</span>
              <input type="number" min={1} value={amount} onChange={e => setAmount(Number(e.target.value))}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" />
            </label>
            <label>
              <span className="text-xs text-text-tertiary block mb-1">Unit</span>
              <select value={unit} onChange={e => setUnit(e.target.value)}
                className="w-full bg-surface rounded-lg px-2 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none cursor-pointer">
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </label>
          </div>
          <button onClick={handleCalc}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
            Calculate
          </button>
        </div>
      </GlassCard>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
          <GlassCard>
            <div className="p-4 space-y-4">
              <div className="text-center p-4 bg-surface rounded-xl border border-border">
                <div className="text-xs text-text-tertiary mb-1">Result</div>
                <div className="text-xl font-bold font-heading text-text">{result.end}</div>
                <div className="text-sm text-text-secondary mt-1">({result.iso})</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <div className="text-xs text-text-tertiary mb-1">Start</div>
                  <div className="text-sm font-medium text-text">{result.start}</div>
                </div>
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <div className="text-xs text-text-tertiary mb-1">Difference</div>
                  <div className="text-sm font-medium text-text">{result.diffDays} day{result.diffDays !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <div className="flex justify-center">
                <CopyButton text={result.iso} />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
