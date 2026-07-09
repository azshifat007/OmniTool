'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

function pad(n) { return n.toString().padStart(2, '0'); }

export default function CountdownPage() {
  const [total, setTotal] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const start = useCallback(() => {
    if (remaining <= 0) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setRunning(false);
          beep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [remaining]);

  const pause = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    setRemaining(total);
  }, [total]);

  const setPreset = (seconds) => {
    setTotal(seconds);
    setRemaining(seconds);
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
  };

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const progress = total > 0 ? (remaining / total) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">⏳</span>
        <h1 className="font-heading text-2xl font-bold text-text">Countdown Timer</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex justify-center">
            <div className="text-6xl sm:text-7xl font-bold font-mono tracking-widest text-text tabular-nums">
              {pad(h)}:{pad(m)}:{pad(s)}
            </div>
          </div>
          {total > 0 && (
            <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }} />
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            {[30, 60, 120, 300, 600].map(sec => (
              <button key={sec} onClick={() => setPreset(sec)} disabled={running}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            <div>
              <label className="text-xs text-text-tertiary block text-center">Hours</label>
              <input type="number" min={0} max={99} value={Math.floor(total / 3600)}
                onChange={e => { const v = (parseInt(e.target.value) || 0) * 3600 + (total % 3600); setTotal(v); setRemaining(v); }}
                disabled={running}
                className="w-full bg-surface text-text text-center rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-primary/50 disabled:opacity-40" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary block text-center">Minutes</label>
              <input type="number" min={0} max={59} value={Math.floor((total % 3600) / 60)}
                onChange={e => { const v = Math.floor(total / 3600) * 3600 + ((parseInt(e.target.value) || 0) * 60) + (total % 60); setTotal(v); setRemaining(v); }}
                disabled={running}
                className="w-full bg-surface text-text text-center rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-primary/50 disabled:opacity-40" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary block text-center">Seconds</label>
              <input type="number" min={0} max={59} value={total % 60}
                onChange={e => { const v = Math.floor(total / 60) * 60 + (parseInt(e.target.value) || 0); setTotal(v); setRemaining(v); }}
                disabled={running}
                className="w-full bg-surface text-text text-center rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-primary/50 disabled:opacity-40" />
            </div>
          </div>
          <div className="flex justify-center gap-2">
            {!running ? (
              <button onClick={start} disabled={remaining <= 0}
                className="px-5 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                Start
              </button>
            ) : (
              <button onClick={pause}
                className="px-5 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 transition-all cursor-pointer">
                Pause
              </button>
            )}
            <button onClick={reset} disabled={total === 0}
              className="px-5 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
              Reset
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
