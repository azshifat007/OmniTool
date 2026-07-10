'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function DayCounterPage() {
  const { addEntry } = useHistory();
  const [start, setStart] = useState('2024-01-01');
  const [end, setEnd] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState(null);

  const calc = useCallback(() => {
    addEntry('Day Counter');
    if (!start || !end) return;
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.abs(e - s);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = days / 7;
    const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    const years = diff / (1000 * 60 * 60 * 24 * 365.25);
    const weekdays = Array.from({ length: days + 1 }, (_, i) => {
      const d = new Date(s.getTime() + i * 86400000);
      return d.getDay();
    }).filter(d => d !== 0 && d !== 6).length;
    setResult({
      days,
      weeks: Math.round(weeks * 10) / 10,
      months: Math.abs(months),
      years: Math.round(years * 10) / 10,
      weekdays,
      weekends: days + 1 - weekdays,
      hours: days * 24,
      minutes: days * 1440,
    });
  }, [start, end, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">⇆</span>
        <h1 className="font-heading text-2xl font-bold text-text">Day Counter</h1>
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
          <button onClick={calc} className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Calculate</button>
          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <div className="text-center text-4xl font-bold font-heading text-text py-2">{result.days} <span className="text-lg text-text-secondary font-normal">days</span></div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Weeks', result.weeks, 'wks'],
                  ['Months', result.months, 'mo'],
                  ['Years', result.years, 'yrs'],
                  ['Weekdays', result.weekdays, ''],
                  ['Weekends', result.weekends, ''],
                  ['Hours', result.hours.toLocaleString(), ''],
                  ['Minutes', result.minutes.toLocaleString(), ''],
                ].map(([label, val, unit]) => (
                  <div key={label} className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                    <span className="text-text-tertiary">{label}</span>
                    <span className="font-mono text-text">{val}{unit && <span className="text-text-tertiary text-xs"> {unit}</span>}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
