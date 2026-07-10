'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function permute(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = permute([...arr.slice(0, i), ...arr.slice(i + 1)]);
    for (const p of rest) result.push([arr[i], ...p]);
  }
  return result;
}

export default function PermutationPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);

  const handleGenerate = useCallback(() => {
    if (!input.trim()) return;
    addEntry('Permutation Generator');
    const items = input.split(',').map(s => s.trim()).filter(Boolean);
    if (items.length > 7) { setResults([{ error: true, msg: 'Maximum 7 items allowed' }]); setTotal(0); return; }
    const perms = permute(items);
    setResults(perms.map((p, i) => ({ id: i + 1, value: p.join(', ') })));
    setTotal(perms.length);
  }, [input, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">P</span>
        <h1 className="font-heading text-2xl font-bold text-text">Permutation Generator</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <label>
            <span className="text-xs text-text-tertiary block mb-1">Items (comma-separated, max 7)</span>
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder="A, B, C"
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none" />
          </label>
          <div className="flex items-center gap-3">
            <button onClick={handleGenerate} disabled={!input.trim()}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 transition-all cursor-pointer">
              Generate
            </button>
            {total > 0 && (
              <span className="text-xs text-text-tertiary">{total} permutation{total > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </GlassCard>

      {results.length > 0 && !results[0]?.error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">All Permutations</span>
                <CopyButton text={results.map(r => r.value).join('\n')} />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {results.map(r => (
                  <div key={r.id} className="flex items-center gap-3 px-3 py-1.5 bg-surface rounded-lg border border-border/50 text-sm">
                    <span className="text-xs text-text-tertiary w-6 shrink-0">#{r.id}</span>
                    <span className="font-mono text-text">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {results.length === 1 && results[0]?.error && (
        <GlassCard className="mt-5">
          <div className="p-3 text-sm text-cat-text">{results[0].msg}</div>
        </GlassCard>
      )}
    </motion.div>
  );
}
