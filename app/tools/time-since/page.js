'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

function timeSince(date) {
  const now = new Date();
  const diff = Math.abs(now - date);
  const sign = now >= date ? 'ago' : 'from now';
  const abs = Math.abs(now - date);
  const units = [
    { name: 'year', ms: 31557600000 },
    { name: 'month', ms: 2629800000 },
    { name: 'week', ms: 604800000 },
    { name: 'day', ms: 86400000 },
    { name: 'hour', ms: 3600000 },
    { name: 'minute', ms: 60000 },
    { name: 'second', ms: 1000 },
  ];
  const parts = [];
  let remaining = abs;
  for (const u of units) {
    const count = Math.floor(remaining / u.ms);
    if (count > 0) {
      parts.push(`${count} ${u.name}${count > 1 ? 's' : ''}`);
      remaining -= count * u.ms;
    }
    if (parts.length >= 3) break;
  }
  if (parts.length === 0) return 'Just now';
  return parts.join(', ') + ' ' + sign;
}

export default function TimeSincePage() {
  const { addEntry } = useHistory();
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split('T')[0];
  });
  const [result, setResult] = useState('');

  const calc = useCallback(() => {
    addEntry('Time Since');
    if (!date) return;
    const d = new Date(date + 'T12:00:00');
    setResult(timeSince(d));
  }, [date, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">⏱</span>
        <h1 className="font-heading text-2xl font-bold text-text">Time Since</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Find out how much time has passed (or will pass) from a given date.</p>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          </div>
          <button onClick={calc} className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Calculate</button>
          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center pt-2">
              <div className="text-2xl font-bold font-heading text-text">{result}</div>
              <div className="text-xs text-text-tertiary mt-1">from {new Date(date + 'T12:00:00').toLocaleDateString()}</div>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
