'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

function pad(n) { return n.toString().padStart(2, '0'); }

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 660;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

const PHASES = {
  work: { label: 'Focus', duration: 25 * 60, color: 'var(--primary)' },
  shortBreak: { label: 'Short Break', duration: 5 * 60, color: 'var(--cat-success)' },
  longBreak: { label: 'Long Break', duration: 15 * 60, color: 'var(--cat-code)' },
};

export default function PomodoroPage() {
  const [phase, setPhase] = useState('work');
  const [remaining, setRemaining] = useState(PHASES.work.duration);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const start = useCallback(() => {
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
  }, []);

  const pause = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
  }, []);

  const skip = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    if (phase === 'work') {
      const isLongBreak = count >= 3;
      const nextPhase = isLongBreak ? 'longBreak' : 'shortBreak';
      setPhase(nextPhase);
      setRemaining(PHASES[nextPhase].duration);
      setCount(prev => isLongBreak ? 0 : prev + 1);
    } else {
      setPhase('work');
      setRemaining(PHASES.work.duration);
    }
  }, [phase, count]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    setPhase('work');
    setRemaining(PHASES.work.duration);
    setCount(0);
  }, []);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const total = PHASES[phase].duration;
  const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">⏲</span>
        <h1 className="font-heading text-2xl font-bold text-text">Pomodoro Timer</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-5">
          <div className="flex justify-center gap-2">
            {Object.entries(PHASES).map(([k, v]) => (
              <button key={k} onClick={() => { if (!running) { setPhase(k); setRemaining(v.duration); } }}
                disabled={running}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  phase === k ? 'text-white' : 'bg-surface text-text-secondary border-border hover:border-primary/40 disabled:opacity-40'
                } ${phase === k ? 'bg-primary' : ''}`}>{v.label}</button>
            ))}
          </div>
          <div className="text-center">
            <div className="text-7xl font-mono font-bold tracking-widest text-text tabular-nums">
              {pad(m)}:{pad(s)}
            </div>
            <div className="text-sm text-text-tertiary mt-1">
              {PHASES[phase].label} {count > 0 && `· #${count + 1}`}
            </div>
          </div>
          <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%`, backgroundColor: PHASES[phase].color }} />
          </div>
          <div className="flex justify-center gap-2">
            {!running ? (
              <button onClick={start} disabled={remaining <= 0}
                className="px-5 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                {remaining === total ? 'Start' : 'Resume'}
              </button>
            ) : (
              <button onClick={pause}
                className="px-5 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 transition-all cursor-pointer">
                Pause
              </button>
            )}
            <button onClick={skip}
              className="px-5 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 transition-all cursor-pointer">
              Skip
            </button>
            <button onClick={reset}
              className="px-5 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 transition-all cursor-pointer">
              Reset
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
