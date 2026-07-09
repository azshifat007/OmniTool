'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const sortModes = [
  { id: 'asc', label: 'A → Z' },
  { id: 'desc', label: 'Z → A' },
  { id: 'len-asc', label: 'Short → Long' },
  { id: 'len-desc', label: 'Long → Short' },
  { id: 'randomize', label: 'Randomize' },
  { id: 'reverse', label: 'Reverse' },
];

function sortLines(lines, mode) {
  const arr = [...lines];
  switch (mode) {
    case 'asc': return arr.sort((a, b) => a.localeCompare(b));
    case 'desc': return arr.sort((a, b) => b.localeCompare(a));
    case 'len-asc': return arr.sort((a, b) => a.length - b.length || a.localeCompare(b));
    case 'len-desc': return arr.sort((a, b) => b.length - a.length || a.localeCompare(b));
    case 'randomize': {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
    case 'reverse': return arr.reverse();
    default: return arr;
  }
}

export default function SorterPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('asc');
  const [removeDups, setRemoveDups] = useState(false);
  const [output, setOutput] = useState('');

  const handleSort = useCallback(() => {
    let lines = input.split('\n');
    if (removeDups) lines = [...new Set(lines)];
    const sorted = sortLines(lines, mode);
    setOutput(sorted.join('\n'));
    addEntry('Text Sorter');
  }, [input, mode, removeDups, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">↕</span>
        <h1 className="font-heading text-2xl font-bold text-text">Text Sorter</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div>
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Paste lines to sort (one per line)..."
              className="w-full h-36 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-text-tertiary" />
          </div>
          <div className="flex flex-wrap gap-2">
            {sortModes.map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  mode === m.id ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                }`}>
                {m.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
            <input type="checkbox" checked={removeDups} onChange={(e) => setRemoveDups(e.target.checked)}
              className="accent-primary rounded" />
            Remove duplicates
          </label>
          <button onClick={handleSort} disabled={!input.trim()}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
            Sort
          </button>
        </div>
      </GlassCard>

      {output && (
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Sorted Output ({output.split('\n').length} lines)</span>
              <CopyButton text={output} />
            </div>
            <textarea value={output} readOnly
              className="w-full h-36 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none" />
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
