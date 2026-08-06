'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function generateNumbers(min, max, count, integers) {
  const results = [];
  for (let i = 0; i < count; i++) {
    const val = integers
      ? Math.floor(Math.random() * (max - min + 1)) + min
      : Math.random() * (max - min) + min;
    results.push(integers ? val : parseFloat(val.toFixed(4)));
  }
  return results;
}

export default function RandomPage() {
  const { addEntry } = useHistory();
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [integers, setIntegers] = useState(true);
  const [count, setCount] = useState(5);
  const [numbers, setNumbers] = useState(null);

  const handleGenerate = useCallback(() => {
    const mn = parseFloat(min);
    const mx = parseFloat(max);
    if (isNaN(mn) || isNaN(mx) || mn >= mx) return;
    const nums = generateNumbers(mn, mx, count, integers);
    setNumbers(nums);
    addEntry('Random Number Generator');
  }, [min, max, count, integers, addEntry]);

  const stats = numbers ? {
    sum: numbers.reduce((a, b) => a + b, 0),
    avg: numbers.reduce((a, b) => a + b, 0) / numbers.length,
    min: Math.min(...numbers),
    max: Math.max(...numbers),
  } : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">🎲</span>
        <h1 className="font-heading text-2xl font-bold text-text">Random Number Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-text-tertiary mb-1 block">Min</label>
                <input type="number" value={min} onChange={(e) => setMin(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-text-tertiary mb-1 block">Max</label>
                <input type="number" value={max} onChange={(e) => setMax(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>

            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Count: {count}</label>
              <input type="range" min={1} max={50} value={count} onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full accent-primary cursor-pointer" />
            </div>

            <label className="flex items-center gap-2 text-xs text-text-tertiary cursor-pointer">
              <input type="checkbox" checked={integers} onChange={(e) => setIntegers(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-surface accent-primary cursor-pointer" />
              Integers only
            </label>

            <button onClick={handleGenerate}
              className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
              Generate
            </button>
          </div>
        </GlassCard>

        {numbers && (
          <div className="space-y-5">
            <GlassCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-tertiary">Generated Numbers ({numbers.length})</span>
                  <div className="flex gap-2">
                    <CopyButton text={numbers.join(', ')} />
                    <button onClick={handleGenerate}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 hover:text-text transition-all cursor-pointer">
                      Regenerate
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {numbers.map((n, i) => (
                    <div key={i} className="bg-surface rounded-lg px-2 py-2 text-center text-sm font-mono text-text border border-border/50">
                      {integers ? n : n.toFixed(4)}
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-3 block">Statistics</span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Sum', value: integers ? stats.sum : stats.sum.toFixed(4) },
                    { label: 'Average', value: integers ? Math.round(stats.avg) : stats.avg.toFixed(4) },
                    { label: 'Min', value: integers ? stats.min : stats.min.toFixed(4) },
                    { label: 'Max', value: integers ? stats.max : stats.max.toFixed(4) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                      <div className="text-xs text-text-tertiary">{label}</div>
                      <div className="text-sm font-mono text-text font-bold">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </motion.div>
  );
}
