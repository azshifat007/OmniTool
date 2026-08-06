'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function EventCountdownPage() {
  const { addEntry } = useHistory();
  const [target, setTarget] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  });
  const [label, setLabel] = useState('Next Week');
  const [remaining, setRemaining] = useState(null);
  const [live, setLive] = useState(null);

  const calculate = useCallback(() => {
    const t = new Date(target);
    if (isNaN(t)) return;
    const now = Date.now();
    const diff = t.getTime() - now;
    if (diff <= 0) { setRemaining('Event passed!'); setLive(null); return; }
    setRemaining(null);
    addEntry('Event Countdown');
  }, [target, addEntry]);

  useEffect(() => {
    const t = new Date(target);
    if (isNaN(t)) return;
    const interval = setInterval(() => {
      const diff = t.getTime() - Date.now();
      if (diff <= 0) { setLive(null); clearInterval(interval); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLive({ d, h, m, s });
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">⏳</span>
        <h1 className="font-heading text-2xl font-bold text-text">Event Countdown</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4 max-w-md mx-auto">
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Label</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Target Date & Time</label>
            <input type="datetime-local" value={target} onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          </div>
          <button onClick={calculate} className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Start Countdown</button>
          {live && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-3 pt-2">
              <div className="text-sm font-medium text-text-secondary">{label}</div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { v: live.d, l: 'Days' },
                  { v: live.h, l: 'Hours' },
                  { v: live.m, l: 'Minutes' },
                  { v: live.s, l: 'Seconds' },
                ].map(u => (
                  <div key={u.l} className="bg-surface rounded-xl px-2 py-3 border border-border/50">
                    <div className="text-2xl sm:text-3xl font-bold font-heading text-text">{String(u.v).padStart(2, '0')}</div>
                    <div className="text-[10px] text-text-tertiary mt-1 uppercase tracking-wider">{u.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {remaining && <div className="text-cat-text text-sm text-center">{remaining}</div>}
        </div>
      </GlassCard>
    </motion.div>
  );
}
