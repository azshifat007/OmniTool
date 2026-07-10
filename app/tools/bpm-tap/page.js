'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function BpmTapPage() {
  const { addEntry } = useHistory();
  const [bpm, setBpm] = useState(null);
  const [taps, setTaps] = useState([]);
  const [status, setStatus] = useState('idle');
  const times = useRef([]);
  const timer = useRef(null);

  const handleTap = useCallback(() => {
    const now = Date.now();
    times.current = times.current.filter(t => now - t < 5000);
    times.current.push(now);
    setTaps([...times.current]);

    if (times.current.length < 2) { setStatus('tap more'); return; }

    const intervals = [];
    for (let i = 1; i < times.current.length; i++) {
      intervals.push(times.current[i] - times.current[i - 1]);
    }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const calculated = Math.round(60000 / avg);
    setBpm(Math.min(Math.max(calculated, 30), 300));
    setStatus('tapping');
    addEntry('BPM Tapper');

    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setStatus('idle');
    }, 2000);
  }, [addEntry]);

  const handleReset = useCallback(() => {
    times.current = [];
    setTaps([]);
    setBpm(null);
    setStatus('idle');
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">♩</span>
        <h1 className="font-heading text-2xl font-bold text-text">BPM Tapper</h1>
      </div>

      <GlassCard>
        <div className="p-8 flex flex-col items-center gap-6">
          <button
            onClick={handleTap}
            className="w-48 h-48 rounded-full bg-primary/10 border-2 border-primary/30 text-primary text-6xl hover:bg-primary/20 hover:border-primary/50 active:scale-95 transition-all cursor-pointer select-none flex items-center justify-center"
          >
            ♩
          </button>
          <div className="text-center">
            {bpm ? (
              <div className="text-6xl font-bold font-heading text-text tabular-nums animate-fade-up">
                {bpm}
              </div>
            ) : (
              <div className="text-lg text-text-secondary">
                {status === 'idle' ? 'Tap the circle to start' : status === 'tap more' ? 'Keep tapping...' : ''}
              </div>
            )}
            <div className="text-sm text-text-tertiary mt-1">BPM</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-text-tertiary">
              {taps.length} tap{taps.length !== 1 ? 's' : ''}
              {taps.length > 1 && bpm ? ` · ${Math.round(60000 / ((taps[taps.length - 1] - taps[0]) / (taps.length - 1)))} BPM avg` : ''}
            </div>
            {taps.length > 0 && (
              <button onClick={handleReset} className="text-xs px-3 py-1.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-text cursor-pointer transition-colors">
                Reset
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="mt-5">
        <div className="p-4">
          <div className="text-xs text-text-tertiary mb-2">Tap History (last 5 seconds)</div>
          <div className="flex items-end gap-1 h-16">
            {taps.slice(-20).map((t, i) => {
              const h = i > 0 ? Math.min(100, ((t - taps[taps.length - 1]) * -1) / 50) : 0;
              return <div key={i} className="flex-1 bg-primary/30 rounded-t" style={{ height: `${Math.max(h, 4)}%` }} />;
            })}
            {taps.length === 0 && <div className="text-xs text-text-tertiary w-full text-center pt-6">No taps yet</div>}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
