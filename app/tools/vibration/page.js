'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const PATTERNS = [
  { label: 'Short Buzz', pattern: [100] },
  { label: 'Double Tap', pattern: [100, 80, 100] },
  { label: 'Triple Tap', pattern: [100, 80, 100, 80, 100] },
  { label: 'SOS', pattern: [100, 200, 100, 200, 100, 200, 100, 200, 100, 200, 300, 200, 300, 200, 300, 200, 100, 200, 100, 200, 100] },
  { label: 'Heartbeat', pattern: [200, 100, 200, 500] },
  { label: 'Rising', pattern: [100, 100, 200, 100, 300, 100, 400] },
  { label: 'Long Buzz', pattern: [1000] },
  { label: 'Staccato', pattern: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50] },
];

export default function VibrationPage() {
  const { addEntry } = useHistory();
  const [custom, setCustom] = useState('200, 100, 300');
  const [supported] = useState(typeof navigator !== 'undefined' && 'vibrate' in navigator);

  const vibrate = useCallback((pattern) => {
    addEntry('Vibration Tester');
    if (!supported) return;
    navigator.vibrate(pattern);
  }, [supported, addEntry]);

  const vibrateCustom = useCallback(() => {
    addEntry('Vibration Tester');
    if (!supported) return;
    const parsed = custom.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n >= 0);
    if (parsed.length === 0) return;
    navigator.vibrate(parsed);
  }, [custom, supported, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">📳</span>
        <h1 className="font-heading text-2xl font-bold text-text">Vibration Tester</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          {!supported ? (
            <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20 text-center">Vibration API not supported in this browser (mobile devices only).</div>
          ) : (
            <>
              <p className="text-sm text-text-secondary text-center">Test device vibration patterns on supported mobile devices.</p>
              <div className="grid grid-cols-2 gap-2">
                {PATTERNS.map(p => (
                  <button key={p.label} onClick={() => vibrate(p.pattern)}
                    className="px-3 py-3 text-sm font-medium rounded-lg bg-surface border border-border text-text-secondary hover:text-text hover:border-primary transition-all cursor-pointer">{p.label}</button>
                ))}
              </div>
              <hr className="border-border/50" />
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Custom Pattern (comma-separated ms)</label>
                <div className="flex gap-2">
                  <input value={custom} onChange={(e) => setCustom(e.target.value)}
                    className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                  <button onClick={vibrateCustom} className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Vibrate</button>
                </div>
              </div>
              <div className="text-xs text-text-tertiary text-center">
                Pattern format: vibrate for ms, pause, vibrate... e.g. <code className="text-text">200, 100, 300</code>
              </div>
            </>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
