'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function ScreenPickerPage() {
  const { addEntry } = useHistory();
  const [color, setColor] = useState('#6C5CE7');
  const [picked, setPicked] = useState([]);
  const [error, setError] = useState('');

  const pickColor = useCallback(async () => {
    setError('');
    try {
      if (!('EyeDropper' in window)) throw new Error('EyeDropper API not supported in this browser. Try Chrome/Edge.');
      const dropper = new EyeDropper();
      const result = await dropper.open();
      setColor(result.sRGBHex);
      setPicked(p => [result.sRGBHex, ...p].slice(0, 10));
      addEntry('Screen Color Picker');
    } catch (e) {
      setError(e.message);
    }
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">◎</span>
        <h1 className="font-heading text-2xl font-bold text-text">Screen Color Picker</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 text-center space-y-4">
            <p className="text-sm text-text-secondary">Pick colors directly from your screen using the EyeDropper API.</p>
            <button onClick={pickColor}
              className="px-6 py-3 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
              Pick Color from Screen
            </button>
            {error && <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
            <div className="flex items-center justify-center gap-3 pt-2">
              <div className="w-16 h-16 rounded-xl border-2 border-border" style={{ backgroundColor: color }} />
              <div className="text-left">
                <div className="text-lg font-mono font-bold text-text">{color}</div>
                <div className="text-xs text-text-tertiary">Click button to pick</div>
              </div>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">History</span>
            {picked.length === 0 ? (
              <div className="text-sm text-text-tertiary">No colors picked yet.</div>
            ) : (
              <div className="space-y-1.5">
                {picked.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 px-3 rounded-lg bg-surface border border-border/50">
                    <div className="w-6 h-6 rounded border border-border/50" style={{ backgroundColor: c }} />
                    <span className="font-mono text-sm text-text">{c}</span>
                    {i === 0 && <span className="text-[10px] text-text-tertiary ml-auto">current</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
