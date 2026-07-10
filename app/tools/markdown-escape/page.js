'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const ESCAPE_MAP = {
  '\\': '\\\\', '`': '\\`', '*': '\\*', '_': '\\_', '{': '\\{', '}': '\\}',
  '[': '\\[', ']': '\\]', '(': '\\(', ')': '\\)', '#': '\\#', '+': '\\+',
  '-': '\\-', '.': '\\.', '!': '\\!', '|': '\\|', '<': '\\<', '>': '\\>',
  '~': '\\~',
};

const UNESCAPE_MAP = Object.fromEntries(
  Object.entries(ESCAPE_MAP).map(([k, v]) => [v.slice(1), k])
);
Object.assign(UNESCAPE_MAP, { '\\': '\\' });

export default function MarkdownEscapePage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('escape');

  const output = useMemo(() => {
    if (!input) return '';
    addEntry('Markdown Escape');
    if (mode === 'escape') {
      return input.split('').map(ch => ESCAPE_MAP[ch] || ch).join('');
    }
    return input.replace(/\\([\\`*_{}[\]()#+\-.!|<>~])/g, (_, m) => UNESCAPE_MAP[m] || m);
  }, [input, mode, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-text">M\</span>
        <h1 className="font-heading text-2xl font-bold text-text">Markdown Escape</h1>
      </div>

      <div className="mb-4">
        <GlassCard>
          <div className="p-3 flex items-center gap-3">
            {['escape', 'unescape'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  mode === m ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                }`}>
                {m === 'escape' ? 'Escape' : 'Unescape'}
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">Input</label>
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={10}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder={mode === 'escape' ? 'Enter text with **bold**, _italic_, ## headers etc...' : 'Enter escaped Markdown...'} />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">{mode === 'escape' ? 'Escaped Output' : 'Unescaped Output'}</span>
              {output && <CopyButton text={output} />}
            </div>
            <textarea value={output} readOnly rows={10}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none"
              placeholder="Output will appear here..." />
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
