'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

function calcElapsed(start) {
  const diff = Date.now() - start;
  if (diff < 0) return { days: 0, hours: 0, mins: 0, secs: 0, totalMs: 0 };
  const secs = Math.floor(diff / 1000);
  return {
    days: Math.floor(secs / 86400),
    hours: Math.floor((secs % 86400) / 3600),
    mins: Math.floor((secs % 3600) / 60),
    secs: secs % 60,
    totalMs: diff,
  };
}

export default function CountupPage() {
  const { addEntry } = useHistory();
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() - 2);
    return d.toISOString().slice(0, 16);
  });
  const [start, setStart] = useState(null);
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => { addEntry('Countup Timer'); }, [addEntry]);

  useEffect(() => {
    if (!start) return;
    const timer = setInterval(() => setElapsed(calcElapsed(start)), 100);
    return () => clearInterval(timer);
  }, [start]);

  const handleStart = useCallback(() => {
    const d = new Date(targetDate);
    if (isNaN(d.getTime())) return;
    setStart(d.getTime());
  }, [targetDate]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">⏱</span>
        <h1 className="font-heading text-2xl font-bold text-text">Countup Timer</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-md mx-auto space-y-4 text-center">
          <p className="text-sm text-text-secondary">Count time elapsed since a specific date and time.</p>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Start Date & Time</label>
            <input type="datetime-local" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          </div>
          <button onClick={handleStart} className="px-6 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Start Countup</button>
          {start && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
              <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
                {[
                  { label: 'Days', value: elapsed.days },
                  { label: 'Hours', value: elapsed.hours },
                  { label: 'Mins', value: elapsed.mins },
                  { label: 'Secs', value: elapsed.secs },
                ].map(u => (
                  <div key={u.label} className="bg-surface rounded-xl px-3 py-3 border border-border/50">
                    <div className="text-2xl font-bold font-heading text-text">{String(u.value).padStart(2, '0')}</div>
                    <div className="text-[10px] text-text-tertiary">{u.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-text-tertiary">
                Since {new Date(start).toLocaleString()}
              </div>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
