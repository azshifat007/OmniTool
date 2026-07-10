'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function UptimePage() {
  const { addEntry } = useHistory();
  const [url, setUrl] = useState('');
  const [checks, setChecks] = useState([]);
  const [checking, setChecking] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [intervalId]);

  const doCheck = useCallback(async (target) => {
    const start = performance.now();
    try {
      const res = await fetch(target, { method: 'HEAD', mode: 'no-cors' });
      const ms = Math.round(performance.now() - start);
      return { time: ms, status: 'up', ts: new Date().toISOString() };
    } catch {
      const ms = Math.round(performance.now() - start);
      return { time: ms, status: 'down', ts: new Date().toISOString() };
    }
  }, []);

  const handleStart = useCallback(async () => {
    if (!url.trim()) return;
    addEntry('Uptime Monitor');
    const target = url.startsWith('http') ? url : `https://${url}`;
    const first = await doCheck(target);
    setChecks([first]);
    setChecking(true);
    const id = setInterval(async () => {
      const r = await doCheck(target);
      setChecks(prev => [...prev.slice(-59), r]);
    }, 5000);
    setIntervalId(id);
  }, [url, doCheck, addEntry]);

  const handleStop = useCallback(() => {
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
    setChecking(false);
  }, [intervalId]);

  const upCount = checks.filter(c => c.status === 'up').length;
  const uptime = checks.length > 0 ? (upCount / checks.length * 100).toFixed(1) : 100;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-devops">📡</span>
        <h1 className="font-heading text-2xl font-bold text-text">Uptime Monitor</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <div className="flex gap-3">
            <input type="text" value={url} onChange={e => setUrl(e.target.value)}
              placeholder="example.com"
              disabled={checking}
              className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors disabled:opacity-50" />
            {checking ? (
              <button onClick={handleStop}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-cat-text text-white hover:opacity-90 transition-all cursor-pointer">
                Stop
              </button>
            ) : (
              <button onClick={handleStart} disabled={!url.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 transition-all cursor-pointer">
                Start
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {checks.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 space-y-4">
          <GlassCard>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <div className="text-lg font-bold font-heading text-text">{checks.length}</div>
                  <div className="text-xs text-text-tertiary mt-1">Checks</div>
                </div>
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <div className="text-lg font-bold font-heading text-cat-success">{uptime}%</div>
                  <div className="text-xs text-text-tertiary mt-1">Uptime</div>
                </div>
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <div className="text-lg font-bold font-heading text-text">{upCount}/{checks.length}</div>
                  <div className="text-xs text-text-tertiary mt-1">Up/Total</div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary block mb-3">Recent Checks (last 60)</span>
              <div className="flex items-end gap-0.5 h-12">
                {checks.slice(-60).map((c, i) => (
                  <div key={i} key={c.ts + i} className="flex-1 rounded-t"
                    style={{
                      height: `${c.status === 'up' ? Math.min(100, Math.max(20, 100 - c.time / 10)) : 10}%`,
                      backgroundColor: c.status === 'up' ? 'var(--color-cat-success)' : 'var(--color-cat-text)',
                      opacity: 0.7 + (i / checks.length) * 0.3,
                    }}
                    title={`${c.status === 'up' ? c.time + 'ms' : 'Down'}`} />
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
