'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function AveragePage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('23, 45, 67, 12, 89, 34, 55');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const calculate = useCallback(() => {
    setError('');
    const nums = input.split(/[,\s]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    if (nums.length < 2) { setError('Enter at least 2 numbers separated by commas.'); setResult(null); return; }
    const sorted = [...nums].sort((a, b) => a - b);
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / nums.length;
    const median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)];
    const freq = {};
    for (const n of nums) freq[n] = (freq[n] || 0) + 1;
    const maxFreq = Math.max(...Object.values(freq));
    const mode = Object.entries(freq).filter(([, c]) => c === maxFreq).map(([k]) => parseFloat(k));
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const range = max - min;
    setResult({ count: nums.length, sum, mean, median, mode, min, max, range, sorted: sorted.join(', ') });
    addEntry('Average Calculator');
  }, [input, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">Σ</span>
        <h1 className="font-heading text-2xl font-bold text-text">Average Calculator</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4 max-w-lg mx-auto">
          <div>
            <label className="text-xs text-text-tertiary mb-2 block">Numbers (comma or space separated)</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={3}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
          </div>
          <button onClick={calculate} className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Calculate</button>
          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
              {[
                { label: 'Count', value: result.count },
                { label: 'Sum', value: result.sum.toLocaleString() },
                { label: 'Mean (Average)', value: result.mean.toFixed(4) },
                { label: 'Median', value: result.median.toFixed(4) },
                { label: 'Mode', value: result.mode.length === result.count ? 'No mode' : result.mode.join(', ') },
                { label: 'Min', value: result.min },
                { label: 'Max', value: result.max },
                { label: 'Range', value: result.range },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                  <span className="text-text-tertiary">{r.label}</span>
                  <span className="font-mono font-semibold text-text">{r.value}</span>
                </div>
              ))}
              <details className="text-xs text-text-tertiary mt-2">
                <summary className="cursor-pointer hover:text-text">Sorted</summary>
                <div className="mt-1 font-mono text-text-secondary">{result.sorted}</div>
              </details>
            </motion.div>
          )}
        </div>
      </GlassCard>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
