'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function AlarmPage() {
  const { addEntry } = useHistory();
  const [time, setTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 1);
    return d.toTimeString().slice(0, 5);
  });
  const [label, setLabel] = useState('Wake up!');
  const [active, setActive] = useState(false);
  const [ringing, setRinging] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const startAlarm = useCallback(() => {
    addEntry('Alarm Clock');
    const [h, m] = time.split(':').map(Number);
    const now = new Date();
    let target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const diff = target - now;
    setActive(true);
    setRinging(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setRinging(true);
      setActive(false);
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        osc.type = 'sine';
        gain.gain.value = 0.3;
        osc.start();
        osc.stop(ctx.currentTime + 2);
        audioRef.current = { ctx, osc };
      } catch {}
    }, diff);
  }, [time, label, addEntry]);

  const stopAlarm = useCallback(() => {
    setRinging(false);
    setActive(false);
    if (audioRef.current) {
      try { audioRef.current.osc.stop(); } catch {}
      try { audioRef.current.ctx.close(); } catch {}
    }
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">⏰</span>
        <h1 className="font-heading text-2xl font-bold text-text">Alarm Clock</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-md mx-auto space-y-4 text-center">
          <p className="text-sm text-text-secondary">Set a one-time alarm that rings at the specified time.</p>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-2xl text-text border border-border focus:border-primary focus:outline-none transition-colors text-center font-mono" />
          </div>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Label</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors text-center" />
          </div>
          {!ringing ? (
            <button onClick={active ? stopAlarm : startAlarm}
              className={`w-full px-4 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${active ? 'bg-cat-text/10 text-cat-text border border-cat-text/20' : 'bg-primary text-white hover:bg-primary-dark'}`}>
              {active ? 'Cancel Alarm' : 'Set Alarm'}
            </button>
          ) : (
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 0.5 }} className="space-y-3">
              <div className="text-2xl font-bold text-cat-text">{label || 'Alarm!'}</div>
              <button onClick={stopAlarm} className="px-8 py-3 text-sm font-bold rounded-xl bg-cat-text text-white hover:opacity-90 transition-all cursor-pointer">STOP</button>
            </motion.div>
          )}
          {active && !ringing && (
            <div className="flex items-center justify-center gap-2 text-xs text-cat-success">
              <span className="w-2 h-2 rounded-full bg-cat-success animate-pulse" />
              Alarm set for {time}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
