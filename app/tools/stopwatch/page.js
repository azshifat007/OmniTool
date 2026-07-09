'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

function pad(n, d = 2) { return n.toString().padStart(d, '0'); }

export default function StopwatchPage() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const startRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now() - time;
    const interval = setInterval(() => setTime(Date.now() - startRef.current), 10);
    return () => clearInterval(interval);
  }, [running]);

  const start = () => setRunning(true);
  const pause = () => setRunning(false);
  const reset = useCallback(() => { setRunning(false); setTime(0); setLaps([]); }, []);
  const lap = useCallback(() => {
    if (!running) return;
    const prev = laps.length ? laps[laps.length - 1].cumulative : 0;
    setLaps(p => [...p, { lap: time - prev, cumulative: time, index: p.length + 1 }]);
  }, [running, time, laps]);

  const ms = time % 1000;
  const s = Math.floor(time / 1000) % 60;
  const m = Math.floor(time / 60000) % 60;
  const h = Math.floor(time / 3600000);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">⌚</span>
        <h1 className="font-heading text-2xl font-bold text-text">Stopwatch</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="text-center">
            <div className="text-5xl sm:text-6xl font-mono font-bold tracking-widest text-text tabular-nums">
              {pad(h)}:{pad(m)}:{pad(s)}.<span className="text-3xl sm:text-4xl">{pad(Math.floor(ms / 10), 2)}</span>
            </div>
          </div>
          <div className="flex justify-center gap-2">
            {!running ? (
              <button onClick={start}
                className="px-5 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
                {time === 0 ? 'Start' : 'Resume'}
              </button>
            ) : (
              <button onClick={pause}
                className="px-5 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 transition-all cursor-pointer">
                Pause
              </button>
            )}
            <button onClick={lap} disabled={!running}
              className="px-5 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
              Lap
            </button>
            <button onClick={reset} disabled={time === 0}
              className="px-5 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
              Reset
            </button>
          </div>
        </div>
      </GlassCard>
      {laps.length > 0 && (
        <GlassCard>
          <div className="p-3">
            <div className="text-xs text-text-tertiary mb-2 font-semibold uppercase tracking-wide">Laps</div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {[...laps].reverse().map(l => (
                <div key={l.index} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface text-sm text-text border border-border/50">
                  <span className="text-text-tertiary">Lap {l.index}</span>
                  <span className="font-mono tabular-nums">{pad(Math.floor(l.lap / 60000))}:{pad(Math.floor(l.lap / 1000) % 60)}.{pad(Math.floor(l.lap % 1000 / 10), 2)}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
