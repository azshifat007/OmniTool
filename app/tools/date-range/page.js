'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function DateRangePage() {
  const { addEntry } = useHistory();
  const [start, setStart] = useState('2024-01-01');
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState(null);

  const calculate = useCallback(() => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (isNaN(d1) || isNaN(d2)) return;
    const ms = Math.abs(d2 - d1);
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const days = Math.floor(hr / 24);
    const weeks = Math.floor(days / 7);
    const months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    const years = Math.floor(months / 12);
    setResult({ ms, sec, min, hr, days, weeks, months, years });
    addEntry('Date Range Calculator');
  }, [start, end, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">⇆</span>
        <h1 className="font-heading text-2xl font-bold text-text">Date Range Calculator</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Start Date</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">End Date</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
          </div>
          <button onClick={calculate} className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Calculate</button>
          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5 pt-2">
              {[
                { label: 'Years', value: result.years },
                { label: 'Months', value: result.months },
                { label: 'Weeks', value: result.weeks },
                { label: 'Days', value: result.days.toLocaleString() },
                { label: 'Hours', value: result.hr.toLocaleString() },
                { label: 'Minutes', value: result.min.toLocaleString() },
                { label: 'Seconds', value: result.sec.toLocaleString() },
                { label: 'Milliseconds', value: result.ms.toLocaleString() },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                  <span className="text-text-tertiary">{r.label}</span>
                  <span className="font-mono font-semibold text-text">{r.value}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
