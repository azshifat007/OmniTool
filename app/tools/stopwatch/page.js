'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

function pad(n, d = 2) { return n.toString().padStart(d, '0'); }

function formatTime(ms) {
  return `${pad(Math.floor(ms / 60000))}:${pad(Math.floor(ms / 1000) % 60)}.${pad(Math.floor(ms % 1000 / 10), 2)}`;
}

export default function StopwatchPage() {
  const { addEntry } = useHistory();
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

  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); running ? pause() : start(); }
      if (e.code === 'KeyL') lap();
      if (e.code === 'KeyR') reset();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [running, lap, reset]);

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

  const lapStats = laps.length > 1 ? (() => {
    const times = laps.map(l => l.lap);
    const best = Math.min(...times);
    const worst = Math.max(...times);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    return { best, worst, avg };
  })() : null;

  const exportLaps = useCallback(() => {
    const csv = 'Lap,Time,Cumulative\n' + laps.map(l => `${l.index},${formatTime(l.lap)},${formatTime(l.cumulative)}`).join('\n');
    navigator.clipboard.writeText(csv);
    addEntry('Stopwatch');
  }, [laps, addEntry]);

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
            {laps.length > 0 && (
              <div className="text-xs text-text-tertiary mt-2">
                Last lap: {formatTime(laps[laps.length - 1].lap)}
              </div>
            )}
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
          <div className="flex justify-center">
            <span className="text-[10px] text-text-tertiary">Space: start/pause · L: lap · R: reset</span>
          </div>
        </div>
      </GlassCard>

      {lapStats && (
        <GlassCard>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                <div className="text-[10px] text-text-tertiary">Best Lap</div>
                <div className="text-sm font-mono font-bold text-cat-success">{formatTime(lapStats.best)}</div>
              </div>
              <div className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                <div className="text-[10px] text-text-tertiary">Average</div>
                <div className="text-sm font-mono font-bold text-text">{formatTime(lapStats.avg)}</div>
              </div>
              <div className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                <div className="text-[10px] text-text-tertiary">Worst Lap</div>
                <div className="text-sm font-mono font-bold text-cat-text">{formatTime(lapStats.worst)}</div>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {laps.length > 0 && (
        <GlassCard>
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary font-semibold uppercase tracking-wide">Laps ({laps.length})</span>
              <button onClick={exportLaps}
                className="text-[10px] text-text-tertiary hover:text-text transition-colors cursor-pointer">Export CSV</button>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {[...laps].reverse().map(l => {
                const isBest = lapStats && l.lap === lapStats.best;
                const isWorst = lapStats && l.lap === lapStats.worst && laps.length > 2;
                return (
                  <div key={l.index} className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm border ${
                    isBest ? 'bg-cat-success/10 border-cat-success/20' :
                    isWorst ? 'bg-cat-text/10 border-cat-text/20' :
                    'bg-surface border-border/50'
                  }`}>
                    <span className="flex items-center gap-2">
                      <span className="text-text-tertiary">Lap {l.index}</span>
                      {isBest && <span className="text-[9px] px-1.5 py-0.5 rounded bg-cat-success/20 text-cat-success font-semibold">BEST</span>}
                      {isWorst && <span className="text-[9px] px-1.5 py-0.5 rounded bg-cat-text/20 text-cat-text font-semibold">SLOW</span>}
                    </span>
                    <span className={`font-mono tabular-nums ${isBest ? 'text-cat-success' : isWorst ? 'text-cat-text' : 'text-text'}`}>{formatTime(l.lap)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
