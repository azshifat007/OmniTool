'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const PATTERNS = [
  { name: 'Box (4-4-4-4)', inhale: 4, hold: 4, exhale: 4, rest: 4 },
  { name: 'Relaxing (4-7-8)', inhale: 4, hold: 7, exhale: 8, rest: 0 },
  { name: 'Energizing (4-2-4)', inhale: 4, hold: 2, exhale: 4, rest: 0 },
  { name: 'Calm (5-5)', inhale: 5, hold: 0, exhale: 5, rest: 0 },
  { name: 'Deep (4-4-6-2)', inhale: 4, hold: 4, exhale: 6, rest: 2 },
];

export default function BreathingPage() {
  const { addEntry } = useHistory();
  const [pattern, setPattern] = useState(PATTERNS[0]);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState('inhale');
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef(null);

  const start = useCallback(() => {
    setRunning(true);
    setCount(pattern.inhale);
    setPhase('inhale');
    setCycles(0);
    addEntry('Breathing Exercise');
  }, [pattern, addEntry]);

  const stop = useCallback(() => {
    setRunning(false);
    setPhase('inhale');
    setCount(0);
    setCycles(0);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    if (!running) return;
    let remaining = pattern.inhale;
    let currentPhase = 'inhale';
    let cycleCount = 0;

    timerRef.current = setInterval(() => {
      remaining--;
      setCount(Math.max(0, remaining));
      if (remaining <= 0) {
        if (currentPhase === 'inhale') {
          currentPhase = 'hold1';
          remaining = pattern.hold;
          setPhase('hold');
        } else if (currentPhase === 'hold1') {
          currentPhase = 'exhale';
          remaining = pattern.exhale;
          setPhase('exhale');
        } else if (currentPhase === 'exhale') {
          currentPhase = 'rest';
          remaining = pattern.rest;
          setPhase('rest');
        } else {
          cycleCount++;
          setCycles(cycleCount);
          currentPhase = 'inhale';
          remaining = pattern.inhale;
          setPhase('inhale');
        }
        setCount(Math.max(0, remaining));
      }
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, pattern]);

  const maxCount = Math.max(pattern.inhale, pattern.hold, pattern.exhale, pattern.rest);
  const scale = count / (maxCount || 1);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">○</span>
        <h1 className="font-heading text-2xl font-bold text-text">Breathing Exercise</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">Pattern</label>
            <div className="flex flex-wrap gap-2">
              {PATTERNS.map((p) => (
                <button key={p.name} onClick={() => { if (!running) setPattern(p); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    pattern.name === p.name ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                  }`}>{p.name}</button>
              ))}
            </div>
            <p className="text-xs text-text-tertiary mt-4">
              Inhale {pattern.inhale}s {pattern.hold > 0 ? `| Hold ${pattern.hold}s ` : ''}| Exhale {pattern.exhale}s{pattern.rest > 0 ? ` | Rest ${pattern.rest}s` : ''}
            </p>
            <div className="flex justify-center mt-6">
              <button onClick={running ? stop : start}
                className={`w-20 h-20 rounded-full text-sm font-bold transition-all cursor-pointer ${
                  running ? 'bg-cat-text text-white hover:bg-red-600' : 'bg-primary text-white hover:bg-primary-dark'
                } shadow-lg`}>
                {running ? 'STOP' : 'START'}
              </button>
            </div>
            {running && cycles > 0 && (
              <p className="text-xs text-text-tertiary text-center mt-4">Cycles completed: {cycles}</p>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6 flex flex-col items-center justify-center min-h-[280px]">
            <motion.div
              animate={{
                scale: phase === 'inhale' ? 1 + scale * 0.5 : phase === 'hold' ? 1.5 : phase === 'exhale' ? 0.5 + scale * 0.5 : 1,
                opacity: phase === 'rest' ? 0.5 : 1,
              }}
              transition={{ duration: 0.3 }}
              className={`w-40 h-40 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-xl ${
                phase === 'inhale' ? 'bg-blue-500' : phase === 'hold' ? 'bg-amber-500' : phase === 'exhale' ? 'bg-green-500' : 'bg-slate-400'
              }`}>
              {running ? count : '--'}
            </motion.div>
            <p className="text-lg font-semibold text-text mt-4 capitalize">{running ? phase : 'Ready'}</p>
            {!running && <p className="text-xs text-text-tertiary mt-2">Press START to begin</p>}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
