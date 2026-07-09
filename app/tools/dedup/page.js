'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function DedupPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [sortMode, setSortMode] = useState('none');
  const [caseSensitive, setCaseSensitive] = useState(false);

  const output = useMemo(() => {
    let lines = input.split('\n');
    if (trimLines) lines = lines.map((l) => l.trim());
    if (removeEmpty) lines = lines.filter((l) => l);
    if (sortMode === 'alpha') lines.sort(caseSensitive ? undefined : (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    if (sortMode === 'alpha-rev') lines.sort(caseSensitive ? (a, b) => b.localeCompare(a) : (a, b) => b.toLowerCase().localeCompare(a.toLowerCase()));
    if (sortMode === 'length') lines.sort((a, b) => a.length - b.length);
    if (sortMode === 'length-rev') lines.sort((a, b) => b.length - a.length);
    const seen = new Set();
    lines = lines.filter((l) => {
      const key = caseSensitive ? l : l.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return lines.join('\n');
  }, [input, removeEmpty, trimLines, sortMode, caseSensitive]);

  const origLines = input.split('\n').length;
  const outLines = output ? output.split('\n').length : 0;
  const saved = origLines - outLines;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-text">≡</span>
        <h1 className="font-heading text-2xl font-bold text-text">Duplicate Line Remover</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <label className="text-xs text-text-tertiary">Input</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} placeholder="Paste text with duplicate lines..."
              className="w-full bg-surface rounded-lg px-3 py-2 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <div className="p-4 space-y-3">
              <span className="text-xs text-text-tertiary">Options</span>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={removeEmpty} onChange={() => setRemoveEmpty(!removeEmpty)}
                  className="w-4 h-4 rounded border-border bg-surface accent-primary" />
                <span className="text-xs text-text">Remove empty lines</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={trimLines} onChange={() => setTrimLines(!trimLines)}
                  className="w-4 h-4 rounded border-border bg-surface accent-primary" />
                <span className="text-xs text-text">Trim whitespace</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={caseSensitive} onChange={() => setCaseSensitive(!caseSensitive)}
                  className="w-4 h-4 rounded border-border bg-surface accent-primary" />
                <span className="text-xs text-text">Case sensitive</span>
              </label>

              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Sort</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    ['none', 'None'],
                    ['alpha', 'A→Z'],
                    ['alpha-rev', 'Z→A'],
                    ['length', 'Short→Long'],
                    ['length-rev', 'Long→Short'],
                  ].map(([val, label]) => (
                    <button key={val} onClick={() => setSortMode(val)}
                      className={`text-[10px] px-2 py-1 rounded-lg transition-all cursor-pointer ${sortMode === val ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:text-text'}`}>{label}</button>
                  ))}
                </div>
              </div>

              {input && (
                <div className="text-[10px] text-text-secondary font-mono">
                  {origLines} lines → {outLines} lines ({saved > 0 ? `-${saved}` : '0'})
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">Output</span>
                <CopyButton text={output} />
              </div>
              <pre className="bg-surface rounded-lg p-3 text-xs font-mono text-text border border-border whitespace-pre-wrap break-all max-h-48 overflow-y-auto">{output || <span className="text-text-tertiary">Result</span>}</pre>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
