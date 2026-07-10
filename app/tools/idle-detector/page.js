'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function IdleDetectorPage() {
  const { addEntry } = useHistory();
  const [idleTime, setIdleTime] = useState(0);
  const [tracking, setTracking] = useState(true);
  const lastActivity = useRef(Date.now());

  const resetIdle = useCallback(() => {
    lastActivity.current = Date.now();
  }, []);

  useEffect(() => {
    addEntry('Idle Detector');
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, resetIdle));
    const timer = setInterval(() => {
      if (tracking) setIdleTime(Date.now() - lastActivity.current);
    }, 200);
    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdle));
      clearInterval(timer);
    };
  }, [tracking, resetIdle, addEntry]);

  const fmt = (ms) => {
    const secs = Math.floor(ms / 1000);
    const mins = Math.floor(secs / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m ${secs % 60}s`;
    if (mins > 0) return `${mins}m ${secs % 60}s`;
    return `${secs}s`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">⏸</span>
        <h1 className="font-heading text-2xl font-bold text-text">Idle Detector</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-md mx-auto space-y-4 text-center">
          <p className="text-sm text-text-secondary">Tracks how long you&apos;ve been idle (no mouse, keyboard, or touch activity).</p>
          <div className="text-5xl font-bold font-heading text-text py-4">{fmt(idleTime)}</div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-surface rounded-xl px-3 py-2.5 border border-border/50">
              <div className="text-xs text-text-tertiary">Minutes</div>
              <div className="text-lg font-semibold text-text">{Math.floor(idleTime / 60000)}</div>
            </div>
            <div className="bg-surface rounded-xl px-3 py-2.5 border border-border/50">
              <div className="text-xs text-text-tertiary">Seconds</div>
              <div className="text-lg font-semibold text-text">{Math.floor((idleTime % 60000) / 1000)}</div>
            </div>
            <div className="bg-surface rounded-xl px-3 py-2.5 border border-border/50">
              <div className="text-xs text-text-tertiary">Status</div>
              <div className="text-lg font-semibold text-text">{idleTime > 30000 ? '💤' : '🟢'}</div>
            </div>
          </div>
          <div className="flex justify-center gap-3">
            <button onClick={resetIdle} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Reset</button>
            <button onClick={() => setTracking(!tracking)} className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${tracking ? 'bg-surface text-text border-border' : 'bg-cat-text/10 text-cat-text border-cat-text/20'}`}>{tracking ? 'Pause' : 'Resume'}</button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
