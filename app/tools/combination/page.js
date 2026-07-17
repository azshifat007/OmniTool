'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function fact(n) {
  if (n < 0) return null;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function nCr(n, r) {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  r = Math.min(r, n - r);
  let result = 1;
  for (let i = 1; i <= r; i++) {
    result *= (n - r + i) / i;
  }
  return Math.round(result);
}

function nPr(n, r) {
  if (r < 0 || r > n) return 0;
  let result = 1;
  for (let i = 0; i < r; i++) result *= (n - i);
  return result;
}

export default function CombinationPage() {
  const { addEntry } = useHistory();
  const [n, setN] = useState('5');
  const [r, setR] = useState('3');
  const [num, setNum] = useState('7');

  const nVal = parseInt(n);
  const rVal = parseInt(r);
  const numVal = parseInt(num);

  const combination = !isNaN(nVal) && !isNaN(rVal) ? nCr(nVal, rVal) : '—';
  const permutation = !isNaN(nVal) && !isNaN(rVal) ? nPr(nVal, rVal) : '—';
  const factorial = !isNaN(numVal) ? fact(numVal) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">C</span>
        <h1 className="font-heading text-2xl font-bold text-text">Combination Calculator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <span className="text-xs text-text-tertiary block">Combinations (nCr)</span>
            <p className="text-[10px] text-text-secondary">Number of ways to choose r items from n items (order doesn't matter).</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-text-tertiary">n</label>
                <input type="number" min={0} value={n} onChange={(e) => { setN(e.target.value); addEntry('Combination Calculator'); }}
                  className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] text-text-tertiary">r</label>
                <input type="number" min={0} value={r} onChange={(e) => { setR(e.target.value); addEntry('Combination Calculator'); }}
                  className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
            <div className="text-center py-2">
              <div className="text-2xl font-bold font-heading text-text">{combination.toLocaleString()}</div>
              <div className="text-[10px] text-text-tertiary">C({nVal}, {rVal}) = n! / (r!(n-r)!)</div>
            </div>
            <CopyButton text={String(combination)} className="text-[10px]" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4 space-y-3">
            <span className="text-xs text-text-tertiary block">Permutations (nPr)</span>
            <p className="text-[10px] text-text-secondary">Number of ways to arrange r items from n items (order matters).</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-text-tertiary">n</label>
                <input type="number" min={0} value={n} onChange={(e) => setN(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] text-text-tertiary">r</label>
                <input type="number" min={0} value={r} onChange={(e) => setR(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
            <div className="text-center py-2">
              <div className="text-2xl font-bold font-heading text-text">{permutation.toLocaleString()}</div>
              <div className="text-[10px] text-text-tertiary">P({nVal}, {rVal}) = n! / (n-r)!</div>
            </div>
            <CopyButton text={String(permutation)} className="text-[10px]" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4 space-y-3">
            <span className="text-xs text-text-tertiary block">Factorial (n!)</span>
            <p className="text-[10px] text-text-secondary">Product of all positive integers ≤ n.</p>
            <div>
              <label className="text-[10px] text-text-tertiary">n</label>
              <input type="number" min={0} max={170} value={num} onChange={(e) => setNum(e.target.value)}
                className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div className="text-center py-2">
              <div className="text-2xl font-bold font-heading text-text">{factorial === Infinity ? '∞' : factorial !== null ? factorial.toLocaleString() : '—'}</div>
              <div className="text-[10px] text-text-tertiary">{numVal}!</div>
            </div>
            {factorial !== null && factorial !== Infinity && <CopyButton text={String(factorial)} className="text-[10px]" />}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
