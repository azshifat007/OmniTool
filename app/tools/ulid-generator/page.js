'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function encodeTime(now, len) {
  let str = '';
  for (let i = len - 1; i >= 0; i--) {
    const mod = now % 32;
    str = ENCODING[mod] + str;
    now = (now - mod) / 32;
  }
  return str;
}

function encodeRandom(len) {
  let str = '';
  const arr = new Uint8Array(len);
  (typeof crypto !== 'undefined' && crypto.getRandomValues)
    ? crypto.getRandomValues(arr)
    : arr.forEach((_, i) => (arr[i] = Math.floor(Math.random() * 256)));
  for (let i = 0; i < len; i++) str += ENCODING[arr[i] % 32];
  return str;
}

function ulid() {
  const now = Date.now();
  return encodeTime(now, 10) + encodeRandom(16);
}

export default function UlidGeneratorPage() {
  const { addEntry } = useHistory();
  const [count, setCount] = useState(5);
  const [list, setList] = useState(() => Array.from({ length: 5 }, ulid));

  const regenerate = useCallback(() => {
    addEntry('ULID Generator');
    setList(Array.from({ length: count }, ulid));
  }, [count, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">⦿</span>
        <h1 className="font-heading text-2xl font-bold text-text">ULID Generator</h1>
      </div>

      <GlassCard>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Generate sortable, lexicographically orderable unique IDs (26 chars, Crockford base32).</p>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs text-text-tertiary block mb-2">Count</label>
              <input type="number" min={1} max={100} value={count}
                onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" />
            </div>
            <button onClick={regenerate}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
              Generate
            </button>
            <CopyButton text={list.join('\n')} className="text-xs" />
          </div>

          <div className="bg-surface rounded-xl border border-border/50 divide-y divide-border/50 max-h-80 overflow-y-auto">
            {list.map((id, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-mono text-text truncate">{id}</span>
                <CopyButton text={id} className="text-xs ml-2 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
