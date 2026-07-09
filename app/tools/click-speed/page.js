'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function ClickSpeedPage() {
  const { addEntry } = useHistory();
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [duration, setDuration] = useState(5);
  const timerRef = useRef(null);

  const start = useCallback(() => {
    setCount(0);
    setRunning(true);
    setResult(null);
    addEntry('Click Speed Test');
    const end = Date.now() + duration * 1000;
    timerRef.current = setInterval(() => {
      if (Date.now() >= end) {
        clearInterval(timerRef.current);
        setRunning(false);
      }
    }, 50);
  }, [duration, addEntry]);

  const handleClick = () => {
    if (!running) { start(); return; }
    setCount((c) => c + 1);
  };

  const stopEarly = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    setResult({ clicks: count, cps: (count / duration).toFixed(1) });
  };

  if (!running && count > 0 && !result) {
    const elapsed = duration;
    setResult({ clicks: count, cps: (count / elapsed).toFixed(1) });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">◎</span>
        <h1 className="font-heading text-2xl font-bold text-text">Click Speed Test</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-6 flex flex-col items-center gap-6">
            {!running && !result && (
              <div className="flex gap-2">
                {[5, 10, 15, 30].map((t) => (
                  <button key={t} onClick={() => setDuration(t)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${duration === t ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'}`}>{t}s</button>
                ))}
              </div>
            )}

            <button onClick={handleClick} disabled={running && result}
              className="w-48 h-48 rounded-full text-4xl font-bold bg-primary text-white hover:bg-primary-dark active:scale-95 transition-all shadow-lg cursor-pointer select-none">
              {running ? count : result ? 'Again' : 'Start'}
            </button>

            {running && (
              <button onClick={stopEarly} className="text-xs text-cat-text hover:underline cursor-pointer">Stop early</button>
            )}

            {running && (
              <div className="text-6xl font-mono font-bold text-text">{count}</div>
            )}
          </div>
        </GlassCard>

        <div className="space-y-4">
          {result && (
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-3 block">Results</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface rounded-lg p-4 border border-border text-center">
                    <div className="text-[10px] text-text-tertiary mb-1">Clicks</div>
                    <div className="text-3xl font-mono font-bold text-text">{result.clicks}</div>
                  </div>
                  <div className="bg-surface rounded-lg p-4 border border-border text-center">
                    <div className="text-[10px] text-text-tertiary mb-1">CPS</div>
                    <div className="text-3xl font-mono font-bold text-text">{result.cps}</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Leaderboard</span>
              <div className="space-y-1 text-[11px] text-text-secondary leading-relaxed">
                <div>• 5-8 CPS: Average</div>
                <div>• 8-10 CPS: Good</div>
                <div>• 10-12 CPS: Fast</div>
                <div>• 12+ CPS: Pro</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
