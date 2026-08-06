'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function diffLines(a, b, ignoreWs) {
  const norm = (s) => ignoreWs ? s.trim() : s;
  const linesA = a.split('\n');
  const linesB = b.split('\n');
  const maxLen = Math.max(linesA.length, linesB.length);
  const result = [];
  for (let i = 0; i < maxLen; i++) {
    const la = linesA[i] ?? '';
    const lb = linesB[i] ?? '';
    if (norm(la) === norm(lb)) {
      result.push({ type: 'same', a: la, b: lb });
    } else {
      result.push({ type: 'diff', a: la, b: lb });
    }
  }
  return result;
}

export default function DiffPage() {
  const { addEntry } = useHistory();
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [ignoreWs, setIgnoreWs] = useState(false);

  const diffs = useMemo(() => {
    if (!left && !right) return null;
    addEntry('Diff Checker');
    return diffLines(left, right, ignoreWs);
  }, [left, right, ignoreWs, addEntry]);

  const diffCount = diffs ? diffs.filter((d) => d.type === 'diff').length : 0;
  const diffText = diffs ? diffs.map(d => `${d.type === 'diff' ? '-' : ' '} ${d.a} | ${d.b}`).join('\n') : '';

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text mb-2">Diff Checker</h1>
        <p className="text-text-secondary">Compare two texts side by side</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="bg-surface rounded-2xl border border-border p-4">
          <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2 block">Original</label>
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder="Paste original text..."
            className="w-full h-52 bg-transparent text-text resize-none outline-none text-sm leading-relaxed placeholder:text-text-tertiary"
          />
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4">
          <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2 block">Modified</label>
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder="Paste modified text..."
            className="w-full h-52 bg-transparent text-text resize-none outline-none text-sm leading-relaxed placeholder:text-text-tertiary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
          <input type="checkbox" checked={ignoreWs} onChange={(e) => setIgnoreWs(e.target.checked)} className="accent-primary rounded" />
          Ignore whitespace
        </label>
        <span className="text-xs text-text-tertiary">
          {diffs ? `${diffs.length} lines · ${diffCount} changed` : '0 lines'}
        </span>
        {diffs && <CopyButton text={diffText} className="text-xs" />}
      </div>

      {diffs && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="grid grid-cols-2 border-b border-border">
            <div className="p-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide border-r border-border">Original</div>
            <div className="p-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide">Modified</div>
          </div>
          <div className="grid grid-cols-2 text-sm font-mono">
            <div className="border-r border-border">
              {diffs.map((d, i) => (
                <div key={i} className={`px-3 py-1.5 leading-relaxed ${d.type === 'diff' ? 'bg-cat-text/10 text-cat-text' : 'text-text'}`}>
                  {d.a || <span className="opacity-0">.</span>}
                </div>
              ))}
            </div>
            <div>
              {diffs.map((d, i) => (
                <div key={i} className={`px-3 py-1.5 leading-relaxed ${d.type === 'diff' ? 'bg-cat-code/10 text-cat-code' : 'text-text'}`}>
                  {d.b || <span className="opacity-0">.</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 text-xs text-text-tertiary border-t border-border">
            {diffCount} differing lines
          </div>
        </motion.div>
      )}
    </div>
  );
}
